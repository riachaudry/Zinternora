import { getBrand } from '@/lib/settings';
import { BRAND } from '@/lib/brand';

const DEFAULT_MARK = BRAND.logoMark;
import { fullDate } from '@/lib/dates';
import { DocFrame } from './DocFrame';
import { PageArt, DocLogo, IdQr, Seal, Sign, PageFooter, SampleMark, Ico, siteBase } from './DocParts';

export type CertificateData = {
  publicId: string; issueDate: string;
  studentName: string; studentCode: string;
  field: string; duration: number;
  startDate: string; endDate: string;
  completionDate: string; overallScore: number; status: 'issued' | 'revoked';
};

const WEEKS: { icon: Parameters<typeof Ico>[0]['name']; a: string; b: string }[] = [
  { icon: 'clip', a: 'Fundamentals', b: '& Setup' },
  { icon: 'code', a: 'Practical', b: 'Development' },
  { icon: 'gear', a: 'Projects', b: '& Implementation' },
  { icon: 'trophy', a: 'Final Project', b: '& Submission' },
];

/** Certificate of Completion — A4 page in the approved The Internora design. Uses the real completion date. */
export async function Certificate({ data, sample = false }: { data: CertificateData; verifyUrl?: string; sample?: boolean }) {
  const brand = await getBrand();
  return (
    <DocFrame>
      <article className="od-page" data-theme="classic">
        <PageArt symmetric />
        {sample && <SampleMark />}
        <div className="od-cert-logo"><DocLogo name={brand.name} logoUrl={brand.logoUrl === DEFAULT_MARK ? null : brand.logoUrl} /></div>
        <div className="od-idqr-pos" style={{ top: 92 }}>
          <IdQr label="Certificate ID:" id={data.publicId} url={sample ? `${siteBase(brand.website)}/verify` : `${siteBase(brand.website)}/verify/certificate/${data.publicId}`} website={brand.website} />
        </div>

        <h1 className="od-title od-title-center" style={{ top: 168 }}>
          <span className="navy big">CERTIFICATE</span><br /><span className="gold">OF COMPLETION</span>
        </h1>

        <div className="od-cert-body">
          <p className="od-cert-intro">This certificate is proudly presented to</p>
          <p className="od-script">{data.studentName}</p>
          <div className="od-gold-line" />
          <p className="od-cert-intro">for successfully completing the</p>
          <p className="od-pill">{data.duration}-WEEK INTERNSHIP PROGRAM</p>
          <p className="od-cert-intro" style={{ margin: '4px 0' }}>in</p>
          <p className="od-domain">{data.field}</p>
          <p className="od-cert-text">
            The intern has successfully completed all assigned weekly tasks, practical activities and the final project
            through the {brand.name} Internship Program. We appreciate their dedication, effort and commitment to learning and growth.
          </p>
          <ul className="od-weeks">
            {WEEKS.map((w, i) => (
              <li key={w.a}>
                <span className="od-coin"><Ico name={w.icon} size={26} /></span>
                <b>WEEK {i + 1}</b><span>{w.a}</span><span>{w.b}</span>
              </li>
            ))}
          </ul>
        </div>

        {data.status === 'revoked' && <div className="od-revoked">This certificate has been revoked and is no longer valid.</div>}

        <div className="od-cert-bottom">
          <div className="od-cert-left">
            <p className="od-date">{fullDate(data.completionDate)}</p>
            <div className="od-date-line" />
            <p className="od-date-label">Completion Date</p>
            <Sign person={brand.founder} org={brand.name} />
          </div>
          <div className="od-cert-seal"><Seal ribbon size={142} name={brand.name} mark={null} /></div>
          <div className="od-cert-right"><Sign person={brand.hrManager} org={brand.name} /></div>
        </div>
        <PageFooter website={brand.website} email={brand.supportEmail} />
      </article>
    </DocFrame>
  );
}
