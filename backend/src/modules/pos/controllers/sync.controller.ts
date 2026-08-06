import { Request, Response } from 'express';
import * as R from '../../../shared/lib/response';
import prisma from '../../../shared/lib/prisma';
import { InvoiceService, type CreateInvoiceInput } from '../services/invoice.service';
import { TillService } from '../services/till.service';

interface SyncQueueItem {
  id: string;
  method: 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  path: string;
  body?: unknown;
  timestamp: number;
}

interface SyncResult {
  id: string;
  status: 'success' | 'error';
  error?: string;
  data?: unknown;
}

export class SyncController {
  /**
   * Batch sync endpoint: processes multiple queued items sequentially in separate transactions
   * Isolates failures so a single error does not block or roll back the entire batch.
   */
  static async batchSync(req: Request, res: Response) {
    try {
      const items: SyncQueueItem[] = req.body.items || [];

      if (!Array.isArray(items) || items.length === 0) {
        return R.badRequest(res, 'items array required');
      }

      if (items.length > 100) {
        return R.badRequest(res, 'Maximum 100 items per batch');
      }

      const results: SyncResult[] = [];

      for (const item of items) {
        try {
          const result = await prisma.$transaction(async (tx) => {
            return processSyncItem(tx, item, req.auth!);
          });
          results.push({
            id: item.id,
            status: 'success',
            data: result,
          });
        } catch (error) {
          results.push({
            id: item.id,
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }

      return R.ok(res, {
        processed: results.length,
        results,
      });
    } catch (error) {
      console.error('Batch sync error:', error);
      return R.serverError(res, 'Batch sync failed');
    }
  }

  /**
   * Alternative: Process items sequentially in separate transactions (alias to batchSync)
   */
  static async batchSyncSequential(req: Request, res: Response) {
    return this.batchSync(req, res);
  }
}

/**
 * Route the sync item to the appropriate service based on path
 */
async function processSyncItem(tx: any, item: SyncQueueItem, auth: any): Promise<unknown> {
  const { method, path } = item;
  const body = typeof item.body === 'object' && item.body !== null
    ? item.body as Record<string, unknown>
    : {};

  // Parse path to determine action
  if (path.startsWith('/api/v1/invoices') || path.startsWith('/invoices')) {
    if (method === 'POST') {
      const createInput: CreateInvoiceInput = {
        ...(body as Record<string, unknown>),
        items: Array.isArray(body.items) ? body.items as CreateInvoiceInput['items'] : [],
        orgId: auth.orgId,
        cityId: auth.cityId,
        branchId: auth.branchId,
        terminalId: auth.terminalId ?? String(body.terminalId ?? ''),
        tillSessionId: String(body.tillSessionId ?? ''),
        cashierId: auth.userId,
        paymentMethod: String(body.paymentMethod ?? 'cash'),
        orderType: String(body.orderType ?? 'dine_in'),
      };

      return InvoiceService.create(createInput, tx);
    }

    if (method === 'DELETE') {
      const invoiceId = path.split('/').pop();
      if (!invoiceId) throw new Error('Invoice id required');

      return tx.invoice.update({
        where: { id: BigInt(invoiceId) },
        data: {
          paymentStatus: 'voided',
          voidReason: typeof body.reason === 'string' ? body.reason : 'Offline sync void',
          voidedBy: auth.userId,
          isActive: false,
        },
      });
    }
  }

  if (path.startsWith('/api/v1/till') || path.startsWith('/till')) {
    if (path.includes('/open')) {
      return TillService.open({
        orgId: auth.orgId,
        cityId: auth.cityId,
        branchId: auth.branchId,
        terminalId: auth.terminalId ?? String(body.terminalId ?? ''),
        openedBy: auth.userId,
        openedByName: auth.name,
        openingCashAmount: Number(body.openingCashPaisa ?? body.openingCashAmount ?? 0),
        openingDenomJson: typeof body.openingDenomJson === 'string'
          ? body.openingDenomJson
          : JSON.stringify(body.denominations ?? []),
        notes: typeof body.notes === 'string' ? body.notes : undefined,
      }, tx);
    }

    if (path.includes('/close')) {
      return TillService.close({
        sessionId: String(body.sessionId ?? ''),
        closedBy: auth.userId,
        closedByName: auth.name,
        closingDenomJson: typeof body.closingDenomJson === 'string'
          ? body.closingDenomJson
          : JSON.stringify(body.denominations ?? []),
        closingCashAmount: Number(body.closingCashPaisa ?? body.closingCashAmount ?? 0),
        notes: typeof body.notes === 'string' ? body.notes : undefined,
      }, tx);
    }
  }

  throw new Error(`Unknown sync path: ${path}`);
}
