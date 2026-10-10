import { type NextRequest } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { apiAdmin } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { brandSchema } from '@/lib/validation';
import { audit } from '@/lib/audit';
import { ok, fail, zodFail } from '../../_lib';

/** Save the brand/contact settings (admin only). */
export async function PUT(req: NextRequest) {
  try {
    const admin = await apiAdmin();
    const parsed = brandSchema.safeParse(await req.json());
    if (!parsed.success) return zodFail(parsed.error.issues);
    const v = parsed.data;
    const value = { ...v, logoUrl: v.logoUrl || null, founderSignature: v.founderSignature || null, hrManagerSignature: v.hrManagerSignature || null };

    const { error } = await createAdminClient().from('site_settings')
      .upsert({ key: 'brand', value, updated_by: admin.id, updated_at: new Date().toISOString() }, { onConflict: 'key' });
    if (error) {
      return fail(new Error(error.message.includes('site_settings')
        ? 'The settings table is missing. Run supabase/migrations/20261008_site_settings.sql in the Supabase SQL Editor first.'
        : error.message));
    }
    revalidateTag('brand');
    revalidatePath('/', 'layout');
    await audit(admin.id, 'settings.update', 'site_settings', 'brand');
    return ok();
  } catch (e) { return fail(e); }
}
