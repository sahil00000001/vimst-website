import type { Metadata } from 'next';
import { EditorialPage } from '@/components/EditorialPage';

export const metadata: Metadata = {
  title: "Career",
  description: "Building a career at MGIMST — strategic goals, careful planning and the support to get there.",
};

export default function Page() {
  return (
    <EditorialPage
      contentKey="career"
      title="Career"
      eyebrow="The Institute"
      currentHref="/career"
    />
  );
}
