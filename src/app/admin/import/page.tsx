import type { Metadata } from 'next';
import { BulkUpload } from '@/components/admin/BulkUpload';

export const metadata: Metadata = { title: 'Bulk upload — MGIMST Admin' };

export default function AdminImportPage() {
  return <BulkUpload />;
}
