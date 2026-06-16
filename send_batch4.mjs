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
  {id:428,name:"ARM Embedded Technologies",email:"accommodations@arm.com"},
  {id:429,name:"New Relic",email:"resume@newrelic.com"},
  {id:430,name:"OnePlus",email:"support@oneplus.com"},
  {id:431,name:"Cult.fit",email:"hello@cultfit.com"},
  {id:432,name:"TriNet",email:"recruiting@trinet.com"},
  {id:433,name:"H&M",email:"recruitment_support@hm.com"},
  {id:434,name:"Cisco",email:"hiring@careers.cisco.com"},
  {id:435,name:"IKEA India",email:"customer.support.in@ikea.com"},
  {id:437,name:"6sense",email:"jobs@6sense.com"},
  {id:438,name:"SolarWinds",email:"privacy@solarwinds.com"},
  {id:439,name:"Admiral Group",email:"contactus@admiralindia.com"},
  {id:440,name:"Sodexo",email:"careers.india@sodexo.com"},
  {id:441,name:"Blinkit",email:"future@blinkit.com"},
  {id:442,name:"Fastenal",email:"jsoderbe@fastenal.com"},
  {id:443,name:"Harness",email:"security@harness.io"},
  {id:444,name:"Saven Tech",email:"hr@saven.in"},
  {id:445,name:"Qualcomm",email:"accommodations@qualcomm.com"},
  {id:446,name:"Condé Nast India",email:"talentacquisition@condenast.com"},
  {id:447,name:"Tesco Bengaluru",email:"candidatecare@tesco.com"},
  {id:448,name:"T-Mobile",email:"ApplicantAccommodation@t-mobile.com"},
  {id:449,name:"Citrix R&D India",email:"prashanth.mallya@citrix.com"},
  {id:450,name:"Kaleris",email:"Talentteam@Kaleris.com"},
  {id:451,name:"MWebWare Software Services",email:"info@mwebware.com"},
  {id:452,name:"Volvo Group",email:"career@volvocars.com"},
  {id:453,name:"DigiCert",email:"people@digicert.com"},
  {id:454,name:"Abbott",email:"Nandini.goswami@abbott.com"},
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
      results.push({ c: c.name, r: c.email, s: "Sent", id: sendResult.messageId });
    } catch (err) {
      console.error(`  FAIL: ${err.message}`);
      try { await recordApplicationEmailFailure({ companyId: c.id, companyName: c.name, recipientEmail: c.email, message: err.message }); } catch (_) {}
      results.push({ c: c.name, r: c.email, s: "Failed", id: err.message });
    }
  }
  console.log("\nCompany | Recipient | Result | Message ID");
  console.log("--- | --- | --- | ---");
  for (const r of results) console.log(`${r.c} | ${r.r} | ${r.s} | ${r.id}`);
}
main().catch(console.error);
