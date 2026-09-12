import type { Metadata } from 'next';
import { BulkUpload } from '@/components/admin/BulkUpload';

export const metadata: Metadata = { title: 'Bulk upload · VIMST Admin' };

export default function AdminImportPage() {
  return <BulkUpload />;
}
