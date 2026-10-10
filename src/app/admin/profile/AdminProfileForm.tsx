'use client';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Alert } from '@/components/ui';
import { Avatar } from '@/components/portal/Avatar';
import { Uploader } from '@/components/portal/Uploader';
import { patchJson } from '@/components/portal/form';

/** Lets an administrator edit their own profile (name, photo, contact details, short bio). Saved to Supabase through /api/profile. */
export function AdminProfileForm({ profile, email }: { profile: any; email: string }) {
  const router = useRouter();
  const [form, setForm] = React.useState({
    full_name: profile.full_name ?? '', phone: profile.phone ?? '', whatsapp: profile.whatsapp ?? '',
    city: profile.city ?? '', country: profile.country ?? '', bio: profile.bio ?? '',
  });
  const [avatar, setAvatar] = React.useState<string | null>(profile.avatar_url ?? null);
  const [busy, setBusy] = React.useState(false);
  const [msg, setMsg] = React.useState<{ tone: 'good' | 'bad'; text: string } | null>(null);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (form.full_name.trim().length < 3) { setMsg({ tone: 'bad', text: 'Enter your full name (at least 3 letters).' }); return; }
    setBusy(true); setMsg(null);
    try {
      await patchJson('/api/profile', { ...form, full_name: form.full_name.trim(), avatar_url: avatar ?? undefined });
      setMsg({ tone: 'good', text: 'Profile saved.' });
      router.refresh();
    } catch (err) {
      setMsg({ tone: 'bad', text: err instanceof Error ? err.message : 'Could not save.' });
    } finally { setBusy(false); }
  }

  return (
    <form onSubmit={save} className="space-y-5">
      <Card className="p-5">
        <h2 className="font-display text-lg font-bold text-ink">Photo</h2>
        <div className="mt-4 flex flex-wrap items-center gap-5">
          <Avatar url={avatar} name={form.full_name || 'Admin'} size={72} />
          <div className="min-w-[240px] flex-1">
            <Uploader bucket="avatars" userId={profile.id}
                      allowed={['jpg', 'jpeg', 'png', 'webp']} maxBytes={2 * 1024 * 1024}
                      accept="image/png,image/jpeg,image/webp"
                      onDone={(f) => setAvatar(f?.url ?? avatar)} label="Upload photo" current={avatar} />
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="font-display text-lg font-bold text-ink">Your details</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="form-row"><span>Full name</span>
            <input value={form.full_name} onChange={set('full_name')} required minLength={3} maxLength={80} /></label>
          <label className="form-row"><span>Login email</span>
            <input value={email} readOnly disabled aria-describedby="email-note" /></label>
          <label className="form-row"><span>Phone</span>
            <input value={form.phone} onChange={set('phone')} maxLength={20} inputMode="tel" /></label>
          <label className="form-row"><span>WhatsApp</span>
            <input value={form.whatsapp} onChange={set('whatsapp')} maxLength={20} inputMode="tel" /></label>
          <label className="form-row"><span>City</span>
            <input value={form.city} onChange={set('city')} maxLength={60} /></label>
          <label className="form-row"><span>Country</span>
            <input value={form.country} onChange={set('country')} maxLength={60} /></label>
          <label className="form-row sm:col-span-2"><span>Short bio</span>
            <textarea rows={3} value={form.bio} onChange={set('bio')} maxLength={600} /></label>
        </div>
        <p id="email-note" className="mt-3 text-[12.5px] text-slate-light">
          Your login email is changed in Supabase (Authentication → Users), not here, so your sign-in never breaks by accident.
        </p>
      </Card>

      {msg && <Alert tone={msg.tone}>{msg.text}</Alert>}
      <Button type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save profile'}</Button>
    </form>
  );
}
