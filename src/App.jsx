import React, { useEffect, useMemo, useRef, useState } from "react";
import { companies as originalCompanies, STATUSES } from "./data/companies";
import { parseReplyImportSource } from "./replyImport";

const STORAGE_KEY = "adarsh-company-application-tracker-v1";
const RESPONSE_STATUSES = new Set(["Replied", "Interview", "Declined"]);
const ACTIVE_OUTREACH_STATUSES = new Set(["Sent", "Follow Up"]);
const PUBLIC_EMAIL_DOMAINS = new Set([
  "aol.com",
  "gmail.com",
  "googlemail.com",
  "hotmail.com",
  "icloud.com",
  "live.com",
  "outlook.com",
  "proton.me",
  "protonmail.com",
  "yahoo.com",
  "ymail.com",
]);

const statusStyles = {
  Pending: "border-amber-200 bg-amber-50 text-amber-800",
  Replied: "border-sky-200 bg-sky-50 text-sky-800",
  Declined: "border-rose-200 bg-rose-50 text-rose-800",
  Interview: "border-indigo-200 bg-indigo-50 text-indigo-800",
  Sent: "border-emerald-200 bg-emerald-50 text-emerald-800",
  "Follow Up": "border-orange-200 bg-orange-50 text-orange-800",
  "Not Applied": "border-slate-200 bg-slate-100 text-slate-700",
};

const responseToneStyles = {
  interview: "border-indigo-200 bg-indigo-50 text-indigo-700",
  declined: "border-rose-200 bg-rose-50 text-rose-700",
  positive: "border-emerald-200 bg-emerald-50 text-emerald-700",
  neutral: "border-slate-200 bg-slate-100 text-slate-700",
};

const emptyFilters = {
  query: "",
  status: "All",
  location: "All",
  response: "All",
};

const responseOptions = ["All", "Responded", "Awaiting reply"];

const today = () => new Date().toISOString().slice(0, 10);

const normalizeResponse = (response, index) => {
  if (typeof response === "string") {
    return {
      id: `response-${index + 1}`,
      from: "",
      subject: "",
      summary: response,
      date: "",
      sentiment: "neutral",
    };
  }

  return {
    id: response.id || response.gmailMessageId || `response-${index + 1}`,
    from: response.from || response.sender || "",
    subject: response.subject || "",
    summary: response.summary || response.snippet || response.body || "",
    date: response.date || response.receivedAt || "",
    sentiment: ["positive", "neutral", "declined", "interview"].includes(response.sentiment)
      ? response.sentiment
      : "neutral",
  };
};

const normalizeCompany = (company, index) => ({
  id: Number(company.id) || index + 1,
  companyNumber: Number(company.companyNumber) || index + 1,
  companyName: company.companyName || "",
  roleTarget: company.roleTarget || "",
  location: company.location || "",
  companySize: company.companySize || "Unknown",
  website: company.website || "",
  linkedin: company.linkedin || "",
  basicInfo: company.basicInfo || "",
  appliedDate: company.appliedDate || "",
  status: STATUSES.includes(company.status) ? company.status : "Pending",
  emails: Array.isArray(company.emails) ? [...new Set(company.emails.filter(Boolean))] : [],
  responses: Array.isArray(company.responses) ? company.responses.map(normalizeResponse) : [],
  notes: company.notes || "",
});

const mergeWithOriginalCompanies = (savedCompanies) => {
  if (!Array.isArray(savedCompanies) || savedCompanies.length === 0) {
    return originalCompanies;
  }

  const savedById = new Map(savedCompanies.map((company) => [Number(company.id), company]));
  const savedByName = new Map(
    savedCompanies.map((company) => [String(company.companyName || "").toLowerCase(), company]),
  );

  return originalCompanies.map((company, index) => {
    const saved = savedById.get(company.id) || savedByName.get(company.companyName.toLowerCase());
    return normalizeCompany(saved ? { ...company, ...saved } : company, index);
  });
};

const readStoredCompanies = () => {
  try {
    return mergeWithOriginalCompanies(JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"));
  } catch {
    return originalCompanies;
  }
};

const buildSearchText = (company) =>
  [
    company.companyNumber,
    company.companyName,
    company.roleTarget,
    company.location,
    company.companySize,
    company.website,
    company.linkedin,
    company.appliedDate,
    company.status,
    company.emails.join(" "),
    company.notes,
    company.responses
      .map((response) =>
        [response.from, response.subject, response.summary, response.date, response.sentiment].join(
          " ",
        ),
      )
      .join(" "),
  ]
    .join(" ")
    .toLowerCase();

const getDateValue = (value) => {
  if (!value) return 0;
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
};

const formatDate = (value) => {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsed);
};

