import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import { sendApplicationEmail } from "./server/emailService.js";
import {
  findTrackerCompany,
  recordApplicationEmailSent,
  recordApplicationEmailFailure,
} from "./server/trackerData.js";

dotenv.config();

const RESUME_PATH = path.resolve("src/resume/Adarsh_Pathania_resume.pdf");
if (!fs.existsSync(RESUME_PATH)) {
  console.error("FATAL: Resume not found at", RESUME_PATH);
  process.exit(1);
}

const resumeBuffer = fs.readFileSync(RESUME_PATH);
const resumeFile = {
  buffer: resumeBuffer,
  originalname: "Adarsh_Pathania_resume.pdf",
  mimetype: "application/pdf",
  filename: "Adarsh_Pathania_resume.pdf",
  size: resumeBuffer.length,
};

const SUBJECT = "Application for Full-Stack Developer Role";

const BODY_TEMPLATE = `Hello Recruitment Team,

I am reaching out to explore opportunities at COMPANY_NAME as a Full-Stack JavaScript, React.js, or Node.js Developer. Over the past six months, I have worked as a Software Engineering Intern at Paras Technologies in Mohali, gaining hands-on experience building a production web application with Next.js, React, and TypeScript.

During my internship, I developed frontend features using Zustand, TanStack Query, Tailwind CSS, and shadcn/ui. I also worked on type-safe APIs with tRPC and backend services using Node.js, Hono.js, Prisma, and MongoDB. This experience has helped me understand the complete development process, from building responsive interfaces to integrating APIs and working with databases.

I am now looking for a role where I can contribute to real products, strengthen my skills, and grow with an experienced engineering team. I have attached my resume for your review and would appreciate an opportunity to discuss my profile in an interview.

Best regards,
Adarsh Pathania
Phone: +91 78890 78854
Email: adarsh.pathania.04@gmail.com
LinkedIn: https://www.linkedin.com/in/adarshpathania04/
GitHub: https://github.com/Adarsh-V1`;

const DELAY_BETWEEN_SENDS_MS = 1500; // 1.5s delay to avoid rate limiting

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  // Load pending companies directly from overrides file
  const overridesPath = new URL("./src/data/trackerOverrides.json", import.meta.url);
  const allCompanies = JSON.parse(fs.readFileSync(overridesPath, "utf-8"));
  const pending = allCompanies.filter(
    (c) => c.status === "Pending" && c.emails && c.emails.length > 0
  );

  console.log(`Found ${pending.length} pending companies to send to.`);

  const results = [];

  for (const company of pending) {
    for (const email of company.emails) {
      try {
        const body = BODY_TEMPLATE.replace("COMPANY_NAME", company.companyName);
        console.log(
          `[${company.id}] Sending to ${company.companyName} <${email}>...`
        );

        const sendResult = await sendApplicationEmail({
          companyId: company.id,
          recipientEmail: email,
          subject: SUBJECT,
          body,
          companyName: company.companyName,
          roleTarget: company.roleTarget || "Full-Stack Developer",
          resumeFile,
        });

        await recordApplicationEmailSent({
          companyId: company.id,
          companyName: company.companyName,
          recipientEmail: sendResult.recipientEmail,
          resumeFileName: sendResult.resumeFileName,
          message: "Email sent successfully.",
        });

        console.log(`  OK: ${sendResult.messageId}`);
        results.push({
          company: company.companyName,
          email,
          result: "Sent",
          id: sendResult.messageId,
        });
      } catch (err) {
        console.error(`  FAIL: ${err.message}`);

        // Only record failure if it's not the last email for this company
        try {
          await recordApplicationEmailFailure({
            companyId: company.id,
            companyName: company.companyName,
            recipientEmail: email,
            message: err.message,
          });
        } catch (_) {}

        results.push({
          company: company.companyName,
          email,
          result: "Failed",
          id: err.message,
        });
      }

      // Delay between sends to avoid hitting rate limits
      await sleep(DELAY_BETWEEN_SENDS_MS);
    }
  }

  // Summary
  const sent = results.filter((r) => r.result === "Sent").length;
  const failed = results.filter((r) => r.result === "Failed").length;

  console.log("\n" + "=".repeat(60));
  console.log("BATCH SEND COMPLETE");
  console.log("=".repeat(60));
  console.log(`Total attempts: ${results.length}`);
  console.log(`Sent: ${sent}`);
  console.log(`Failed: ${failed}`);
  console.log("\n--- Results ---");
  console.log("Company | Email | Result | Message ID");
  console.log("--- | --- | --- | ---");
  for (const r of results) {
    console.log(`${r.company} | ${r.email} | ${r.result} | ${r.id}`);
  }
}

main().catch((err) => {
  console.error("FATAL:", err);
  process.exit(1);
});
