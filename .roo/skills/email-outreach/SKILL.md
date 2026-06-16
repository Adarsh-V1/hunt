---
name: email-outreach
description: Use this skill for job outreach automation, HR email research, JSON updates, and customized application workflows.

Rules:
- Only work with companies already provided by the user.
- Never add new companies.
- Never invent HR emails, websites, LinkedIn URLs, dates, or company info.
- Use only verified or official sources.
- Prefer official careers pages, company websites, LinkedIn company pages, or verified public contacts.
- If no reliable email exists:
  - mark Portal Only if applications must go through a portal
  - mark Limited if no verified contact exists

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

Workflow:
1. Read companies.json.
2. Process only user-provided co
---

# Email Outreach

## Instructions

Add your skill instructions here.
