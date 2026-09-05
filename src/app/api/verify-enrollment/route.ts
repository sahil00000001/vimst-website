import { NextResponse } from 'next/server';
import { isDatabaseConfigured } from '@/lib/db';
import { lookupMarksheet, lookupStudent } from '@/lib/results';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Public result lookup, identified by enrollment number and date of birth.
 *
 * Without a `semester` it answers with the student and every semester published
 * for them, so the page can offer a choice rather than making someone guess.
 * With a `semester` it returns that full marksheet.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rollNo = searchParams.get('rollNo');
  const dob = searchParams.get('dob');
  const semester = searchParams.get('semester');

  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        error: 'The results service is not configured yet. Please contact the institute.',
      },
      { status: 503 }
    );
  }

  try {
    const result = semester
      ? await lookupMarksheet(rollNo, dob, semester)
      : await lookupStudent(rollNo, dob);

    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: result.status });
    }

    // `result` already carries ok: true; spreading it after would shadow it.
    return NextResponse.json(result);
  } catch (error) {
    console.error('Result lookup failed:', error);
    return NextResponse.json(
      { ok: false, error: 'The results service is not responding. Please try again later.' },
      { status: 502 }
    );
  }
}
