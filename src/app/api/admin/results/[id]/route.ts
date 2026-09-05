import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { requireSession } from '@/lib/auth';
import { results } from '@/lib/db';
import { parseResult } from '../route';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ id: string }> };

function toObjectId(id: string) {
  return ObjectId.isValid(id) ? new ObjectId(id) : null;
}

export async function GET(_request: Request, { params }: Params) {
  const guard = await requireSession();
  if (!guard.ok) return guard.response;

  const _id = toObjectId((await params).id);
  if (!_id) return NextResponse.json({ ok: false, error: 'Invalid id.' }, { status: 400 });

  try {
    const collection = await results();
    const doc = await collection.findOne({ _id });
    if (!doc) return NextResponse.json({ ok: false, error: 'Result not found.' }, { status: 404 });
    return NextResponse.json({ ok: true, result: { ...doc, _id: String(doc._id) } });
  } catch (error) {
    console.error('Get result failed:', error);
    return NextResponse.json({ ok: false, error: 'Could not load the result.' }, { status: 502 });
  }
}

export async function PUT(request: Request, { params }: Params) {
  const guard = await requireSession();
  if (!guard.ok) return guard.response;

  const _id = toObjectId((await params).id);
  if (!_id) return NextResponse.json({ ok: false, error: 'Invalid id.' }, { status: 400 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request.' }, { status: 400 });
  }

  const parsed = parseResult(body);
  if (!parsed.ok) return NextResponse.json({ ok: false, error: parsed.error }, { status: 422 });

  try {
    const collection = await results();

    // Moving a result onto a roll/semester that already has one would violate
    // the unique index, so it is caught here with a readable message.
    const clash = await collection.findOne({
      _id: { $ne: _id },
      rollNo: parsed.data.rollNo,
      semester: parsed.data.semester,
    });
    if (clash) {
      return NextResponse.json(
        {
          ok: false,
          error: `${parsed.data.rollNo} already has a result for semester ${parsed.data.semester}.`,
        },
        { status: 409 }
      );
    }

    const update = await collection.updateOne(
      { _id },
      { $set: { ...parsed.data, updatedAt: new Date() } }
    );
    if (update.matchedCount === 0) {
      return NextResponse.json({ ok: false, error: 'Result not found.' }, { status: 404 });
    }

    return NextResponse.json({ ok: true, result: parsed.data });
  } catch (error) {
    console.error('Update result failed:', error);
    return NextResponse.json({ ok: false, error: 'Could not save the result.' }, { status: 502 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const guard = await requireSession();
  if (!guard.ok) return guard.response;

  const _id = toObjectId((await params).id);
  if (!_id) return NextResponse.json({ ok: false, error: 'Invalid id.' }, { status: 400 });

  try {
    const collection = await results();
    const deleted = await collection.deleteOne({ _id });
    if (deleted.deletedCount === 0) {
      return NextResponse.json({ ok: false, error: 'Result not found.' }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Delete result failed:', error);
    return NextResponse.json({ ok: false, error: 'Could not delete the result.' }, { status: 502 });
  }
}
