import type { Metadata } from 'next';
import { EditorialPage } from '@/components/EditorialPage';

export const metadata: Metadata = {
  title: "About Us",
  description: "Mahatma Gandhi Institute of Management Science & Technology is a top ranking institute in engineering and management, offering undergraduate and postgraduate programmes through distance learning.",
};

export default function Page() {
  return (
    <EditorialPage
      contentKey="about"
      title="About Us"
      eyebrow="The Institute"
      currentHref="/about"
    />
  );
}
