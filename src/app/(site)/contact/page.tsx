import type { Metadata } from 'next';
import Link from 'next/link';
import { CallbackForm } from '@/components/CallbackForm';
import { Reveal, Stagger, StaggerItem } from '@/components/Motion';
import { PageBanner } from '@/components/PageBanner';

export const metadata: Metadata = {
  title: 'Contact Us',
  description:
    'Get in touch with Vivekananda Institute of Management Science and Technology: admissions, enrollment verification and general enquiries.',
};

const CONTACTS = [
  {
    label: 'General enquiries',
    value: 'info@vimst.org',
    href: 'mailto:info@vimst.org',
    note: 'Admissions, programmes and anything else about the institute.',
  },
  {
    label: 'Enrollment verification',
    value: 'verification@vimst.org',
    href: 'mailto:verification@vimst.org',
    note: 'Degree, transcript and enrollment verification requests.',
  },
  {
    label: 'Administration',
    value: 'admin@vimst.org',
    href: 'mailto:admin@vimst.org',
    note: 'Records, fees and administrative matters.',
  },
  {
    label: 'Location',
    value: 'Andhra Pradesh, India',
    href: null,
    note: 'Vivekananda Institute of Management Science and Technology.',
  },
];

const QUICK = [
  { label: 'Fee structure', href: '/fee-structure' },
  { label: 'Payment modes', href: '/payment-modes' },
  { label: 'Check your result', href: '/enrollment-verification' },
  { label: 'All courses', href: '/courses' },
];

export default function ContactPage() {
  return (
    <>
      <PageBanner
        eyebrow="Get in touch"
        title="Contact Us"
        intro="The quickest way to reach us is the form below. Fill in the required fields and we will get back to you as soon as possible."
        image="/media/art/contact.jpg"
        crumbs={[{ label: 'Contact' }]}
        wide
      />

      <section className="bg-shell">
        <div className="shell pb-16 sm:pb-20 lg:pb-28">
          <div className="rounded-b-2xl border border-t-0 border-rule bg-paper px-5 py-10 sm:px-10 sm:py-12 lg:px-14">
            <div className="grid gap-12 lg:grid-cols-12 lg:gap-14">
              <div className="lg:col-span-5">
                <Reveal from="right">
                  <p className="eyebrow mb-5">Reach us</p>
                  <h2 className="text-[length:var(--text-3xl)]">
                    Where to send <em className="not-italic text-brand">what</em>
                  </h2>
                </Reveal>

                <Stagger className="mt-8 space-y-0">
                  {CONTACTS.map((c) => (
                    <StaggerItem
                      key={c.label}
                      className="border-b border-rule-soft py-5 last:border-0"
                    >
                      <p className="text-[length:var(--text-2xs)] font-semibold uppercase tracking-[0.14em] text-mist">
                        {c.label}
                      </p>
                      {c.href ? (
                        <a
                          href={c.href}
                          className="-mx-1 mt-1 block rounded px-1 py-2 font-display text-[length:var(--text-lg)] text-ink transition-colors hover:text-brand"
                        >
                          {c.value}
                        </a>
                      ) : (
                        <p className="mt-1.5 font-display text-[length:var(--text-lg)] text-ink">{c.value}</p>
                      )}
                      <p className="mt-1.5 text-[length:var(--text-sm)] text-slate">{c.note}</p>
                    </StaggerItem>
                  ))}
                </Stagger>

                <Reveal from="right" delay={0.14} className="mt-10">
                  <p className="mb-4 text-[length:var(--text-2xs)] font-semibold uppercase tracking-[0.14em] text-brand">
                    Quick links
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {QUICK.map((q) => (
                      <Link
                        key={q.href}
                        href={q.href}
                        className="rounded-full border border-rule bg-shell px-4 py-2 text-[length:var(--text-sm)] text-graphite transition-colors hover:border-brand hover:text-brand"
                      >
                        {q.label}
                      </Link>
                    ))}
                  </div>
                </Reveal>
              </div>

              <div className="lg:col-span-7">
                <Reveal from="left" delay={0.08}>
                  <CallbackForm />
                </Reveal>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
