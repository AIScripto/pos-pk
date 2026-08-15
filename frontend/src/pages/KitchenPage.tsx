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
    <span className="text-slate-300 font-mono text-sm tabular-nums">
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
    <div className="flex h-screen flex-col items-center justify-center bg-slate-900 text-white gap-6 px-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500">
        <ChefHat className="h-9 w-9 text-white" />
      </div>

      <div className="text-center">
        <h1 className="text-2xl font-bold">{t.kds.kdsTitle}</h1>
        <p className="text-slate-400 mt-1 text-sm">{t.auth.selectBranch}</p>
      </div>

      {loading && (
        <div className="text-slate-400 text-sm">{t.common.loading}</div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-900/50 border border-red-700 px-4 py-3 text-sm text-red-300">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {!loading && !error && branches.length === 0 && (
        <div className="text-slate-400 text-sm">{t.common.noData}</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 w-full max-w-2xl">
        {branches.map((b) => (
          <button
            key={b.id}
            onClick={() => onSelect(b.id, b.name)}
            className="flex items-center gap-3 p-4 rounded-xl bg-slate-800 border border-slate-700 hover:border-orange-500 hover:bg-slate-750 transition-all text-left group cursor-pointer"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/20 text-orange-400 group-hover:bg-orange-500 group-hover:text-white transition-colors shrink-0">
              <Store className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-white">{b.name}</p>
              <p className="text-xs text-slate-400">{b.addrCity}</p>
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
    { label: t.kds.newOrders,  statuses: ['new', 'acknowledged'], color: 'border-blue-400',    dot: 'bg-blue-500'    },
    { label: t.kds.prepping,   statuses: ['in_progress'],         color: 'border-amber-400',   dot: 'bg-amber-500'   },
    { label: t.kds.ready,      statuses: ['ready'],               color: 'border-emerald-400', dot: 'bg-emerald-500' },
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
    <div className="flex h-screen flex-col bg-slate-900 text-white overflow-hidden">

      {/* ── Header ── */}
      <header className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700/80 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/20 border border-orange-500/40">
            <ChefHat className="h-6 w-6 text-orange-400" />
          </div>
          <div>
            <h1 className="text-lg font-black leading-none" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>Kitchen Display</h1>
            <button
              onClick={onChangeBranch}
              className="text-[10px] text-slate-400 mt-1 hover:text-orange-400 transition-colors font-medium"
            >
              {branchName} — change
            </button>
          </div>
        </div>

        {/* Key Metrics - Badge Format with Distinct Colors */}
        <div className="flex items-center gap-2">
          {/* Active Orders - Blue */}
          <div className="flex items-center gap-1.5 rounded-xl px-3 py-2 border-2 font-bold text-sm transition-all bg-blue-950/40 border-blue-500/60 text-blue-300 shadow-lg shadow-blue-500/15">
            <span className="text-lg font-black" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
              {activeOrders.length}
            </span>
            <span className="text-xs font-700 uppercase tracking-wider">Active</span>
          </div>

          {/* Delayed - Red with Glow */}
          <div className={`flex items-center gap-1.5 rounded-xl px-3 py-2 border-2 font-bold text-sm transition-all ${
            delayedCount > 0
              ? 'bg-red-950/50 border-red-500/70 text-red-300 shadow-lg shadow-red-500/25'
              : 'bg-slate-700/40 border-slate-600/50 text-slate-400'
          }`}>
            <span className="text-lg font-black" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
              {delayedCount}
            </span>
            <span className="text-xs font-700 uppercase tracking-wider">Delayed</span>
          </div>

          {/* Ready Orders - Emerald */}
          <div className="flex items-center gap-1.5 rounded-xl px-3 py-2 border-2 font-bold text-sm transition-all bg-emerald-950/40 border-emerald-500/60 text-emerald-300 shadow-lg shadow-emerald-500/15">
            <span className="text-lg font-black" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
              {readyCount}
            </span>
            <span className="text-xs font-700 uppercase tracking-wider">Ready</span>
          </div>

          {/* Connection Status - Cyan */}
          <div className={`flex items-center gap-1.5 rounded-xl px-3 py-2 border-2 font-bold text-sm transition-all ${
            connected
              ? 'bg-cyan-950/40 border-cyan-500/60 text-cyan-300 shadow-lg shadow-cyan-500/15'
              : realtimeEnabled
                ? 'bg-red-950/40 border-red-500/60 text-red-400 animate-pulse shadow-lg shadow-red-500/20'
                : 'bg-slate-700/40 border-slate-600/50 text-slate-300'
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
      <div className="flex flex-col gap-3 px-4 py-3 border-b border-slate-800 bg-slate-900/60 shrink-0">
        {/* Search Bar */}
        <label className="relative flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search order, table, cashier, item..."
            className="h-9 w-full rounded-lg border border-slate-700 bg-slate-800 pl-8 pr-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:border-orange-400 focus:outline-none transition-colors"
          />
        </label>

        {/* Filter & View Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Order Type Filter */}
          <label className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-2 text-xs">
            <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={orderTypeFilter}
              onChange={(e) => setOrderTypeFilter(e.target.value as OrderTypeFilter)}
              className="bg-transparent text-slate-100 focus:outline-none font-medium"
            >
              <option value="all" className="bg-slate-800">All Types</option>
              <option value="dine_in" className="bg-slate-800">Dine In</option>
              <option value="takeaway" className="bg-slate-800">Takeaway</option>
              <option value="delivery" className="bg-slate-800">Delivery</option>
            </select>
          </label>

          {/* Sort Mode */}
          <label className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-2 text-xs">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value as SortMode)}
              className="bg-transparent text-slate-100 focus:outline-none font-medium"
            >
              <option value="oldest" className="bg-slate-800">Oldest First</option>
              <option value="newest" className="bg-slate-800">Newest First</option>
            </select>
          </label>

          <div className="flex-1" />

          {/* Density Controls - Always Visible & Prominent */}
          <div className="inline-flex items-center rounded-lg border border-amber-500/30 bg-amber-950/30 p-1">
            {(['compact', 'standard', 'comfortable'] as KitchenDensity[]).map((mode, idx) => (
              <button
                key={mode}
                onClick={() => setDensity(mode)}
                className={`px-3 py-1.5 font-bold text-xs rounded transition-all ${
                  density === mode
                    ? 'bg-amber-500 text-slate-900 shadow-lg shadow-amber-500/30'
                    : 'text-slate-300 hover:text-slate-100 hover:bg-slate-700/40'
                } ${idx > 0 ? 'ml-0.5' : ''}`}
                style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700 }}
                title={`${mode === 'compact' ? '3 items' : mode === 'standard' ? '5 items' : '8 items'} per card`}
              >
                {mode === 'compact' ? 'Compact' : mode === 'standard' ? 'Standard' : 'Large'}
              </button>
            ))}
          </div>

          {/* Count Info */}
          <div className="text-xs text-slate-400 font-medium px-2">
            {filteredTotal} / {activeOrders.length}
          </div>
        </div>
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-2 bg-red-900/70 text-red-200 text-sm shrink-0">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ── Column headers ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 px-4 pt-3 pb-2 shrink-0">
        {COLUMNS.map((col) => {
          const count = filteredOrders.filter((o) => col.statuses.includes(o.status)).length;
          const colIcon = col.label === 'New Orders'
            ? <ShoppingBag className="h-3.5 w-3.5 text-blue-400" />
            : col.label === 'In Progress'
              ? <Utensils className="h-3.5 w-3.5 text-amber-400" />
              : <Truck className="h-3.5 w-3.5 text-emerald-400" />;
          return (
            <div key={col.label} className={`flex items-center gap-2 pb-2 border-b ${col.color}`}>
              {colIcon}
              <span className={`h-2.5 w-2.5 rounded-full ${col.dot}`} />
              <span className="text-sm font-bold text-slate-200">{col.label}</span>
              <span className="ml-auto text-xs font-bold text-slate-400">{count} orders</span>
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
                <div className="flex flex-col items-center justify-center h-28 rounded-xl border border-dashed border-slate-700 text-slate-600">
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

      <div className="px-4 pb-2 text-[11px] text-slate-500 shrink-0">
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
      <div className="flex h-screen items-center justify-center bg-slate-900 text-white">
        <div className="text-center">
          <ChefHat className="h-12 w-12 mx-auto mb-4 text-orange-500" />
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
