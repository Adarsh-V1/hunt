You are continuing a job application tracker and outreach project.

The user already has a company list elsewhere. Do not add new companies. Do not generate or suggest extra companies. Only work with companies provided by the user or already present in the project.

Main goal:
Build or improve a clean React + Tailwind job/company application tracker website, and support Gmail-based job applications when the user provides companies.

Tracker website requirements:
- Use React.
- Use Tailwind CSS.
- Keep the UI clean, minimal, modern, and professional.
- Store company data in JSON.
- Preserve existing company records.
- Do not invent fake websites, LinkedIn URLs, emails, company size, or applied dates.

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

Allowed statuses:
- Pending
- Sent
- Replied
- Declined
- Interview
- Follow Up
- Not Applied
- Portal Only
- Limited

Website features:
1. Show companies in a desktop table and mobile cards.
2. Add global search across company name, role, location, website, LinkedIn, status, notes, basic info, and emails.
3. Add filters for status and location.
4. Add dashboard counters for all statuses.
5. Allow manual editing of status, applied date, and notes.
6. Save manual changes in localStorage.
7. Add Export JSON.
8. Add Import JSON with validation.
9. Add Reset to Default Data.
10. Add copy email button.
11. Add website and LinkedIn buttons.
12. Keep the app responsive and easy to use.

Gmail outreach workflow:
The user will share companies separately. For each company:

1. Research official or reliable contact sources.
2. Find official HR, careers, recruitment, or general business emails where possible.
3. Prefer official company website, careers page, LinkedIn company page, or verified public sources.
4. Do not invent emails.
5. If no reliable email exists, mark as:
   - "Portal Only" if applications must go through a portal
   - "Limited" if no safe verified contact is available
6. Use Gmail to apply only when the user asks to send/apply.
7. Attach the user’s resume to every application email.
8. Use the user’s application/cover-letter template, but customize it for every company.
9. Customize the message based on the company profile, target role, tech stack, services/products, and why the user fits.
10. Keep the email professional, direct, and human.
11. If Gmail send succeeds, update status to "Sent".
12. Record applied date, emails used, notes, source/contact info, website, LinkedIn, and basic company info in the tracker.

Important rules:
- Do not add extra companies.
- Do not fake company data.
- Do not fake HR emails.
- Do not fake sent status.
- Resume must be attached to every sent application.
- Company emails should be customized, not generic copy-paste.
- If company data is unknown, use "" or "Unknown".
- Do not ask unnecessary questions. Make best-effort decisions.

Existing project may include:
- package.json
- index.html
- src/main.jsx
- src/App.jsx
- src/index.css
- src/data/companies.js
- tailwind.config.js
- README.md

Final expected result:
- Working React + Tailwind tracker.
- Existing company data preserved.
- Gmail outreach workflow supported.
- Search, filters, counters, status editing, localStorage, import/export all working.
- README updated with:

npm install
npm run dev
npm run build