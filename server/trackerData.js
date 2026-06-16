import fs from "node:fs/promises";
import path from "node:path";

const DATA_DIR = path.resolve(process.cwd(), "src/data");
const TRACKER_OVERRIDES_FILE = path.join(DATA_DIR, "trackerOverrides.json");
const OUTREACH_MARKDOWN_PATH = path.resolve(process.cwd(), "outreach_contacts.md");
const SOURCE_COMPANY_FILES = [
  "sourceCompanies.json",
  "userSharedCompaniesJune2026.json",
  "userSharedCompaniesJune2026Batch2.json",
  "userSharedCompaniesJune2026Batch3.json",
  "userSharedCompaniesJune2026Batch4.json",
  "userSharedCompaniesJune2026Batch5.json",
  "may2026PriorityCompanies.json",
  "noidaNcrBatchCompanies.json",
  "hrEmailBatchCompanies.json",
];
const VERIFIED_OUTREACH_FILES = ["may2026VerifiedBatchCompanies.json"];

const companyAliases = {
  "suffescom solutions suffes com": ["Suffescom Solutions"],
  "thinknext technologies thinknext training": ["ThinkNEXT Technologies"],
  "quark software": ["Quark Software / QuarkCity"],
  "bebo technologies": ["bebo Technologies"],
  kit: ["KIT / KIT Labs"],
  "kammuno technologies pvt ltd": ["Kommuno Technologies Pvt Ltd"],
  "luminoguru private limited": ["LuminoGuru"],
  "zapbuild technologies": ["Zapbuild"],
};

const normalizeKey = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "")
    .trim();

