import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db, isDatabaseConfigured, tables } from '@/lib/db';
import { isRole } from '@/lib/roles';
import {
  SESSION_COOKIE,
  createSessionToken,
  isAuthConfigured,
  sessionCookieOptions,
} from '@/lib/auth';

export const runtime = 'nodejs';

/**
 * Admin sign-in.
 *
 * Credentials live in the `admins` table (seeded by `npm run seed:admin`).
 * The same generic message is returned for an unknown user and a wrong
 * password, so the form cannot be used to discover valid usernames.
 */
export async function POST(request: Request) {
  if (!isAuthConfigured()) {
    return NextResponse.json(
      { ok: false, error: 'ADMIN_SESSION_SECRET is not configured on the server.' },
      { status: 503 }
    );
  }
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { ok: false, error: 'DATABASE_URL is not configured on the server.' },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request.' }, { status: 400 });
  }

  const { username, password } = (body ?? {}) as Record<string, unknown>;
  const user = String(username ?? '').trim().toLowerCase();
  const pass = String(password ?? '');

  if (!user || !pass) {
    return NextResponse.json(
      { ok: false, error: 'Enter your username and password.' },
      { status: 422 }
    );
  }

  const INVALID = { ok: false, error: 'Those credentials were not recognised.' };

  try {
    const sql = db();
    const t = tables(sql);
    const [admin] = await sql`
      select username, name, password_hash, role from ${t.admins} where username = ${user}
    `;

    // Hash a throwaway value when the user is unknown, so both paths take a
    // comparable amount of time.
    const hash = admin?.password_hash ?? '$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinv';
    const valid = await bcrypt.compare(pass, hash);

    if (!admin || !valid) return NextResponse.json(INVALID, { status: 401 });

    const token = await createSessionToken({
      username: admin.username,
      name: admin.name,
      role: isRole(admin.role) ? admin.role : 'teacher',
    });

    await sql`update ${t.admins} set last_login_at = now() where username = ${admin.username}`;

    const response = NextResponse.json({
      ok: true,
      admin: { username: admin.username, name: admin.name, role: admin.role },
    });
    response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions);
    return response;
  } catch (error) {
    console.error('Admin login failed:', error);
    return NextResponse.json(
      { ok: false, error: 'Could not reach the database. Please try again.' },
      { status: 502 }
    );
  }
}
