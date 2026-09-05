/**
 * Roles, in their own module because the middleware that guards `/admin` runs
 * on the Edge runtime. `auth.ts` needs these types, and importing them from
 * `db.ts` would drag the Postgres driver into an Edge bundle that cannot run it.
 *
 * Two roles, because there are two jobs. `management` runs the institute:
 * everything, including staff accounts and deleting student records.
 * `teacher` enters and publishes marks but cannot remove a student or create
 * an account — the destructive and administrative actions stay with the office.
 */

export const ROLES = ['management', 'teacher'] as const;

export type Role = (typeof ROLES)[number];

export const isRole = (v: unknown): v is Role => (ROLES as readonly string[]).includes(v as string);

export const ROLE_LABEL: Record<Role, string> = {
  management: 'Management',
  teacher: 'Teacher',
};

export const ROLE_DESCRIPTION: Record<Role, string> = {
  management:
    'Full access, including staff accounts, deleting student records and exports.',
  teacher: 'Can add and edit students and results, and run bulk uploads.',
};
