import * as React from 'react';
import Link from 'next/link';
import { Icon } from './Icon';

const PASTEL = {
  blue:   { bg: '#E8F0FE', fg: '#1D4ED8' },
  green:  { bg: '#E3F6EC', fg: '#15803D' },
  gold:   { bg: '#FCF1D6', fg: '#A16207' },
  purple: { bg: '#EFE8FD', fg: '#6D28D9' },
  pink:   { bg: '#FDE8F0', fg: '#BE185D' },
  teal:   { bg: '#DFF5F5', fg: '#0F766E' },
} as const;
export type Pastel = keyof typeof PASTEL;

/** Soft pastel stat tile with an icon chip (fixed colours, readable in every theme). */
export function PastelStat({ label, value, hint, icon, color = 'blue', href }: {
  label: string; value: React.ReactNode; hint?: string; icon: string; color?: Pastel; href?: string;
}) {
  const c = PASTEL[color];
  const card = (
    <div className={`rounded-2xl p-4 shadow-card ${href ? 'transition hover:-translate-y-0.5 hover:shadow-lg' : ''}`} style={{ background: c.bg }}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-[12.5px] font-semibold" style={{ color: '#334155' }}>{label}</p>
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/80" style={{ color: c.fg }}>
          <Icon name={icon} size={16} />
        </span>
      </div>
      <p className="mt-2 font-display text-[22px] font-extrabold leading-tight" style={{ color: '#0F1B33' }}>{value}</p>
      {hint && <p className="mt-1 text-[12px]" style={{ color: '#475569' }}>{hint}</p>}
    </div>
  );
  return href ? <Link href={href} className="block">{card}</Link> : card;
}

/** Illustrated desk scene (laptop, plants, books, mug) drawn in SVG for the hero banner. */
function DeskScene() {
  return (
    <svg viewBox="0 0 520 240" className="h-full w-full" preserveAspectRatio="xMaxYMax meet" aria-hidden="true">
      <defs>
        <linearGradient id="dsWall" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#F6D9A8" stopOpacity="0" /><stop offset=".45" stopColor="#F2C98A" stopOpacity=".55" />
          <stop offset="1" stopColor="#F7DDB0" />
        </linearGradient>
        <linearGradient id="dsDesk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#D9A867" /><stop offset="1" stopColor="#B07A3C" /></linearGradient>
        <linearGradient id="dsScreen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#1B3A66" /><stop offset="1" stopColor="#0B2D5B" /></linearGradient>
      </defs>
      <rect width="520" height="240" fill="url(#dsWall)" />
      {/* poster */}
      <g transform="translate(300 18)">
        <rect width="96" height="118" rx="6" fill="#FBF3E4" stroke="#D4AF37" strokeWidth="3" />
        <text x="48" y="38" textAnchor="middle" fontSize="11" fontWeight="700" fill="#0B2D5B" fontFamily="Georgia,serif">DISCIPLINE</text>
        <text x="48" y="56" textAnchor="middle" fontSize="11" fontWeight="700" fill="#0B2D5B" fontFamily="Georgia,serif">CREATES</text>
        <text x="48" y="74" textAnchor="middle" fontSize="11" fontWeight="700" fill="#0B2D5B" fontFamily="Georgia,serif">FREEDOM</text>
        <path d="M48 96c-8-7-12-11-6-15 3-2 6 0 6 3 0-3 3-5 6-3 6 4 2 8-6 15Z" fill="#E08A3C" />
      </g>
      {/* desk */}
      <rect x="150" y="176" width="380" height="70" fill="url(#dsDesk)" />
      <rect x="150" y="172" width="380" height="8" fill="#E8BE82" />
      {/* books */}
      <rect x="205" y="150" width="82" height="12" rx="2" fill="#0B2D5B" />
      <rect x="212" y="138" width="74" height="12" rx="2" fill="#D4AF37" />
      <rect x="208" y="162" width="86" height="10" rx="2" fill="#7B3F2A" />
      {/* pencil cup */}
      <rect x="318" y="140" width="26" height="32" rx="4" fill="#0B2D5B" />
      <path d="M324 140l-3-26M331 140l1-30M338 140l5-24" stroke="#E6C75A" strokeWidth="3" strokeLinecap="round" />
      {/* laptop */}
      <path d="M356 172l12-58h92l12 58Z" fill="url(#dsScreen)" stroke="#0A1F3F" strokeWidth="3" />
      <rect x="378" y="132" width="52" height="4" rx="2" fill="#D4AF37" opacity=".8" />
      <rect x="378" y="142" width="38" height="4" rx="2" fill="#fff" opacity=".35" />
      <rect x="340" y="172" width="150" height="7" rx="3" fill="#C9CED8" />
      {/* mug */}
      <rect x="470" y="140" width="38" height="42" rx="6" fill="#0B2D5B" />
      <path d="M508 150h6a8 8 0 0 1 0 22h-6" stroke="#0B2D5B" strokeWidth="5" fill="none" />
      <text x="489" y="165" textAnchor="middle" fontSize="8" fontWeight="700" fill="#E6C75A" fontFamily="Georgia,serif">Internora</text>
      {/* plants */}
      <g>
        <rect x="170" y="128" width="30" height="40" rx="6" fill="#F4E9D8" />
        <path d="M185 128c-30-10-34-46-20-70 14 16 22 40 20 70ZM185 128c4-34 20-56 40-62-2 28-14 52-40 62ZM185 128c-12-22-8-44 4-62 8 20 6 44-4 62Z" fill="#3E8E5B" />
      </g>
      <g>
        <rect x="244" y="104" width="22" height="30" rx="5" fill="#F4E9D8" opacity="0" />
      </g>
      <g transform="translate(436 0)">
        <rect x="26" y="108" width="34" height="30" rx="6" fill="#F4E9D8" opacity="0" />
        <path d="M76 142c-10-30-4-70 14-96 6 30 4 64-14 96ZM76 142c-22-18-30-50-20-84 14 22 24 54 20 84Z" fill="#2F7D4F" />
      </g>
    </svg>
  );
}

