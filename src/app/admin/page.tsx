import type { Metadata } from 'next';
import { Dashboard } from '@/components/admin/Dashboard';

export const metadata: Metadata = { title: 'Dashboard — MGIMST Admin' };

export default function AdminDashboardPage() {
  return <Dashboard />;
}
