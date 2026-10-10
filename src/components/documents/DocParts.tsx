import * as React from 'react';
import { qrMatrix } from '@/lib/qr';

export const NAVY = '#0B2D5B';
export const GOLD = '#B8862B';

/* ---------------- background art: corner swooshes + footer band ---------------- */
export function PageArt({ symmetric = false }: { symmetric?: boolean }) {
  const gold = 'url(#od-gold)';
  return (
    <svg className="od-art" viewBox="0 0 794 1123" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="od-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F7E7A6" /><stop offset=".35" stopColor="#D8A93A" />
          <stop offset=".65" stopColor="#B8862B" /><stop offset="1" stopColor="#F0D57A" />
        </linearGradient>
        <linearGradient id="od-navy" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#12386F" /><stop offset="1" stopColor="#08224A" />
        </linearGradient>
        <linearGradient id="od-page" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" /><stop offset="1" stopColor="#FBF8F0" />
        </linearGradient>
      </defs>
      <rect width="794" height="1123" fill="url(#od-page)" />
      {/* thin outer gold frame */}
      <rect x="6" y="6" width="782" height="1111" fill="none" stroke={gold} strokeWidth="1.6" />

      {/* top-left swoosh (kept small so it never touches the logo or text) */}
      <path d="M0 0 H270 C200 14 96 42 0 88 Z" fill="url(#od-navy)" />
      <path d="M0 90 C96 44 200 16 272 2 L304 0 C206 18 104 54 0 104 Z" fill={gold} />
      {!symmetric && <path d="M0 114 C120 60 260 26 440 12 C600 0 700 6 794 20" fill="none" stroke={gold} strokeWidth="2" />}
      {!symmetric && <path d="M470 0 C600 4 700 12 794 36" fill="none" stroke={gold} strokeWidth="1.3" opacity=".7" />}
      {symmetric && (
        <g>
          <path d="M0 114 C100 66 200 36 330 18" fill="none" stroke={gold} strokeWidth="1.8" />
          <path d="M794 0 H524 C594 14 698 42 794 88 Z" fill="url(#od-navy)" />
          <path d="M794 90 C698 44 594 16 522 2 L490 0 C588 18 690 54 794 104 Z" fill={gold} />
          <path d="M794 114 C694 66 594 36 464 18" fill="none" stroke={gold} strokeWidth="1.8" />
        </g>
      )}

      {/* bottom band */}
      <path d="M0 1123 V1003 C170 1052 330 1064 500 1034 C620 1012 720 996 794 986 V1123 Z" fill="url(#od-navy)" />
      <path d="M0 996 C170 1044 330 1056 500 1026 C620 1004 720 988 794 976 L794 986 C720 996 620 1012 500 1034 C330 1064 170 1052 0 1003 Z" fill={gold} />
      <path d="M0 984 C170 1030 330 1042 500 1012 C620 990 720 974 794 964" fill="none" stroke={gold} strokeWidth="1.6" opacity=".8" />
    </svg>
  );
}

/* ---------------- logo: mortarboard + ZINTERNORA + LEARN | BUILD | GROW ---------------- */
export function Cap({ size = 56 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <path d="M32 8 L62 22 L32 36 L2 22 Z" fill={NAVY} />
      <path d="M32 8 L62 22 L32 36 Z" fill="#12386F" />
      <path d="M14 31 V44 C14 51 50 51 50 44 V31 L32 39.5 Z" fill={NAVY} />
      <path d="M32 39.5 L50 31 V44 C50 47 44 49 38 49.6 L32 50 Z" fill="#0A2650" />
      <path d="M32 22 L56 25 V42" fill="none" stroke="#D8A93A" strokeWidth="2" strokeLinecap="round" />
      <circle cx="56" cy="44" r="2.6" fill="#D8A93A" />
      <path d="M32 8 L62 22" stroke="#D8A93A" strokeWidth="1.6" fill="none" />
    </svg>
  );
}

export function DocLogo({ name, logoUrl }: { name: string; logoUrl?: string | null }) {
  return (
    <div className="od-logo">
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logoUrl} alt="" width={76} height={76} style={{ width: 76, height: 76, objectFit: 'contain' }} />
      ) : (
        <Cap size={64} />
      )}
      <div>
        <p className="od-logo-name">{name.toUpperCase()}</p>
        <p className="od-logo-motto"><span />LEARN&nbsp;|&nbsp;BUILD&nbsp;|&nbsp;GROW<span /></p>
      </div>
    </div>
  );
}

