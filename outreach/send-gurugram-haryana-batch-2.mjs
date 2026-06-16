import fs from "node:fs/promises";
import "dotenv/config";
import { sendApplicationEmail } from "../server/emailService.js";

const today = () => new Date().toISOString().slice(0, 10);
const logFile = `outreach/gurugram-haryana-batch-2-send-${today()}.json`;
const tableFile = `outreach/gurugram-haryana-batch-2-research-${today()}.md`;

const researchRows = [
  {
    company: "Snapmint",
    location: "Gurugram",
    website: "https://snapmint.com",
    careers: "https://snapmint.com/careers",
    hrEmail: "hr@snapmint.com",
    sourceUrl: "https://snapmint.com/careers",
    confidence: "High",
    currentRole: "Development / testing teams mentioned; careers page has current openings",
    applyLink: "https://snapmint.com/careers",
    linkedin: "https://www.linkedin.com/company/snapmint/",
    companySize: "Unknown",
    worthApplying: "Yes",
    notes: "Official careers page asks candidates to send resumes to hr@snapmint.com; MX verified.",
  },
  {
    company: "Wishlink",
    location: "Gurugram",
    website: "https://www.wishlink.com",
    careers: "https://jobs.pyjamahr.com/wishlink",
    careerEmail: "careers@wishlink.com",
    sourceUrl: "https://jobs.pyjamahr.com/wishlink",
    confidence: "High",
    currentRole: "Public job boards show active Gurugram hiring; frontend role appeared on Instahyre listing",
    applyLink: "https://jobs.pyjamahr.com/wishlink",
    linkedin: "https://www.linkedin.com/company/wishlink/",
    companySize: "Unknown",
    worthApplying: "Yes",
    notes: "Public Wishlink PyjamaHR careers page lists careers@wishlink.com; MX verified.",
  },
  {
    company: "Bellurbis",
    location: "Gurugram",
    website: "https://bellurbis.com",
    careers: "https://bellurbis.com/career/",
    otherEmail: "info@bellurbis.com",
    sourceUrl: "https://bellurbis.com/contact-us/",
    confidence: "Medium",
    currentRole: "MERN Stack Developer from user list; official public hiring email not found",
    applyLink: "https://bellurbis.com/contact-us/",
    linkedin: "https://www.linkedin.com/company/bellurbis/",
    companySize: "Unknown",
    worthApplying: "Yes, but general-contact route only",
    notes: "Official contact page lists info@bellurbis.com and Gurugram office; no HR/career inbox confirmed; MX verified.",
  },
  {
    company: "Anaplan",
    location: "Gurugram",
    website: "https://www.anaplan.com",
    careers: "https://www.anaplan.com/careers/",
    sourceUrl: "https://job-boards.greenhouse.io/anaplan/jobs/8533410002",
    confidence: "High apply link",
    currentRole: "Senior Software Engineer - Fullstack, Software Engineer, Associate Software Engineer",
    applyLink: "https://www.anaplan.com/careers/",
    linkedin: "https://www.linkedin.com/company/anaplan/",
    companySize: "2,000+",
    worthApplying: "Yes via portal",
    notes: "Official/Greenhouse application route exists for Gurugram software roles; no public application inbox found.",
  },
  {
    company: "McKinsey & Company",
    location: "Gurugram",
    website: "https://www.mckinsey.com",
    careers: "https://www.mckinsey.com/careers/search-jobs/jobs",
    sourceUrl: "https://www.mckinsey.com/careers/search-jobs/jobs",
    confidence: "High apply link",
    currentRole: "Technology roles vary by official job search",
    applyLink: "https://www.mckinsey.com/careers/search-jobs/jobs",
    linkedin: "https://www.linkedin.com/company/mckinsey/",
    companySize: "10,000+",
    worthApplying: "Yes via portal",
    notes: "Official careers search is the safe application route; no public HR/career inbox found.",
  },
  {
    company: "Bain & Company",
    location: "Gurugram",
    website: "https://www.bain.com",
    careers: "https://www.bain.com/careers/",
    sourceUrl: "https://www.bain.com/careers/",
    confidence: "High apply link",
    currentRole: "Technology and analytics roles vary by official job search",
    applyLink: "https://www.bain.com/careers/",
    linkedin: "https://www.linkedin.com/company/bain-and-company/",
    companySize: "10,000+",
    worthApplying: "Yes via portal",
    notes: "Official careers route found; no public application inbox found.",
  },
  {
    company: "PayPay India",
    location: "Gurugram",
    website: "https://www.paypay.ne.jp",
    careers: "https://in.linkedin.com/company/paypayindia/jobs",
    sourceUrl: "https://in.linkedin.com/company/paypayindia/jobs",
    confidence: "Medium apply link",
    currentRole: "Backend Engineer, Senior Backend Engineer, Engineering Manager - Java",
    applyLink: "https://in.linkedin.com/company/paypayindia/jobs",
    linkedin: "https://in.linkedin.com/company/paypayindia",
    companySize: "150+ on LinkedIn page snapshot",
    worthApplying: "Yes via LinkedIn/portal",
    notes: "LinkedIn company jobs page shows active Gurugram engineering roles; no public application inbox confirmed.",
  },
  {
    company: "Handysolver",
    location: "Gurugram",
    website: "https://handysolver.com",
    careers: "https://handysolver.com/career.html",
    sourceUrl: "https://handysolver.com/career.html",
    confidence: "High apply link",
    currentRole: "React JS Developer, AI Systems Engineer, Full Stack Developer listings on public job board",
    applyLink: "https://handysolver.com/career.html",
    linkedin: "https://www.linkedin.com/company/handysolver/",
    companySize: "Unknown",
    worthApplying: "Yes via form",
    notes: "Official careers page provides an application form with CV upload; no public application inbox found.",
  },
  {
    company: "Collaboard",
    location: "Gurugram",
    website: "https://www.collaboard.app",
    careers: "https://www.collaboard.app/careers",
    sourceUrl: "https://www.collaboard.app/careers",
    confidence: "Low",
    currentRole: "Not found",
    applyLink: "https://www.collaboard.app/careers",
    linkedin: "https://www.linkedin.com/company/collaboard/",
    companySize: "Unknown",
    worthApplying: "Limited",
    notes: "No safe public HR/career email or clearly relevant Gurugram developer opening confirmed.",
  },
  {
    company: "HashStudioz",
    location: "Gurugram / NCR",
    website: "https://www.hashstudioz.com",
    careers: "https://www.hashstudioz.com/career.html",
    hrEmail: "hr@hashstudioz.com",
    sourceUrl: "Local tracker history and official careers source from prior outreach",
    confidence: "High",
    currentRole: "Software development roles from prior tracker",
    applyLink: "https://www.hashstudioz.com/career.html",
    linkedin: "https://www.linkedin.com/company/hashstudioz-technologies/",
    companySize: "Unknown",
    worthApplying: "Already applied",
    notes: "Already sent earlier from tracker history; skipped to avoid duplicate outreach.",
  },
  {
    company: "MSM Unify",
    location: "Gurugram",
    website: "https://www.msmunify.com",
    careers: "https://www.msmunify.com/contact-us/",
    careerEmail: "careers@msquaremedia.com",
    otherEmail: "support@msmunify.com",
    sourceUrl: "https://www.timesjobs.com/timesjobs/msquaremedia/",
    confidence: "Medium",
    currentRole: "Frontend Developer listed publicly for Gurugram on Indeed snapshot",
    applyLink: "https://www.msmunify.com/contact-us/",
    linkedin: "https://www.linkedin.com/company/msm-unify/",
    companySize: "Unknown",
    worthApplying: "Yes",
    notes: "Public M Square Media careers listing shows careers@msquaremedia.com; official MSM Unify contact page lists support@msmunify.com and Gurugram office; MX verified.",
  },
  {
    company: "Big Digital Technologies",
    location: "Gurugram",
    website: "Unknown",
    careers: "https://www.glassdoor.com/job-listing/full-stack-developer-nestjs-react-big-digital-technologies-pvt-ltd-JV_IC2921225_KO0,33_KE34,66.htm",
    sourceUrl: "https://www.glassdoor.com/job-listing/full-stack-developer-nestjs-react-big-digital-technologies-pvt-ltd-JV_IC2921225_KO0,33_KE34,66.htm",
    confidence: "Medium apply link",
    currentRole: "Full Stack Developer (NestJS + React), 0-2 years",
    applyLink: "Glassdoor listing / WhatsApp route only",
    linkedin: "",
    companySize: "Unknown",
    worthApplying: "Yes, but no email",
    notes: "Public listing is highly relevant for freshers, but only WhatsApp/application route was visible; no public email confirmed.",
  },
  {
    company: "VML Enterprise Solutions",
    location: "Gurugram",
    website: "https://www.vml.com",
    careers: "https://www.vml.com/careers",
    sourceUrl: "https://www.vml.com/careers",
    confidence: "High apply link",
    currentRole: "Roles vary by official VML careers search",
    applyLink: "https://www.vml.com/careers",
    linkedin: "https://www.linkedin.com/company/vml/",
    companySize: "10,000+",
    worthApplying: "Yes via portal",
    notes: "Official careers route found; no public application inbox confirmed.",
  },
  {
    company: "One Impression",
    location: "Gurugram",
    website: "https://oneimpression.io",
    careers: "https://builtin.com/company/one-impression",
    otherEmail: "support@oneimpression.io",
    sourceUrl: "https://builtin.com/company/one-impression",
    confidence: "Medium",
    currentRole: "Public listings currently show finance/growth/research roles, not junior React/full-stack",
    applyLink: "https://builtin.com/company/one-impression",
    linkedin: "https://www.linkedin.com/company/one-impression/",
    companySize: "106 employees in Built In snapshot",
    worthApplying: "Limited for junior React right now",
    notes: "Public source lists support email and Gurugram office; no HR/career inbox or relevant developer role confirmed.",
  },
  {
    company: "Zed-Axis Technologies",
    location: "Gurugram",
    website: "https://zedaxis.com",
    careers: "https://zedaxis.com/contact-us/",
    hrEmail: "hr@zed-axis.com",
    otherEmail: "contact@zed-axis.com",
    sourceUrl: "https://zedaxis.com/contact-us/",
    confidence: "High",
    currentRole: "BI / mobility / data-management software company; role fit for backend/full-stack",
    applyLink: "https://zedaxis.com/contact-us/",
    linkedin: "https://www.linkedin.com/company/zed-axis-technologies/",
    companySize: "Unknown",
    worthApplying: "Yes",
    notes: "Official contact page labels hr@zed-axis.com as Career Contact; MX verified.",
  },
  {
    company: "Shunya Ekai Technologies",
    location: "Gurugram",
    website: "https://shunyaekai.tech",
    careers: "https://shunyaekai.tech/career.html",
    hrEmail: "hr@shunyaekai.tech",
    sourceUrl: "https://in.linkedin.com/company/shunyaekaitech",
    confidence: "High",
    currentRole: "MERN Stack Developer, React Native Developer, Full Stack Developer, Frontend Developer",
    applyLink: "https://shunyaekai.tech/career.html",
    linkedin: "https://in.linkedin.com/company/shunyaekaitech",
    companySize: "11-50 employees",
    worthApplying: "Yes",
    notes: "Official careers page lists relevant developer roles; LinkedIn public hiring post gives hr@shunyaekai.tech; MX verified.",
  },
  {
    company: "KMG Infotech / Key Management Group",
    location: "Gurugram",
    website: "https://kmgus.com",
    careers: "https://kmgus.com/careers/",
    otherEmail: "sales@kmgus.com",
    sourceUrl: "https://kmgus.com/careers/",
    confidence: "High apply link",
    currentRole: "Trainee Engineer, Engineer (Angular), React Native Developer, MERN Senior Engineer/Lead, Full Stack (.Net & Angular)",
    applyLink: "https://kmgus.com/careers/",
    linkedin: "https://www.linkedin.com/company/key-management-group-inc/",
    companySize: "Unknown",
    worthApplying: "Yes via form",
    notes: "Official careers page lists several Gurgaon roles with Apply Now forms; sales email is not a hiring inbox, so skipped email send.",
  },
  {
    company: "Essence Software Solutions",
    location: "Gurugram",
    website: "https://essencesoftwares.com",
    careers: "https://essencesoftwares.com/contact/",
    otherEmail: "contact@essencesoftwares.com",
    sourceUrl: "https://essencesoftwares.com/contact/",
    confidence: "Medium",
    currentRole: "LinkedIn public update shows hiring; official site is software/web/app development focused",
    applyLink: "https://essencesoftwares.com/contact/",
    linkedin: "https://in.linkedin.com/company/essence-software-solutions",
    companySize: "11-50 employees",
    worthApplying: "Yes, but general-contact route only",
    notes: "Official contact page lists contact@essencesoftwares.com and Gurugram office; MX verified.",
  },
  {
    company: "SyanSoft",
    location: "Gurugram",
    website: "https://www.syansoft.com",
    careers: "https://www.syansoft.com/career/",
    otherEmail: "contact@syansoft.com",
    sourceUrl: "https://www.syansoft.com/",
    confidence: "Medium",
    currentRole: "Angular Developer, Python Developer, Java Spring Boot, Manual Test Engineer",
    applyLink: "https://www.syansoft.com/career/",
    linkedin: "https://www.linkedin.com/company/syansoft-technologies-private-limited/",
    companySize: "150+ claimed on site",
    worthApplying: "Yes",
    notes: "Official site lists contact@syansoft.com and career page lists software roles; MX verified.",
  },
  {
    company: "Technoarch",
    location: "Haryana / NCR",
    website: "https://www.technoarchsoftwares.com",
    careers: "https://www.technoarchsoftwares.com/career/",
    sourceUrl: "https://www.technoarchsoftwares.com/career/",
    confidence: "High apply link",
    currentRole: "React JS Developer, Angular JS Developer, Python Developer",
    applyLink: "https://www.technoarchsoftwares.com/career/",
    linkedin: "https://www.linkedin.com/company/technoarch-softwares/",
    companySize: "Unknown",
    worthApplying: "Yes via portal",
    notes: "Official careers page lists relevant React/Angular/Python openings; no public application inbox confirmed.",
  },
];

