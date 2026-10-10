import { requireAdmin } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { appTimezone } from '@/lib/env';
import { SectionHead } from '@/components/ui';
import { CalendarView } from '@/components/calendar/CalendarView';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Calendar' };

/** Admin calendar: internship starts/ends, weekly deadlines across students, and admin-managed events (create / edit / delete). */
export default async function AdminCalendarPage() {
  await requireAdmin();
  const { data } = await createAdminClient().from('profiles')
    .select('id, full_name').eq('role', 'student').order('full_name').limit(1000);
  const students = (data ?? []).map((s: any) => ({ id: s.id as string, name: s.full_name as string }));

  return (
    <div className="space-y-5">
      <SectionHead title="Calendar"
                   body="Internship start and end dates, weekly task deadlines and your own events. Events you add are saved to the database and shown to the students you choose." />
      <CalendarView timezone={appTimezone()} isAdmin students={students} />
    </div>
  );
}
