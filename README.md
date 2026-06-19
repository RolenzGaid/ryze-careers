# Ryze Agency — Careers / Employment Application

A Next.js (React) employment application form. On submit it:

1. Writes every label + answer into a new **Google Doc**.
2. Emails **rgaid@ryzeagency.com** with `someone has applied` followed by the Google Doc link.

A modern dark theme (black + `#04b4f4` accent), presented as a **5-step wizard**
(Applicant Information → Education → Previous Employment → Military Service → References).
It's built to deploy on **Vercel** at **http://careers.ryzeagency.com/**.

---

## What's in here

```
app/
  layout.js            Root layout + fonts
  page.js              Renders the form
  globals.css          Design system / styles
  api/submit/route.js  Serverless endpoint: builds the Doc, sends the email
components/
  ApplicationForm.js   The 5-step wizard (steps, validation, submit)
lib/
  fields.js            Single source of truth for all fields + labels
  googleDocs.js        Creates and shares the Google Doc
  email.js             Sends the notification (Resend)
.env.example           Copy to .env.local and fill in
```

To change/add/remove form fields, edit **`lib/fields.js`** only — the form and the Google Doc both read from it.

---

## 1. Run locally

```bash
npm install
cp .env.example .env.local   # then fill in the values (see below)
npm run dev                  # http://localhost:3000
```

The form renders without any environment variables, but **submitting** needs the Google + Resend values below.

---

## 2. Google Doc setup (one time)

1. Go to the [Google Cloud Console](https://console.cloud.google.com/) → create/select a project.
2. **APIs & Services → Enable APIs** → enable **Google Docs API** and **Google Drive API**.
3. **APIs & Services → Credentials → Create credentials → Service account.** Create it, then open it → **Keys → Add key → JSON**. A JSON file downloads.
4. From that JSON, copy:
   - `client_email` → `GOOGLE_CLIENT_EMAIL`
   - `private_key`  → `GOOGLE_PRIVATE_KEY` (keep the `\n` escapes; wrap the whole value in quotes)
5. **Recommended:** in Google Drive, create a folder (e.g. "Job Applications"), **Share** it with the service account's `client_email` as **Editor**, open the folder and copy the ID from the URL (`.../folders/THIS_PART`) → `GOOGLE_DRIVE_FOLDER_ID`. This keeps all application docs in one place and avoids service-account storage limits.

> The app automatically shares each new Doc with `NOTIFY_TO` so the emailed link opens for them.

---

## 3. Email setup (Resend)

1. Create a free account at [resend.com](https://resend.com).
2. **API Keys → Create** → copy into `RESEND_API_KEY`.
3. **Domains → Add domain** → add `ryzeagency.com` and follow the DNS records they give you. Once verified, set `NOTIFY_FROM` to something like `Ryze Careers <careers@ryzeagency.com>`.
   - To test before verifying a domain, set `NOTIFY_FROM=onboarding@resend.dev`.

Prefer a different provider (SendGrid, Postmark, Gmail SMTP)? Swap the implementation in `lib/email.js`; nothing else needs to change.

---

## 4. Environment variables

| Variable | Required | Notes |
|---|---|---|
| `GOOGLE_CLIENT_EMAIL` | yes | Service account email |
| `GOOGLE_PRIVATE_KEY` | yes | Quoted, with `\n` escapes |
| `GOOGLE_DRIVE_FOLDER_ID` | recommended | Folder shared with the service account |
| `RESEND_API_KEY` | yes | From Resend |
| `NOTIFY_FROM` | yes | Verified sender |
| `NOTIFY_TO` | no | Defaults to `rgaid@ryzeagency.com` |

---

## 5. Deploy to Vercel

1. Push this folder to a Git repo (GitHub/GitLab/Bitbucket).
2. In [Vercel](https://vercel.com/new), **Import** the repo. Framework auto-detects as **Next.js** — no build settings to change.
3. **Settings → Environment Variables** → add every variable from the table above (Production + Preview).
4. **Deploy.**

### Point careers.ryzeagency.com at it

1. In your Vercel project → **Settings → Domains → Add** → enter `careers.ryzeagency.com`.
2. Vercel shows a DNS record. At your DNS host for `ryzeagency.com`, add a **CNAME**:
   - **Name:** `careers`
   - **Value:** `cname.vercel-dns.com`
3. Wait for it to verify (usually minutes). Vercel issues HTTPS automatically.

> Note: Vercel serves over **HTTPS** and redirects `http://` → `https://`, so the live site is `https://careers.ryzeagency.com/`. You can't disable HTTPS on Vercel — this is expected and better for applicants entering personal data.

---

## How submission works

`components/ApplicationForm.js` POSTs the answers as JSON to `app/api/submit/route.js`, which:
1. validates the required fields,
2. calls `lib/googleDocs.js` to create + format + share the Doc,
3. calls `lib/email.js` to notify `NOTIFY_TO`,
4. returns success; the form shows a confirmation screen.

The applicant never sees the Doc link — only the hiring team does.
