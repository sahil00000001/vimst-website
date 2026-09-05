import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import { db, tables } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Counts for the dashboard tiles, plus the most recently touched results. */
export async function GET() {
  const guard = await requireSession();
  if (!guard.ok) return guard.response;

  try {
    const sql = db();
    const t = tables(sql);

    // Sequential, not Promise.all: the transaction pooler does not reliably
    // serve pipelined independent queries on one connection.
    const [counts] = await sql`
      select
        (select count(*)::int from ${t.students})                  as student_count,
        (select count(*)::int from ${t.results})                   as result_count,
        (select count(*)::int from ${t.results} where published)   as published_count,
        (select count(distinct batch)::int from ${t.students}
           where batch <> '')                                 as batch_count
    `;

    const bySemester = await sql`
      select semester, count(*)::int as count
      from ${t.results} group by semester order by semester
    `;

    const recent = await sql`
      select roll_no, semester, percentage, final_result, published, updated_at
      from ${t.results} order by updated_at desc limit 8
    `;

    return NextResponse.json({
      ok: true,
      stats: {
        studentCount: Number(counts.student_count),
        resultCount: Number(counts.result_count),
        publishedCount: Number(counts.published_count),
        batchCount: Number(counts.batch_count),
        bySemester: bySemester.map((b) => ({ semester: b.semester, count: Number(b.count) })),
        recent: recent.map((x) => ({
          rollNo: x.roll_no,
          semester: x.semester,
          percentage: Number(x.percentage),
          finalResult: x.final_result,
          published: x.published,
          updatedAt: x.updated_at,
        })),
      },
    });
  } catch (error) {
    console.error('Admin stats failed:', error);
    return NextResponse.json({ ok: false, error: 'Could not load statistics.' }, { status: 502 });
  }
}
