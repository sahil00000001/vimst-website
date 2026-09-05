import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import { results, students } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Counts for the dashboard tiles, plus the most recently touched results. */
export async function GET() {
  const guard = await requireSession();
  if (!guard.ok) return guard.response;

  try {
    const [s, r] = await Promise.all([students(), results()]);

    const [studentCount, resultCount, publishedCount, batches, bySemester, recent] =
      await Promise.all([
        s.countDocuments(),
        r.countDocuments(),
        r.countDocuments({ published: true }),
        s.distinct('batch'),
        r
          .aggregate([{ $group: { _id: '$semester', count: { $sum: 1 } } }, { $sort: { _id: 1 } }])
          .toArray(),
        r.find({}, { sort: { updatedAt: -1 }, limit: 8 }).toArray(),
      ]);

    return NextResponse.json({
      ok: true,
      stats: {
        studentCount,
        resultCount,
        publishedCount,
        batchCount: batches.filter(Boolean).length,
        bySemester: bySemester.map((b) => ({ semester: b._id, count: b.count })),
        recent: recent.map((x) => ({
          rollNo: x.rollNo,
          semester: x.semester,
          percentage: x.percentage,
          finalResult: x.finalResult,
          published: x.published,
          updatedAt: x.updatedAt,
        })),
      },
    });
  } catch (error) {
    console.error('Admin stats failed:', error);
    return NextResponse.json({ ok: false, error: 'Could not load statistics.' }, { status: 502 });
  }
}
