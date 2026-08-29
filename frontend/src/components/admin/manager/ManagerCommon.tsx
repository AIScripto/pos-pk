import type { ReactNode } from 'react';

// ─── Colour palette ───────────────────────────────────────────────────────────
export const THEMES = {
  blue: {
    border:       'border-border',
    headerBg:     'bg-muted/40',
    headerBorder: 'border-b border-border',
    iconBg:       'bg-info-subtle text-primary',
    title:        'text-foreground',
    badge:        'bg-info-subtle text-primary',
    sectionDot:   'bg-primary',
  },
  orange: {
    border:       'border-border',
    headerBg:     'bg-muted/40',
    headerBorder: 'border-b border-border',
    iconBg:       'bg-warning-subtle text-warning-text',
    title:        'text-foreground',
    badge:        'bg-warning-subtle text-warning-text',
    sectionDot:   'bg-warning',
  },
  emerald: {
    border:       'border-border',
    headerBg:     'bg-muted/40',
    headerBorder: 'border-b border-border',
    iconBg:       'bg-success-subtle text-success-text',
    title:        'text-foreground',
    badge:        'bg-success-subtle text-success-text',
    sectionDot:   'bg-success',
  },
  amber: {
    border:       'border-border',
    headerBg:     'bg-muted/40',
    headerBorder: 'border-b border-border',
    iconBg:       'bg-warning-subtle text-warning-text',
    title:        'text-foreground',
    badge:        'bg-warning-subtle text-warning-text',
    sectionDot:   'bg-warning',
  },
  violet: {
    border:       'border-border',
    headerBg:     'bg-muted/40',
    headerBorder: 'border-b border-border',
    iconBg:       'bg-special-subtle text-special-text dark:bg-special/40',
    title:        'text-foreground',
    badge:        'bg-special-subtle text-special-text dark:bg-special/40',
    sectionDot:   'bg-special',
  },
  purple: {
    border:       'border-border',
    headerBg:     'bg-muted/40',
    headerBorder: 'border-b border-border',
    iconBg:       'bg-special-subtle text-special-text',
    title:        'text-foreground',
    badge:        'bg-special-subtle text-special-text',
    sectionDot:   'bg-special',
  },
  rose: {
    border:       'border-border',
    headerBg:     'bg-muted/40',
    headerBorder: 'border-b border-border',
    iconBg:       'bg-danger-subtle text-danger-text',
    title:        'text-foreground',
    badge:        'bg-danger-subtle text-danger-text',
    sectionDot:   'bg-danger',
  },
} as const;

export type Theme = keyof typeof THEMES;

export const KITCHEN_STATES = [
  { key: 'new',          label: 'New',         color: 'bg-info-subtle border-info-border dark:border-info',             badge: 'bg-info text-white' },
  { key: 'acknowledged', label: 'Acknowledged', color: 'bg-special-subtle border-special-border dark:bg-special/40', badge: 'bg-special text-white' },
  { key: 'in_progress',  label: 'Preparing',    color: 'bg-warning-subtle border-warning-border',     badge: 'bg-warning text-white' },
  { key: 'ready',        label: 'Ready',         color: 'bg-success-subtle border-success-border', badge: 'bg-success text-white' },
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
    blue:    'bg-primary/5 dark:bg-primary/10 border-primary/15 dark:border-primary/20 text-primary',
    orange:  'bg-warning/5 dark:bg-warning/10 border-warning/15 dark:border-warning/20 text-warning-text',
    emerald: 'bg-success/5 dark:bg-success/10 border-success/15 dark:border-success/20 text-success-text',
    amber:   'bg-warning/5 dark:bg-warning/10 border-warning/15 dark:border-warning/20 text-warning-text',
    violet:  'bg-special/5 dark:bg-special/10 border-special/15 dark:border-special/20 text-special-text',
    purple:  'bg-special/5 dark:bg-special/10 border-special/15 dark:border-special/20 text-special-text',
    rose:    'bg-danger/5 dark:bg-danger/10 border-danger/15 dark:border-danger/20 text-danger-text',
  };

  const bgStyle = bgColors[theme] || 'bg-secondary/5 border-border/15 text-muted-foreground';

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
          <h2 className="text-base font-bold tracking-tight text-foreground">{title}</h2>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      {right}
    </div>
  );
}
