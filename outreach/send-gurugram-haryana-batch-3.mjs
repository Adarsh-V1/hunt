import fs from "node:fs/promises";
import "dotenv/config";
import { sendApplicationEmail } from "../server/emailService.js";

const today = () => new Date().toISOString().slice(0, 10);
const logFile = `outreach/gurugram-haryana-batch-3-send-${today()}.json`;
const tableFile = `outreach/gurugram-haryana-batch-3-research-${today()}.md`;

const researchRows = [
  {
    company: "Webority Technologies",
    location: "Haryana / NCR",
    website: "https://www.webority.com",
    careers: "https://www.webority.com/company/careers/uiux-designer",
    otherEmail: "contact@webority.com",
    sourceUrl: "https://www.webority.com/Contact/",
    confidence: "Medium",
    currentRole: "UI/UX Designer listed; public sources show Python/Fullstack jobs and AI/software services",
    applyLink: "https://www.webority.com/company/careers/uiux-designer",
    linkedin: "https://in.linkedin.com/company/webority",
    companySize: "51-200 employees",
    worthApplying: "Yes",
    notes: "Official contact page lists contact@webority.com; careers page has application form and company is software/AI-focused; MX verified.",
  },
  {
    company: "Zurato Technologies",
    location: "Haryana / NCR",
    website: "https://zuratotechnologies.com",
    careers: "https://zuratotechnologies.com/index.php/career-zurato-technologies/",
    hrEmail: "hr@zuratotech.com",
    sourceUrl: "https://zuratotechnologies.com/index.php/career-zurato-technologies/",
    confidence: "High",
    currentRole: "UI/UX Designer, iOS and Android Developer, PHP Trainee",
    applyLink: "https://zuratotechnologies.com/index.php/career-zurato-technologies/",
    linkedin: "https://www.linkedin.com/company/zurato-technologies/",
    companySize: "Unknown",
    worthApplying: "Yes",
    notes: "Official careers/contact pages list hr@zuratotech.com and Gurugram address; MX verified.",
  },
  {
    company: "Bizzeonline",
    location: "Gurugram / NCR",
    website: "Unknown",
    careers: "",
    sourceUrl: "https://www.reddit.com/r/u_Bizzeonlinewebsite/comments/u4r8ng",
    confidence: "Low",
    currentRole: "Not found",
    applyLink: "",
    linkedin: "",
    companySize: "Unknown",
    worthApplying: "Limited",
    notes: "Only weak social/directory traces found; no safe public HR/career/contact email confirmed.",
  },
  {
    company: "TrucksUp",
    location: "Gurugram",
    website: "https://trucksup.com",
    careers: "https://www.linkedin.com/company/trucksupsolutions/jobs",
    sourceUrl: "https://www.linkedin.com/company/trucksupsolutions/",
    confidence: "Medium apply link",
    currentRole: "Logistics/tech roles may appear on LinkedIn jobs",
    applyLink: "https://www.linkedin.com/company/trucksupsolutions/jobs",
    linkedin: "https://www.linkedin.com/company/trucksupsolutions/",
    companySize: "51-200 employees",
    worthApplying: "Yes via LinkedIn/portal",
    notes: "LinkedIn company page confirms Gurugram logistics-tech company; no public application inbox confirmed.",
  },
  {
    company: "TCS",
    location: "Gurugram / Panchkula",
    website: "https://www.tcs.com",
    careers: "https://www.tcs.com/careers",
    sourceUrl: "https://www.tcs.com/careers",
    confidence: "High apply link",
    currentRole: "Use TCS careers/NextStep for freshers and experienced roles",
    applyLink: "https://www.tcs.com/careers",
    linkedin: "https://www.linkedin.com/company/tata-consultancy-services/",
    companySize: "10,000+",
    worthApplying: "Yes via portal",
    notes: "Official portal preferred; no email sent.",
  },
  {
    company: "Infosys",
    location: "Gurugram / Panchkula",
    website: "https://www.infosys.com",
    careers: "https://www.infosys.com/careers/apply.html",
    sourceUrl: "https://www.infosys.com/careers/apply.html",
    confidence: "High apply link",
    currentRole: "Graduate and experienced tech roles via official portal",
    applyLink: "https://www.infosys.com/careers/apply.html",
    linkedin: "https://www.linkedin.com/company/infosys/",
    companySize: "10,000+",
    worthApplying: "Yes via portal",
    notes: "Official portal preferred; accommodation/helpdesk emails are not resume inboxes.",
  },
  {
    company: "Wipro",
    location: "Gurugram",
    website: "https://www.wipro.com",
    careers: "https://careers.wipro.com/",
    sourceUrl: "https://careers.wipro.com/",
    confidence: "High apply link",
    currentRole: "Graduate Engineer Trainee and tech roles via official careers search",
    applyLink: "https://careers.wipro.com/",
    linkedin: "https://www.linkedin.com/company/wipro/",
    companySize: "10,000+",
    worthApplying: "Yes via portal",
    notes: "Official careers page explicitly says helpdesk.recruitment@wipro.com is not monitored for resumes; no email sent.",
  },
  {
    company: "HCLTech",
    location: "Gurugram",
    website: "https://www.hcltech.com",
    careers: "https://www.hcltech.com/careers",
    sourceUrl: "https://www.hcltech.com/careers",
    confidence: "High apply link",
    currentRole: "Campus and experienced tech roles via official careers portal",
    applyLink: "https://careers.hcltech.com/jobs?locale=en_US",
    linkedin: "https://www.linkedin.com/company/hcltech/",
    companySize: "10,000+",
    worthApplying: "Yes via portal",
    notes: "Official portal preferred; no public resume inbox confirmed.",
  },
  {
    company: "Tech Mahindra",
    location: "Gurugram / Panchkula",
    website: "https://www.techmahindra.com",
    careers: "https://careers.techmahindra.com/Home.aspx",
    sourceUrl: "https://careers.techmahindra.com/Home.aspx",
    confidence: "High apply link",
    currentRole: "Technology roles via official careers portal",
    applyLink: "https://careers.techmahindra.com/Home.aspx",
    linkedin: "https://www.linkedin.com/company/tech-mahindra/",
    companySize: "10,000+",
    worthApplying: "Yes via portal",
    notes: "Official portal preferred; Tech Mahindra Foundation careers email is for foundation roles, not Tech Mahindra IT applications.",
  },
  {
    company: "Accenture",
    location: "Gurugram",
    website: "https://www.accenture.com",
    careers: "https://www.accenture.com/in-en/careers",
    sourceUrl: "https://www.accenture.com/in-en/careers",
    confidence: "High apply link",
    currentRole: "Developers, technology, AI, analytics, and early-career roles via official search",
    applyLink: "https://www.accenture.com/in-en/careers/jobsearch",
    linkedin: "https://www.linkedin.com/company/accenture/",
    companySize: "10,000+",
    worthApplying: "Yes via portal",
    notes: "Official portal preferred; no email sent.",
  },
  {
    company: "IBM",
    location: "Gurugram",
    website: "https://www.ibm.com",
    careers: "https://www.ibm.com/in-en/careers",
    sourceUrl: "https://www.ibm.com/in-en/careers",
    confidence: "High apply link",
    currentRole: "Software engineering, consulting, research, and early-career roles via official portal",
    applyLink: "https://www.ibm.com/in-en/careers",
    linkedin: "https://www.linkedin.com/company/ibm/",
    companySize: "10,000+",
    worthApplying: "Yes via portal",
    notes: "Official portal preferred; no public application inbox confirmed.",
  },
  {
    company: "Microsoft",
    location: "Gurugram",
    website: "https://www.microsoft.com",
    careers: "https://careers.microsoft.com/v2/global/en/locations/gurugram.html",
    sourceUrl: "https://careers.microsoft.com/v2/global/en/locations/gurugram.html",
    confidence: "High apply link",
    currentRole: "Cloud & AI Digital Solution Engineer and other Gurugram roles",
    applyLink: "https://careers.microsoft.com/v2/global/en/locations/gurugram.html",
    linkedin: "https://www.linkedin.com/company/microsoft/",
    companySize: "10,000+",
    worthApplying: "Yes via portal",
    notes: "Official location page lists Gurugram opportunities; no email sent.",
  },
  {
    company: "Google",
    location: "Gurugram",
    website: "https://www.google.com",
    careers: "https://careers.google.com/jobs/",
    sourceUrl: "https://support.google.com/googlecareers/answer/9018529",
    confidence: "High apply link",
    currentRole: "Use official Google Careers search by location and skills",
    applyLink: "https://careers.google.com/jobs/",
    linkedin: "https://www.linkedin.com/company/google/",
    companySize: "10,000+",
    worthApplying: "Yes via portal",
    notes: "Official careers support directs candidates to careers.google.com/jobs; no email sent.",
  },
  {
    company: "Meta",
    location: "Gurugram",
    website: "https://www.meta.com",
    careers: "https://www.metacareers.com/jobs/",
    sourceUrl: "https://www.metacareers.com/jobs/",
    confidence: "High apply link",
    currentRole: "Use official Meta Careers search",
    applyLink: "https://www.metacareers.com/jobs/",
    linkedin: "https://www.linkedin.com/company/meta/",
    companySize: "10,000+",
    worthApplying: "Portal only",
    notes: "Official careers route preferred; no public application inbox confirmed.",
  },
  {
    company: "Oracle",
    location: "Gurugram / NCR",
    website: "https://www.oracle.com",
    careers: "https://www.oracle.com/in/careers/",
    sourceUrl: "https://www.oracle.com/in/careers/",
    confidence: "High apply link",
    currentRole: "Oracle India careers and public listings show Gurugram database/engineering roles",
    applyLink: "https://www.oracle.com/in/careers/",
    linkedin: "https://www.linkedin.com/company/oracle/",
    companySize: "10,000+",
    worthApplying: "Yes via portal",
    notes: "Official portal preferred; no email sent.",
  },
  {
    company: "Salesforce",
    location: "Gurugram / NCR",
    website: "https://www.salesforce.com",
    careers: "https://careers.salesforce.com/en/jobs/",
    sourceUrl: "https://careers.salesforce.com/en/jobs/jr340045/senior-solution-engineer/",
    confidence: "High apply link",
    currentRole: "Salesforce jobs page shows Gurgaon roles",
    applyLink: "https://careers.salesforce.com/en/jobs/",
    linkedin: "https://www.linkedin.com/company/salesforce/",
    companySize: "10,000+",
    worthApplying: "Yes via portal",
    notes: "Official portal preferred; no email sent.",
  },
  {
    company: "SAP",
    location: "Gurugram / NCR",
    website: "https://www.sap.com",
    careers: "https://jobs.sap.com/job/",
    sourceUrl: "https://jobs.sap.com/job/",
    confidence: "High apply link",
    currentRole: "Use official SAP jobs search by location and keyword",
    applyLink: "https://jobs.sap.com/job/",
    linkedin: "https://www.linkedin.com/company/sap/",
    companySize: "10,000+",
    worthApplying: "Yes via portal",
    notes: "Official portal preferred; no public application inbox confirmed.",
  },
  {
    company: "Adobe",
    location: "Gurugram / NCR",
    website: "https://www.adobe.com",
    careers: "https://careers.adobe.com/",
    sourceUrl: "https://careers.adobe.com/",
    confidence: "High apply link",
    currentRole: "Engineering, product, design, research, and university opportunities via official portal",
    applyLink: "https://careers.adobe.com/",
    linkedin: "https://www.linkedin.com/company/adobe/",
    companySize: "10,000+",
    worthApplying: "Yes via portal",
    notes: "Official portal preferred; no email sent.",
  },
  {
    company: "Udemy",
    location: "Gurugram",
    website: "https://www.udemy.com",
    careers: "https://about.udemy.com/careers/",
    sourceUrl: "https://about.udemy.com/udemy-news/security-update-staying-informed-and-protected-against-fraudulent-job-postings/",
    confidence: "High apply link",
    currentRole: "Use official Udemy careers page for current roles",
    applyLink: "https://about.udemy.com/careers/",
    linkedin: "https://www.linkedin.com/company/udemy/",
    companySize: "1,000+",
    worthApplying: "Portal only",
    notes: "Udemy fraud notice says legitimate jobs are posted on official careers page; no email sent.",
  },
  {
    company: "Disney+ Hotstar / JioHotstar",
    location: "Gurugram / NCR",
    website: "https://www.hotstar.com",
    careers: "https://jobs.lever.co/jiostar",
    sourceUrl: "https://jobs.lever.co/jiostar/c169e270-c893-403a-93b2-cec168ccdaee",
    confidence: "High apply link",
    currentRole: "Staff Software Development Engineer - Web and other JioStar/JioHotstar roles",
    applyLink: "https://jobs.lever.co/jiostar",
    linkedin: "https://www.linkedin.com/company/jiohotstar/",
    companySize: "Unknown",
    worthApplying: "Yes via portal",
    notes: "Disney+ Hotstar in India is now JioHotstar/JioStar; Lever job route found; no public application inbox confirmed.",
  },
];

