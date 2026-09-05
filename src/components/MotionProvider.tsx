'use client';

import { MotionConfig } from 'framer-motion';
import type { ReactNode } from 'react';

/**
 * `reducedMotion="user"` makes framer honour the OS setting for every
 * animation in the tree. Doing it here rather than per-component keeps server
 * and client markup identical, which branching on `useReducedMotion()` during
 * render does not.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
