import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import { sendApplicationEmail } from "./server/emailService.js";
import { recordApplicationEmailSent } from "./server/trackerData.js";

dotenv.config();

const resumePath = "/home/gehrman/door/hunt/src/resume/Adarsh_Pathania_resume.pdf";
const resumeBuffer = fs.readFileSync(resumePath);
const resumeFile = {
  originalname: "Adarsh_Pathania_resume.pdf",
  filename: "Adarsh_Pathania_resume.pdf",
  mimetype: "application/pdf",
  buffer: resumeBuffer,
  size: resumeBuffer.length,
};

const companies = [
  {
    companyId: 402,
    companyName: "RingCentral",
    roleTarget: "Full-Stack Developer",
    recipientEmail: "careers@ringcentral.com",
  },
  {
    companyId: 403,
    companyName: "Nexthink",
    roleTarget: "Full-Stack Developer",
    recipientEmail: "dl-talent-acquisition@nexthink.com",
  },
];

const templateSubject = (role) => `Application for ${role} - Adarsh Pathania`;
const templateBody = (role, company) =>
`Hello,

I am writing to apply for the ${role} opportunity at ${company}. I am a Full-Stack Developer experienced with React, Next.js, TypeScript, Node.js, and modern databases.

My one-page resume is attached. I would appreciate the opportunity to discuss my experience and suitability for the role in an interview.

Thank you for your time and consideration.

Best regards,
Adarsh Pathania`;

async function main() {
  const results = [];
  for (const c of companies) {
    try {
      const subject = templateSubject(c.roleTarget);
      const body = templateBody(c.roleTarget, c.companyName);

      console.log(`Sending to ${c.companyName} (${c.recipientEmail})...`);

      const sendResult = await sendApplicationEmail({
        companyId: c.companyId,
        recipientEmail: c.recipientEmail,
        subject,
        body,
        companyName: c.companyName,
        roleTarget: c.roleTarget,
        resumeFile,
      });

      console.log(`  SMTP OK: ${sendResult.messageId}`);

      const updatedCompany = await recordApplicationEmailSent({
        companyId: c.companyId,
        companyName: c.companyName,
        recipientEmail: sendResult.recipientEmail,
        resumeFileName: sendResult.resumeFileName,
        message: "Email sent successfully.",
      });

      console.log(`  Tracker updated: ${updatedCompany.status}`);

      results.push({
        company: c.companyName,
        recipient: c.recipientEmail,
        role: c.roleTarget,
        result: "Sent",
        messageId: sendResult.messageId,
      });
    } catch (err) {
      console.error(`FAILED ${c.companyName}:`, err.message);
      try {
        await recordApplicationEmailFailure({
          companyId: c.companyId,
          companyName: c.companyName,
          recipientEmail: c.recipientEmail,
          message: err.message,
        });
      } catch (_) {}
      results.push({
        company: c.companyName,
        recipient: c.recipientEmail,
        role: c.roleTarget,
        result: "Failed",
        messageId: err.message,
      });
    }
  }

  console.log("\n=== RESULTS ===");
  console.log("Company | Recipient | Role | Result | Message ID / Error");
  console.log("--- | --- | --- | --- | ---");
  for (const r of results) {
    console.log(`${r.company} | ${r.recipient} | ${r.role} | ${r.result} | ${r.messageId}`);
  }
}

main().catch(console.error);
