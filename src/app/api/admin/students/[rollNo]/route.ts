import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import { normaliseRollNo, results, students } from '@/lib/db';
import { parseStudent } from '../route';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ rollNo: string }> };

export async function GET(_request: Request, { params }: Params) {
  const guard = await requireSession();
  if (!guard.ok) return guard.response;

  const rollNo = normaliseRollNo(decodeURIComponent((await params).rollNo));

  try {
    const [s, r] = await Promise.all([students(), results()]);
    const student = await s.findOne({ rollNo });
    if (!student) {
      return NextResponse.json({ ok: false, error: 'Student not found.' }, { status: 404 });
    }
    const studentResults = await r.find({ rollNo }, { sort: { semester: 1 } }).toArray();

    return NextResponse.json({
      ok: true,
      student: { ...student, _id: String(student._id) },
      results: studentResults.map((x) => ({ ...x, _id: String(x._id) })),
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

  try {
    const collection = await students();
    const update = await collection.updateOne(
      { rollNo },
      { $set: { ...parsed.data, updatedAt: new Date() } }
    );

    if (update.matchedCount === 0) {
      return NextResponse.json({ ok: false, error: 'Student not found.' }, { status: 404 });
    }
    return NextResponse.json({ ok: true, student: parsed.data });
  } catch (error) {
    console.error('Update student failed:', error);
    return NextResponse.json({ ok: false, error: 'Could not save the student.' }, { status: 502 });
  }
}

/** Deleting a student also removes their results, so nothing is orphaned. */
export async function DELETE(_request: Request, { params }: Params) {
  const guard = await requireSession();
  if (!guard.ok) return guard.response;

  const rollNo = normaliseRollNo(decodeURIComponent((await params).rollNo));

  try {
    const [s, r] = await Promise.all([students(), results()]);
    const deleted = await s.deleteOne({ rollNo });
    if (deleted.deletedCount === 0) {
      return NextResponse.json({ ok: false, error: 'Student not found.' }, { status: 404 });
    }
    const removedResults = await r.deleteMany({ rollNo });

    return NextResponse.json({ ok: true, removedResults: removedResults.deletedCount });
  } catch (error) {
    console.error('Delete student failed:', error);
    return NextResponse.json(
      { ok: false, error: 'Could not delete the student.' },
      { status: 502 }
    );
  }
}
