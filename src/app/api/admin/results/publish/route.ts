import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import { db, normaliseSemester, tables } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Publishes or withholds results in bulk.
 *
 * Results are normally entered over days and announced at once, so the useful
 * operation is "release semester III" rather than toggling rows one by one.
 * A scope is always required — there is no accidental publish-everything.
 */
export async function POST(request: Request) {
  const guard = await requireSession();
  if (!guard.ok) return guard.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request.' }, { status: 400 });
  }

  const b = (body ?? {}) as Record<string, unknown>;
  const publish = b.publish === true;
  const semester = normaliseSemester(b.semester);
  const ids = Array.isArray(b.ids) ? b.ids.map(String).filter((i) => /^\d+$/.test(i)) : [];

  if (!semester && ids.length === 0) {
    return NextResponse.json(
      { ok: false, error: 'Choose a semester, or select the results to change.' },
      { status: 422 }
    );
  }

  try {
    const sql = db();
    const t = tables(sql);

    const updated = ids.length
      ? await sql`
          update ${t.results} set published = ${publish}, updated_at = now()
          where id = any(${ids}) returning id
        `
      : await sql`
          update ${t.results} set published = ${publish}, updated_at = now()
          where semester = ${semester} and published <> ${publish} returning id
        `;

    return NextResponse.json({
      ok: true,
      changed: updated.length,
      publish,
      scope: ids.length ? `${ids.length} selected` : `semester ${semester}`,
    });
  } catch (error) {
    console.error('Bulk publish failed:', error);
    return NextResponse.json({ ok: false, error: 'Could not update the results.' }, { status: 502 });
  }
}