const sentCandidates = [
  {
    company: "Webority Technologies",
    role: "Frontend / Full-Stack / AI Product Developer",
    recipients: "contact@webority.com",
    reason: "official general contact email; no HR inbox found",
    companyContext: "Webority builds AI, product engineering, cloud, and custom software solutions where React, Node.js, APIs, and clean product execution fit well",
  },
  {
    company: "Zurato Technologies",
    role: "Frontend / Web / Full-Stack Developer",
    recipients: "hr@zuratotech.com",
    reason: "official HR email from careers/contact page",
    companyContext: "Zurato's web, mobile, and digital-solution work aligns with practical frontend and full-stack delivery",
  },
];

const focusForRole = (role) => {
  const value = role.toLowerCase();
  if (value.includes("ai")) {
    return "React, API-driven UI, Node.js services, database-backed features, and practical AI/product integrations";
  }
  return "React, Next.js, JavaScript/TypeScript, Node.js, APIs, databases, and practical full-stack product development";
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
    reason: row.hrEmail || row.careerEmail || row.otherEmail
      ? "not selected due to portal preference or non-application route"
      : "apply link only / no public email confirmed",
  }));

const markdown = [
  "# Gurugram/Haryana Batch 3 Research",
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
  scope: "Companies 41-60 from user-provided Gurugram/Haryana list",
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
