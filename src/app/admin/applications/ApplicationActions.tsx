'use client';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Alert } from '@/components/ui';

/** Accept / reject / reopen an application. All decisions are enforced by the admin-only API route. */
export function ApplicationActions({ id, status, accepted }: { id: string; status: string; accepted: boolean }) {
  const router = useRouter();
  const [note, setNote] = React.useState('');
  const [busy, setBusy] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function act(action: 'accept' | 'reject' | 'reopen') {
    if (action === 'reject' && !window.confirm('Reject this application? The student will be notified.')) return;
    setBusy(action); setError(null);
    try {
      const res = await fetch(`/api/admin/applications/${id}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, note: note || undefined }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? 'The action failed.');
      setNote('');
      router.refresh();
    } catch (e) { setError(e instanceof Error ? e.message : 'The action failed.'); }
    finally { setBusy(null); }
  }

  const open = ['submitted', 'payment_submitted', 'under_verification'].includes(status);
  const closed = ['rejected', 'cancelled'].includes(status);
  if (!open && !closed) return <span className="text-[12.5px] text-slate-light">Active</span>;

  return (
    <div className="space-y-2">
      {open && (
        <input className="field h-9 max-w-[220px] py-1 text-[13px]" placeholder="Note to student (optional)"
               aria-label="Note to student" value={note} onChange={(e) => setNote(e.target.value)} />
      )}
      <div className="flex flex-wrap gap-2">
        {open && !accepted && <Button size="sm" onClick={() => act('accept')} disabled={!!busy}>Accept</Button>}
        {open && <Button size="sm" variant="danger" onClick={() => act('reject')} disabled={!!busy}>Reject</Button>}
        {closed && <Button size="sm" variant="secondary" onClick={() => act('reopen')} disabled={!!busy}>Reopen</Button>}
      </div>
      {error && <Alert tone="danger">{error}</Alert>}
    </div>
  );
}
