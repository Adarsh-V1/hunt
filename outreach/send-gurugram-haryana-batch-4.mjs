import fs from "node:fs/promises";
import "dotenv/config";
import { sendApplicationEmail } from "../server/emailService.js";

const today = () => new Date().toISOString().slice(0, 10);
const logFile = `outreach/gurugram-haryana-batch-4-send-${today()}.json`;
const tableFile = `outreach/gurugram-haryana-batch-4-research-${today()}.md`;

const researchRows = [
  {
    company: "Navan",
    location: "Gurugram",
    website: "https://navan.com",
    careers: "https://navan.com/careers",
    sourceUrl: "https://navan.com/contact",
    confidence: "High apply link",
    currentRole: "Senior Back-End Engineer and product/AI travel roles appear on Navan job boards",
    applyLink: "https://navan.com/careers",
    linkedin: "https://www.linkedin.com/company/navan/",
    companySize: "1,000+",
    worthApplying: "Yes via portal",
    notes: "Official contact page confirms Gurugram office; no public application inbox confirmed.",
  },
  {
    company: "Expedia Group",
    location: "Gurugram",
    website: "https://www.expediagroup.com",
    careers: "https://careers.expediagroup.com/jobs",
    sourceUrl: "https://in.linkedin.com/company/expediagroup",
    confidence: "High apply link",
    currentRole: "Data Engineer II, Technical Operations Analyst II, Network Engineer II, Data Scientist III",
    applyLink: "https://careers.expediagroup.com/jobs",
    linkedin: "https://in.linkedin.com/company/expediagroup",
    companySize: "10,000+",
    worthApplying: "Yes via portal",
    notes: "LinkedIn warns official jobs are at careers.expediagroup.com/jobs; no email sent.",
  },
  {
    company: "MakeMyTrip",
    location: "Gurugram",
    website: "https://www.makemytrip.com",
    careers: "https://careers.makemytrip.com",
    sourceUrl: "https://careers.makemytrip.com/prod/opportunity/a6454a4158952f/visa-operations",
    confidence: "High apply link",
    currentRole: "Official careers portal includes Gurugram roles and national open hiring route",
    applyLink: "https://careers.makemytrip.com",
    linkedin: "https://www.linkedin.com/company/makemytrip.com/",
    companySize: "2,500+",
    worthApplying: "Yes via portal",
    notes: "Official Darwinbox portal preferred; no public application inbox confirmed.",
  },
  {
    company: "Goibibo",
    location: "Gurugram",
    website: "https://www.goibibo.com",
    careers: "https://careers.makemytrip.com",
    sourceUrl: "https://careers.makemytrip.com",
    confidence: "High apply link",
    currentRole: "Apply through MakeMyTrip/Go-MMT careers portal",
    applyLink: "https://careers.makemytrip.com",
    linkedin: "https://www.linkedin.com/company/goibibo/",
    companySize: "Unknown",
    worthApplying: "Yes via portal",
    notes: "Goibibo is part of the MakeMyTrip group; no public Goibibo application inbox confirmed.",
  },
  {
    company: "ixigo",
    location: "Gurugram",
    website: "https://www.ixigo.com",
    careers: "https://careers.ixigo.com/",
    sourceUrl: "https://careers.ixigo.com/",
    confidence: "High apply link",
    currentRole: "Sr. UI Developer (ReactJS), Senior Research Engineer - Applied AI/ML, QA - SDET, AI Product Manager",
    applyLink: "https://careers.ixigo.com/",
    linkedin: "https://www.linkedin.com/company/ixigo.com/",
    companySize: "250+",
    worthApplying: "Yes via portal",
    notes: "Official careers page has relevant roles and an 'Apply for Another Position' flow; local tracker already marked ixigo portal-only.",
  },
  {
    company: "OYO",
    location: "Gurugram",
    website: "https://www.oyorooms.com",
    careers: "https://www.oyorooms.com/team",
    careerEmail: "careers@oyorooms.com",
    sourceUrl: "https://api.urlscan.io/result/01968ad9-b807-72a8-980a-4b64c91e99ca",
    confidence: "Medium",
    currentRole: "Hospitality and tech-enabled operations roles; tech roles vary",
    applyLink: "https://www.oyorooms.com/team",
    linkedin: "https://www.linkedin.com/company/oyo-rooms/",
    companySize: "5,000+",
    worthApplying: "Yes",
    notes: "Public scan of OYO official asset exposes 'Come work with us' careers@oyorooms.com; MX verified.",
  },
  {
    company: "Zomato",
    location: "Gurugram",
    website: "https://www.zomato.com",
    careers: "https://www.zomato.com/careers",
    sourceUrl: "https://openhiring.in/jobs/backend-engineer-nodejs-js9wx",
    confidence: "Medium apply link",
    currentRole: "Backend Engineer - Node.js public listing redirects to official portal",
    applyLink: "https://www.zomato.com/careers",
    linkedin: "https://www.linkedin.com/company/zomato/",
    companySize: "5,000+",
    worthApplying: "Yes via portal",
    notes: "Only non-career statutory/customer emails found; no public application inbox confirmed.",
  },
  {
    company: "Blinkit",
    location: "Gurugram",
    website: "https://blinkit.com",
    careers: "https://blinkit.com/careers/careers/careers/",
    sourceUrl: "https://blinkit.com/careers/careers/careers/",
    confidence: "High apply link",
    currentRole: "Careers page highlights tech stacks; current jobs require portal search",
    applyLink: "https://blinkit.com/careers/careers/careers/",
    linkedin: "https://www.linkedin.com/company/letsblinkit/",
    companySize: "5,000+",
    worthApplying: "Yes via portal",
    notes: "Official careers route found; no public application inbox confirmed.",
  },
  {
    company: "Urban Company",
    location: "Gurugram",
    website: "https://www.urbancompany.com",
    careers: "https://careers.urbancompany.com/",
    careerEmail: "careers@urbancompany.com",
    sourceUrl: "https://careers.urbancompany.com/jobs",
    confidence: "High",
    currentRole: "Engineering & Data, Product Design, Product roles via official jobs page",
    applyLink: "https://careers.urbancompany.com/jobs",
    linkedin: "https://www.linkedin.com/company/urban-company/",
    companySize: "1,000+",
    worthApplying: "Yes",
    notes: "Official jobs page says to share your resume at careers@urbancompany.com; MX verified.",
  },
  {
    company: "Delhivery",
    location: "Gurugram",
    website: "https://www.delhivery.com",
    careers: "https://www.delhivery.com/careers",
    sourceUrl: "https://in.linkedin.com/jobs/view/software-engineer-at-delhivery-4375506057",
    confidence: "Medium apply link",
    currentRole: "Software Engineer public LinkedIn listing in Gurugram",
    applyLink: "https://www.delhivery.com/careers",
    linkedin: "https://www.linkedin.com/company/delhivery/",
    companySize: "10,000+",
    worthApplying: "Yes via portal",
    notes: "A historic jobs@delhivery.com appears in a college placement list, but no current official application inbox was confirmed; skipped email send.",
  },
  {
    company: "Shiprocket",
    location: "Gurugram",
    website: "https://www.shiprocket.in",
    careers: "https://careers.shiprocket.in/",
    hrEmail: "hr@shiprocket.in",
    sourceUrl: "https://www.onedios.com/shiprocket-customer-care",
    confidence: "Medium",
    currentRole: "GoLang Developer, Android Application Developer, analytics and program roles",
    applyLink: "https://careers.shiprocket.in/",
    linkedin: "https://www.linkedin.com/company/shiprocket/",
    companySize: "1,000+",
    worthApplying: "Yes",
    notes: "Official careers page exposes a masked email and public directory lists hr@shiprocket.in for careers; MX verified.",
  },
  {
    company: "Cars24",
    location: "Gurugram",
    website: "https://www.cars24.com",
    careers: "https://www.cars24.com/careers/",
    sourceUrl: "https://www.cars24.com/careers//",
    confidence: "High apply link",
    currentRole: "Technology & Product roles via official careers page",
    applyLink: "https://www.cars24.com/careers/",
    linkedin: "https://www.linkedin.com/company/cars24/",
    companySize: "5,000+",
    worthApplying: "Yes via portal",
    notes: "Official careers route found; local tracker already marked CARS24 portal-only.",
  },
  {
    company: "CarDekho / GirnarSoft",
    location: "Gurugram",
    website: "https://www.girnarsoft.com",
    careers: "https://www.girnarsoft.com/careers",
    sourceUrl: "https://jobs.klimb.io/girnarsoft/62e13a84d4b6c0a0527adeb0?source=careers",
    confidence: "High apply link",
    currentRole: "Senior Software Engineer - FullStack, Gurugram",
    applyLink: "https://www.girnarsoft.com/careers",
    linkedin: "https://www.linkedin.com/company/cardekho/",
    companySize: "1,000+",
    worthApplying: "Yes via portal",
    notes: "Official/Klimb apply route found; no public HR/career inbox confirmed.",
  },
  {
    company: "Spinny",
    location: "Gurugram",
    website: "https://www.spinny.com",
    careers: "https://www.spinny.com/careers/",
    careerEmail: "you@spinny.com",
    sourceUrl: "https://www.spinny.com/careers/",
    confidence: "High",
    currentRole: "Technology/Product roles via Spinny job openings",
    applyLink: "https://www.spinny.com/careers/",
    linkedin: "https://www.linkedin.com/company/spinny/",
    companySize: "1,000+",
    worthApplying: "Yes",
    notes: "Official careers page says 'write to us at you@spinny.com'; MX verified.",
  },
  {
    company: "Park+",
    location: "Gurugram",
    website: "https://parkplus.io",
    careers: "https://parkplus.io/careers/jobs",
    sourceUrl: "https://parkplus.io/careers/jobs",
    confidence: "High apply link",
    currentRole: "Technology roles in Gurugram via official jobs page",
    applyLink: "https://parkplus.io/careers/jobs",
    linkedin: "https://www.linkedin.com/company/parkplus/",
    companySize: "201-500",
    worthApplying: "Yes via portal",
    notes: "Official jobs page found; local tracker already marked Park+ portal-only.",
  },
  {
    company: "Policybazaar",
    location: "Gurugram",
    website: "https://www.policybazaar.com",
    careers: "https://www.policybazaar.com/careers/",
    careerEmail: "careers@policybazaar.com",
    sourceUrl: "https://applications.csjmu.ac.in/naacfiles/criteria5/5.2.2%205.pdf",
    confidence: "Medium",
    currentRole: "Careers in Technology via official careers form; public listings include React Native and Full Stack roles",
    applyLink: "https://www.policybazaar.com/careers/",
    linkedin: "https://www.linkedin.com/company/policybazaar-com/",
    companySize: "10,000+",
    worthApplying: "Portal preferred",
    notes: "Official careers page uses upload form; placement PDF lists careers@policybazaar.com. Skipped email send because official page prefers form.",
  },
  {
    company: "Paisabazaar",
    location: "Gurugram",
    website: "https://www.paisabazaar.com",
    careers: "https://www.paisabazaar.com/careers",
    careerEmail: "careers+tech@paisabazaar.com",
    sourceUrl: "https://www.paisabazaar.com/careers",
    confidence: "High",
    currentRole: "Data Science, Back-end Engineering, Full-stack development, UI/UX Design, Analytics",
    applyLink: "https://www.paisabazaar.com/careers",
    linkedin: "https://www.linkedin.com/company/paisabazaar/",
    companySize: "1,000+",
    worthApplying: "Yes",
    notes: "Official careers page asks technology candidates to send resume and cover letter to careers+tech@paisabazaar.com; MX verified.",
  },
  {
    company: "MobiKwik",
    location: "Gurugram",
    website: "https://www.mobikwik.com",
    careers: "https://www.mobikwik.com/careers/",
    careerEmail: "ta@mobikwik.com",
    sourceUrl: "https://www.mobikwik.com/careers/",
    confidence: "High",
    currentRole: "Software Developer II, Data Engineer, QA and fintech technology roles via official/partner job boards",
    applyLink: "https://www.mobikwik.com/careers/",
    linkedin: "https://www.linkedin.com/company/mobikwik/",
    companySize: "600+",
    worthApplying: "Yes",
    notes: "Official careers page says to email ta@mobikwik.com if no listed role fits; MX verified.",
  },
  {
    company: "BharatPe",
    location: "Gurugram",
    website: "https://bharatpe.com",
    careers: "https://careers.peakxv.com/jobs/bharatpe",
    careerEmail: "careers@bharatpe.com",
    sourceUrl: "https://www.linkedin.com/posts/bharatpe_buildingforbharat-bharatpe-legaljobs-activity-6932581877073461249-7Hw7",
    confidence: "Medium",
    currentRole: "Data Engineer I and fintech roles shown on public jobs pages",
    applyLink: "https://careers.peakxv.com/jobs/bharatpe",
    linkedin: "https://www.linkedin.com/company/bharatpe/",
    companySize: "1,000+",
    worthApplying: "Yes",
    notes: "BharatPe public LinkedIn post asks candidates to send CVs to careers@bharatpe.com; MX verified.",
  },
  {
    company: "PayU",
    location: "Gurugram",
    website: "https://payu.in",
    careers: "https://corporate.payu.in/careers/",
    sourceUrl: "https://careers.payu.in/PayU/job/Gurgaon-AI-Engineer/53413680/",
    confidence: "High apply link",
    currentRole: "AI Engineer, Java Developer, BA Risk Lending Analytics and other PayU India roles",
    applyLink: "https://corporate.payu.in/careers/",
    linkedin: "https://www.linkedin.com/company/payu/",
    companySize: "2,000+",
    worthApplying: "Yes via portal",
    notes: "Official PayU India careers route found; no public application inbox confirmed.",
  },
];

