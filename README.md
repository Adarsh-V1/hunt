# Company Application Tracker

A local React + Tailwind job/company application tracker with JSON-backed company data.

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## SMTP setup

Create a local `.env` file with:

```bash
MAIL_HOST=smtp.gmail.com
MAIL_USER=your-email@example.com
MAIL_PASS=your-app-password
MAIL_PORT=465
MAIL_PROTOCOL=smtps
MAIL_SECURE=true
MAIL_FROM=your-email@example.com
```

These keys are mirrored in `.env.example` with empty values only. Keep `.env` local and out of git.
Keep the bundled resume available at `src/resume/Adarsh_Pathania_resume.pdf`, or upload a PDF/DOCX when sending.

## Core features

- Desktop table and mobile card views
- Global search across company name, role, location, website, LinkedIn, status, notes, basic info, and emails
- Filters for status and location
- Dashboard counters for all allowed statuses
- Manual editing for status, applied date, and notes
- Local storage persistence for manual updates
- Export JSON, Import JSON (validated), and Reset to default data
- Copy email button and quick Website/LinkedIn actions
- Direct-email queue export plus per-company draft actions for copy/compose
- Local reply import for `.mbox`, `.eml`, and JSON reply payloads
- SMTP sending with Nodemailer, attachment validation, and send-result logging

## Gmail outreach workflow

- Use only companies already in your tracker list (no new company generation).
- Find contact emails only from official or reliable sources.
- If no safe direct email is found, mark status as `Portal Only` or `Limited`.
- Use `Send via SMTP` to send through the local Nodemailer backend when you explicitly request send/apply.
- Use `Compose Draft`, `Copy Subject`, and `Copy Draft` from the tracker for manual outreach when a direct email route is available.
- The tracker only marks a company as `Sent` after SMTP confirms delivery.
- Resume attachment is required and must be PDF or DOCX. You can use the bundled resume or upload your own copy before sending.
- After a successful send, the app stores the recipient, sent date, resume attachment, and send result in notes.

## Local reply import

Use `Import Replies` in the toolbar to merge local email data into the tracker. Supported inputs:

- Gmail Takeout `.mbox` exports
- Raw `.eml` email files
- JSON arrays or objects with `responses`, `gmailResponses`, or `messages`
- Pasted raw email text such as Gmail `Show original`

The tracker parses sender, subject, date, and a short body summary, matches replies back to saved
company contact emails, and stores the merged results in browser local storage.

## Data

- Source company list lives in `src/data/sourceCompanies.json`.
- Tracker data shaping and outreach merge logic lives in `src/data/companies.js`.
- Existing outreach data is merged from `outreach_contacts.md`.
- Manual status changes are stored in browser `localStorage`.
- Use the app's export/import buttons to back up or restore edited tracker data.
- Local reply imports are also stored in browser `localStorage`.
