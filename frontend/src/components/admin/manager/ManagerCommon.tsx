import type { ReactNode } from 'react';

// ─── Colour palette ───────────────────────────────────────────────────────────
export const THEMES = {
  blue: {
    border:       'border-slate-200 dark:border-zinc-800/80',
    headerBg:     'bg-slate-50/40 dark:bg-zinc-900/30',
    headerBorder: 'border-b border-slate-100 dark:border-zinc-900',
    iconBg:       'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400',
    title:        'text-slate-900 dark:text-slate-100',
    badge:        'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400',
    sectionDot:   'bg-blue-500',
  },
  orange: {
    border:       'border-slate-200 dark:border-zinc-800/80',
    headerBg:     'bg-slate-50/40 dark:bg-zinc-900/30',
    headerBorder: 'border-b border-slate-100 dark:border-zinc-900',
    iconBg:       'bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400',
    title:        'text-slate-900 dark:text-slate-100',
    badge:        'bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400',
    sectionDot:   'bg-orange-500',
  },
  emerald: {
    border:       'border-slate-200 dark:border-zinc-800/80',
    headerBg:     'bg-slate-50/40 dark:bg-zinc-900/30',
    headerBorder: 'border-b border-slate-100 dark:border-zinc-900',
    iconBg:       'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
    title:        'text-slate-900 dark:text-slate-100',
    badge:        'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
    sectionDot:   'bg-emerald-500',
  },
  amber: {
    border:       'border-slate-200 dark:border-zinc-800/80',
    headerBg:     'bg-slate-50/40 dark:bg-zinc-900/30',
    headerBorder: 'border-b border-slate-100 dark:border-zinc-900',
    iconBg:       'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400',
    title:        'text-slate-900 dark:text-slate-100',
    badge:        'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400',
    sectionDot:   'bg-amber-500',
  },
  violet: {
    border:       'border-slate-200 dark:border-zinc-800/80',
    headerBg:     'bg-slate-50/40 dark:bg-zinc-900/30',
    headerBorder: 'border-b border-slate-100 dark:border-zinc-900',
    iconBg:       'bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400',
    title:        'text-slate-900 dark:text-slate-100',
    badge:        'bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400',
    sectionDot:   'bg-violet-500',
  },
  purple: {
    border:       'border-slate-200 dark:border-zinc-800/80',
    headerBg:     'bg-slate-50/40 dark:bg-zinc-900/30',
    headerBorder: 'border-b border-slate-100 dark:border-zinc-900',
    iconBg:       'bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400',
    title:        'text-slate-900 dark:text-slate-100',
    badge:        'bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400',
    sectionDot:   'bg-purple-500',
  },
  rose: {
    border:       'border-slate-200 dark:border-zinc-800/80',
    headerBg:     'bg-slate-50/40 dark:bg-zinc-900/30',
    headerBorder: 'border-b border-slate-100 dark:border-zinc-900',
    iconBg:       'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400',
    title:        'text-slate-900 dark:text-slate-100',
    badge:        'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400',
    sectionDot:   'bg-rose-500',
  },
} as const;

export type Theme = keyof typeof THEMES;

export const KITCHEN_STATES = [
  { key: 'new',          label: 'New',         color: 'bg-sky-50 border-sky-200 dark:bg-sky-950/40 dark:border-sky-800',             badge: 'bg-sky-500 text-white' },
  { key: 'acknowledged', label: 'Acknowledged', color: 'bg-violet-50 border-violet-200 dark:bg-violet-950/40 dark:border-violet-800', badge: 'bg-violet-500 text-white' },
  { key: 'in_progress',  label: 'Preparing',    color: 'bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:border-amber-800',     badge: 'bg-amber-500 text-white' },
  { key: 'ready',        label: 'Ready',         color: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800', badge: 'bg-emerald-500 text-white' },
] as const;

// ─── Formatters ───────────────────────────────────────────────────────────────
export function formatDate(val: string): string {
  try {
    return new Date(val).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return val;
  }
}

export function formatTime(val?: string | null): string {
  if (!val) return '—';
  try {
    return new Date(val).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return val;
  }
}

// ─── Section label with colour dot ────────────────────────────────────────────
export function SectionHeader({ icon, label, theme }: { icon: ReactNode; label: string; theme: Theme }) {
  const t = THEMES[theme];

  const bgColors = {
    blue:    'bg-blue-500/5 dark:bg-blue-500/10 border-blue-500/15 dark:border-blue-500/20 text-blue-600 dark:text-blue-400',
    orange:  'bg-orange-500/5 dark:bg-orange-500/10 border-orange-500/15 dark:border-orange-500/20 text-orange-600 dark:text-orange-400',
    emerald: 'bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/15 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400',
    amber:   'bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/15 dark:border-amber-500/20 text-amber-600 dark:text-amber-400',
    violet:  'bg-violet-500/5 dark:bg-violet-500/10 border-violet-500/15 dark:border-violet-500/20 text-violet-600 dark:text-violet-400',
    purple:  'bg-purple-500/5 dark:bg-purple-500/10 border-purple-500/15 dark:border-purple-500/20 text-purple-600 dark:text-purple-400',
    rose:    'bg-rose-500/5 dark:bg-rose-500/10 border-rose-500/15 dark:border-rose-500/20 text-rose-600 dark:text-rose-400',
  };

  const bgStyle = bgColors[theme] || 'bg-slate-500/5 border-slate-500/15 text-slate-500';

  return (
    <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border ${bgStyle} shadow-sm backdrop-blur-sm`}>
      <span className={`h-2 w-2 shrink-0 rounded-full ${t.sectionDot}`} />
      <span className="shrink-0">{icon}</span>
      <h3 className="font-sans font-black text-xs uppercase tracking-[0.18em]">
        {label}
      </h3>
    </div>
  );
}

// ─── Coloured panel header wrapper ────────────────────────────────────────────
export function PanelHeader({
  theme, icon, title, subtitle, right,
}: {
  theme: Theme;
  icon: ReactNode;
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  const t = THEMES[theme];
  return (
    <div className={`flex items-center justify-between px-5 py-4 ${t.headerBg} ${t.headerBorder}`}>
      <div className="flex items-center gap-3">
        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${t.iconBg}`}>
          {icon}
        </div>
        <div>
          <h2 className="text-base font-bold tracking-tight text-slate-900 dark:text-white">{title}</h2>
          {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>}
        </div>
      </div>
      {right}
    </div>
  );
}