const formatCompactDate = (value) => {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(parsed);
};

const getLatestResponse = (company) =>
  company.responses.reduce((latest, response) => {
    if (!latest) return response;
    return getDateValue(response.date) > getDateValue(latest.date) ? response : latest;
  }, null);

const hasResponse = (company) => company.responses.length > 0 || RESPONSE_STATUSES.has(company.status);

const getResponseCount = (company) => {
  if (company.responses.length > 0) return company.responses.length;
  return RESPONSE_STATUSES.has(company.status) ? 1 : 0;
};

const getResponseTone = (company, latestResponse) => {
  if (latestResponse?.sentiment === "interview" || company.status === "Interview") return "interview";
  if (latestResponse?.sentiment === "declined" || company.status === "Declined") return "declined";
  if (latestResponse?.sentiment === "positive" || company.status === "Replied") return "positive";
  return "neutral";
};

const getResponseSummary = (company, latestResponse) => {
  if (latestResponse?.summary) return latestResponse.summary;
  if (latestResponse?.subject) return latestResponse.subject;
  if (company.status === "Interview") return "Interview stage marked, but the email summary is not captured yet.";
  if (company.status === "Declined") return "Decline recorded, but the reply text is not captured yet.";
  if (company.status === "Replied") return "Reply recorded, but the response summary is still missing.";
  return "No response tracked yet.";
};

const getDaysSince = (value) => {
  const timestamp = getDateValue(value);
  if (!timestamp) return null;

  const diff = Date.now() - timestamp;
  return diff < 0 ? 0 : Math.floor(diff / (1000 * 60 * 60 * 24));
};

const normalizeKey = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "");

const normalizeEmail = (value) => String(value || "").trim().toLowerCase();
const extractDomain = (value) => normalizeEmail(value).split("@")[1] || "";

const inferStatusFromResponse = (response, currentStatus) => {
  if (STATUSES.includes(response.status)) return response.status;
  if (response.sentiment === "interview") return "Interview";
  if (response.sentiment === "declined") return "Declined";
  if (currentStatus === "Interview" || currentStatus === "Declined") return currentStatus;
  return "Replied";
};

const looksLikeCompanyRecord = (value) =>
  value &&
  typeof value === "object" &&
  ("companyNumber" in value || "roleTarget" in value || "location" in value || "status" in value);

const normalizeImportedResponse = (response, index) => {
  const normalized = normalizeResponse(response, index);

  return {
    ...normalized,
    companyName: response.companyName || response.company || response.match?.companyName || "",
    matchEmail: response.matchEmail || response.email || response.match?.email || normalized.from || "",
    status: response.status || "",
  };
};

const mergeResponsesIntoCompanies = (baseCompanies, importedResponses) => {
  const companies = baseCompanies.map((company) => ({
    ...company,
    emails: [...company.emails],
    responses: [...company.responses],
  }));

  const byName = new Map();
  const byEmail = new Map();
  const byDomain = new Map();
  const duplicateDomains = new Set();

  companies.forEach((company, index) => {
    byName.set(normalizeKey(company.companyName), index);
    company.emails.forEach((email) => {
      const normalizedEmail = normalizeEmail(email);
      byEmail.set(normalizedEmail, index);

      const domain = extractDomain(normalizedEmail);
      if (!domain || PUBLIC_EMAIL_DOMAINS.has(domain)) return;

      const owner = byDomain.get(domain);
      if (owner === undefined) {
        byDomain.set(domain, index);
      } else if (owner !== index) {
        duplicateDomains.add(domain);
      }
    });
  });

  duplicateDomains.forEach((domain) => {
    byDomain.delete(domain);
  });

  let matchedCompanies = 0;
  let addedResponses = 0;
  let unmatchedResponses = 0;
  const matchedCompanyIds = new Set();

  importedResponses.forEach((rawResponse, index) => {
    const response = normalizeImportedResponse(rawResponse, index);
    const companyIndex =
      byName.get(normalizeKey(response.companyName)) ??
      byEmail.get(normalizeEmail(response.matchEmail)) ??
      byEmail.get(normalizeEmail(response.from)) ??
      byDomain.get(extractDomain(response.matchEmail)) ??
      byDomain.get(extractDomain(response.from));

    if (companyIndex === undefined) {
      unmatchedResponses += 1;
      return;
    }

    const company = companies[companyIndex];
    const duplicate = company.responses.some((existing) => {
      if (response.id && existing.id === response.id) return true;
      return (
        normalizeEmail(existing.from) === normalizeEmail(response.from) &&
        existing.subject === response.subject &&
        existing.date === response.date &&
        existing.summary === response.summary
      );
    });

    if (!duplicate) {
      company.responses = [...company.responses, response];
      addedResponses += 1;
    }

    const nextStatus = inferStatusFromResponse(response, company.status);
    if (nextStatus && company.status !== nextStatus) {
      company.status = nextStatus;
    }

    if (!company.appliedDate && ACTIVE_OUTREACH_STATUSES.has(nextStatus)) {
      company.appliedDate = today();
    }

    if (!matchedCompanyIds.has(company.id)) {
      matchedCompanyIds.add(company.id);
      matchedCompanies += 1;
    }
  });

  return {
    companies,
    matchedCompanies,
    addedResponses,
    unmatchedResponses,
  };
};