const sentCandidates = [
  {
    company: "Snapmint",
    role: "Frontend / React / Full-Stack Developer",
    recipients: "hr@snapmint.com",
    reason: "official careers page application email",
    companyContext: "Snapmint's credit/EMI product needs reliable user-facing product flows and clean engineering execution",
  },
  {
    company: "Wishlink",
    role: "Frontend / React / Full-Stack Developer",
    recipients: "careers@wishlink.com",
    reason: "public careers page contact email",
    companyContext: "Wishlink operates at the intersection of creator commerce and e-commerce, where responsive UI and scalable product features matter",
  },
  {
    company: "Bellurbis",
    role: "MERN Stack / Full-Stack Developer",
    recipients: "info@bellurbis.com",
    reason: "official general contact email; no HR inbox found",
    companyContext: "Bellurbis builds digital products across web and mobile, which aligns with practical MERN/full-stack project delivery",
  },
  {
    company: "MSM Unify",
    role: "Frontend / Full-Stack Developer",
    recipients: "careers@msquaremedia.com",
    reason: "public careers email for M Square Media/MSM",
    companyContext: "MSM Unify's education marketplace and student platform work benefits from clear frontend flows and dependable API integrations",
  },
  {
    company: "Zed-Axis Technologies",
    role: "Backend / Full-Stack Developer",
    recipients: "hr@zed-axis.com",
    reason: "official Career Contact email",
    companyContext: "Zed-Axis focuses on BI, mobility, distribution, and service-management software where backend services and data-driven interfaces are important",
  },
  {
    company: "Shunya Ekai Technologies",
    role: "MERN Stack / Frontend / Full-Stack Developer",
    recipients: "hr@shunyaekai.tech",
    reason: "public LinkedIn hiring email and official careers roles",
    companyContext: "Shunya Ekai's IoT, robotics, and software products need modern dashboards, web apps, and integrations",
  },
  {
    company: "Essence Software Solutions",
    role: "Frontend / Web / Full-Stack Developer",
    recipients: "contact@essencesoftwares.com",
    reason: "official general contact email; no HR inbox found",
    companyContext: "Essence Software Solutions works across web, app, IoT, and startup consulting projects where broad full-stack execution is useful",
  },
  {
    company: "SyanSoft",
    role: "Frontend / Backend / Full-Stack Developer",
    recipients: "contact@syansoft.com",
    reason: "official contact email and software careers page",
    companyContext: "SyanSoft's custom software and staff-augmentation work aligns with React, Node.js, API, and database-backed delivery",
  },
];

