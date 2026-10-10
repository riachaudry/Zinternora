'use client';
import * as React from 'react';

/** Opens the browser print dialog so the document can be saved as a PDF. Client-side only. */
export function PrintButton({ label = 'Download PDF' }: { label?: string }) {
  return (
    <button type="button" onClick={() => window.print()}
            className="no-print inline-flex h-11 items-center rounded-xl bg-signal px-5 text-[15px] font-semibold text-white hover:bg-signal-dark">
      {label}
    </button>
  );
}
