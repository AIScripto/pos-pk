import { deals, products } from '@/data/products';
import { CartItem, Deal, Invoice, Product } from '@/types/pos';
import { calculateCartTotals, calculateTax, generateId } from '@/utils/pos';

/**
 * ⚠️ TEST CREDENTIALS ONLY
 * This password is used for demo/testing only and should NOT be used in production.
 * Move to backend environment variables before deploying.
 */
type DemoItemSeed =
  | { kind: 'product'; id: string; quantity: number; discountPercent?: number; lumpSumDiscount?: number }
  | { kind: 'deal'; id: string; quantity: number; discountPercent?: number; lumpSumDiscount?: number };

interface DemoInvoiceSeed {
  daysAgo: number;
  hour: number;
  minute: number;
  items: DemoItemSeed[];
}

const productMap = new Map<string, Product>(products.map((product) => [product.id, product]));
const dealMap = new Map<string, Deal>(deals.map((deal) => [deal.id, deal]));

export const MANAGER_REPORT_PASSWORD = '1234';

const demoSeeds: DemoInvoiceSeed[] = [
  { daysAgo: 0, hour: 9, minute: 10, items: [{ kind: 'deal', id: 'deal-001', quantity: 2 }, { kind: 'product', id: 'drink-003', quantity: 1 }] },
  { daysAgo: 0, hour: 12, minute: 25, items: [{ kind: 'product', id: 'burger-002', quantity: 2 }, { kind: 'product', id: 'fries-003', quantity: 1, lumpSumDiscount: 1 }] },
  { daysAgo: 1, hour: 11, minute: 40, items: [{ kind: 'deal', id: 'deal-002', quantity: 1 }, { kind: 'product', id: 'drink-005', quantity: 2 }] },
  { daysAgo: 1, hour: 18, minute: 5, items: [{ kind: 'product', id: 'wrap-002', quantity: 2 }, { kind: 'product', id: 'fries-002', quantity: 2 }] },
  { daysAgo: 2, hour: 13, minute: 15, items: [{ kind: 'deal', id: 'deal-003', quantity: 2, discountPercent: 5 }] },
  { daysAgo: 2, hour: 20, minute: 20, items: [{ kind: 'product', id: 'chicken-004', quantity: 1 }, { kind: 'product', id: 'drink-003', quantity: 3 }] },
  { daysAgo: 3, hour: 10, minute: 30, items: [{ kind: 'deal', id: 'deal-004', quantity: 3 }] },
  { daysAgo: 3, hour: 15, minute: 45, items: [{ kind: 'product', id: 'burger-001', quantity: 4, discountPercent: 10 }, { kind: 'product', id: 'drink-001', quantity: 4 }] },
  { daysAgo: 4, hour: 14, minute: 50, items: [{ kind: 'product', id: 'wrap-001', quantity: 2 }, { kind: 'product', id: 'fries-004', quantity: 2 }, { kind: 'product', id: 'drink-004', quantity: 2 }] },
  { daysAgo: 5, hour: 19, minute: 5, items: [{ kind: 'deal', id: 'deal-005', quantity: 1, lumpSumDiscount: 2 }, { kind: 'product', id: 'drink-002', quantity: 2 }] },
  { daysAgo: 6, hour: 8, minute: 55, items: [{ kind: 'product', id: 'drink-001', quantity: 6 }, { kind: 'product', id: 'fries-001', quantity: 3 }] },
  { daysAgo: 7, hour: 16, minute: 25, items: [{ kind: 'product', id: 'burger-003', quantity: 2 }, { kind: 'product', id: 'burger-004', quantity: 1 }, { kind: 'product', id: 'drink-005', quantity: 2 }] },
  { daysAgo: 8, hour: 12, minute: 0, items: [{ kind: 'deal', id: 'deal-001', quantity: 2 }, { kind: 'product', id: 'fries-002', quantity: 1 }] },
  { daysAgo: 10, hour: 17, minute: 35, items: [{ kind: 'product', id: 'chicken-002', quantity: 3 }, { kind: 'product', id: 'drink-002', quantity: 3, discountPercent: 5 }] },
  { daysAgo: 12, hour: 13, minute: 10, items: [{ kind: 'product', id: 'wrap-003', quantity: 2 }, { kind: 'product', id: 'fries-003', quantity: 2 }, { kind: 'product', id: 'drink-003', quantity: 2 }] },
  { daysAgo: 15, hour: 18, minute: 15, items: [{ kind: 'deal', id: 'deal-003', quantity: 1 }, { kind: 'deal', id: 'deal-004', quantity: 1 }] },
  { daysAgo: 18, hour: 11, minute: 20, items: [{ kind: 'product', id: 'burger-002', quantity: 2 }, { kind: 'product', id: 'drink-001', quantity: 2 }, { kind: 'product', id: 'fries-001', quantity: 2, lumpSumDiscount: 0.5 }] },
  { daysAgo: 21, hour: 20, minute: 40, items: [{ kind: 'product', id: 'chicken-003', quantity: 4 }, { kind: 'product', id: 'drink-004', quantity: 4 }] },
  { daysAgo: 24, hour: 14, minute: 5, items: [{ kind: 'deal', id: 'deal-002', quantity: 2 }, { kind: 'product', id: 'drink-005', quantity: 2 }] },
  { daysAgo: 27, hour: 9, minute: 50, items: [{ kind: 'product', id: 'burger-001', quantity: 2 }, { kind: 'product', id: 'fries-002', quantity: 2 }, { kind: 'product', id: 'drink-002', quantity: 2 }] },
  { daysAgo: 34, hour: 13, minute: 35, items: [{ kind: 'deal', id: 'deal-004', quantity: 2 }, { kind: 'product', id: 'drink-003', quantity: 1 }] },
  { daysAgo: 48, hour: 18, minute: 25, items: [{ kind: 'product', id: 'wrap-002', quantity: 3 }, { kind: 'product', id: 'fries-004', quantity: 2 }, { kind: 'product', id: 'drink-005', quantity: 3 }] },
  { daysAgo: 62, hour: 12, minute: 15, items: [{ kind: 'deal', id: 'deal-005', quantity: 1 }, { kind: 'product', id: 'drink-002', quantity: 3, discountPercent: 10 }] },
  { daysAgo: 76, hour: 17, minute: 10, items: [{ kind: 'product', id: 'burger-003', quantity: 2 }, { kind: 'product', id: 'chicken-001', quantity: 2 }, { kind: 'product', id: 'drink-003', quantity: 2 }] },
];

