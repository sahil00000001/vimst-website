import fs from 'node:fs/promises';
import path from 'node:path';
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib';

/**
 * Renders a statement of marks as a real PDF.
 *
 * Drawn with pdf-lib rather than rendered from HTML: there is no headless
 * browser on a serverless function, and a marksheet is a fixed, ruled document
 * whose layout is easier to control by drawing it than by fighting print CSS.
 */

export type MarksheetSubject = {
  subjectCode: string;
  subject: string;
  totalMarks: number;
  obtainedMarks: number;
};

export type MarksheetData = {
  name: string;
  rollNo: string;
  fatherName: string;
  dob: string;
  batch: string;
  className: string;
  branch: string;
  semester: string;
  subjects: MarksheetSubject[];
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  finalResult: string;
  totalMarksInWord: string;
};

/* A4 at 72dpi, and the institute's brand. */
const PAGE = { width: 595.28, height: 841.89 };
const MARGIN = 42;
/* The institute navy, #072151, for the headings and the mark. */
const NAVY = rgb(0.027, 0.129, 0.318);
/* A fail stays red. It is the one thing on the sheet that has to be read
   as bad news at a glance, and navy would quietly remove that. */
const FAIL = rgb(0.69, 0.06, 0.16);
const INK = rgb(0.09, 0.08, 0.1);
const SLATE = rgb(0.42, 0.42, 0.45);
const RULE = rgb(0.85, 0.83, 0.79);
const WASH = rgb(0.96, 0.955, 0.945);

let logoCache: Uint8Array | null | undefined;

async function loadLogo(): Promise<Uint8Array | null> {
  if (logoCache !== undefined) return logoCache;
  try {
    // A print-sized copy: the full-resolution mark would be embedded whole
    // into every marksheet a student downloads.
    const file = path.join(process.cwd(), 'public', 'media', 'logo-print.png');
    logoCache = new Uint8Array(await fs.readFile(file));
  } catch {
    // The document is still valid without it.
    logoCache = null;
  }
  return logoCache;
}

/** Shortens text with an ellipsis so it can never overflow its column. */
function fit(text: string, font: PDFFont, size: number, maxWidth: number) {
  if (font.widthOfTextAtSize(text, size) <= maxWidth) return text;
  let cut = text;
  while (cut.length > 1 && font.widthOfTextAtSize(`${cut}…`, size) > maxWidth) {
    cut = cut.slice(0, -1);
  }
  return `${cut}…`;
}

