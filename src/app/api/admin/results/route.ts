import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import {
  normaliseRollNo,
  normaliseSemester,
  results,
  students,
  summarise,
  type Result,
  type SubjectMark,
} from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PAGE_SIZE = 25;

/** Validates a result payload and recomputes the totals from its subject rows. */
export function parseResult(
  body: unknown
):
  | { ok: true; data: Omit<Result, 'createdAt' | 'updatedAt'> }
  | { ok: false; error: string } {
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

  if (subjects.length === 0) {
    return { ok: false, error: 'Add at least one subject.' };
  }

  return {
    ok: true,
    data: {
      rollNo,
      semester,
      subjects,
      ...summarise(subjects),
      published: b.published !== false,
    },
  };
}

export async function GET(request: Request) {
  const guard = await requireSession();
  if (!guard.ok) return guard.response;

  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim() ?? '';
  const semester = normaliseSemester(searchParams.get('semester'));
  const page = Math.max(1, Number(searchParams.get('page') ?? 1) || 1);

  const filter: Record<string, unknown> = {};
  if (q) {
    const safe = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.rollNo = { $regex: safe, $options: 'i' };
  }
  if (semester) filter.semester = semester;

  try {
    const [r, s] = await Promise.all([results(), students()]);
    const [items, total] = await Promise.all([
      r
        .find(filter, {
          sort: { updatedAt: -1 },
          skip: (page - 1) * PAGE_SIZE,
          limit: PAGE_SIZE,
        })
        .toArray(),
      r.countDocuments(filter),
    ]);

    // Attach the student name so the table is readable without a second lookup.
    const rollNos = [...new Set(items.map((i) => i.rollNo))];
    const named = await s.find({ rollNo: { $in: rollNos } }).toArray();
    const nameByRoll = new Map(named.map((n) => [n.rollNo, n.name]));

    return NextResponse.json({
      ok: true,
      items: items.map((i) => ({
        ...i,
        _id: String(i._id),
        studentName: nameByRoll.get(i.rollNo) ?? null,
      })),
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

  try {
    const [r, s] = await Promise.all([results(), students()]);

    const student = await s.findOne({ rollNo: parsed.data.rollNo });
    if (!student) {
      return NextResponse.json(
        {
          ok: false,
          error: `No student with roll number ${parsed.data.rollNo}. Add the student first.`,
        },
        { status: 422 }
      );
    }

    const now = new Date();
    await r.updateOne(
      { rollNo: parsed.data.rollNo, semester: parsed.data.semester },
      { $set: { ...parsed.data, updatedAt: now }, $setOnInsert: { createdAt: now } },
      { upsert: true }
    );

    return NextResponse.json({ ok: true, result: parsed.data }, { status: 201 });
  } catch (error) {
    console.error('Save result failed:', error);
    return NextResponse.json({ ok: false, error: 'Could not save the result.' }, { status: 502 });
  }
}
