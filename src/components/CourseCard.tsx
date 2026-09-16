'use client';

import Link from 'next/link';
import { motion, useMotionTemplate, useMotionValue, useSpring } from 'framer-motion';
import type { PointerEvent } from 'react';
import { ACCENT_CLASS, ACCENT_HEX, accentForCourse } from '@/lib/accents';
import type { Course } from '@/lib/content';
import { excerpt } from '@/lib/content';
import { Arrow } from './Hero';
import { Media } from './Media';

/* Motion wrapper around next/link, so the whole card is one real link and
   still animates. */
const MotionLink = motion.create(Link);

const TILT = { stiffness: 220, damping: 22, mass: 0.6 };

export function CourseCard({ course, compact }: { course: Course; compact?: boolean }) {
  /* A very shallow tilt toward the pointer -- enough to feel physical, not
     enough to make the text hard to read. */
  const rx = useSpring(useMotionValue(0), TILT);
  const ry = useSpring(useMotionValue(0), TILT);
  const glowX = useSpring(useMotionValue(50), TILT);
  const glowY = useSpring(useMotionValue(50), TILT);

  const onMove = (e: PointerEvent<HTMLAnchorElement>) => {
    if (e.pointerType !== 'mouse') return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    ry.set((px - 0.5) * 7);
    rx.set((0.5 - py) * 7);
    glowX.set(px * 100);
    glowY.set(py * 100);
  };

  const reset = () => {
    rx.set(0);
    ry.set(0);
    glowX.set(50);
    glowY.set(50);
  };

  const accentName = accentForCourse(course);
  const accent = ACCENT_CLASS[accentName];

  // 8-digit hex: the family accent at ~7% alpha.
  const glow = useMotionTemplate`radial-gradient(360px circle at ${glowX}% ${glowY}%, ${ACCENT_HEX[accentName]}14, transparent 65%)`;

  return (
    <div style={{ perspective: 1200 }} className="h-full">
      <MotionLink
        href={`/courses/${course.slug}`}
        onPointerMove={onMove}
        onPointerLeave={reset}
        onBlur={reset}
        style={{ rotateX: rx, rotateY: ry, transformStyle: 'preserve-3d' }}
        whileHover={{ y: -6 }}
        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
        className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-rule bg-paper shadow-card transition-shadow duration-500 hover:shadow-lift"
      >
        <motion.span
          aria-hidden
          style={{ background: glow }}
          className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        />

        {course.banner && !compact && (
          <div className="relative aspect-[16/9] overflow-hidden bg-linen">
            <Media
              src={course.banner}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.08]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-paper/45 to-transparent" />
            <span
              className={`absolute left-4 top-4 rounded-full bg-paper/92 px-3 py-1 text-[length:var(--text-2xs)] font-semibold uppercase tracking-[0.12em] backdrop-blur ${accent.text}`}
            >
              {course.level}
            </span>
          </div>
        )}

        <div className="relative z-20 flex flex-1 flex-col p-5 sm:p-6">
          {compact && (
            <span
              className={`mb-3 inline-flex w-fit rounded-full px-2.5 py-1 text-[length:var(--text-2xs)] font-semibold uppercase tracking-[0.12em] ${accent.bg} ${accent.text}`}
            >
              {course.level}
            </span>
          )}

          <h3
            className={`font-display text-[length:var(--text-xl)] leading-snug transition-colors duration-300 ${accent.hoverText}`}
          >
            {course.title}
          </h3>

          <p className="mt-1.5 text-[length:var(--text-2xs)] uppercase tracking-[0.1em] text-mist">
            {course.department}
          </p>

          <p className="mt-3.5 flex-1 text-[length:var(--text-sm)] leading-relaxed text-slate">
            {excerpt(course.summary, compact ? 18 : 24)}
          </p>

          <span className="mt-5 inline-flex items-center gap-2 text-[length:var(--text-sm)] font-medium text-ink">
            View programme
            <Arrow className="transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </div>
      </MotionLink>
    </div>
  );
}
