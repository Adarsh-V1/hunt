import fs from "node:fs/promises";
import path from "node:path";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const RESUME_PATH = path.resolve("src/resume/Adarsh_Pathania_resume.pdf");
const TRACKER_PATH = path.resolve("src/data/trackerOverrides.json");

const env = (k) => process.env[k] || "";
const host = env("MAIL_HOST");
const port = Number.parseInt(env("MAIL_PORT"), 10);
const user = env("MAIL_USER");
const pass = env("MAIL_PASS");
const from = env("MAIL_FROM") || env("SMTP_FROM") || user;
const secure = env("MAIL_SECURE")?.toLowerCase() === "true";

const resumeBuffer = await fs.readFile(RESUME_PATH);
const resumeFileName = "Adarsh_Pathania_resume.pdf";

const subject = "Application for React / Full-Stack Role - Adarsh Pathania";

const body = `Hello,

I hope you are doing well.

My name is Adarsh Pathania, and I am currently looking for a React / Full-Stack Developer role. I have completed 6 months of internship experience at Paras Technologies, where I worked on building web applications using modern frontend and backend technologies.

My core skills include React, Next.js, TypeScript, Node.js, tRPC, Hono.js, Prisma, MongoDB, PostgreSQL, Tailwind CSS, and shadcn/ui. During my internship, I worked on responsive user interfaces, API integrations, databases, and end-to-end feature development.

I have attached my resume for your review. I would be grateful if you could consider my profile for any suitable opportunity.

Thank you for your time and consideration.

Best regards,
Adarsh Pathania
+91 78890 78854
LinkedIn: https://www.linkedin.com/in/adarshpathania04/
GitHub: https://github.com/Adarsh-V1`;

const transporter = nodemailer.createTransport({ host, port, secure, auth: { user, pass } });

const sentDate = (() => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
})();

const companies = [
  { name: "Coforge",         emails: ["US.Recruitment@coforge.com"] },
  { name: "Cognizant",       emails: ["humanresources@cognizant.com", "TAGcompliance2@cognizant.com"] },
  { name: "Clix Capital",    emails: ["careers@clix.capital", "hello@clix.capital"] },
  { name: "Concentrix",      emails: ["hiring.helpdesk@concentrix.com", "socialmedia.jm@concentrix.com"] },
  { name: "Conduent",        emails: ["RecruitmentContactCenter@conduent.com"] },
  { name: "Credgenics",      emails: ["careers@credgenics.com", "support@credgenics.com", "marketing@credgenics.com"] },
];

const loadOverrides = async () => {
  try {
    return JSON.parse(await fs.readFile(TRACKER_PATH, "utf8"));
  } catch { return []; }
};

const saveOverrides = async (data) => {
  await fs.writeFile(TRACKER_PATH, JSON.stringify(data, null, 2) + "\n", "utf8");
};

let overrides = await loadOverrides();

for (const company of companies) {
  for (const email of company.emails) {
    try {
      console.log(`[${company.name}] Sending to ${email}...`);
      const result = await transporter.sendMail({
        from, to: email, subject, text: body, replyTo: user,
        attachments: [{ filename: resumeFileName, content: resumeBuffer, contentType: "application/pdf" }],
      });
      console.log(`  ✓ Sent: ${result.messageId}`);

      const note = `SMTP sent on ${sentDate}; email used: ${email}; resume filename: ${resumeFileName}; result: Email sent successfully.`;

      const existing = overrides.find((e) => e.companyName === company.name);
      if (existing) {
        existing.notes = existing.notes ? existing.notes + " " + note : note;
        existing.emails = [...new Set([...(existing.emails || []), email])];
        existing.appliedDate = sentDate;
        existing.status = "Sent";
      } else {
        overrides.push({
          id: 1000 + overrides.length,
          companyNumber: 1000 + overrides.length,
          companyName: company.name,
          roleTarget: "React / Full-Stack",
          location: "",
          companySize: "Unknown",
          website: "", linkedin: "",
          basicInfo: `Target role: React / Full-Stack. Preferred location: Unknown.`,
          appliedDate: sentDate, status: "Sent", emails: [email], notes: note,
        });
      }
      await saveOverrides(overrides);
      console.log(`  ✓ Tracker updated`);
    } catch (err) {
      console.error(`  ✗ Failed: ${err.message}`);
    }
  }
}

console.log("\nDone.");