const createCartItem = (seed: DemoItemSeed): CartItem => {
  const baseItem = {
    id: generateId(),
    quantity: seed.quantity,
    discountPercent: seed.discountPercent ?? 0,
    lumpSumDiscount: seed.lumpSumDiscount ?? 0,
  };

  if (seed.kind === 'product') {
    const product = productMap.get(seed.id);
    if (!product) {
      throw new Error(`Unknown demo product: ${seed.id}`);
    }

    return {
      ...baseItem,
      product,
    };
  }

  const deal = dealMap.get(seed.id);
  if (!deal) {
    throw new Error(`Unknown demo deal: ${seed.id}`);
  }

  return {
    ...baseItem,
    deal,
  };
};

const createInvoiceDate = (daysAgo: number, hour: number, minute: number) => {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  date.setDate(date.getDate() - daysAgo);
  return date;
};

export const demoReportInvoices: Invoice[] = demoSeeds.map((seed, index) => {
  const items = seed.items.map(createCartItem);
  const totals = calculateCartTotals(items);
  const preTaxTotal = totals.grandTotal;
  const tax = calculateTax(preTaxTotal);

  return {
    id: `DEMO-${String(index + 1).padStart(4, '0')}`,
    date: createInvoiceDate(seed.daysAgo, seed.hour, seed.minute),
    items,
    subtotal: totals.subtotal,
    totalDiscount: totals.totalDiscount,
    preTaxTotal,
    taxRate: tax.taxRate,
    taxAmount: tax.taxAmount,
    grandTotal: tax.grandTotal,
    customer: null,
    terminalId: index % 2 === 0 ? 'DEMO-TILL-01' : 'DEMO-TILL-02',
  };
});
