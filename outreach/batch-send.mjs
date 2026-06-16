import fs from "node:fs/promises";
import path from "node:path";
import "dotenv/config";
import { sendApplicationEmail } from "../server/emailService.js";

const RESUME_PATH = path.resolve("src/resume/Adarsh_Pathania_resume.pdf");
const RESUME_FILENAME = "Adarsh_Pathania_resume.pdf";

const today = () => new Date().toISOString().slice(0, 10);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const loadResumeFile = async () => {
  const buffer = await fs.readFile(RESUME_PATH);
  return {
    buffer,
    originalname: RESUME_FILENAME,
    mimetype: "application/pdf",
  };
};

const getDraftSubject = (roleTarget) =>
  `Application for ${roleTarget || "Frontend / React / Full-Stack"} Role - Adarsh Pathania`;

const getDraftBody = (companyName, roleTarget) => {
  const role = roleTarget || "Frontend / React / Full-Stack";
  return [
    "Hello,",
    "",
    "I hope you are doing well.",
    "",
    `My name is Adarsh Pathania, and I am applying for the ${role} position at ${companyName}. I am currently working at Paras Technologies and have over 3 years of hands-on experience building production-grade web applications.`,
    "",
    "My core stack includes React, Next.js, TypeScript, Node.js, tRPC, Hono.js, Prisma, MongoDB, PostgreSQL, Tailwind CSS, and shadcn/ui. In my recent work, I have built responsive user interfaces, integrated backend APIs, worked across databases, and shipped end-to-end product features with a strong focus on clean execution, maintainability, and user experience.",
    "",
    `I believe my frontend and full-stack background would allow me to contribute meaningfully to your team in the ${role} role.`,
    "",
    "I have attached my resume for your review. I would be grateful if you could consider my application and take a look at my profile for any relevant opportunity.",
    "",
    "Thank you for your time and consideration.",
    "",
    "Best regards,",
    "Adarsh Pathania",
    "+91 78890 78854",
    "LinkedIn: https://www.linkedin.com/in/adarshpathania04/",
    "GitHub: https://github.com/Adarsh-V1",
  ].join("\n");
};

const USAGE = `
Usage: node outreach/batch-send.mjs <input.json>

Input JSON file should be an array of objects:
[
  {
    "companyName": "Company Name",
    "roleTarget": "Frontend / React / Full-Stack",
    "recipientEmail": "hr@company.com",
    "subject": "Optional custom subject (default: auto-generated)",
    "body": "Optional custom body (default: auto-generated)"
  }
]

Output: outreach/batch-send-<date>.json (results log)
`;

const main = async () => {
  const inputFile = process.argv[2];
  if (!inputFile) {
    console.log(USAGE);
    process.exit(1);
  }

  const raw = await fs.readFile(inputFile, "utf8");
  const candidates = JSON.parse(raw);

  if (!Array.isArray(candidates) || candidates.length === 0) {
    console.error("Input must be a non-empty array.");
    process.exit(1);
  }

  console.log(`Loaded ${candidates.length} candidates from ${inputFile}`);
  console.log(`Loading bundled resume: ${RESUME_FILENAME}`);
  const resumeFile = await loadResumeFile();
  console.log("Resume loaded.\n");

  const results = [];

  for (let i = 0; i < candidates.length; i++) {
    const item = candidates[i];
    const subject = item.subject || getDraftSubject(item.roleTarget);
    const body = item.body || getDraftBody(item.companyName, item.roleTarget);

    console.log(`[${i + 1}/${candidates.length}] Sending to ${item.companyName} -> ${item.recipientEmail}`);

    try {
      const result = await sendApplicationEmail({
        recipientEmail: item.recipientEmail,
        subject,
        body,
        companyName: item.companyName,
        roleTarget: item.roleTarget || "",
        resumeFile,
      });

      results.push({
        companyName: item.companyName,
        roleTarget: item.roleTarget || "",
        recipientEmail: item.recipientEmail,
        status: "Sent",
        sentDate: today(),
        messageId: result.messageId,
        response: result.response,
        accepted: result.accepted,
        rejected: result.rejected,
        resumeFileName: result.resumeFileName,
      });

      console.log(`   OK  | messageId: ${result.messageId}`);
    } catch (error) {
      results.push({
        companyName: item.companyName,
        roleTarget: item.roleTarget || "",
        recipientEmail: item.recipientEmail,
        status: "Failed",
        error: error?.message || "Unknown send failure",
      });

      console.log(`   FAIL| ${error?.message || "Unknown error"}`);
    }

    if (i < candidates.length - 1) {
      await sleep(1200);
    }
  }

  const sentCount = results.filter((r) => r.status === "Sent").length;
  const failedCount = results.filter((r) => r.status === "Failed").length;

  const log = {
    generatedAt: new Date().toISOString(),
    inputFile,
    inputCount: candidates.length,
    sentCount,
    failedCount,
    resumeAttached: RESUME_FILENAME,
    results,
  };

  const logFileName = `outreach/batch-send-${today()}.json`;
  await fs.writeFile(logFileName, JSON.stringify(log, null, 2));

  console.log(`\n=== SUMMARY ===`);
  console.log(`Sent:   ${sentCount}`);
  console.log(`Failed: ${failedCount}`);
  console.log(`Log:    ${logFileName}`);

  if (failedCount > 0) {
    console.log("\nFailed sends:");
    results
      .filter((r) => r.status === "Failed")
      .forEach((r) => console.log(`  - ${r.companyName}: ${r.error}`));
  }
};

main().catch((error) => {
  console.error("Batch send failed:", error);
  process.exit(1);
});
