import generated from '@content/documents.json';

/**
 * The PDFs the site publishes, and what each one is.
 *
 * The files live in `public/media/documents/`, and `npm run documents` draws
 * every page of each out to a picture and lists them in
 * `content/documents.json`. What a document is called and how it is described
 * is written here, by hand, because a scan carries neither.
 */

type Generated = { pdf: string; bytes: number; pages: string[] };
const FILES = generated as Record<string, Generated>;

export type SiteDocument = {
  /** Anchor on the page that shows it. */
  id: string;
  title: string;
  description: string;
  /** Name the file is saved under when downloaded. */
  downloadAs: string;
  pdf: string;
  bytes: number;
  pages: string[];
};

function defineDocument(
  name: string,
  details: Omit<SiteDocument, 'pdf' | 'bytes' | 'pages'>
): SiteDocument {
  const file = FILES[name];
  if (!file) throw new Error(`No pages for ${name}.pdf -- run npm run documents`);
  return { ...details, ...file };
}

export const APPLICATION_FORM = defineDocument('application-form', {
  id: 'application-form',
  title: 'Application Form',
  description:
    'Personal and academic details, fee payment details, and the declaration to be signed by the applicant.',
  downloadAs: 'VIMST-Application-Form.pdf',
});

export const AICTE_NOTICE = defineDocument('aicte-public-notice', {
  id: 'aicte-public-notice',
  title: 'AICTE Public Notice',
  description:
    'All India Council for Technical Education, Advt. No. UB/04(03)/2011, on technical education programmes offered in franchise mode or in collaboration with universities.',
  downloadAs: 'AICTE-Public-Notice.pdf',
});

export const UGC_NOTICE = defineDocument('ugc-notice', {
  id: 'ugc-notice',
  title: 'UGC Notice on Equivalence of Degrees',
  description:
    'University Grants Commission, F. No. UGC/VIMST/2013 dated 21.11.2013, on degrees awarded by Open and Distance Learning institutions being at par with those of conventional universities.',
  downloadAs: 'UGC-Notice-Equivalence-of-Degrees.pdf',
});

/** "362 KB", "1.0 MB": the size a visitor on mobile data wants to know first. */
export function fileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
