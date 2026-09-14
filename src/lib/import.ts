import ExcelJS from 'exceljs';
import {
  normaliseDob,
  normaliseRollNo,
  normaliseSemester,
  summarise,
  type Student,
  type SubjectMark,
} from './db';

/**
 * Workbook parsing for the bulk upload.
 *
 * The template carries two sheets:
 *
 *   Students  rollNo | name | fatherName | dob | batch | class | branch
 *   Marks     rollNo | semester | subjectCode | subject | totalMarks | obtainedMarks
 *
 * Marks are in long form -- one row per subject -- because that is what a
 * spreadsheet exported from an examination system actually looks like, and it
 * lets a semester have any number of subjects without reshaping the columns.
 * Rows are grouped by (rollNo, semester) into one result per pair.
 */

export const STUDENT_COLUMNS = [
  'rollNo',
  'name',
  'fatherName',
  'dob',
  'batch',
  'class',
  'branch',
] as const;

export const MARKS_COLUMNS = [
  'rollNo',
  'semester',
  'subjectCode',
  'subject',
  'totalMarks',
  'obtainedMarks',
] as const;

export type RowIssue = { sheet: string; row: number; message: string };

export type ParsedImport = {
  students: (Omit<Student, 'createdAt' | 'updatedAt'>)[];
  results: {
    rollNo: string;
    semester: string;
    subjects: SubjectMark[];
    totalMarks: number;
    obtainedMarks: number;
    percentage: number;
    finalResult: string;
    published: boolean;
  }[];
  issues: RowIssue[];
  /** Sheets found in the uploaded file, for the "nothing matched" message. */
  sheetNames: string[];
};

/** Excel cells arrive as strings, numbers, dates, formula results or rich text. */
function cellValue(cell: ExcelJS.CellValue): string | number | Date | null {
  if (cell === null || cell === undefined) return null;
  if (cell instanceof Date) return cell;
  if (typeof cell === 'number' || typeof cell === 'string') return cell;
  if (typeof cell === 'object') {
    const c = cell as unknown as Record<string, unknown>;
    if ('text' in c) return String(c.text);
    if ('result' in c) return (c.result as string | number | null) ?? null;
    if ('richText' in c && Array.isArray(c.richText)) {
      return c.richText.map((t: { text: string }) => t.text).join('');
    }
    if ('hyperlink' in c && 'text' in c) return String(c.text);
  }
  return null;
}

const text = (v: string | number | Date | null) =>
  v === null ? '' : v instanceof Date ? v.toISOString().slice(0, 10) : String(v).trim();

/** Maps a header row to column indexes, tolerating case and spacing changes. */
function headerMap(row: ExcelJS.Row, expected: readonly string[]) {
  const map = new Map<string, number>();
  row.eachCell({ includeEmpty: false }, (cell, col) => {
    const raw = text(cellValue(cell.value))
      .toLowerCase()
      .replace(/[\s_.-]/g, '');
    const match = expected.find((e) => e.toLowerCase().replace(/[\s_.-]/g, '') === raw);
    if (match) map.set(match, col);
  });
  return map;
}

function readSheet(
  worksheet: ExcelJS.Worksheet | undefined,
  expected: readonly string[],
  issues: RowIssue[]
): { map: Map<string, number>; rows: ExcelJS.Row[] } | null {
  if (!worksheet) return null;

  const headerRow = worksheet.getRow(1);
  const map = headerMap(headerRow, expected);

  const missing = expected.filter((e) => !map.has(e) && e !== 'subjectCode' && e !== 'fatherName');
  if (missing.length) {
    issues.push({
      sheet: worksheet.name,
      row: 1,
      message: `Missing column${missing.length > 1 ? 's' : ''}: ${missing.join(', ')}`,
    });
    return null;
  }

  const rows: ExcelJS.Row[] = [];
  worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber === 1) return;
    rows.push(row);
  });

  return { map, rows };
}

/** True when every mapped cell in the row is blank. */
function isBlank(row: ExcelJS.Row, map: Map<string, number>) {
  for (const col of map.values()) {
    if (text(cellValue(row.getCell(col).value))) return false;
  }
  return true;
}

