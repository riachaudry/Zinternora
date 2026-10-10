# Zinternora — 1-Month Browser-Ready Setup

This package is a Next.js + Supabase application. It is not a single static HTML file because
applications, payments, offer letters, task submissions and admin verification need a database.

## Student flow

1. Public site → Apply
2. Student registers/logs in
3. Selects one of the 16 internship fields
4. Applies for the 1-month / 4-week program
5. Sees the fixed program fee: PKR 700
6. Uploads the Bank Transfer receipt
7. Admin verifies payment
8. Admin sets the real start date (a Monday); the internship activates and the offer letter is issued
9. Week 1 / Task 1 unlocks
10. Each submitted task unlocks the next task
11. After the final task of a week is submitted, the next week unlocks
12. After Week 4, internship completes and certificate flow can proceed

## The 16 fields

The roadmap catalog contains all 16 launch fields. The roadmap seed
now publishes the 4-week track for every active field.

## Run locally

Requirements: Node.js 20+ and a Supabase project.

    npm install
    cp .env.example .env.local

Fill in the Supabase values in `.env.local`, then run these SQL files in order:

    supabase/schema.sql
    supabase/policies.sql
    supabase/storage.sql

Then publish the roadmaps and start:

    npm run seed:roadmaps
    npm run dev

Open in a browser:

    http://localhost:3000

## Put it online

Deploy the `internora` folder to Vercel or Netlify and add the same environment variables.
After deployment, the site will have a normal HTTPS browser URL and the student/admin dashboards
will work through the same domain.

## Important

Payment verification remains manual by design. Do not describe the program as guaranteed income,
a stipend, or guaranteed employment.


