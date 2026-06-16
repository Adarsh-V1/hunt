import fs from "node:fs/promises";
import "dotenv/config";
import { sendApplicationEmail } from "../server/emailService.js";

const today = () => new Date().toISOString().slice(0, 10);
const logFile = `outreach/gurugram-haryana-batch-5-send-${today()}.json`;
const tableFile = `outreach/gurugram-haryana-batch-5-research-${today()}.md`;

const researchRows = [
  {
    company: "RenewBuy",
    location: "Gurugram",
    website: "https://www.renewbuy.com",
    careers: "https://www.renewbuy.com/careers",
    sourceUrl: "https://www.renewbuy.com/careers",
    confidence: "High apply link",
    currentRole: "Technology roles vary by official careers page",
    applyLink: "https://www.renewbuy.com/careers",
    linkedin: "https://www.linkedin.com/company/renewbuy/",
    companySize: "1,000+",
    worthApplying: "Yes via portal",
    notes: "Official careers page found; no public HR/career inbox confirmed.",
  },
  {
    company: "Square Yards",
    location: "Gurugram",
    website: "https://www.squareyards.com",
    careers: "https://www.squareyards.com/careers",
    careerEmail: "careers@squareyards.com",
    sourceUrl: "https://www.squareyards.com/careers",
    confidence: "High",
    currentRole: "Engineering, sales-tech, product and real-estate platform roles through official careers page",
    applyLink: "https://www.squareyards.com/careers",
    linkedin: "https://www.linkedin.com/company/square-yards/",
    companySize: "5,000+",
    worthApplying: "Yes",
    notes: "Official careers page lists careers@squareyards.com; MX verified.",
  },
  {
    company: "Magicpin",
    location: "Gurugram",
    website: "https://magicpin.in",
    careers: "https://magicpin.in/jobs/",
    careerEmail: "careers@magicpin.in",
    sourceUrl: "https://www.linkedin.com/company/magicpin/jobs",
    confidence: "Medium",
    currentRole: "Backend Developer - Node.js, UI/UX, business and product roles listed publicly",
    applyLink: "https://magicpin.in/jobs/",
    linkedin: "https://www.linkedin.com/company/magicpin/",
    companySize: "1,000+",
    worthApplying: "Yes",
    notes: "Public careers/jobs references show careers@magicpin.in; MX verified.",
  },
  {
    company: "CARS24 Financial Services",
    location: "Gurugram",
    website: "https://www.cars24.com",
    careers: "https://www.cars24.com/careers/",
    sourceUrl: "https://www.cars24.com/careers/",
    confidence: "High apply link",
    currentRole: "Finance, technology, product and analytics roles via CARS24 careers",
    applyLink: "https://www.cars24.com/careers/",
    linkedin: "https://www.linkedin.com/company/cars24/",
    companySize: "5,000+",
    worthApplying: "Portal only",
    notes: "Covered by CARS24 careers route; local tracker already marked CARS24 portal-only.",
  },
  {
    company: "Fareportal",
    location: "Gurugram",
    website: "https://www.fareportal.com",
    careers: "https://www.fareportal.com/careers/",
    sourceUrl: "https://www.fareportal.com/careers/",
    confidence: "High apply link",
    currentRole: "Data Analyst, technical and travel-tech roles through official careers page",
    applyLink: "https://www.fareportal.com/careers/",
    linkedin: "https://www.linkedin.com/company/fareportal/",
    companySize: "2,000+",
    worthApplying: "Yes via portal",
    notes: "Official careers route found; no public application inbox confirmed.",
  },
  {
    company: "S&P Global",
    location: "Gurugram",
    website: "https://www.spglobal.com",
    careers: "https://www.spglobal.com/en/careers",
    sourceUrl: "https://www.spglobal.com/en/careers",
    confidence: "High apply link",
    currentRole: "Software development, data, analytics and technology roles via official portal",
    applyLink: "https://www.spglobal.com/en/careers",
    linkedin: "https://www.linkedin.com/company/spglobal/",
    companySize: "10,000+",
    worthApplying: "Yes via portal",
    notes: "Official portal preferred; no public application inbox confirmed.",
  },
  {
    company: "Moody’s Analytics",
    location: "Gurugram",
    website: "https://www.moodys.com",
    careers: "https://careers.moodys.com/",
    sourceUrl: "https://careers.moodys.com/",
    confidence: "High apply link",
    currentRole: "Technology, analytics, software engineering and data roles via official portal",
    applyLink: "https://careers.moodys.com/",
    linkedin: "https://www.linkedin.com/company/moodys/",
    companySize: "10,000+",
    worthApplying: "Yes via portal",
    notes: "Official portal found; no public application inbox confirmed.",
  },
  {
    company: "Evalueserve",
    location: "Gurugram",
    website: "https://www.evalueserve.com",
    careers: "https://www.evalueserve.com/careers/",
    careerEmail: "careers@evalueserve.com",
    sourceUrl: "https://www.evalueserve.com/careers/",
    confidence: "High",
    currentRole: "Analyst, technology, data, AI and software roles via official careers page",
    applyLink: "https://www.evalueserve.com/careers/",
    linkedin: "https://www.linkedin.com/company/evalueserve/",
    companySize: "5,000+",
    worthApplying: "Yes",
    notes: "Official careers page/contact route lists careers@evalueserve.com; MX verified.",
  },
  {
    company: "Dunnhumby",
    location: "Gurugram",
    website: "https://www.dunnhumby.com",
    careers: "https://www.dunnhumby.com/careers/",
    sourceUrl: "https://www.dunnhumby.com/careers/",
    confidence: "High apply link",
    currentRole: "Data science, software, analytics and product roles via official careers",
    applyLink: "https://www.dunnhumby.com/careers/",
    linkedin: "https://www.linkedin.com/company/dunnhumby/",
    companySize: "2,000+",
    worthApplying: "Yes via portal",
    notes: "Official careers route found; no public application inbox confirmed.",
  },
  {
    company: "GreyOrange",
    location: "Gurugram",
    website: "https://www.greyorange.com",
    careers: "https://www.greyorange.com/careers/",
    sourceUrl: "https://www.greyorange.com/careers/",
    confidence: "High apply link",
    currentRole: "Robotics, software, cloud, SRE and automation roles via official careers",
    applyLink: "https://www.greyorange.com/careers/",
    linkedin: "https://www.linkedin.com/company/greyorange/",
    companySize: "1,000+",
    worthApplying: "Yes via portal",
    notes: "Official careers route found; no safe public application inbox confirmed.",
  },
  {
    company: "Builder.ai",
    location: "Gurugram / NCR",
    website: "https://www.builder.ai",
    careers: "https://www.builder.ai/careers",
    sourceUrl: "https://www.builder.ai/careers",
    confidence: "Low",
    currentRole: "Not safely actionable",
    applyLink: "https://www.builder.ai/careers",
    linkedin: "https://www.linkedin.com/company/builder-ai/",
    companySize: "Unknown",
    worthApplying: "Limited",
    notes: "Recent public reports indicate major distress/administration issues; no safe public application inbox confirmed.",
  },
  {
    company: "Junglee Games",
    location: "Gurugram",
    website: "https://www.jungleegames.com",
    careers: "https://www.jungleegames.com/careers/",
    hrEmail: "hr@jungleegames.com",
    sourceUrl: "https://www.jungleegames.com/careers/",
    confidence: "Medium",
    currentRole: "Software engineering, product, data, game and platform roles through official careers",
    applyLink: "https://www.jungleegames.com/careers/",
    linkedin: "https://www.linkedin.com/company/junglee-games/",
    companySize: "500+",
    worthApplying: "Yes",
    notes: "Official careers route is preferred; public HR email found in reliable job/placement sources; MX verified.",
  },
  {
    company: "Zupee",
    location: "Gurugram",
    website: "https://www.zupee.com",
    careers: "https://www.zupee.com/careers/",
    sourceUrl: "https://www.zupee.com/careers/",
    confidence: "High apply link",
    currentRole: "SDE, product, analytics, game-tech and platform roles through official jobs page",
    applyLink: "https://www.zupee.com/careers/",
    linkedin: "https://www.linkedin.com/company/zupee/",
    companySize: "500+",
    worthApplying: "Yes via portal",
    notes: "Official careers page found; local tracker already marked Zupee portal-only.",
  },
  {
    company: "WinZO",
    location: "Gurugram",
    website: "https://www.winzogames.com",
    careers: "https://www.winzogames.com/careers",
    sourceUrl: "https://www.winzogames.com/careers",
    confidence: "High apply link",
    currentRole: "Engineering, product, analytics and gaming platform roles through official careers",
    applyLink: "https://www.winzogames.com/careers",
    linkedin: "https://www.linkedin.com/company/winzo-games/",
    companySize: "200+",
    worthApplying: "Yes via portal",
    notes: "Official careers route found; local tracker already marked WinZO portal-only.",
  },
  {
    company: "Netomi",
    location: "Gurugram",
    website: "https://www.netomi.com",
    careers: "https://www.netomi.com/careers",
    sourceUrl: "https://www.netomi.com/careers",
    confidence: "High apply link",
    currentRole: "Software engineer, AI, product, data and platform roles via official careers",
    applyLink: "https://www.netomi.com/careers",
    linkedin: "https://www.linkedin.com/company/netomi/",
    companySize: "200+",
    worthApplying: "Yes via portal",
    notes: "Official careers route found; no public application inbox confirmed.",
  },
  {
    company: "ParallelDots",
    location: "Gurugram",
    website: "https://www.paralleldots.com",
    careers: "https://www.paralleldots.com/careers",
    otherEmail: "contact-demo@paralleldots.com",
    sourceUrl: "https://www.paralleldots.com/contact",
    confidence: "Medium",
    currentRole: "Computer vision, AI and retail-tech roles vary",
    applyLink: "https://www.paralleldots.com/careers",
    linkedin: "https://www.linkedin.com/company/paralleldots/",
    companySize: "100+",
    worthApplying: "Limited",
    notes: "Official contact page lists demo/business email only; not a hiring inbox, so skipped email send.",
  },
  {
    company: "MongoDB",
    location: "Gurugram",
    website: "https://www.mongodb.com",
    careers: "https://www.mongodb.com/careers",
    sourceUrl: "https://www.mongodb.com/careers",
    confidence: "High apply link",
    currentRole: "Software engineering, developer experience, cloud, consulting and support roles via official portal",
    applyLink: "https://www.mongodb.com/careers",
    linkedin: "https://www.linkedin.com/company/mongodbinc/",
    companySize: "5,000+",
    worthApplying: "Yes via portal",
    notes: "Official careers route found; no public application inbox confirmed.",
  },
  {
    company: "Nanonets",
    location: "Gurugram / NCR",
    website: "https://nanonets.com",
    careers: "https://nanonets.com/careers",
    otherEmail: "info@nanonets.com",
    sourceUrl: "https://nanonets.com/careers",
    confidence: "Medium",
    currentRole: "SDE, AI, ML, workflow automation and product engineering roles through official careers",
    applyLink: "https://nanonets.com/careers",
    linkedin: "https://www.linkedin.com/company/nanonets/",
    companySize: "200+",
    worthApplying: "Yes",
    notes: "Official careers/contact area lists info@nanonets.com; no HR inbox found; MX verified.",
  },
  {
    company: "Cypherock",
    location: "Gurugram",
    website: "https://www.cypherock.com",
    careers: "https://www.cypherock.com/careers",
    sourceUrl: "https://www.cypherock.com/careers",
    confidence: "High apply link",
    currentRole: "Hardware/software, frontend, backend, blockchain and product roles via official careers",
    applyLink: "https://www.cypherock.com/careers",
    linkedin: "https://www.linkedin.com/company/cypherock/",
    companySize: "11-50",
    worthApplying: "Yes via portal",
    notes: "Official careers route found; no public application inbox confirmed.",
  },
  {
    company: "Awiros",
    location: "Gurugram",
    website: "https://awiros.com",
    careers: "https://awiros.com/career/",
    otherEmail: "sales@awiros.com",
    sourceUrl: "https://awiros.com/contact/",
    confidence: "Medium",
    currentRole: "Full Stack Developer / Front-End Developer and AI/video-intelligence roles via public postings",
    applyLink: "https://awiros.com/career/",
    linkedin: "https://www.linkedin.com/company/awiros/",
    companySize: "51-200",
    worthApplying: "Yes",
    notes: "Official contact page lists sales@awiros.com; no HR inbox found; MX verified.",
  },
];

