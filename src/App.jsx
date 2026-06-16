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
  Sent: "border-emerald-200 bg-emerald-50 text-emerald-800",
  Replied: "border-sky-200 bg-sky-50 text-sky-800",
  Declined: "border-rose-200 bg-rose-50 text-rose-800",
  Interview: "border-indigo-200 bg-indigo-50 text-indigo-800",
  "Follow Up": "border-orange-200 bg-orange-50 text-orange-800",
  "Not Applied": "border-slate-200 bg-slate-100 text-slate-700",
  "Portal Only": "border-cyan-200 bg-cyan-50 text-cyan-800",
  Limited: "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-800",
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
  route: "All",
  response: "All",
};

const responseOptions = ["All", "Responded", "Awaiting reply"];
const routeOptions = ["All", "Has email", "Portal Only", "Limited", "No verified route"];
const blockedEmailQueueStatuses = new Set(["Sent", "Replied", "Interview", "Declined"]);
const RESUME_ATTACHMENT_PATH = "/home/gehrman/door/hunt/src/resume/Adarsh_Pathania_resume.pdf";
const BUNDLED_RESUME_FILENAME = "Adarsh_Pathania_resume.pdf";
const BUNDLED_RESUME_URL = new URL("./resume/Adarsh_Pathania_resume.pdf", import.meta.url).href;
const DEFAULT_ROLE_FOCUS = "Full-Stack Developer";
const DEFAULT_RESUME_LABEL = "Bundled PDF resume";
const RESUME_ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const today = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getRoleFocus = (company) => company.roleTarget || DEFAULT_ROLE_FOCUS;

const getDraftSubject = () =>
  "Application for Full-Stack Developer Role";

const getDraftBody = (company) => {
  const role = getRoleFocus(company);
  return [
    "Hello Recruitment Team,",
    "",
    `I am reaching out to explore opportunities at ${company.companyName} as a ${role}. Over the past six months, I have worked as a Software Engineering Intern at Paras Technologies in Mohali, gaining hands-on experience building a production web application with Next.js, React, and TypeScript.`,
    "",
    "During my internship, I developed frontend features using Zustand, TanStack Query, Tailwind CSS, and shadcn/ui. I also worked on type-safe APIs with tRPC and backend services using Node.js, Hono.js, Prisma, and MongoDB. This experience has helped me understand the complete development process, from building responsive interfaces to integrating APIs and working with databases.",
    "",
    "I am now looking for a role where I can contribute to real products, strengthen my skills, and grow with an experienced engineering team. I have attached my resume for your review and would appreciate an opportunity to discuss my profile in an interview.",
    "",
    "Best regards,",
    "Adarsh Pathania",
    "Phone: +91 78890 78854",
    "Email: adarsh.pathania.04@gmail.com",
    "LinkedIn: https://www.linkedin.com/in/adarshpathania04/",
    "GitHub: https://github.com/Adarsh-V1",
  ].join("\n");
};

const isSupportedResumeFile = (file) => {
  if (!file) return false;

  const filename = String(file.name || "").toLowerCase();
  const extension = filename.slice(filename.lastIndexOf("."));
  if (extension !== ".pdf" && extension !== ".docx") return false;

  const mimeType = String(file.type || "").toLowerCase();
  return (
    !mimeType ||
    mimeType === "application/octet-stream" ||
    RESUME_ALLOWED_MIME_TYPES.has(mimeType)
  );
};

const loadBundledResumeFile = async () => {
  const response = await fetch(BUNDLED_RESUME_URL);
  if (!response.ok) {
    throw new Error("Could not load the bundled resume file.");
  }

  const blob = await response.blob();
  return new File([blob], BUNDLED_RESUME_FILENAME, {
    type: blob.type || "application/pdf",
  });
};

const getMailtoHref = (company) => {
  if (!company.emails.length) return "";

  const recipients = company.emails.join(",");
  const subject = encodeURIComponent(getDraftSubject(company));
  const body = encodeURIComponent(getDraftBody(company));
  return `mailto:${recipients}?subject=${subject}&body=${body}`;
};

const isValidEmailList = (value) => {
  const emails = String(value || "")
    .split(/[;,]/)
    .map((entry) => entry.trim())
    .filter(Boolean);

  if (!emails.length) return false;

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emails.every((email) => emailPattern.test(email));
};

