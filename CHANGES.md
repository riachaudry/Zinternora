# Internora — change log (this delivery)

Base: Internora_Updated_Project_Final.zip. A unified patch of every change is in `CHANGES.patch`.

## Fixed
- `supabaseKey is required`: new `src/lib/env.ts` validates variables and shows a clear message naming the missing one
  (clients, middleware and register route use it). Service-role key stays server-only.
- Deadlines now use `APP_TIMEZONE` (default Asia/Karachi), not the server clock (`src/lib/tz.ts`, `src/lib/dates.ts`).
- Submission route: checks active internship, unlocked task, deadline; writes task status server-side
  (students cannot write to tasks under RLS, so the old status update silently failed).
- Internship completes only when all weeks are finished AND required work is approved (not merely submitted).
- Start dates must be a Monday (weekly deadline = full Sunday 11:59 PM). Date-only values no longer shift by timezone.
- Payment verification no longer leaves a "verified but not active" state when activation fails (rolls back).
- Old 6/8-week leftover in Admin → Fields removed.
## Added
- Admin: Accept / Reject / Reopen application; verify payment with optional start date; "Verified, awaiting start date" list;
  change start date before any submission; calendar with create/edit/delete events.
- Student/Admin Calendar (month, week, day, Today, prev/next, status colours, event details dialog).
- 3 themes (Classic Navy & Gold default, Light & Minimal, Dark) in Settings, saved per account + device.
- Both signatories on every official document; no drawn signatures (owner images only); LEARN | BUILD | GROW motto;
  real weekly date ranges on the Offer Letter; actual completion date on Certificate and LOR.
## Official documents redesigned (owner's approved design)
- Offer Letter, Certificate of Completion and Letter of Recommendation now follow the supplied navy-and-gold design:
  A4 page, logo, working verification QR code (real, decoded in testing), gold seal, footer with website and support email.
- Both signatories on all three, with the handwritten signatures supplied by Faree Chaudhry and Ria Chaudhry (cleaned from their photo, stored in `public/signatures/`). No social icons. No stipend wording.
- Student name, domain, dates and document ID are filled automatically from the database for every student.
- New admin page **Sample Documents** (Documents menu) shows all three for the sample student "Ria Chaudhry", marked SAMPLE.
- LOR QR points to the general verify page (no per-letter verify page exists yet).
## Installable app (phone + laptop)
- Internora can be installed from the browser: Android/Chrome ("Install app" / "Add to Home screen"), iPhone/Safari
  (Share -> Add to Home Screen), and laptop Chrome/Edge (install icon in the address bar).
- New: `src/app/manifest.ts`, `public/sw.js` (offline page only; it caches NO private portal data), `public/offline.html`,
  `public/icons/*`, `public/apple-touch-icon.png`, `src/components/pwa/*`, and an "Install the Internora app" card in both Settings pages.
## Admin profile + support email
- Admin → Profile is now editable (photo, full name, phone, WhatsApp, city, country, bio); saved to Supabase via `/api/profile`.
  The login email is shown read-only (change it in Supabase Authentication → Users).
- Support email on the Offer Letter, Certificate, LOR footer and Admin profile is now `zinternorasupport@gmail.com`
  (single setting: `supportEmail` in `src/lib/brand.ts`).
## Brand renamed: Internora -> Zinternora
- Display name changed everywhere (site, portals, emails, documents, seal, logo files, manifest, offline page, README/docs).
- Technical names were NOT changed on purpose: website domain (`www.internora.com`), package name, e-mail sending domain, demo e-mail domain, storage keys.
  Change `website` in `src/lib/brand.ts` once your new domain is ready.
## Payment: JazzCash removed
- Only Bank Transfer remains (Account name Farkhanda, Bank Alfalah, IBAN PK86BAHL0016098101818801). The JazzCash number is gone
  from the site, student payment page, admin pages, FAQ, contact page, docs and seed data.
- Students can only submit "Bank Transfer" now. The database value `jazzcash` is kept so any old payment records still display.
## Editable site settings (Admin -> Settings)
- Admin can now edit, and it saves to Supabase: brand name, tagline, motto, website, support email, logo image, HR contact (name, WhatsApp),
  Bank Transfer account (account name, bank, IBAN) and both document signatories (name, title, signature image).
- Used by: logo, footer, browser title, installable-app name, FAQ/contact/pricing/payment pages, e-mails, and the Offer Letter, Certificate and LOR.
- Needs the additive SQL `supabase/migrations/20261008_site_settings.sql` (settings table + public `branding` image bucket). Until it is run, the built-in defaults are used.
- New: `src/lib/settings.ts`, `/api/admin/settings`, `src/app/admin/settings/BrandSettingsForm.tsx`, `src/components/brand/BrandProvider.tsx`.
- Not yet editable: long paragraphs of public page text (Home, About, How it works) still contain the name as typed.
## Automatic documents (Admin -> Settings -> Automatic documents)
- Offer Letter: always automatic once payment is verified and the real start date is set.
- Certificate: now issued automatically when an internship is completed (switch, default ON). Eligibility is unchanged (all weeks finished + required work approved).
- LOR: optional automatic standard letter (switch, default OFF). It prints only real facts + the standard closing line; admins can still write their own.
## New logo (owner-supplied Zinternora emblem, recoloured to gold and navy blue)
- `public/brand/zinternora-emblem.png` (full circular emblem), `zinternora-mark.png` (Z symbol), `zinternora-mark-navy.png` (navy Z for the gold seal).
- Used as: site/dashboard/admin logo (next to the name), app icons, favicon, install icons.
- The original pink/rose-gold emblem was recoloured: blue Z, gold leaves/ring/star, navy name, to match the navy-and-gold design. In Dark Mode the logo gets a light chip.
- Offer Letter, Certificate and LOR keep the mortarboard cap in the header and on the seal (owner preference). The Z logo is used on the website, dashboards, app icons and LinkedIn files.
- The logo can still be replaced from Admin -> Settings (upload), or removed to use the built-in symbol.
## Cloudflare deployment files
- `wrangler.jsonc`, `open-next.config.ts`, scripts `cf:preview` / `cf:deploy`, `.gitignore` entries, `images.unoptimized` (no image optimiser on Workers),
  and `DEPLOY_CLOUDFLARE.md` (step-by-step). NOT build-tested here (no internet). Netlify/Vercel remain supported.
## Build fix (10 Oct 2026)
- Fixed a TypeScript error in `src/lib/email/templates.ts` (brand type) found by the owner's first `npm run build`.
- Cloudflare note: the newest OpenNext adapter needs Next >= 15.5.24, so Cloudflare requires a Next.js upgrade; Netlify guide added (`DEPLOY_NETLIFY.md`).
## Removed
- Rewards, prizes, reward tiers, leaderboards (pages, API, nav, wording). Database tables/data left untouched.
- LOR eligibility is now "successfully completed internship", not reward positions.
## Database (additive; run `supabase/migrations/20261005_calendar_and_theme.sql`)
- `profiles.theme` column, `calendar_events` table + RLS, stricter `submissions` insert policy.
