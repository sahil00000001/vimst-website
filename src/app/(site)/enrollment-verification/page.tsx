import type { Metadata } from 'next';
import { EnrollmentVerification } from '@/components/EnrollmentVerification';
import { PageBanner } from '@/components/PageBanner';

export const metadata: Metadata = {
  title: 'Enrollment Verification',
  description:
    'Verify your MGIMST enrollment and retrieve your semester statement of marks using your roll number and date of birth.',
  robots: { index: true, follow: false },
};

export default function EnrollmentVerificationPage() {
  return (
    <>
      <PageBanner
        eyebrow="Students"
        title="Enrollment Verification"
        intro="Look up your enrollment record and semester result. Enter the details exactly as they appear on your enrollment paperwork."
        image="/media/images/banner/banner-message.jpg"
        crumbs={[{ label: 'Enrollment Verification' }]}
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
