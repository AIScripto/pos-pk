import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, Crown, Phone, Star, UserRound, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { formatCurrency, formatDate, formatPhoneNumber, normalizePhoneNumber } from '@/utils/pos';

export function CustomerProfileCard() {
  const { state, setActiveCustomer, selectCustomer, clearActiveCustomer } = useCart();
  const activeCustomer = state.activeCustomer;
  const [isExpanded, setIsExpanded] = useState(Boolean(activeCustomer));

  const matchedCustomer = useMemo(() => {
    if (!activeCustomer) {
      return null;
    }

    if (activeCustomer.customerId) {
      return state.customers.find((customer) => customer.id === activeCustomer.customerId) ?? null;
    }

    const normalizedPhone = normalizePhoneNumber(activeCustomer.phone);
    if (!normalizedPhone) {
      return null;
    }

    return (
      state.customers.find((customer) => normalizePhoneNumber(customer.phone) === normalizedPhone) ?? null
    );
  }, [activeCustomer, state.customers]);

  const suggestions = useMemo(() => {
    const query = `${activeCustomer?.name ?? ''} ${activeCustomer?.phone ?? ''}`.trim().toLowerCase();
    if (!query) {
      return state.customers.slice(0, 3);
    }

    return state.customers
      .filter((customer) => {
        const haystack = `${customer.name} ${customer.phone}`.toLowerCase();
        return haystack.includes(query);
      })
      .slice(0, 3);
  }, [activeCustomer, state.customers]);

  useEffect(() => {
    if (activeCustomer) {
      setIsExpanded(true);
    }
  }, [activeCustomer]);

  const summaryText = matchedCustomer
    ? `${matchedCustomer.name} · ${matchedCustomer.loyaltyPoints} pts`
    : activeCustomer?.name || activeCustomer?.phone
      ? 'New customer profile'
      : 'Walk-in order';

  return (
    <div className="border-b border-border/60 bg-background/40 p-4">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <div className="rounded-[24px] border border-border/70 bg-card/85 shadow-[0_12px_30px_-24px_rgba(15,23,42,0.55)]">
          <div className="flex items-center gap-3 px-4 py-3.5">
            <CollapsibleTrigger asChild>
              <button
                type="button"
                className="flex flex-1 items-center justify-between gap-3 rounded-[18px] text-left transition-colors hover:bg-background/30"
              >
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/75">Customer</p>
                  <div className="mt-1 flex items-center gap-2">
                    <h3 className="text-lg font-bold text-card-foreground">Profile & loyalty</h3>
                    <span className="truncate text-sm text-muted-foreground">{summaryText}</span>
                  </div>
                </div>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-background/70">
                  <ChevronDown
                    className={cn('h-4 w-4 text-muted-foreground transition-transform duration-200', isExpanded && 'rotate-180')}
                  />
                </span>
              </button>
            </CollapsibleTrigger>
            {activeCustomer && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 shrink-0 rounded-xl"
                onClick={clearActiveCustomer}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
            <div className="border-t border-border/60 px-4 pb-4 pt-3">
              <div className="grid gap-3">
                <div className="grid gap-2">
                  <label className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                    Name
                  </label>
                  <div className="relative">
                    <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={activeCustomer?.name ?? ''}
                      onChange={(event) =>
                        setActiveCustomer({
                          customerId: matchedCustomer?.id ?? null,
                          name: event.target.value,
                        })
                      }
                      placeholder="Walk-in or customer name"
                      className="h-11 rounded-2xl border-border/70 bg-background/80 pl-10"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <label className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                    Phone
                  </label>
                  <div className="relative">
                    <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={activeCustomer?.phone ?? ''}
                      onChange={(event) => {
                        const formatted = formatPhoneNumber(event.target.value);
                        const exactMatch = state.customers.find(
                          (customer) => normalizePhoneNumber(customer.phone) === normalizePhoneNumber(formatted),
                        );

                        if (exactMatch) {
                          selectCustomer(exactMatch.id);
                          return;
                        }

                        setActiveCustomer({
                          customerId: null,
                          phone: formatted,
                        });
                      }}
                      placeholder="0300 123 4567"
                      className="h-11 rounded-2xl border-border/70 bg-background/80 pl-10"
                    />
                  </div>
                </div>
              </div>

              {suggestions.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Quick matches</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {suggestions.map((customer) => (
                      <button
                        key={customer.id}
                        type="button"
                        onClick={() => selectCustomer(customer.id)}
                        className={cn(
                          'rounded-full border px-3 py-1.5 text-sm transition-colors',
                          matchedCustomer?.id === customer.id
                            ? 'border-primary/20 bg-primary text-primary-foreground'
                            : 'border-border/70 bg-background/80 text-muted-foreground hover:border-primary/20 hover:text-primary',
                        )}
                      >
                        {customer.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {matchedCustomer ? (
                <div className="mt-4 rounded-[20px] border border-border/70 bg-background/70 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-card-foreground">{matchedCustomer.name}</p>
                      <p className="text-sm text-muted-foreground">{matchedCustomer.phone}</p>
                    </div>
                    <div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-primary">
                      Existing profile
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-3">
                    <div className="rounded-2xl bg-card px-3 py-2">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Crown className="h-4 w-4 text-primary" />
                        <span className="text-[11px] uppercase tracking-[0.12em]">Points</span>
                      </div>
                      <p className="mt-2 text-lg font-semibold text-card-foreground">{matchedCustomer.loyaltyPoints}</p>
                    </div>
                    <div className="rounded-2xl bg-card px-3 py-2">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Star className="h-4 w-4 text-accent" />
                        <span className="text-[11px] uppercase tracking-[0.12em]">Orders</span>
                      </div>
                      <p className="mt-2 text-lg font-semibold text-card-foreground">{matchedCustomer.totalOrders}</p>
                    </div>
                    <div className="rounded-2xl bg-card px-3 py-2">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <UserRound className="h-4 w-4 text-pos-info" />
                        <span className="text-[11px] uppercase tracking-[0.12em]">Spent</span>
                      </div>
                      <p className="mt-2 truncate text-sm font-semibold text-card-foreground">
                        {formatCurrency(matchedCustomer.totalSpent)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 lg:grid-cols-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Favorite items</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {matchedCustomer.favoriteItems.slice(0, 4).map((favorite) => (
                          <span
                            key={favorite.itemKey}
                            className="rounded-full border border-border/70 bg-card px-3 py-1 text-xs font-medium text-card-foreground"
                          >
                            {favorite.name} · {favorite.quantity}
                          </span>
                        ))}
                        {matchedCustomer.favoriteItems.length === 0 && (
                          <span className="text-sm text-muted-foreground">No favorites yet</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Recent orders</p>
                      <div className="mt-2 space-y-2">
                        {matchedCustomer.orderHistory.slice(0, 3).map((order) => (
                          <div
                            key={order.invoiceId}
                            className="flex items-center justify-between rounded-2xl border border-border/70 bg-card px-3 py-2"
                          >
                            <div>
                              <p className="font-mono text-xs font-semibold text-card-foreground">{order.invoiceId}</p>
                              <p className="text-xs text-muted-foreground">{formatDate(order.date)}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold text-card-foreground">{formatCurrency(order.grandTotal)}</p>
                              <p className="text-xs text-muted-foreground">{order.itemCount} items</p>
                            </div>
                          </div>
                        ))}
                        {matchedCustomer.orderHistory.length === 0 && (
                          <span className="text-sm text-muted-foreground">No order history yet</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : activeCustomer?.name || activeCustomer?.phone ? (
                <div className="mt-4 rounded-[20px] border border-dashed border-primary/30 bg-primary/5 p-4">
                  <p className="text-sm font-medium text-card-foreground">New customer profile will be created on checkout.</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Save the order with both a customer name and phone to start tracking loyalty, order history, and favorites.
                  </p>
                </div>
              ) : (
                <div className="mt-4 rounded-[20px] border border-dashed border-border/70 bg-background/40 p-4">
                  <p className="text-sm font-medium text-card-foreground">Walk-in order</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Add a customer name and phone if you want this order to contribute to profile history and loyalty points.
                  </p>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    </div>
  );
}
