import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { isRole, type Role } from './roles';

/**
 * Admin sessions.
 *
 * A signed JWT in an httpOnly cookie. `jose` is used rather than a Node-only
 * library because the middleware that guards `/admin` runs on the Edge runtime,
 * where `crypto`-based JWT libraries are unavailable.
 */

export const SESSION_COOKIE = 'mgimst_admin';
const MAX_AGE_SECONDS = 60 * 60 * 8; // one working day

export type SessionPayload = {
  username: string;
  name: string;
  role: Role;
};

function secretKey(): Uint8Array {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      'ADMIN_SESSION_SECRET must be set to a random string of at least 32 characters.'
    );
  }
  return new TextEncoder().encode(secret);
}

export function isAuthConfigured() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  return Boolean(secret && secret.length >= 32);
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(secretKey());
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey());
    if (typeof payload.username !== 'string') return null;
    return {
      username: payload.username,
      name: String(payload.name ?? payload.username),
      // Sessions issued before roles existed default to the lesser privilege.
      role: isRole(payload.role) ? payload.role : 'teacher',
    };
  } catch {
    return null;
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: MAX_AGE_SECONDS,
};

/** Reads the current admin session inside a server component or route handler. */
export async function getSession(): Promise<SessionPayload | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

/** Route-handler guard. Returns the session, or a 401 Response to return. */
export async function requireSession(): Promise<
  { ok: true; session: SessionPayload } | { ok: false; response: Response }
> {
  const session = await getSession();
  if (!session) {
    return {
      ok: false,
      response: Response.json({ ok: false, error: 'Not signed in.' }, { status: 401 }),
    };
  }
  return { ok: true, session };
}

/**
 * Guard for endpoints only the office may use — staff accounts, deleting a
 * student record. A teacher gets a 403 rather than a 401, because they are
 * signed in; they simply may not do this.
 */
export async function requireManagement(): Promise<
  { ok: true; session: SessionPayload } | { ok: false; response: Response }
> {
  const guard = await requireSession();
  if (!guard.ok) return guard;
  if (guard.session.role !== 'management') {
    return {
      ok: false,
      response: Response.json(
        { ok: false, error: 'That action is restricted to management accounts.' },
        { status: 403 }
      ),
    };
  }
  return guard;
}
