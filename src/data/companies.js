import outreachMarkdown from "../../outreach_contacts.md?raw";
import sourceCompanies from "./sourceCompanies.json";
import hrEmailBatchCompanies from "./hrEmailBatchCompanies.json";
import may2026PriorityCompanies from "./may2026PriorityCompanies.json";
import may2026VerifiedBatchCompanies from "./may2026VerifiedBatchCompanies.json";
import noidaNcrBatchCompanies from "./noidaNcrBatchCompanies.json";
import trackerOverrides from "./trackerOverrides.json";
import userSharedCompaniesJune2026 from "./userSharedCompaniesJune2026.json";
import userSharedCompaniesJune2026Batch2 from "./userSharedCompaniesJune2026Batch2.json";
import userSharedCompaniesJune2026Batch3 from "./userSharedCompaniesJune2026Batch3.json";
import userSharedCompaniesJune2026Batch4 from "./userSharedCompaniesJune2026Batch4.json";
import userSharedCompaniesJune2026Batch5 from "./userSharedCompaniesJune2026Batch5.json";

export const STATUSES = [
  "Pending",
  "Sent",
  "Replied",
  "Declined",
  "Interview",
  "Follow Up",
  "Not Applied",
  "Portal Only",
  "Limited",
];

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

const normalizeCompanyName = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/\bpvt\.?\b/g, "private")
    .replace(/\bltd\.?\b/g, "limited")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const dedupeCompanyRecords = (records) => {
  const map = new Map();

  records.forEach((record) => {
    const key = normalizeCompanyName(record.companyName);
    if (!key) return;

    const current = map.get(key) || {};
    map.set(key, {
      ...current,
      ...record,
      companyName: current.companyName || record.companyName || "",
      location: current.location || record.location || "",
      roleTarget: current.roleTarget || record.roleTarget || "",
    });
  });

  return Array.from(map.values());
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

const mergeMeta = (current, incoming) => {
  if (!current) return incoming;

  const currentSent = current.rawStatus === "sent";
  const incomingSent = incoming.rawStatus === "sent";
  const emails = [...new Set([...current.emails, ...incoming.emails])];
  const urls = [...new Set([...current.urls, ...incoming.urls])];
  const notes = [...new Set([current.notes, incoming.notes].filter(Boolean))].join(" ");

  return {
    ...current,
    ...incoming,
    rawStatus: currentSent || incomingSent ? "sent" : incoming.rawStatus || current.rawStatus,
    appliedDate: incoming.appliedDate || current.appliedDate || "",
    emails,
    urls,
    notes,
  };
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
      rawStatus: cleanMarkdown(entry.status).toLowerCase(),
      urls,
      website,
      linkedin,
      appliedDate: cleanMarkdown(entry.appliedDate),
      notes: cleanMarkdown(entry.notes),
    };

    const key = normalizeCompanyName(entry.companyName);
    map.set(key, mergeMeta(map.get(key), meta));
  });

  return map;
};

const mergeMetaMaps = (...maps) => {
  const combined = new Map();

  maps.forEach((map) => {
    map.forEach((value, key) => {
      combined.set(key, mergeMeta(combined.get(key), value));
    });
  });

  return combined;
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
      rawStatus: cleanMarkdown(status).toLowerCase(),
      urls,
      website: urls.find((url) => !url.includes("linkedin.com")) || "",
      linkedin: urls.find((url) => url.includes("linkedin.com")) || "",
      appliedDate: extractAppliedDate(notes),
      notes: cleanMarkdown(notes),
    };

    const key = normalizeCompanyName(company);
    map.set(key, mergeMeta(map.get(key), meta));
  });

  return map;
};

const sourceCompanyRecords = dedupeCompanyRecords([
  ...sourceCompanies,
  ...userSharedCompaniesJune2026,
  ...userSharedCompaniesJune2026Batch2,
  ...userSharedCompaniesJune2026Batch3,
  ...userSharedCompaniesJune2026Batch4,
  ...userSharedCompaniesJune2026Batch5,
  ...may2026PriorityCompanies,
  ...noidaNcrBatchCompanies,
  ...hrEmailBatchCompanies,
]);

const outreachByCompany = mergeMetaMaps(
  parseOutreachMarkdown(outreachMarkdown),
  parseOutreachJson(may2026VerifiedBatchCompanies),
  parseOutreachJson(noidaNcrBatchCompanies),
  parseOutreachJson(hrEmailBatchCompanies),
  parseOutreachJson(trackerOverrides),
);

const getOutreachMeta = (companyName) => {
  const key = normalizeCompanyName(companyName);
  const direct = outreachByCompany.get(key);
  if (direct) return direct;

  const aliases = companyAliases[key] || [];
  for (const alias of aliases) {
    const match = outreachByCompany.get(normalizeCompanyName(alias));
    if (match) return match;
  }

  return null;
};

const buildBasicInfo = (company) => {
  const details = [];

  details.push(`Target role: ${company.roleTarget || "Unknown"}.`);
  details.push(`Preferred location: ${company.location || "Unknown"}.`);
  if (company.priorityTier) {
    details.push(`Priority tier: ${company.priorityTier}.`);
  }

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

export const companies = sourceCompanyRecords.map((company, index) => {
  const meta = getOutreachMeta(company.companyName);
  const roleTarget = company.roleTarget || meta?.roleTarget || "";
  const location = company.location || "";

  return {
    id: index + 1,
    companyNumber: index + 1,
    companyName: company.companyName,
    roleTarget,
    location,
    companySize: "Unknown",
    website: meta?.website || "",
    linkedin: meta?.linkedin || "",
    basicInfo: buildBasicInfo({ roleTarget, location }),
    appliedDate: meta?.appliedDate || "",
    status: resolveInitialStatus(meta?.rawStatus),
    emails: meta?.emails || [],
    responses: [],
    notes: meta?.notes || "",
  };
});

export const originalCompanies = companies;
