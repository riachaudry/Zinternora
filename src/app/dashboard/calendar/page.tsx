import { requireStudent } from '@/lib/auth';
import { appTimezone } from '@/lib/env';
import { SectionHead } from '@/components/ui';
import { CalendarView } from '@/components/calendar/CalendarView';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Calendar' };

export default async function StudentCalendarPage() {
  await requireStudent();
  return (
    <div className="space-y-5">
      <SectionHead title="Calendar"
                   body="Your task deadlines, internship weeks and important dates, with real dates from your internship. Locked tasks stay locked until you finish the previous task." />
      <CalendarView timezone={appTimezone()} />
    </div>
  );
}
