# Deploying Zinternora on Cloudflare (Workers + OpenNext) — Windows, step by step

> IMPORTANT (found on 10 Oct 2026): the current `@opennextjs/cloudflare` (1.20.x) requires Next.js >= 15.5.24 (or >= 16.3.3) and Node 22 for Wrangler.
> This project is on Next.js 14.2, so `npm install @opennextjs/cloudflare@latest` fails with ERESOLVE. Cloudflare needs a Next.js upgrade first.
> Netlify works with the current Next.js 14 project as it is (see DEPLOYMENT.md / DEPLOY_NETLIFY.md).

Status: the configuration files are prepared but have NOT been build-tested (no internet where they were written).
Netlify/Vercel (see DEPLOYMENT.md) remain the zero-config alternative.

1. Create a free account at https://dash.cloudflare.com
2. Run the three SQL files/migrations in Supabase first (see DEPLOYMENT.md): schema/policies/storage + 20261005 + 20261008.
3. In the project folder (Command Prompt):
   - `npm install`
   - `npm install --save-dev @opennextjs/cloudflare@latest wrangler@latest`
4. Make sure `.env.local` has every value from `.env.example` (never share it). Keep `NEXT_PUBLIC_SITE_URL=http://localhost:3000` for the first deploy.
5. `npx wrangler login` (a browser window opens; press Allow).
6. Optional local test in the Workers runtime: `copy .env.local .dev.vars` then `npm run cf:preview`.
7. First deploy: `npm run cf:deploy`. It prints your address: `https://zinternora.<your-name>.workers.dev`.
8. Upload the private values: `npx wrangler secret bulk .env.local` (or add them in Cloudflare → Workers & Pages → zinternora → Settings → Variables and secrets).
9. Put the real address in `.env.local` (`NEXT_PUBLIC_SITE_URL=https://...workers.dev`), run `npx wrangler secret bulk .env.local` again, then `npm run cf:deploy` again.
10. Supabase → Authentication → URL Configuration: Site URL = your address; Redirect URLs: `<address>/auth/callback` and `<address>/reset-password`.
11. Test: register, log in, admin login, Settings, Sample Documents, install the app on a phone.
12. Custom domain (optional): Cloudflare → Workers & Pages → zinternora → Settings → Domains & Routes → Add (the domain must be on Cloudflare). Then update step 9 and 10 with the new address.

Notes: NEXT_PUBLIC_* values are fixed at build time (they come from `.env.local` when you run `npm run cf:deploy`). Other values are read at run time from the Worker secrets.
If the deploy says the Worker is too large, the free plan size limit was hit: use Workers Paid or deploy on Netlify/Vercel instead.
