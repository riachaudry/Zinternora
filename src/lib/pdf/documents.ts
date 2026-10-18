import { rgb } from 'pdf-lib';
import {
  newKit, Flow, letterHeader, letterFooter, drawSignature, centerText, clean, wrap,
  A4, NAVY, GOLD, INK, SLATE, MIST, WHITE, type Kit,
} from './kit';

export type PdfBrand = {
  name: string; tagline: string; website: string; supportEmail: string;
  founder: { name: string; title: string }; hrManager: { name: string; title: string };
  hrWhatsappLink?: string;
};

const done = async (k: Kit) => k.pdf.save();

/** Internship offer letter (A4, navy and gold). */
export async function offerLetterPdf(b: PdfBrand, d: {
  publicId?: string; issueDate: string; studentName: string; studentCode?: string;
  field: string; duration: number; startDate: string; endDate: string;
}): Promise<Uint8Array> {
  const k = await newKit();
  const f = new Flow(k, {
    top: 124, bottom: 64, left: 52, right: 52,
    decorate: (p) => { letterHeader(k, p, b.name, b.tagline); letterFooter(k, p, b.website, b.supportEmail); },
  });
  f.text('INTERNSHIP', { font: k.bold, size: 24, color: NAVY, after: 0, lh: 28 });
  f.text('OFFER LETTER', { font: k.bold, size: 24, color: GOLD, after: 6, lh: 28 });
  if (d.publicId) f.text(`Offer Letter ID: ${d.publicId}`, { size: 9.5, color: SLATE, after: 0 });
  f.text(`Date: ${d.issueDate}`, { size: 10.5, after: 10 });
  f.text(`Dear ${d.studentName},`, { font: k.bold, size: 11, after: 6 });
  f.text(`We are pleased to inform you that you have been selected for the ${d.duration}-Week Internship Program at ${b.name}. We believe in your potential and are excited to have you on board for this learning journey.`, { after: 6 });
  f.text('This internship will provide you with hands-on experience, practical skills and real-world projects to help you grow in your professional career.', { after: 10 });

  // Details table
  const rows: [string, string][] = [
    ['Intern Name', d.studentName], ...(d.studentCode ? [['Student ID', d.studentCode] as [string, string]] : []),
    ['Internship Domain', d.field], ['Duration', `${d.duration} Weeks (1 Month)`],
    ['Start Date', d.startDate], ['End Date', d.endDate],
    ['Mode', 'Online / Virtual'], ['Internship Type', 'Project-Based Internship'],
  ];
  const rowH = 20, tw = f.width;
  f.ensure(rowH * (rows.length + 1) + 10);
  let ty = f.y;
  f.page.drawRectangle({ x: f.opts.left, y: ty - rowH, width: tw, height: rowH, color: NAVY });
  centerText(f.page, k.bold, 'INTERNSHIP DETAILS', 10, ty - rowH + 7, WHITE, f.opts.left + tw / 2);
  ty -= rowH;
  rows.forEach(([l, v], i) => {
    if (i % 2 === 0) f.page.drawRectangle({ x: f.opts.left, y: ty - rowH, width: tw, height: rowH, color: MIST });
    f.page.drawText(clean(l), { x: f.opts.left + 12, y: ty - rowH + 7, size: 10, font: k.reg, color: SLATE });
    f.page.drawText(clean(v), { x: f.opts.left + 170, y: ty - rowH + 7, size: 10.5, font: k.bold, color: INK });
    ty -= rowH;
  });
  f.page.drawRectangle({ x: f.opts.left, y: ty, width: tw, height: rowH * (rows.length + 1), borderColor: rgb(0.73, 0.78, 0.86), borderWidth: 1 });
  f.y = ty - 14;

  f.text('Important Notes:', { font: k.bold, size: 11, color: NAVY, after: 4 });
  [
    'You will be assigned weekly tasks and a final project.',
    `All tasks and submissions will be managed through your ${b.name} dashboard.`,
    'A completion certificate and Letter of Recommendation (LOR) will be provided upon successful completion.',
    'This is a learning and training program designed to enhance your skills.',
    'This is not an employment offer and does not guarantee a job placement.',
  ].forEach((n) => f.bullet(n, { size: 10 }));
  f.gap(4);
  f.text(`We look forward to your active participation and a successful internship journey with ${b.name}!`, { after: 6 });
  f.text('Best Regards,', { font: k.bold, after: 2 });

  f.ensure(80);
  const sy = f.y - 58;
  await drawSignature(k, f.page, b.founder, f.opts.left, sy);
  await drawSignature(k, f.page, b.hrManager, A4.w - f.opts.right - 160, sy);
  return done(k);
}

