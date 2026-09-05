import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import { db, tables, toResult } from '@/lib/db';
import { parseResult } from '../route';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ id: string }> };

/** Ids are bigints; anything else is rejected before it reaches the database. */
function parseId(raw: string): string | null {
  return /^\d+$/.test(raw) ? raw : null;
}

export async function GET(_request: Request, { params }: Params) {
  const guard = await requireSession();
  if (!guard.ok) return guard.response;

  const id = parseId((await params).id);
  if (!id) return NextResponse.json({ ok: false, error: 'Invalid id.' }, { status: 400 });

  try {
    const sql = db();
    const t = tables(sql);
    const [row] = await sql`select * from ${t.results} where id = ${id}`;
    if (!row) return NextResponse.json({ ok: false, error: 'Result not found.' }, { status: 404 });
    return NextResponse.json({ ok: true, result: { ...toResult(row as never), _id: String(row.id) } });
  } catch (error) {
    console.error('Get result failed:', error);
    return NextResponse.json({ ok: false, error: 'Could not load the result.' }, { status: 502 });
  }
}

export async function PUT(request: Request, { params }: Params) {
  const guard = await requireSession();
  if (!guard.ok) return guard.response;

  const id = parseId((await params).id);
  if (!id) return NextResponse.json({ ok: false, error: 'Invalid id.' }, { status: 400 });

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

    // Moving a result onto a roll/semester that already has one would violate
    // the unique constraint, so it is caught here with a readable message.
    const clash = await sql`
      select id from ${t.results}
      where roll_no = ${r.rollNo} and semester = ${r.semester} and id <> ${id}
    `;
    if (clash.length > 0) {
      return NextResponse.json(
        {
          ok: false,
          error: `${r.rollNo} already has a result for semester ${r.semester}.`,
        },
        { status: 409 }
      );
    }

    const updated = await sql`
      update ${t.results} set
        roll_no        = ${r.rollNo},
        semester       = ${r.semester},
        subjects       = ${sql.json(r.subjects as never)},
        total_marks    = ${r.totalMarks},
        obtained_marks = ${r.obtainedMarks},
        percentage     = ${r.percentage},
        final_result   = ${r.finalResult},
        published      = ${r.published},
        updated_at     = now()
      where id = ${id}
      returning id
    `;

    if (updated.length === 0) {
      return NextResponse.json({ ok: false, error: 'Result not found.' }, { status: 404 });
    }

    return NextResponse.json({ ok: true, result: r });
  } catch (error) {
    console.error('Update result failed:', error);
    return NextResponse.json({ ok: false, error: 'Could not save the result.' }, { status: 502 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const guard = await requireSession();
  if (!guard.ok) return guard.response;

  const id = parseId((await params).id);
  if (!id) return NextResponse.json({ ok: false, error: 'Invalid id.' }, { status: 400 });

  try {
    const sql = db();
    const t = tables(sql);
    const deleted = await sql`delete from ${t.results} where id = ${id} returning id`;
    if (deleted.length === 0) {
      return NextResponse.json({ ok: false, error: 'Result not found.' }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Delete result failed:', error);
    return NextResponse.json({ ok: false, error: 'Could not delete the result.' }, { status: 502 });
  }
}
