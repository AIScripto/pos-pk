// =============================================================================
// Kitchen Gateway — Socket.io event handlers for the KDS
//
// Rooms:  kitchen:{branchId}   — all kitchen screens for a branch
//
// Client → Server events:
//   kitchen:acknowledge  { orderId }
//   kitchen:start        { orderId }
//   kitchen:ready        { orderId }
//   kitchen:served       { orderId }
//   kitchen:item:done    { orderId, itemId }
//   kitchen:join         { branchId, token }
//
// Server → Client events:
//   kitchen:order:new      KitchenOrder   (broadcast to branch room)
//   kitchen:order:updated  KitchenOrder   (broadcast to branch room)
//   kitchen:error          { message }
// =============================================================================

import jwt from 'jsonwebtoken';
import type { Server, Socket } from 'socket.io';
import { env } from '../../config/env';
import { KitchenService, KitchenStatus } from './kitchen.service';

interface KitchenJwtPayload {
  branchId?: string;
  branchIds?: string[];
}

/** Recursively convert BigInt fields to strings so socket.io can serialize them. */
function serialize<T>(data: T): T {
  return JSON.parse(JSON.stringify(data, (_key, value) =>
    typeof value === 'bigint' ? String(value) : value
  ));
}

export function registerKitchenGateway(io: Server) {

  io.on('connection', (socket: Socket) => {

    // ── Join branch room ────────────────────────────────────────────────────
    socket.on('kitchen:join', async ({ branchId, token }: { branchId: string; token: string }) => {
      let decoded: KitchenJwtPayload;

      // Step 1: verify JWT — disconnect immediately on auth failure
      try {
        decoded = jwt.verify(token, env.JWT_SECRET) as KitchenJwtPayload;
      } catch {
        socket.emit('kitchen:error', { message: 'Authentication failed — please log in again' });
        socket.disconnect();
        return;
      }

      // Step 2: validate branchId
      if (!branchId) {
        socket.emit('kitchen:error', { message: 'No branch assigned to this account — use PIN login on a branch terminal' });
        return;  // stay connected — don't disconnect; the page will handle the error
      }

      // Step 3: authorise requested branch against JWT scope
      const tokenBranchId = decoded.branchId ?? '';
      const tokenBranchIds = decoded.branchIds ?? [];
      const singleBranchMismatch = tokenBranchId && String(tokenBranchId) !== String(branchId);
      const multiBranchMismatch  = tokenBranchIds.length > 0 && !tokenBranchIds.map(String).includes(String(branchId));
      if (singleBranchMismatch || multiBranchMismatch) {
        socket.emit('kitchen:error', { message: 'You are not allowed to access this branch kitchen board' });
        return;
      }

      // Step 3: join room & hydrate
      try {
        const room = `kitchen:${branchId}`;
        await socket.join(room);
        console.log(`[KDS] socket ${socket.id} joined ${room}`);

        // Send current active orders so the screen hydrates immediately
        const orders = await KitchenService.activeOrders(branchId);
        socket.emit('kitchen:init', serialize(orders));
        console.log(`[KDS] sent kitchen:init — ${orders.length} active orders for branch ${branchId}`);
      } catch (err) {
        console.error('[KDS] Error during kitchen:join DB fetch:', err);
        socket.emit('kitchen:error', { message: `Failed to load orders: ${err}` });
        // Do NOT disconnect — socket is still authenticated, client can retry
      }
    });

    // ── Status transitions ──────────────────────────────────────────────────
    const handleStatusChange = (status: KitchenStatus) => async ({ orderId, branchId }: { orderId: string; branchId: string }) => {
      try {
        const updated = await KitchenService.updateStatus(orderId, status);
        io.to(`kitchen:${branchId}`).emit('kitchen:order:updated', serialize(updated));
      } catch (err) {
        socket.emit('kitchen:error', { message: `Failed to update order: ${err}` });
      }
    };

    socket.on('kitchen:acknowledge', handleStatusChange('acknowledged'));
    socket.on('kitchen:start', handleStatusChange('in_progress'));
    socket.on('kitchen:ready', handleStatusChange('ready'));
    socket.on('kitchen:served', handleStatusChange('served'));

    // ── Item done ───────────────────────────────────────────────────────────
    socket.on('kitchen:item:done', async ({ orderId, itemId, branchId }: { orderId: string; itemId: string; branchId: string }) => {
      try {
        await KitchenService.markItemDone(itemId);
        // Re-fetch full order so the client gets fresh item statuses
        const order = await KitchenService.updateStatus(orderId, 'in_progress');
        io.to(`kitchen:${branchId}`).emit('kitchen:order:updated', serialize(order));
      } catch (err) {
        socket.emit('kitchen:error', { message: `Failed to update item: ${err}` });
      }
    });

    socket.on('disconnect', () => {
      console.log(`[KDS] socket ${socket.id} disconnected`);
    });
  });
}

/** Utility — emit a new kitchen order to all screens in a branch.
 *  Called from InvoiceService after creating an invoice. */
export function emitNewKitchenOrder(io: Server, branchId: string | bigint, order: unknown) {
  io.to(`kitchen:${branchId}`).emit('kitchen:order:new', serialize(order));
}
