import { getBrand } from '@/lib/settings';
import { BRAND } from '@/lib/brand';

const DEFAULT_MARK = BRAND.logoMark;
import { fullDate } from '@/lib/dates';
import { DocFrame } from './DocFrame';
import { PageArt, DocLogo, IdQr, Seal, Sign, PageFooter, SampleMark, siteBase } from './DocParts';

export type LorData = {
  publicId: string; issueDate: string;
  studentName: string; studentCode: string;
  field: string; duration: number; completionDate: string;
  performance: string; skills: string[]; achievements: string; recommendation: string;
};

/**
 * Letter of Recommendation — A4 page in the approved design. The first paragraph (completion) is generated
 * from real data; the remaining paragraphs are the text an admin wrote and approved in Admin → LOR.
 */
export async function Lor({ data, sample = false }: { data: LorData; sample?: boolean }) {
  const brand = await getBrand();
  return (
    <DocFrame>
      <article className="od-page" data-theme="classic">
        <PageArt />
        {sample && <SampleMark />}
        <div className="od-logo-pos"><DocLogo name={brand.name} logoUrl={brand.logoUrl === DEFAULT_MARK ? null : brand.logoUrl} /></div>
        <div className="od-idqr-pos">
          <IdQr label="LOR ID:" id={data.publicId} url={`${siteBase(brand.website)}/verify`} website={brand.website} />
        </div>

        <h1 className="od-title od-title-left" style={{ top: 186 }}>
          <span className="navy">LETTER OF</span><br /><span className="gold">RECOMMENDATION</span>
        </h1>

        <div className="od-text od-lor" style={{ top: 322, left: 60, right: 60 }}>
          <p>Date: {fullDate(data.issueDate)}</p>
          <p style={{ marginTop: 14 }}>To Whom It May Concern,</p>
          <p style={{ marginTop: 14 }}>
            This is to certify that <b>{data.studentName}</b> has successfully completed the {data.duration}-Week Internship
            Program at {brand.name} in the field of <b>{data.field}</b>
            {data.completionDate ? <>, completing the program on {fullDate(data.completionDate)}</> : null}.
          </p>
          {data.performance && <p>{data.performance}</p>}
          {!!data.skills.length && <p>Skills demonstrated: {data.skills.join(', ')}.</p>}
          {data.achievements && <p>{data.achievements}</p>}
          <p>
            {data.recommendation ||
              `We highly recommend ${data.studentName} for future opportunities and wish them continued success.`}
          </p>
          <p style={{ marginTop: 24 }}><b>Sincerely,</b></p>
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