const sentCandidates = [
  {
    company: "OYO",
    role: "Frontend / Full-Stack / Backend Developer",
    recipients: "careers@oyorooms.com",
    reason: "public careers email from an official OYO asset",
    companyContext: "OYO's hospitality technology platform depends on scalable booking flows, internal tools, and service integrations",
  },
  {
    company: "Urban Company",
    role: "Frontend / Full-Stack Developer",
    recipients: "careers@urbancompany.com",
    reason: "official careers email",
    companyContext: "Urban Company's marketplace and service-professional platform relies on polished product flows and reliable engineering systems",
  },
  {
    company: "Shiprocket",
    role: "Backend / Full-Stack Developer",
    recipients: "hr@shiprocket.in",
    reason: "public careers HR email",
    companyContext: "Shiprocket's e-commerce logistics platform needs strong backend services, integrations, and operational dashboards",
  },
  {
    company: "Spinny",
    role: "Frontend / Full-Stack Developer",
    recipients: "you@spinny.com",
    reason: "official careers contact email",
    companyContext: "Spinny's auto-commerce product depends on trustworthy, transparent digital buying and selling experiences",
  },
  {
    company: "Paisabazaar",
    role: "Full-Stack / Backend / Frontend Developer",
    recipients: "careers+tech@paisabazaar.com",
    reason: "official technology careers email",
    companyContext: "Paisabazaar's credit marketplace uses technology, data, APIs, and customer-facing journeys at scale",
  },
  {
    company: "MobiKwik",
    role: "Frontend / Backend / Full-Stack Developer",
    recipients: "ta@mobikwik.com",
    reason: "official talent acquisition email",
    companyContext: "MobiKwik's fintech products rely on secure, high-volume payment and consumer finance experiences",
  },
  {
    company: "BharatPe",
    role: "Backend / Full-Stack / Data-Driven Product Developer",
    recipients: "careers@bharatpe.com",
    reason: "public BharatPe careers email",
    companyContext: "BharatPe's merchant fintech platform needs dependable payment flows, dashboards, APIs, and product features",
  },
];

const focusForRole = (role) => {
  const value = role.toLowerCase();
  if (value.includes("backend")) {
    return "Node.js APIs, database-backed services, integrations, and practical full-stack delivery";
  }
  if (value.includes("data")) {
    return "API-backed products, SQL/PostgreSQL/MongoDB data work, React dashboards, and reliable full-stack delivery";
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
        ? "not selected due to portal preference or weaker non-official route"
        : "apply link only / no public email confirmed",
  }));

const markdown = [
  "# Gurugram/Haryana Batch 4 Research",
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
  scope: "Companies 61-80 from user-provided Gurugram/Haryana list",
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
