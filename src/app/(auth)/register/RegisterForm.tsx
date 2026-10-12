'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Alert } from '@/components/ui';
import { ROADMAPS } from '@/lib/roadmaps';

/** Short sign-up: name, WhatsApp number, email, password and internship domain. Everything else is optional later in the profile. */
export function RegisterForm({
  invited, inviteToken, preselectField, preselectDuration,
}: {
  invited: { full_name: string; email: string } | null;
  inviteToken?: string; preselectField?: string; preselectDuration?: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [show, setShow] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    setBusy(true); setError(null);

    const payload = {
      full_name: form.full_name, email: form.email, phone: form.phone, whatsapp: form.phone,
      password: form.password, field_slug: form.field_slug || undefined, invite_token: inviteToken,
    };
    const res = await fetch('/api/auth/register', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) { setError(json.error ?? 'Registration failed. Check your details and try again.'); setBusy(false); return; }

    const slug = form.field_slug || preselectField;
    const target = slug ? `/dashboard/apply?field=${slug}&duration=${preselectDuration ?? 4}` : '/dashboard';
    router.replace(`/login?next=${encodeURIComponent(target)}&message=Account created. Sign in to continue.`);
  }

  return (
    <form onSubmit={submit} className="mt-6 space-y-4">
      {invited && (
        <Alert tone="good" title="You were invited">
          <p className="mt-1">Complete your registration to continue.</p>
        </Alert>
      )}
      {error && <Alert tone="bad">{error}</Alert>}

      <Text name="full_name" label="Full name" defaultValue={invited?.full_name ?? ''} required autoComplete="name" />
      <Text name="phone" label="WhatsApp number" required placeholder="03XXXXXXXXX" inputMode="tel" autoComplete="tel" />
      <Text name="email" label="Email" type="email" defaultValue={invited?.email ?? ''} required readOnly={!!invited} autoComplete="email" />

      <div>
        <label className="field-label" htmlFor="password">Password</label>
        <div className="relative">
          <input id="password" name="password" type={show ? 'text' : 'password'} required minLength={8}
                 autoComplete="new-password" className="field pr-16" />
          <button type="button" onClick={() => setShow((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[13px] font-semibold text-signal">
            {show ? 'Hide' : 'Show'}
          </button>
        </div>
        <p className="mt-1.5 text-[13px] text-slate-light">8+ characters, with upper and lower case and a number.</p>
      </div>

      <div>
        <label className="field-label" htmlFor="field_slug">Internship domain</label>
        <select id="field_slug" name="field_slug" className="field" required defaultValue={preselectField ?? ''}>
          <option value="">Select your domain…</option>
          {ROADMAPS.map((r) => <option key={r.slug} value={r.slug}>{r.name}</option>)}
        </select>
      </div>

      <label className="flex items-start gap-2.5 text-[13.5px] leading-relaxed text-slate">
        <input type="checkbox" required className="mt-0.5 h-4 w-4 rounded border-mist-deep text-signal" />
        <span>
          I understand this is a project-based virtual internship. Certificates and letters are issued only after
          completion, and The Internora does not pay a stipend or guarantee employment.
        </span>
      </label>

      <Button type="submit" size="lg" disabled={busy} className="w-full">
        {busy ? 'Creating account…' : 'Create account'}
      </Button>
    </form>
  );
}

function Text({ name, label, hint, ...rest }: any) {
  return (
    <div>
      <label className="field-label" htmlFor={name}>{label}</label>
      <input id={name} name={name} className="field" {...rest} />
      {hint && <p className="mt-1.5 text-[13px] text-slate-light">{hint}</p>}
    </div>
  );
}
