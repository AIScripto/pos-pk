// ─────────────────────────────────────────────────────────────────────────────
// Invoice Service — all business logic for creating and querying invoices.
// Routes stay thin; all calculation and DB work happens here.
// ─────────────────────────────────────────────────────────────────────────────

import prisma from '../../../shared/lib/prisma';
import { toBigInt } from '../../../shared/utils/bigint';
import { KitchenService } from '../../kitchen/kitchen.service';
import { getIO }          from '../../../lib/socket';
import { emitNewKitchenOrder } from '../../kitchen/kitchen.gateway';

function isBigIntId(value: string | null | undefined): value is string {
  return typeof value === 'string' && /^\d+$/.test(value);
}

export interface CreateInvoiceInput {
  orgId:         string;
  cityId:        string;
  branchId:      string;
  terminalId:    string;
  tillSessionId: string;
  cashierId:     string;
  tableId?:      string;
  tableName?:    string;
  covers?:       number;
  orderType:     string;
  customerId?:   string;
  customerName?: string;
  customerPhone?:string;
  orderNotes?:   string;
  paymentMethod: string;
  allocationsJson?: string;
  items: {
    productId?:         string;
    dealId?:            string;
    // Optional — auto-resolved from product record if omitted
    productName?:       string;
    productCode?:       string;
    category?:          string;
    isDeal?:            boolean;
    unitPricePaisa:     number;
    quantity:           number;
    discountPercent?:   number;
    lumpDiscountPaisa?: number;
  }[];
  discountsJson?:          string;
  loyaltyPointsToRedeem?:  number;
}

export class InvoiceService {