const normalizeTrackerId = (value) => {
  const parsed = Number.parseInt(String(value || "").trim(), 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const cleanMarkdown = (value) =>
  String(value || "")
    .replace(/`/g, "")
    .replace(/\s+/g, " ")
    .trim();

const extractEmails = (value) => {
  const matches = cleanMarkdown(value).match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi);
  return [...new Set(matches || [])];
};

const extractUrls = (value) => {
  const matches = cleanMarkdown(value).match(/https?:\/\/[^\s)]+/gi);
  return [...new Set(matches || [])].map((url) => url.replace(/[.,]+$/, ""));
};

const extractAppliedDate = (value) => {
  const match = cleanMarkdown(value).match(/\bApplied:\s*(\d{4}-\d{2}-\d{2})\b/i);
  return match?.[1] || "";
};

const normalizeStringArray = (value) =>
  [...new Set((Array.isArray(value) ? value : []).map(cleanMarkdown).filter(Boolean))];

const splitMarkdownRow = (line) =>
  line
    .split("|")
    .slice(1, -1)
    .map((cell) => cell.trim());

const mergeStatus = (baseStatus, savedStatus) => {
  const statusPriority = {
    "Not Applied": 0,
    Pending: 1,
    Limited: 2,
    "Portal Only": 2,
    Sent: 3,
    "Follow Up": 4,
    Replied: 5,
    Interview: 6,
    Declined: 6,
  };

  const base = String(baseStatus || "").trim();
  const saved = String(savedStatus || "").trim();

  if (!base) return saved;
  if (!saved) return base;

  const baseRank = statusPriority[base] ?? 0;
  const savedRank = statusPriority[saved] ?? 0;
  return savedRank >= baseRank ? saved : base;
};

const mergeNotes = (baseNotes, savedNotes) => {
  const values = [String(baseNotes || "").trim(), String(savedNotes || "").trim()].filter(Boolean);
  return [...new Set(values)].join(" ");
};

const today = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const buildEmailSendNote = ({ recipientEmail, sentDate, resumeFileName, message }) =>
  `SMTP sent on ${sentDate}; email used: ${recipientEmail}; resume filename: ${resumeFileName}; result: ${message}`;

const buildEmailFailureNote = ({ recipientEmail, attemptedDate, message }) =>
  `SMTP send failed on ${attemptedDate}; email used: ${recipientEmail}; result: ${message}`;

const mergeCompanyRecord = (current, incoming) => {
  if (!current) {
    return {
      ...incoming,
      emails: [...new Set((incoming.emails || []).filter(Boolean))],
      notes: String(incoming.notes || "").trim(),
    };
  }

  return {
    ...current,
    ...incoming,
    companyName: current.companyName || incoming.companyName || "",
    roleTarget: current.roleTarget || incoming.roleTarget || "",
    location: current.location || incoming.location || "",
    website: current.website || incoming.website || "",
    linkedin: current.linkedin || incoming.linkedin || "",
    basicInfo: current.basicInfo || incoming.basicInfo || "",
    appliedDate: incoming.appliedDate || current.appliedDate || "",
    status: mergeStatus(current.status, incoming.status),
    emails: [...new Set([...(current.emails || []), ...(incoming.emails || [])].filter(Boolean))],
    notes: mergeNotes(current.notes, incoming.notes),
  };
};

const dedupeCompanyRecords = (records) => {
  const map = new Map();

  records.forEach((record) => {
    const key = normalizeKey(record.companyName);
    if (!key) return;

    map.set(key, mergeCompanyRecord(map.get(key), record));
  });

  return Array.from(map.values());
};

const parseOutreachJson = (entries) => {
  const map = new Map();

  entries.forEach((entry) => {
    if (!entry?.companyName) return;

    const website = cleanMarkdown(entry.website);
    const linkedin = cleanMarkdown(entry.linkedin);
    const urls = [...new Set([website, linkedin].filter(Boolean))];
    const meta = {
      companyName: cleanMarkdown(entry.companyName),
      roleTarget: cleanMarkdown(entry.roleTarget),
      emails: normalizeStringArray(entry.emails),
      status: resolveInitialStatus(entry.status),
      urls,
      website,
      linkedin,
      appliedDate: cleanMarkdown(entry.appliedDate),
      notes: cleanMarkdown(entry.notes),
      location: cleanMarkdown(entry.location),
    };

    const key = normalizeKey(entry.companyName);
    map.set(key, mergeCompanyRecord(map.get(key), meta));
  });

  return map;
};

const parseOutreachMarkdown = (markdown) => {
  const map = new Map();

  markdown.split("\n").forEach((line) => {
    if (!line.startsWith("| ") || line.includes("| --- |")) return;

    const [company, role, contacts, status, notes] = splitMarkdownRow(line);
    if (!company || company === "Company") return;

    const urls = extractUrls(notes);
    const meta = {
      companyName: cleanMarkdown(company),
      roleTarget: cleanMarkdown(role),
      emails: extractEmails(contacts),
      status: resolveInitialStatus(status),
      urls,
      website: urls.find((url) => !url.includes("linkedin.com")) || "",
      linkedin: urls.find((url) => url.includes("linkedin.com")) || "",
      appliedDate: extractAppliedDate(notes),
      notes: cleanMarkdown(notes),
    };

    const key = normalizeKey(company);
    map.set(key, mergeCompanyRecord(map.get(key), meta));
  });

  return map;
};

const mergeMetaMaps = (...maps) => {
  const combined = new Map();

  maps.forEach((map) => {
    map.forEach((value, key) => {
      combined.set(key, mergeCompanyRecord(combined.get(key), value));
    });
  });

  return combined;
};

const buildBasicInfo = (company) => {
  const details = [];

  details.push(`Target role: ${company.roleTarget || "Unknown"}.`);
  details.push(`Preferred location: ${company.location || "Unknown"}.`);

  return details.join(" ");
};

const resolveInitialStatus = (rawStatus) => {
  const normalized = cleanMarkdown(rawStatus).toLowerCase();

  if (normalized.includes("replied")) return "Replied";
  if (normalized.includes("declined")) return "Declined";
  if (normalized.includes("interview")) return "Interview";
  if (normalized.includes("follow up") || normalized.includes("follow-up")) return "Follow Up";
  if (normalized.includes("not applied")) return "Not Applied";
  if (normalized.includes("portal")) return "Portal Only";
  if (normalized.includes("limited")) return "Limited";
  if (normalized.includes("sent")) return "Sent";
  return "Pending";
};

const loadJsonRecords = async (fileName) => {
  const filePath = path.join(DATA_DIR, fileName);
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw);
};

const loadTrackerOverrides = async () => {
  try {
    const raw = await fs.readFile(TRACKER_OVERRIDES_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    if (error?.code === "ENOENT") {
      return [];
    }

    throw error;
  }
};

const loadTrackerData = async () => {
  const sourceCompanyRecords = dedupeCompanyRecords(
    await Promise.all(
      SOURCE_COMPANY_FILES.map(async (fileName) => {
        const records = await loadJsonRecords(fileName);
        return Array.isArray(records) ? records : [];
      }),
    ).then((chunks) => chunks.flat()),
  );

  const verifiedOutreachRecords = await Promise.all(
    VERIFIED_OUTREACH_FILES.map(async (fileName) => {
      const records = await loadJsonRecords(fileName);
      return Array.isArray(records) ? records : [];
    }),
  );

  const outreachMarkdown = await fs.readFile(OUTREACH_MARKDOWN_PATH, "utf8");
  const trackerOverrides = await loadTrackerOverrides();

  const outreachByCompany = mergeMetaMaps(
    parseOutreachMarkdown(outreachMarkdown),
    ...verifiedOutreachRecords.map((records) => parseOutreachJson(records)),
    parseOutreachJson(trackerOverrides),
  );

  const companies = sourceCompanyRecords.map((company, index) => {
    const meta = outreachByCompany.get(normalizeKey(company.companyName));
    const roleTarget = company.roleTarget || meta?.roleTarget || "";
    const location = company.location || meta?.location || "";

    return {
      id: index + 1,
      companyNumber: index + 1,
      companyName: company.companyName,
      roleTarget,
      location,
      companySize: company.companySize || "Unknown",
      website: meta?.website || company.website || "",
      linkedin: meta?.linkedin || company.linkedin || "",
      basicInfo: buildBasicInfo({ roleTarget, location }),
      appliedDate: meta?.appliedDate || company.appliedDate || "",
      status: meta?.status || resolveInitialStatus(company.status || ""),
      emails: meta?.emails || company.emails || [],
      responses: [],
      notes: meta?.notes || company.notes || "",
    };
  });

  const companyNames = new Set(companies.map((c) => normalizeKey(c.companyName)));
  let nextId = companies.length + 1;

  for (const [key, meta] of outreachByCompany) {
    if (companyNames.has(key)) continue;
    const roleTarget = meta.roleTarget || "";
    const location = meta.location || "";
    companies.push({
      id: nextId,
      companyNumber: nextId,
      companyName: meta.companyName,
      roleTarget,
      location,
      companySize: "Unknown",
      website: meta.website || "",
      linkedin: meta.linkedin || "",
      basicInfo: buildBasicInfo({ roleTarget, location }),
      appliedDate: meta.appliedDate || "",
      status: meta.status || "Pending",
      emails: meta.emails || [],
      responses: [],
      notes: meta.notes || "",
    });
    nextId++;
  }

  const byId = new Map(companies.map((company) => [company.id, company]));
  const byName = new Map(companies.map((company) => [normalizeKey(company.companyName), company]));

  return {
    companies,
    byId,
    byName,
  };
};

let trackerDataPromise;
let trackerOverridesWriteChain = Promise.resolve();

export const getTrackerData = async () => {
  if (!trackerDataPromise) {
    trackerDataPromise = loadTrackerData();
  }

  return trackerDataPromise;
};

export const findTrackerCompany = async ({ companyId, companyName } = {}) => {
  const normalizedId = normalizeTrackerId(companyId);
  const normalizedName = normalizeKey(companyName);
  const { byId, byName } = await getTrackerData();

  if (normalizedId) {
    const byIdMatch = byId.get(normalizedId);
    if (!byIdMatch) return null;

    if (!normalizedName || normalizeKey(byIdMatch.companyName) === normalizedName) {
      return byIdMatch;
    }

    return null;
  }

  if (!normalizedName) return null;

  const direct = byName.get(normalizedName);
  if (direct) return direct;

  const aliases = companyAliases[normalizedName] || [];
  for (const alias of aliases) {
    const match = byName.get(normalizeKey(alias));
    if (match) return match;
  }

  return null;
};

const writeTrackerOverrides = async (overrides) => {
  await fs.writeFile(TRACKER_OVERRIDES_FILE, `${JSON.stringify(overrides, null, 2)}\n`, "utf8");
  trackerDataPromise = loadTrackerData();
  return trackerDataPromise;
};

const updateTrackerOverrides = async (updater) => {
  const runUpdate = async () => {
    const currentOverrides = await loadTrackerOverrides();
    const nextOverrides = await updater(currentOverrides);
    return writeTrackerOverrides(nextOverrides);
  };

  trackerOverridesWriteChain = trackerOverridesWriteChain.then(runUpdate, runUpdate);

  return trackerOverridesWriteChain;
};

export const recordApplicationEmailSent = async ({
  companyId,
  companyName,
  recipientEmail,
  resumeFileName,
  message,
  sentDate = today(),
}) => {
  const trackerCompany = await findTrackerCompany({ companyId, companyName });
  if (!trackerCompany) {
    throw new Error("Company not found in tracker data.");
  }

  const trackingNote = buildEmailSendNote({
    recipientEmail,
    sentDate,
    resumeFileName,
    message,
  });

  const { companies } = await updateTrackerOverrides(async (currentOverrides) => {
    const overrideIndex = currentOverrides.findIndex((entry) => {
      const sameId = normalizeTrackerId(entry?.id) === trackerCompany.id;
      const sameName = normalizeKey(entry?.companyName) === normalizeKey(trackerCompany.companyName);
      return sameId || sameName;
    });

    const existingOverride =
      overrideIndex >= 0
        ? currentOverrides[overrideIndex]
        : {
            id: trackerCompany.id,
            companyNumber: trackerCompany.companyNumber,
            companyName: trackerCompany.companyName,
            roleTarget: trackerCompany.roleTarget,
            location: trackerCompany.location,
            companySize: trackerCompany.companySize,
            website: trackerCompany.website,
            linkedin: trackerCompany.linkedin,
            basicInfo: trackerCompany.basicInfo,
            appliedDate: trackerCompany.appliedDate,
            status: trackerCompany.status,
            emails: trackerCompany.emails,
            notes: trackerCompany.notes,
          };

    const mergedOverride = {
      ...existingOverride,
      id: trackerCompany.id,
      companyNumber: trackerCompany.companyNumber,
      companyName: trackerCompany.companyName,
      roleTarget: trackerCompany.roleTarget,
      location: trackerCompany.location,
      companySize: trackerCompany.companySize,
      website: trackerCompany.website,
      linkedin: trackerCompany.linkedin,
      basicInfo: trackerCompany.basicInfo,
      appliedDate: sentDate,
      status: "Sent",
      emails: [...new Set([...(trackerCompany.emails || []), ...(existingOverride.emails || [])].filter(Boolean))],
      notes: mergeNotes(mergeNotes(trackerCompany.notes, existingOverride.notes), trackingNote),
    };

    const nextOverrides = [...currentOverrides];
    if (overrideIndex >= 0) {
      nextOverrides[overrideIndex] = mergedOverride;
    } else {
      nextOverrides.push(mergedOverride);
    }

    return nextOverrides;
  });

  return companies.find((company) => company.id === trackerCompany.id) || null;
};

export const recordApplicationEmailFailure = async ({
  companyId,
  companyName,
  recipientEmail,
  message,
  attemptedDate = today(),
}) => {
  const trackerCompany = await findTrackerCompany({ companyId, companyName });
  if (!trackerCompany) {
    return null;
  }

  const failureNote = buildEmailFailureNote({
    recipientEmail,
    attemptedDate,
    message,
  });

  const { companies } = await updateTrackerOverrides(async (currentOverrides) => {
    const overrideIndex = currentOverrides.findIndex((entry) => {
      const sameId = normalizeTrackerId(entry?.id) === trackerCompany.id;
      const sameName = normalizeKey(entry?.companyName) === normalizeKey(trackerCompany.companyName);
      return sameId || sameName;
    });

    const existingOverride =
      overrideIndex >= 0
        ? currentOverrides[overrideIndex]
        : {
            id: trackerCompany.id,
            companyNumber: trackerCompany.companyNumber,
            companyName: trackerCompany.companyName,
            roleTarget: trackerCompany.roleTarget,
            location: trackerCompany.location,
            companySize: trackerCompany.companySize,
            website: trackerCompany.website,
            linkedin: trackerCompany.linkedin,
            basicInfo: trackerCompany.basicInfo,
            appliedDate: trackerCompany.appliedDate,
            status: trackerCompany.status,
            emails: trackerCompany.emails,
            notes: trackerCompany.notes,
          };

    const mergedOverride = {
      ...existingOverride,
      id: trackerCompany.id,
      companyNumber: trackerCompany.companyNumber,
      companyName: trackerCompany.companyName,
      roleTarget: trackerCompany.roleTarget,
      location: trackerCompany.location,
      companySize: trackerCompany.companySize,
      website: trackerCompany.website,
      linkedin: trackerCompany.linkedin,
      basicInfo: trackerCompany.basicInfo,
      appliedDate: existingOverride.appliedDate || trackerCompany.appliedDate,
      status: existingOverride.status || trackerCompany.status,
      emails: [...new Set([...(trackerCompany.emails || []), ...(existingOverride.emails || [])].filter(Boolean))],
      notes: mergeNotes(mergeNotes(trackerCompany.notes, existingOverride.notes), failureNote),
    };

    const nextOverrides = [...currentOverrides];
    if (overrideIndex >= 0) {
      nextOverrides[overrideIndex] = mergedOverride;
    } else {
      nextOverrides.push(mergedOverride);
    }

    return nextOverrides;
  });

  return companies.find((company) => company.id === trackerCompany.id) || null;
};