const getNextStep = (company) => {
  const daysSinceApplied = getDaysSince(company.appliedDate);

  switch (company.status) {
    case "Pending":
      return "Verify the best contact and send the first outreach.";
    case "Sent":
      if (daysSinceApplied !== null && daysSinceApplied >= 5) {
        return "It has been quiet for a few days, so this is ready for a follow-up.";
      }
      return "Wait for a reply, then move to follow-up if the inbox stays quiet.";
    case "Follow Up":
      return "Send a concise follow-up and reference the original application.";
    case "Replied":
      return "Capture the reply details and respond while the thread is warm.";
    case "Interview":
      return "Prep examples, availability, and role-specific questions.";
    case "Declined":
      return "Archive the thread and move attention to active opportunities.";
    case "Not Applied":
      return "Re-check fit before investing time in outreach.";
    default:
      return "Review the current thread and update the next step.";
  }
};

const getPriorityWeight = (company) => {
  const daysSinceApplied = getDaysSince(company.appliedDate) || 0;

  if (company.status === "Interview") return 1000 + daysSinceApplied;
  if (company.status === "Replied") return 900 + daysSinceApplied;
  if (company.status === "Follow Up") return 800 + daysSinceApplied;
  if (company.status === "Sent") return 700 + Math.min(daysSinceApplied, 30);
  if (company.status === "Pending") return 500;
  if (company.status === "Not Applied") return 300;
  if (company.status === "Declined") return 100;
  return 0;
};

const compareCompanies = (left, right) => {
  const priorityDifference = getPriorityWeight(right) - getPriorityWeight(left);
  if (priorityDifference !== 0) return priorityDifference;

  const responseDifference =
    getDateValue(getLatestResponse(right)?.date) - getDateValue(getLatestResponse(left)?.date);
  if (responseDifference !== 0) return responseDifference;

  const appliedDifference = getDateValue(right.appliedDate) - getDateValue(left.appliedDate);
  if (appliedDifference !== 0) return appliedDifference;

  return left.companyNumber - right.companyNumber;
};