/** Landscape certificate. */
export async function certificatePdf(b: PdfBrand, d: {
  publicId?: string; issueDate: string; studentName: string; field: string; duration: number; completionDate?: string;
}): Promise<Uint8Array> {
  const k = await newKit();
  const W = A4.h, H = A4.w; // landscape
  const p = k.pdf.addPage([W, H]);
  p.drawRectangle({ x: 0, y: 0, width: W, height: H, color: rgb(0.995, 0.99, 0.975) });
  p.drawRectangle({ x: 18, y: 18, width: W - 36, height: H - 36, borderColor: GOLD, borderWidth: 3 });
  p.drawRectangle({ x: 28, y: 28, width: W - 56, height: H - 56, borderColor: NAVY, borderWidth: 1 });
  p.drawRectangle({ x: 28, y: H - 120, width: W - 56, height: 92, color: NAVY });
  p.drawRectangle({ x: 28, y: H - 124, width: W - 56, height: 4, color: GOLD });
  p.drawImage(k.emblem, { x: W / 2 - 29, y: H - 92, width: 58, height: 58 });
  centerText(p, k.bold, clean(b.name.toUpperCase()), 11, H - 112, GOLD);
  centerText(p, k.serifBold, 'CERTIFICATE OF INTERNSHIP', 30, H - 170, NAVY);
  centerText(p, k.reg, 'This is to certify that', 13, H - 205, SLATE);
  centerText(p, k.serifItalic, d.studentName, 40, H - 255, NAVY);
  p.drawLine({ start: { x: W / 2 - 170, y: H - 266 }, end: { x: W / 2 + 170, y: H - 266 }, thickness: 1.2, color: GOLD });
  const body = `has participated in the ${d.duration}-Week ${d.field} Virtual Internship Program at ${b.name}${d.completionDate ? `, concluding on ${d.completionDate}` : ''}.`;
  wrap(k.reg, 13, body, W - 220).forEach((line, i) => centerText(p, k.reg, line, 13, H - 296 - i * 19, INK));
  centerText(p, k.reg, 'Awarded in recognition of the participant\'s time and effort in this program.', 11, H - 346, SLATE);
  await drawSignature(k, p, b.founder, 90, 92, 160);
  await drawSignature(k, p, b.hrManager, W - 90 - 170, 92, 160);
  centerText(p, k.bold, `Date of issue: ${d.issueDate}`, 10.5, 78, NAVY);
  if (d.publicId) centerText(p, k.reg, `Certificate ID: ${d.publicId}`, 9.5, 62, SLATE);
  centerText(p, k.reg, `${b.website}   |   ${b.supportEmail}`, 9, 42, SLATE);
  return done(k);
}

/** Letter of recommendation. Only facts are printed unless the admin supplies extra text. */
export async function lorPdf(b: PdfBrand, d: {
  publicId?: string; issueDate: string; studentName: string; field: string; duration: number;
  completionDate?: string; extra?: string;
}): Promise<Uint8Array> {
  const k = await newKit();
  const f = new Flow(k, {
    top: 128, bottom: 70, left: 56, right: 56,
    decorate: (p) => { letterHeader(k, p, b.name, b.tagline); letterFooter(k, p, b.website, b.supportEmail); },
  });
  f.text('LETTER OF', { font: k.bold, size: 22, color: NAVY, after: 0, lh: 26 });
  f.text('RECOMMENDATION', { font: k.bold, size: 22, color: GOLD, after: 8, lh: 26 });
  if (d.publicId) f.text(`LOR ID: ${d.publicId}`, { size: 9.5, color: SLATE, after: 0 });
  f.text(`Date: ${d.issueDate}`, { after: 14 });
  f.text('To Whom It May Concern,', { font: k.bold, after: 8 });
  f.text(`This is to certify that ${d.studentName} has taken part in the ${d.duration}-Week Internship Program at ${b.name} in the field of ${d.field}${d.completionDate ? `, concluding on ${d.completionDate}` : ''}.`, { after: 8 });
  f.text('The program consists of weekly project-based tasks and a final project, completed online.', { after: 8 });
  if (d.extra) f.text(d.extra, { after: 8 });
  f.text(`We wish ${d.studentName} continued success in future studies and career opportunities.`, { after: 14 });
  f.text('Sincerely,', { font: k.bold, after: 2 });
  f.ensure(90);
  const sy = f.y - 62;
  await drawSignature(k, f.page, b.founder, f.opts.left, sy);
  await drawSignature(k, f.page, b.hrManager, A4.w - f.opts.right - 160, sy);
  return done(k);
}

