'use client';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Alert } from '@/components/ui';
import { Uploader, type Uploaded } from '@/components/portal/Uploader';
import { postJson } from '@/components/portal/form';
import { LINKEDIN_URL } from '@/lib/brand';

export function SubmitForm({ taskId, userId, submissionType, allowed, resubmit }: {
  taskId: string; userId: string; submissionType: string; allowed: string[]; resubmit: boolean;
}) {
  const router = useRouter();
  const [file, setFile] = React.useState<Uploaded | null>(null);
  const [url, setUrl] = React.useState('');
  const [text, setText] = React.useState('');
  const [linkedin, setLinkedin] = React.useState('');
  const [comments, setComments] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  void submissionType;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const li = linkedin.trim();
    if (!/^https?:\/\/([a-z]+\.)?linkedin\.com\//i.test(li)) {
      setError('Paste the link of your LinkedIn post (it should start with https://www.linkedin.com/).');
      return;
    }
    setBusy(true);
    try {
      const response = [`LinkedIn post: ${li}`, text.trim()].filter(Boolean).join('\n\n');
      await postJson('/api/submissions', {
        task_id: taskId,
        file_url: file?.url, file_name: file?.name, file_size: file?.size,
        url: url || undefined, text_response: response, comments: comments || undefined,
      });
      setFile(null); setUrl(''); setText(''); setLinkedin(''); setComments('');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="p-5">
      <h2 className="font-display text-lg font-bold">{resubmit ? 'Submit a revision' : 'Submit your work'}</h2>
      {resubmit && (
        <p className="mt-1 text-[14px] text-amber-dark">
          A revision was requested. Read the feedback below, then upload the updated deliverable.
        </p>
      )}

      <form onSubmit={submit} className="mt-4 space-y-4">
        <div className="rounded-xl border border-mist-deep bg-mist/50 p-4 text-[13.5px] text-slate">
          <p className="font-semibold text-ink">What to submit for every task</p>
          <ol className="mt-2 list-decimal space-y-1 pl-5">
            <li><strong>Your work link</strong> (GitHub, Figma, Google Drive, live demo).</li>
            <li><strong>Proof of the task</strong>: screenshots or a short screen-recording video. Upload the file below, or paste a Google Drive / YouTube (unlisted) link above.</li>
            <li><strong>A LinkedIn post</strong> about this task that mentions <strong>The Internora</strong> (tag our page). Paste the post link below.</li>
            <li><strong>Follow our LinkedIn page</strong> (required for all interns):{' '}
              <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" className="font-semibold text-signal underline">The Internora on LinkedIn</a>.
            </li>
          </ol>
        </div>

        <label className="form-row">
          <span>1. Work link (GitHub, Figma, Drive, live demo)</span>
          <input type="url" value={url} onChange={(e) => setUrl(e.target.value)}
                 placeholder="https://github.com/your-name/project" />
        </label>

        <div>
          <p className="mb-1.5 text-[13px] font-semibold text-ink">2. Screenshots or video (optional if your link already shows them)</p>
          <Uploader bucket="submissions" userId={userId} allowed={allowed}
                    onDone={setFile} label="Upload screenshot / video / file" />
        </div>

        <label className="form-row">
          <span>3. LinkedIn post link (required)</span>
          <input type="url" required value={linkedin} onChange={(e) => setLinkedin(e.target.value)}
                 placeholder="https://www.linkedin.com/posts/..." />
        </label>

        <label className="form-row">
          <span>Written response (optional)</span>
          <textarea rows={4} value={text} onChange={(e) => setText(e.target.value)}
                    placeholder="Explain your approach, decisions and anything the evaluator should know." />
        </label>

        <label className="form-row">
          <span>Notes for the evaluator (optional)</span>
          <textarea rows={2} value={comments} onChange={(e) => setComments(e.target.value)} />
        </label>

        {error && <Alert tone="bad">{error}</Alert>}

        <Button type="submit" disabled={busy}>{busy ? 'Submitting…' : 'Submit for review'}</Button>
        <p className="text-[12px] text-slate-light">
          Your LinkedIn post link is required. Add your work link and/or proof (file) as well so the evaluator can review it.
        </p>
      </form>
    </Card>
  );
}


