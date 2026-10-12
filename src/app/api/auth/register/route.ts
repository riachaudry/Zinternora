import { type NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { registerSchema } from '@/lib/validation';
import { hashToken } from '@/lib/ids';
import { sendEmail } from '@/lib/email';
import { rateLimit, clientKey } from '@/lib/rate-limit';
import { audit } from '@/lib/audit';
import { ok, fail, zodFail } from '../../_lib';

export async function POST(req: NextRequest) {
  try {
    if (!rateLimit(clientKey(req, 'register'), 5).ok) {
      return fail(new Error('Too many attempts. Wait a minute and try again.'));
    }

    const parsed = registerSchema.safeParse(await req.json());
    if (!parsed.success) return zodFail(parsed.error.issues);
    const { password, invite_token, field_slug: _fieldSlug, ...profile } = parsed.data;

    const db = createAdminClient();

    // Supabase Auth hashes the password; we never store or log it.
    const { data: created, error: authError } = await db.auth.admin.createUser({
      email: profile.email,
      password,
      email_confirm: true,
      user_metadata: { full_name: profile.full_name },
    });
    if (authError || !created.user) {
      const taken = authError?.message?.toLowerCase().includes('already');
      return fail(new Error(taken
        ? 'An account already exists for that email. Sign in instead.'
        : authError?.message ?? 'Could not create the account.'));
    }

    // The auth trigger created the profile row; fill in the rest.
    const { error: profileError } = await db.from('profiles').update({
      phone: profile.phone, whatsapp: profile.whatsapp || profile.phone,
      ...(profile.date_of_birth ? { date_of_birth: profile.date_of_birth } : {}),
      ...(profile.gender ? { gender: profile.gender } : {}),
      ...(profile.city ? { city: profile.city } : {}),
      ...(profile.country ? { country: profile.country } : {}),
      ...(profile.education_level ? { education_level: profile.education_level } : {}),
      ...(profile.university ? { university: profile.university } : {}),
      ...(profile.field_of_study ? { field_of_study: profile.field_of_study } : {}),
      ...(profile.bio ? { bio: profile.bio } : {}),
      skills: profile.skills ?? [],
      ...(profile.linkedin_url ? { linkedin_url: profile.linkedin_url } : {}),
      ...(profile.portfolio_url ? { portfolio_url: profile.portfolio_url } : {}),
    }).eq('id', created.user.id);
    if (profileError) console.error('[register] profile update failed', profileError);

    if (invite_token) {
      await db.from('invitations')
        .update({ accepted_at: new Date().toISOString() })
        .eq('token_hash', hashToken(invite_token));
    }

    const { data: row } = await db.from('profiles').select('student_id').eq('id', created.user.id).single();
    await sendEmail(profile.email, 'welcome', { name: profile.full_name, studentId: row?.student_id });
    await audit(created.user.id, 'auth.register', 'profile', created.user.id, {}, req.headers.get('x-forwarded-for'));

    return ok({ ok: true, studentId: row?.student_id });
  } catch (e) { return fail(e); }
}


