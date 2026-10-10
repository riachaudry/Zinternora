import { type NextRequest, NextResponse } from 'next/server';
import { apiUser } from '@/lib/auth';
import { loadCalendarEvents, isDateStr } from '@/lib/services/calendar';
import { fail } from '../_lib';

/** Events for the signed-in user between ?from=yyyy-MM-dd and ?to=yyyy-MM-dd. Students only receive their own data. */
export async function GET(req: NextRequest) {
  try {
    const user = await apiUser();
    const from = req.nextUrl.searchParams.get('from');
    const to = req.nextUrl.searchParams.get('to');
    if (!isDateStr(from) || !isDateStr(to) || from > to) {
      return NextResponse.json({ error: 'Provide a valid date range.' }, { status: 422 });
    }
    return NextResponse.json(await loadCalendarEvents(user, from, to));
  } catch (e) { return fail(e); }
}
