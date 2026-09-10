import { NextResponse } from 'next/server';

/**
 * Enquiry intake.
 *
 * The original site's form posted to `#!` and dropped every submission, so
 * there is no existing backend to port. This route validates the payload and
 * forwards it with Resend when `RESEND_API_KEY` is configured. Until it is,
 * it answers `configured: false` and the form falls back to opening the
 * visitor's mail client, so no enquiry is silently lost either way.
 *
 * To enable server-side delivery, set in `.env.local`:
 *   RESEND_API_KEY=...
 *   ENQUIRY_TO=info@vimst.org
 *   ENQUIRY_FROM=website@your-verified-domain.org
 */

export type Enquiry = {
  name: string;
  email: string;
  phone?: string;
  course?: string;
  message: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validate(body: unknown): { ok: true; data: Enquiry } | { ok: false; error: string } {
  if (typeof body !== 'object' || body === null) return { ok: false, error: 'Invalid payload.' };
  const b = body as Record<string, unknown>;

  const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '');
  const name = str(b.name);
  const email = str(b.email);
  const message = str(b.message);

  if (name.length < 2) return { ok: false, error: 'Please enter your name.' };
  if (!EMAIL_RE.test(email)) return { ok: false, error: 'Please enter a valid email address.' };
  if (message.length < 5) return { ok: false, error: 'Please tell us a little more.' };

  return {
    ok: true,
    data: {
      name: name.slice(0, 120),
      email: email.slice(0, 160),
      phone: str(b.phone).slice(0, 40) || undefined,
      course: str(b.course).slice(0, 160) || undefined,
      message: message.slice(0, 4000),
    },
  };
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request.' }, { status: 400 });
  }

  const result = validate(body);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 422 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.ENQUIRY_TO ?? 'info@vimst.org';
  const from = process.env.ENQUIRY_FROM;

  if (!apiKey || !from) {
    // No mail provider wired up yet -- tell the client so it can fall back.
    return NextResponse.json({ ok: false, configured: false }, { status: 200 });
  }

  const { name, email, phone, course, message } = result.data;
  const lines = [
    `Name: ${name}`,
    `Email: ${email}`,
    phone ? `Phone: ${phone}` : null,
    course ? `Course of interest: ${course}` : null,
    '',
    message,
  ].filter(Boolean);

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: email,
        subject: `Website enquiry — ${name}${course ? ` (${course})` : ''}`,
        text: lines.join('\n'),
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      console.error('Enquiry delivery failed:', res.status, detail);
      return NextResponse.json(
        { ok: false, error: 'We could not send that just now. Please email us directly.' },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true, configured: true });
  } catch (err) {
    console.error('Enquiry delivery error:', err);
    return NextResponse.json(
      { ok: false, error: 'We could not send that just now. Please email us directly.' },
      { status: 502 }
    );
  }
}
