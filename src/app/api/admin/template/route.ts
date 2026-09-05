import { requireSession } from '@/lib/auth';
import { buildTemplate } from '@/lib/import';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Downloads the bulk-upload workbook, pre-filled with example rows. */
export async function GET() {
  const guard = await requireSession();
  if (!guard.ok) return guard.response;

  const buffer = await buildTemplate();

  return new Response(buffer, {
    headers: {
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="mgimst-bulk-upload-template.xlsx"',
      'Cache-Control': 'no-store',
    },
  });
}