export async function parseWorkbook(buffer: ArrayBuffer): Promise<ParsedImport> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  const issues: RowIssue[] = [];
  const sheetNames = workbook.worksheets.map((w) => w.name);

  const findSheet = (needle: string) =>
    workbook.worksheets.find((w) => w.name.trim().toLowerCase() === needle) ??
    workbook.worksheets.find((w) => w.name.trim().toLowerCase().includes(needle));

  /* ---------------- Students ---------------- */

  const students: ParsedImport['students'] = [];
  const seenRolls = new Set<string>();
  const studentSheet = readSheet(findSheet('student'), STUDENT_COLUMNS, issues);

  if (studentSheet) {
    const { map, rows } = studentSheet;
    const get = (row: ExcelJS.Row, key: string) => {
      const col = map.get(key);
      return col ? cellValue(row.getCell(col).value) : null;
    };

    for (const row of rows) {
      if (isBlank(row, map)) continue;
      const n = row.number;

      const rollNo = normaliseRollNo(get(row, 'rollNo'));
      const name = text(get(row, 'name'));
      const dob = normaliseDob(get(row, 'dob'));

      if (!rollNo) {
        issues.push({ sheet: 'Students', row: n, message: 'Roll number is blank.' });
        continue;
      }
      if (!name) {
        issues.push({ sheet: 'Students', row: n, message: `${rollNo}: name is blank.` });
        continue;
      }
      if (!dob) {
        issues.push({
          sheet: 'Students',
          row: n,
          message: `${rollNo}: date of birth is missing or unreadable.`,
        });
        continue;
      }
      if (seenRolls.has(rollNo)) {
        issues.push({
          sheet: 'Students',
          row: n,
          message: `${rollNo}: appears more than once; the later row wins.`,
        });
      }
      seenRolls.add(rollNo);

      students.push({
        rollNo,
        name,
        fatherName: text(get(row, 'fatherName')),
        dob,
        batch: text(get(row, 'batch')),
        className: text(get(row, 'class')),
        branch: text(get(row, 'branch')),
      });
    }
  }

  /* ---------------- Marks ---------------- */

  const grouped = new Map<string, { rollNo: string; semester: string; subjects: SubjectMark[] }>();
  const marksSheet = readSheet(findSheet('mark'), MARKS_COLUMNS, issues);

  if (marksSheet) {
    const { map, rows } = marksSheet;
    const get = (row: ExcelJS.Row, key: string) => {
      const col = map.get(key);
      return col ? cellValue(row.getCell(col).value) : null;
    };

    for (const row of rows) {
      if (isBlank(row, map)) continue;
      const n = row.number;

      const rollNo = normaliseRollNo(get(row, 'rollNo'));
      const semester = normaliseSemester(get(row, 'semester'));
      const subject = text(get(row, 'subject'));
      const totalMarks = Number(text(get(row, 'totalMarks')));
      const obtainedMarks = Number(text(get(row, 'obtainedMarks')));

      if (!rollNo) {
        issues.push({ sheet: 'Marks', row: n, message: 'Roll number is blank.' });
        continue;
      }
      if (!semester) {
        issues.push({
          sheet: 'Marks',
          row: n,
          message: `${rollNo}: semester must be I-VIII (or 1-8).`,
        });
        continue;
      }
      if (!subject) {
        issues.push({ sheet: 'Marks', row: n, message: `${rollNo}: subject name is blank.` });
        continue;
      }
      if (!Number.isFinite(totalMarks) || totalMarks <= 0) {
        issues.push({
          sheet: 'Marks',
          row: n,
          message: `${rollNo} / ${subject}: total marks must be a positive number.`,
        });
        continue;
      }
      if (!Number.isFinite(obtainedMarks) || obtainedMarks < 0) {
        issues.push({
          sheet: 'Marks',
          row: n,
          message: `${rollNo} / ${subject}: obtained marks must be zero or more.`,
        });
        continue;
      }
      if (obtainedMarks > totalMarks) {
        issues.push({
          sheet: 'Marks',
          row: n,
          message: `${rollNo} / ${subject}: obtained (${obtainedMarks}) exceeds total (${totalMarks}).`,
        });
        continue;
      }

      const key = `${rollNo}::${semester}`;
      if (!grouped.has(key)) grouped.set(key, { rollNo, semester, subjects: [] });
      grouped.get(key)!.subjects.push({
        subjectCode: text(get(row, 'subjectCode')).toUpperCase(),
        subject,
        totalMarks,
        obtainedMarks,
      });
    }
  }

  const results = [...grouped.values()].map((g) => ({
    ...g,
    ...summarise(g.subjects),
    published: true,
  }));

  return { students, results, issues, sheetNames };
}