function App() {
  const fileInputRef = useRef(null);
  const replyFileInputRef = useRef(null);
  const [companies, setCompanies] = useState(readStoredCompanies);
  const companiesRef = useRef(companies);
  const [filters, setFilters] = useState(emptyFilters);
  const [notice, setNotice] = useState("");
  const [replyImportText, setReplyImportText] = useState("");
  const [replyImportModalOpen, setReplyImportModalOpen] = useState(false);
  const [replyImportState, setReplyImportState] = useState({
    phase: "idle",
    error: "",
  });

  useEffect(() => {
    companiesRef.current = companies;
  }, [companies]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(companies));
  }, [companies]);

  useEffect(() => {
    if (!notice) return undefined;

    const timeoutId = window.setTimeout(() => setNotice(""), 4200);
    return () => window.clearTimeout(timeoutId);
  }, [notice]);

  const locations = useMemo(() => {
    return [...new Set(companies.map((company) => company.location).filter(Boolean))].sort((a, b) =>
      a.localeCompare(b),
    );
  }, [companies]);

  const counts = useMemo(() => {
    return companies.reduce(
      (acc, company) => {
        acc.total += 1;
        acc[company.status] = (acc[company.status] || 0) + 1;
        return acc;
      },
      { total: 0 },
    );
  }, [companies]);

  const responseMetrics = useMemo(() => {
    return companies.reduce(
      (acc, company) => {
        const latestResponse = getLatestResponse(company);

        if (hasResponse(company)) {
          acc.respondedCompanies += 1;
          acc.totalResponses += getResponseCount(company);
        }

        if (ACTIVE_OUTREACH_STATUSES.has(company.status)) {
          acc.awaitingReply += 1;
        }

        if (RESPONSE_STATUSES.has(company.status) && company.responses.length === 0) {
          acc.missingReplyDetails += 1;
        }

        if (latestResponse?.date && getDateValue(latestResponse.date) > getDateValue(acc.latestResponseDate)) {
          acc.latestResponseDate = latestResponse.date;
        }

        return acc;
      },
      {
        respondedCompanies: 0,
        totalResponses: 0,
        awaitingReply: 0,
        missingReplyDetails: 0,
        latestResponseDate: "",
      },
    );
  }, [companies]);

  const filteredCompanies = useMemo(() => {
    const query = filters.query.trim().toLowerCase();

    return companies.filter((company) => {
      const matchesSearch = !query || buildSearchText(company).includes(query);
      const matchesStatus = filters.status === "All" || company.status === filters.status;
      const matchesLocation = filters.location === "All" || company.location === filters.location;
      const matchesResponse =
        filters.response === "All" ||
        (filters.response === "Responded" && hasResponse(company)) ||
        (filters.response === "Awaiting reply" && !hasResponse(company));

      return matchesSearch && matchesStatus && matchesLocation && matchesResponse;
    });
  }, [companies, filters]);

  const sortedFilteredCompanies = useMemo(
    () => [...filteredCompanies].sort(compareCompanies),
    [filteredCompanies],
  );

  const updateStatus = (companyId, status) => {
    setCompanies((current) =>
      current.map((company) => {
        if (company.id !== companyId) return company;
        return {
          ...company,
          status,
          appliedDate: status === "Sent" && !company.appliedDate ? today() : company.appliedDate,
        };
      }),
    );
  };

  const importReplySource = async ({ text, fileName, sourceLabel }) => {
    setReplyImportState({ phase: "processing", error: "" });

    try {
      const parsed = parseReplyImportSource({ text, fileName });
      const companySnapshot = companiesRef.current;
      const mergeResult = mergeResponsesIntoCompanies(companySnapshot, parsed.responses);
      const duplicateResponses = Math.max(
        parsed.responses.length - mergeResult.addedResponses - mergeResult.unmatchedResponses,
        0,
      );

      setCompanies(mergeResult.companies);
      setReplyImportText("");
      setReplyImportModalOpen(false);
      setReplyImportState({ phase: "idle", error: "" });
      setNotice(
        `Imported ${mergeResult.addedResponses} ${mergeResult.addedResponses === 1 ? "reply" : "replies"} from ${sourceLabel}${duplicateResponses ? `, skipped ${duplicateResponses} duplicates` : ""}${mergeResult.unmatchedResponses ? `, skipped ${mergeResult.unmatchedResponses} unmatched` : ""}.`,
      );
    } catch (error) {
      setReplyImportState({
        phase: "idle",
        error: error?.message || "Reply import failed.",
      });
    }
  };

  const importReplyFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      await importReplySource({
        text,
        fileName: file.name,
        sourceLabel: file.name,
      });
    } finally {
      event.target.value = "";
    }
  };

  const importPastedReplies = async () => {
    if (!replyImportText.trim()) {
      setReplyImportState({
        phase: "idle",
        error: "Paste a raw email, a Gmail Takeout .mbox dump, or JSON before importing.",
      });
      return;
    }

    await importReplySource({
      text: replyImportText,
      sourceLabel: "pasted replies",
    });
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(companies, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `application-tracker-${today()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setNotice("Exported the latest tracker JSON.");
  };

  const importJson = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const companyList = Array.isArray(parsed)
        ? parsed.every(looksLikeCompanyRecord)
          ? parsed
          : null
        : Array.isArray(parsed.companies)
          ? parsed.companies
          : null;
      const responseList =
        !Array.isArray(parsed) && Array.isArray(parsed.responses)
          ? parsed.responses
          : !Array.isArray(parsed) && Array.isArray(parsed.gmailResponses)
            ? parsed.gmailResponses
            : null;

      if (!companyList && !responseList) {
        throw new Error(
          "JSON must be a company list, an object with a companies array, or an object with a responses array.",
        );
      }

      const baseCompanies = companyList ? companyList.map(normalizeCompany) : companies;

      if (responseList) {
        const result = mergeResponsesIntoCompanies(baseCompanies, responseList);
        setCompanies(result.companies);
        setNotice(
          `Imported ${result.addedResponses} response${result.addedResponses === 1 ? "" : "s"} across ${result.matchedCompanies} compan${result.matchedCompanies === 1 ? "y" : "ies"}${result.unmatchedResponses ? `, skipped ${result.unmatchedResponses} unmatched` : ""}.`,
        );
        return;
      }

      setCompanies(baseCompanies);
      setNotice(`Imported ${baseCompanies.length} companies from JSON.`);
    } catch (error) {
      setNotice(`Import failed: ${error.message}`);
    } finally {
      event.target.value = "";
    }
  };

  const resetData = () => {
    setCompanies(originalCompanies);
    setFilters(emptyFilters);
    setReplyImportText("");
    setReplyImportModalOpen(false);
    setReplyImportState({ phase: "idle", error: "" });
    setNotice("Reset to the original company list, outreach merge, and cleared imported replies.");
  };

  return (
    <main className="min-h-screen px-4 py-4 text-slate-900 sm:px-6 lg:px-8">
      <div className="w-full">
        <Stats counts={counts} responseMetrics={responseMetrics} />

        <section className="premium-panel animate-fade-up mt-4 rounded-[2rem] p-4 sm:p-5">
          <Toolbar
            filters={filters}
            setFilters={setFilters}
            locations={locations}
            onImportReplies={() => setReplyImportModalOpen(true)}
            onExport={exportJson}
            onImport={() => fileInputRef.current?.click()}
            onReset={resetData}
            visibleCount={filteredCompanies.length}
            totalCount={companies.length}
          />

          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={importJson}
          />

          <input
            ref={replyFileInputRef}
            type="file"
            accept=".json,.txt,.mbox,.eml,.mime"
            className="hidden"
            onChange={importReplyFile}
          />

          {notice ? (
            <div className="animate-fade-up mt-4 rounded-[1.5rem] border border-emerald-100 bg-white/80 px-4 py-3 text-sm text-slate-700 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.5)]">
              {notice}
            </div>
          ) : null}

          <CompanyTable companies={sortedFilteredCompanies} onStatusChange={updateStatus} />
          <CompanyCards companies={sortedFilteredCompanies} onStatusChange={updateStatus} />

          <InsightStrip counts={counts} responseMetrics={responseMetrics} />
        </section>

        <ReplyImportModal
          open={replyImportModalOpen}
          text={replyImportText}
          onTextChange={setReplyImportText}
          onClose={() => {
            setReplyImportModalOpen(false);
            setReplyImportState({ phase: "idle", error: "" });
          }}
          onImportFile={() => replyFileInputRef.current?.click()}
          onImportPaste={importPastedReplies}
          state={replyImportState}
        />
      </div>
    </main>
  );
}

function Stats({ counts, responseMetrics }) {
  const cards = [
    { label: "Companies", value: counts.total || 0, tone: "text-slate-700" },
    { label: "Outreach sent", value: counts.Sent || 0, tone: "text-emerald-700" },
    { label: "Responses tracked", value: responseMetrics.respondedCompanies, tone: "text-sky-700" },
    { label: "Interviews", value: counts.Interview || 0, tone: "text-indigo-700" },
    { label: "Pending", value: counts.Pending || 0, tone: "text-amber-700" },
    { label: "Declined", value: counts.Declined || 0, tone: "text-rose-700" },
  ];

  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
      {cards.map((card, index) => (
        <div
          key={card.label}
          className="premium-card animate-fade-up rounded-[1.7rem] p-4"
          style={{ animationDelay: `${index * 70}ms` }}
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
            {card.label}
          </p>
          <p className={`mt-3 font-display text-3xl ${card.tone}`}>{card.value}</p>
        </div>
      ))}
    </section>
  );
}

function Toolbar({
  filters,
  setFilters,
  locations,
  onImportReplies,
  onExport,
  onImport,
  onReset,
  visibleCount,
  totalCount,
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
      <div className="grid gap-3 md:grid-cols-[1.45fr_0.75fr_0.75fr_0.85fr]">
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">Search everything</span>
          <input
            value={filters.query}
            onChange={(event) => setFilters((current) => ({ ...current, query: event.target.value }))}
            placeholder="Company, role, reply summary, sender, notes..."
            className="mt-2 w-full rounded-[1.35rem] border border-white/60 bg-white/88 px-4 py-3 text-sm outline-none transition focus:border-slate-300 focus:ring-4 focus:ring-slate-200/80"
          />
        </label>

        <SelectField
          label="Status"
          value={filters.status}
          onChange={(value) => setFilters((current) => ({ ...current, status: value }))}
          options={["All", ...STATUSES]}
        />

        <SelectField
          label="Location"
          value={filters.location}
          onChange={(value) => setFilters((current) => ({ ...current, location: value }))}
          options={["All", ...locations]}
        />

        <SelectField
          label="Replies"
          value={filters.response}
          onChange={(value) => setFilters((current) => ({ ...current, response: value }))}
          options={responseOptions}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2 lg:justify-end">
        <p className="mr-auto text-sm font-medium text-slate-500 lg:mr-2">
          Showing {visibleCount} of {totalCount}
        </p>
        <ToolbarButton onClick={() => setFilters(emptyFilters)} label="Clear" />
        <ToolbarButton onClick={onImportReplies} label="Import Replies" />
        <ToolbarButton onClick={onImport} label="Import Data" />
        <ToolbarButton onClick={onExport} label="Export JSON" emphasis />
        <button
          onClick={onReset}
          className="rounded-[1.25rem] border border-rose-200/80 bg-rose-50/80 px-4 py-3 text-sm font-semibold text-rose-700 transition duration-200 hover:-translate-y-0.5 hover:bg-rose-100"
        >
          Reset
        </button>
      </div>
    </div>
  );
}

function ToolbarButton({ onClick, label, emphasis = false }) {
  return (
    <button
      onClick={onClick}
      className={
        emphasis
          ? "rounded-[1.25rem] bg-[#24352f] px-4 py-3 text-sm font-semibold text-white shadow-[0_16px_36px_-24px_rgba(17,24,39,0.72)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#18241f]"
          : "rounded-[1.25rem] border border-white/70 bg-white/82 px-4 py-3 text-sm font-semibold text-slate-700 transition duration-200 hover:-translate-y-0.5 hover:border-slate-200 hover:bg-white"
      }
    >
      {label}
    </button>
  );
}

function ReplyImportModal({ open, text, onTextChange, onClose, onImportFile, onImportPaste, state }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/30 px-4 py-6 backdrop-blur-sm">
      <section className="premium-panel w-full max-w-4xl rounded-[2rem] p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
              Local Reply Import
            </p>
            <h2 className="mt-2 font-display text-3xl text-slate-950">Import replies without Google OAuth</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              Paste a raw email, Gmail "Show original" content, JSON, or import a Gmail Takeout{" "}
              <code>.mbox</code> file. The tracker will match replies back to company contacts and update
              statuses locally.
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-full border border-white/70 bg-white/82 px-4 py-2 text-sm font-semibold text-slate-700 transition duration-200 hover:bg-white"
          >
            Close
          </button>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <MetaPill>Supports .mbox</MetaPill>
          <MetaPill>Supports .eml</MetaPill>
          <MetaPill>Supports JSON</MetaPill>
          <MetaPill>Paste raw email text</MetaPill>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <ToolbarButton onClick={onImportFile} label="Choose Reply File" />
          <ToolbarButton onClick={onImportPaste} label="Import Pasted Replies" emphasis />
        </div>

        <label className="mt-5 block">
          <span className="text-sm font-semibold text-slate-700">Paste raw message or export text</span>
          <textarea
            value={text}
            onChange={(event) => onTextChange(event.target.value)}
            placeholder={"From: recruiter@company.com\nSubject: Interview for Frontend Role\nDate: Tue, 13 May 2026 10:00:00 +0530\n\nThanks for applying..."}
            className="mt-2 min-h-[280px] w-full rounded-[1.35rem] border border-white/60 bg-white/88 px-4 py-3 text-sm leading-6 outline-none transition focus:border-slate-300 focus:ring-4 focus:ring-slate-200/80"
          />
        </label>

        <p className="mt-3 text-xs leading-6 text-slate-500">
          Best results come from exact tracked contact emails or unique company domains. Generic public
          mailboxes like Gmail or Outlook only match when that exact sender address is already saved for a
          company.
        </p>

        {state.error ? (
          <div className="mt-4 rounded-[1.4rem] border border-rose-200/80 bg-rose-50/85 px-4 py-3 text-sm text-rose-700">
            {state.error}
          </div>
        ) : null}

        <button
          onClick={onImportPaste}
          disabled={state.phase !== "idle"}
          className="mt-5 rounded-[1.3rem] bg-[#24352f] px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_36px_-24px_rgba(17,24,39,0.72)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#18241f] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
        >
          {state.phase === "processing" ? "Importing..." : "Import Replies"}
        </button>
      </section>
    </div>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-[1.35rem] border border-white/60 bg-white/88 px-4 py-3 text-sm outline-none transition focus:border-slate-300 focus:ring-4 focus:ring-slate-200/80"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function InsightStrip({ counts, responseMetrics }) {
  const items = [
    {
      label: "Awaiting reply",
      value: responseMetrics.awaitingReply,
      tone: "text-amber-700",
      caption: "Sent or follow-up companies still waiting on a response.",
    },
    {
      label: "Responses tracked",
      value: responseMetrics.respondedCompanies,
      tone: "text-sky-700",
      caption: "Threads that have already moved beyond first outreach.",
    },
    {
      label: "Interview pipeline",
      value: counts.Interview || 0,
      tone: "text-indigo-700",
      caption: "Highest-priority conversations that need active prep.",
    },
    {
      label: "Reply detail missing",
      value: responseMetrics.missingReplyDetails,
      tone: "text-slate-700",
      caption: "Statuses updated without the actual reply summary captured.",
    },
  ];

  return (
    <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item, index) => (
        <div
          key={item.label}
          className="premium-card animate-fade-up rounded-[1.5rem] px-4 py-4"
          style={{ animationDelay: `${index * 60}ms` }}
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
            {item.label}
          </p>
          <p className={`mt-2 text-2xl font-bold ${item.tone}`}>{item.value}</p>
          <p className="mt-2 text-sm leading-6 text-slate-500">{item.caption}</p>
        </div>
      ))}
    </div>
  );
}

function CompanyTable({ companies, onStatusChange }) {
  return (
    <div className="mt-6 hidden overflow-hidden rounded-[1.9rem] border border-white/70 bg-white/72 shadow-[0_28px_70px_-48px_rgba(15,23,42,0.52)] xl:block">
      <div className="max-h-[72vh] overflow-auto">
        <table className="w-full min-w-[1340px] border-collapse text-left text-sm">
          <thead className="sticky top-0 z-10 bg-[rgba(250,247,241,0.94)] text-[11px] uppercase tracking-[0.22em] text-slate-500 backdrop-blur">
            <tr>
              <th className="px-4 py-4 font-bold">#</th>
              <th className="px-4 py-4 font-bold">Company</th>
              <th className="px-4 py-4 font-bold">Snapshot</th>
              <th className="px-4 py-4 font-bold">Outreach</th>
              <th className="px-4 py-4 font-bold">Response</th>
              <th className="px-4 py-4 font-bold">Status</th>
              <th className="px-4 py-4 font-bold">Links</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/70">
            {companies.map((company) => (
              <tr key={company.id} className="align-top transition duration-300 hover:bg-[#f8f5ef]/78">
                <td className="px-4 py-5 font-semibold text-slate-500">{company.companyNumber}</td>
                <td className="min-w-[18rem] px-4 py-5">
                  <p className="text-base font-bold text-slate-950">{company.companyName}</p>
                  <EmailList emails={company.emails} />
                </td>
                <td className="min-w-[17rem] px-4 py-5">
                  <SnapshotCell company={company} />
                </td>
                <td className="min-w-[18rem] px-4 py-5">
                  <OutreachCell company={company} />
                </td>
                <td className="min-w-[20rem] px-4 py-5">
                  <ResponseCell company={company} />
                </td>
                <td className="min-w-[12rem] px-4 py-5">
                  <StatusSelect company={company} onStatusChange={onStatusChange} />
                </td>
                <td className="px-4 py-5">
                  <LinkStack company={company} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {companies.length === 0 ? <EmptyState /> : null}
    </div>
  );
}

function CompanyCards({ companies, onStatusChange }) {
  return (
    <div className="mt-6 grid gap-4 xl:hidden">
      {companies.map((company, index) => (
        <article
          key={company.id}
          className="premium-card animate-fade-up rounded-[1.8rem] p-5"
          style={{ animationDelay: `${index * 55}ms` }}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">
                #{company.companyNumber}
              </p>
              <h2 className="mt-2 text-xl font-bold text-slate-950">{company.companyName}</h2>
              <EmailList emails={company.emails} />
            </div>
            <StatusBadge status={company.status} />
          </div>

          <div className="mt-5 grid gap-3 text-sm text-slate-700 sm:grid-cols-3">
            <InfoLine label="Role focus" value={company.roleTarget} />
            <InfoLine label="Location" value={company.location} />
            <InfoLine label="Size" value={company.companySize || "Unknown"} />
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-[0.92fr_1.08fr]">
            <PanelBlock title="Outreach">
              <OutreachCell company={company} compact />
            </PanelBlock>
            <PanelBlock title="Response">
              <ResponseCell company={company} compact />
            </PanelBlock>
          </div>

          <div className="mt-4">
            <StatusSelect company={company} onStatusChange={onStatusChange} />
          </div>

          <div className="mt-4">
            <LinkStack company={company} />
          </div>
        </article>
      ))}
      {companies.length === 0 ? <EmptyState /> : null}
    </div>
  );
}

function SnapshotCell({ company }) {
  return (
    <div className="space-y-3">
      <MiniDetail label="Role focus" value={company.roleTarget} />
      <div className="flex flex-wrap gap-2">
        <MetaPill>{company.location || "Unknown location"}</MetaPill>
        <MetaPill>{company.companySize || "Unknown size"}</MetaPill>
      </div>
    </div>
  );
}

function OutreachCell({ company, compact = false }) {
  return (
    <div className={compact ? "space-y-3 text-sm" : "space-y-3"}>
      <MiniDetail label="Applied" value={company.appliedDate ? formatDate(company.appliedDate) : "Not sent yet"} />
      <div className="flex flex-wrap gap-2">
        <MetaPill>{company.emails.length ? `${company.emails.length} contact${company.emails.length > 1 ? "s" : ""}` : "No email found"}</MetaPill>
        <MetaPill>{company.website ? "Website found" : "Website missing"}</MetaPill>
      </div>
      {company.notes ? (
        <p className="line-clamp-3 text-sm leading-6 text-slate-600" title={company.notes}>
          {company.notes}
        </p>
      ) : (
        <p className="text-sm text-slate-400">No outreach note saved.</p>
      )}
    </div>
  );
}

function ResponseCell({ company, compact = false }) {
  const latestResponse = getLatestResponse(company);
  const responseCount = getResponseCount(company);
  const tone = getResponseTone(company, latestResponse);
  const summary = getResponseSummary(company, latestResponse);
  const fromLabel = latestResponse?.from || "";
  const dateLabel = latestResponse?.date ? formatCompactDate(latestResponse.date) : "";

  return (
    <div className={compact ? "space-y-3 text-sm" : "space-y-3"}>
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full border px-3 py-1 text-xs font-semibold ${
            responseCount ? responseToneStyles[tone] : responseToneStyles.neutral
          }`}
        >
          {responseCount ? `${responseCount} response${responseCount > 1 ? "s" : ""}` : "Awaiting reply"}
        </span>
        {fromLabel ? <MetaPill>{fromLabel}</MetaPill> : null}
        {dateLabel ? <MetaPill>{dateLabel}</MetaPill> : null}
      </div>

      <p className="line-clamp-3 text-sm leading-6 text-slate-700" title={summary}>
        {summary}
      </p>

      {latestResponse?.subject ? (
        <p className="text-xs uppercase tracking-[0.18em] text-slate-400" title={latestResponse.subject}>
          {latestResponse.subject}
        </p>
      ) : null}

      <p className="text-sm leading-6 text-slate-500">
        <span className="font-semibold text-slate-700">Next step:</span> {getNextStep(company)}
      </p>
    </div>
  );
}

