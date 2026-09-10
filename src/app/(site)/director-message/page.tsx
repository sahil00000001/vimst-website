import type { Metadata } from 'next';
import { EditorialPage } from '@/components/EditorialPage';

export const metadata: Metadata = {
  title: "Director’s Message",
  description: "A message from the Director of Vivekananda Institute of Management Science and Technology.",
};

export default function Page() {
  return (
    <EditorialPage
      contentKey="directorMessage"
      title="Director’s Message"
      eyebrow="From the desk"
      currentHref="/director-message"
    />
  );
}
