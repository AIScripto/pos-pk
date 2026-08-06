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
    <span className="font-mono text-xl text-slate-400 font-bold tabular-nums">
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
    <div className="flex h-screen flex-col items-center justify-center bg-slate-950 text-white gap-6 px-4">
      <div className="text-center space-y-2 max-w-md">
        <MonitorPlay className="h-14 w-14 mx-auto text-primary animate-pulse" />
        <h2 className="text-2xl font-black tracking-tight">Customer Order Display</h2>
        <p className="text-slate-400 text-sm">
          Please select a branch to launch the lobby monitor screen.
        </p>
      </div>

      {loading ? (
        <div className="text-slate-400 text-sm animate-pulse">Loading branches...</div>
      ) : error ? (
        <div className="text-red-400 text-sm">{error}</div>
      ) : (
        <div className="grid w-full max-w-md gap-3">
          {branches.map((b) => (
            <button
              key={b.id}
              onClick={() => onSelect(b.id, b.name)}
              className="flex items-center justify-between p-4 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800 hover:border-slate-700 transition duration-200 text-left font-semibold text-lg"
            >
              <span>{b.name}</span>
              <span className="text-xs text-slate-500 font-mono">ID: {b.id}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Customer Board Board ───────────────────────────────────────────────────────
function CustomerBoard({ branchName, onChangeBranch }: { branchName: string; onChangeBranch: () => void }) {
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
    <div className="flex h-screen flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-zinc-950 text-slate-100 overflow-hidden select-none">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-slate-900 bg-slate-900/10 px-8 py-4 shrink-0 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl border border-primary/20">
            <ChefHat className="h-9 w-9 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              Order Status Board
            </h1>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{branchName}</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition duration-250 ${
              voiceEnabled 
                ? 'bg-primary/20 text-primary border border-primary/30 shadow-[0_0_15px_rgba(249,115,22,0.15)]' 
                : 'bg-slate-900 text-slate-500 border border-slate-800'
            }`}
          >
            {voiceEnabled ? <Volume2 className="h-4 w-4 animate-pulse" /> : <VolumeX className="h-4 w-4" />}
            {voiceEnabled ? 'Voice Alerts Active' : 'Voice Alerts Muted'}
          </button>

          <button
            onClick={onChangeBranch}
            className="rounded-lg border border-slate-850 px-3 py-1.5 text-xs font-medium text-slate-400 hover:bg-slate-900 hover:text-white transition duration-200"
          >
            Change Branch
          </button>

          <LiveClock />
        </div>
      </header>

      {/* Columns Board */}
      <div className="flex flex-1 min-h-0 divide-x divide-slate-900 bg-slate-950/20">
        {/* Preparing Column */}
        <div className="flex flex-col w-1/2 min-h-0">
          <div className="flex items-center justify-between bg-amber-500/5 px-8 py-5 border-b border-slate-900 shrink-0">
            <span className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20">
                <Flame className="h-6 w-6 text-amber-500 animate-pulse" />
              </div>
              <h2 className="text-3xl font-black tracking-wider text-amber-500">Preparing</h2>
            </span>
            <span className="text-lg font-bold text-slate-400 bg-slate-900/60 px-3 py-1 rounded-lg border border-slate-800">
              {preparingOrders.length} Orders
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-8 bg-slate-950/10">
            {preparingOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-700 space-y-4">
                <div className="p-4 bg-slate-900/40 border border-slate-850 rounded-full animate-pulse">
                  <CookingPot className="h-16 w-16 opacity-35" />
                </div>
                <p className="text-lg font-medium text-slate-500">All orders prepared!</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {preparingOrders.map((order, idx) => (
                  <div
                    key={order.id}
                    className="relative flex items-center justify-center py-5 px-6 rounded-2xl border border-slate-900 bg-slate-900/30 hover:bg-slate-900/50 hover:border-slate-800 shadow-md text-center transition-all duration-200 overflow-hidden group"
                  >
                    {/* Background Watermark Icon */}
                    {idx % 2 === 0 ? (
                      <Pizza className="absolute right-2 bottom-1 h-7 w-7 text-slate-800/10 group-hover:text-slate-800/20 transition-colors" />
                    ) : (
                      <Coffee className="absolute right-2 bottom-1 h-7 w-7 text-slate-800/10 group-hover:text-slate-800/20 transition-colors" />
                    )}
                    <span className="text-3xl md:text-4xl font-black text-slate-350 tracking-tight z-10">
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
          <div className="flex items-center justify-between bg-emerald-500/5 px-8 py-5 border-b border-slate-900 shrink-0">
            <span className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                <BellRing className="h-6 w-6 text-emerald-400 animate-bounce" />
              </div>
              <h2 className="text-3xl font-black tracking-wider text-emerald-400">Ready</h2>
            </span>
            <span className="text-lg font-bold text-slate-400 bg-slate-900/60 px-3 py-1 rounded-lg border border-slate-800">
              {readyOrders.length} Orders
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-8 bg-slate-950/10">
            {readyOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-700 space-y-4">
                <div className="p-4 bg-slate-900/40 border border-slate-850 rounded-full">
                  <UtensilsCrossed className="h-16 w-16 opacity-35" />
                </div>
                <p className="text-lg font-medium text-slate-500">Waiting for orders...</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {readyOrders.map((order) => (
                  <div
                    key={order.id}
                    className="relative flex items-center justify-center py-5 px-6 rounded-2xl border border-emerald-500 bg-emerald-950/10 shadow-[0_0_20px_rgba(16,185,129,0.1)] hover:bg-emerald-950/20 text-center animate-pulse overflow-hidden group"
                  >
                    {/* Background Sparkles Watermark */}
                    <Sparkles className="absolute right-2 bottom-1 h-7 w-7 text-emerald-400/10 group-hover:text-emerald-400/20 transition-colors" />
                    <span className="text-3xl md:text-4xl font-black text-emerald-400 tracking-tight z-10">
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
      <footer className="border-t border-slate-900 bg-slate-950/80 px-8 py-3 text-center text-xs text-slate-500 shrink-0">
        Please match your order receipt number with the display board. Thank you for choosing us!
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
      <div className="flex h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center space-y-4 max-w-sm px-6">
          <div className="p-4 bg-slate-900 border border-slate-850 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
            <ChefHat className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-xl font-bold">Lobby Monitor Display</h2>
          <p className="text-slate-400 text-sm">
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
