// =============================================================================
// KitchenOrderCard — premium kitchen display with Active Orders design language
// =============================================================================

import { useEffect, useState } from 'react';
import {
  Check,
  CheckCircle2,
  ChefHat,
  Clock,
  CookingPot,
  ShoppingBag,
  Truck,
  UserRoundCheck,
  Users,
  Utensils,
} from 'lucide-react';
import type { KitchenOrder, KitchenStatus } from '@/context/KitchenContext';
import { cn } from '@/lib/utils';

export type KitchenDensity = 'compact' | 'standard' | 'comfortable';

function useElapsedSeconds(placedAt: string): number {
  const [elapsed, setElapsed] = useState(() =>
    Math.floor((Date.now() - new Date(placedAt).getTime()) / 1000)
  );
  useEffect(() => {
    const id = setInterval(() =>
      setElapsed(Math.floor((Date.now() - new Date(placedAt).getTime()) / 1000))
    , 1000);
    return () => clearInterval(id);
  }, [placedAt]);
  return elapsed;
}

function formatElapsed(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, '0')}`;
}

function getCardClasses(seconds: number, status: KitchenStatus): string {
  if (status === 'ready') {
    return 'border-emerald-500/30 bg-emerald-500/8';
  }
  if (seconds < 180) {
    return 'border-slate-700/50 bg-slate-900/40';
  }
  if (seconds < 420) {
    return 'border-amber-500/30 bg-amber-500/8';
  }
  return 'border-red-500/40 bg-red-500/8 animate-pulse';
}

function getStatusColor(seconds: number, status: KitchenStatus): string {
  if (status === 'ready') return 'text-emerald-400';
  if (seconds < 180) return 'text-slate-400';
  if (seconds < 420) return 'text-amber-400 font-bold';
  return 'text-red-400 font-black animate-pulse';
}

function isLate(seconds: number, status: KitchenStatus): boolean {
  return seconds >= 420 && status !== 'ready';
}

const STATUS_LABEL: Record<KitchenStatus, string> = {
  new:          'New',
  acknowledged: 'Acked',
  in_progress:  'Cooking',
  ready:        'Ready',
  served:       'Served',
};

const STATUS_COLOR: Record<KitchenStatus, string> = {
  new:          'text-blue-400',
  acknowledged: 'text-indigo-400',
  in_progress:  'text-amber-400',
  ready:        'text-emerald-400',
  served:       'text-slate-400',
};

const STATUS_ICON: Record<KitchenStatus, JSX.Element | null> = {
  new:          <ShoppingBag className="h-3 w-3" />,
  acknowledged: <Check className="h-3 w-3" />,
  in_progress:  <Utensils className="h-3 w-3 animate-pulse" />,
  ready:        <CheckCircle2 className="h-3 w-3" />,
  served:       <CheckCircle2 className="h-3 w-3" />,
};

const ORDER_TYPE_LABEL: Record<string, string> = {
  dine_in:  'Dine In',
  takeaway: 'Takeaway',
  delivery: 'Delivery',
};

const DENSITY_ITEMS: Record<KitchenDensity, number> = {
  compact: 3,
  standard: 5,
  comfortable: 8,
};

interface Props {
  order: KitchenOrder;
  density?: KitchenDensity;
  onAcknowledge: (id: string) => void;
  onStart: (id: string) => void;
  onReady: (id: string) => void;
  onServed: (id: string) => void;
}

export function KitchenOrderCard({
  order,
  density = 'compact',
  onAcknowledge,
  onStart,
  onReady,
  onServed,
}: Props) {
  const elapsed = useElapsedSeconds(order.placedAt);
  const late = isLate(elapsed, order.status);

  const itemLimit = DENSITY_ITEMS[density];
  const visibleItems = order.items.slice(0, itemLimit);
  const hiddenItems = Math.max(0, order.items.length - visibleItems.length);

  // Density-specific style selectors
  const padClass = density === 'compact' ? 'p-2 rounded-xl' : density === 'standard' ? 'p-3.5 rounded-2xl' : 'p-5 rounded-2xl';
  const badgeClass = density === 'compact' ? 'h-8 w-8 text-xs' : density === 'standard' ? 'h-10 w-10 text-sm' : 'h-12 w-12 text-base';
  const badgeFontSize = density === 'compact' ? '13px' : density === 'standard' ? '16px' : '19px';
  const itemTextClass = density === 'compact' ? 'text-[11px]' : density === 'standard' ? 'text-xs' : 'text-sm';
  const itemQtyClass = density === 'compact' ? 'h-4.5 min-w-4.5 text-[9px]' : density === 'standard' ? 'h-5 min-w-5 text-[10px]' : 'h-6 min-w-6 text-xs';
  const metaTextClass = density === 'compact' ? 'text-[9px]' : density === 'standard' ? 'text-[10px]' : 'text-xs';
  const buttonClass = density === 'compact' ? 'h-7 text-[10px] rounded-md' : density === 'standard' ? 'h-8.5 text-xs rounded-lg' : 'h-10 text-sm rounded-xl';
  const headerMargin = density === 'compact' ? 'mb-1.5' : 'mb-2.5';
  const gapClass = density === 'compact' ? 'gap-1.5' : 'gap-2.5';

  return (
    <article className={cn(
      'border shadow-sm transition-all duration-200',
      padClass,
      getCardClasses(elapsed, order.status)
    )}>
      {/* Header: Order Number + Status */}
      <div className={cn("flex items-start justify-between gap-3", headerMargin)}>
        <div className={cn("flex items-center", gapClass)}>
          {/* Order Number Badge */}
          <div className={cn(
            'flex items-center justify-center rounded-lg font-900 shrink-0',
            badgeClass,
            order.status === 'ready'
              ? 'bg-emerald-500/20 text-emerald-400'
              : order.status === 'in_progress'
                ? 'bg-amber-500/20 text-amber-400'
                : 'bg-slate-700/50 text-slate-300'
          )}
            style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: badgeFontSize }}
          >
            {order.orderNumber}
          </div>

          {/* Status Info */}
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              {STATUS_ICON[order.status] && (
                <span className={cn(
                  'flex-shrink-0',
                  order.status === 'ready' ? 'text-emerald-400'
                    : order.status === 'in_progress' ? 'text-amber-400'
                    : 'text-slate-400'
                )}>
                  {STATUS_ICON[order.status]}
                </span>
              )}
              <span className={cn(
                'font-700 uppercase tracking-wider',
                metaTextClass,
                STATUS_COLOR[order.status]
              )}
                style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700 }}>
                {STATUS_LABEL[order.status]}
              </span>

              {/* Total Items Count */}
              <span className="text-[8px] font-600 text-slate-400">
                ({order.items.length})
              </span>

              {/* Notes Indicator */}
              {order.notes && (
                <span className="text-[8px] font-700 uppercase tracking-wider rounded-full px-1 py-0.5 bg-amber-500/20 border border-amber-500/35 text-amber-300 flex items-center gap-1"
                  style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700 }}
                  title={order.notes}>
                  📝 Notes
                </span>
              )}

              {late && (
                <span className="text-[8px] font-700 uppercase tracking-wider rounded-full px-1 py-0.5 bg-red-500/20 border border-red-500/35 text-red-300"
                  style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700 }}>
                  Late
                </span>
              )}
            </div>

            {/* Meta: Order Type, Table, Covers, Time */}
            <div className={cn("flex items-center gap-1 flex-wrap text-slate-300", metaTextClass)}>
              <span className="uppercase tracking-wide font-semibold">{ORDER_TYPE_LABEL[order.orderType] ?? order.orderType}</span>
              {order.tableName && (
                <>
                  <span className="text-slate-500/60">·</span>
                  <span className="flex items-center gap-0.5">
                    <UserRoundCheck className="h-3 w-3" />
                    {order.tableName}
                  </span>
                </>
              )}
              {order.covers != null && (
                <>
                  <span className="text-slate-500/60">·</span>
                  <span className="flex items-center gap-0.5">
                    <Users className="h-3 w-3" />
                    {order.covers}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Elapsed Time (right side) */}
        <div className={cn(
          'inline-flex items-center gap-1 font-mono tabular-nums shrink-0',
          metaTextClass,
          getStatusColor(elapsed, order.status)
        )}>
          <Clock className="h-3.5 w-3.5" />
          {formatElapsed(elapsed)}
        </div>
      </div>

      {/* Items List */}
      <div className={cn("space-y-1", headerMargin)}>
        {visibleItems.map((item) => (
          <div key={item.id} className={cn("flex items-start gap-2", itemTextClass)}>
            <span className={cn(
              'mt-0.5 inline-flex items-center justify-center rounded-sm font-bold shrink-0',
              itemQtyClass,
              item.status === 'done'
                ? 'bg-emerald-500/80 text-white'
                : 'bg-slate-700/60 text-slate-100'
            )}>
              {item.status === 'done' ? <Check className="h-3 w-3" /> : item.quantity}
            </span>
            <div className="min-w-0 flex-1">
              <p className={cn(
                'font-medium truncate',
                itemTextClass,
                item.status === 'done'
                  ? 'text-slate-400 line-through'
                  : 'text-slate-100'
              )}>
                {item.productName}
              </p>
              {item.notes && (
                <p className="mt-0.5 text-[9px] text-amber-300 truncate">
                  Note: {item.notes}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {hiddenItems > 0 && (
        <p className={cn("font-medium text-slate-400", headerMargin, metaTextClass)}>+{hiddenItems} more items</p>
      )}

      {order.notes && (
        <div className={cn("rounded-lg border border-amber-500/35 bg-amber-950/30 px-2 py-1 text-amber-200", headerMargin, metaTextClass)}>
          {order.notes}
        </div>
      )}

      {/* Action Button */}
      <div className="mt-2">
        {order.status === 'new' && (
          <button
            onClick={() => onAcknowledge(String(order.id))}
            className={cn("w-full flex items-center justify-center gap-1.5 bg-blue-600/15 border border-blue-500/30 font-700 text-blue-400 hover:bg-blue-600/25 transition-all", buttonClass)}
            style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700 }}
          >
            <Check className="h-3.5 w-3.5" />
            Acknowledge
          </button>
        )}
        {order.status === 'acknowledged' && (
          <button
            onClick={() => onStart(String(order.id))}
            className={cn("w-full flex items-center justify-center gap-1.5 bg-amber-500/15 border border-amber-500/30 font-700 text-amber-400 hover:bg-amber-500/25 transition-all", buttonClass)}
            style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700 }}
          >
            <CookingPot className="h-3.5 w-3.5" />
            Start Cooking
          </button>
        )}
        {order.status === 'in_progress' && (
          <button
            onClick={() => onReady(String(order.id))}
            className={cn("w-full flex items-center justify-center gap-1.5 bg-emerald-500/15 border border-emerald-500/30 font-700 text-emerald-400 hover:bg-emerald-500/25 transition-all", buttonClass)}
            style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700 }}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Mark Ready
          </button>
        )}
        {order.status === 'ready' && (
          <button
            onClick={() => onServed(String(order.id))}
            className={cn("w-full flex items-center justify-center gap-1.5 bg-slate-700/40 border border-slate-600/30 font-700 text-slate-300 hover:bg-slate-700/60 transition-all", buttonClass)}
            style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700 }}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Served
          </button>
        )}
      </div>
    </article>
  );
}