export type TaskSheetItem = {
  code: string; title: string; points: number; description: string; instructions: string; objective: string; deliverable: string;
};

/** The weekly task sheet that goes to the student when HR opens a week. */
export async function weekTasksPdf(b: PdfBrand, d: {
  studentName: string; field: string; week: number; weekTitle: string; deadline: string;
  isFinal?: boolean; tasks: TaskSheetItem[]; linkedinUrl: string; facebookUrl: string; tiktokUrl: string;
}): Promise<Uint8Array> {
  const k = await newKit();
  const f = new Flow(k, {
    top: 124, bottom: 66, left: 50, right: 50,
    decorate: (p, n) => { letterHeader(k, p, b.name, b.tagline); letterFooter(k, p, b.website, b.supportEmail); centerText(p, k.reg, `Page ${n}`, 8, 56, SLATE); },
  });
  f.text(d.isFinal ? 'FINAL PROJECT' : `WEEK ${d.week} TASKS`, { font: k.bold, size: 22, color: NAVY, after: 0, lh: 26 });
  f.text(d.weekTitle, { font: k.bold, size: 13, color: GOLD, after: 6, lh: 17 });
  f.text(`Intern: ${d.studentName}    |    Domain: ${d.field}    |    Deadline: ${d.deadline} (Sunday, 11:59 PM)`, { size: 9.5, color: SLATE, after: 8 });
  f.text('Tasks open one by one. Submit the current task in your dashboard to unlock the next one.', { size: 10, after: 8 });

  for (const t of d.tasks) {
    f.ensure(60);
    f.page.drawRectangle({ x: f.opts.left, y: f.y - 22, width: f.width, height: 22, color: NAVY });
    f.page.drawText(clean(`${t.code}   ${t.title}`.slice(0, 80)), { x: f.opts.left + 10, y: f.y - 15, size: 10.5, font: k.bold, color: WHITE });
    const pts = `${t.points} pts`;
    f.page.drawText(pts, { x: f.opts.left + f.width - 10 - k.bold.widthOfTextAtSize(pts, 10), y: f.y - 15, size: 10, font: k.bold, color: GOLD });
    f.y -= 30;
    f.text(`Brief: ${t.description}`, { size: 10, after: 3 });
    if (t.instructions && t.instructions !== t.description) f.text(`Instructions: ${t.instructions}`, { size: 10, after: 3 });
    f.text(`Objective: ${t.objective}`, { size: 10, after: 3 });
    f.text(`Required deliverable: ${t.deliverable}`, { size: 10, font: k.bold, after: 12 });
  }

  f.ensure(150);
  f.text('What to submit for every task', { font: k.bold, size: 12, color: NAVY, after: 4 });
  f.bullet('Your work link (GitHub, Figma, Google Drive or a live demo).', { size: 10 });
  f.bullet('Proof of the task: screenshots or a short screen recording.', { size: 10 });
  f.bullet(`A LinkedIn post about the task that mentions ${b.name}. Paste the post link when you submit.`, { size: 10 });
  f.bullet('Follow our pages (required for all interns).', { size: 10 });
  f.text(`LinkedIn: ${d.linkedinUrl}`, { size: 9, color: SLATE, indent: 16, after: 0 });
  f.text(`Facebook: ${d.facebookUrl}`, { size: 9, color: SLATE, indent: 16, after: 0 });
  f.text(`TikTok: ${d.tiktokUrl}`, { size: 9, color: SLATE, indent: 16, after: 8 });
  if (b.hrWhatsappLink) f.text(`Problem while submitting? Message HR directly on WhatsApp: ${b.hrWhatsappLink}`, { size: 10, font: k.bold, color: NAVY });
  return done(k);
}
