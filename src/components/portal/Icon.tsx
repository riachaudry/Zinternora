import * as React from 'react';

const P: Record<string, string> = {
  home: 'M3 9.5 10 3l7 6.5V17a1 1 0 0 1-1 1h-3.5v-5h-5v5H4a1 1 0 0 1-1-1V9.5Z',
  user: 'M10 10a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM3.5 17c.6-3 3.3-4.5 6.5-4.5s5.9 1.5 6.5 4.5',
  briefcase: 'M3 7h14v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7Zm4-0V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M3 11h14',
  file: 'M6 2.5h5.5L15.5 6.5V16a1 1 0 0 1-1 1h-8.5a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1ZM11 2.5V7h4.5M7.5 11h5M7.5 14h5',
  clock: 'M10 17a7 7 0 1 0 0-14 7 7 0 0 0 0 14Zm0-11v4.5l3 1.5',
  calendar: 'M4 5h12a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm0 4h13M7 3v3M13 3v3',
  map: 'M3 5.5 7.5 4l5 1.5L17 4v10.5L12.5 16l-5-1.5L3 16V5.5ZM7.5 4v10.5M12.5 5.5V16',
  check: 'M4 10.5 8 14.5 16 5.5',
  upload: 'M10 13V4m0 0L6.5 7.5M10 4l3.5 3.5M4 14v2h12v-2',
  chat: 'M4 4h12a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H9l-4 3v-3H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z',
  chart: 'M4 16V9m4 7V4m4 12v-5m4 5V7',
  folder: 'M3 6a1 1 0 0 1 1-1h4l2 2h6a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6Z',
  award: 'M10 11.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9ZM7 11l-1 6 4-2 4 2-1-6',
  mail: 'M3 5.5h14v10H3v-10Zm0 0 7 5.5 7-5.5',
  bell: 'M10 2.5a4.5 4.5 0 0 0-4.5 4.5c0 3.2-1 4.4-1.6 5-.4.4-.1 1.1.5 1.1h11.2c.6 0 .9-.7.5-1.1-.6-.6-1.6-1.8-1.6-5A4.5 4.5 0 0 0 10 2.5ZM8.2 15.8a1.9 1.9 0 0 0 3.6 0',
  help: 'M10 17a7 7 0 1 0 0-14 7 7 0 0 0 0 14ZM8 8a2 2 0 1 1 3 1.7c-.7.4-1 .8-1 1.5M10 14h.01',
  gear: 'M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM10 2.5l1 2 2.2.5 1.8-1.3 1.5 1.5-1.3 1.8.5 2.2 2 1v2.1l-2 1-.5 2.2 1.3 1.8-1.5 1.5-1.8-1.3-2.2.5-1 2H8l-1-2-2.2-.5-1.8 1.3-1.5-1.5 1.3-1.8-.5-2.2-2-1V8.9l2-1 .5-2.2L2.5 4.9 4 3.4l1.8 1.3L8 4.2l1-1.7Z',
  users: 'M7.5 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM2.5 16.5c.5-2.6 2.6-4 5-4s4.5 1.4 5 4M13 8.5a2.5 2.5 0 1 0 0-5M14 12.7c1.8.3 3.1 1.6 3.5 3.8',
  card: 'M3 5.5h14v9H3v-9Zm0 3h14M6 12.5h3',
  layers: 'M10 3 2.5 7 10 11l7.5-4L10 3ZM2.5 10.5 10 14.5l7.5-4M2.5 13.5 10 17.5l7.5-4',
  search: 'M9 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12Zm4.5 1.5L17 20',
  plus: 'M10 4v12M4 10h12',
  arrow: 'M4 10h12m0 0-4-4m4 4-4 4',
  cap: 'M2.5 8 10 4l7.5 4-7.5 4L2.5 8ZM5.5 10v3.5L10 16l4.5-2.5V10M17.5 8v4.5',
  lock: 'M5.5 9V7a4.5 4.5 0 0 1 9 0v2M5 9h10a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1Z',
  logout: 'M8 4H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3M12 7l3 3-3 3M15 10H8',
};

export function Icon({ name, size = 18, className = '' }: { name: string; size?: number; className?: string }) {
  const d = P[name] ?? P.layers;
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden="true" className={className}>
      <path d={d} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Which icon each sidebar label gets. */
export const NAV_ICON: Record<string, string> = {
  'Dashboard': 'home', 'My Profile': 'user', 'My Internship': 'briefcase', 'Offer Letter': 'file',
  'Timeline': 'clock', 'Calendar': 'calendar', 'Weekly Roadmap': 'map', 'Tasks': 'check',
  'Submissions': 'upload', 'Feedback': 'chat', 'Progress': 'chart', 'Projects': 'folder',
  'Certificate': 'award', 'LOR': 'mail', 'Notifications': 'bell', 'Support': 'help', 'Settings': 'gear',
  'Students': 'users', 'Applications': 'file', 'Payments': 'card', 'Invitations': 'mail',
  'Internships': 'briefcase', 'Fields': 'layers', 'Batches': 'users', 'Weekly Roadmaps': 'map',
  'Evaluations': 'chart', 'Offer Letters': 'file', 'Certificates': 'award', 'Sample Documents': 'folder',
  'Emails': 'mail', 'Admin Profile': 'user',
};