function PanelBlock({ title, children }) {
  return (
    <div className="rounded-[1.35rem] border border-white/70 bg-white/78 p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">{title}</p>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function MiniDetail({ label, value }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-semibold leading-6 text-slate-800">{value}</p>
    </div>
  );
}

function MetaPill({ children }) {
  return (
    <span className="rounded-full border border-[#d8e2dc] bg-[#f4f8f5] px-3 py-1 text-xs font-semibold text-[#355246]">
      {children}
    </span>
  );
}

function StatusSelect({ company, onStatusChange }) {
  return (
    <select
      value={company.status}
      onChange={(event) => onStatusChange(company.id, event.target.value)}
      className={`w-full rounded-[1.25rem] border px-3 py-2.5 text-sm font-bold outline-none transition focus:ring-4 focus:ring-slate-200 ${
        statusStyles[company.status] || statusStyles.Pending
      }`}
    >
      {STATUSES.map((status) => (
        <option key={status} value={status}>
          {status}
        </option>
      ))}
    </select>
  );
}

function StatusBadge({ status }) {
  return (
    <span
      className={`rounded-full border px-3 py-1.5 text-xs font-bold ${
        statusStyles[status] || statusStyles.Pending
      }`}
    >
      {status}
    </span>
  );
}

function InfoLine({ label, value }) {
  return (
    <div className="rounded-[1.2rem] border border-white/70 bg-white/74 px-3 py-3">
      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="mt-2 font-semibold leading-6">{value}</p>
    </div>
  );
}

function LinkStack({ company }) {
  return (
    <div className="flex flex-wrap gap-2">
      <ExternalLink href={company.website} label="Website" />
      <ExternalLink href={company.linkedin} label="LinkedIn" />
    </div>
  );
}

function ExternalLink({ href, label }) {
  if (!href) {
    return (
      <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-400">
        {label}: Unknown
      </span>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="rounded-full border border-white/80 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-950"
    >
      {label}
    </a>
  );
}

function EmailList({ emails }) {
  if (!emails.length) return null;

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {emails.map((email) => (
        <a
          key={email}
          href={`mailto:${email}`}
          className="rounded-full bg-[#edf3ef] px-3 py-1 text-xs font-semibold text-[#355246] transition duration-200 hover:-translate-y-0.5 hover:bg-[#ddebe3]"
        >
          {email}
        </a>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-[1.8rem] border border-dashed border-slate-300 bg-white/78 p-10 text-center">
      <p className="font-display text-3xl text-slate-900">No companies found</p>
      <p className="mt-3 text-sm text-slate-500">
        Try clearing filters or broadening the search query.
      </p>
    </div>
  );
}

export default App;
