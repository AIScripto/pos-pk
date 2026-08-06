// =============================================================================
// Socket.io singleton — one Server instance shared across the application
// Import `io` wherever you need to emit events to connected clients
// =============================================================================

import { Server } from 'socket.io';

let io: Server;

export function getIO(): Server {
  if (!io) throw new Error('Socket.io not initialised. Call initIO(httpServer) first.');
  return io;
}

export function initIO(httpServer: import('http').Server): Server {
  io = new Server(httpServer, {
    cors: {
      origin: '*',         // tightened per env in index.ts
      methods: ['GET', 'POST'],
    },
    // ping every 25 s, disconnect after 60 s silence
    pingInterval: 25_000,
    pingTimeout:  60_000,
  });
  return io;
}
