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
  {id:455,name:"JOVEO",email:"careers@joveo.com"},
  {id:456,name:"Wells Fargo",email:"wellsfargocareers@wellsfargo.com"},
  {id:457,name:"The Hut Group",email:"csrecruitment@thehutgroup.com"},
  {id:458,name:"CapitalOne",email:"careers@capitalone.com"},
  {id:459,name:"American Express",email:"recruitment.support.india@aexp.com"},
  {id:460,name:"Gameskraft",email:"grievance.officer@gameskraft.com"},
  {id:461,name:"Citicorp",email:"candidatehelp@citi.com"},
  {id:462,name:"GlobalHunt",email:"jobs@globalhunt.in"},
  {id:463,name:"Maybank",email:"AVerma@maybank.co.id"},
  {id:464,name:"Circana",email:"Talent.Acquisition@Circana.com"},
  {id:465,name:"FinBox",email:"sales@finbox.in"},
  {id:806,name:"Adobe",email:"accommodations@adobe.com"},
  {id:957,name:"CoinSwitch",email:"support@coinswitch.co"},
];

const body = `Hello Recruitment Team,
I am reaching out to explore opportunities at COMPANY_NAME as a Full-Stack JavaScript, React.js, or Node.js Developer. Over the past six months, I have worked as a Software Engineering Intern at Paras Technologies in Mohali, gaining hands-on experience building a production web application with Next.js, React, and TypeScript.
During my internship, I developed frontend features using Zustand, TanStack Query, Tailwind CSS, and shadcn/ui. I also worked on type-safe APIs with tRPC and backend services using Node.js, Hono.js, Prisma, and MongoDB. This experience has helped me understand the complete development process, from building responsive interfaces to integrating APIs and working with databases.
I am now looking for a role where I can contribute to real products, strengthen my skills, and grow with an experienced engineering team. I have attached my resume for your review and would appreciate an opportunity to discuss my profile in an interview.
Best regards,
Adarsh Pathania
Phone: +91 78890 78854
Email: adarsh.pathania.04@gmail.com
LinkedIn: https://www.linkedin.com/in/adarshpathania04/
GitHub: https://github.com/Adarsh-V1`;

async function main() {
  const results = [];
  for (const c of companies) {
    try {
      const customizedBody = body.replace("COMPANY_NAME", c.name);
      console.log(`[${c.id}] Sending to ${c.name} <${c.email}>...`);

      const sendResult = await sendApplicationEmail({
        companyId: c.id, recipientEmail: c.email,
        subject: "Application for Full-Stack Developer Role",
        body: customizedBody,
        companyName: c.name, roleTarget: "Full-Stack Developer",
        resumeFile,
      });

      await recordApplicationEmailSent({
        companyId: c.id, companyName: c.name,
        recipientEmail: sendResult.recipientEmail,
        resumeFileName: sendResult.resumeFileName,
        message: "Email sent successfully.",
      });

      console.log(`  OK: ${sendResult.messageId}`);
      results.push({ c: c.name, r: c.email, s: "Sent" });
    } catch (err) {
      console.error(`  FAIL: ${err.message}`);
      try { await recordApplicationEmailFailure({ companyId: c.id, companyName: c.name, recipientEmail: c.email, message: err.message }); } catch (_) {}
      results.push({ c: c.name, r: c.email, s: "Failed" });
    }
  }
  console.log("\nCompany | Result");
  console.log("--- | ---");
  for (const r of results) console.log(`${r.c} | ${r.s}`);
}
main().catch(console.error);