export async function buildMarksheetPdf(data: MarksheetData): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  pdf.setTitle(`Statement of Marks, ${data.rollNo}, Semester ${data.semester}`);
  pdf.setAuthor('Vivekananda Institute of Management Science and Technology');
  pdf.setSubject('Statement of Marks');
  pdf.setProducer('VIMST');
  pdf.setCreationDate(new Date());

  const body = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const serif = await pdf.embedFont(StandardFonts.TimesRoman);

  const page = pdf.addPage([PAGE.width, PAGE.height]);
  const inner = { left: MARGIN, right: PAGE.width - MARGIN };
  const width = inner.right - inner.left;
  let y = PAGE.height - MARGIN;

  /* Outer frame */
  page.drawRectangle({
    x: MARGIN - 12,
    y: MARGIN - 12,
    width: width + 24,
    height: PAGE.height - 2 * (MARGIN - 12),
    borderColor: RULE,
    borderWidth: 1,
  });

  /* Masthead */
  const logo = await loadLogo();
  if (logo) {
    const png = await pdf.embedPng(logo);
    const logoWidth = 250;
    const scaled = png.scale(logoWidth / png.width);
    page.drawImage(png, {
      x: (PAGE.width - logoWidth) / 2,
      y: y - scaled.height,
      width: logoWidth,
      height: scaled.height,
    });
    y -= scaled.height + 14;
  } else {
    const title = 'VIVEKANANDA';
    const size = 20;
    page.drawText(title, {
      x: (PAGE.width - serif.widthOfTextAtSize(title, size)) / 2,
      y: y - size,
      size,
      font: serif,
      color: NAVY,
    });
    y -= size + 16;
  }

  const subtitle = 'INSTITUTE OF MANAGEMENT SCIENCE AND TECHNOLOGY';
  page.drawText(subtitle, {
    x: (PAGE.width - body.widthOfTextAtSize(subtitle, 8)) / 2,
    y,
    size: 8,
    font: body,
    color: SLATE,
  });
  y -= 22;

  /* Document title */
  const docTitle = 'STATEMENT OF MARKS';
  const titleWidth = bold.widthOfTextAtSize(docTitle, 12);
  page.drawRectangle({
    x: (PAGE.width - titleWidth - 28) / 2,
    y: y - 5,
    width: titleWidth + 28,
    height: 22,
    color: WASH,
  });
  page.drawText(docTitle, {
    x: (PAGE.width - titleWidth) / 2,
    y: y + 1,
    size: 12,
    font: bold,
    color: NAVY,
  });
  y -= 34;

  /* Student details, two columns */
  const details: [string, string][] = [
    ['Name of the student', data.name],
    ['Roll number', data.rollNo],
    ["Father's name", data.fatherName || '-'],
    ['Date of birth', data.dob],
    ['Class', data.className || '-'],
    ['Batch', data.batch || '-'],
    ['Branch', data.branch || '-'],
    ['Semester', data.semester],
  ];

  const colWidth = width / 2;
  const rowHeight = 26;
  const detailRows = Math.ceil(details.length / 2);

  page.drawRectangle({
    x: inner.left,
    y: y - detailRows * rowHeight,
    width,
    height: detailRows * rowHeight,
    borderColor: RULE,
    borderWidth: 0.75,
  });

  details.forEach(([label, value], i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = inner.left + col * colWidth + 10;
    const rowTop = y - row * rowHeight;

    page.drawText(label.toUpperCase(), {
      x,
      y: rowTop - 10,
      size: 6,
      font: bold,
      color: SLATE,
    });
    page.drawText(fit(value, body, 9.5, colWidth - 22), {
      x,
      y: rowTop - 21,
      size: 9.5,
      font: body,
      color: INK,
    });

    if (col === 0) {
      page.drawLine({
        start: { x: inner.left + colWidth, y: rowTop },
        end: { x: inner.left + colWidth, y: rowTop - rowHeight },
        thickness: 0.75,
        color: RULE,
      });
    }
    if (row < detailRows - 1) {
      page.drawLine({
        start: { x: inner.left, y: rowTop - rowHeight },
        end: { x: inner.right, y: rowTop - rowHeight },
        thickness: 0.75,
        color: RULE,
      });
    }
  });

  y -= detailRows * rowHeight + 24;

  /* Subject table */
  const cols = [
    { key: 'code', label: 'CODE', width: 62, align: 'left' as const },
    { key: 'subject', label: 'SUBJECT', width: width - 62 - 58 - 58 - 66, align: 'left' as const },
    { key: 'total', label: 'MAX', width: 58, align: 'right' as const },
    { key: 'obtained', label: 'OBTAINED', width: 58, align: 'right' as const },
    { key: 'grade', label: 'RESULT', width: 66, align: 'right' as const },
  ];

  const drawRow = (
    p: PDFPage,
    top: number,
    cells: string[],
    opts: { font: PDFFont; size: number; color?: typeof INK; fill?: typeof WASH; height: number }
  ) => {
    if (opts.fill) {
      p.drawRectangle({ x: inner.left, y: top - opts.height, width, height: opts.height, color: opts.fill });
    }
    let x = inner.left;
    cols.forEach((col, i) => {
      const text = fit(cells[i] ?? '', opts.font, opts.size, col.width - 12);
      const textWidth = opts.font.widthOfTextAtSize(text, opts.size);
      const tx = col.align === 'right' ? x + col.width - 6 - textWidth : x + 6;
      p.drawText(text, {
        x: tx,
        y: top - opts.height + (opts.height - opts.size) / 2 + 1.5,
        size: opts.size,
        font: opts.font,
        color: opts.color ?? INK,
      });
      x += col.width;
    });
    p.drawLine({
      start: { x: inner.left, y: top - opts.height },
      end: { x: inner.right, y: top - opts.height },
      thickness: 0.5,
      color: RULE,
    });
  };

  const headerHeight = 20;
  drawRow(page, y, cols.map((c) => c.label), {
    font: bold,
    size: 6.5,
    color: SLATE,
    fill: WASH,
    height: headerHeight,
  });
  y -= headerHeight;

  const bodyRowHeight = 20;
  for (const s of data.subjects) {
    const ratio = s.totalMarks > 0 ? s.obtainedMarks / s.totalMarks : 0;
    drawRow(
      page,
      y,
      [
        s.subjectCode || '-',
        s.subject,
        String(s.totalMarks),
        String(s.obtainedMarks),
        ratio >= 0.35 ? 'Pass' : 'Fail',
      ],
      { font: body, size: 9, height: bodyRowHeight, color: ratio >= 0.35 ? INK : FAIL }
    );
    y -= bodyRowHeight;
  }

  /* Totals */
  drawRow(
    page,
    y,
    ['', 'TOTAL', String(data.totalMarks), String(data.obtainedMarks), `${data.percentage}%`],
    { font: bold, size: 9, height: 22, fill: WASH }
  );
  y -= 22;

  page.drawRectangle({
    x: inner.left,
    y,
    width,
    height: (data.subjects.length + 2) * 0,
    borderColor: RULE,
    borderWidth: 0,
  });

  y -= 22;

  /* Result summary */
  const summary: [string, string][] = [
    ['Total marks in words', data.totalMarksInWord],
    ['Percentage', `${data.percentage}%`],
    ['Final result', data.finalResult],
  ];

  const summaryWidth = width / 3;
  page.drawRectangle({
    x: inner.left,
    y: y - 40,
    width,
    height: 40,
    borderColor: RULE,
    borderWidth: 0.75,
  });

  summary.forEach(([label, value], i) => {
    const x = inner.left + i * summaryWidth + 10;
    page.drawText(label.toUpperCase(), { x, y: y - 15, size: 6, font: bold, color: SLATE });
    page.drawText(fit(value, bold, 10, summaryWidth - 22), {
      x,
      y: y - 30,
      size: 10,
      font: bold,
      color: label === 'Final result' && data.finalResult !== 'PASS' ? FAIL : INK,
    });
    if (i > 0) {
      page.drawLine({
        start: { x: inner.left + i * summaryWidth, y },
        end: { x: inner.left + i * summaryWidth, y: y - 40 },
        thickness: 0.75,
        color: RULE,
      });
    }
  });

  y -= 78;

  /* Signature */
  page.drawLine({
    start: { x: inner.right - 150, y },
    end: { x: inner.right, y },
    thickness: 0.75,
    color: INK,
  });
  const sig = 'SIGNATURE OF THE PRINCIPAL';
  page.drawText(sig, {
    x: inner.right - body.widthOfTextAtSize(sig, 7),
    y: y - 12,
    size: 7,
    font: body,
    color: SLATE,
  });

  /* Footer */
  const generated = new Date().toISOString().slice(0, 10);
  const note =
    'This statement was generated from the institute record system and is valid without a physical signature.';
  page.drawText(fit(note, body, 6.5, width), {
    x: inner.left,
    y: MARGIN + 6,
    size: 6.5,
    font: body,
    color: SLATE,
  });
  const stamp = `Generated ${generated}`;
  page.drawText(stamp, {
    x: inner.right - body.widthOfTextAtSize(stamp, 6.5),
    y: MARGIN + 6,
    size: 6.5,
    font: body,
    color: SLATE,
  });

  return pdf.save();
}
