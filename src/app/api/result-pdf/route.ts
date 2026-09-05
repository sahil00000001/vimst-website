import { NextResponse } from 'next/server';
import { isDatabaseConfigured } from '@/lib/db';
import { buildMarksheetPdf } from '@/lib/marksheet-pdf';
import { lookupMarksheet, marksheetFilename } from '@/lib/results';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Downloads a semester marksheet as a PDF.
 *
 * Guarded by the same enrollment-number-and-date-of-birth pair as the on-screen
 * result, so a link to this endpoint reveals nothing the page would not.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { ok: false, error: 'The results service is not configured yet.' },
      { status: 503 }
    );
  }

  try {
    const result = await lookupMarksheet(
      searchParams.get('rollNo'),
      searchParams.get('dob'),
      searchParams.get('semester')
    );

    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: result.status });
    }

    const pdf = await buildMarksheetPdf(result.data);

    return new Response(pdf as BodyInit, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${marksheetFilename(
          result.data.rollNo,
          result.data.semester
        )}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Marksheet PDF failed:', error);
    return NextResponse.json(
      { ok: false, error: 'The marksheet could not be generated. Please try again.' },
      { status: 502 }
    );
  }
}