/* ---------------- QR block (real, scannable) ---------------- */
export function Qr({ url, size = 92 }: { url: string; size?: number }) {
  const m = qrMatrix(url);
  const n = m.length;
  const q = 2; // quiet zone, in modules
  let d = '';
  m.forEach((row, y) => row.forEach((v, x) => { if (v) d += `M${x + q} ${y + q}h1v1h-1z`; }));
  return (
    <svg width={size} height={size} viewBox={`0 0 ${n + q * 2} ${n + q * 2}`} shapeRendering="crispEdges" role="img" aria-label={`QR code linking to ${url}`}>
      <rect width={n + q * 2} height={n + q * 2} fill="#fff" />
      <path d={d} fill="#0B2D5B" />
    </svg>
  );
}

export function IdQr({ label, id, url, website }: { label: string; id: string; url: string; website: string }) {
  return (
    <div className="od-idqr">
      <p className="od-idqr-label">{label}</p>
      <p className="od-idqr-id">{id}</p>
      <Qr url={url} />
      <p className="od-idqr-verify">Verify at<br />{website.replace(/^www\./, '')}/verify</p>
    </div>
  );
}

/* ---------------- gold seal ---------------- */
export function Seal({ ribbon = false, size = 132, name = 'ZINTERNORA', mark = null }: { ribbon?: boolean; size?: number; name?: string; mark?: string | null }) {
  const fs = Math.max(9, Math.min(15, Math.round(150 / Math.max(6, name.length))));
  const bumps = Array.from({ length: 40 }, (_, i) => {
    const a = (i / 40) * Math.PI * 2;
    return <circle key={i} cx={100 + Math.cos(a) * 90} cy={100 + Math.sin(a) * 90} r="6.2" fill="url(#od-seal)" />;
  });
  const leaves = [-1, 1].flatMap((side) =>
    Array.from({ length: 11 }, (_, i) => {
      const a = (Math.PI * (0.62 + i * 0.075)) * (side === -1 ? 1 : 1);
      const ang = side === -1 ? Math.PI * 0.5 + (i - 5.5) * 0.18 + Math.PI * 0.0 : 0;
      const t = (i / 10) * Math.PI * 0.62 + Math.PI * 0.55;
      const x = 100 + Math.cos(side === -1 ? t : Math.PI - t) * 60;
      const y = 100 + Math.sin(t) * 60;
      const rot = (side === -1 ? t : Math.PI - t) * (180 / Math.PI) + 90 + (side === -1 ? 20 : -20);
      void a; void ang;
      return <ellipse key={`${side}-${i}`} cx={x} cy={y} rx="3" ry="7" fill="#7A5712" opacity=".85" transform={`rotate(${rot} ${x} ${y})`} />;
    }),
  );
  return (
    <svg width={size} height={ribbon ? size * 1.22 : size} viewBox={`0 0 200 ${ribbon ? 244 : 200}`} aria-hidden="true">
      <defs>
        <linearGradient id="od-seal" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F9E9A8" /><stop offset=".4" stopColor="#D9A93A" />
          <stop offset=".7" stopColor="#B8862B" /><stop offset="1" stopColor="#F2D77C" />
        </linearGradient>
        <linearGradient id="od-seal-in" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FBEFB8" /><stop offset=".5" stopColor="#E3B84A" /><stop offset="1" stopColor="#C99A2E" />
        </linearGradient>
      </defs>
      {ribbon && (
        <g>
          <path d="M70 168 L48 238 L82 222 L96 244 L106 172 Z" fill="#0B2D5B" stroke="#B8862B" strokeWidth="2" />
          <path d="M130 168 L152 238 L118 222 L104 244 L94 172 Z" fill="#12386F" stroke="#B8862B" strokeWidth="2" />
        </g>
      )}
      {bumps}
      <circle cx="100" cy="100" r="86" fill="url(#od-seal)" />
      <circle cx="100" cy="100" r="76" fill="none" stroke="#8A6414" strokeWidth="1.6" />
      <circle cx="100" cy="100" r="72" fill="url(#od-seal-in)" />
      {leaves}
      {mark ? (
        <image href={mark} x="68" y="46" width="64" height="64" preserveAspectRatio="xMidYMid meet" />
      ) : (
      <g transform="translate(76 58) scale(.75)"><path d="M32 8 L62 22 L32 36 L2 22 Z" fill="#0B2D5B" /><path d="M14 31 V44 C14 51 50 51 50 44 V31 L32 39.5 Z" fill="#0B2D5B" /><path d="M32 22 L56 25 V42" fill="none" stroke="#7A5712" strokeWidth="2.4" strokeLinecap="round" /></g>
      )}
      <text x="100" y="118" textAnchor="middle" fontFamily="Georgia, serif" fontWeight="700" fontSize={fs} fill="#0B2D5B" letterSpacing=".6">{name.toUpperCase()}</text>
      <text x="100" y="131" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="6.4" fill="#0B2D5B" letterSpacing="1.2">LEARN | BUILD | GROW</text>
    </svg>
  );
}

