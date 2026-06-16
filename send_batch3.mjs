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
  {id:404,name:"InfraCloud Technologies",email:"info@infracloud.io"},
  {id:405,name:"Angel One",email:"support@angelone.in"},
  {id:406,name:"Expedia Group",email:"indiatas@expedia.com"},
  {id:407,name:"Microsoft Research",email:"rakri@microsoft.com"},
  {id:408,name:"Adidas",email:"retail.careers@adidas.com"},
  {id:409,name:"Workday",email:"accommodations@workday.com"},
  {id:410,name:"Maersk Line",email:"marinejobs.india@maersk.com"},
  {id:411,name:"NetApp",email:"investor_relations@netapp.com"},
  {id:412,name:"Dream11",email:"grievanceofficer@dream11.com"},
  {id:413,name:"Anchor Health & Beauty Care",email:"navin@anchorglobal.net"},
  {id:414,name:"ABCI Infrastructures",email:"delhi@abciinfra.com"},
  {id:415,name:"Planview",email:"sales@planview.com"},
  {id:416,name:"Aspire",email:"support@aspireapp.com"},
  {id:417,name:"Demandbase",email:"info@demandbase.com"},
  {id:418,name:"Enphase Energy",email:"recruiting@enphaseenergy.com"},
  {id:419,name:"Slice",email:"help@slice.bank.in"},
  {id:420,name:"PayPal",email:"paypalglobaltalentacquisition@paypal.com"},
  {id:421,name:"Cannyfore Technology Solutions",email:"careers@cannyfore.com"},
  {id:422,name:"Kotak Mahindra Bank",email:"Tech.Careers@kotak.com"},
  {id:423,name:"ITC / ITC Infotech",email:"recruitment.managers@itcinfotech.com"},
  {id:424,name:"ABC Consultants",email:"client@abcconsultants.in"},
  {id:425,name:"JPMorgan Chase & Co.",email:"customerservice.india@jpmorgan.com"},
  {id:426,name:"CommVault",email:"wwrecruitingteam@commvault.com"},
  {id:427,name:"Jaguar Land Rover",email:"talent@jaguarlandrover.com"},
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
        companyId: c.id,
        recipientEmail: c.email,
        subject: "Application for Full-Stack Developer Role",
        body: customizedBody,
        companyName: c.name,
        roleTarget: "Full-Stack Developer",
        resumeFile,
      });

      await recordApplicationEmailSent({
        companyId: c.id,
        companyName: c.name,
        recipientEmail: sendResult.recipientEmail,
        resumeFileName: sendResult.resumeFileName,
        message: "Email sent successfully.",
      });

      console.log(`  OK: ${sendResult.messageId}`);
      results.push({ company: c.name, recipient: c.email, result: "Sent", id: sendResult.messageId });
    } catch (err) {
      console.error(`  FAIL: ${err.message}`);
      try {
        await recordApplicationEmailFailure({
          companyId: c.id,
          companyName: c.name,
          recipientEmail: c.email,
          message: err.message,
        });
      } catch (_) {}
      results.push({ company: c.name, recipient: c.email, result: "Failed", id: err.message });
    }
  }

  console.log("\n=== RESULTS ===");
  console.log("Company | Recipient | Result | Message ID / Error");
  console.log("--- | --- | --- | ---");
  for (const r of results) {
    console.log(`${r.company} | ${r.recipient} | ${r.result} | ${r.id}`);
  }
}

main().catch(console.error);
