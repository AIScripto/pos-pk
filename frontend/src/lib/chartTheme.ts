/**
 * Chart colours, resolved from the design tokens.
 *
 * Recharts wants concrete colour values on SVG attributes rather than utility
 * classes, which is how three chart surfaces ended up with a hard-coded dark
 * palette that stayed dark in light mode. CSS custom properties do resolve in
 * SVG attributes, so routing them through the tokens gets the charts back onto
 * the theme without giving up Recharts' API.
 */

const t = (name: string, alpha?: number) =>
  alpha === undefined ? `hsl(var(${name}))` : `hsl(var(${name}) / ${alpha})`;

export const chartTheme = {
  grid: t('--border'),
  axis: t('--muted-foreground'),
  axisLine: t('--border'),
  label: t('--muted-foreground'),
  surface: t('--popover'),
  surfaceForeground: t('--popover-foreground'),
} as const;

/**
 * Categorical series colours. Ordered so neighbouring series stay distinguishable
 * in both themes and for the most common forms of colour blindness — the sequence
 * alternates hue family rather than walking the spectrum.
 */
export const chartSeries = [
  t('--primary'),
  t('--success'),
  t('--warning'),
  t('--special'),
  t('--info'),
  t('--danger'),
] as const;

/** Tooltip container styling shared by every chart. */
export const chartTooltipStyle = {
  background: chartTheme.surface,
  border: `1px solid ${t('--border')}`,
  borderRadius: 8,
  fontSize: 12,
  color: chartTheme.surfaceForeground,
} as const;

export const chartTooltipLabelStyle = { color: chartTheme.label } as const;

/** Axis tick styling — `fill` is what Recharts applies to tick text. */
export const chartTickStyle = { fontSize: 11, fill: chartTheme.axis } as const;
