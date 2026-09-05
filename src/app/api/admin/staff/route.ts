import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'node:crypto';
import { requireManagement } from '@/lib/auth';
import { db, tables } from '@/lib/db';
import { isRole } from '@/lib/roles';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Staff accounts. Management only — a teacher cannot create or list accounts. */

export async function GET() {
  const guard = await requireManagement();
  if (!guard.ok) return guard.response;

  try {
    const sql = db();
    const t = tables(sql);
    const rows = await sql`
      select username, name, role, created_at, last_login_at
      from ${t.admins}
      order by role, username
    `;

    return NextResponse.json({
      ok: true,
      items: rows.map((r) => ({
        username: r.username,
        name: r.name,
        role: r.role,
        createdAt: r.created_at,
        lastLoginAt: r.last_login_at,
      })),
      // So the UI can stop you removing the account you are signed in as.
      currentUser: guard.session.username,
    });
  } catch (error) {
    console.error('List staff failed:', error);
    return NextResponse.json({ ok: false, error: 'Could not load staff.' }, { status: 502 });
  }
}

export async function POST(request: Request) {
  const guard = await requireManagement();
  if (!guard.ok) return guard.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request.' }, { status: 400 });
  }

  const b = (body ?? {}) as Record<string, unknown>;
  const username = String(b.username ?? '').trim().toLowerCase();
  const name = String(b.name ?? '').trim();
  const role = b.role;
  const supplied = String(b.password ?? '');

  if (!/^[a-z0-9._-]{3,32}$/.test(username)) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Username must be 3–32 characters, using letters, numbers, dot, dash or underscore.',
      },
      { status: 422 }
    );
  }
  if (!name) {
    return NextResponse.json({ ok: false, error: 'Full name is required.' }, { status: 422 });
  }
  if (!isRole(role)) {
    return NextResponse.json({ ok: false, error: 'Choose a valid role.' }, { status: 422 });
  }
  if (supplied && supplied.length < 10) {
    return NextResponse.json(
      { ok: false, error: 'A password must be at least 10 characters.' },
      { status: 422 }
    );
  }

  // Generated when left blank, and returned once so it can be handed over.
  const password = supplied || randomBytes(9).toString('base64url');

  try {
    const sql = db();
    const t = tables(sql);
    const passwordHash = await bcrypt.hash(password, 12);

    const inserted = await sql`
      insert into ${t.admins} (username, name, role, password_hash)
      values (${username}, ${name}, ${role}, ${passwordHash})
      on conflict (username) do nothing
      returning username
    `;

    if (inserted.length === 0) {
      return NextResponse.json(
        { ok: false, error: `The username "${username}" is already taken.` },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        staff: { username, name, role },
        // Shown once in the UI; never stored in readable form.
        password,
        generated: !supplied,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create staff failed:', error);
    return NextResponse.json({ ok: false, error: 'Could not create the account.' }, { status: 502 });
  }
}
