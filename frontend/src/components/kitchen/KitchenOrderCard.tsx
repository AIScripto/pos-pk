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
  Utensils, StickyNote } from 'lucide-react';
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
    return 'border-success/30 bg-success/8';
  }
  if (seconds < 180) {
    return 'border-screen-border/50 bg-screen-raised/40';
  }
  if (seconds < 420) {
    return 'border-warning/30 bg-warning/8';
  }
  return 'border-danger/40 bg-danger/8 animate-pulse';
}

function getStatusColor(seconds: number, status: KitchenStatus): string {
  if (status === 'ready') return 'text-success';
  if (seconds < 180) return 'text-screen-muted';
  if (seconds < 420) return 'text-warning font-bold';
  return 'text-danger font-black animate-pulse';
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
  new:          'text-primary',
  acknowledged: 'text-primary',
  in_progress:  'text-warning',
  ready:        'text-success',
  served:       'text-screen-muted',
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
  const itemQtyClass = density === 'compact' ? 'h-4.5 min-w-4.5 text-2xs' : density === 'standard' ? 'h-5 min-w-5 text-2xs' : 'h-6 min-w-6 text-xs';
  const metaTextClass = density === 'compact' ? 'text-2xs' : density === 'standard' ? 'text-2xs' : 'text-xs';
  const buttonClass = density === 'compact' ? 'h-7 text-2xs rounded-md' : density === 'standard' ? 'h-8.5 text-xs rounded-lg' : 'h-10 text-sm rounded-xl';
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
          <div className={cn('font-condensed font-black', 
            'flex items-center justify-center rounded-lg font-black shrink-0',
            badgeClass,
            order.status === 'ready'
              ? 'bg-success/20 text-success'
              : order.status === 'in_progress'
                ? 'bg-warning/20 text-warning'
                : 'bg-screen-border/50 text-screen-subtle'
          )}
            style={{ fontSize: badgeFontSize }}
          >
            {order.orderNumber}
          </div>

          {/* Status Info */}
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              {STATUS_ICON[order.status] && (
                <span className={cn(
                  'flex-shrink-0',
                  order.status === 'ready' ? 'text-success'
                    : order.status === 'in_progress' ? 'text-warning'
                    : 'text-screen-muted'
                )}>
                  {STATUS_ICON[order.status]}
                </span>
              )}
              <span className={cn('font-condensed font-bold', 
                'font-bold uppercase tracking-wider',
                metaTextClass,
                STATUS_COLOR[order.status]
              )}
                >
                {STATUS_LABEL[order.status]}
              </span>

              {/* Total Items Count */}
              <span className="text-2xs font-semibold text-screen-muted">
                ({order.items.length})
              </span>

              {/* Notes Indicator */}
              {order.notes && (
                <span className="text-2xs font-bold uppercase tracking-wider rounded-full px-1 py-0.5 bg-warning/20 border border-warning/35 text-warning flex items-center gap-1 font-condensed"
                  title={order.notes}>
                  <StickyNote className="mr-1 inline h-3.5 w-3.5" aria-hidden="true" />Notes
                </span>
              )}

              {late && (
                <span className="text-2xs font-bold uppercase tracking-wider rounded-full px-1 py-0.5 bg-danger/20 border border-danger/35 text-danger font-condensed"
                  >
                  Late
                </span>
              )}
            </div>

            {/* Meta: Order Type, Table, Covers, Time */}
            <div className={cn("flex items-center gap-1 flex-wrap text-screen-subtle", metaTextClass)}>
              <span className="uppercase tracking-wide font-semibold">{ORDER_TYPE_LABEL[order.orderType] ?? order.orderType}</span>
              {order.tableName && (
                <>
                  <span className="text-screen-dim/60">·</span>
                  <span className="flex items-center gap-0.5">
                    <UserRoundCheck className="h-3 w-3" />
                    {order.tableName}
                  </span>
                </>
              )}
              {order.covers != null && (
                <>
                  <span className="text-screen-dim/60">·</span>
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
                ? 'bg-success/80 text-screen-foreground'
                : 'bg-screen-border/60 text-screen-foreground'
            )}>
              {item.status === 'done' ? <Check className="h-3 w-3" /> : item.quantity}
            </span>
            <div className="min-w-0 flex-1">
              <p className={cn(
                'font-medium truncate',
                itemTextClass,
                item.status === 'done'
                  ? 'text-screen-muted line-through'
                  : 'text-screen-foreground'
              )}>
                {item.productName}
              </p>
              {item.notes && (
                <p className="mt-0.5 text-2xs text-warning truncate">
                  Note: {item.notes}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {hiddenItems > 0 && (
        <p className={cn("font-medium text-screen-muted", headerMargin, metaTextClass)}>+{hiddenItems} more items</p>
      )}

      {order.notes && (
        <div className={cn("rounded-lg border border-warning/35 bg-warning/30 px-2 py-1 text-warning", headerMargin, metaTextClass)}>
          {order.notes}
        </div>
      )}

      {/* Action Button */}
      <div className="mt-2">
        {order.status === 'new' && (
          <button
            onClick={() => onAcknowledge(String(order.id))}
            className={cn('font-condensed font-bold', "w-full flex items-center justify-center gap-1.5 bg-primary/15 border border-primary/30 font-bold text-primary hover:bg-primary/25 transition-all", buttonClass)}
          >
            <Check className="h-3.5 w-3.5" />
            Acknowledge
          </button>
        )}
        {order.status === 'acknowledged' && (
          <button
            onClick={() => onStart(String(order.id))}
            className={cn('font-condensed font-bold', "w-full flex items-center justify-center gap-1.5 bg-warning/15 border border-warning/30 font-bold text-warning hover:bg-warning/25 transition-all", buttonClass)}
          >
            <CookingPot className="h-3.5 w-3.5" />
            Start Cooking
          </button>
        )}
        {order.status === 'in_progress' && (
          <button
            onClick={() => onReady(String(order.id))}
            className={cn('font-condensed font-bold', "w-full flex items-center justify-center gap-1.5 bg-success/15 border border-success/30 font-bold text-success hover:bg-success/25 transition-all", buttonClass)}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Mark Ready
          </button>
        )}
        {order.status === 'ready' && (
          <button
            onClick={() => onServed(String(order.id))}
            className={cn('font-condensed font-bold', "w-full flex items-center justify-center gap-1.5 bg-screen-border/40 border border-screen-dim/30 font-bold text-screen-subtle hover:bg-screen-border/60 transition-all", buttonClass)}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Served
          </button>
        )}
      </div>
    </article>
  );
}
