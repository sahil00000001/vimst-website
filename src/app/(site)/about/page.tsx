import type { Metadata } from 'next';
import { EditorialPage } from '@/components/EditorialPage';

export const metadata: Metadata = {
  title: "About Us",
  description: "Established in 1997, Vivekananda Institute of Management Science and Technology offers undergraduate and postgraduate programmes in Regular and Part-Time modes, with an emphasis on quality-oriented, career-focused education.",
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
