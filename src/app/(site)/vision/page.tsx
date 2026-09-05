import type { Metadata } from 'next';
import { EditorialPage } from '@/components/EditorialPage';

export const metadata: Metadata = {
  title: "Our Vision",
  description: "The vision that guides Mahatma Gandhi Institute of Management Science & Technology.",
};

export default function Page() {
  return (
    <EditorialPage
      contentKey="vision"
      title="Our Vision"
      eyebrow="The Institute"
      currentHref="/vision"
    />
  );
}
