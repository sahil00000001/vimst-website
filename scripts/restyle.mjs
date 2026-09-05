import fs from 'node:fs';
import path from 'node:path';

/**
 * One-off codemod that moves the UI onto the shared containers and the fluid
 * type scale, so nothing depends on a fixed pixel size or a hand-written
 * max-width. Run once; kept in the repo as a record of the mapping.
 */

const ROOT = 'src';

/* px size -> fluid step. Chosen so the desktop end lands close to the old
   fixed value while the phone end steps down a little. */
const TEXT = [
  [/text-\[10(\.5)?px\]/g, 'text-[length:var(--text-2xs)]'],
  [/text-\[11px\]/g, 'text-[length:var(--text-2xs)]'],
  [/text-\[11\.5px\]/g, 'text-[length:var(--text-2xs)]'],
  [/text-\[12px\]/g, 'text-[length:var(--text-xs)]'],
  [/text-\[12\.5px\]/g, 'text-[length:var(--text-xs)]'],
  [/text-\[13px\]/g, 'text-[length:var(--text-sm)]'],
  [/text-\[13\.5px\]/g, 'text-[length:var(--text-sm)]'],
  [/text-\[14px\]/g, 'text-[length:var(--text-sm)]'],
  [/text-\[14\.5px\]/g, 'text-[length:var(--text-base)]'],
  [/text-\[15px\]/g, 'text-[length:var(--text-base)]'],
  [/text-\[15\.5px\]/g, 'text-[length:var(--text-base)]'],
  [/text-\[16px\]/g, 'text-[length:var(--text-base)]'],
  [/text-\[16\.5px\]/g, 'text-[length:var(--text-lg)]'],
  [/text-\[17px\]/g, 'text-[length:var(--text-lg)]'],
  [/text-\[1\.05rem\]/g, 'text-[length:var(--text-lg)]'],
  [/text-\[1\.1rem\]/g, 'text-[length:var(--text-lg)]'],
  [/text-\[1\.15rem\]/g, 'text-[length:var(--text-xl)]'],
  [/text-\[1\.2rem\]/g, 'text-[length:var(--text-xl)]'],
  [/text-\[1\.25rem\]/g, 'text-[length:var(--text-xl)]'],
  [/text-\[1\.3rem\]/g, 'text-[length:var(--text-2xl)]'],
  [/text-\[1\.35rem\]/g, 'text-[length:var(--text-2xl)]'],
  [/text-\[1\.7rem\]/g, 'text-[length:var(--text-3xl)]'],
  [/text-\[1\.8rem\]/g, 'text-[length:var(--text-3xl)]'],
  // clamp() headings written inline before the scale existed
  [/text-\[clamp\(1\.3rem,2\.4vw,1\.85rem\)\]/g, 'text-[length:var(--text-2xl)]'],
  [/text-\[clamp\(1\.3rem,3vw,1\.9rem\)\]/g, 'text-[length:var(--text-2xl)]'],
  [/text-\[clamp\(1\.35rem,2\.4vw,1\.75rem\)\]/g, 'text-[length:var(--text-2xl)]'],
  [/text-\[clamp\(1\.4rem,2\.8vw,2rem\)\]/g, 'text-[length:var(--text-3xl)]'],
  [/text-\[clamp\(1\.5rem,3vw,2\.2rem\)\]/g, 'text-[length:var(--text-3xl)]'],
  [/text-\[clamp\(1\.5rem,3vw,2\.25rem\)\]/g, 'text-[length:var(--text-3xl)]'],
  [/text-\[clamp\(1\.6rem,3\.2vw,2\.4rem\)\]/g, 'text-[length:var(--text-3xl)]'],
  [/text-\[clamp\(1\.7rem,3\.4vw,2\.7rem\)\]/g, 'text-[length:var(--text-3xl)]'],
  [/text-\[clamp\(1\.9rem,4\.4vw,3\.35rem\)\]/g, 'text-[length:var(--text-4xl)]'],
  [/text-\[clamp\(2rem,5vw,3\.2rem\)\]/g, 'text-[length:var(--text-4xl)]'],
];

/* Containers -> the `.shell` / `.section-y` utilities. */
const LAYOUT = [
  [
    /className="mx-auto max-w-\[1400px\] px-5 sm:px-8"/g,
    'className="shell"',
  ],
  [
    /className="mx-auto max-w-\[1400px\] px-5 pb-20 sm:px-8 lg:pb-28"/g,
    'className="shell pb-16 sm:pb-20 lg:pb-28"',
  ],
  [
    /className="mx-auto max-w-\[1400px\] px-5 pb-16 sm:px-8"/g,
    'className="shell pb-14 sm:pb-16"',
  ],
  [
    /className="mx-auto max-w-\[1400px\] px-5 py-16 sm:px-8 lg:py-24"/g,
    'className="shell section-y"',
  ],
  [
    /className="mx-auto max-w-\[1400px\] px-5 py-16 sm:px-8 lg:py-20"/g,
    'className="shell section-y"',
  ],
  [
    /className="mx-auto max-w-\[1400px\] px-5 py-16 sm:px-8"/g,
    'className="shell section-y"',
  ],
  [
    /className="mx-auto max-w-\[1400px\] px-5 pb-20 pt-14 sm:px-8 lg:pb-28"/g,
    'className="shell pb-16 pt-12 sm:pb-20 lg:pb-28"',
  ],
  [
    /className="mx-auto max-w-\[1400px\] px-5 pb-20 sm:px-8 lg:pb-28"/g,
    'className="shell pb-16 sm:pb-20 lg:pb-28"',
  ],
  // Inner content cards: tighten phone padding, keep desktop generous.
  [/px-6 py-12 sm:px-10 lg:px-12/g, 'px-5 py-10 sm:px-10 sm:py-12 lg:px-12'],
  [/px-6 py-12 sm:px-10 lg:px-14/g, 'px-5 py-10 sm:px-10 sm:py-12 lg:px-14'],
];

function walk(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else if (/\.tsx?$/.test(e.name)) acc.push(p);
  }
  return acc;
}

let changed = 0;
for (const file of walk(ROOT)) {
  const before = fs.readFileSync(file, 'utf8');
  let after = before;
  for (const [re, to] of [...TEXT, ...LAYOUT]) after = after.replace(re, to);
  if (after !== before) {
    fs.writeFileSync(file, after);
    changed++;
    console.log('restyled', file);
  }
}
console.log(`${changed} files updated`);