  /** Create an invoice inside a DB transaction. Atomically deducts inventory. */
  static async create(input: CreateInvoiceInput, tx?: any) {
    const execute = async (t: any) => {

      // ── Auto-resolve product details if not provided by client ──────────
      const productIds = input.items
        .map((i) => i.productId)
        .filter((id): id is string => isBigIntId(id));
      const productMap: Record<string, { name: string; sku: string; categoryId: number | null }> = {};
      if (productIds.length > 0) {
        const products = await t.product.findMany({
          where: { id: { in: productIds.map(toBigInt) } },
          select: { id: true, name: true, sku: true, categoryId: true },
        });
        products.forEach(p => { productMap[String(p.id)] = { name: p.name, sku: p.sku, categoryId: p.categoryId }; });
      }

      // ── Calculate line totals ───────────────────────────────────────────
      const itemsWithTotals = input.items.map((item) => {
        const gross   = item.unitPricePaisa * item.quantity;
        const pctDisc = Math.round(gross * ((item.discountPercent ?? 0) / 100));
        const lineTotal = Math.max(0, gross - pctDisc - (item.lumpDiscountPaisa ?? 0));
        return { ...item, lineTotal };
      });

      // ── Subtotals ───────────────────────────────────────────────────────
      const subtotalPaisa      = itemsWithTotals.reduce((s, i) => s + i.lineTotal, 0);
      const lineDiscountPaisa  = itemsWithTotals.reduce((s, i) => {
        const gross   = i.unitPricePaisa * i.quantity;
        const pctDisc = Math.round(gross * ((i.discountPercent ?? 0) / 100));
        return s + pctDisc + (i.lumpDiscountPaisa ?? 0);
      }, 0);

      // ── Order discount (parsed from JSON) ───────────────────────────────
      const discounts: { amountPaisa: number }[] = JSON.parse(input.discountsJson ?? '[]');
      const orderDiscountPaisa = discounts.reduce((s, d) => s + (d.amountPaisa ?? 0), 0);
      const totalDiscountPaisa = lineDiscountPaisa + orderDiscountPaisa;
      const taxablePaisa       = subtotalPaisa - orderDiscountPaisa;

      // ── Tax — resolved by payment method ────────────────────────────────
      // Priority: exact paymentMethod match → "all" (default) fallback
      const orgId = toBigInt(input.orgId);
      const pm    = input.paymentMethod ?? 'cash';  // e.g. "card", "cash", "wallet"

      let taxCfg = await t.taxConfig.findFirst({
        where: { orgId, isActive: true, paymentMethod: pm },
      });
      // Fallback: if no rule for this specific payment method, use the "all" default
      if (!taxCfg) {
        taxCfg = await t.taxConfig.findFirst({
          where: { orgId, isActive: true, paymentMethod: 'all', isDefault: true },
        });
      }
      const rate      = taxCfg?.rate ?? 0;
      const taxPaisa  = taxCfg?.mode === 'exclusive'
        ? Math.round(taxablePaisa * (rate / 100))
        : Math.round(taxablePaisa - taxablePaisa / (1 + rate / 100));
      const grandTotalPaisa = taxCfg?.mode === 'exclusive'
        ? taxablePaisa + taxPaisa
        : taxablePaisa;

      // ── Loyalty points earned ───────────────────────────────────────────
      const loyaltyCfg = await t.loyaltyConfig.findUnique({
        where: { orgId: toBigInt(input.orgId) },
      });
      const loyaltyPointsEarned = loyaltyCfg?.isEnabled
        ? Math.floor(grandTotalPaisa / (loyaltyCfg.earnRatePaisa || 1000))
        : 0;
      const loyaltyPointsRedeemed = input.loyaltyPointsToRedeem ?? 0;

      // ── Save invoice ────────────────────────────────────────────────────
      const invoice = await t.invoice.create({
        data: {
          orgId:           toBigInt(input.orgId),
          cityId:          toBigInt(input.cityId),
          branchId:        toBigInt(input.branchId),
          terminalId:      toBigInt(input.terminalId),
          tillSessionId:   toBigInt(input.tillSessionId),
          cashierId:       input.cashierId,
          tableId:         isBigIntId(input.tableId) ? toBigInt(input.tableId) : null,
          tableName:       input.tableName  ?? null,
          covers:          input.covers     ?? null,
          orderType:       input.orderType,
          customerId:      input.customerId    ?? null,
          customerName:    input.customerName  ?? null,
          customerPhone:   input.customerPhone ?? null,
          orderNotes:      input.orderNotes    ?? null,
          subtotalPaisa,
          lineDiscountPaisa,
          orderDiscountPaisa,
          totalDiscountPaisa,
          taxablePaisa,
          taxRate:         rate,
          taxPaisa,
          grandTotalPaisa,
          discountsJson:   input.discountsJson   ?? '[]',
          paymentMethod:   input.paymentMethod,
          paymentStatus:   'paid',
          paidAt:          new Date(),
          allocationsJson: input.allocationsJson ?? '[]',
          loyaltyPointsEarned,
          loyaltyPointsRedeemed,
          createdBy:       input.cashierId,
          items: {
            create: itemsWithTotals.map((item) => ({
              productId:         isBigIntId(item.productId) ? toBigInt(item.productId) : null,
              dealId:            isBigIntId(item.dealId) ? toBigInt(item.dealId) : null,
              productName:       item.productName ?? (item.productId ? productMap[item.productId]?.name : '') ?? '',
              productCode:       item.productCode ?? (item.productId ? productMap[item.productId]?.sku  : '') ?? '',
              category:          item.category ?? (item.productId ? (productMap[item.productId]?.categoryId?.toString() ?? 'other') : 'other'),
              unitPricePaisa:    item.unitPricePaisa,
              quantity:          item.quantity,
              discountPercent:   item.discountPercent   ?? 0,
              lumpDiscountPaisa: item.lumpDiscountPaisa ?? 0,
              lineTotalPaisa:    item.lineTotal,
              isDeal:            item.isDeal ?? false,
              createdBy:         input.cashierId,
            })),
          },
        },
        include: { items: true },
      });

      // ── Update customer loyalty ─────────────────────────────────────────
      if (input.customerId && loyaltyCfg?.isEnabled && isBigIntId(input.customerId)) {
        const customer = await t.customer.findUnique({
          where: { id: toBigInt(input.customerId) },
        });
        if (customer) {
          const newBalance = Math.max(
            0,
            customer.loyaltyPoints + loyaltyPointsEarned - loyaltyPointsRedeemed,
          );
          await t.customer.update({
            where: { id: toBigInt(input.customerId) },
            data: {
              loyaltyPoints:   newBalance,
              lifetimePoints:  customer.lifetimePoints + loyaltyPointsEarned,
              totalOrders:     { increment: 1 },
              totalSpentPaisa: { increment: grandTotalPaisa },
              lastOrderAt:     new Date(),
              lastBranchId:    input.branchId,
            },
          });

          // Record loyalty transaction
          await t.loyaltyTransaction.create({
            data: {
              customerId:  customer.id,
              orgId:       toBigInt(input.orgId),
              branchId:    toBigInt(input.branchId),
              invoiceId:   invoice.id,
              type:        'earn',
              points:      loyaltyPointsEarned,
              balance:     newBalance,
              description: `Earned on invoice ${invoice.id}`,
              createdBy:   input.cashierId,
            },
          });
        }
      }

      // ── Mark table as available if paid dine-in ─────────────────────────
      if (isBigIntId(input.tableId) && input.orderType === 'dine_in') {
        await t.table.update({
          where: { id: toBigInt(input.tableId) },
          data:  { status: 'available', occupiedAt: null, covers: 0 },
        });
      }

      return invoice;
    };

    const invoice = tx ? await execute(tx) : await prisma.$transaction(execute, { maxWait: 10000, timeout: 25000 });

    // ── Deduct inventory post-commit (non-blocking for checkout speed) ───────
    try {
      const decrementByProductId = new Map<string, number>();
      for (const item of input.items) {
        if (!isBigIntId(item.productId)) continue;
        decrementByProductId.set(
          item.productId!,
          (decrementByProductId.get(item.productId!) ?? 0) + item.quantity,
        );
      }

      for (const [productId, qty] of decrementByProductId.entries()) {
        const pId = toBigInt(productId);
        const bId = toBigInt(input.branchId);
        const productExists = await prisma.product.findUnique({
          where: { id: pId },
          select: { id: true },
        });
        if (productExists) {
          await prisma.inventory.upsert({
            where:  { productId_branchId: { productId: pId, branchId: bId } },
            update: { quantity: { decrement: qty } },
            create: {
              productId:    pId,
              branchId:     bId,
              quantity:     -qty,
              minThreshold: 5,
              createdBy:    input.cashierId,
            },
          });
        }
      }
    } catch (invErr) {
      console.warn('[Inventory] Non-blocking inventory update warning:', invErr);
    }

    // ── Fire kitchen order (outside transaction — non-blocking) ─────────────
    try {
      const kitchenOrder = await KitchenService.createFromInvoice({
        invoiceId:   String(invoice.id),
        orgId:       input.orgId,
        branchId:    input.branchId,
        terminalId:  input.terminalId,
        orderNumber: `#${String(invoice.id).padStart(3, '0')}`,
        orderType:   input.orderType,
        tableId:     isBigIntId(input.tableId) ? input.tableId : null,
        tableName:   input.tableName ?? null,
        covers:      input.covers    ?? null,
        cashierName: input.cashierId,
        notes:       input.orderNotes ?? null,
        items: invoice.items.map((i) => ({
          productId:   i.productId ? String(i.productId) : null,
          productName: i.productName,
          quantity:    i.quantity,
        })),
      });
      console.debug('[KDS] kitchen:order:new', { branchId: input.branchId, invoiceId: String(invoice.id) });
      emitNewKitchenOrder(getIO(), input.branchId, kitchenOrder);
    } catch (err) {
      // Kitchen order failure must NOT roll back the invoice
      console.error('[KDS] Failed to create kitchen order:', err);
    }

    return invoice;
  }

