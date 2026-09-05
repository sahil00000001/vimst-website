import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import {
  db,
  normaliseRollNo,
  normaliseSemester,
  summarise,
  tables,
  toResult,
  type Result,
  type SubjectMark,
} from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PAGE_SIZE = 25;

/** Validates a result payload and recomputes the totals from its subject rows. */
export function parseResult(
  body: unknown
): { ok: true; data: Omit<Result, 'createdAt' | 'updatedAt' | 'id'> } | { ok: false; error: string } {
  const b = (body ?? {}) as Record<string, unknown>;

  const rollNo = normaliseRollNo(b.rollNo);
  const semester = normaliseSemester(b.semester);

  if (!rollNo) return { ok: false, error: 'Roll number is required.' };
  if (!semester) return { ok: false, error: 'Semester must be between I and VIII.' };

  const rawSubjects = Array.isArray(b.subjects) ? b.subjects : [];
  const subjects: SubjectMark[] = [];

  for (const [i, raw] of rawSubjects.entries()) {
    const s = (raw ?? {}) as Record<string, unknown>;
    const subject = String(s.subject ?? '').trim();
    if (!subject) continue;

    const totalMarks = Number(s.totalMarks);
    const obtainedMarks = Number(s.obtainedMarks);

    if (!Number.isFinite(totalMarks) || totalMarks <= 0) {
      return { ok: false, error: `Row ${i + 1}: total marks must be a positive number.` };
    }
    if (!Number.isFinite(obtainedMarks) || obtainedMarks < 0) {
      return { ok: false, error: `Row ${i + 1}: obtained marks must be zero or more.` };
    }
    if (obtainedMarks > totalMarks) {
      return {
        ok: false,
        error: `Row ${i + 1}: obtained marks (${obtainedMarks}) exceed the total (${totalMarks}).`,
      };
    }

    subjects.push({
      subjectCode: String(s.subjectCode ?? '').trim().toUpperCase().slice(0, 24),
      subject: subject.slice(0, 160),
      totalMarks,
      obtainedMarks,
    });
  }

  if (subjects.length === 0) return { ok: false, error: 'Add at least one subject.' };

  return {
    ok: true,
    data: { rollNo, semester, subjects, ...summarise(subjects), published: b.published !== false },
  };
}

export async function GET(request: Request) {
  const guard = await requireSession();
  if (!guard.ok) return guard.response;

  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim() ?? '';
  const semester = normaliseSemester(searchParams.get('semester'));
  const page = Math.max(1, Number(searchParams.get('page') ?? 1) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  try {
    const sql = db();
    const t = tables(sql);
    const like = `%${q}%`;

    const where = sql`
      where (${q === ''} or r.roll_no ilike ${like})
        and (${semester === null} or r.semester = ${semester ?? ''})
    `;

    // Sequential, not Promise.all: the transaction pooler does not reliably
    // serve pipelined independent queries on one connection.
    const rows = await sql`
      select r.*, s.name as student_name
      from ${t.results} r
      left join ${t.students} s on s.roll_no = r.roll_no
      ${where}
      order by r.updated_at desc
      limit ${PAGE_SIZE} offset ${offset}
    `;
    const [{ count }] = await sql`select count(*)::int as count from ${t.results} r ${where}`;

    const total = Number(count);

    return NextResponse.json({
      ok: true,
      items: rows.map((r) => ({ ...toResult(r as never), _id: String(r.id) })),
      total,
      page,
      pageSize: PAGE_SIZE,
      pages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    });
  } catch (error) {
    console.error('List results failed:', error);
    return NextResponse.json({ ok: false, error: 'Could not load results.' }, { status: 502 });
  }
}

export async function POST(request: Request) {
  const guard = await requireSession();
  if (!guard.ok) return guard.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request.' }, { status: 400 });
  }

  const parsed = parseResult(body);
  if (!parsed.ok) return NextResponse.json({ ok: false, error: parsed.error }, { status: 422 });

  const r = parsed.data;

  try {
    const sql = db();
    const t = tables(sql);

    const [student] = await sql`select roll_no from ${t.students} where roll_no = ${r.rollNo}`;
    if (!student) {
      return NextResponse.json(
        { ok: false, error: `No student with roll number ${r.rollNo}. Add the student first.` },
        { status: 422 }
      );
    }

    await sql`
      insert into ${t.results} (roll_no, semester, subjects, total_marks, obtained_marks, percentage, final_result, published)
      values (
        ${r.rollNo}, ${r.semester}, ${sql.json(r.subjects as never)},
        ${r.totalMarks}, ${r.obtainedMarks}, ${r.percentage}, ${r.finalResult}, ${r.published}
      )
      on conflict (roll_no, semester) do update set
        subjects       = excluded.subjects,
        total_marks    = excluded.total_marks,
        obtained_marks = excluded.obtained_marks,
        percentage     = excluded.percentage,
        final_result   = excluded.final_result,
        published      = excluded.published,
        updated_at     = now()
    `;

    return NextResponse.json({ ok: true, result: r }, { status: 201 });
  } catch (error) {
    console.error('Save result failed:', error);
    return NextResponse.json({ ok: false, error: 'Could not save the result.' }, { status: 502 });
  }
}