/* ---------------- signatories ---------------- */
type Person = { name: string; title: string; signatureImage: string | null };
/**
 * A real handwritten signature appears ONLY if the owner supplied an image and its path is set in
 * BRAND (src/lib/brand.ts). Otherwise the line stays blank for a wet signature. Never drawn or typed.
 */
export function Sign({ person, org, align = 'left' }: { person: Person; org: string; align?: 'left' | 'right' }) {
  return (
    <div className={`od-sign od-sign-${align}`}>
      <div className="od-sign-img">
        {person.signatureImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={person.signatureImage} alt={`Signature of ${person.name}`} />
        )}
      </div>
      <p className="od-sign-name">{person.name}</p>
      <p className="od-sign-title">{person.title}</p>
      <p className="od-sign-title">{org}</p>
    </div>
  );
}

/* ---------------- footer on the navy band ---------------- */
export function PageFooter({ website, email }: { website: string; email: string }) {
  return (
    <div className="od-footer">
      <span>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.6" aria-hidden="true"><circle cx="12" cy="12" r="9.5" /><path d="M2.5 12h19M12 2.5c3 3 3 16 0 19M12 2.5c-3 3-3 16 0 19" /></svg>
        {website}
      </span>
      <span>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.6" aria-hidden="true"><rect x="2.5" y="5" width="19" height="14" rx="1.5" /><path d="M3 6.5l9 7 9-7" /></svg>
        {email}
      </span>
    </div>
  );
}

export function SampleMark() {
  return <div className="od-sample" aria-hidden="true">SAMPLE</div>;
}

/* ---------------- small line icons ---------------- */
const ICONS: Record<string, React.ReactNode> = {
  user: <><circle cx="12" cy="8" r="3.6" /><path d="M4.5 20c.8-4 3.8-6 7.5-6s6.7 2 7.5 6" /></>,
  cap: <><path d="M12 4l10 5-10 5L2 9z" /><path d="M6 12v5c3 2.5 9 2.5 12 0v-5" /></>,
  target: <><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="3.5" /><path d="M12 2v4M12 18v4M2 12h4M18 12h4" /></>,
  clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7v5l3.5 2" /></>,
  calendar: <><rect x="3.5" y="5" width="17" height="15" rx="1.5" /><path d="M3.5 10h17M8 3v4M16 3v4" /></>,
  monitor: <><rect x="3" y="4" width="18" height="12" rx="1.5" /><path d="M8 20h8M12 16v4" /></>,
  brief: <><rect x="3" y="7.5" width="18" height="12" rx="1.5" /><path d="M9 7.5V5h6v2.5M3 13h18" /></>,
  clip: <><rect x="5.5" y="4.5" width="13" height="16" rx="1.5" /><path d="M9 4.5h6v2.5H9zM8.5 12l2 2 4-4M8.5 17h7" /></>,
  code: <><path d="M8.5 7L3.5 12l5 5M15.5 7l5 5-5 5M13.5 5l-3 14" /></>,
  gear: <><circle cx="12" cy="12" r="3.2" /><path d="M12 2.8v3M12 18.2v3M2.8 12h3M18.2 12h3M5.5 5.5l2.1 2.1M16.4 16.4l2.1 2.1M18.5 5.5l-2.1 2.1M7.6 16.4l-2.1 2.1" /></>,
  trophy: <><path d="M7 4h10v5a5 5 0 01-10 0zM7 6H4v2a3 3 0 003 3M17 6h3v2a3 3 0 01-3 3M12 14v4M8.5 20h7" /></>,
};
export function Ico({ name, size = 18, color = NAVY }: { name: keyof typeof ICONS; size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ICONS[name]}
    </svg>
  );
}

export function siteBase(website: string) {
  return (process.env.NEXT_PUBLIC_SITE_URL || `https://${website}`).replace(/\/$/, '');
}
