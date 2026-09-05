import { NextResponse } from 'next/server';
import {
  isDatabaseConfigured,
  normaliseDob,
  normaliseRollNo,
  normaliseSemester,
  numberToWords,
  results,
  students,
} from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Public result lookup.
 *
 * Reads from this site's own database, which the admin portal populates. The
 * response keeps the shape the original page used, so the front end did not
 * have to change when the third-party results API was replaced.
 *
 * A lookup must match on roll number, date of birth AND name, so a roll number
 * on its own is not enough to pull up somebody else's marks.
 */

export type ResultRow = {
  subjectCode: string;
  subject: string;
  totalMarks: string;
  obtainedMarks: string;
  marksInWord: string;
};

export type StudentResult = {
  name: string;
  dob: string;
  fatherName: string;
  batch: string;
  semester: string;
  rollNo: string;
  class: string;
  branch: string;
  totalMarksInWord: string;
  percentage: string;
  finalResult: string;
  result: ResultRow[];
};

/** Ignores case, punctuation and repeated spaces when comparing names. */
const canonicalName = (v: string) =>
  v
    .toLowerCase()
    .replace(/[^a-z\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const NOT_FOUND = {
  ok: false,
  error: 'No record matched those details. Check the roll number, name and date of birth.',
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const name = searchParams.get('name')?.trim() ?? '';
  const rollNo = normaliseRollNo(searchParams.get('rollNo'));
  const dob = normaliseDob(searchParams.get('dob'));
  const semester = normaliseSemester(searchParams.get('semester'));

  if (!name || !rollNo || !dob || !semester) {
    return NextResponse.json(
      { ok: false, error: 'Please fill in every field.' },
      { status: 422 }
    );
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        error: 'The results service is not configured yet. Please contact the institute.',
      },
      { status: 503 }
    );
  }

  try {
    const [s, r] = await Promise.all([students(), results()]);

    const student = await s.findOne({ rollNo, dob });
    if (!student) return NextResponse.json(NOT_FOUND, { status: 404 });

    if (canonicalName(student.name) !== canonicalName(name)) {
      return NextResponse.json(NOT_FOUND, { status: 404 });
    }

    const record = await r.findOne({ rollNo, semester });
    if (!record) {
      return NextResponse.json(
        {
          ok: false,
          error: `No result has been published for semester ${semester} yet.`,
        },
        { status: 404 }
      );
    }
    if (!record.published) {
      return NextResponse.json(
        { ok: false, error: `The semester ${semester} result has not been published yet.` },
        { status: 404 }
      );
    }

    const payload: StudentResult = {
      name: student.name,
      dob: student.dob,
      fatherName: student.fatherName,
      batch: student.batch,
      semester: record.semester,
      rollNo: student.rollNo,
      class: student.className,
      branch: student.branch,
      totalMarksInWord: numberToWords(record.obtainedMarks),
      percentage: `${record.percentage}%`,
      finalResult: record.finalResult,
      result: record.subjects.map((subject) => ({
        subjectCode: subject.subjectCode,
        subject: subject.subject,
        totalMarks: String(subject.totalMarks),
        obtainedMarks: String(subject.obtainedMarks),
        marksInWord: numberToWords(subject.obtainedMarks),
      })),
    };

    return NextResponse.json({ ok: true, data: payload });
  } catch (error) {
    console.error('Result lookup failed:', error);
    return NextResponse.json(
      { ok: false, error: 'The results service is not responding. Please try again later.' },
      { status: 502 }
    );
  }
}
