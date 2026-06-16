# OpenCode Job Application Instructions

You are working in:

`/home/gehrman/door/hunt`

The SMTP/Nodemailer application-email feature already exists:

- Email service: `server/emailService.js`
- API endpoint: `POST /api/send-application-email`
- Tracker data: `src/data/companies.js` and tracker override files used by the server
- SMTP credentials: server-side environment variables in `.env`

Never expose, print, commit, or place SMTP credentials in frontend code.

## Exact Resume To Attach

For every application email, attach only this file:

`/home/gehrman/door/hunt/src/resume/Adarsh_Pathania_resume.pdf`

This is the approved one-page resume.

Rules:

- Do not edit, regenerate, rename, compress, convert, overwrite, or otherwise modify this PDF.
- Do not use `gen_resume.py`.
- Do not substitute another resume.
- Do not send any email unless this exact PDF is attached.
- Before a send batch, verify that `pdfinfo` reports `Pages: 1`.
- Before a send batch, verify this SHA-256 checksum:

`d573089d7e1f1cfd55b2362b92903e187abb339eaf811c8f517a695d8615460a`

- Abort before sending if the file is missing, is not one page, or the checksum differs.

## When I Share Companies

I will provide Gurugram company names, HR email addresses, and optionally target roles.

For each company:

1. Match the company against an existing tracker record. Matching should be case-insensitive and tolerate harmless spacing differences.
2. see i don't care if the companies does't exist in the tracker .. you add that to tracker and then send them .. 
3. Never send any email or outreach to `Paras Technologies`.
4. Use only the exact HR email supplied by me or an email already stored in that company's tracker record.
5. Never guess, generate, or alter an email address.
6. Validate the email format before sending.
7. If I supplied a new HR email for an existing company, add that exact email to its `emails` array without changing unrelated company data.
8. Use the tracker's `roleTarget`. If it is blank and I did not provide a role, use the approved fallback `Full-Stack Developer`.
9. Prepare a per-company preview containing company, recipient, role, subject, body, and resume filename.
10. Sharing a list by itself means prepare and preview only. Send only when I explicitly say `send`, `send now`, or otherwise clearly authorize the listed batch.

Do not use `send_batch2.mjs`; it can create missing tracker records. Send through the existing tracker-aware `/api/send-application-email` flow so status and notes are updated correctly.

## Approved Email Template

Customize only `[companyName]`. Use this full template.

Subject:

`Application for Full-Stack Developer Role`

Body:

```text
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
```

## Sending And Tracker Updates

Send one email per company to the approved recipient with:

- The customized subject
- The customized plain-text body
- `Adarsh_Pathania_resume.pdf` as an `application/pdf` attachment

After SMTP confirms a successful send:

- Set `status` to `Sent`.
- Set `appliedDate` to the actual current local date.
- Append notes containing the recipient email, sent date, resume filename, SMTP success result, and message ID when available.

If sending fails:

- Keep `status` unchanged.
- Keep `appliedDate` unchanged.
- Do not claim that the application was sent.
- Record a concise useful error in notes only when appropriate.
- Continue with other authorized companies unless the failure indicates a global SMTP or resume-validation problem. For a global problem, stop the batch.

At the end, report a table with:

`Company | Recipient | Role | Result | Message ID or Error`

Never mark an email as sent based only on an attempted request. SMTP success must be confirmed first.


company role will be most likely fullstack js developer okay 

here is the sample cover letter okay 
proper line space after every para 

Hello Recruitment Team,
I am reaching out to explore opportunities at [Company Name] as a Full-Stack JavaScript, React.js, or Node.js Developer. Over the past six months, I have worked as a Software Engineering Intern at Paras Technologies in Mohali, gaining hands-on experience building a production web application with Next.js, React, and TypeScript.
During my internship, I developed frontend features using Zustand, TanStack Query, Tailwind CSS, and shadcn/ui. I also worked on type-safe APIs with tRPC and backend services using Node.js, Hono.js, Prisma, and MongoDB. This experience has helped me understand the complete development process, from building responsive interfaces to integrating APIs and working with databases.
I am now looking for a role where I can contribute to real products, strengthen my skills, and grow with an experienced engineering team. I have attached my resume for your review and would appreciate an opportunity to discuss my profile in an interview.
Best regards,
Adarsh Pathania
Phone: +91 78890 78854
Email: adarsh.pathania.04@gmail.com
LinkedIn: https://www.linkedin.com/in/adarshpathania04/
GitHub: https://github.com/Adarsh-