import type { Metadata } from 'next';
import { getSession } from '@/lib/auth';
import { AdminShell } from '@/components/admin/AdminShell';

export const metadata: Metadata = {
  title: 'Admin — MGIMST',
  robots: { index: false, follow: false },
};

/**
 * The admin portal sits outside the `(site)` group, so it gets no public nav or
 * footer. The middleware has already rejected unauthenticated requests by the
 * time this renders; the session is read again here for the display name.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  // The login page renders inside this layout too, before a session exists.
  if (!session) return <>{children}</>;

  return <AdminShell admin={session}>{children}</AdminShell>;
}
