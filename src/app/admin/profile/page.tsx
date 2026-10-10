import { requireAdmin } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { getBrand } from '@/lib/settings';
import { shortDate } from '@/lib/dates';
import { Avatar } from '@/components/portal/Avatar';
import { SectionHead, Card, Table, Badge } from '@/components/ui';
import { AdminProfileForm } from './AdminProfileForm';

export const dynamic = 'force-dynamic';

export default async function AdminProfilePage() {
  const brand = await getBrand();
  const admin = await requireAdmin();
  const db = createAdminClient();

  const [{ data: profile }, { data: audits }] = await Promise.all([
    db.from('profiles').select('*').eq('id', admin.id).single(),
    db.from('audit_logs').select('id, action, entity, entity_id, created_at')
      .eq('actor_id', admin.id).order('created_at', { ascending: false }).limit(40),
  ]);

  return (
    <div className="space-y-6">
      <SectionHead title="Admin profile" body="Edit your own details here. Changes are saved to the database." />

      <Card className="p-5">
        <div className="flex flex-wrap items-center gap-5">
          <Avatar url={profile?.avatar_url} name={admin.full_name} size={64} />
          <div>
            <p className="font-display text-xl font-extrabold text-ink">{admin.full_name}</p>
            <p className="mt-0.5 text-[14px] text-slate">{admin.email}</p>
            <div className="mt-2"><Badge tone="info">Administrator</Badge></div>
          </div>
        </div>
        <div className="mt-5 border-t border-mist pt-4 text-[13.5px]">
          <p className="font-semibold text-ink">Support email shown on documents and the site</p>
          <p className="mt-1 text-slate">{brand.supportEmail}</p>
          <p className="mt-2 font-semibold text-ink">HR contact used across the platform</p>
          <p className="mt-1 text-slate">{brand.hrName} · {brand.hrWhatsapp}</p>
          <p className="mt-2 font-semibold text-ink">Payment account used across the platform</p>
          <p className="mt-1 text-slate">
            {brand.accountName} · {brand.bankName} · {brand.iban} (Bank Transfer)
          </p>
        </div>
      </Card>

      <AdminProfileForm profile={profile} email={admin.email} />

      <div>
        <h2 className="font-display text-lg font-bold">Your recent actions</h2>
        <p className="mt-1 text-[13.5px] text-slate-light">
          Every administrative action is written to an immutable audit log.
        </p>
        <div className="mt-3">
          {audits?.length ? (
            <Table head={['Action', 'Entity', 'Reference', 'When']}>
              {audits.map((a) => (
                <tr key={a.id}>
                  <td className="px-4 py-3 font-mono text-[12.5px] font-semibold text-ink">{a.action}</td>
                  <td className="px-4 py-3 text-slate">{a.entity}</td>
                  <td className="px-4 py-3 font-mono text-[12px] text-slate-light">{a.entity_id ?? '—'}</td>
                  <td className="px-4 py-3 text-slate">
                    {new Date(a.created_at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
                  </td>
                </tr>
              ))}
            </Table>
          ) : (
            <Card className="p-5"><p className="text-[14px] text-slate-light">No actions logged yet.</p></Card>
          )}
        </div>
      </div>
    </div>
  );
}


