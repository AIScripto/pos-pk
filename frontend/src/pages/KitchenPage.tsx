// =============================================================================
// KitchenPage — fullscreen Kitchen Display System (KDS)
// Accessible at /kitchen — no navbar, optimised for wall-mounted screens
// =============================================================================

import { useMemo, useState, useEffect } from 'react';
import {
  AlertTriangle,
  ChefHat,
  Clock,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  Store,
  Timer,
  Truck,
  Utensils,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { KitchenProvider, useKitchen } from '@/context/KitchenContext';
import { KitchenOrderCard, type KitchenDensity } from '@/components/kitchen/KitchenOrderCard';
import { authApi } from '@/lib/api/auth.api';
import { useTranslation } from '@/i18n';
import { cn } from '@/lib/utils';
import type { Branch } from '@/lib/api/branch.api';
import type { KitchenOrder } from '@/context/KitchenContext';

const KDS_BRANCH_KEY = 'pos-app-kds-branch';

// ── Clock ─────────────────────────────────────────────────────────────────────

function LiveClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="text-screen-subtle font-mono text-sm tabular-nums">
      {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
    </span>
  );
}

// ── Branch selector — shown for admin / email-login users with no branchId ───

interface BranchSelectorProps {
  allowedBranchIds: string[]; // empty = org admin (show all)
  onSelect: (branchId: string, branchName: string) => void;
}

