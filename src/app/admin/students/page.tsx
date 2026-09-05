import type { Metadata } from 'next';
import { StudentsManager } from '@/components/admin/StudentsManager';

export const metadata: Metadata = { title: 'Students — MGIMST Admin' };

export default function AdminStudentsPage() {
  return <StudentsManager />;
}