/** Navy hero banner with an illustrated desk scene on the right. */
export function Hero({ title, body, action, extra }: {
  title: string; body: string; action?: { href: string; label: string }; extra?: React.ReactNode;
}) {
  return (
    <section className="relative min-h-[190px] overflow-hidden rounded-3xl p-6 text-white shadow-card sm:p-8"
             style={{ background: 'linear-gradient(100deg,#0B2D5B 0%,#14407A 45%,#3A5F95 62%,#E9B96F 100%)' }}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 hidden w-[56%] items-end sm:flex">
        <DeskScene />
      </div>
      <div className="relative flex flex-wrap items-center justify-between gap-6">
        <div className="max-w-lg">
          <h1 className="font-display text-2xl font-extrabold sm:text-[32px]">{title} <span aria-hidden="true">👋</span></h1>
          <p className="mt-2 text-[14.5px] leading-relaxed text-white/85">{body}</p>
          {action && (
            <Link href={action.href}
                  className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl px-5 text-[14px] font-bold text-[#0B2D5B] transition hover:brightness-105"
                  style={{ background: 'linear-gradient(90deg,#E6C75A,#D4A640)' }}>
              {action.label} <Icon name="arrow" size={16} />
            </Link>
          )}
        </div>
        {extra}
      </div>
    </section>
  );
}

/** Peach "Your Progress" card with a ring. */
export function ProgressRing({ percent, started, caption, href }: { percent: number; started: boolean; caption: string; href: string }) {
  const r = 46, c = 2 * Math.PI * r, off = c * (1 - Math.max(0, Math.min(100, percent)) / 100);
  return (
    <div className="rounded-3xl p-5 shadow-card" style={{ background: 'linear-gradient(135deg,#FDD9C8,#F8B9A4 55%,#F6A9A0)' }}>
      <h2 className="font-display text-[17px] font-extrabold text-[#7A2E1E]">Your Progress</h2>
      <div className="mt-3 flex items-center gap-4">
        <svg width="112" height="112" viewBox="0 0 112 112" role="img" aria-label={`${percent}% complete`}>
          <circle cx="56" cy="56" r={r} fill="rgba(255,255,255,.55)" stroke="#fff" strokeWidth="10" />
          <circle cx="56" cy="56" r={r} fill="none" stroke="#0B2D5B" strokeWidth="10" strokeLinecap="round"
                  strokeDasharray={c} strokeDashoffset={off} transform="rotate(-90 56 56)" />
          <text x="56" y="63" textAnchor="middle" fontSize="22" fontWeight="800" fill="#0B2D5B">{percent}%</text>
        </svg>
        <div>
          <p className="font-display text-[15px] font-bold text-[#3B1D14]">{started ? 'In progress' : 'Not Started Yet'}</p>
          <p className="mt-1 text-[12.5px] leading-snug text-[#5B3328]">{caption}</p>
        </div>
      </div>
      <Link href={href} className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl border border-[#D4AF37] bg-white/70 px-4 text-[13px] font-bold text-[#0B2D5B] hover:bg-white">
        View Weekly Roadmap <Icon name="arrow" size={14} />
      </Link>
    </div>
  );
}

/** Month grid with marked days (deadlines) and prev/next/today links. Pure server component. */
export function MiniCalendar({ marked, href, offset = 0, basePath }: { marked: string[]; href: string; offset?: number; basePath: string }) {
  const now = new Date();
  const view = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const y = view.getFullYear(), m = view.getMonth();
  const lead = (view.getDay() + 6) % 7; // Monday first
  const days = new Date(y, m + 1, 0).getDate();
  const set = new Set(marked.map((d) => d.slice(0, 10)));
  const cells: (number | null)[] = [...Array(lead).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  const key = (d: number) => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  const isThisMonth = offset === 0;
  const nav = 'grid h-8 w-8 place-items-center rounded-lg border border-mist-deep text-ink hover:bg-mist';
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 font-display text-[15px] font-bold text-ink">
          <Icon name="calendar" size={16} className="text-[#1D4ED8]" /> Calendar
        </h2>
        <Link href={href} className="text-[13px] font-semibold text-signal">Open</Link>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <Link href={`${basePath}?m=${offset - 1}`} scroll={false} className={nav} aria-label="Previous month">‹</Link>
        <span className="font-display text-[14px] font-bold text-ink">{view.toLocaleString('en-US', { month: 'long', year: 'numeric' })}</span>
        <div className="flex items-center gap-1.5">
          <Link href={basePath} scroll={false} className="rounded-lg border border-mist-deep px-2.5 py-1.5 text-[12px] font-semibold text-ink hover:bg-mist">Today</Link>
          <Link href={`${basePath}?m=${offset + 1}`} scroll={false} className={nav} aria-label="Next month">›</Link>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-7 gap-y-1 text-center text-[12px]">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
          <span key={d} className="pb-1 text-[11px] font-semibold text-slate-light">{d}</span>
        ))}
        {cells.map((d, i) => {
          if (d === null) return <span key={i} />;
          const today = isThisMonth && d === now.getDate();
          const due = set.has(key(d));
          return (
            <span key={i} className="relative mx-auto grid h-8 w-8 place-items-center rounded-full text-[12.5px] font-medium"
                  style={today ? { background: '#0B2D5B', color: '#fff' } : { color: 'rgb(var(--slate))' }}>
              {d}
              {due && <span className="absolute bottom-0.5 h-1.5 w-1.5 rounded-full bg-[#EF4444]" />}
            </span>
          );
        })}
      </div>
      <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-slate-light">
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#0B2D5B]" /> Today</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#EF4444]" /> Task Deadline</span>
      </p>
    </div>
  );
}

const QA = { blue: ['#E3ECFD', '#1D4ED8'], cyan: ['#DDF3FB', '#0E7490'], purple: ['#EBDDFB', '#6D28D9'], peach: ['#FDE3D3', '#C2410C'] } as const;

/** Quick action tile with its own pastel colour. */
export function QuickAction({ href, icon, label, color = 'blue', external = false }: { href: string; icon: string; label: string; color?: keyof typeof QA; external?: boolean }) {
  const [bg, fg] = QA[color];
  return (
    <Link href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          className="flex flex-col items-center gap-2 rounded-2xl p-4 text-center text-[13px] font-bold shadow-card transition hover:-translate-y-0.5"
          style={{ background: bg, color: '#0F1B33' }}>
      <span className="grid h-10 w-10 place-items-center rounded-full bg-white/80" style={{ color: fg }}><Icon name={icon} size={20} /></span>
      {label}
    </Link>
  );
}
