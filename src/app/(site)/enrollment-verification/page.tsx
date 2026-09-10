import type { Metadata } from 'next';
import { EnrollmentVerification } from '@/components/EnrollmentVerification';
import { PageBanner } from '@/components/PageBanner';

export const metadata: Metadata = {
  title: 'Check Your Result',
  description:
    'Check your VIMST semester result with your enrollment number and date of birth, and download the statement of marks as a PDF.',
  robots: { index: true, follow: false },
};

export default function EnrollmentVerificationPage() {
  return (
    <>
      <PageBanner
        eyebrow="Students"
        title="Check Your Result"
        intro="Enter your enrollment number and date of birth to see every semester published for you — view it on screen, or download the statement of marks as a PDF."
        image="/media/images/banner/banner-message.jpg"
        crumbs={[{ label: 'Check Your Result' }]}
        wide
      />

      <section className="bg-shell">
        <div className="shell pb-16 sm:pb-20 lg:pb-28">
          <div className="rounded-b-2xl border border-t-0 border-rule bg-paper px-5 py-10 sm:px-10 sm:py-12 lg:px-14">
            <EnrollmentVerification />
          </div>
        </div>
      </section>
    </>
  );
}
