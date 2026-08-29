#!/usr/bin/env node
/**
 * Fails the build on Tailwind classes that emit no CSS.
 *
 * This codebase shipped ~50 Tailwind v4 class names (`shadow-xs`, `h-4.5`,
 * `backdrop-blur-xs`) in a v3.4 project, plus palette steps that do not exist
 * (`slate-850`, `slate-750`) and one class that exists at no version (`py-0.2`).
 * Tailwind drops unknown utilities silently, so every one of them shipped in the
 * HTML and styled nothing. Nobody noticed for months.
 *
 * Run after `vite build`: every literal class in src/ must appear as a selector
 * in the emitted stylesheet, or be a known runtime/component-layer name.
 *
 *   node scripts/check-classes.mjs
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const DIST = 'dist/assets';
const SRC = 'src';

/**
 * Utility families we check. Restricting to these keeps the scan to things that
 * are unambiguously meant to be Tailwind utilities, so a bare identifier picked
 * up from a cn() call can never be reported as a missing class.
 */
const PREFIXES = [
  'bg', 'text', 'border', 'ring', 'shadow', 'rounded', 'p', 'px', 'py', 'pt', 'pb',
  'pl', 'pr', 'm', 'mx', 'my', 'mt', 'mb', 'ml', 'mr', 'w', 'h', 'min-w', 'min-h',
  'max-w', 'max-h', 'gap', 'space-x', 'space-y', 'flex', 'grid', 'col', 'row',
  'items', 'justify', 'self', 'place', 'font', 'leading', 'tracking', 'opacity',
  'z', 'top', 'bottom', 'left', 'right', 'inset', 'translate', 'rotate', 'scale',
  'blur', 'backdrop-blur', 'backdrop-filter', 'divide', 'outline', 'fill', 'stroke',
  'from', 'to', 'via', 'animate', 'transition', 'duration', 'delay', 'ease',
  'cursor', 'select', 'overflow', 'object', 'aspect', 'order', 'basis', 'decoration',
  'underline-offset', 'whitespace', 'break', 'line-clamp', 'placeholder', 'caret',
  'accent', 'origin', 'touch', 'pointer-events', 'resize', 'align', 'indent',
];
const PREFIX_RE = new RegExp('^-?(' + PREFIXES.map((p) => p.replace('-', '\\-')).join('|') + ')-');

/** Classes that legitimately never reach the stylesheet. */
const ALLOW = [
  /^(dark|light)$/,                       // theme root classes, toggled at runtime
  /^(group|peer)(\/[\w-]+)?$/,            // variant markers, produce no rules
  /^(sr-only|not-sr-only)$/,
  /^(rtl|ltr)$/,
  /^js-/, /^no-print$/, /^print-only$/,
  /^(swiper|recharts|embla|cmdk|vaul)-/,  // third-party runtime classes
  /^data-\[/,                             // arbitrary variant fragments
];

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (['.tsx', '.ts'].includes(extname(p))) out.push(p);
  }
  return out;
}

const cssFile = readdirSync(DIST).find((f) => f.endsWith('.css'));
if (!cssFile) {
  console.error('No stylesheet in %s — run `npm run build` first.', DIST);
  process.exit(2);
}
const css = readFileSync(join(DIST, cssFile), 'utf8');

// Every class selector the stylesheet defines, with CSS escapes removed.
const emitted = new Set(
  [...css.matchAll(/\.((?:[\w-]|\\.)+)/g)].map((m) => m[1].replace(/\\/g, '')),
);

// Literal class tokens in source: only from className/class attributes and
// cn()/clsx() arguments, so we do not flag ordinary strings.
const CLASS_CTX = /(?:className|class)\s*=\s*(?:"([^"]*)"|'([^']*)'|\{`([^`]*)`\}|\{cn\(([\s\S]*?)\)\}|\{clsx\(([\s\S]*?)\)\})/g;
const STRING_IN = /["'`]([^"'`]*)["'`]/g;

const missing = new Map();
for (const file of walk(SRC)) {
  const src = readFileSync(file, 'utf8');
  for (const m of src.matchAll(CLASS_CTX)) {
    const chunks = [];
    if (m[1] !== undefined) chunks.push(m[1]);
    if (m[2] !== undefined) chunks.push(m[2]);
    if (m[3] !== undefined) chunks.push(m[3]);
    for (const args of [m[4], m[5]]) {
      if (!args) continue;
      for (const s of args.matchAll(STRING_IN)) chunks.push(s[1]);
    }
    for (const chunk of chunks) {
      for (const raw0 of chunk.split(/\s+/)) {
        // cn() arguments can leave quote/brace debris on the ends.
        const raw = raw0.replace(/^[^\w-]+|[^\w\/.%-]+$/g, '');
        // Arbitrary values and arbitrary variants (`[&_.x]:stroke-border`) carry
        // their own escaping rules; leave them to Tailwind.
        if (!raw || /[$[\]()&'"`]/.test(raw0)) continue;
        // Tailwind emits the full variant-prefixed class as one escaped
        // selector (`.dark\\:hover\\:bg-danger\\/25:hover`), so the whole class
        // is what has to be present; the bare base is only a fallback for
        // utilities a plugin registers without variants.
        const base = raw.replace(/^(?:[\w-]+:)+/, '');
        if (!base || !/^-?[a-z]/.test(base)) continue;
        if (ALLOW.some((re) => re.test(base))) continue;
        if (!PREFIX_RE.test(base)) continue;   // not a utility we can judge
        if (emitted.has(raw) || emitted.has(base)) continue;
        if (!missing.has(raw)) missing.set(raw, new Set());
        missing.get(raw).add(file);
      }
    }
  }
}

if (missing.size === 0) {
  console.log('✓ every class in %s emits CSS', SRC);
  process.exit(0);
}

console.error('\n%d class name(s) emit no CSS:\n', missing.size);
for (const [cls, files] of [...missing].sort()) {
  console.error('  %s\n      %s', cls, [...files].slice(0, 4).join('\n      '));
}
console.error('\nThese ship in the HTML and style nothing. Fix the name, or add the');
console.error('utility to tailwind.config.ts if it is meant to exist.\n');
process.exit(1);
