import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import { asPool, db, ensureSchema, tables } from '@/lib/db';
import { parseWorkbook } from '@/lib/import';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const MAX_BYTES = 8 * 1024 * 1024;

/**
 * Bulk upload.
 *
 * `mode=preview` parses and validates without writing anything, so the operator
 * sees exactly what will change and which rows were rejected before committing.
 * `mode=commit` writes inside a single transaction — either the whole upload
 * lands or none of it does — using upserts keyed on roll number and
 * (roll number, semester), so re-uploading a corrected sheet updates records
 * rather than duplicating them.
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

  const sql = db();
  const t = tables(sql);

  const rollNos = [
    ...new Set([...parsed.students.map((x) => x.rollNo), ...parsed.results.map((x) => x.rollNo)]),
  ];

  if (mode === 'preview') {
    try {
      await ensureSchema();
      const known = await sql<{ roll_no: string }[]>`
        select roll_no from ${t.students} where roll_no = any(${rollNos})
      `;
      const knownSet = new Set(known.map((k) => k.roll_no));
      const incoming = new Set(parsed.students.map((x) => x.rollNo));

      // A result whose student is neither in the file nor already stored has
      // nothing to attach to; flag it rather than writing an orphan.
      const orphans = [
        ...new Set(
          parsed.results.map((r) => r.rollNo).filter((r) => !incoming.has(r) && !knownSet.has(r))
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
    await ensureSchema();

    const outcome = await sql.begin(async (tx) => {
      const tt = tables(asPool(tx));
      let studentsWritten = 0;

      for (const s of parsed.students) {
        const written = await tx`
          insert into ${tt.students} (roll_no, name, father_name, dob, batch, class_name, branch)
          values (${s.rollNo}, ${s.name}, ${s.fatherName}, ${s.dob}, ${s.batch}, ${s.className}, ${s.branch})
          on conflict (roll_no) do update set
            name        = excluded.name,
            father_name = excluded.father_name,
            dob         = excluded.dob,
            batch       = excluded.batch,
            class_name  = excluded.class_name,
            branch      = excluded.branch,
            updated_at  = now()
          returning roll_no
        `;
        studentsWritten += written.length;
      }

      // Skip results whose student does not exist after the student writes.
      const existing = await tx<{ roll_no: string }[]>`
        select roll_no from ${tt.students} where roll_no = any(${rollNos})
      `;
      const valid = new Set(existing.map((e) => e.roll_no));

      const writable = parsed.results.filter((x) => valid.has(x.rollNo));
      const skipped = parsed.results.filter((x) => !valid.has(x.rollNo));

      let resultsWritten = 0;
      for (const r of writable) {
        const written = await tx`
          insert into ${tt.results} (roll_no, semester, subjects, total_marks, obtained_marks, percentage, final_result, published)
          values (
            ${r.rollNo}, ${r.semester}, ${tx.json(r.subjects as never)},
            ${r.totalMarks}, ${r.obtainedMarks}, ${r.percentage}, ${r.finalResult}, ${r.published}
          )
          on conflict (roll_no, semester) do update set
            subjects       = excluded.subjects,
            total_marks    = excluded.total_marks,
            obtained_marks = excluded.obtained_marks,
            percentage     = excluded.percentage,
            final_result   = excluded.final_result,
            published      = excluded.published,
            updated_at     = now()
          returning id
        `;
        resultsWritten += written.length;
      }

      return { studentsWritten, resultsWritten, skipped };
    });

    return NextResponse.json({
      ok: true,
      mode: 'commit',
      summary: {
        studentsWritten: outcome.studentsWritten,
        studentsInFile: parsed.students.length,
        resultsWritten: outcome.resultsWritten,
        resultsInFile: parsed.results.length,
        skippedResults: outcome.skipped.map((x) => `${x.rollNo} (semester ${x.semester})`),
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
