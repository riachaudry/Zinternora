# Deploying Zinternora on Netlify (Windows, from your own PC)

Prerequisites: Node 20+, `npm run build` passes locally, a free account at https://app.netlify.com

1. In the project folder: `npm install`, then `npm install -g netlify-cli`
2. `netlify login` (browser opens, press Authorize)
3. `netlify init` -> "Create & configure a new project" -> pick your team -> site name `zinternora` (or any free name).
   Build command: `npm run build`   Publish directory: `.next`   (netlify.toml already has these)
4. Add your private values: Netlify -> Site configuration -> Environment variables -> add every name from `.env.example`
   (use the values from your `.env.local`). `NEXT_PUBLIC_SITE_URL` = the final site address.
5. `netlify deploy --build --prod`  (prints the live address)
6. Supabase -> Authentication -> URL Configuration: Site URL = live address; Redirect URLs = `<address>/auth/callback` and `<address>/reset-password`.
7. Test: register, log in, /admin, Settings, Sample Documents. Optional: Domain management -> add your own domain.
