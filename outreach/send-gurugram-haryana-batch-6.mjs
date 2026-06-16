import fs from "node:fs/promises";
import "dotenv/config";
import { sendApplicationEmail } from "../server/emailService.js";

const today = () => new Date().toISOString().slice(0, 10);
const logFile = `outreach/gurugram-haryana-batch-6-send-${today()}.json`;
const tableFile = `outreach/gurugram-haryana-batch-6-research-${today()}.md`;

const researchRows = [
  {
    company: "Queppelin",
    location: "Haryana",
    website: "https://www.queppelin.com",
    careers: "https://www.queppelin.com/contact-us/",
    careerEmail: "careers@queppelintech.com",
    otherEmail: "enquiry@queppelintech.com",
    sourceUrl: "https://www.queppelin.com/virtual-reality-company-in-usa/",
    confidence: "High",
    currentRole: "AR/VR, AI, React/JavaScript and product-development roles vary",
    applyLink: "https://www.queppelin.com/contact-us/",
    linkedin: "https://www.linkedin.com/company/queppelin/",
    companySize: "50-200",
    worthApplying: "Yes",
    notes: "Public Queppelin page lists Career: careers@queppelintech.com; MX verified.",
  },
  {
    company: "Decipher Zone Technologies",
    location: "Haryana",
    website: "https://www.decipherzone.com",
    careers: "https://www.decipherzone.com/careers",
    otherEmail: "info@decipherzone.com",
    sourceUrl: "https://www.decipherzone.com/contact-us",
    confidence: "Medium",
    currentRole: "Java, Node.js, React, Angular and full-stack roles vary by careers page",
    applyLink: "https://www.decipherzone.com/careers",
    linkedin: "https://www.linkedin.com/company/decipher-zone-technologies/",
    companySize: "50-200",
    worthApplying: "Yes",
    notes: "Official contact email found; no HR inbox confirmed; MX verified.",
  },
  {
    company: "OTS Solutions",
    location: "Haryana",
    website: "https://otssolutions.com",
    careers: "https://otssolutions.com/careers/",
    otherEmail: "info@otssolutions.com",
    sourceUrl: "https://otssolutions.com/contact/",
    confidence: "Medium",
    currentRole: "Digital engineering, cloud, app development and staffing roles through official careers page",
    applyLink: "https://otssolutions.com/careers/",
    linkedin: "https://www.linkedin.com/company/ots-solutions/",
    companySize: "51-100",
    worthApplying: "Yes",
    notes: "Official site lists Gurugram office and info@otssolutions.com; MX verified.",
  },
  {
    company: "Imenso Software",
    location: "Haryana",
    website: "https://www.imenso.co",
    careers: "https://www.imenso.co/careers/",
    sourceUrl: "https://www.imenso.co/careers/",
    confidence: "High apply link",
    currentRole: "Full-stack, frontend, backend and cloud roles vary by official careers page",
    applyLink: "https://www.imenso.co/careers/",
    linkedin: "https://www.linkedin.com/company/imenso-software/",
    companySize: "50-200",
    worthApplying: "Yes via portal",
    notes: "Official careers page found; MX check for imenso.co returned no MX, so no email selected.",
  },
  {
    company: "Promatics Technologies",
    location: "Haryana",
    website: "https://www.promaticsindia.com",
    careers: "https://www.promaticsindia.com/careers",
    hrEmail: "hr@promaticsindia.com",
    otherEmail: "hi@promaticsindia.com",
    sourceUrl: "https://www.linkedin.com/posts/kunika-pruthi-1407a321a_connections-qatester-manualsoftwaretester-activity-7116306744913330176-WDmk",
    confidence: "Medium",
    currentRole: "Web/mobile/app development and QA roles; local tracker previously marked portal-only",
    applyLink: "https://www.promaticsindia.com/careers",
    linkedin: "https://www.linkedin.com/company/promatics-technologies-private-limited/",
    companySize: "50-200",
    worthApplying: "Yes",
    notes: "Public hiring post lists hr@promaticsindia.com; official pages list hi/info contacts; MX verified.",
  },
  {
    company: "NMG Technologies",
    location: "Haryana",
    website: "https://nmgtechnologies.com",
    careers: "https://nmgtechnologies.com/company/careers/",
    hrEmail: "hr@nmgtechnologies.com",
    otherEmail: "info@nmgtechnologies.com",
    sourceUrl: "https://nmgtechnologies.com/contact-us",
    confidence: "High",
    currentRole: ".Net Team Lead, Software Testing Analyst, SEO/PPC roles; AI and enterprise software services",
    applyLink: "https://nmgtechnologies.com/company/careers/",
    linkedin: "https://www.linkedin.com/company/nmg-technologies/",
    companySize: "51-200",
    worthApplying: "Yes",
    notes: "Official contact page labels Careers: hr@nmgtechnologies.com; MX verified.",
  },
  {
    company: "KOMPANIONS",
    location: "Gurugram / Haryana",
    website: "https://www.kompanions.com",
    careers: "",
    sourceUrl: "https://www.kompanions.com",
    confidence: "Low",
    currentRole: "Not found",
    applyLink: "",
    linkedin: "https://www.linkedin.com/company/kompanions/",
    companySize: "Unknown",
    worthApplying: "Limited",
    notes: "No safe public HR/career/contact email confirmed.",
  },
  {
    company: "EDIIIE",
    location: "Gurugram / Haryana",
    website: "https://www.ediiie.com",
    careers: "https://www.ediiie.com/contact/",
    otherEmail: "namaste@ediiie.com",
    sourceUrl: "https://www.bharatibiz.com/en/ediiie-091550-60606",
    confidence: "Medium",
    currentRole: "Game development, AR/VR, Unity/Unreal, blockchain and metaverse roles vary",
    applyLink: "https://www.ediiie.com/contact/",
    linkedin: "https://www.linkedin.com/company/ediiie/",
    companySize: "51-500",
    worthApplying: "Yes",
    notes: "Public business profile and directories list namaste@ediiie.com; official contact page confirms Gurugram studio; MX verified.",
  },
  {
    company: "Techsaga Corporations",
    location: "Haryana",
    website: "https://www.techsaga.co.in",
    careers: "https://www.techsaga.co.in/careers",
    hrEmail: "hr@techsaga.co.in",
    otherEmail: "info@techsaga.co.in",
    sourceUrl: "https://www.techsaga.co.in/careers",
    confidence: "High",
    currentRole: "Software development, web/app, cloud and digital transformation roles",
    applyLink: "https://www.techsaga.co.in/careers",
    linkedin: "https://in.linkedin.com/company/techsaga",
    companySize: "Unknown",
    worthApplying: "Yes",
    notes: "Official careers page lists Primary HR Channels: hr@techsaga.co.in; MX verified.",
  },
  {
    company: "Technians",
    location: "Gurugram / Haryana",
    website: "https://technians.com",
    careers: "",
    otherEmail: "info@technians.com",
    sourceUrl: "https://www.clodura.ai/directory/company/technians",
    confidence: "Medium",
    currentRole: "Web, cloud apps and digital transformation roles vary",
    applyLink: "",
    linkedin: "https://www.linkedin.com/company/technians/",
    companySize: "51-200",
    worthApplying: "Limited for junior React",
    notes: "Public company profiles list info@technians.com; no HR/career inbox confirmed; MX verified.",
  },
  {
    company: "Ezulix Software",
    location: "Haryana",
    website: "https://ezulix.com",
    careers: "https://ezulix.co.uk/career",
    otherEmail: "info@ezulix.com",
    sourceUrl: "https://ezulix.co.uk/career",
    confidence: "Medium",
    currentRole: "Flutter Developer, ASP.NET Core C# Developer, sales/pre-sales roles",
    applyLink: "https://ezulix.co.uk/career",
    linkedin: "https://www.linkedin.com/company/ezulix-software/",
    companySize: "100+",
    worthApplying: "Yes",
    notes: "Official career/contact pages list info@ezulix.com; no HR inbox found; MX verified.",
  },
  {
    company: "StartxLabs Technologies",
    location: "Haryana",
    website: "https://www.startxlabs.com",
    careers: "https://www.startxlabs.com/",
    hrEmail: "hr@startxlabs.com",
    otherEmail: "hello@startxlabs.com",
    sourceUrl: "https://gnindia.dronacharya.info/Downloads/Admin/DVV-5-2-1.pdf",
    confidence: "Medium",
    currentRole: "Website, mobile, React Native, Flutter, product and cloud roles vary",
    applyLink: "https://www.startxlabs.com/",
    linkedin: "https://www.linkedin.com/company/startxlabs/",
    companySize: "11-50",
    worthApplying: "Yes",
    notes: "Public placement PDF lists hr@startxlabs.com; Trustpilot/Crunchbase list hello@startxlabs.com; MX verified.",
  },
  {
    company: "Expand My Business",
    location: "Gurugram",
    website: "https://www.exmyb.com",
    careers: "https://exmyb.freshteam.com/jobs",
    otherEmail: "contact@exmyb.com",
    sourceUrl: "https://exmyb.freshteam.com/jobs/8HwLxokV4iRX",
    confidence: "High apply link",
    currentRole: "Senior Recruiter, frontend/product/delivery roles appear on Freshteam/GrabJobs",
    applyLink: "https://exmyb.freshteam.com/jobs",
    linkedin: "https://www.linkedin.com/company/expand-my-business/",
    companySize: "150-200+",
    worthApplying: "Yes via portal",
    notes: "Freshteam apply route found; general contact@exmyb.com from directory, but portal preferred.",
  },
  {
    company: "IP Media Software Development",
    location: "Haryana",
    website: "http://ipmedia.in",
    careers: "",
    sourceUrl: "https://www.feedsfloor.com/profile/ip-media-software-development-company",
    confidence: "Low",
    currentRole: "No current developer role found",
    applyLink: "",
    linkedin: "",
    companySize: "50-249 in directory profiles",
    worthApplying: "Limited",
    notes: "Directory profiles confirm company/location/services, but no safe public email confirmed.",
  },
  {
    company: "Kodehash Technologies",
    location: "Haryana",
    website: "https://kodehash.com",
    careers: "https://kodehash.com/career",
    otherEmail: "contact@kodehash.com",
    sourceUrl: "https://kodehash.com/contact-us",
    confidence: "Medium",
    currentRole: "Cloud Consultant and software/mobile development roles vary",
    applyLink: "https://kodehash.com/career",
    linkedin: "https://www.linkedin.com/company/kodehash/",
    companySize: "50-100",
    worthApplying: "Yes",
    notes: "Official contact page lists contact@kodehash.com; career page exists; MX verified.",
  },
  {
    company: "Akoode Technologies",
    location: "Haryana",
    website: "https://www.akoode.com",
    careers: "https://www.akoode.com/career.php",
    hrEmail: "hr@akoode.in",
    otherEmail: "info@akoode.com",
    sourceUrl: "https://www.akoode.com/career.php",
    confidence: "High",
    currentRole: "AI, software, web, mobile, blockchain, IoT and data roles",
    applyLink: "https://www.akoode.com/career.php",
    linkedin: "https://www.linkedin.com/company/akoode-technologies/",
    companySize: "51-100",
    worthApplying: "Yes",
    notes: "Official career page says share resume at hr@akoode.in; MX verified.",
  },
  {
    company: "MindRich Technologies",
    location: "Haryana",
    website: "https://themindrich.com",
    careers: "https://themindrich.com/career/",
    otherEmail: "info@themindrich.com",
    sourceUrl: "https://themindrich.com/career/",
    confidence: "Medium",
    currentRole: "Odoo Developer, Business Development Intern; web/software services",
    applyLink: "https://themindrich.com/career/",
    linkedin: "https://www.linkedin.com/company/mindrich-technologies-pvt-ltd/",
    companySize: "11-50",
    worthApplying: "Limited for React right now",
    notes: "Official careers page has upload form; public Crunchbase lists info@themindrich.com; MX verified.",
  },
  {
    company: "Nanotech Softapp",
    location: "Haryana",
    website: "https://nanotech-softapp.com",
    careers: "https://nanotech-softapp.com/careers/",
    sourceUrl: "https://nanotech-softapp.com/careers/",
    confidence: "High apply link",
    currentRole: "Dedicated React, Node.js, Java, Python, Android/iOS, DevOps and AI/ML resource listings",
    applyLink: "https://nanotech-softapp.com/careers/",
    linkedin: "https://www.linkedin.com/company/nanotech-soft-app/",
    companySize: "1-10",
    worthApplying: "Yes via form",
    notes: "Official careers page provides talent form; only personal email found externally, so email send skipped.",
  },
  {
    company: "RSK Business Solutions",
    location: "Haryana",
    website: "https://rsk-bsl.com",
    careers: "https://rsk-bsl.com/contact-us/",
    sourceUrl: "https://rsk-bsl.com/contact-us/",
    confidence: "High apply link",
    currentRole: "Software development and digital acceleration services; no current jobs found",
    applyLink: "https://rsk-bsl.com/contact-us/",
    linkedin: "https://www.linkedin.com/company/rsk-business-solutions/",
    companySize: "51-200",
    worthApplying: "Limited",
    notes: "Official contact page has form and Gurugram office; no public HR/career inbox confirmed.",
  },
  {
    company: "WebInfoMart",
    location: "Gurugram",
    website: "https://www.webinfomart.com",
    careers: "https://www.webinfomart.com/contact.php",
    careerEmail: "career@webinfomart.com",
    otherEmail: "info@webinfomart.com",
    sourceUrl: "https://www.glbitm.org/Uploads/Files/146ef_Debangan_chakraborty_offerletter2014.pdf",
    confidence: "Medium",
    currentRole: "Web/product/application development roles vary",
    applyLink: "https://www.webinfomart.com/contact.php",
    linkedin: "https://www.linkedin.com/company/webinfomart/",
    companySize: "11-50",
    worthApplying: "Yes",
    notes: "Official pages list general emails; public offer letter lists career@webinfomart.com; MX verified.",
  },
];

