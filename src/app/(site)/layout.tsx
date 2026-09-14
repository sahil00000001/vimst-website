import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { MotionProvider } from '@/components/MotionProvider';
import { PageTransition } from '@/components/PageTransition';
import { ScrollProgressBar } from '@/components/ScrollProgressBar';
import { ScrollToTop } from '@/components/ScrollToTop';
import { buildNav } from '@/lib/nav';

/** Chrome for the public site. The admin portal deliberately sits outside it. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const nav = buildNav();

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-brand focus:px-5 focus:py-2.5 focus:text-sm focus:text-paper"
      >
        Skip to content
      </a>

      <MotionProvider>
        <ScrollProgressBar />
        <Navbar nav={nav} />

        <main id="main" className="flex-1">
          <PageTransition>{children}</PageTransition>
        </main>

        <Footer />
        <ScrollToTop />
      </MotionProvider>
    </>
  );
}
