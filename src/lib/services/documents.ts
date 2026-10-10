import 'server-only';
import { createAdminClient } from '../supabase/admin';
import { notify } from '../notifications';
import { sendEmail } from '../email';
import { audit } from '../audit';
import { getBrand } from '../settings';

/** Certificates are only issued once the published completion criteria are met. */
export async function issueCertificate(internshipId: string, adminId: string | null) {
  const db = createAdminClient();

  const { data: internship } = await db.from('internships')
    .select('id, student_id, duration, status, overall_score, internship_fields(name), profiles!internships_student_id_fkey(full_name,email)')
    .eq('id', internshipId).single();
  if (!internship) throw new Error('Internship not found.');
  if (internship.status !== 'completed') throw new Error('The internship must be complete before a certificate is issued.');

  const { count: incomplete } = await db.from('internship_weeks')
    .select('id', { count: 'exact', head: true })
    .eq('internship_id', internshipId).neq('status', 'completed');
  if ((incomplete ?? 0) > 0) throw new Error('Every week must be completed first.');

  const { data: existing } = await db.from('certificates')
    .select('public_id').eq('internship_id', internshipId).maybeSingle();
  if (existing) return { publicId: existing.public_id, alreadyIssued: true };

  const { data: pid } = await db.rpc('next_public_id', { p_prefix: 'INT-CERT', p_scope: 'certificate' });
  const { data: cert, error } = await db.from('certificates').insert({
    internship_id: internshipId,
    public_id: pid as unknown as string,
    overall_score: internship.overall_score,
  }).select('public_id').single();
  if (error) throw new Error(error.message);

  const student = (internship as any).profiles;
  await notify(internship.student_id, 'certificate_issued',
    `Certificate ${cert.public_id} is ready. It can be verified publicly.`, '/dashboard/certificate');
  if (student?.email) {
    await sendEmail(student.email, 'certificate', {
      name: student.full_name, certificateId: cert.public_id,
      field: (internship as any).internship_fields?.name, duration: internship.duration,
      score: internship.overall_score,
    });
  }
  await audit(adminId, 'certificate.issue', 'certificate', cert.public_id);
  return { publicId: cert.public_id, alreadyIssued: false };
}

/** LORs are drafted by admin, then approved and issued. Only for completed internships. */
export async function issueLor(internshipId: string, adminId: string | null) {
  const db = createAdminClient();
  const { data: done } = await db.from('internships').select('status').eq('id', internshipId).single();
  if (done?.status !== 'completed') throw new Error('The internship must be successfully completed before a letter of recommendation is issued.');
  const { data: lor } = await db.from('lor_records')
    .select('id, public_id, status').eq('internship_id', internshipId).single();
  if (!lor) throw new Error('Draft the letter before issuing it.');
  if (lor.status === 'issued') return { publicId: lor.public_id, alreadyIssued: true };

  await db.from('lor_records').update({
    status: 'issued', issue_date: new Date().toISOString().slice(0, 10), approved_by: adminId,
  }).eq('id', lor.id);

  const { data: internship } = await db.from('internships')
    .select('student_id, profiles!internships_student_id_fkey(full_name,email)')
    .eq('id', internshipId).single();
  const student = (internship as any)?.profiles;

  await notify(internship!.student_id, 'lor_issued',
    `Your letter of recommendation ${lor.public_id} has been issued.`, '/dashboard/lor');
  if (student?.email) {
    await sendEmail(student.email, 'lor', {
      name: student.full_name, lorId: lor.public_id,
    });
  }
  await audit(adminId, 'lor.issue', 'lor', lor.public_id);
  return { publicId: lor.public_id, alreadyIssued: false };
}

/**
 * Runs when an internship is completed. Which documents are issued automatically is controlled in
 * Admin -> Settings (Certificate: on by default, LOR: off by default). The normal eligibility rules
 * still apply: every week finished and enough required work approved. A failure here never blocks completion.
 */
export async function autoIssueDocuments(internshipId: string) {
  const brand = await getBrand();
  const db = createAdminClient();

  if (brand.autoCertificate) {
    try { await issueCertificate(internshipId, null); }
    catch (e) { console.error('[auto certificate]', e); }
  }

  if (brand.autoLor) {
    try {
      const { data: existing } = await db.from('lor_records').select('id').eq('internship_id', internshipId).maybeSingle();
      if (!existing) {
        // Standard letter: only real facts (name, domain, completion date) are printed; no praise is invented.
        const { data: pid } = await db.rpc('next_public_id', { p_prefix: 'INT-LOR', p_scope: 'lor' });
        const { error } = await db.from('lor_records')
          .insert({ internship_id: internshipId, public_id: pid as unknown as string, status: 'draft' });
        if (error) throw new Error(error.message);
      }
      await issueLor(internshipId, null);
    } catch (e) { console.error('[auto lor]', e); }
  }
}
