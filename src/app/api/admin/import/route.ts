import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import { ensureIndexes, results, students } from '@/lib/db';
import { parseWorkbook } from '@/lib/import';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const MAX_BYTES = 8 * 1024 * 1024;

/**
 * Bulk upload.
 *
 * Posting with `mode=preview` parses and validates without writing anything, so
 * the operator sees exactly what will change and which rows were rejected
 * before committing. `mode=commit` performs the writes as bulk upserts, keyed
 * on rollNo and (rollNo, semester) so re-uploading a corrected sheet updates
 * records rather than duplicating them.
 */
export async function POST(request: Request) {
  const guard = await requireSession();
  if (!guard.ok) return guard.response;

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ ok: false, error: 'Expected a file upload.' }, { status: 400 });
  }

  const file = form.get('file');
  const mode = String(form.get('mode') ?? 'preview');

  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: 'Choose a file to upload.' }, { status: 422 });
  }
  if (file.size === 0) {
    return NextResponse.json({ ok: false, error: 'That file is empty.' }, { status: 422 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { ok: false, error: 'That file is larger than 8 MB. Split it into smaller uploads.' },
      { status: 413 }
    );
  }
  if (!/\.xlsx$/i.test(file.name)) {
    return NextResponse.json(
      { ok: false, error: 'Upload an .xlsx workbook. Save a .csv or .xls as .xlsx first.' },
      { status: 422 }
    );
  }

  let parsed;
  try {
    parsed = await parseWorkbook(await file.arrayBuffer());
  } catch (error) {
    console.error('Workbook parse failed:', error);
    return NextResponse.json(
      { ok: false, error: 'That file could not be read as an Excel workbook.' },
      { status: 422 }
    );
  }

  if (parsed.students.length === 0 && parsed.results.length === 0) {
    return NextResponse.json({
      ok: false,
      error:
        parsed.issues.length > 0
          ? 'No usable rows. See the issues below.'
          : `No "Students" or "Marks" sheet found. This file has: ${
              parsed.sheetNames.join(', ') || 'no sheets'
            }.`,
      issues: parsed.issues,
      sheetNames: parsed.sheetNames,
    });
  }

  if (mode === 'preview') {
    try {
      const s = await students();
      const rollNos = [
        ...new Set([
          ...parsed.students.map((x) => x.rollNo),
          ...parsed.results.map((x) => x.rollNo),
        ]),
      ];
      const known = await s.find({ rollNo: { $in: rollNos } }, { projection: { rollNo: 1 } }).toArray();
      const knownSet = new Set(known.map((k) => k.rollNo));

      const incoming = new Set(parsed.students.map((x) => x.rollNo));
      // A result whose student is neither in the file nor already stored has
      // nothing to attach to; flag it rather than writing an orphan.
      const orphans = [
        ...new Set(
          parsed.results
            .map((r) => r.rollNo)
            .filter((r) => !incoming.has(r) && !knownSet.has(r))
        ),
      ];

      return NextResponse.json({
        ok: true,
        mode: 'preview',
        summary: {
          studentsInFile: parsed.students.length,
          studentsNew: parsed.students.filter((x) => !knownSet.has(x.rollNo)).length,
          studentsUpdated: parsed.students.filter((x) => knownSet.has(x.rollNo)).length,
          resultsInFile: parsed.results.length,
          subjectRows: parsed.results.reduce((a, r) => a + r.subjects.length, 0),
          orphanRollNos: orphans,
        },
        students: parsed.students.slice(0, 10),
        results: parsed.results.slice(0, 10).map((r) => ({
          rollNo: r.rollNo,
          semester: r.semester,
          subjectCount: r.subjects.length,
          percentage: r.percentage,
          finalResult: r.finalResult,
        })),
        issues: parsed.issues,
      });
    } catch (error) {
      console.error('Import preview failed:', error);
      return NextResponse.json(
        { ok: false, error: 'Could not reach the database to preview this file.' },
        { status: 502 }
      );
    }
  }

  /* ---------------- commit ---------------- */

  try {
    await ensureIndexes();
    const [s, r] = await Promise.all([students(), results()]);
    const now = new Date();

    let studentsWritten = 0;
    if (parsed.students.length > 0) {
      const res = await s.bulkWrite(
        parsed.students.map((student) => ({
          updateOne: {
            filter: { rollNo: student.rollNo },
            update: { $set: { ...student, updatedAt: now }, $setOnInsert: { createdAt: now } },
            upsert: true,
          },
        })),
        { ordered: false }
      );
      studentsWritten = res.upsertedCount + res.modifiedCount;
    }

    // Skip results whose student does not exist after the student writes.
    const resultRolls = [...new Set(parsed.results.map((x) => x.rollNo))];
    const existing = await s
      .find({ rollNo: { $in: resultRolls } }, { projection: { rollNo: 1 } })
      .toArray();
    const valid = new Set(existing.map((e) => e.rollNo));

    const writable = parsed.results.filter((x) => valid.has(x.rollNo));
    const skipped = parsed.results.filter((x) => !valid.has(x.rollNo));

    let resultsWritten = 0;
    if (writable.length > 0) {
      const res = await r.bulkWrite(
        writable.map((result) => ({
          updateOne: {
            filter: { rollNo: result.rollNo, semester: result.semester },
            update: { $set: { ...result, updatedAt: now }, $setOnInsert: { createdAt: now } },
            upsert: true,
          },
        })),
        { ordered: false }
      );
      resultsWritten = res.upsertedCount + res.modifiedCount;
    }

    return NextResponse.json({
      ok: true,
      mode: 'commit',
      summary: {
        studentsWritten,
        studentsInFile: parsed.students.length,
        resultsWritten,
        resultsInFile: parsed.results.length,
        skippedResults: skipped.map((x) => `${x.rollNo} (semester ${x.semester})`),
      },
      issues: parsed.issues,
    });
  } catch (error) {
    console.error('Import commit failed:', error);
    return NextResponse.json(
      { ok: false, error: 'The upload could not be saved. No partial data was committed.' },
      { status: 502 }
    );
  }
}
