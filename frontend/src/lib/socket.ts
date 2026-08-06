// =============================================================================
// Socket.io client singleton
// Call connectKitchenSocket(branchId, token) once when the KDS screen mounts.
// =============================================================================

import { io, Socket } from 'socket.io-client';
import { SERVER_URL } from '@/config/api';

// Must be the root server URL — NOT the /api/v1 path

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(SERVER_URL, {
      autoConnect:       false,
      reconnection:      true,
      reconnectionDelay: 1_000,
      reconnectionAttempts: 10,
    });
  }
  return socket;
}

export function connectKitchenSocket(branchId: string, token: string): Socket {
  const s = getSocket();

  // Join the branch room — called on every (re)connect so the server always knows this screen's room
  const join = () => {
    console.log('[KDS] joining room for branch', branchId);
    s.emit('kitchen:join', { branchId, token });
  };

  // Always re-join on reconnect
  s.off('connect', join).on('connect', join);

  // If already connected, join immediately; otherwise connect() will trigger the handler above
  if (s.connected) {
    join();
  } else {
    s.connect();
  }

  return s;
}

export function disconnectSocket() {
  if (socket) {
    socket.off(); // remove all listeners before disconnecting
    socket.disconnect();
    socket = null; // reset singleton so next mount gets a fresh socket
  }
}
