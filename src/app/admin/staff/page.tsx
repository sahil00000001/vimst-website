import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { StaffManager } from '@/components/admin/StaffManager';

export const metadata: Metadata = { title: 'Staff — MGIMST Admin' };

export default async function AdminStaffPage() {
  const session = await getSession();
  // The API enforces this too; this keeps a teacher from seeing an empty shell.
  if (session?.role !== 'management') redirect('/admin');

  return <StaffManager />;
}
