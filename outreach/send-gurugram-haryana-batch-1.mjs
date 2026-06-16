import fs from "node:fs/promises";
import "dotenv/config";
import { sendApplicationEmail } from "../server/emailService.js";

const today = () => new Date().toISOString().slice(0, 10);
const logFile = `outreach/gurugram-haryana-batch-1-send-${today()}.json`;
const tableFile = `outreach/gurugram-haryana-batch-1-research-${today()}.md`;

const researchRows = [
  {
    company: "Cvent",
    location: "Gurugram",
    website: "https://www.cvent.com",
    careers: "https://careers.cvent.com/careers-home/jobs",
    sourceUrl: "https://careers.cvent.com/jobs/9835?lang=en-us",
    confidence: "High apply link",
    notes:
      "Official careers page lists Gurugram roles; no public application inbox was found. Worth applying via portal.",
  },
  {
    company: "Gartner",
    location: "Gurugram",
    website: "https://www.gartner.com",
    careers: "https://jobs.gartner.com/locations/gurgaon/",
    otherEmail: "ApplicantAccommodations@gartner.com",
    sourceUrl: "https://jobs.gartner.com/locations/gurgaon/",
    confidence: "High apply link",
    notes:
      "Official Gurgaon jobs page has software roles; accommodation email is not an application route. Worth applying via portal.",
  },
  {
    company: "Sprinklr",
    location: "Gurugram",
    website: "https://www.sprinklr.com",
    careers: "https://www.sprinklr.com/careers/",
    sourceUrl: "https://www.sprinklr.com/careers/find-your-team/",
    confidence: "High apply link",
    notes: "Official careers page confirms Gurgaon office and jobs route; no public application email found.",
  },
  {
    company: "Nagarro",
    location: "Gurugram",
    website: "https://www.nagarro.com",
    careers: "https://www.nagarro.com/en/careers",
    otherEmail: "info.in@nagarro.com",
    sourceUrl: "https://www.nagarro.com/en/contact-us",
    confidence: "Medium",
    notes: "Official contact page lists India contact email; careers page is preferred for applying.",
  },
  {
    company: "Publicis Sapient",
    location: "Gurugram",
    website: "https://www.publicissapient.com",
    careers: "https://careers.publicissapient.com/locations/india",
    sourceUrl: "https://careers.publicissapient.com/locations/india",
    confidence: "High apply link",
    notes: "Official India careers page routes candidates to job search; no public application inbox found.",
  },
  {
    company: "Xebia",
    location: "Gurugram",
    website: "https://xebia.com",
    careers: "https://xebia.com/careers/",
    sourceUrl: "https://xebia.com/careers/",
    confidence: "High apply link",
    notes: "Official careers page lists open positions; no public application email confirmed.",
  },
  {
    company: "Daffodil Software",
    location: "Gurugram",
    website: "https://www.daffodilsw.com",
    careers: "https://www.daffodilsw.com/",
    otherEmail: "info@daffodilsw.com",
    sourceUrl: "https://www.daffodilsw.com/locations/",
    confidence: "Medium",
    notes: "Official locations/contact page lists info@daffodilsw.com and Gurugram office.",
  },
  {
    company: "Damco Solutions",
    location: "Faridabad / Haryana",
    website: "https://www.damcogroup.com",
    careers: "https://www.damcogroup.com/careers",
    careerEmail: "career@damcogroup.com",
    otherEmail: "info@damcogroup.com",
    sourceUrl: "https://www.damcogroup.com/careers",
    confidence: "High",
    notes:
      "Official careers page says to email applications to career@damcogroup.com. Already sent in earlier project history.",
  },
  {
    company: "OrangeMantra",
    location: "Gurugram",
    website: "https://www.orangemantra.com",
    careerEmail: "resume@orangemantra.in",
    sourceUrl: "Local prior verified outreach notes from official company posts/site",
    confidence: "High",
    notes: "Already sent in earlier project history.",
  },
  {
    company: "ValueCoders",
    location: "Gurugram / Haryana",
    website: "https://www.valuecoders.com",
    careers: "https://www.valuecoders.com/careers",
    careerEmail: "careers@valuecoders.com",
    otherEmail: "hello@valuecoders.com",
    sourceUrl: "https://www.valuecoders.com/contact",
    confidence: "Medium",
    notes: "Official contact page lists hello@valuecoders.com; prior project history shows sent.",
  },
  {
    company: "Oodles Technologies",
    location: "Gurugram",
    website: "https://www.oodles.com",
    careers: "https://careers.oodles.io/",
    sourceUrl: "https://careers.oodles.io/",
    confidence: "High apply link",
    notes: "Official careers portal lists current openings; no public application email confirmed.",
  },
  {
    company: "Classic Informatics",
    location: "Gurugram / Haryana",
    website: "https://www.classicinformatics.com",
    careers: "https://www.classicinformatics.com/Careers/",
    otherEmail: "hello@classicinformatics.com",
    sourceUrl: "https://www.classicinformatics.com/Careers/",
    confidence: "Medium",
    notes: "Official careers page lists Gurugram HQ and hello@classicinformatics.com.",
  },
  {
    company: "Dean Infotech",
    location: "Faridabad / Haryana",
    website: "https://www.deaninfotech.com",
    otherEmail: "marketing@deaninfotech.com",
    sourceUrl: "https://www.plumint.com/dean-infotech-16871/contact/",
    confidence: "Low",
    notes: "Third-party directory lists marketing email; no official HR/careers inbox found.",
  },
  {
    company: "mTraction Enterprise / Affle mE",
    location: "Gurugram / Haryana",
    website: "https://www.mtractionenterprise.com",
    careers: "https://affle.com/career",
    otherEmail: "enterprise@affle.com",
    sourceUrl: "https://www.mtractionenterprise.com/about-us",
    confidence: "Medium",
    notes: "Official company page lists enterprise@affle.com for Gurugram.",
  },
  {
    company: "CIGNEX",
    location: "Gurugram / Haryana",
    website: "https://www.cignex.com",
    careers: "https://www.cignex.com/company/careers",
    sourceUrl: "https://www.cignex.com/company/careers",
    confidence: "High apply link",
    notes: "Official careers page has Apply Now; no public application email found.",
  },
  {
    company: "Programming.com",
    location: "Gurugram / Haryana",
    website: "https://programming.com",
    careers: "https://programming.com/careers",
    sourceUrl: "https://programming.com/careers",
    confidence: "High apply link",
    notes: "Official careers page lists Gurugram roles; no public email found.",
  },
  {
    company: "BigStep Technologies",
    location: "Gurugram",
    website: "https://www.bigsteptech.com",
    hrEmail: "hr@bigsteptech.com",
    sourceUrl:
      "https://pce.poornima.org/NAAC/Re-DVV/5/5.2.1/5.2.1.2%28b%29/2020-21/98_Praveen%20Kumar%20Dakua.pdf",
    confidence: "Medium",
    notes: "Public placement PDF lists hr@bigsteptech.com.",
  },
  {
    company: "Squareboat",
    location: "Gurugram",
    website: "https://www.squareboat.com",
    careers: "https://www.squareboat.com/careers",
    otherEmail: "hi@squareboat.com",
    sourceUrl: "https://www.squareboat.com/contact",
    confidence: "Medium",
    notes: "Official contact page lists hi@squareboat.com; careers page has engineering roles.",
  },
  {
    company: "Ezeiatech Systems",
    location: "Gurugram",
    website: "https://ezeiatech.com",
    careers: "https://ezeiatech.com/careers/",
    otherEmail: "sales@ezeiatech.com",
    sourceUrl: "https://ezeiatech.com/careers/",
    confidence: "Medium",
    notes: "Official careers page lists ReactJS, Angular, and Frontend roles; public email is general sales.",
  },
  {
    company: "VAYUZ Technologies",
    location: "Gurugram",
    website: "https://www.vayuz.com",
    careers: "https://www.vayuz.com/jobs/",
    sourceUrl: "https://www.vayuz.com/jobs/",
    confidence: "High apply link",
    notes: "Official jobs page exists; no readable email confirmed.",
  },
];

