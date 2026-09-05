import type { Metadata } from 'next';
import { EditorialPage } from '@/components/EditorialPage';

export const metadata: Metadata = {
  title: "Director’s Message",
  description: "A message from the Director of Mahatma Gandhi Institute of Management Science & Technology.",
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
