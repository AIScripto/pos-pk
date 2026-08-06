import { TAX_CONFIG } from '@/config/tax';

export const chartConfig = {
  revenue: {
    label: 'Revenue',
    color: 'hsl(28 96% 57%)',
  },
  discounts: {
    label: 'Discounts',
    color: 'hsl(160 84% 39%)',
  },
  tax: {
    label: TAX_CONFIG.label,
    color: 'hsl(221 83% 53%)',
  },
  orders: {
    label: 'Orders',
    color: 'hsl(221 83% 53%)',
  },
  burgers: { label: 'Burgers', color: 'hsl(24 95% 57%)' },
  wraps: { label: 'Wraps', color: 'hsl(263 70% 62%)' },
  chicken: { label: 'Chicken', color: 'hsl(356 84% 62%)' },
  fries: { label: 'Fries', color: 'hsl(45 93% 58%)' },
  drinks: { label: 'Drinks', color: 'hsl(197 88% 46%)' },
  deals: { label: 'Deals', color: 'hsl(156 72% 44%)' },
  cash: { label: 'Cash', color: 'hsl(160 84% 39%)' },
  credit: { label: 'Credit / Card', color: 'hsl(221 83% 53%)' },
  wallet: { label: 'Wallet', color: 'hsl(263 70% 62%)' },
  pending: { label: 'Pending COD', color: 'hsl(45 93% 58%)' },
};

export const pieColors = [
  'hsl(24 95% 57%)',
  'hsl(263 70% 62%)',
  'hsl(356 84% 62%)',
  'hsl(45 93% 58%)',
  'hsl(197 88% 46%)',
  'hsl(156 72% 44%)',
];

export const getPlainCategoryLabel = (label: string) => label.replace(/^[^a-zA-Z]+/, '').trim();

export function renderCategoryShareLabel({
  cx,
  cy,
  midAngle,
  outerRadius,
  percent,
}: {
  cx?: number;
  cy?: number;
  midAngle?: number;
  outerRadius?: number;
  percent?: number;
}) {
  if (
    cx === undefined ||
    cy === undefined ||
    midAngle === undefined ||
    outerRadius === undefined ||
    percent === undefined ||
    percent < 0.04
  ) {
    return null;
  }

  const radius = outerRadius + 16;
  const radians = Math.PI / 180;
  const x = cx + radius * Math.cos(-midAngle * radians);
  const y = cy + radius * Math.sin(-midAngle * radians);

  return (
    <text
      x={x}
      y={y}
      fill="currentColor"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      className="fill-foreground text-[11px] font-semibold"
    >
      {(percent * 100).toFixed(0)}%
    </text>
  );
}
