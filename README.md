# The Internora

**Virtual Internships. Real Experience.**
Project-Based Virtual Internships & Career Experience

A complete, working internship management platform: public marketing site, student
portal, admin portal, document generation and public verification. Not a mockup —
every screen reads from and writes to a real Postgres database with row-level
security, real authentication and real file storage.

---

## What this actually does

**Students** register, apply to one of 16 internship fields as a 1-month (4-week) program,
pay the fee by Bank Transfer and upload a receipt. Once an admin
verifies that payment by hand, the system creates the internship, calculates every
week window and task deadline from the start date, issues an offer letter with a
public ID, and unlocks week 1. Students submit work, receive scores and written
feedback, and the next week unlocks only once 70% of the current week's required
task points are approved. At the end, once all four weeks are successfully
completed, they get a certificate with a public verification link and, after
admin review, a letter of recommendation.

**Admins** verify payments, review submissions, manage the roadmap catalog, issue
and revoke documents, accept or reject applications, set the real start date, manage calendar events, answer support tickets, send invitations and
announcements, and read an immutable audit log of every administrative action.

### Deliberate design decisions

- **Payment verification is never automatic.** It is the single gate that activates
  an internship. The fee is recomputed server-side on submission, so a tampered form
  cannot lower it, and a unique index blocks duplicate transaction IDs.
- **Week locking is enforced on the server.** The submissions API refuses work for a
  locked week regardless of what the interface allowed.
- **Dates are never hard-coded.** Every week window, unlock date and deadline is
  derived from one stored `start_date` (see `src/lib/dates.ts`). The dashboard's
  TODAY card renders the live system date.
- **Scoring is one formula in one place.** 70% weekly work + 30% final project,
  recomputed on every review (`src/lib/scoring.ts`).
- **Program duration is fixed at 4 weeks.** Weeks 1–3 are progression weeks and week 4 is the final project week.
- **The start date is set by an admin and must be a Monday**, so every weekly deadline is a full Sunday 11:59 PM cutoff in `APP_TIMEZONE` (default Asia/Karachi). The Offer Letter stays unavailable until payment is verified AND a start date exists.
- **No rewards, prizes, leaderboards or stipend.** Completion documents are the Certificate and the Letter of Recommendation only.
- **Three themes** (Classic Navy & Gold default, Light & Minimal, Dark) are chosen in Settings. Official documents always keep the classic design.
- **Brand data has one source of truth** (`src/lib/brand.ts`), so the site, both
  portals and every generated document always agree.

### Trust statements (shown in the footer and on /about)

- This is a project-based virtual internship program.
- Certificates are issued after meeting the published completion criteria.
- LORs are issued after successful completion and admin review.
- The Internora does not pay a stipend or salary and does not guarantee employment.

The Internora is an independent private program. It is not affiliated with any
government body or university and is not an accredited institution.

---

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS with custom design tokens |
| Database | Supabase (PostgreSQL) with row-level security on every table |
| Auth | Supabase Auth (email + password, reset, invitations) |
| Storage | Supabase Storage — 4 buckets with per-user path policies |
| Email | Resend, or a console provider for local development |
| Validation | Zod on every API route |
| Hosting | Netlify or Vercel |

---

## Quick start

```bash
npm install
cp .env.example .env.local     # fill in your Supabase credentials
```

Then, in the Supabase SQL editor, run these three files **in order**:

1. `supabase/schema.sql` — tables, enums, ID generator, triggers
2. `supabase/policies.sql` — row-level security on every table
3. `supabase/storage.sql` — the four storage buckets and their access policies
4. `supabase/migrations/20261005_calendar_and_theme.sql` — calendar events table, saved theme, tighter submission rule (additive; safe on an existing database)
5. `supabase/migrations/20261008_site_settings.sql` — editable site settings (brand name, logo, contact, bank details, signatories) and the public `branding` bucket (additive)

Then seed and start:

```bash
npm run seed:roadmaps                                    # 16 fields × 1 duration
npm run create:admin -- you@example.com "Your Name" "StrongPass123"
npm run seed:demo                                        # optional demo students
npm run dev
```

Open http://localhost:3000. Sign in at `/login` — admins land on `/admin`,
students on `/dashboard`.

