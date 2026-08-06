import { Clock, GitBranch, ShoppingBag, TrendingUp, Users, Zap } from 'lucide-react';

export const CHART_COLORS = [
  '#F97316', '#3B82F6', '#10B981', '#8B5CF6',
  '#F59E0B', '#EF4444', '#06B6D4', '#84CC16',
];

export const SUGGESTION_CATEGORIES = [
  {
    key: 'revenue',
    label: 'Revenue',
    icon: TrendingUp,
    color: 'text-orange-400',
    active: 'bg-orange-500/15 border-orange-500/50 text-orange-300',
    suggestions: [
      'Total sales this month',
      'Daily revenue trend last 30 days',
      'Revenue by payment method',
      'Compare revenue this week vs last week',
    ],
  },
  {
    key: 'products',
    label: 'Products',
    icon: ShoppingBag,
    color: 'text-blue-400',
    active: 'bg-blue-500/15 border-blue-500/50 text-blue-300',
    suggestions: [
      'Top 5 products this week',
      'Best selling items this month',
      'Revenue by category last 30 days',
      'Which product has lowest sales?',
    ],
  },
  {
    key: 'hours',
    label: 'Peak Hours',
    icon: Clock,
    color: 'text-green-400',
    active: 'bg-green-500/15 border-green-500/50 text-green-300',
    suggestions: [
      'Peak trading hours today',
      'Hourly sales breakdown this week',
      'Busiest hour in last 30 days',
      'Slowest trading hours this month',
    ],
  },
  {
    key: 'branches',
    label: 'Branches',
    icon: GitBranch,
    color: 'text-purple-400',
    active: 'bg-purple-500/15 border-purple-500/50 text-purple-300',
    suggestions: [
      'Compare revenue across all branches',
      'Best performing branch this month',
      'Branch sales summary this week',
      'Average order value by branch',
    ],
  },
  {
    key: 'customers',
    label: 'Customers',
    icon: Users,
    color: 'text-pink-400',
    active: 'bg-pink-500/15 border-pink-500/50 text-pink-300',
    suggestions: [
      'Customer metrics this month',
      'Loyalty programme capture rate',
      'New customers this week',
      'Orders with loyalty card attached',
    ],
  },
  {
    key: 'orders',
    label: 'Orders',
    icon: Zap,
    color: 'text-yellow-400',
    active: 'bg-yellow-500/15 border-yellow-500/50 text-yellow-300',
    suggestions: [
      'Order type split this month',
      'Dine-in vs takeaway vs delivery',
      'Average order value this month',
      'Total orders this week',
    ],
  },
];
