-- Zinternora: editable site settings (brand name, support email, HR contact, bank details, signatories, logo).
-- ADDITIVE and SAFE: nothing is dropped, no rows are deleted or changed. Safe to run twice.
-- Run once in Supabase -> SQL Editor.

-- 1) One small table of settings. The website reads it; only admins can change it.
create table if not exists public.site_settings (
  key        text primary key,
  value      jsonb not null default '{}'::jsonb,
  updated_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now()
);
alter table public.site_settings enable row level security;

-- Everything stored here is already public on the website (name, support email, bank details for fees, etc.).
drop policy if exists "settings: public read" on public.site_settings;
create policy "settings: public read" on public.site_settings for select using (true);
drop policy if exists "settings: admin write" on public.site_settings;
create policy "settings: admin write" on public.site_settings for all
  using (public.is_admin()) with check (public.is_admin());

-- 2) Public bucket for the logo and signature images (images only, 2 MB max).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('branding', 'branding', true, 2097152, array['image/png','image/jpeg','image/webp'])
on conflict (id) do nothing;

drop policy if exists "branding: public read" on storage.objects;
create policy "branding: public read" on storage.objects for select using (bucket_id = 'branding');
drop policy if exists "branding: admin insert" on storage.objects;
create policy "branding: admin insert" on storage.objects for insert
  with check (bucket_id = 'branding' and public.is_admin());
drop policy if exists "branding: admin update" on storage.objects;
create policy "branding: admin update" on storage.objects for update
  using (bucket_id = 'branding' and public.is_admin());
drop policy if exists "branding: admin delete" on storage.objects;
create policy "branding: admin delete" on storage.objects for delete
  using (bucket_id = 'branding' and public.is_admin());
