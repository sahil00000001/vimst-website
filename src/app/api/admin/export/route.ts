import { NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import { requireSession } from '@/lib/auth';
import { db, tables, type SubjectMark } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * Exports the register as a workbook.
 *
 * The sheets match the bulk-upload template exactly, so an export can be
 * edited and uploaded straight back — which is the practical way to correct a
 * batch of marks, and means the office is never locked out of its own data.
 */
export async function GET(request: Request) {
  const guard = await requireSession();
  if (!guard.ok) return guard.response;

  const { searchParams } = new URL(request.url);
  const semesterFilter = searchParams.get('semester')?.trim() ?? '';
  const batchFilter = searchParams.get('batch')?.trim() ?? '';

  try {
    const sql = db();
    const t = tables(sql);

    const students = await sql`
      select * from ${t.students}
      where (${batchFilter === ''} or batch = ${batchFilter})
      order by roll_no
    `;

    const results = await sql`
      select r.* from ${t.results} r
      join ${t.students} s on s.roll_no = r.roll_no
      where (${semesterFilter === ''} or r.semester = ${semesterFilter})
        and (${batchFilter === ''} or s.batch = ${batchFilter})
      order by r.roll_no, r.semester
    `;

    const wb = new ExcelJS.Workbook();
    wb.creator = 'VIMST Admin';
    wb.created = new Date();

    const styleHeader = (sheet: ExcelJS.Worksheet) => {
      const header = sheet.getRow(1);
      header.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      header.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFB01029' } };
      header.height = 22;
      header.alignment = { vertical: 'middle' };
      sheet.views = [{ state: 'frozen', ySplit: 1 }];
    };

    const studentSheet = wb.addWorksheet('Students');
    studentSheet.columns = [
      { header: 'rollNo', key: 'rollNo', width: 16 },
      { header: 'name', key: 'name', width: 28 },
      { header: 'fatherName', key: 'fatherName', width: 28 },
      { header: 'dob', key: 'dob', width: 14 },
      { header: 'batch', key: 'batch', width: 14 },
      { header: 'class', key: 'class', width: 22 },
      { header: 'branch', key: 'branch', width: 28 },
    ];
    for (const s of students) {
      studentSheet.addRow({
        rollNo: s.roll_no,
        name: s.name,
        fatherName: s.father_name,
        dob: s.dob,
        batch: s.batch,
        class: s.class_name,
        branch: s.branch,
      });
    }
    styleHeader(studentSheet);

    // Long form, one row per subject — the same shape the importer reads.
    const marksSheet = wb.addWorksheet('Marks');
    marksSheet.columns = [
      { header: 'rollNo', key: 'rollNo', width: 16 },
      { header: 'semester', key: 'semester', width: 12 },
      { header: 'subjectCode', key: 'subjectCode', width: 16 },
      { header: 'subject', key: 'subject', width: 34 },
      { header: 'totalMarks', key: 'totalMarks', width: 14 },
      { header: 'obtainedMarks', key: 'obtainedMarks', width: 16 },
    ];
    for (const r of results) {
      for (const subject of (r.subjects ?? []) as SubjectMark[]) {
        marksSheet.addRow({
          rollNo: r.roll_no,
          semester: r.semester,
          subjectCode: subject.subjectCode,
          subject: subject.subject,
          totalMarks: subject.totalMarks,
          obtainedMarks: subject.obtainedMarks,
        });
      }
    }
    styleHeader(marksSheet);

    /* A read-only summary, useful for a noticeboard or a meeting. */
    const summary = wb.addWorksheet('Summary');
    summary.columns = [
      { header: 'rollNo', key: 'rollNo', width: 16 },
      { header: 'name', key: 'name', width: 28 },
      { header: 'semester', key: 'semester', width: 12 },
      { header: 'totalMarks', key: 'totalMarks', width: 14 },
      { header: 'obtainedMarks', key: 'obtainedMarks', width: 16 },
      { header: 'percentage', key: 'percentage', width: 14 },
      { header: 'result', key: 'result', width: 12 },
      { header: 'published', key: 'published', width: 12 },
    ];
    const nameByRoll = new Map(students.map((s) => [s.roll_no, s.name]));
    for (const r of results) {
      summary.addRow({
        rollNo: r.roll_no,
        name: nameByRoll.get(r.roll_no) ?? '',
        semester: r.semester,
        totalMarks: Number(r.total_marks),
        obtainedMarks: Number(r.obtained_marks),
        percentage: Number(r.percentage),
        result: r.final_result,
        published: r.published ? 'yes' : 'no',
      });
    }
    styleHeader(summary);

    const buffer = await wb.xlsx.writeBuffer();
    const stamp = new Date().toISOString().slice(0, 10);
    const scope = [semesterFilter && `sem-${semesterFilter}`, batchFilter && batchFilter]
      .filter(Boolean)
      .join('-');

    return new Response(buffer as BodyInit, {
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="vimst-export${
          scope ? `-${scope}` : ''
        }-${stamp}.xlsx"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Export failed:', error);
    return NextResponse.json({ ok: false, error: 'Could not build the export.' }, { status: 502 });
  }
}
