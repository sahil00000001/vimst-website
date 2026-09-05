import type { Metadata } from 'next';
import { EditorialPage } from '@/components/EditorialPage';

export const metadata: Metadata = {
  title: "Our Mission",
  description: "Our mission is to provide quality education of global standards to working professionals on a strong foundation of ethics.",
};

export default function Page() {
  return (
    <EditorialPage
      contentKey="mission"
      title="Our Mission"
      eyebrow="The Institute"
      currentHref="/mission"
    />
  );
}
