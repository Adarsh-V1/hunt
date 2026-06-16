You are continuing a job application tracker and Gmail outreach project.

Main priority:
The app should now support sending job application emails through SMTP using Nodemailer.

Do not redesign or improve the tracker UI unless specifically asked.
Focus only on backend email sending, resume attachment, validation, and tracker status updates.

Important rules:
- Do not add new companies.
- Do not invent emails, websites, LinkedIn URLs, company size, dates, or sent status.
- Do not send emails, applications, or outreach of any kind to `Paras Technologies`; the user currently works there.
- Only send application emails to tracker-backed companies that already exist in the tracker data.
- Only send to emails already stored in the company record or provided by the user.
- Do not send an application email without a resume attachment.
- Only mark status as "Sent" after the email successfully sends.
- If sending fails, keep status unchanged and show the error.
- Store sending result in company notes.

Public contact research rules:
- When the user asks to apply or prepare outreach for a company, first make a best-effort search for publicly listed application channels before giving up.
- Prefer official company careers pages, contact pages, recruiting pages, LinkedIn company pages, and other verified public sources.
- Look for careers, jobs, recruiting, talent, HR, people operations, or hiring contact emails only when they are publicly listed.
- If no public recruiting email is available, look for an official application portal or careers form and record that as the application path.
- Never invent, guess, extrapolate, or generate email addresses from names or domains.
- Never use private, leaked, or unverified contact data.
- Only store or use emails that are explicitly shown in a reliable public source or directly provided by the user.
- If no verified email exists but an official portal exists, note that the company is portal-based and keep email fields unchanged.
- If no verified public email or official portal can be found, record that clearly in notes instead of fabricating a path.

Company JSON structure:

{
  "id": 1,
  "companyNumber": 1,
  "companyName": "", 
  "roleTarget": "",
  "location": "",
  "companySize": "",
  "website": "",
  "linkedin": "",
  "basicInfo": "",
  "appliedDate": "",
  "status": "Pending",
  "emails": [],
  "notes": ""
}

Task:
Add SMTP email sending support using Nodemailer.

Requirements:
1. Install and use Nodemailer.
2. Add a reusable email service/helper.
3. Create an API route:

/api/send-application-email

4. The API route should accept multipart/form-data with:
- companyId
- companyName
- roleTarget
- recipientEmail
- subject
- body
- resume file

5. Validate before sending:
- recipientEmail is required
- subject is required
- body is required
- resume file is required
- resume file must be PDF or DOCX
- company must exist in tracker data

6. Use Nodemailer SMTP config from env variables.

Use these env variables:

MAIL_HOST="smtp.gmail.com"
MAIL_USER=""
MAIL_PASS=""
MAIL_PORT="465"
MAIL_PROTOCOL="smtps"
MAIL_SECURE=true
MAIL_FROM=""

7. Create transporter like:

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT),
  secure: process.env.MAIL_SECURE === "true",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

8. Send email with attachment:

attachments: [
  {
    filename: resumeFileName,
    content: resumeBuffer,
    contentType: resumeMimeType,
  },
]

9. Resume must support:
- application/pdf
- application/vnd.openxmlformats-officedocument.wordprocessingml.document

10. After successful send:
- update company status to "Sent"
- set appliedDate to current date
- append tracker notes with:
  - email used
  - sent date
  - resume filename
  - send success message

11. If sending fails:
- do not update status
- do not update appliedDate
- append failure/error message only if useful
- return clean error response to frontend

12. Frontend:
Add a simple "Send Application Email" action for a company.
It should allow:
- selecting recipient email from company.emails
- editing subject
- editing body
- uploading resume PDF/DOCX
- sending email
- showing success or failure message

13. Default email template:

Subject:
Application for Full-Stack Developer Role

Body:
Hello Recruitment Team,

I am reaching out to explore opportunities at [Company Name] as a Full-Stack JavaScript, React.js, or Node.js Developer. Over the past six months, I have worked as a Software Engineering Intern at Paras Technologies in Mohali, gaining hands-on experience building a production web application with Next.js, React, and TypeScript.

During my internship, I developed frontend features using Zustand, TanStack Query, Tailwind CSS, and shadcn/ui. I also worked on type-safe APIs with tRPC and backend services using Node.js, Hono.js, Prisma, and MongoDB. This experience has helped me understand the complete development process, from building responsive interfaces to integrating APIs and working with databases.

I am now looking for a role where I can contribute to real products, strengthen my skills, and grow with an experienced engineering team. I have attached my resume for your review and would appreciate an opportunity to discuss my profile in an interview.

Best regards,
Adarsh Pathania
Phone: +91 78890 78854
Email: adarsh.pathania.04@gmail.com
LinkedIn: https://www.linkedin.com/in/adarshpathania04/
GitHub: https://github.com/Adarsh-V1

14. Keep the implementation clean, safe, and production-ready.
15. Do not expose SMTP password in frontend code.
16. Do not commit .env file.
17. Add .env.example with empty values only.
