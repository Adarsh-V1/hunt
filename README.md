# Company Application Tracker

A local React + Tailwind job/company application tracker for Adarsh Pathania.

## Run locally

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Local reply import

Use `Import Replies` in the toolbar to merge local email data into the tracker. Supported inputs:

- Gmail Takeout `.mbox` exports
- Raw `.eml` email files
- JSON arrays or objects with `responses`, `gmailResponses`, or `messages`
- Pasted raw email text such as Gmail `Show original`

The tracker parses sender, subject, date, and a short body summary, matches replies back to saved
company contact emails, and stores the merged results in browser local storage.

## Data

- Source company data lives in `src/data/companies.js`.
- Existing outreach data is merged from `outreach_contacts.md`.
- Manual status changes are stored in browser `localStorage`.
- Use the app's export/import buttons to back up or restore edited tracker data.
- Local reply imports are also stored in browser `localStorage`.
# hunt