function BranchSelector({ allowedBranchIds, onSelect }: BranchSelectorProps) {
  const { t } = useTranslation();
  const [branches, setBranches] = useState<{ id: string; name: string; label: string; addrCity: string }[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);

  useEffect(() => {
    authApi.branches()
      .then((data) => {
        // Filter to only the branches assigned to this user (unless org-admin with no restrictions)
        const visible = allowedBranchIds.length > 0
          ? data.filter((b) => allowedBranchIds.includes(b.id))
          : data;
        setBranches(visible);
      })
      .catch((err) => setError(err?.message ?? 'Failed to load branches'))
      .finally(() => setLoading(false));
  }, [allowedBranchIds]);

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-screen-raised text-screen-foreground gap-6 px-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-warning">
        <ChefHat className="h-9 w-9 text-screen-foreground" />
      </div>

      <div className="text-center">
        <h1 className="text-2xl font-bold">{t.kds.kdsTitle}</h1>
        <p className="text-screen-muted mt-1 text-sm">{t.auth.selectBranch}</p>
      </div>

      {loading && (
        <div className="text-screen-muted text-sm">{t.common.loading}</div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-danger/50 border border-danger px-4 py-3 text-sm text-danger">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {!loading && !error && branches.length === 0 && (
        <div className="text-screen-muted text-sm">{t.common.noData}</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 w-full max-w-2xl">
        {branches.map((b) => (
          <button
            key={b.id}
            onClick={() => onSelect(b.id, b.name)}
            className="flex items-center gap-3 p-4 rounded-xl bg-screen-raised-2 border border-screen-border hover:border-warning hover:bg-screen-border transition-all text-left group cursor-pointer"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/20 text-warning group-hover:bg-warning group-hover:text-white transition-colors shrink-0">
              <Store className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-screen-foreground">{b.name}</p>
              <p className="text-xs text-screen-muted">{b.addrCity}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Board ─────────────────────────────────────────────────────────────────────

interface BoardProps { branchName: string; onChangeBranch: () => void; }

type OrderTypeFilter = 'all' | 'dine_in' | 'takeaway' | 'delivery';
type SortMode = 'oldest' | 'newest';

function orderAgeSeconds(order: KitchenOrder): number {
  return Math.floor((Date.now() - new Date(order.placedAt).getTime()) / 1000);
}

function KitchenBoard({ branchName, onChangeBranch }: BoardProps) {
  const { t } = useTranslation();
  const { orders, connected, realtimeEnabled, error, acknowledge, start, markReady, markServed } = useKitchen();
  const [query, setQuery] = useState('');
  const [orderTypeFilter, setOrderTypeFilter] = useState<OrderTypeFilter>('all');
  const [sortMode, setSortMode] = useState<SortMode>('oldest');
  const [density, setDensity] = useState<KitchenDensity>('compact');

  const COLUMNS: { label: string; statuses: KitchenOrder['status'][]; color: string; dot: string }[] = [
    { label: t.kds.newOrders,  statuses: ['new', 'acknowledged'], color: 'border-primary',    dot: 'bg-primary'    },
    { label: t.kds.prepping,   statuses: ['in_progress'],         color: 'border-warning',   dot: 'bg-warning'   },
    { label: t.kds.ready,      statuses: ['ready'],               color: 'border-success', dot: 'bg-success' },
  ];

  const activeOrders = useMemo(
    () => orders.filter((o) => o.status !== 'served'),
    [orders]
  );

  const delayedCount = useMemo(
    () => activeOrders.filter((o) => orderAgeSeconds(o) >= 420 && o.status !== 'ready').length,
    [activeOrders]
  );

  const readyCount = useMemo(
    () => activeOrders.filter((o) => o.status === 'ready').length,
    [activeOrders]
  );

  const filteredOrders = useMemo(() => {
    const q = query.trim().toLowerCase();

    const list = activeOrders.filter((o) => {
      if (orderTypeFilter !== 'all' && o.orderType !== orderTypeFilter) return false;
      if (!q) return true;
      return (
        o.orderNumber.toLowerCase().includes(q) ||
        (o.tableName ?? '').toLowerCase().includes(q) ||
        (o.cashierName ?? '').toLowerCase().includes(q) ||
        o.items.some((i) => i.productName.toLowerCase().includes(q))
      );
    });

    return [...list].sort((a, b) => {
      const aTime = new Date(a.placedAt).getTime();
      const bTime = new Date(b.placedAt).getTime();
      return sortMode === 'oldest' ? aTime - bTime : bTime - aTime;
    });
  }, [activeOrders, orderTypeFilter, query, sortMode]);

  const filteredTotal = filteredOrders.length;

  return (
    <div className="flex h-screen flex-col bg-screen-raised text-screen-foreground overflow-hidden">

      {/* ── Header ── */}
      <header className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-screen-raised-2 to-screen-raised border-b border-screen-border/80 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/20 border border-warning/40">
            <ChefHat className="h-6 w-6 text-warning" />
          </div>
          <div>
            <h1 className="text-lg font-black leading-none" >Kitchen Display</h1>
            <button
              onClick={onChangeBranch}
              className="text-2xs text-screen-muted mt-1 hover:text-warning transition-colors font-medium"
            >
              {branchName} — change
            </button>
          </div>
        </div>

        {/* Key Metrics - Badge Format with Distinct Colors */}
        <div className="flex items-center gap-2">
          {/* Active Orders - Blue */}
          <div className="flex items-center gap-1.5 rounded-xl px-3 py-2 border-2 font-bold text-sm transition-all bg-primary/40 border-primary/60 text-primary shadow-lg shadow-primary/15">
            <span className="text-lg font-black" >
              {activeOrders.length}
            </span>
            <span className="text-xs font-bold uppercase tracking-wider">Active</span>
          </div>

          {/* Delayed - Red with Glow */}
          <div className={`flex items-center gap-1.5 rounded-xl px-3 py-2 border-2 font-bold text-sm transition-all ${
            delayedCount > 0
              ? 'bg-danger/50 border-danger/70 text-danger shadow-lg shadow-danger/25'
              : 'bg-screen-border/40 border-screen-dim/50 text-screen-muted'
          }`}>
            <span className="text-lg font-black" >
              {delayedCount}
            </span>
            <span className="text-xs font-bold uppercase tracking-wider">Delayed</span>
          </div>

          {/* Ready Orders - Emerald */}
          <div className="flex items-center gap-1.5 rounded-xl px-3 py-2 border-2 font-bold text-sm transition-all bg-success/40 border-success/60 text-success shadow-lg shadow-success/15">
            <span className="text-lg font-black" >
              {readyCount}
            </span>
            <span className="text-xs font-bold uppercase tracking-wider">Ready</span>
          </div>

          {/* Connection Status - Cyan */}
          <div className={`flex items-center gap-1.5 rounded-xl px-3 py-2 border-2 font-bold text-sm transition-all ${
            connected
              ? 'bg-info/40 border-info/60 text-info shadow-lg shadow-info/15'
              : realtimeEnabled
                ? 'bg-danger/40 border-danger/60 text-danger animate-pulse shadow-lg shadow-danger/20'
                : 'bg-screen-border/40 border-screen-dim/50 text-screen-subtle'
          }`}>
            {connected
              ? <><Wifi className="h-4 w-4" /> Live</>
              : realtimeEnabled
                ? <><WifiOff className="h-4 w-4" /> Reconnecting...</>
                : <><WifiOff className="h-4 w-4" /> Sync</>
            }
          </div>
        </div>
      </header>

      {/* ── Controls ── */}
      <div className="flex flex-col gap-3 px-4 py-3 border-b border-screen-raised-2 bg-screen-raised/60 shrink-0">
        {/* Search Bar */}
        <label className="relative flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-screen-dim" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search order, table, cashier, item..."
            className="h-9 w-full rounded-lg border border-screen-border bg-screen-raised-2 pl-8 pr-2.5 text-xs text-screen-foreground placeholder:text-screen-muted focus:border-warning focus:outline-none transition-colors"
          />
        </label>

        {/* Filter & View Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Order Type Filter */}
          <label className="inline-flex items-center gap-1.5 rounded-lg border border-screen-border bg-screen-raised-2 px-2.5 py-2 text-xs">
            <SlidersHorizontal className="h-3.5 w-3.5 text-screen-muted" />
            <select
              value={orderTypeFilter}
              onChange={(e) => setOrderTypeFilter(e.target.value as OrderTypeFilter)}
              className="bg-transparent text-screen-foreground focus:outline-none font-medium"
            >
              <option value="all" className="bg-screen-raised-2">All Types</option>
              <option value="dine_in" className="bg-screen-raised-2">Dine In</option>
              <option value="takeaway" className="bg-screen-raised-2">Takeaway</option>
              <option value="delivery" className="bg-screen-raised-2">Delivery</option>
            </select>
          </label>

          {/* Sort Mode */}
          <label className="inline-flex items-center gap-1.5 rounded-lg border border-screen-border bg-screen-raised-2 px-2.5 py-2 text-xs">
            <Clock className="h-3.5 w-3.5 text-screen-muted" />
            <select
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value as SortMode)}
              className="bg-transparent text-screen-foreground focus:outline-none font-medium"
            >
              <option value="oldest" className="bg-screen-raised-2">Oldest First</option>
              <option value="newest" className="bg-screen-raised-2">Newest First</option>
            </select>
          </label>

          <div className="flex-1" />

          {/* Density Controls - Always Visible & Prominent */}
          <div className="inline-flex items-center rounded-lg border border-warning/30 bg-warning/30 p-1">
            {(['compact', 'standard', 'comfortable'] as KitchenDensity[]).map((mode, idx) => (
              <button
                key={mode}
                onClick={() => setDensity(mode)}
                className={cn('font-condensed font-bold', `px-3 py-1.5 font-bold text-xs rounded transition-all ${
                  density === mode
                    ? 'bg-warning text-screen shadow-lg shadow-warning/30'
                    : 'text-screen-subtle hover:text-screen-foreground hover:bg-screen-border/40'
                } ${idx > 0 ? 'ml-0.5' : ''}`)}
                title={`${mode === 'compact' ? '3 items' : mode === 'standard' ? '5 items' : '8 items'} per card`}
              >
                {mode === 'compact' ? 'Compact' : mode === 'standard' ? 'Standard' : 'Large'}
              </button>
            ))}
          </div>

          {/* Count Info */}
          <div className="text-xs text-screen-muted font-medium px-2">
            {filteredTotal} / {activeOrders.length}
          </div>
        </div>
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-2 bg-danger/70 text-danger text-sm shrink-0">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ── Column headers ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 px-4 pt-3 pb-2 shrink-0">
        {COLUMNS.map((col) => {
          const count = filteredOrders.filter((o) => col.statuses.includes(o.status)).length;
          const colIcon = col.label === 'New Orders'
            ? <ShoppingBag className="h-3.5 w-3.5 text-primary" />
            : col.label === 'In Progress'
              ? <Utensils className="h-3.5 w-3.5 text-warning" />
              : <Truck className="h-3.5 w-3.5 text-success" />;
          return (
            <div key={col.label} className={`flex items-center gap-2 pb-2 border-b ${col.color}`}>
              {colIcon}
              <span className={`h-2.5 w-2.5 rounded-full ${col.dot}`} />
              <span className="text-sm font-bold text-screen-foreground">{col.label}</span>
              <span className="ml-auto text-xs font-bold text-screen-muted">{count} orders</span>
            </div>
          );
        })}
      </div>

      {/* ── Order columns ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 px-4 pb-4 flex-1 overflow-hidden">
        {COLUMNS.map((col) => {
          const colOrders = filteredOrders.filter((o) => col.statuses.includes(o.status));
          return (
            <div key={col.label} className="flex flex-col gap-2 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-700">
              {colOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-28 rounded-xl border border-dashed border-screen-border text-screen-dim">
                  <ChefHat className="h-8 w-8 mb-2" />
                  <p className="text-xs">No orders</p>
                </div>
              ) : (
                colOrders.map((order) => (
                  <KitchenOrderCard
                    key={order.id}
                    order={order}
                    density={density}
                    onAcknowledge={acknowledge}
                    onStart={start}
                    onReady={markReady}
                    onServed={markServed}
                  />
                ))
              )}
            </div>
          );
        })}
      </div>

      <div className="px-4 pb-2 text-[11px] text-screen-dim shrink-0">
        <LiveClock />
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function KitchenPage() {
  const { user, isLoggedIn } = useAuth();
  const token = localStorage.getItem('pos-app-token') ?? '';

  // branchId: from JWT (PIN login) or from localStorage (admin branch picker)
  const [selectedBranchId,   setSelectedBranchId]   = useState<string>(
    () => user?.branchId || localStorage.getItem(KDS_BRANCH_KEY) || ''
  );
  const [selectedBranchName, setSelectedBranchName] = useState<string>(
    () => localStorage.getItem(`${KDS_BRANCH_KEY}-name`) || 'Branch'
  );

  if (!isLoggedIn || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-screen-raised text-screen-foreground">
        <div className="text-center">
          <ChefHat className="h-12 w-12 mx-auto mb-4 text-warning" />
          <p className="text-lg font-semibold">Please log in to access the kitchen display.</p>
        </div>
      </div>
    );
  }

  const handleSelectBranch = (id: string, name: string) => {
    localStorage.setItem(KDS_BRANCH_KEY, id);
    localStorage.setItem(`${KDS_BRANCH_KEY}-name`, name);
    setSelectedBranchId(id);
    setSelectedBranchName(name);
  };

  const handleChangeBranch = () => {
    localStorage.removeItem(KDS_BRANCH_KEY);
    localStorage.removeItem(`${KDS_BRANCH_KEY}-name`);
    setSelectedBranchId('');
  };

  // No branch selected yet — show picker (only for email-login users without branch JWT)
  if (!selectedBranchId) {
    return (
      <BranchSelector
        allowedBranchIds={user.branchIds ?? []}
        onSelect={handleSelectBranch}
      />
    );
  }

  const displayName = user.branchId ? 'This Branch' : selectedBranchName;

  return (
    <KitchenProvider branchId={selectedBranchId} token={token}>
      <KitchenBoard branchName={displayName} onChangeBranch={handleChangeBranch} />
    </KitchenProvider>
  );
}
