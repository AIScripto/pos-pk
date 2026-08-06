// ─────────────────────────────────────────────────────────────────────────────
// Table / Floor-Plan Management
// ─────────────────────────────────────────────────────────────────────────────

import type { BaseEntity } from './common.js';

export type TableStatus =
  | 'available'
  | 'occupied'
  | 'reserved'
  | 'cleaning'
  | 'blocked';

export type TableShape = 'square' | 'round' | 'rectangle';

// ── Section (e.g. "Ground Floor", "Rooftop", "VIP") ──────────────────────────

export interface TableSection extends BaseEntity {
  branchId: string;
  name:     string;
  color:    string;   // hex — used on floor plan
  sortOrder: number;
}

// ── Table ─────────────────────────────────────────────────────────────────────

export interface Table extends BaseEntity {
  branchId:    string;
  sectionId:   string | null;
  number:      string;         // "T1" | "VIP-3" | "BAR-1"
  displayName: string | null;  // "Window Seat" | "Corner Booth"
  capacity:    number;
  shape:       TableShape;
  /** Floor-plan grid position (used by the visual layout editor) */
  posX:        number;
  posY:        number;
  /** Current runtime status — stored in DB, updated in real-time */
  status:      TableStatus;
  /** UserId of server/waiter currently assigned */
  assignedTo:  string | null;
  /** Timestamp when table became occupied */
  occupiedAt:  string | null;
  /** Number of covers (guests) currently seated */
  covers:      number;
}

// ── Reservation ───────────────────────────────────────────────────────────────

export type ReservationStatus =
  | 'confirmed' | 'seated' | 'completed' | 'cancelled' | 'no_show';

export interface Reservation extends BaseEntity {
  branchId:    string;
  tableId:     string | null;
  guestName:   string;
  guestPhone:  string;
  covers:      number;
  date:        string;   // ISO date "2026-03-20T19:00:00Z"
  durationMin: number;   // expected duration in minutes
  status:      ReservationStatus;
  notes:       string | null;
}

// ── DTOs ─────────────────────────────────────────────────────────────────────

export interface CreateTableDTO {
  branchId:    string;
  sectionId?:  string;
  number:      string;
  displayName?: string;
  capacity:    number;
  shape?:      TableShape;
  posX?:       number;
  posY?:       number;
}

export interface CreateReservationDTO {
  branchId:   string;
  tableId?:   string;
  guestName:  string;
  guestPhone: string;
  covers:     number;
  date:       string;
  durationMin?: number;
  notes?:     string;
}
