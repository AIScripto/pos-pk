import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  TillSession,
  TillSummary,
  DenominationEntry,
  CategorySaleLine,
  blankDenominations,
  sumDenominations,
} from '@/types/till';
import { Invoice }                from '@/types/pos';
import { calculateLineTotal }     from '@/utils/pos';
import { tillApi, ApiTillSession } from '@/lib/api/till.api';
import { useAuth }                from '@/context/AuthContext';
import { getRememberedPosSelection } from '@/lib/pos-terminal-selection';

// ── Utilities ─────────────────────────────────────────────────────────────────

function normalizeId(value: unknown): string {
  return value == null ? '' : String(value).trim();
}

function normalizeIsoDate(value: unknown): string {
  const fallback = new Date().toISOString();
  if (typeof value !== 'string' || !value.trim()) return fallback;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? fallback : parsed.toISOString();
}

const CATEGORY_LABELS: Record<string, string> = {
  burgers: 'Burgers',
  wraps:   'Wraps',
  chicken: 'Chicken',
  fries:   'Fries',
  drinks:  'Drinks',
  deals:   'Deals',
};

// ── Map server response → client shape ────────────────────────────────────────

function serverToClient(s: ApiTillSession): TillSession {
  return {
    id:                   normalizeId(s.id),
    branchId:             normalizeId(s.branchId),
    terminalId:           normalizeId(s.terminalId),
    shiftTemplateId:      s.shiftTemplateId == null ? null : normalizeId(s.shiftTemplateId),
    shiftName:            s.shiftName,
    businessDate:         s.businessDate,
    status:               s.status,
    openedAt:             normalizeIsoDate(s.openedAt),
    openedBy:             s.openedByName,
    openingCash:          (s.openingCashAmount ?? s.openingCashPaisa ?? 0) / 100,
    openingDenominations: blankDenominations(),
    closedAt:             s.closedAt         ?? undefined,
    closedBy:             s.closedBy         ?? undefined,
    closingCash:          (s.closingCashAmount ?? s.closingCashPaisa) != null
                            ? (s.closingCashAmount ?? s.closingCashPaisa ?? 0) / 100
                            : undefined,
    variance:             (s.cashVarianceAmount ?? s.variance) ?? undefined,
    notes:                s.notes            ?? undefined,
  };
}

// ── Context type ──────────────────────────────────────────────────────────────

interface TillContextType {
  session:     TillSession | null;
  isOpen:      boolean;
  isRestoring: boolean;
  history:     TillSession[];
  openTill:    (denominations: DenominationEntry[], cashierName?: string, terminalIdOverride?: string) => Promise<TillSession>;
  closeTill:   (denominations: DenominationEntry[], notes?: string) => Promise<void>;
  getTillSummary: (invoices: Invoice[], closingDenominations?: DenominationEntry[]) => TillSummary;
}

const TillContext = createContext<TillContextType | undefined>(undefined);

// ── Provider ──────────────────────────────────────────────────────────────────

