// =============================================================================
// CustomerDisplayPage — fullscreen lobby board showing order statuses
// Updates in real-time via KitchenContext (Socket.IO + REST fallback)
// =============================================================================

import { useMemo, useState, useEffect, useRef } from 'react';
import { 
  ChefHat, 
  Clock, 
  Volume2, 
  VolumeX, 
  MonitorPlay, 
  Flame, 
  Sparkles, 
  Pizza, 
  Coffee, 
  BellRing, 
  UtensilsCrossed, 
  CookingPot 
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { KitchenProvider, useKitchen } from '@/context/KitchenContext';
import { branchApi } from '@/lib/api/branch.api';
import { useTranslation } from '@/i18n';
import type { Branch } from '@/lib/api/branch.api';

const KDS_BRANCH_KEY = 'pos-app-kds-branch';

// ── Voice announcement helper ───────────────────────────────────────────────
function announceOrderReady(orderNumber: string) {
  if (!('speechSynthesis' in window)) return;
  const cleanNum = orderNumber.replace(/^#0*/, '');
  const utterance = new SpeechSynthesisUtterance(`Order number ${cleanNum} is ready for pick up.`);
  utterance.rate = 0.9;
  utterance.pitch = 1.0;
  window.speechSynthesis.speak(utterance);
}

// ── Clock ─────────────────────────────────────────────────────────────────────
function LiveClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="font-mono text-xl text-screen-muted font-bold tabular-nums">
      {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
    </span>
  );
}

// ── Branch Selector ───────────────────────────────────────────────────────────
interface BranchSelectorProps {
  allowedBranchIds: string[];
  onSelect: (branchId: string, branchName: string) => void;
}

function BranchSelector({ allowedBranchIds, onSelect }: BranchSelectorProps) {
  const { t } = useTranslation();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    branchApi.list()
      .then((data) => {
        const active = data.filter((b) => b.isActive);
        const visible = allowedBranchIds.length > 0
          ? active.filter((b) => allowedBranchIds.includes(b.id))
          : active;
        setBranches(visible);
      })
      .catch((err) => setError(err?.message ?? 'Failed to load branches'))
      .finally(() => setLoading(false));
  }, [allowedBranchIds]);

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-screen text-screen-foreground gap-6 px-4">
      <div className="text-center space-y-2 max-w-md">
        <MonitorPlay className="h-14 w-14 mx-auto text-primary animate-pulse" />
        <h2 className="text-2xl font-black tracking-tight">{t.customerDisplay.welcome}</h2>
        <p className="text-screen-muted text-sm">
          {t.auth.selectBranch}
        </p>
      </div>

      {loading ? (
        <div className="text-screen-muted text-sm animate-pulse">{t.common.loading}</div>
      ) : error ? (
        <div className="text-danger text-sm">{error}</div>
      ) : (
        <div className="grid w-full max-w-md gap-3">
          {branches.map((b) => (
            <button
              key={b.id}
              onClick={() => onSelect(b.id, b.name)}
              className="flex items-center justify-between p-4 rounded-xl border border-screen-raised-2 bg-screen-raised/60 hover:bg-screen-border hover:border-screen-muted/60 transition duration-200 text-left font-semibold text-lg cursor-pointer"
            >
              <span>{b.name}</span>
              <span className="text-xs text-screen-dim font-mono">ID: {b.id}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Customer Board Board ───────────────────────────────────────────────────────
function CustomerBoard({ branchName, onChangeBranch }: { branchName: string; onChangeBranch: () => void }) {
  const { t } = useTranslation();
  const { orders } = useKitchen();
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const prevReadyOrders = useRef<Set<string>>(new Set());

  // Filter orders
  const preparingOrders = useMemo(() => {
    return orders.filter((o) => ['new', 'acknowledged', 'in_progress'].includes(o.status));
  }, [orders]);

  const readyOrders = useMemo(() => {
    return orders.filter((o) => o.status === 'ready');
  }, [orders]);

  // Voice announcement of newly ready orders
  useEffect(() => {
    const currentReadyIds = new Set(readyOrders.map((o) => o.id));
    
    if (prevReadyOrders.current.size > 0 && voiceEnabled) {
      readyOrders.forEach((o) => {
        if (!prevReadyOrders.current.has(o.id)) {
          announceOrderReady(o.orderNumber);
        }
      });
    }
    
    prevReadyOrders.current = currentReadyIds;
  }, [readyOrders, voiceEnabled]);

  return (
    <div className="flex h-screen flex-col bg-gradient-to-br from-screen via-screen-raised to-screen text-screen-foreground overflow-hidden select-none">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-screen-raised bg-screen-raised/10 px-8 py-4 shrink-0 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl border border-primary/20">
            <ChefHat className="h-9 w-9 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-screen-foreground flex items-center gap-2">
              {t.common.serviceBoard}
            </h1>
            <p className="text-xs font-bold text-screen-dim uppercase tracking-widest">{branchName}</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition duration-200 cursor-pointer ${
              voiceEnabled 
                ? 'bg-primary/20 text-primary border border-primary/30' 
                : 'bg-screen-raised text-screen-dim border border-screen-raised-2'
            }`}
          >
            {voiceEnabled ? <Volume2 className="h-4 w-4 animate-pulse" /> : <VolumeX className="h-4 w-4" />}
            {voiceEnabled ? t.kds.soundAlert : t.common.inactive}
          </button>

          <button
            onClick={onChangeBranch}
            className="rounded-lg border border-screen-border px-3 py-1.5 text-xs font-medium text-screen-muted hover:bg-screen-border hover:text-white transition duration-200 cursor-pointer"
          >
            {t.auth.selectBranch}
          </button>

          <LiveClock />
        </div>
      </header>

      {/* Columns Board */}
      <div className="flex flex-1 min-h-0 divide-x divide-screen-raised bg-screen/20">
        {/* Preparing Column */}
        <div className="flex flex-col w-1/2 min-h-0">
          <div className="flex items-center justify-between bg-warning/5 px-8 py-5 border-b border-screen-raised shrink-0">
            <span className="flex items-center gap-3">
              <div className="p-2 bg-warning/10 rounded-xl border border-warning/20">
                <Flame className="h-6 w-6 text-warning animate-pulse" />
              </div>
              <h2 className="text-3xl font-black tracking-wider text-warning">{t.kds.prepping}</h2>
            </span>
            <span className="text-lg font-bold text-screen-muted bg-screen-raised/60 px-3 py-1 rounded-lg border border-screen-raised-2">
              {preparingOrders.length} {t.common.orders}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-8 bg-screen/10">
            {preparingOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-screen-border space-y-4">
                <div className="p-4 bg-screen-raised/40 border border-screen-border rounded-full animate-pulse">
                  <CookingPot className="h-16 w-16 opacity-35" />
                </div>
                <p className="text-lg font-medium text-screen-dim">{t.customerDisplay.weAppreciate}</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {preparingOrders.map((order, idx) => (
                  <div
                    key={order.id}
                    className="relative flex items-center justify-center py-5 px-6 rounded-2xl border border-screen-raised bg-screen-raised/30 hover:bg-screen-border/50 hover:border-screen-muted/60 shadow-md text-center transition-all duration-200 overflow-hidden group"
                  >
                    {/* Background Watermark Icon */}
                    {idx % 2 === 0 ? (
                      <Pizza className="absolute right-2 bottom-1 h-7 w-7 text-screen-raised-2/10 group-hover:text-screen-raised-2/20 transition-colors" />
                    ) : (
                      <Coffee className="absolute right-2 bottom-1 h-7 w-7 text-screen-raised-2/10 group-hover:text-screen-raised-2/20 transition-colors" />
                    )}
                    <span className="text-3xl md:text-4xl font-black text-screen-subtle tracking-tight z-10">
                      {order.orderNumber}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Ready Column */}
        <div className="flex flex-col w-1/2 min-h-0">
          <div className="flex items-center justify-between bg-success/5 px-8 py-5 border-b border-screen-raised shrink-0">
            <span className="flex items-center gap-3">
              <div className="p-2 bg-success/10 rounded-xl border border-success/20">
                <BellRing className="h-6 w-6 text-success animate-pulse" />
              </div>
              <h2 className="text-3xl font-black tracking-wider text-success">{t.kds.ready}</h2>
            </span>
            <span className="text-lg font-bold text-screen-muted bg-screen-raised/60 px-3 py-1 rounded-lg border border-screen-raised-2">
              {readyOrders.length} {t.common.orders}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-8 bg-screen/10">
            {readyOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-screen-border space-y-4">
                <div className="p-4 bg-screen-raised/40 border border-screen-border rounded-full">
                  <UtensilsCrossed className="h-16 w-16 opacity-35" />
                </div>
                <p className="text-lg font-medium text-screen-dim">{t.common.loading}</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {readyOrders.map((order) => (
                  <div
                    key={order.id}
                    className="relative flex items-center justify-center py-5 px-6 rounded-2xl border border-success bg-success/10 shadow-[0_0_20px_rgba(16,185,129,0.1)] hover:bg-success/20 text-center animate-pulse overflow-hidden group"
                  >
                    {/* Background Sparkles Watermark */}
                    <Sparkles className="absolute right-2 bottom-1 h-7 w-7 text-success/10 group-hover:text-success/20 transition-colors" />
                    <span className="text-3xl md:text-4xl font-black text-success tracking-tight z-10">
                      {order.orderNumber}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Branding */}
      <footer className="border-t border-screen-raised bg-screen/80 px-8 py-3 text-center text-xs text-screen-dim shrink-0">
        {t.customerDisplay.thankYouMessage}
      </footer>
    </div>
  );
}


// ── Screen Wrapper ────────────────────────────────────────────────────────────
export default function CustomerDisplayPage() {
  const { user, isLoggedIn } = useAuth();
  const token = localStorage.getItem('pos-app-token') ?? '';

  const [selectedBranchId, setSelectedBranchId] = useState<string>(
    () => user?.branchId || localStorage.getItem(KDS_BRANCH_KEY) || ''
  );
  const [selectedBranchName, setSelectedBranchName] = useState<string>(
    () => localStorage.getItem(`${KDS_BRANCH_KEY}-name`) || 'Branch'
  );

  if (!isLoggedIn || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-screen text-screen-foreground">
        <div className="text-center space-y-4 max-w-sm px-6">
          <div className="p-4 bg-screen-raised border border-screen-border rounded-full w-20 h-20 mx-auto flex items-center justify-center">
            <ChefHat className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-xl font-bold">Lobby Monitor Display</h2>
          <p className="text-screen-muted text-sm">
            Authentication token not found. Please log in to your account at `/login` or `/admin/login` first, then return here.
          </p>
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
      <CustomerBoard branchName={displayName} onChangeBranch={handleChangeBranch} />
    </KitchenProvider>
  );
}
