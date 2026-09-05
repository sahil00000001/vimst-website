import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import { normaliseDob, normaliseRollNo, students, type Student } from '@/lib/db';

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
      courseSlug: str(b.courseSlug).slice(0, 120) || undefined,
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

  const filter: Record<string, unknown> = {};
  if (q) {
    // Escaped so a search for "M.Sc" is not treated as a pattern.
    const safe = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.$or = [
      { rollNo: { $regex: safe, $options: 'i' } },
      { name: { $regex: safe, $options: 'i' } },
      { branch: { $regex: safe, $options: 'i' } },
    ];
  }
  if (batch) filter.batch = batch;

  try {
    const collection = await students();
    const [items, total, batches] = await Promise.all([
      collection
        .find(filter, {
          sort: { rollNo: 1 },
          skip: (page - 1) * PAGE_SIZE,
          limit: PAGE_SIZE,
        })
        .toArray(),
      collection.countDocuments(filter),
      collection.distinct('batch'),
    ]);

    return NextResponse.json({
      ok: true,
      items: items.map((i) => ({ ...i, _id: String(i._id) })),
      total,
      page,
      pageSize: PAGE_SIZE,
      pages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
      batches: batches.filter(Boolean).sort(),
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

  try {
    const collection = await students();
    const now = new Date();
    const existing = await collection.findOne({ rollNo: parsed.data.rollNo });
    if (existing) {
      return NextResponse.json(
        { ok: false, error: `Roll number ${parsed.data.rollNo} already exists.` },
        { status: 409 }
      );
    }

    await collection.insertOne({ ...parsed.data, createdAt: now, updatedAt: now });
    return NextResponse.json({ ok: true, student: parsed.data }, { status: 201 });
  } catch (error) {
    console.error('Create student failed:', error);
    return NextResponse.json({ ok: false, error: 'Could not save the student.' }, { status: 502 });
  }
}
