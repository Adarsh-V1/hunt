import fs from "node:fs";
import dotenv from "dotenv";
import { sendApplicationEmail } from "./server/emailService.js";
import { recordApplicationEmailSent, recordApplicationEmailFailure } from "./server/trackerData.js";

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
  {name:"Smallcase",email:"work@smallcase.com"},
  {name:"TechMojo Solutions",email:"careers@techmojo.com"},
  {name:"Deutsche Bank",email:"hr.direct@db.com"},
  {name:"Riskcovry",email:"hello@riskcovry.com"},
  {name:"C-DOT",email:"hrdrec@cdot.in"},
  {name:"TechBlocks",email:"careers@tblocks.com"},
  {name:"OneCard",email:"careers@onescore.app"},
];

const body = `Hello,

I hope you are doing well.

I am applying for the Full-Stack Developer position at COMPANY_NAME. I am a Full-Stack Developer skilled in Next.js, React, TypeScript, Node.js, tRPC, Hono.js, Prisma, MongoDB, PostgreSQL, Tailwind CSS, and shadcn/ui.

I have attached my resume for your review.

Thank you for your time and consideration.

Best regards,
Adarsh Pathania`;

async function main() {
  const results = [];
  for (const c of companies) {
    try {
      const customizedBody = body.replace("COMPANY_NAME", c.name);
      console.log(`Sending to ${c.name} <${c.email}>...`);

      const sendResult = await sendApplicationEmail({
        companyName: c.name,
        recipientEmail: c.email,
        subject: `Application for Full-Stack Developer Role - Adarsh Pathania`,
        body: customizedBody,
        roleTarget: "Full-Stack Developer",
        resumeFile,
      });

      console.log(`  OK: ${sendResult.messageId}`);

      await recordApplicationEmailSent({
        companyName: c.name,
        recipientEmail: sendResult.recipientEmail,
        resumeFileName: sendResult.resumeFileName,
        message: "Email sent successfully.",
      });

      console.log(`  Tracker updated.`);
      results.push({ c: c.name, r: c.email, s: "Sent", id: sendResult.messageId });
    } catch (err) {
      console.error(`  FAIL: ${err.message}`);
      try { await recordApplicationEmailFailure({ companyName: c.name, recipientEmail: c.email, message: err.message }); } catch (_) {}
      results.push({ c: c.name, r: c.email, s: "Failed", id: err.message });
    }
  }
  console.log("\nCompany | Recipient | Result | Message ID");
  console.log("--- | --- | --- | ---");
  for (const r of results) console.log(`${r.c} | ${r.r} | ${r.s} | ${r.id}`);
}
main().catch(console.error);
