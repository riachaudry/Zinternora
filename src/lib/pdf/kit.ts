import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage, type PDFImage } from 'pdf-lib';
import { EMBLEM_PNG, SIGNATURE_PNG } from './assets';

export const NAVY = rgb(0.043, 0.176, 0.357);
export const GOLD = rgb(0.831, 0.686, 0.216);
export const INK = rgb(0.106, 0.165, 0.271);
export const SLATE = rgb(0.32, 0.38, 0.48);
export const MIST = rgb(0.945, 0.961, 0.984);
export const WHITE = rgb(1, 1, 1);
export const A4 = { w: 595.28, h: 841.89 };

/** Standard PDF fonts only cover Latin-1, so anything else is replaced to avoid an encoding error. */
export function clean(s: string): string {
  return String(s ?? '')
    .replace(/[‘’]/g, "'").replace(/[“”]/g, '"')
    .replace(/[–—]/g, '-').replace(/…/g, '...').replace(/•/g, '-')
    .replace(/[\r\t]/g, ' ')
    .replace(/[^\n\x20-\x7E\xA0-\xFF]/g, '?');
}

export type Kit = {
  pdf: PDFDocument; reg: PDFFont; bold: PDFFont; italic: PDFFont; serifBold: PDFFont; serifItalic: PDFFont;
  emblem: PDFImage; sig: (name: string) => Promise<PDFImage | null>;
};

export async function newKit(): Promise<Kit> {
  const pdf = await PDFDocument.create();
  const [reg, bold, italic, serifBold, serifItalic] = await Promise.all([
    pdf.embedFont(StandardFonts.Helvetica), pdf.embedFont(StandardFonts.HelveticaBold),
    pdf.embedFont(StandardFonts.HelveticaOblique), pdf.embedFont(StandardFonts.TimesRomanBold),
    pdf.embedFont(StandardFonts.TimesRomanBoldItalic),
  ]);
  const emblem = await pdf.embedPng(Buffer.from(EMBLEM_PNG, 'base64'));
  const cache = new Map<string, PDFImage>();
  const sig = async (name: string) => {
    const b64 = SIGNATURE_PNG[name];
    if (!b64) return null;
    if (!cache.has(name)) cache.set(name, await pdf.embedPng(Buffer.from(b64, 'base64')));
    return cache.get(name)!;
  };
  return { pdf, reg, bold, italic, serifBold, serifItalic, emblem, sig };
}

export function wrap(font: PDFFont, size: number, text: string, maxW: number): string[] {
  const out: string[] = [];
  for (const raw of clean(text).split('\n')) {
    const words = raw.split(/\s+/).filter(Boolean);
    if (!words.length) { out.push(''); continue; }
    let line = '';
    for (const w of words) {
      const t = line ? `${line} ${w}` : w;
      if (font.widthOfTextAtSize(t, size) <= maxW) line = t;
      else { if (line) out.push(line); line = w; }
    }
    out.push(line);
  }
  return out;
}

export function centerText(page: PDFPage, font: PDFFont, text: string, size: number, y: number, color = INK, cx = page.getWidth() / 2) {
  const t = clean(text);
  page.drawText(t, { x: cx - font.widthOfTextAtSize(t, size) / 2, y, size, font, color });
}

/** Flowing text writer that adds pages (with the same header/footer) as needed. */
export class Flow {
  page!: PDFPage; y = 0; pageNo = 0;
  constructor(public k: Kit, public opts: { top: number; bottom: number; left: number; right: number; decorate: (p: PDFPage, n: number) => void }) { this.newPage(); }
  newPage() {
    this.page = this.k.pdf.addPage([A4.w, A4.h]);
    this.pageNo += 1;
    this.opts.decorate(this.page, this.pageNo);
    this.y = A4.h - this.opts.top;
  }
  get width() { return A4.w - this.opts.left - this.opts.right; }
  ensure(h: number) { if (this.y - h < this.opts.bottom) this.newPage(); }
  gap(h: number) { this.y -= h; }
  text(text: string, o: { font?: PDFFont; size?: number; color?: ReturnType<typeof rgb>; indent?: number; lh?: number; after?: number } = {}) {
    const font = o.font ?? this.k.reg, size = o.size ?? 10.5, lh = o.lh ?? size * 1.45;
    const x = this.opts.left + (o.indent ?? 0);
    for (const line of wrap(font, size, text, this.width - (o.indent ?? 0))) {
      this.ensure(lh);
      this.y -= lh;
      if (line) this.page.drawText(line, { x, y: this.y + lh * 0.28, size, font, color: o.color ?? INK });
    }
    this.y -= o.after ?? 4;
  }
  bullet(text: string, o: { size?: number } = {}) {
    const size = o.size ?? 10.5, lh = size * 1.45;
    const lines = wrap(this.k.reg, size, text, this.width - 16);
    this.ensure(lh);
    this.page.drawRectangle({ x: this.opts.left + 3, y: this.y - lh + lh * 0.28 + 2, width: 4, height: 4, color: GOLD });
    lines.forEach((line) => {
      this.ensure(lh);
      this.y -= lh;
      this.page.drawText(line, { x: this.opts.left + 16, y: this.y + lh * 0.28, size, font: this.k.reg, color: INK });
    });
    this.y -= 3;
  }
}

/** Navy header band with the emblem, used by letters and the weekly task sheet. */
export function letterHeader(k: Kit, p: PDFPage, brandName: string, tagline: string) {
  p.drawRectangle({ x: 0, y: A4.h - 100, width: A4.w, height: 100, color: NAVY });
  p.drawRectangle({ x: 0, y: A4.h - 104, width: A4.w, height: 4, color: GOLD });
  p.drawImage(k.emblem, { x: 36, y: A4.h - 88, width: 64, height: 64 });
  p.drawText(clean(brandName), { x: 114, y: A4.h - 56, size: 26, font: k.bold, color: WHITE });
  p.drawText(clean(tagline.toUpperCase()), { x: 115, y: A4.h - 76, size: 8.5, font: k.bold, color: GOLD });
}

export function letterFooter(k: Kit, p: PDFPage, website: string, email: string) {
  p.drawRectangle({ x: 0, y: 0, width: A4.w, height: 46, color: NAVY });
  p.drawRectangle({ x: 0, y: 46, width: A4.w, height: 3, color: GOLD });
  centerText(p, k.reg, `${website}   |   ${email}`, 9, 28, WHITE);
  centerText(p, k.reg, 'Follow us: LinkedIn (the-internora)  |  Facebook  |  TikTok', 8, 14, GOLD);
}

export async function drawSignature(k: Kit, p: PDFPage, person: { name: string; title: string }, x: number, y: number, w = 150) {
  const img = await k.sig(person.name);
  if (img) {
    const h = (img.height / img.width) * w;
    const hh = Math.min(h, 52);
    p.drawImage(img, { x, y: y + 4, width: hh === h ? w : (img.width / img.height) * hh, height: hh });
  }
  p.drawLine({ start: { x, y }, end: { x: x + w + 10, y }, thickness: 1, color: INK });
  p.drawText(clean(person.title), { x, y: y - 13, size: 9.5, font: k.bold, color: NAVY });
}
