import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'node:crypto';
import { requireManagement } from '@/lib/auth';
import { db, tables } from '@/lib/db';
import { isRole } from '@/lib/roles';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ username: string }> };

/** Counts how many management accounts exist, so the last one cannot be lost. */
async function managementCount(sql: ReturnType<typeof db>) {
  const t = tables(sql);
  const [{ count }] = await sql`
    select count(*)::int as count from ${t.admins} where role = 'management'
  `;
  return Number(count);
}

export async function PUT(request: Request, { params }: Params) {
  const guard = await requireManagement();
  if (!guard.ok) return guard.response;

  const username = decodeURIComponent((await params).username).toLowerCase();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request.' }, { status: 400 });
  }

  const b = (body ?? {}) as Record<string, unknown>;
  const name = String(b.name ?? '').trim();
  const role = b.role;
  const resetPassword = b.resetPassword === true;
  const supplied = String(b.password ?? '');

  if (!name) {
    return NextResponse.json({ ok: false, error: 'Full name is required.' }, { status: 422 });
  }
  if (!isRole(role)) {
    return NextResponse.json({ ok: false, error: 'Choose a valid role.' }, { status: 422 });
  }
  if (resetPassword && supplied && supplied.length < 10) {
    return NextResponse.json(
      { ok: false, error: 'A password must be at least 10 characters.' },
      { status: 422 }
    );
  }

  try {
    const sql = db();
    const t = tables(sql);

    const [existing] = await sql`
      select username, role from ${t.admins} where username = ${username}
    `;
    if (!existing) {
      return NextResponse.json({ ok: false, error: 'Account not found.' }, { status: 404 });
    }

    // Demoting the only management account would lock everyone out of staff
    // administration, with no way back in through the UI.
    if (existing.role === 'management' && role !== 'management') {
      if ((await managementCount(sql)) <= 1) {
        return NextResponse.json(
          {
            ok: false,
            error: 'This is the only management account. Promote another before changing this one.',
          },
          { status: 409 }
        );
      }
    }

    const password = resetPassword ? supplied || randomBytes(9).toString('base64url') : null;

    if (password) {
      const passwordHash = await bcrypt.hash(password, 12);
      await sql`
        update ${t.admins}
        set name = ${name}, role = ${role}, password_hash = ${passwordHash}
        where username = ${username}
      `;
    } else {
      await sql`
        update ${t.admins} set name = ${name}, role = ${role} where username = ${username}
      `;
    }

    return NextResponse.json({
      ok: true,
      staff: { username, name, role },
      ...(password ? { password, generated: !supplied } : {}),
    });
  } catch (error) {
    console.error('Update staff failed:', error);
    return NextResponse.json({ ok: false, error: 'Could not save the account.' }, { status: 502 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const guard = await requireManagement();
  if (!guard.ok) return guard.response;

  const username = decodeURIComponent((await params).username).toLowerCase();

  if (username === guard.session.username) {
    return NextResponse.json(
      { ok: false, error: 'You cannot delete the account you are signed in with.' },
      { status: 409 }
    );
  }

  try {
    const sql = db();
    const t = tables(sql);

    const [existing] = await sql`select role from ${t.admins} where username = ${username}`;
    if (!existing) {
      return NextResponse.json({ ok: false, error: 'Account not found.' }, { status: 404 });
    }
    if (existing.role === 'management' && (await managementCount(sql)) <= 1) {
      return NextResponse.json(
        { ok: false, error: 'This is the only management account and cannot be deleted.' },
        { status: 409 }
      );
    }

    await sql`delete from ${t.admins} where username = ${username}`;
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Delete staff failed:', error);
    return NextResponse.json({ ok: false, error: 'Could not delete the account.' }, { status: 502 });
  }
}