const sentCandidates = [
  ["Queppelin", "AI / AR-VR / Full-Stack Developer", "careers@queppelintech.com", "public career email", "Queppelin builds AR, VR, AI and immersive software products where interactive UI, APIs and product thinking fit well"],
  ["Decipher Zone Technologies", "React / Node.js / Full-Stack Developer", "info@decipherzone.com", "official general contact email; no HR inbox found", "Decipher Zone delivers web, app and software engineering services across modern stacks"],
  ["OTS Solutions", "Frontend / Full-Stack Developer", "info@otssolutions.com", "official general contact email and careers page", "OTS works across cloud, digital engineering, app development and staffing, where full-stack execution is relevant"],
  ["Promatics Technologies", "Web / Mobile / Full-Stack Developer", "hr@promaticsindia.com", "public HR hiring email", "Promatics builds web and mobile products for startups and enterprises"],
  ["NMG Technologies", "Frontend / Backend / Full-Stack Developer", "hr@nmgtechnologies.com", "official careers email", "NMG builds AI-driven enterprise software, web, mobile and cloud products"],
  ["EDIIIE", "Frontend / Game-Tech / Full-Stack Developer", "namaste@ediiie.com", "public company contact email; no HR inbox found", "EDIIIE works across game development, AR/VR and immersive web experiences"],
  ["Techsaga Corporations", "Frontend / Full-Stack Developer", "hr@techsaga.co.in", "official HR careers email", "Techsaga focuses on scalable software, web, app and cloud transformation work"],
  ["Technians", "Frontend / Web Developer", "info@technians.com", "public company contact email; no HR inbox found", "Technians works across web, cloud apps and digital transformation projects"],
  ["Ezulix Software", "Frontend / Web / Full-Stack Developer", "info@ezulix.com", "official career/general contact email", "Ezulix builds web, mobile and custom software products"],
  ["StartxLabs Technologies", "Frontend / React Native / Full-Stack Developer", "hr@startxlabs.com", "public HR email", "StartxLabs builds web, mobile and cloud products for startups and enterprises"],
  ["Kodehash Technologies", "Frontend / Mobile / Full-Stack Developer", "contact@kodehash.com", "official general contact email and careers page", "Kodehash focuses on cloud, mobile, e-commerce and digital transformation solutions"],
  ["Akoode Technologies", "AI / Web / Full-Stack Developer", "hr@akoode.in", "official career page HR email", "Akoode builds AI, software, web, mobile, blockchain and data products"],
  ["MindRich Technologies", "Odoo / Web / Full-Stack Developer", "info@themindrich.com", "public company contact email and official careers page", "MindRich works on Odoo, ERP, web development and software consulting"],
  ["WebInfoMart", "Web / Frontend / Full-Stack Developer", "career@webinfomart.com", "public career email", "WebInfoMart builds application, enterprise, product and web development solutions"],
].map(([company, role, recipients, reason, companyContext]) => ({ company, role, recipients, reason, companyContext }));

