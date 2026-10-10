'use client';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Alert } from '@/components/ui';

/** Admin-only: sets the real start date (a Monday) for a student with a verified payment. */
export function StartDateForm({ applicationId, internshipId }: { applicationId?: string; internshipId?: string }) {
  const router = useRouter();
  const [date, setDate] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function save() {
    setError(null);
    if (!date) { setError('Choose the start date first.'); return; }
    if (new Date(`${date}T00:00:00`).getDay() !== 1) { setError('The start date must be a Monday.'); return; }
    setBusy(true);
    try {
      const res = await fetch('/api/admin/start-dates', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ start_date: date, application_id: applicationId, internship_id: internshipId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? 'Could not save the start date.');
      router.refresh();
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not save the start date.'); }
    finally { setBusy(false); }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <label className="sr-only" htmlFor={`sd-${applicationId ?? internshipId}`}>Start date (Monday)</label>
        <input id={`sd-${applicationId ?? internshipId}`} type="date" className="field max-w-[190px]"
               value={date} onChange={(e) => setDate(e.target.value)} />
        <Button size="sm" onClick={save} disabled={busy}>
          {busy ? 'Saving…' : applicationId ? 'Set start date & open internship' : 'Change start date'}
        </Button>
      </div>
      {error && <Alert tone="danger">{error}</Alert>}
    </div>
  );
}
