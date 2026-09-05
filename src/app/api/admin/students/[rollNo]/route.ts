import { NextResponse } from 'next/server';
import { requireManagement, requireSession } from '@/lib/auth';
import { db, normaliseRollNo, tables, toResult, toStudent } from '@/lib/db';
import { parseStudent } from '../route';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ rollNo: string }> };

export async function GET(_request: Request, { params }: Params) {
  const guard = await requireSession();
  if (!guard.ok) return guard.response;

  const rollNo = normaliseRollNo(decodeURIComponent((await params).rollNo));

  try {
    const sql = db();
    const t = tables(sql);
    const [student] = await sql`select * from ${t.students} where roll_no = ${rollNo}`;
    if (!student) {
      return NextResponse.json({ ok: false, error: 'Student not found.' }, { status: 404 });
    }

    const results = await sql`
      select * from ${t.results} where roll_no = ${rollNo} order by semester
    `;

    return NextResponse.json({
      ok: true,
      student: { ...toStudent(student as never), _id: rollNo },
      results: results.map((r) => ({ ...toResult(r as never), _id: String(r.id) })),
    });
  } catch (error) {
    console.error('Get student failed:', error);
    return NextResponse.json({ ok: false, error: 'Could not load the student.' }, { status: 502 });
  }
}

export async function PUT(request: Request, { params }: Params) {
  const guard = await requireSession();
  if (!guard.ok) return guard.response;

  const rollNo = normaliseRollNo(decodeURIComponent((await params).rollNo));

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request.' }, { status: 400 });
  }

  const parsed = parseStudent({ ...(body as object), rollNo });
  if (!parsed.ok) return NextResponse.json({ ok: false, error: parsed.error }, { status: 422 });

  const s = parsed.data;

  try {
    const sql = db();
    const t = tables(sql);
    const updated = await sql`
      update ${t.students} set
        name        = ${s.name},
        father_name = ${s.fatherName},
        dob         = ${s.dob},
        batch       = ${s.batch},
        class_name  = ${s.className},
        branch      = ${s.branch},
        course_slug = ${s.courseSlug ?? null},
        updated_at  = now()
      where roll_no = ${rollNo}
      returning roll_no
    `;

    if (updated.length === 0) {
      return NextResponse.json({ ok: false, error: 'Student not found.' }, { status: 404 });
    }
    return NextResponse.json({ ok: true, student: s });
  } catch (error) {
    console.error('Update student failed:', error);
    return NextResponse.json({ ok: false, error: 'Could not save the student.' }, { status: 502 });
  }
}

/**
 * Deleting a student removes their results too. That is enforced by the
 * `on delete cascade` on results.roll_no, so it cannot be half-done.
 */
export async function DELETE(_request: Request, { params }: Params) {
  const guard = await requireManagement();
  if (!guard.ok) return guard.response;

  const rollNo = normaliseRollNo(decodeURIComponent((await params).rollNo));

  try {
    const sql = db();
    const t = tables(sql);
    const [{ count } = { count: 0 }] = await sql`
      select count(*)::int as count from ${t.results} where roll_no = ${rollNo}
    `;
    const deleted = await sql`delete from ${t.students} where roll_no = ${rollNo} returning roll_no`;

    if (deleted.length === 0) {
      return NextResponse.json({ ok: false, error: 'Student not found.' }, { status: 404 });
    }

    return NextResponse.json({ ok: true, removedResults: Number(count) });
  } catch (error) {
    console.error('Delete student failed:', error);
    return NextResponse.json(
      { ok: false, error: 'Could not delete the student.' },
      { status: 502 }
    );
  }
}