const focusForRole = (role) => {
  const value = role.toLowerCase();
  if (value.includes("ai") || value.includes("ar") || value.includes("game")) {
    return "React interfaces, API-backed product flows, interactive UI, Node.js services, and practical full-stack delivery";
  }
  if (value.includes("backend")) {
    return "Node.js APIs, database-backed services, integrations, and practical full-stack delivery";
  }
  return "React, Next.js, JavaScript/TypeScript, Node.js, APIs, databases, Tailwind CSS, and practical full-stack product development";
};

const bodyFor = ({ company, role, reason, companyContext }) =>
  [
    `Hi ${company} Hiring Team,`,
    "",
    "I am Adarsh Pathania, a Full-Stack Developer based in Mohali with hands-on experience in React, Next.js, TypeScript, Node.js, Prisma, PostgreSQL/MongoDB, Tailwind CSS, and API-driven web applications.",
    "",
    `I am reaching out to explore ${role} opportunities at ${company}. I found your ${reason}, and ${companyContext}.`,
    "",
    `My strongest fit is in ${focusForRole(role)}. In recent work, I have built responsive interfaces, connected frontend systems with backend APIs, and shipped practical features with attention to clean execution, maintainability, and user experience.`,
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
    results.push({ ...item, status: "Failed", error: error?.message || "Unknown send failure" });
    console.log(`FAILED ${item.company}: ${error?.message || "Unknown send failure"}`);
  }

  await sleep(1200);
}

const skipped = researchRows
  .filter((row) => !sentCandidates.some((item) => item.company === row.company))
  .map((row) => ({
    company: row.company,
    reason:
      row.hrEmail || row.careerEmail || row.otherEmail
        ? "not selected due to portal preference, MX issue, personal-only email, or weak route"
        : "apply link only / no public email confirmed",
  }));

const markdown = [
  "# Gurugram/Haryana Batch 6 Research",
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
  scope: "Companies 101-120 from user-provided Gurugram/Haryana list",
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
    { sent: log.sentCount, failed: log.failedCount, skipped: log.skippedCount, tableFile, logFile },
    null,
    2,
  ),
);
