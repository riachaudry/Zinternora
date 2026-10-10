'use client';
import * as React from 'react';

const W = 794;   // A4 width at 96 dpi
const H = 1123;  // A4 height at 96 dpi

/**
 * Shows one A4 page at its true size, scaled down to fit narrow screens (phones/tablets).
 * When printing, the scale is removed so the page prints exactly at A4 size.
 */
export function DocFrame({ children }: { children: React.ReactNode }) {
  const wrap = React.useRef<HTMLDivElement>(null);
  const [scale, setScale] = React.useState(1);

  React.useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const fit = () => setScale(Math.min(1, el.clientWidth / W));
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={wrap} className="od-wrap" style={{ height: H * scale }}>
      <div className="od-scale" style={{ transform: `scale(${scale})` }}>{children}</div>
    </div>
  );
}