const focusForRole = (role) => {
  const value = role.toLowerCase();
  if (value.includes("backend")) {
    return "Node.js APIs, database-backed services, integrations, and practical full-stack delivery";
  }
  if (value.includes("mern")) {
    return "MongoDB/SQL-backed APIs, React interfaces, Node.js services, and end-to-end feature delivery";
  }
  if (value.includes("frontend") || value.includes("react")) {
    return "React, JavaScript/TypeScript, Tailwind CSS, responsive UI, and API-driven frontend development";
  }
  return "React, Next.js, Node.js, APIs, databases, and practical full-stack product development";
};

const bodyFor = ({ company, role, reason, companyContext }) => {
  const focus = focusForRole(role);
  const applicationLine = `I am reaching out to explore ${role} opportunities at ${company}. I found your ${reason}, and ${companyContext}.`;

  return [
    `Hi ${company} Hiring Team,`,
    "",
    "I am Adarsh Pathania, a Full-Stack Developer based in Mohali with hands-on experience in React, Next.js, TypeScript, Node.js, Prisma, PostgreSQL/MongoDB, Tailwind CSS, and API-driven web applications.",
    "",
    applicationLine,
    "",
    `My strongest fit is in ${focus}. In recent work, I have built responsive interfaces, connected frontend systems with backend APIs, and shipped practical features with attention to clean execution, maintainability, and user experience.`,
    "",
    "I have attached my resume for your review. If there is a suitable opening, I would appreciate the opportunity to discuss how I can contribute.",
    "",
    "Best regards,",
    "Adarsh Pathania",
    "+91 78890 78854",
    "adarsh.pathania.04@gmail.com",
    "LinkedIn: https://www.linkedin.com/in/adarshpathania04/",
    "GitHub: https://github.com/Adarsh-V1",
  ].join("\n");
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const results = [];

for (const item of sentCandidates) {
  try {
    const result = await sendApplicationEmail({
      recipientEmail: item.recipients,
      subject: `Application for ${item.role} Opportunities - Adarsh Pathania`,
      body: bodyFor(item),
      companyName: item.company,
      targetRole: item.role,
      useBundledResume: true,
    });

    results.push({
      ...item,
      status: "Sent",
      sentDate: today(),
      messageId: result.messageId,
      response: result.response,
      accepted: result.accepted,
      rejected: result.rejected,
      resumeFileName: result.resumeFileName,
    });
    console.log(`SENT ${item.company} -> ${item.recipients}`);
  } catch (error) {
    results.push({
      ...item,
      status: "Failed",
      error: error?.message || "Unknown send failure",
    });
    console.log(`FAILED ${item.company}: ${error?.message || "Unknown send failure"}`);
  }

  await sleep(1200);
}

const skipped = researchRows
  .filter((row) => !sentCandidates.some((item) => item.company === row.company))
  .map((row) => ({
    company: row.company,
    reason: row.notes.includes("Already sent")
      ? "already sent in existing history"
      : row.hrEmail || row.careerEmail || row.otherEmail
        ? "not selected due to portal preference, weak route, or non-relevant current role"
        : "apply link only / no public email confirmed",
  }));

const markdown = [
  "# Gurugram/Haryana Batch 2 Research",
  "",
  "| Company | Location | Website | Careers Page | HR Email | Career Email | Other Contact Email | Current Hiring Role | Apply Link | LinkedIn | Company Size | Worth Applying | Source URL | Confidence | Notes |",
  "|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|",
  ...researchRows.map((row) =>
    `| ${row.company} | ${row.location} | ${row.website || ""} | ${row.careers || ""} | ${
      row.hrEmail || "Not found"
    } | ${row.careerEmail || "Not found"} | ${row.otherEmail || "Not found"} | ${
      row.currentRole || "Not found"
    } | ${row.applyLink || ""} | ${row.linkedin || ""} | ${row.companySize || "Unknown"} | ${
      row.worthApplying || "Unknown"
    } | ${row.sourceUrl} | ${row.confidence} | ${row.notes} |`,
  ),
  "",
].join("\n");

const log = {
  generatedAt: new Date().toISOString(),
  scope: "Companies 21-40 from user-provided Gurugram/Haryana list",
  resumeAttached: "Adarsh_Pathania_resume.pdf",
  sentCount: results.filter((item) => item.status === "Sent").length,
  failedCount: results.filter((item) => item.status === "Failed").length,
  skippedCount: skipped.length,
  results,
  skipped,
};

await fs.writeFile(tableFile, markdown);
await fs.writeFile(logFile, JSON.stringify(log, null, 2));

console.log(
  "SUMMARY",
  JSON.stringify(
    {
      sent: log.sentCount,
      failed: log.failedCount,
      skipped: log.skippedCount,
      tableFile,
      logFile,
    },
    null,
    2,
  ),
);
