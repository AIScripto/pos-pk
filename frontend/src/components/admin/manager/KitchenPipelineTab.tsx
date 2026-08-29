import type { ManagerPanelState } from '@/hooks/useManagerPanelState';
import { UtensilsCrossed } from 'lucide-react';
import { SectionHeader, PanelHeader, THEMES, KITCHEN_STATES, formatTime } from './ManagerCommon';

type KitchenPipelineTabProps = Pick<
  ManagerPanelState,
  | 'data'
  | 'kitchenByState'
>;

export function KitchenPipelineTab({
  data,
  kitchenByState,
}: KitchenPipelineTabProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <SectionHeader icon={<UtensilsCrossed className="h-4 w-4" />} label="Kitchen Live Pipeline" theme="rose" />
        <div className={`overflow-hidden rounded-2xl border border-border bg-card shadow-sm ${THEMES.rose.border}`}>
          <PanelHeader
            theme="rose"
            icon={<UtensilsCrossed className="h-4 w-4" />}
            title="Live Kitchen Board"
            subtitle="Active orders by preparation stage"
            right={
              <div className="flex items-center gap-2">
                {KITCHEN_STATES.map((s) => {
                  const count = (kitchenByState.get(s.key) ?? []).length;
                  return count > 0 ? (
                    <span key={s.key} className={`rounded-full px-2 py-0.5 text-xs font-black ${s.badge}`}>
                      {count} {s.label}
                    </span>
                  ) : null;
                })}
                {data?.kitchen.orders.length === 0 && (
                  <span className="text-xs font-semibold text-muted-foreground/70">All clear</span>
                )}
              </div>
            }
          />
          <div className="grid grid-cols-1 gap-4 p-5 lg:grid-cols-4">
            {KITCHEN_STATES.map((state) => {
              const orders = kitchenByState.get(state.key) ?? [];
              return (
                <div key={state.key} className={`min-h-48 rounded-xl border p-3 ${state.color}`}>
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-wide text-foreground">{state.label}</h3>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-black ${state.badge}`}>{orders.length}</span>
                  </div>
                  <div className="space-y-2">
                    {orders.map((order) => (
                      <div key={order.id} className="rounded-xl border border-white/70 bg-card p-3 shadow-sm dark:border-border">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-black text-foreground dark:text-white">{order.orderNumber}</p>
                          <p className="text-[11px] text-muted-foreground/70">{formatTime(order.placedAt)}</p>
                        </div>
                        <p className="mt-0.5 text-xs capitalize text-muted-foreground">{order.orderType.replace('_', ' ')} · {order.itemCount} items</p>
                        <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">
                          {order.items.map((i) => `${i.quantity}× ${i.productName}`).join(', ')}
                        </p>
                      </div>
                    ))}
                    {orders.length === 0 && (
                      <p className="rounded-xl border border-dashed border-border/60 py-8 text-center text-xs text-muted-foreground/70">
                        Empty
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
