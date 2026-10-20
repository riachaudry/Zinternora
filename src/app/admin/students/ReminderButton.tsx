'use client';
import * as React from 'react';
import { Button } from '@/components/ui';

/** One click: remind every registered student who has not paid yet. */
export function ReminderButton() {
  const [count, setCount] = React.useState<number | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [msg, setMsg] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    try {
      const res = await fetch('/api/admin/payment-reminders');
      const data = await res.json();
      if (res.ok) setCount(data.count);
    } catch { /* ignore */ }
  }, []);
  React.useEffect(() => { void load(); }, [load]);

  async function send() {
    if (!window.confirm('Email all students who registered but have not paid yet? Nobody is emailed twice within 3 days.')) return;
    setBusy(true); setMsg(null);
    try {
      const res = await fetch('/api/admin/payment-reminders', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? 'Could not send.');
      setMsg(`Sent ${data.sent}${data.failed ? `, failed ${data.failed}` : ''}.${data.remaining ? ` ${data.remaining} more waiting: press again.` : ''}`);
      setCount(data.remaining);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Could not send.');
    } finally { setBusy(false); }
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-mist-deep bg-white p-4">
      <div className="min-w-0 flex-1">
        <p className="text-[14px] font-semibold text-ink">Remind students who have not paid</p>
        <p className="text-[12.5px] text-slate-light">
          {count === null ? 'Checking…' : `${count} registered student${count === 1 ? '' : 's'} with no payment yet.`}
        </p>
        {msg && <p className="mt-1 text-[12.5px] font-medium text-signal">{msg}</p>}
      </div>
      <Button type="button" size="sm" onClick={send} disabled={busy || count === 0}>
        {busy ? 'Sending…' : 'Send reminder email'}
      </Button>
    </div>
  );
}