> The first `npm run build` needs internet access to fetch the Google Fonts used by
> `next/font`. This is normal; the fonts are then self-hosted in the build output.

---

## Install as an app (phone and laptop)

Open the **live https website** (not a local test address), then:
- **Android (Chrome):** menu ⋮ → *Install app* / *Add to Home screen*.
- **iPhone (Safari only):** Share → *Add to Home Screen*.
- **Laptop (Chrome/Edge):** click the install icon in the address bar, or menu → *Install The Internora*.

The same steps are shown inside the app under **Settings → Install the The Internora app**.
The app needs an internet connection; offline it shows a friendly "You are offline" page and stores no private data.

---

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build and serve |
| `npm run seed:roadmaps` | Publishes all 16 fields and their 4-week roadmaps. Safe to re-run. |
| `npm run lint` / `npx tsc --noEmit` | Lint and type-check |
| `npm run create:admin -- <email> "<Name>" "<password>"` | Creates an admin, or promotes an existing account |
| `npm run seed:demo` | Creates clearly-marked demo students so every screen has data |

Every demo account uses the `@demo.internora.test` domain and the password
`DemoPass123`. Remove them all with:

```sql
delete from auth.users where email like '%@demo.internora.test';
```

---

## Project layout

```
supabase/          schema.sql · policies.sql · storage.sql
scripts/           seed-roadmaps · seed-demo · create-admin
src/lib/
  brand.ts         all official brand, fee, payment and signatory data
  dates.ts         the week engine — every date derives from start_date
  tz.ts / env.ts   timezone helpers and safe environment-variable access
  scoring.ts       70/30 weighting and the 70% week-completion rule
  roadmaps/        the 16 field roadmaps, 4 weeks each, as typed data
  services/        internship activation, progression, documents, student state
  supabase/        browser, server and service-role clients
src/app/
  (site)/          public marketing site and /verify
  (auth)/          login, register, reset, invite
  dashboard/       student portal (19 screens)
  admin/           admin portal (23 screens)
  api/             all mutations, zod-validated and auth-guarded
```

---

## Security notes

- Row-level security is enabled on every table; students can only ever read their
  own rows. A trigger blocks self-promotion to admin.
- The service-role key is used only in server-side code and never reaches the
  browser.
- Admin routes are guarded three times: middleware, `requireAdmin()` on the page,
  and `apiAdmin()` in the API route.
- Invitation tokens are stored only as salted hashes; the raw token exists solely
  in the emailed link and expires.
- Uploads are validated for extension and size on both the client and the server,
  and land under `<bucket>/<user-id>/` where the storage policy scopes them.

---

## Contact

HR: **Farkhanda** — WhatsApp **+966 54 786 0296**
Fee payments: Bank Transfer only · Account name **Farkhanda** · Bank Alfalah IBAN **PK86BAHL0016098101818801**

## 1-Month Student + Admin Flow

1. Student registers/logs in and selects one of the 16 internship fields.
2. Admin accepts or rejects the application (Admin → Applications).
3. Student pays PKR 700 by bank transfer and uploads the receipt, transaction ID and date.
4. Admin verifies or rejects the payment (Admin → Payments). A receipt upload never verifies anything by itself.
5. Admin sets the real internship start date (a Monday). Entering it while verifying, or later from "Verified, awaiting start date", activates the internship and issues the Offer Letter.
6. Week 1 opens with **Task 1 only**. Submitting a task unlocks the next one; after the last task of a week, the next week opens.
7. Deadlines are Sunday 11:59 PM (`APP_TIMEZONE`). Late submissions are blocked until an admin reopens the task (Admin → Submissions → Reopen).
8. Admin reviews, scores and gives feedback. When all four weeks are finished and the required work is approved, the internship completes.
9. The Certificate is issued automatically on completion (switch in Admin → Settings). The LOR is written/approved by an admin, or issued automatically as a standard letter if that switch is on. Both use the actual completion date. Both signatories (Faree Chaudhry — Founder & CEO, Ria Chaudhry — HR Manager) appear on every document; signature images are shown only if the owner supplies them (see `src/lib/brand.ts`).
