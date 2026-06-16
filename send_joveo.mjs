import dotenv from "dotenv";
dotenv.config();
import fs from "fs";
import { sendApplicationEmail } from "./server/emailService.js";
import { recordApplicationEmailSent } from "./server/trackerData.js";

const buf = fs.readFileSync("/home/gehrman/door/hunt/src/resume/Adarsh_Pathania_resume.pdf");
const emailFile = { originalname: "Adarsh_Pathania_resume.pdf", filename: "Adarsh_Pathania_resume.pdf", mimetype: "application/pdf", buffer: buf, size: buf.length };

const body = `Hello Recruitment Team,
I am reaching out to explore opportunities at COMPANY_NAME as a Full-Stack JavaScript, React.js, or Node.js Developer. Over the past six months, I have worked as a Software Engineering Intern at Paras Technologies in Mohali, gaining hands-on experience...

Best regards,
Adarsh Pathania`;

const remaining = [
  [455,"JOVEO","careers@joveo.com"],
  [456,"Wells Fargo","wellsfargocareers@wellsfargo.com"],
  [457,"The Hut Group","csrecruitment@thehutgroup.com"],
  [458,"CapitalOne","careers@capitalone.com"],
  [459,"American Express","recruitment.support.india@aexp.com"],
  [460,"Gameskraft","grievance.officer@gameskraft.com"],
  [461,"Citicorp","candidatehelp@citi.com"],
  [462,"GlobalHunt","jobs@globalhunt.in"],
  [463,"Maybank","AVerma@maybank.co.id"],
  [464,"Circana","Talent.Acquisition@Circana.com"],
  [465,"FinBox","sales@finbox.in"],
  [806,"Adobe","accommodations@adobe.com"],
  [957,"CoinSwitch","support@coinswitch.co"],
];

async function main() {
  for (const [id, name, email] of remaining) {
    try {
      const b = body.replace("COMPANY_NAME", name);
      console.log(`${name}...`);
      const r = await sendApplicationEmail({companyId:id,recipientEmail:email,subject:"Application for Full-Stack Developer Role",body:b,companyName:name,roleTarget:"Full-Stack Developer",resumeFile:emailFile});
      await recordApplicationEmailSent({companyId:id,companyName:name,recipientEmail:r.recipientEmail,resumeFileName:r.resumeFileName,message:"Email sent successfully."});
      console.log(`  OK ${r.messageId}`);
    } catch(e) {
      console.log(`  FAIL ${e.message}`);
    }
  }
}
main();
