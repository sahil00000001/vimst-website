import type { Metadata } from 'next';
import { ResultsManager } from '@/components/admin/ResultsManager';

export const metadata: Metadata = { title: 'Results — MGIMST Admin' };

export default function AdminResultsPage() {
  return <ResultsManager />;
}