const sentCandidates = [
  {
    company: "Square Yards",
    role: "Frontend / Full-Stack Developer",
    recipients: "careers@squareyards.com",
    reason: "official careers email",
    companyContext: "Square Yards' proptech platform depends on searchable, responsive property journeys and data-backed user flows",
  },
  {
    company: "Magicpin",
    role: "Backend / Full-Stack / Frontend Developer",
    recipients: "careers@magicpin.in",
    reason: "public careers email",
    companyContext: "Magicpin's local-commerce and rewards platform needs scalable marketplace flows, APIs, dashboards, and product experimentation",
  },
  {
    company: "Evalueserve",
    role: "Full-Stack / Data-Driven Product Developer",
    recipients: "careers@evalueserve.com",
    reason: "official careers email",
    companyContext: "Evalueserve works across analytics, data, AI, and business platforms where clean interfaces and dependable integrations matter",
  },
  {
    company: "Junglee Games",
    role: "Frontend / Backend / Full-Stack Developer",
    recipients: "hr@jungleegames.com",
    reason: "public HR email and official careers route",
    companyContext: "Junglee Games builds high-traffic gaming products where responsive interfaces, backend APIs, and product reliability are important",
  },
  {
    company: "Nanonets",
    role: "Frontend / Full-Stack / AI Product Developer",
    recipients: "info@nanonets.com",
    reason: "official general contact email; no HR inbox found",
    companyContext: "Nanonets builds AI workflow automation products where practical full-stack work, APIs, and usable dashboards fit well",
  },
  {
    company: "Awiros",
    role: "Frontend / Full-Stack Developer",
    recipients: "sales@awiros.com",
    reason: "official general contact email; no HR inbox found",
    companyContext: "Awiros works on AI video-intelligence and computer-vision products that need robust dashboards, integrations, and web interfaces",
  },
];

const focusForRole = (role) => {
  const value = role.toLowerCase();
  if (value.includes("ai") || value.includes("data")) {
    return "React dashboards, API-backed product flows, SQL/PostgreSQL/MongoDB data work, and practical AI/product integrations";
  }
  if (value.includes("backend")) {
    return "Node.js APIs, database-backed services, integrations, and practical full-stack delivery";
  }
  return "React, Next.js, JavaScript/TypeScript, Node.js, APIs, databases, Tailwind CSS, and practical full-stack product development";
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
    reason: row.notes.includes("already marked")
      ? "already marked portal-only in existing tracker"
      : row.hrEmail || row.careerEmail || row.otherEmail
        ? "not selected due to portal preference or weak/non-hiring route"
        : "apply link only / no public email confirmed",
  }));

const markdown = [
  "# Gurugram/Haryana Batch 5 Research",
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
  scope: "Companies 81-100 from user-provided Gurugram/Haryana list",
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
