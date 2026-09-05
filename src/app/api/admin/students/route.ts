import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import { db, normaliseDob, normaliseRollNo, tables, toStudent, type Student } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PAGE_SIZE = 25;

/** Validates and normalises an incoming student record. */
export function parseStudent(
  body: unknown
): { ok: true; data: Omit<Student, 'createdAt' | 'updatedAt'> } | { ok: false; error: string } {
  const b = (body ?? {}) as Record<string, unknown>;
  const str = (v: unknown) => String(v ?? '').trim();

  const rollNo = normaliseRollNo(b.rollNo);
  const name = str(b.name);
  const dob = normaliseDob(b.dob);

  if (!rollNo) return { ok: false, error: 'Roll number is required.' };
  if (!name) return { ok: false, error: 'Student name is required.' };
  if (!dob) return { ok: false, error: 'A valid date of birth is required (YYYY-MM-DD).' };

  return {
    ok: true,
    data: {
      rollNo: rollNo.slice(0, 40),
      name: name.slice(0, 120),
      fatherName: str(b.fatherName).slice(0, 120),
      dob,
      batch: str(b.batch).slice(0, 40),
      className: str(b.className || b.class).slice(0, 80),
      branch: str(b.branch).slice(0, 120),
      courseSlug: str(b.courseSlug).slice(0, 120) || null,
    },
  };
}

export async function GET(request: Request) {
  const guard = await requireSession();
  if (!guard.ok) return guard.response;

  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim() ?? '';
  const batch = searchParams.get('batch')?.trim() ?? '';
  const page = Math.max(1, Number(searchParams.get('page') ?? 1) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  try {
    const sql = db();
    const t = tables(sql);
    const like = `%${q}%`;

    // Fragments keep the filter in one place across the page and count queries.
    const where = sql`
      where (${q === ''} or roll_no ilike ${like} or name ilike ${like} or branch ilike ${like})
        and (${batch === ''} or batch = ${batch})
    `;

    // Sequential, not Promise.all: the transaction pooler does not reliably
    // serve pipelined independent queries on one connection.
    const rows = await sql`
      select * from ${t.students} ${where} order by roll_no limit ${PAGE_SIZE} offset ${offset}
    `;
    const [{ count }] = await sql`select count(*)::int as count from ${t.students} ${where}`;
    const batches = await sql`select distinct batch from ${t.students} where batch <> '' order by batch`;

    const total = Number(count);

    return NextResponse.json({
      ok: true,
      items: rows.map((r) => ({ ...toStudent(r as never), _id: r.roll_no })),
      total,
      page,
      pageSize: PAGE_SIZE,
      pages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
      batches: batches.map((b) => b.batch),
    });
  } catch (error) {
    console.error('List students failed:', error);
    return NextResponse.json({ ok: false, error: 'Could not load students.' }, { status: 502 });
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

  const parsed = parseStudent(body);
  if (!parsed.ok) return NextResponse.json({ ok: false, error: parsed.error }, { status: 422 });

  const s = parsed.data;

  try {
    const sql = db();
    const t = tables(sql);
    const inserted = await sql`
      insert into ${t.students} (roll_no, name, father_name, dob, batch, class_name, branch, course_slug)
      values (${s.rollNo}, ${s.name}, ${s.fatherName}, ${s.dob}, ${s.batch}, ${s.className}, ${s.branch}, ${s.courseSlug ?? null})
      on conflict (roll_no) do nothing
      returning roll_no
    `;

    if (inserted.length === 0) {
      return NextResponse.json(
        { ok: false, error: `Roll number ${s.rollNo} already exists.` },
        { status: 409 }
      );
    }

    return NextResponse.json({ ok: true, student: s }, { status: 201 });
  } catch (error) {
    console.error('Create student failed:', error);
    return NextResponse.json({ ok: false, error: 'Could not save the student.' }, { status: 502 });
  }
}
