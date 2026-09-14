'use client';

import {
  motion,
  useInView,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
  type Variants,
} from 'framer-motion';
import { useEffect, useRef, useState, type ReactNode } from 'react';

/* One easing curve for the whole site, so every entrance shares a gesture. */
export const EASE = [0.22, 1, 0.36, 1] as const;

/* Springs used for anything that tracks the pointer or the scrollbar. */
const SCROLL_SPRING = { stiffness: 90, damping: 26, restDelta: 0.001 };

/* ------------------------------------------------------------------
   Entrance
   ------------------------------------------------------------------ */

type RevealProps = {
  children: ReactNode;
  from?: 'up' | 'down' | 'left' | 'right' | 'none';
  delay?: number;
  duration?: number;
  className?: string;
  amount?: number;
  as?: 'div' | 'section' | 'li' | 'article' | 'span' | 'header' | 'figure';
};

const OFFSET = {
  up: { y: 30, x: 0 },
  down: { y: -30, x: 0 },
  left: { x: 34, y: 0 },
  right: { x: -34, y: 0 },
  none: { x: 0, y: 0 },
};

/** Fades and slides its children in the first time they scroll into view. */
export function Reveal({
  children,
  from = 'up',
  delay = 0,
  duration = 0.8,
  className,
  amount = 0.18,
  as = 'div',
}: RevealProps) {
  const Component = motion[as];

  return (
    <Component
      className={className}
      initial={{ opacity: 0, ...OFFSET[from] }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount, margin: '0px 0px -60px 0px' }}
      transition={{ duration, delay, ease: EASE }}
    >
      {children}
    </Component>
  );
}

/** Parent that releases its children one after another. */
export function Stagger({
  children,
  className,
  gap = 0.075,
  delay = 0,
  amount = 0.12,
  as = 'div',
}: {
  children: ReactNode;
  className?: string;
  gap?: number;
  delay?: number;
  amount?: number;
  as?: 'div' | 'ul' | 'section';
}) {
  const Component = motion[as];
  return (
    <Component
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount, margin: '0px 0px -60px 0px' }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: gap, delayChildren: delay } },
      }}
    >
      {children}
    </Component>
  );
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 26 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

export function StaggerItem({
  children,
  className,
  as = 'div',
}: {
  children: ReactNode;
  className?: string;
  as?: 'div' | 'li' | 'article';
}) {
  const Component = motion[as];
  return (
    <Component className={className} variants={itemVariants}>
      {children}
    </Component>
  );
}

/* ------------------------------------------------------------------
   Text
   ------------------------------------------------------------------ */

/**
 * Headline whose words rise from behind a mask. The markup is identical on the
 * server and the client -- `MotionConfig reducedMotion="user"` neutralises the
 * movement rather than swapping the tree, which would break hydration.
 */
export function WordReveal({
  text,
  className,
  delay = 0,
  stagger = 0.05,
  /** Animate on scroll-into-view rather than on mount. */
  onView = false,
}: {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
  onView?: boolean;
}) {
  const words = text.split(' ');
  const trigger = onView
    ? { whileInView: 'visible', viewport: { once: true, amount: 0.5 } }
    : { animate: 'visible' };

  return (
    <motion.span
      className={className}
      initial="hidden"
      {...trigger}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
      }}
      aria-label={text}
    >
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom">
          <motion.span
            className="inline-block"
            aria-hidden
            variants={{
              hidden: { y: '108%', opacity: 0 },
              visible: {
                y: '0%',
                opacity: 1,
                transition: { duration: 0.85, ease: EASE },
              },
            }}
          >
            {word}
            {i < words.length - 1 ? ' ' : ''}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}

/* ------------------------------------------------------------------
   Parallax
   ------------------------------------------------------------------ */

/**
 * Moves its children against the scroll direction as the section passes
 * through the viewport. `speed` is the fraction of the travelled distance the
 * layer lags behind by; negative values push it ahead.
 */
export function Parallax({
  children,
  speed = 0.2,
  className,
  /** Also scale slightly, which hides the edges on a full-bleed image. */
  zoom = false,
}: {
  children: ReactNode;
  speed?: number;
  className?: string;
  zoom?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const raw = useTransform(scrollYProgress, [0, 1], [`${-speed * 100}%`, `${speed * 100}%`]);
  const y = useSpring(raw, SCROLL_SPRING);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], zoom ? [1.12, 1.02, 1.12] : [1, 1, 1]);

  return (
    <motion.div ref={ref} style={{ y, scale }} className={className}>
      {children}
    </motion.div>
  );
}

/**
 * Parallax for a layer that already fills its parent (an absolutely positioned
 * image plate). The parent is the scroll target, so the layer is over-sized and
 * shifted inside it rather than moving the parent itself.
 */
export function ParallaxPlate({
  children,
  speed = 0.16,
  className = '',
}: {
  children: ReactNode;
  speed?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const raw = useTransform(scrollYProgress, [0, 1], [`${-speed * 100}%`, `${speed * 100}%`]);
  const y = useSpring(raw, SCROLL_SPRING);

  return (
    <div ref={ref} className={`absolute inset-0 overflow-hidden ${className}`}>
      <motion.div
        style={{ y, height: `${100 + speed * 220}%`, top: `${-speed * 110}%` }}
        className="absolute inset-x-0"
      >
        {children}
      </motion.div>
    </div>
  );
}

/** Thin progress bar pinned under the header. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-brand"
      aria-hidden
    />
  );
}

/* ------------------------------------------------------------------
   Interaction
   ------------------------------------------------------------------ */

/**
 * Nudges toward the pointer while it is over the element. Deliberately small --
 * it should read as responsiveness, not as a toy.
 */
export function Magnetic({
  children,
  className,
  strength = 0.25,
}: {
  children: ReactNode;
  className?: string;
  strength?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const x = useSpring(useMotionValue(0), { stiffness: 260, damping: 20 });
  const y = useSpring(useMotionValue(0), { stiffness: 260, damping: 20 });

  return (
    <motion.span
      ref={ref}
      style={{ x, y }}
      className={`inline-block ${className ?? ''}`}
      onPointerMove={(e) => {
        if (e.pointerType !== 'mouse' || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        x.set((e.clientX - (r.left + r.width / 2)) * strength);
        y.set((e.clientY - (r.top + r.height / 2)) * strength);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.span>
  );
}

/** Counts up to `value` the first time it scrolls into view. */
export function Counter({
  value,
  suffix = '',
  duration = 1600,
  className,
}: {
  value: number;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;

    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduced) {
      setDisplay(value);
      return;
    }

    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      // easeOutExpo, so it decelerates into the final number
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      setDisplay(Math.round(eased * value));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, value, duration]);

  return (
    <span ref={ref} className={className}>
      <span className="tabular-nums">{display}</span>
      {suffix}
    </span>
  );
}

export { motion, useScroll, useTransform, useSpring, type MotionValue };
