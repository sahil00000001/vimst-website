import type { Metadata } from 'next';
import { ResultsManager } from '@/components/admin/ResultsManager';

export const metadata: Metadata = { title: 'Results · VIMST Admin' };

export default function AdminResultsPage() {
  return <ResultsManager />;
}
