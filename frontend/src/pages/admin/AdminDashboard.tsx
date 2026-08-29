// =============================================================================
// AdminDashboard — overview and key metrics
// =============================================================================

import { useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { branchApi } from '@/lib/api/branch.api';
import { adminProductApi } from '@/lib/api/admin-product.api';
import { userApi } from '@/lib/api/user.api';
import { invoiceApi } from '@/lib/api/invoice.api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  BarChart3, Package, Users, MapPin, TrendingUp, Calendar, ArrowRight,
  TrendingDown, ArrowUpRight, ArrowDownRight, Clock, Sparkles, ShieldAlert,
  Terminal, ShoppingBag, ChevronRight, CheckCircle2
} from 'lucide-react';
import { formatCurrency } from '@/utils/pos';
import { chartSeries } from '@/lib/chartTheme';

export default function AdminDashboard() {
  const { user } = useAuth();
  
  const todayDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const { data: branches = [] } = useQuery({
    queryKey: ['admin-branches-count'],
    queryFn: () => branchApi.list().catch(() => []),
  });

  const { data: products = [] } = useQuery({
    queryKey: ['admin-products-count'],
    queryFn: () => adminProductApi.list().catch(() => []),
  });

  const { data: users = [] } = useQuery({
    queryKey: ['admin-users-count'],
    queryFn: () => userApi.list().catch(() => []),
  });

  const { data: invoices = [] } = useQuery({
    queryKey: ['admin-invoices-dashboard'],
    queryFn: () => invoiceApi.list().catch(() => []),
  });

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayInvoices = invoices.filter(inv => new Date(inv.date).toISOString().slice(0, 10) === todayStr);
  const todayRevenue = todayInvoices.reduce((acc, inv) => acc + (inv.grandTotalPaisa / 100), 0);

  // Dynamic Weekly Sales calculation (Mon - Sun) from live invoices
  const weeklySales = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const salesByDay = [0, 0, 0, 0, 0, 0, 0];

    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sun, 1 = Mon...
    const diffToMon = (currentDay === 0 ? 6 : currentDay - 1);
    const monday = new Date(now);
    monday.setDate(now.getDate() - diffToMon);
    monday.setHours(0, 0, 0, 0);

    invoices.forEach((inv) => {
      const invDate = new Date(inv.date || inv.createdAt);
      if (invDate >= monday) {
        const dayIdx = (invDate.getDay() === 0 ? 6 : invDate.getDay() - 1);
        salesByDay[dayIdx] += (inv.grandTotalPaisa / 100);
      }
    });

    const totalRevenue = salesByDay.reduce((a, b) => a + b, 0);
    const avgRevenue = totalRevenue > 0 ? totalRevenue / 7 : 0;
    const maxSale = Math.max(...salesByDay, 1000); // Scale relative to max sale or min 1000

    // Map sales to SVG Y coordinates (140 = 0 revenue, 35 = max revenue)
    const points = salesByDay.map((val, i) => {
      const x = 10 + i * 80;
      const y = 140 - (val / maxSale) * 105;
      return { x, y, val, day: days[i] };
    });

    const pathD = points.reduce((acc, p, idx) => `${acc} ${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y.toFixed(1)}`, '');
    const areaD = `${pathD} L 490 140 L 10 140 Z`;

    return { salesByDay, avgRevenue, points, pathD, areaD, totalRevenue };
  }, [invoices]);

  const activeBranchCount = branches.filter(b => b.isActive).length;
  const activeUserCount = users.filter(u => u.isActive).length;

  const stats = [
    {
      label: 'Total Branches',
      value: String(branches.length),
      change: `${activeBranchCount} active`,
      isPositive: true,
      icon: <MapPin className="w-5 h-5 text-primary" />,
      iconBg: 'bg-info-subtle border-info-border/50',
    },
    {
      label: 'Total Products',
      value: String(products.length),
      change: `${products.filter(p => p.isActive).length} active`,
      isPositive: true,
      icon: <Package className="w-5 h-5 text-success-text" />,
      iconBg: 'bg-success-subtle border-success/50',
    },
    {
      label: 'Active Users',
      value: String(users.length),
      change: `${activeUserCount} active`,
      isPositive: true,
      icon: <Users className="w-5 h-5 text-special-text" />,
      iconBg: 'bg-special-subtle dark:bg-special/40 border-special/50',
    },
    {
      label: "Today's Revenue",
      value: formatCurrency(todayRevenue),
      change: `${todayInvoices.length} orders today`,
      isPositive: true,
      icon: <TrendingUp className="w-5 h-5 text-warning-text" />,
      iconBg: 'bg-warning-subtle border-warning/50',
    },
  ];

  const quickActions = [
    {
      label: 'Manage Products',
      desc: 'Update catalog items, categories, deals and menus.',
      href: '/admin/products',
      icon: <Package className="w-5 h-5" />,
      badge: `${products.length} items`,
      theme: 'blue'
    },
    {
      label: 'Manage Users',
      desc: 'Control system roles, back-office access & permissions.',
      href: '/admin/users',
      icon: <Users className="w-5 h-5" />,
      badge: `${users.length} active`,
      theme: 'purple'
    },
    {
      label: 'Manage Branches',
      desc: 'Configure physical locations, active registers & local taxes.',
      href: '/admin/branches',
      icon: <MapPin className="w-5 h-5" />,
      badge: `${branches.length} sites`,
      theme: 'emerald'
    },
    {
      label: 'System Settings',
      desc: 'Update business details, POS config, and general rules.',
      href: '/admin/config',
      icon: <BarChart3 className="w-5 h-5" />,
      badge: 'Setup',
      theme: 'amber'
    },
  ];

  const recentInvoices = invoices.slice(0, 4).map((inv) => ({
    id: inv.invoiceNumber || (typeof inv.id === 'string' ? inv.id.slice(0, 8) : 'N/A'),
    time: new Date(inv.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    items: `${inv.items?.length ?? 1} items`,
    amount: inv.grandTotalPaisa / 100,
  }));

  return (
    <div className="space-y-8">
      {/* ─── Modern Premium Banner ────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-xl border border-border bg-gradient-to-br from-muted via-muted to-muted p-6 text-white shadow-xl">
        {/* Decorative subtle glows */}
        <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -left-16 -bottom-16 h-40 w-40 rounded-full bg-success/5 blur-3xl" />

        <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-warning animate-pulse" />
              <span className="text-xs font-black uppercase tracking-widest text-muted-foreground/70">Back Office Control Panel</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground/70">
              Welcome back, <span className="font-semibold text-foreground">{user?.name}</span> · All local terminals are operational.
            </p>
          </div>
          
          <div className="flex items-center gap-3 self-start rounded-lg border border-border bg-muted/60 px-4 py-2 text-xs md:self-auto">
            <Calendar className="h-4 w-4 text-primary" />
            <div className="text-right">
              <p className="font-bold text-foreground">{todayDate}</p>
              <p className="text-2xs text-muted-foreground/70">System Time: Online</p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Premium Stats Grid ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="group rounded-xl border border-border bg-white p-5 shadow-sm dark:bg-background/20 transition-all hover:scale-[1.02] hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">{stat.label}</p>
                <h3 className="text-3xl font-semibold tracking-tight text-foreground">{stat.value}</h3>
              </div>
              <div className={`rounded-lg border p-2.5 shadow-sm ${stat.iconBg}`}>
                {stat.icon}
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs">
              {stat.isPositive ? (
                <span className="flex items-center font-semibold text-success-text">
                  <ArrowUpRight className="mr-0.5 h-3.5 w-3.5" />
                  {stat.change}
                </span>
              ) : (
                <span className="flex items-center font-semibold text-danger-text">
                  <ArrowDownRight className="mr-0.5 h-3.5 w-3.5" />
                  {stat.change}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ─── Graph and Recent Activity Grid ────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Sales Overview Area Chart (8 Columns) */}
        <Card className="lg:col-span-8 border-border dark:bg-background/10 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border py-4">
            <CardTitle className="flex items-center gap-2 text-base font-bold text-foreground">
              <TrendingUp className="h-4.5 w-4.5 text-primary" />
              Sales Overview
            </CardTitle>
            <span className="rounded-full bg-info-subtle border border-info-border/50 px-2.5 py-0.5 text-2xs font-bold uppercase tracking-wider text-primary">
              Weekly sales graph
            </span>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground/70">Average Daily Revenue</p>
                  <p className="text-xl font-semibold text-foreground">{formatCurrency(weeklySales.avgRevenue)}</p>
                </div>
                <div className="flex gap-4 text-xs">
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-primary" />Sales</span>
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-success" />Expected</span>
                </div>
              </div>

              {/* Beautiful Custom SVG Line/Area Graph */}
              <div className="relative w-full overflow-hidden pt-4">
                <svg viewBox="0 0 500 180" className="w-full overflow-visible">
                  <defs>
                    <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={chartSeries[0]} stopOpacity="0.25" />
                      <stop offset="100%" stopColor={chartSeries[0]} stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Gridlines */}
                  <line x1="0" y1="140" x2="500" y2="140" stroke="currentColor" strokeDasharray="3,3" className="text-foreground dark:text-foreground" strokeWidth="1" />
                  <line x1="0" y1="90" x2="500" y2="90" stroke="currentColor" strokeDasharray="3,3" className="text-foreground dark:text-foreground" strokeWidth="1" />
                  <line x1="0" y1="40" x2="500" y2="40" stroke="currentColor" strokeDasharray="3,3" className="text-foreground dark:text-foreground" strokeWidth="1" />

                  {/* The Gradient Area under curve */}
                  <path
                    d={weeklySales.areaD}
                    fill="url(#salesGrad)"
                  />

                  {/* Expected sales dotted line */}
                  <path
                    d="M 10 135 Q 250 85 490 55"
                    fill="none"
                    stroke={chartSeries[1]}
                    strokeWidth="1.5"
                    strokeDasharray="4,4"
                  />

                  {/* Actual sales smooth line */}
                  <path
                    d={weeklySales.pathD}
                    fill="none"
                    stroke={chartSeries[0]}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Dynamic Points for Days with Sales */}
                  {weeklySales.points.map((p, idx) => (
                    p.val > 0 && (
                      <circle
                        key={idx}
                        cx={p.x}
                        cy={p.y}
                        r="4.5"
                        fill={chartSeries[0]}
                        stroke="white"
                        strokeWidth="1.5"
                      />
                    )
                  ))}

                  {/* Day Labels */}
                  {weeklySales.points.map((p, idx) => (
                    <text key={idx} x={p.x - 10} y="160" fill="currentColor" className="text-2xs fill-muted-foreground font-medium">
                      {p.day}
                    </text>
                  ))}
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders (4 Columns) */}
        <Card className="lg:col-span-4 border-border dark:bg-background/10 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border py-4">
            <CardTitle className="flex items-center gap-2 text-base font-bold text-foreground">
              <ShoppingBag className="h-4.5 w-4.5 text-success" />
              Recent Activity
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground/70" />
          </CardHeader>
          <CardContent className="p-0">
            {recentInvoices.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground/70 space-y-2">
                <ShoppingBag className="w-8 h-8 mx-auto text-muted-foreground stroke-[1.5]" />
                <p className="text-sm font-medium">No sales recorded yet</p>
                <p className="text-xs text-muted-foreground">Live order activity will appear here as transactions occur.</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {recentInvoices.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                    <div className="space-y-0.5">
                      <p className="text-sm font-semibold text-foreground">Order #{order.id}</p>
                      <p className="text-xs text-muted-foreground/70">{order.time} · {order.items}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-foreground">{formatCurrency(order.amount)}</p>
                      <p className="mt-0.5 inline-flex rounded-full px-2 py-0.5 text-2xs font-bold uppercase tracking-wider bg-success-subtle text-success-text">
                        Completed
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="border-t border-border p-3 text-center">
              <button className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary">
                View all order records
                <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ─── Premium Quick Actions Card ────────────────────────────────────────── */}
      <Card className="border-border dark:bg-background/10 shadow-sm">
        <CardHeader className="border-b border-border py-4">
          <CardTitle className="text-base font-bold text-foreground">Quick Access Commands</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action) => {
              const borderHoverCls =
                action.theme === 'blue'    ? 'hover:border-primary/50 hover:bg-info-subtle/40' :
                action.theme === 'purple'  ? 'hover:border-special/50 hover:bg-special-subtle/40' :
                action.theme === 'emerald' ? 'hover:border-success/50 hover:bg-success-subtle/40' :
                                             'hover:border-warning/50 hover:bg-warning-subtle/40';

              const iconCls =
                action.theme === 'blue'    ? 'text-primary' :
                action.theme === 'purple'  ? 'text-special' :
                action.theme === 'emerald' ? 'text-success' :
                                             'text-warning';

              return (
                <a
                  key={action.label}
                  href={action.href}
                  className={`group rounded-xl border border-border bg-white p-5 dark:bg-background/20 transition-all hover:scale-[1.03] hover:shadow-md ${borderHoverCls}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={`rounded-lg p-2 bg-muted/40 ${iconCls}`}>
                      {action.icon}
                    </div>
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-2xs font-bold text-muted-foreground">
                      {action.badge}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                    {action.label}
                  </h4>
                  <p className="mt-1 text-xs text-muted-foreground/70 leading-normal">{action.desc}</p>
                </a>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
