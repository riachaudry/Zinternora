import { getBrand } from '@/lib/settings';
import { BRAND } from '@/lib/brand';

const DEFAULT_MARK = BRAND.logoMark;
import { fullDate } from '@/lib/dates';
import { DocFrame } from './DocFrame';
import { PageArt, DocLogo, IdQr, Seal, Sign, PageFooter, SampleMark, Ico, siteBase } from './DocParts';

export type OfferLetterData = {
  publicId: string; issueDate: string;
  studentName: string; studentCode: string;
  field: string; duration: number;
  startDate: string; endDate: string;
};

const notes = (name: string) => [
  'You will be assigned weekly tasks and a final project.',
  `All tasks and submissions will be managed through your ${name} dashboard.`,
  'A completion certificate and Letter of Recommendation (LOR) will be provided upon successful completion.',
  'This is a learning and training program designed to enhance your skills.',
  'This is not an employment offer and does not guarantee a job placement.',
];

/** Internship Offer Letter — A4 page in the approved navy-and-gold design. */
export async function OfferLetter({ data, sample = false }: { data: OfferLetterData; sample?: boolean }) {
  const brand = await getBrand();
  const rows: { icon: Parameters<typeof Ico>[0]['name']; label: string; value: string; bold?: boolean }[] = [
    { icon: 'user', label: 'Intern Name', value: data.studentName, bold: true },
    { icon: 'cap', label: 'Student ID', value: data.studentCode },
    { icon: 'target', label: 'Internship Domain', value: data.field, bold: true },
    { icon: 'clock', label: 'Duration', value: `${data.duration} Weeks (1 Month)`, bold: true },
    { icon: 'calendar', label: 'Start Date', value: fullDate(data.startDate) },
    { icon: 'calendar', label: 'End Date', value: fullDate(data.endDate) },
    { icon: 'monitor', label: 'Mode', value: 'Online / Virtual' },
    { icon: 'brief', label: 'Internship Type', value: 'Project-Based Internship', bold: true },
  ];
  return (
    <DocFrame>
      <article className="od-page" data-theme="classic">
        <PageArt />
        <SampleMark text={brand.name.toUpperCase()} />
        <div className="od-logo-pos"><DocLogo name={brand.name} logoUrl={brand.logoUrl === DEFAULT_MARK ? null : brand.logoUrl} /></div>
        <div className="od-idqr-pos">
          <IdQr label="Offer Letter ID:" id={data.publicId} url={sample ? `${siteBase(brand.website)}/verify` : `${siteBase(brand.website)}/verify/offer-letter/${data.publicId}`} website={brand.website} />
        </div>

        <h1 className="od-title od-title-left" style={{ top: 178 }}>
          <span className="navy">INTERNSHIP</span><br /><span className="gold">OFFER LETTER</span>
        </h1>

        <div className="od-text" style={{ top: 280, left: 60, right: 60 }}>
          <p>Date: {fullDate(data.issueDate)}</p>
          <p className="od-dear">Dear {data.studentName},</p>
          <p>We are pleased to inform you that you have been selected for the {data.duration}-Week Internship Program at {brand.name}. We believe in your potential and are excited to have you on board for this learning journey.</p>
          <p>This internship will provide you with hands-on experience, practical skills and real-world projects to help you grow in your professional career.</p>

          <table className="od-table">
            <thead><tr><th colSpan={3}>INTERNSHIP DETAILS</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.label}>
                  <td className="ic"><Ico name={r.icon} size={16} /></td>
                  <td className="lb">{r.label}</td>
                  <td className={r.bold ? 'vl b' : 'vl'}>{r.value}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="od-h">Important Notes:</p>
          <ul className="od-bullets">{notes(brand.name).map((n) => <li key={n}>{n}</li>)}</ul>
          <p>We look forward to your active participation and a successful internship journey with {brand.name}!</p>
          <p className="od-h" style={{ marginTop: 10 }}>Best Regards,</p>
        </div>

        <div className="od-sigrow" style={{ top: 852 }}>
          <Sign person={brand.founder} org={brand.name} />
          <div className="od-seal-slot"><Seal size={128} name={brand.name} mark={null} /></div>
          <Sign person={brand.hrManager} org={brand.name} />
        </div>
        <PageFooter website={brand.website} email={brand.supportEmail} />
      </article>
    </DocFrame>
  );
}