/** Builds the downloadable template, pre-filled with one example row per sheet. */
export async function buildTemplate(): Promise<ArrayBuffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'VIMST Admin';
  workbook.created = new Date();

  const styleHeader = (sheet: ExcelJS.Worksheet) => {
    const header = sheet.getRow(1);
    header.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    header.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF072151' },
    };
    header.height = 22;
    header.alignment = { vertical: 'middle' };
    sheet.views = [{ state: 'frozen', ySplit: 1 }];
  };

  const studentSheet = workbook.addWorksheet('Students');
  studentSheet.columns = [
    { header: 'rollNo', key: 'rollNo', width: 16 },
    { header: 'name', key: 'name', width: 28 },
    { header: 'fatherName', key: 'fatherName', width: 28 },
    { header: 'dob', key: 'dob', width: 14 },
    { header: 'batch', key: 'batch', width: 14 },
    { header: 'class', key: 'class', width: 22 },
    { header: 'branch', key: 'branch', width: 28 },
  ];
  studentSheet.addRow({
    rollNo: 'VIM2024001',
    name: 'Example Student',
    fatherName: 'Example Parent',
    dob: '2002-01-18',
    batch: '2024-2028',
    class: 'B.E. First Year',
    branch: 'Computer Engineering',
  });
  styleHeader(studentSheet);

  const marksSheet = workbook.addWorksheet('Marks');
  marksSheet.columns = [
    { header: 'rollNo', key: 'rollNo', width: 16 },
    { header: 'semester', key: 'semester', width: 12 },
    { header: 'subjectCode', key: 'subjectCode', width: 16 },
    { header: 'subject', key: 'subject', width: 34 },
    { header: 'totalMarks', key: 'totalMarks', width: 14 },
    { header: 'obtainedMarks', key: 'obtainedMarks', width: 16 },
  ];
  marksSheet.addRows([
    {
      rollNo: 'VIM2024001',
      semester: 'I',
      subjectCode: 'CS101',
      subject: 'Programming for Problem Solving',
      totalMarks: 100,
      obtainedMarks: 78,
    },
    {
      rollNo: 'VIM2024001',
      semester: 'I',
      subjectCode: 'MA101',
      subject: 'Engineering Mathematics I',
      totalMarks: 100,
      obtainedMarks: 82,
    },
  ]);
  styleHeader(marksSheet);

  const notes = workbook.addWorksheet('How to use');
  notes.columns = [{ header: 'Instructions', key: 'text', width: 110 }];
  notes.addRows(
    [
      'Fill in the Students sheet and the Marks sheet, then upload this file in Admin → Bulk upload.',
      '',
      'STUDENTS',
      '  rollNo      Required. Unique per student. Case is ignored (stored uppercase).',
      '  name        Required.',
      '  dob         Required. YYYY-MM-DD, DD/MM/YYYY or a real Excel date cell.',
      '  fatherName, batch, class, branch are optional but appear on the statement of marks.',
      '',
      'MARKS',
      '  One row per subject. Repeat rollNo and semester for every subject in that semester.',
      '  semester    I to VIII, or 1 to 8.',
      '  totalMarks / obtainedMarks must be numbers, and obtained cannot exceed total.',
      '',
      'Totals, percentage and pass/fail are calculated on upload. Do not add columns for them.',
      'A subject scoring under 35% fails the semester.',
      '',
      'Uploading again updates existing records rather than duplicating them.',
      'Preview the file first: the upload screen lists every row it could not read.',
    ].map((text) => ({ text }))
  );
  styleHeader(notes);

  return workbook.xlsx.writeBuffer() as Promise<ArrayBuffer>;
}