const createSmtpComposer = (company) => ({
  open: true,
  companyId: company.id,
  recipientEmail: company.emails[0] || "",
  subject: getDraftSubject(company),
  body: getDraftBody(company),
  resumeMode: "bundled",
  resumeFile: null,
  resumeLabel: DEFAULT_RESUME_LABEL,
  phase: "idle",
  error: "",
});

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

const STATUS_PRIORITY = {
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

const mergeStatus = (baseStatus, savedStatus) => {
  const base = STATUSES.includes(baseStatus) ? baseStatus : "Pending";
  const saved = STATUSES.includes(savedStatus) ? savedStatus : "";

  if (!saved) return base;

  const baseRank = STATUS_PRIORITY[base] ?? 0;
  const savedRank = STATUS_PRIORITY[saved] ?? 0;
  return savedRank >= baseRank ? saved : base;
};

const mergeNotes = (baseNotes, savedNotes) => {
  const values = [String(baseNotes || "").trim(), String(savedNotes || "").trim()].filter(Boolean);
  return [...new Set(values)].join(" ");
};

const mergeCompanyFromSources = (baseCompany, savedCompany) => {
  if (!savedCompany) return baseCompany;

  return {
    ...baseCompany,
    ...savedCompany,
    website: savedCompany.website || baseCompany.website,
    linkedin: savedCompany.linkedin || baseCompany.linkedin,
    basicInfo: savedCompany.basicInfo || baseCompany.basicInfo,
    appliedDate: savedCompany.appliedDate || baseCompany.appliedDate,
    status: mergeStatus(baseCompany.status, savedCompany.status),
    emails: [
      ...new Set(
        [
          ...(Array.isArray(baseCompany.emails) ? baseCompany.emails : []),
          ...(Array.isArray(savedCompany.emails) ? savedCompany.emails : []),
        ].filter(Boolean),
      ),
    ],
    responses:
      Array.isArray(savedCompany.responses) && savedCompany.responses.length
        ? savedCompany.responses
        : baseCompany.responses,
    notes: mergeNotes(baseCompany.notes, savedCompany.notes),
  };
};

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
    return normalizeCompany(mergeCompanyFromSources(company, saved), index);
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
    company.basicInfo,
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
const hasEmailRoute = (company) => company.emails.length > 0;

const getRouteLabel = (company) => {
  if (hasEmailRoute(company)) return "Has email";
  if (company.status === "Portal Only") return "Portal Only";
  if (company.status === "Limited") return "Limited";
  return "No verified route";
};

const isActionableEmailCompany = (company) =>
  hasEmailRoute(company) && !blockedEmailQueueStatuses.has(company.status);

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

const REQUIRED_COMPANY_FIELDS = [
  "id",
  "companyNumber",
  "companyName",
  "roleTarget",
  "location",
  "companySize",
  "website",
  "linkedin",
  "basicInfo",
  "appliedDate",
  "status",
  "emails",
  "notes",
];

const isPlainObject = (value) => value && typeof value === "object" && !Array.isArray(value);
const looksLikeResponseRecord = (value) =>
  isPlainObject(value) &&
  ("from" in value || "sender" in value || "subject" in value || "summary" in value || "snippet" in value);
const looksLikeCompanyRecord = (value) =>
  isPlainObject(value) &&
  ("companyName" in value || "companyNumber" in value || "roleTarget" in value || "status" in value);

const validateImportedCompanyList = (value) => {
  if (!Array.isArray(value)) {
    throw new Error("Imported company data must be an array.");
  }

  return value.map((company, index) => {
    if (!isPlainObject(company)) {
      throw new Error(`Company at row ${index + 1} must be an object.`);
    }

    const missingFields = REQUIRED_COMPANY_FIELDS.filter((field) => !(field in company));
    if (missingFields.length) {
      throw new Error(
        `Company at row ${index + 1} is missing required fields: ${missingFields.join(", ")}.`,
      );
    }

    if (!STATUSES.includes(company.status)) {
      throw new Error(
        `Company at row ${index + 1} has invalid status "${company.status}". Allowed: ${STATUSES.join(", ")}.`,
      );
    }

    if (!Array.isArray(company.emails)) {
      throw new Error(`Company at row ${index + 1} must include an emails array.`);
    }

    if (!company.emails.every((email) => typeof email === "string")) {
      throw new Error(`Company at row ${index + 1} has a non-text value in emails.`);
    }

    if (company.appliedDate && typeof company.appliedDate !== "string") {
      throw new Error(`Company at row ${index + 1} has an invalid appliedDate value.`);
    }

    return normalizeCompany(company, index);
  });
};

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
    case "Portal Only":
      return "Apply via the official portal and track the submission reference in notes.";
    case "Limited":
      return "No verified direct email found yet; monitor trusted sources for a safe contact path.";
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
  if (company.status === "Portal Only") return 260;
  if (company.status === "Limited") return 220;
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
  const [smtpComposer, setSmtpComposer] = useState({
    open: false,
    companyId: null,
    recipientEmail: "",
    subject: "",
    body: "",
    resumeMode: "bundled",
    resumeFile: null,
    resumeLabel: DEFAULT_RESUME_LABEL,
    phase: "idle",
    error: "",
  });
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

  const activeSmtpCompany = useMemo(
    () => companies.find((company) => company.id === smtpComposer.companyId) || null,
    [companies, smtpComposer.companyId],
  );

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

  const routeMetrics = useMemo(() => {
    return companies.reduce(
      (acc, company) => {
        const routeLabel = getRouteLabel(company);

        if (routeLabel === "Has email") acc.hasEmail += 1;
        if (routeLabel === "Portal Only") acc.portalOnly += 1;
        if (routeLabel === "Limited") acc.limited += 1;
        if (routeLabel === "No verified route") acc.noVerifiedRoute += 1;
        if (isActionableEmailCompany(company)) acc.actionableEmailQueue += 1;

        return acc;
      },
      {
        hasEmail: 0,
        portalOnly: 0,
        limited: 0,
        noVerifiedRoute: 0,
        actionableEmailQueue: 0,
      },
    );
  }, [companies]);

  const filteredCompanies = useMemo(() => {
    const query = filters.query.trim().toLowerCase();

    return companies.filter((company) => {
      const matchesSearch = !query || buildSearchText(company).includes(query);
      const matchesStatus = filters.status === "All" || company.status === filters.status;
      const matchesLocation = filters.location === "All" || company.location === filters.location;
      const matchesRoute = filters.route === "All" || getRouteLabel(company) === filters.route;
      const matchesResponse =
        filters.response === "All" ||
        (filters.response === "Responded" && hasResponse(company)) ||
        (filters.response === "Awaiting reply" && !hasResponse(company));

      return matchesSearch && matchesStatus && matchesLocation && matchesRoute && matchesResponse;
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
        return { ...company, status };
      }),
    );
  };

  const updateAppliedDate = (companyId, appliedDate) => {
    setCompanies((current) =>
      current.map((company) => (company.id === companyId ? { ...company, appliedDate } : company)),
    );
  };

  const updateNotes = (companyId, notes) => {
    setCompanies((current) =>
      current.map((company) => (company.id === companyId ? { ...company, notes } : company)),
    );
  };

  const openSmtpComposer = (company) => {
    setSmtpComposer(createSmtpComposer(company));
  };

  const closeSmtpComposer = () => {
    setSmtpComposer({
      open: false,
      companyId: null,
      recipientEmail: "",
      subject: "",
      body: "",
      resumeMode: "bundled",
      resumeFile: null,
      resumeLabel: DEFAULT_RESUME_LABEL,
      phase: "idle",
      error: "",
    });
  };

  const updateSmtpComposer = (patch) => {
    setSmtpComposer((current) => ({ ...current, ...patch, error: patch.error ?? current.error }));
  };

  const copyToClipboard = async (text, successNotice, failureNotice) => {
    try {
      await navigator.clipboard.writeText(text);
      setNotice(successNotice);
    } catch {
      setNotice(failureNotice);
    }
  };

  const copyEmail = async (email) => {
    await copyToClipboard(email, `Copied ${email} to clipboard.`, `Could not copy ${email}.`);
  };

  const copyDraftSubject = async (company) => {
    await copyToClipboard(
      getDraftSubject(company),
      `Copied draft subject for ${company.companyName}.`,
      `Could not copy draft subject for ${company.companyName}.`,
    );
  };

  const copyDraftBody = async (company) => {
    await copyToClipboard(
      getDraftBody(company),
      `Copied draft body for ${company.companyName}. Attach a PDF/DOCX resume before sending.`,
      `Could not copy draft body for ${company.companyName}.`,
    );
  };

  const sendSmtpApplication = async () => {
    const company = companiesRef.current.find((item) => item.id === smtpComposer.companyId);

    if (!company) {
      updateSmtpComposer({ error: "The selected company could not be found." });
      return;
    }

    if (!smtpComposer.recipientEmail.trim()) {
      updateSmtpComposer({ error: "Recipient email is required." });
      return;
    }

    if (!isValidEmailList(smtpComposer.recipientEmail)) {
      updateSmtpComposer({ error: "Enter a valid recipient email address." });
      return;
    }

    if (!smtpComposer.subject.trim()) {
      updateSmtpComposer({ error: "Subject is required." });
      return;
    }

    if (!smtpComposer.body.trim()) {
      updateSmtpComposer({ error: "Body is required." });
      return;
    }

    if (smtpComposer.resumeMode === "upload" && !smtpComposer.resumeFile) {
      updateSmtpComposer({ error: "Please upload a PDF or DOCX resume file." });
      return;
    }

    let resumeFile = smtpComposer.resumeFile;
    if (smtpComposer.resumeMode === "bundled") {
      try {
        resumeFile = await loadBundledResumeFile();
      } catch (error) {
        updateSmtpComposer({
          phase: "idle",
          error: error?.message || "Could not load the bundled resume file.",
        });
        return;
      }
    }

    if (!isSupportedResumeFile(resumeFile)) {
      updateSmtpComposer({ error: "Resume must be a PDF or DOCX file." });
      return;
    }

    const formData = new FormData();
    formData.append("companyId", String(company.id));
    formData.append("recipientEmail", smtpComposer.recipientEmail.trim());
    formData.append("subject", smtpComposer.subject.trim());
    formData.append("body", smtpComposer.body.trim());
    formData.append("companyName", company.companyName || "");
    formData.append("roleTarget", company.roleTarget || "");
    formData.append("resume", resumeFile, resumeFile.name);

    updateSmtpComposer({ phase: "sending", error: "" });

    try {
      const response = await fetch("/api/send-application-email", {
        method: "POST",
        body: formData,
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "Failed to send application email.");
      }

      setCompanies((current) =>
        current.map((item) => {
          if (item.id !== company.id) return item;
          const updatedCompany = payload.company;
          if (!updatedCompany) {
            return {
              ...item,
              status: "Sent",
              appliedDate: today(),
            };
          }

          return {
            ...item,
            status: updatedCompany.status || item.status,
            appliedDate: updatedCompany.appliedDate || item.appliedDate,
            notes: updatedCompany.notes || item.notes,
          };
        }),
      );

      closeSmtpComposer();
      setNotice(`Sent application email to ${payload.result?.recipientEmail || smtpComposer.recipientEmail.trim()} for ${company.companyName}.`);
    } catch (error) {
      const errorMessage = error?.message || "Failed to send application email.";
      updateSmtpComposer({ phase: "idle", error: errorMessage });
      setNotice(`SMTP send failed for ${company.companyName}: ${errorMessage}`);
    }
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

  const exportEmailQueue = () => {
    const emailQueue = companies.filter(isActionableEmailCompany);
    const blob = new Blob([JSON.stringify(emailQueue, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `direct-email-queue-${today()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setNotice(
      `Exported ${emailQueue.length} compan${emailQueue.length === 1 ? "y" : "ies"} with direct email routes.`,
    );
  };

  const importJson = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const parsedObject = parsed && typeof parsed === "object" ? parsed : null;
      let companyList = null;
      let responseList = null;

      if (Array.isArray(parsed)) {
        if (!parsed.length || parsed.every(looksLikeCompanyRecord)) {
          companyList = parsed;
        } else if (parsed.every(looksLikeResponseRecord)) {
          responseList = parsed;
        }
      } else if (parsedObject) {
        if (Array.isArray(parsedObject.companies)) {
          companyList = parsedObject.companies;
        }

        if (Array.isArray(parsedObject.responses)) {
          responseList = parsedObject.responses;
        } else if (Array.isArray(parsedObject.gmailResponses)) {
          responseList = parsedObject.gmailResponses;
        }
      }

      if (!companyList && !responseList) {
        throw new Error(
          "JSON must be a company list, an object with a companies array, or an object with a responses array.",
        );
      }

      const baseCompanies = companyList ? validateImportedCompanyList(companyList) : companies;

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
    closeSmtpComposer();
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
            onExportEmailQueue={exportEmailQueue}
            onExport={exportJson}
            onImport={() => fileInputRef.current?.click()}
            onReset={resetData}
            visibleCount={filteredCompanies.length}
            totalCount={companies.length}
            routeMetrics={routeMetrics}
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

          <CompanyTable
            companies={sortedFilteredCompanies}
            onStatusChange={updateStatus}
            onAppliedDateChange={updateAppliedDate}
            onNotesChange={updateNotes}
            onCopyEmail={copyEmail}
            onCopyDraftSubject={copyDraftSubject}
            onCopyDraftBody={copyDraftBody}
            onOpenSmtpComposer={openSmtpComposer}
          />
          <CompanyCards
            companies={sortedFilteredCompanies}
            onStatusChange={updateStatus}
            onAppliedDateChange={updateAppliedDate}
            onNotesChange={updateNotes}
            onCopyEmail={copyEmail}
            onCopyDraftSubject={copyDraftSubject}
            onCopyDraftBody={copyDraftBody}
            onOpenSmtpComposer={openSmtpComposer}
          />

          <InsightStrip counts={counts} responseMetrics={responseMetrics} routeMetrics={routeMetrics} />
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

        <SmtpSendModal
          open={smtpComposer.open}
          company={activeSmtpCompany}
          composer={smtpComposer}
          onClose={closeSmtpComposer}
          onFieldChange={updateSmtpComposer}
          onSubmit={sendSmtpApplication}
        />
      </div>
    </main>
  );
}

function Stats({ counts, responseMetrics }) {
  const tones = {
    Pending: "text-amber-700",
    Sent: "text-emerald-700",
    Replied: "text-sky-700",
    Declined: "text-rose-700",
    Interview: "text-indigo-700",
    "Follow Up": "text-orange-700",
    "Not Applied": "text-slate-700",
    "Portal Only": "text-cyan-700",
    Limited: "text-fuchsia-700",
  };

  const cards = [
    { label: "Companies", value: counts.total || 0, tone: "text-slate-700" },
    ...STATUSES.map((status) => ({
      label: status,
      value: counts[status] || 0,
      tone: tones[status] || "text-slate-700",
    })),
    { label: "Responses tracked", value: responseMetrics.respondedCompanies, tone: "text-sky-700" },
  ];

  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
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
  onExportEmailQueue,
  onExport,
  onImport,
  onReset,
  visibleCount,
  totalCount,
  routeMetrics,
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1.35fr_0.78fr_0.78fr_0.82fr_0.9fr]">
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
          label="Route"
          value={filters.route}
          onChange={(value) => setFilters((current) => ({ ...current, route: value }))}
          options={routeOptions}
        />

        <SelectField
          label="Replies"
          value={filters.response}
          onChange={(value) => setFilters((current) => ({ ...current, response: value }))}
          options={responseOptions}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2 lg:justify-end">
        <div className="mr-auto lg:mr-2">
          <p className="text-sm font-medium text-slate-500">
            Showing {visibleCount} of {totalCount}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Email queue {routeMetrics.actionableEmailQueue} • Portal only {routeMetrics.portalOnly} • No
            route {routeMetrics.noVerifiedRoute}
          </p>
        </div>
        <ToolbarButton onClick={() => setFilters(emptyFilters)} label="Clear" />
        <ToolbarButton onClick={onImportReplies} label="Import Replies" />
        <ToolbarButton onClick={onExportEmailQueue} label="Export Email Queue" />
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

function SmtpSendModal({ open, company, composer, onClose, onFieldChange, onSubmit }) {
  if (!open || !company) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/35 px-4 py-6 backdrop-blur-sm">
      <section className="premium-panel w-full max-w-4xl rounded-[2rem] p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
              SMTP Application Send
            </p>
            <h2 className="mt-2 font-display text-3xl text-slate-950">{company.companyName}</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              Send a professional application email through SMTP. The tracker only marks the company as
              sent after the server confirms delivery.
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
          <MetaPill>{company.roleTarget || "Role not set"}</MetaPill>
          <MetaPill>{company.location || "Unknown location"}</MetaPill>
          <MetaPill>{company.emails.length ? `${company.emails.length} saved email${company.emails.length > 1 ? "s" : ""}` : "Manual recipient"}</MetaPill>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Recipient email</span>
            <input
              value={composer.recipientEmail}
              onChange={(event) =>
                onFieldChange({ recipientEmail: event.target.value, error: "" })
              }
              placeholder="recruiter@company.com"
              className="mt-2 w-full rounded-[1.35rem] border border-white/60 bg-white/88 px-4 py-3 text-sm outline-none transition focus:border-slate-300 focus:ring-4 focus:ring-slate-200/80"
            />
          </label>

          {company.emails.length ? (
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Saved emails</span>
              <select
                value={company.emails.includes(composer.recipientEmail) ? composer.recipientEmail : ""}
                onChange={(event) =>
                  onFieldChange({ recipientEmail: event.target.value, error: "" })
                }
                className="mt-2 w-full rounded-[1.35rem] border border-white/60 bg-white/88 px-4 py-3 text-sm outline-none transition focus:border-slate-300 focus:ring-4 focus:ring-slate-200/80"
              >
                <option value="">Select a saved email</option>
                {company.emails.map((email) => (
                  <option key={email} value={email}>
                    {email}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs leading-5 text-slate-500">
                Pick a saved recipient here, or enter a user-provided address in the field above.
              </p>
            </label>
          ) : (
            <div className="rounded-[1.35rem] border border-white/70 bg-white/78 px-4 py-3 text-xs leading-5 text-slate-500">
              No saved email was found for this company. Enter a recipient manually above.
            </div>
          )}

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Subject</span>
            <input
              value={composer.subject}
              onChange={(event) => onFieldChange({ subject: event.target.value, error: "" })}
              className="mt-2 w-full rounded-[1.35rem] border border-white/60 bg-white/88 px-4 py-3 text-sm outline-none transition focus:border-slate-300 focus:ring-4 focus:ring-slate-200/80"
            />
          </label>
        </div>

        <label className="mt-4 block">
          <span className="text-sm font-semibold text-slate-700">Message body</span>
          <textarea
            value={composer.body}
            onChange={(event) => onFieldChange({ body: event.target.value, error: "" })}
            className="mt-2 min-h-[220px] w-full rounded-[1.35rem] border border-white/60 bg-white/88 px-4 py-3 text-sm leading-6 outline-none transition focus:border-slate-300 focus:ring-4 focus:ring-slate-200/80"
          />
        </label>

        <div className="mt-4 rounded-[1.35rem] border border-white/70 bg-white/78 p-4">
          <p className="text-sm font-semibold text-slate-700">Resume attachment</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Keep the bundled PDF selected, or upload a PDF/DOCX resume for this send.
          </p>

          <div className="mt-3 flex flex-wrap gap-3">
            <label className="inline-flex items-center gap-2 rounded-full border border-[#cfe0d7] bg-white px-3 py-2 text-xs font-semibold text-[#355246]">
              <input
                type="radio"
                name="resumeMode"
                checked={composer.resumeMode === "bundled"}
                onChange={() =>
                  onFieldChange({
                    resumeMode: "bundled",
                    resumeFile: null,
                    resumeLabel: DEFAULT_RESUME_LABEL,
                    error: "",
                  })
                }
              />
              Use bundled resume PDF
            </label>
            <label className="inline-flex items-center gap-2 rounded-full border border-[#cfe0d7] bg-white px-3 py-2 text-xs font-semibold text-[#355246]">
              <input
                type="radio"
                name="resumeMode"
                checked={composer.resumeMode === "upload"}
                onChange={() =>
                  onFieldChange({
                    resumeMode: "upload",
                    error: "",
                  })
                }
              />
              Upload PDF or DOCX
            </label>
          </div>

          <div className="mt-3">
            <input
              type="file"
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              disabled={composer.resumeMode !== "upload"}
              onChange={(event) => {
                const file = event.target.files?.[0] || null;
                if (file && !isSupportedResumeFile(file)) {
                  onFieldChange({
                    resumeFile: null,
                    resumeLabel: DEFAULT_RESUME_LABEL,
                    resumeMode: "upload",
                    error: "Resume must be a PDF or DOCX file.",
                  });
                  event.target.value = "";
                  return;
                }

                onFieldChange({
                  resumeFile: file,
                  resumeLabel: file?.name || DEFAULT_RESUME_LABEL,
                  resumeMode: file ? "upload" : composer.resumeMode,
                  error: "",
                });
              }}
              className="block w-full rounded-[1.35rem] border border-white/60 bg-white/88 px-4 py-3 text-sm text-slate-600 outline-none transition file:mr-4 file:rounded-full file:border-0 file:bg-[#24352f] file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-[#18241f] disabled:cursor-not-allowed disabled:opacity-70"
            />
            <p className="mt-2 text-xs text-slate-500">
              {composer.resumeMode === "upload"
                ? composer.resumeFile?.name || "Choose a PDF or DOCX resume file."
                : `Bundled file will be attached: ${BUNDLED_RESUME_FILENAME}`}
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-[1.35rem] border border-cyan-200/80 bg-cyan-50/80 px-4 py-3 text-sm text-cyan-900">
          Status changes to <span className="font-semibold">Sent</span> only after SMTP succeeds.
        </div>

        {composer.error ? (
          <div className="mt-4 rounded-[1.35rem] border border-rose-200/80 bg-rose-50/85 px-4 py-3 text-sm text-rose-700">
            {composer.error}
          </div>
        ) : null}

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            onClick={onClose}
            className="rounded-[1.25rem] border border-white/70 bg-white/82 px-4 py-3 text-sm font-semibold text-slate-700 transition duration-200 hover:-translate-y-0.5 hover:bg-white"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={composer.phase === "sending"}
            className="rounded-[1.25rem] bg-[#24352f] px-4 py-3 text-sm font-semibold text-white shadow-[0_16px_36px_-24px_rgba(17,24,39,0.72)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#18241f] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
          >
            {composer.phase === "sending" ? "Sending..." : "Send via SMTP"}
          </button>
        </div>
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

function InsightStrip({ counts, responseMetrics, routeMetrics }) {
  const items = [
    {
      label: "Email-ready queue",
      value: routeMetrics.actionableEmailQueue,
      tone: "text-emerald-700",
      caption: "Companies with direct email routes that are not marked sent or closed yet.",
    },
    {
      label: "Portal only",
      value: routeMetrics.portalOnly,
      tone: "text-cyan-700",
      caption: "Companies that still need the official portal flow instead of email outreach.",
    },
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
    <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
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

function CompanyTable({
  companies,
  onStatusChange,
  onAppliedDateChange,
  onNotesChange,
  onCopyEmail,
  onCopyDraftSubject,
  onCopyDraftBody,
  onOpenSmtpComposer,
}) {
  return (
    <div className="mt-6 hidden overflow-hidden rounded-[1.9rem] border border-white/70 bg-white/72 shadow-[0_28px_70px_-48px_rgba(15,23,42,0.52)] xl:block">
      <div className="max-h-[72vh] overflow-auto">
        <table className="w-full min-w-[1540px] border-collapse text-left text-sm">
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
                  <EmailList emails={company.emails} onCopyEmail={onCopyEmail} />
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
                <td className="min-w-[20rem] px-4 py-5">
                  <StatusEditor
                    company={company}
                    onStatusChange={onStatusChange}
                    onAppliedDateChange={onAppliedDateChange}
                    onNotesChange={onNotesChange}
                  />
                </td>
                <td className="px-4 py-5">
                  <LinkStack
                    company={company}
                    onCopyDraftSubject={onCopyDraftSubject}
                    onCopyDraftBody={onCopyDraftBody}
                    onOpenSmtpComposer={onOpenSmtpComposer}
                  />
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

function CompanyCards({
  companies,
  onStatusChange,
  onAppliedDateChange,
  onNotesChange,
  onCopyEmail,
  onCopyDraftSubject,
  onCopyDraftBody,
  onOpenSmtpComposer,
}) {
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
              <EmailList emails={company.emails} onCopyEmail={onCopyEmail} />
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
            <StatusEditor
              company={company}
              onStatusChange={onStatusChange}
              onAppliedDateChange={onAppliedDateChange}
              onNotesChange={onNotesChange}
            />
          </div>

          <div className="mt-4">
            <LinkStack
              company={company}
              onCopyDraftSubject={onCopyDraftSubject}
              onCopyDraftBody={onCopyDraftBody}
              onOpenSmtpComposer={onOpenSmtpComposer}
            />
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
  const routeLabel = getRouteLabel(company);

  return (
    <div className={compact ? "space-y-3 text-sm" : "space-y-3"}>
      <MiniDetail label="Applied" value={company.appliedDate ? formatDate(company.appliedDate) : "Not sent yet"} />
      <div className="flex flex-wrap gap-2">
        <MetaPill>{company.emails.length ? `${company.emails.length} contact${company.emails.length > 1 ? "s" : ""}` : "No email found"}</MetaPill>
        <MetaPill>{routeLabel}</MetaPill>
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

function StatusEditor({ company, onStatusChange, onAppliedDateChange, onNotesChange }) {
  return (
    <div className="space-y-3">
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

      <label className="block">
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
          Applied date
        </span>
        <input
          type="date"
          value={company.appliedDate || ""}
          onChange={(event) => onAppliedDateChange(company.id, event.target.value)}
          className="mt-2 w-full rounded-[1rem] border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-300 focus:ring-4 focus:ring-slate-200"
        />
      </label>

      <label className="block">
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Notes</span>
        <textarea
          rows={3}
          value={company.notes || ""}
          onChange={(event) => onNotesChange(company.id, event.target.value)}
          placeholder="Add source links, recruiter context, or follow-up details..."
          className="mt-2 w-full rounded-[1rem] border border-slate-200 bg-white px-3 py-2 text-sm leading-6 outline-none focus:border-slate-300 focus:ring-4 focus:ring-slate-200"
        />
      </label>
    </div>
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

function LinkStack({
  company,
  onCopyDraftSubject,
  onCopyDraftBody,
  onOpenSmtpComposer,
}) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <ExternalLink href={company.website} label="Website" />
        <ExternalLink href={company.linkedin} label="LinkedIn" />
      </div>
      <DraftActions
        company={company}
        onCopyDraftSubject={onCopyDraftSubject}
        onCopyDraftBody={onCopyDraftBody}
        onOpenSmtpComposer={onOpenSmtpComposer}
      />
    </div>
  );
}

function DraftActions({
  company,
  onCopyDraftSubject,
  onCopyDraftBody,
  onOpenSmtpComposer,
}) {
  return (
    <div className="space-y-2">
      {!company.emails.length ? (
        <p className="text-xs leading-5 text-slate-400">
          No direct email route is saved yet. You can still send if you add a recipient manually.
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {company.emails.length ? (
          <a
            href={getMailtoHref(company)}
            className="rounded-full border border-[#cfe0d7] bg-[#edf3ef] px-3 py-1.5 text-xs font-bold text-[#355246] transition duration-200 hover:-translate-y-0.5 hover:bg-[#e5efe8]"
          >
            Compose Draft
          </a>
        ) : null}
        <button
          type="button"
          onClick={() => onOpenSmtpComposer?.(company)}
          className="rounded-full border border-[#cfe0d7] bg-[#24352f] px-3 py-1.5 text-xs font-bold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-[#18241f]"
        >
          Send via SMTP
        </button>
        <button
          type="button"
          onClick={() => onCopyDraftSubject?.(company)}
          className="rounded-full border border-[#cfe0d7] bg-white px-3 py-1.5 text-xs font-bold text-[#355246] transition duration-200 hover:-translate-y-0.5 hover:bg-[#eff5f1]"
        >
          Copy Subject
        </button>
        <button
          type="button"
          onClick={() => onCopyDraftBody?.(company)}
          className="rounded-full border border-[#cfe0d7] bg-white px-3 py-1.5 text-xs font-bold text-[#355246] transition duration-200 hover:-translate-y-0.5 hover:bg-[#eff5f1]"
        >
          Copy Draft
        </button>
      </div>
      <p className="text-[11px] leading-5 text-slate-500">
        Bundled resume: <span className="font-semibold">{RESUME_ATTACHMENT_PATH}</span>
      </p>
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

function EmailList({ emails, onCopyEmail }) {
  if (!emails.length) return null;

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {emails.map((email) => (
        <span key={email} className="inline-flex items-center gap-1 rounded-full bg-[#edf3ef] pr-1">
          <a
            href={`mailto:${email}`}
            className="rounded-full px-3 py-1 text-xs font-semibold text-[#355246] transition duration-200 hover:-translate-y-0.5"
          >
            {email}
          </a>
          <button
            onClick={() => onCopyEmail?.(email)}
            type="button"
            className="rounded-full border border-[#cfe0d7] bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#355246] hover:bg-[#eff5f1]"
          >
            Copy
          </button>
        </span>
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
