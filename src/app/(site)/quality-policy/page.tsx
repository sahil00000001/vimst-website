import type { Metadata } from 'next';
import { EditorialPage } from '@/components/EditorialPage';

export const metadata: Metadata = {
  title: "Quality Policy",
  description: "The quality policy of Vivekananda Institute of Management Science and Technology.",
};

export default function Page() {
  return (
    <EditorialPage
      contentKey="qualityPolicy"
      title="Quality Policy"
      eyebrow="The Institute"
      currentHref="/quality-policy"
    />
  );
}