const sentCandidates = [
  {
    company: "Daffodil Software",
    role: "Frontend / React / Full-Stack Developer",
    recipients: "info@daffodilsw.com",
    reason: "official general contact; no HR email found",
  },
  {
    company: "Classic Informatics",
    role: "Frontend / React / Full-Stack Developer",
    recipients: "hello@classicinformatics.com",
    reason: "official careers/contact email",
  },
  {
    company: "mTraction Enterprise / Affle mE",
    role: "Frontend / Full-Stack Developer",
    recipients: "enterprise@affle.com",
    reason: "official Gurugram contact email",
  },
  {
    company: "BigStep Technologies",
    role: "Backend / Full-Stack Developer",
    recipients: "hr@bigsteptech.com",
    reason: "public HR email in placement document",
  },
  {
    company: "Squareboat",
    role: "Frontend / Full-Stack Developer",
    recipients: "hi@squareboat.com",
    reason: "official general contact; careers page has engineering roles",
  },
  {
    company: "Ezeiatech Systems",
    role: "ReactJS / Frontend Developer",
    recipients: "sales@ezeiatech.com",
    reason: "official careers page lists ReactJS/frontend roles; only public email is general sales",
  },
];

const focusForRole = (role) => {
  const value = role.toLowerCase();
  if (value.includes("backend")) {
    return "Node.js APIs, database-backed services, backend integrations, and practical full-stack delivery";
  }
  if (value.includes("react")) {
    return "React, JavaScript/TypeScript, Tailwind CSS, responsive UI, and API-driven frontend development";
  }
  return "React, Next.js, Node.js, APIs, databases, and practical full-stack product development";
};

const bodyFor = ({ company, role, reason }) => {
  const focus = focusForRole(role);
  const applicationLine = `I am reaching out to explore ${role} opportunities at ${company}. I found your ${reason}, and my experience aligns well with ${focus}.`;

  return [
    `Hi ${company} Hiring Team,`,
    "",
    "I am Adarsh Pathania, a Full-Stack Developer based in Mohali with hands-on experience in React, Next.js, TypeScript, Node.js, Prisma, PostgreSQL/MongoDB, Tailwind CSS, and API-driven web applications.",
    "",
    applicationLine,
    "",
    "In recent work, I have built responsive interfaces, connected frontend systems with backend APIs, and shipped practical features with attention to clean execution, maintainability, and user experience.",
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
      : row.careerEmail || row.hrEmail || row.otherEmail
        ? "not selected due to lower confidence or non-application route"
        : "apply link only / no public email confirmed",
  }));

const markdown = [
  "# Gurugram/Haryana Batch 1 Research",
  "",
  "| Company | Location | Website | Careers Page | HR Email | Career Email | Other Contact Email | Source URL | Confidence | Notes |",
  "|---|---|---|---|---|---|---|---|---|---|",
  ...researchRows.map((row) =>
    `| ${row.company} | ${row.location} | ${row.website || ""} | ${row.careers || ""} | ${
      row.hrEmail || "Not found"
    } | ${row.careerEmail || "Not found"} | ${row.otherEmail || "Not found"} | ${row.sourceUrl} | ${
      row.confidence
    } | ${row.notes} |`,
  ),
  "",
].join("\n");

const log = {
  generatedAt: new Date().toISOString(),
  scope: "First 20 Gurugram/Haryana companies from user list",
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