export function TillProvider({ children }: { children: ReactNode }) {
  const { isLoading: isAuthLoading, isLoggedIn, user } = useAuth();

  const [session,   setSession]   = useState<TillSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // In-memory history for current browser session (close events append here)
  const [history,   setHistory]   = useState<TillSession[]>([]);

  // ── Derive terminal ID ───────────────────────────────────────────────────
  // PIN-login cashiers have terminalId in their JWT.
  // Email-login admins/managers rely on the remembered selection.

  function resolveTerminalId(override?: string): string {
    return normalizeId(
      override
      ?? user?.terminalId
      ?? getRememberedPosSelection().terminal?.id
      ?? ''
    );
  }

  // ── Fetch current session from server ─────────────────────────────────────

  async function fetchCurrentSession(): Promise<void> {
    setIsLoading(true);
    const terminalId = resolveTerminalId();
    if (!terminalId) {
      setSession(null);
      setIsLoading(false);
      return;
    }
    const s = await tillApi.current(terminalId).catch(() => null);
    setSession(s ? serverToClient(s) : null);
    setIsLoading(false);
  }

  // Re-fetch whenever auth state settles or user changes
  useEffect(() => {
    if (isAuthLoading) return;
    if (!isLoggedIn) {
      setSession(null);
      setIsLoading(false);
      return;
    }
    void fetchCurrentSession();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthLoading, isLoggedIn, user?.id]);

  // ── Open till ─────────────────────────────────────────────────────────────
  // Server handles the "already open" case — it returns the existing session
  // if one is found, so no pre-check is needed here.

  async function openTill(
    denominations:     DenominationEntry[],
    cashierName      = 'Cashier',
    terminalIdOverride?: string,
  ): Promise<TillSession> {
    const terminalId = resolveTerminalId(terminalIdOverride);
    if (!terminalId) throw new Error('terminalId required');

    const openingCashAmount = Math.round(sumDenominations(denominations) * 100);

    const server = await tillApi.open({
      terminalId,
      openingCashAmount,
      denominations,
      notes:         cashierName,
    });

    const client: TillSession = {
      ...serverToClient(server),
      openingDenominations: denominations,
    };

    setSession(client);
    return client;
  }

  // ── Close till ────────────────────────────────────────────────────────────

  async function closeTill(denominations: DenominationEntry[], notes = ''): Promise<void> {
    if (!session) return;

    const closingCashAmount = Math.round(sumDenominations(denominations) * 100);

    const server = await tillApi.close({
      sessionId:        session.id,
      closingCashAmount,
      denominations,
      notes:            notes.trim() || undefined,
    });

    const closed: TillSession = {
      ...session,
      status:               server.status,
      closedAt:             server.closedAt ?? server.closeSubmittedAt ?? new Date().toISOString(),
      closedBy:             session.openedBy,
      closingCash:          closingCashAmount / 100,
      closingDenominations: denominations,
      variance:             (server.cashVarianceAmount ?? server.variance) != null
                              ? (server.cashVarianceAmount ?? server.variance ?? 0) / 100
                              : undefined,
      notes:                notes.trim() || undefined,
    };

    setHistory(prev => [closed, ...prev].slice(0, 30));
    setSession(null);
  }

  // ── Summary (computed client-side for the close-till screen) ──────────────

  function getTillSummary(
    allInvoices:          Invoice[],
    closingDenominations?: DenominationEntry[],
  ): TillSummary {
    const openedAt = session ? new Date(session.openedAt).getTime() : 0;
    const sessionInvoices = allInvoices.filter(
      inv => new Date(inv.date).getTime() >= openedAt,
    );

    let cashSales = 0, cardSales = 0, codPending = 0;
    let grossSales = 0, totalDiscount = 0, totalTax = 0;
    const catMap = new Map<string, { total: number; count: number }>();

    for (const inv of sessionInvoices) {
      const pm = inv.paymentMethod ?? 'cash';
      const ps = inv.paymentStatus ?? 'paid';

      grossSales    += inv.grandTotal;
      totalDiscount += inv.totalDiscount;
      totalTax      += inv.taxAmount;

      if      (pm === 'cash' && ps === 'paid') cashSales  += inv.grandTotal;
      else if (pm === 'card' && ps === 'paid') cardSales  += inv.grandTotal;
      else if (ps === 'pending')               codPending += inv.grandTotal;

      for (const item of inv.items) {
        const category = item.product?.category ?? (item.deal ? 'deals' : 'other');
        const lineTotal = calculateLineTotal(
          item.product?.price ?? item.deal?.price ?? 0,
          item.quantity,
          item.discountPercent,
          item.lumpSumDiscount,
        );
        const entry = catMap.get(category) ?? { total: 0, count: 0 };
        catMap.set(category, { total: entry.total + lineTotal, count: entry.count + item.quantity });
      }
    }

    const categorySales: CategorySaleLine[] = Array.from(catMap.entries())
      .map(([cat, { total, count }]) => ({
        category:         cat,
        label:            CATEGORY_LABELS[cat] ?? cat.charAt(0).toUpperCase() + cat.slice(1),
        totalSales:       total,
        transactionCount: count,
      }))
      .sort((a, b) => b.totalSales - a.totalSales);

    const openingCash  = session?.openingCash ?? 0;
    const expectedCash = openingCash + cashSales;
    const actualCash   = closingDenominations ? sumDenominations(closingDenominations) : undefined;

    return {
      grossSales, totalDiscount, totalTax,
      netSales:          grossSales - totalDiscount,
      totalTransactions: sessionInvoices.length,
      cashSales, cardSales, codPending,
      categorySales,
      openingCash, expectedCash, actualCash,
      variance: actualCash !== undefined ? actualCash - expectedCash : undefined,
    };
  }

  return (
    <TillContext.Provider value={{
      session,
      isOpen:      session?.status === 'open',
      isRestoring: isLoading,
      history,
      openTill,
      closeTill,
      getTillSummary,
    }}>
      {children}
    </TillContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useTill(): TillContextType {
  const ctx = useContext(TillContext);
  if (!ctx) throw new Error('useTill must be used inside TillProvider');
  return ctx;
}