  /** Paginated invoice list for a branch or till session.
   *  Pass `terminalId` to scope results to a single till (cashier view). */
  static async list(params: {
    branchId?:      string;
    tillSessionId?: string;
    terminalId?:    string | null;
    page:           number;
    limit:          number;
  }) {
    const { branchId, tillSessionId, terminalId, page, limit } = params;
    const skip  = (page - 1) * limit;
    const where = {
      isActive: true,
      ...(branchId      ? { branchId: toBigInt(branchId) }            : {}),
      ...(tillSessionId ? { tillSessionId: toBigInt(tillSessionId) } : {}),
      ...(terminalId    ? { terminalId: toBigInt(terminalId) }        : {}),
    };

    const [total, invoices] = await Promise.all([
      prisma.invoice.count({ where }),
      prisma.invoice.findMany({
        where,
        include: { items: true },
        orderBy: { date: 'desc' },
        skip,
        take:    limit,
      }),
    ]);

    return { invoices, total, page, pages: Math.ceil(total / limit) };
  }

  /** Category breakdown for a till session */
  static async categorySummary(tillSessionId: string) {
    return prisma.invoiceItem.groupBy({
      by:     ['category'],
      where:  { invoice: { tillSessionId: toBigInt(tillSessionId), isActive: true }, isActive: true },
      _sum:   { lineTotalPaisa: true, quantity: true },
      _count: { id: true },
      orderBy: { _sum: { lineTotalPaisa: 'desc' } },
    });
  }
}
