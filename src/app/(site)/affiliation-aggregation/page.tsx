import type { Metadata } from 'next';
import { ComingSoon } from '@/components/ComingSoon';

export const metadata: Metadata = {
  title: 'Affiliation & Aggregation',
  description: 'Affiliation and aggregation details for VIMST programmes.',
};

export default function AffiliationPage() {
  return (
    <ComingSoon
      eyebrow="Academics"
      title="Affiliation & Aggregation"
      image="/media/art/about.jpg"
    />
  );
}
