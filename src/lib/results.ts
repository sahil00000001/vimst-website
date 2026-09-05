import {
  db,
  normaliseDob,
  normaliseRollNo,
  normaliseSemester,
  numberToWords,
  tables,
  type SubjectMark,
} from './db';
import type { MarksheetData } from './marksheet-pdf';

/**
 * Shared student-facing lookup.
 *
 * The marksheet page and the PDF endpoint both need exactly this, and they must
 * agree on what counts as a match — so the rule lives in one place. Identity is
 * roll number **and** date of birth together: a roll number alone is often
 * printed on a noticeboard, a date of birth alone is not tied to anyone, and
 * requiring both keeps a curious classmate out without asking a student to type
 * their own name exactly as the office recorded it.
 */

export type LookupFailure = { ok: false; status: number; error: string };

export type StudentSummary = {
  name: string;
  rollNo: string;
  fatherName: string;
  dob: string;
  batch: string;
  className: string;
  branch: string;
};

export type SemesterSummary = {
  semester: string;
  percentage: number;
  finalResult: string;
  subjectCount: number;
};

const NOT_FOUND: LookupFailure = {
  ok: false,
  status: 404,
  error: 'No record matched those details. Check the enrollment number and date of birth.',
};

function parseIdentity(rollNoRaw: unknown, dobRaw: unknown) {
  const rollNo = normaliseRollNo(rollNoRaw);
  const dob = normaliseDob(dobRaw);
  if (!rollNo || !dob) return null;
  return { rollNo, dob };
}

/** The student plus every semester published for them. */
export async function lookupStudent(
  rollNoRaw: unknown,
  dobRaw: unknown
): Promise<
  | { ok: true; student: StudentSummary; semesters: SemesterSummary[] }
  | LookupFailure
> {
  const identity = parseIdentity(rollNoRaw, dobRaw);
  if (!identity) {
    return { ok: false, status: 422, error: 'Enter your enrollment number and date of birth.' };
  }

  const sql = db();
  const t = tables(sql);

  const [student] = await sql`
    select * from ${t.students} where roll_no = ${identity.rollNo} and dob = ${identity.dob}
  `;
  if (!student) return NOT_FOUND;

  const rows = await sql`
    select semester, percentage, final_result, subjects
    from ${t.results}
    where roll_no = ${identity.rollNo} and published
    order by semester
  `;

  return {
    ok: true,
    student: {
      name: student.name,
      rollNo: student.roll_no,
      fatherName: student.father_name,
      dob: student.dob,
      batch: student.batch,
      className: student.class_name,
      branch: student.branch,
    },
    semesters: rows.map((r) => ({
      semester: r.semester,
      percentage: Number(r.percentage),
      finalResult: r.final_result,
      subjectCount: (r.subjects as SubjectMark[] | null)?.length ?? 0,
    })),
  };
}

/** One semester's full marksheet, in the shape both the page and the PDF want. */
export async function lookupMarksheet(
  rollNoRaw: unknown,
  dobRaw: unknown,
  semesterRaw: unknown
): Promise<{ ok: true; data: MarksheetData } | LookupFailure> {
  const identity = parseIdentity(rollNoRaw, dobRaw);
  const semester = normaliseSemester(semesterRaw);

  if (!identity || !semester) {
    return {
      ok: false,
      status: 422,
      error: 'Enter your enrollment number, date of birth and semester.',
    };
  }

  const sql = db();
  const t = tables(sql);

  const [student] = await sql`
    select * from ${t.students} where roll_no = ${identity.rollNo} and dob = ${identity.dob}
  `;
  if (!student) return NOT_FOUND;

  const [record] = await sql`
    select * from ${t.results}
    where roll_no = ${identity.rollNo} and semester = ${semester}
  `;

  if (!record || !record.published) {
    return {
      ok: false,
      status: 404,
      error: `No result has been published for semester ${semester} yet.`,
    };
  }

  const subjects: SubjectMark[] = record.subjects ?? [];

  return {
    ok: true,
    data: {
      name: student.name,
      rollNo: student.roll_no,
      fatherName: student.father_name,
      dob: student.dob,
      batch: student.batch,
      className: student.class_name,
      branch: student.branch,
      semester: record.semester,
      subjects,
      totalMarks: Number(record.total_marks),
      obtainedMarks: Number(record.obtained_marks),
      percentage: Number(record.percentage),
      finalResult: record.final_result,
      totalMarksInWord: numberToWords(Number(record.obtained_marks)),
    },
  };
}

/** Filename for a downloaded marksheet. */
export const marksheetFilename = (rollNo: string, semester: string) =>
  `MGIMST-marksheet-${rollNo}-semester-${semester}.pdf`;
