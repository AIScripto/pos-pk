// ─────────────────────────────────────────────────────────────────────────────
// Organisation → City → Branch → Terminal hierarchy
// ─────────────────────────────────────────────────────────────────────────────

import type { BaseEntity, Address } from './common.js';

// ── Organisation ─────────────────────────────────────────────────────────────

export interface Organisation extends BaseEntity {
  name:       string;
  slug:       string;   // URL-safe e.g. "enterprise-pos"
  logo?:      string;
  website?:   string;
  email?:     string;
  phone?:     string;
  address:    Address;
}

// ── City ─────────────────────────────────────────────────────────────────────

export interface City extends BaseEntity {
  orgId:    string;
  name:     string;      // "Lahore" | "Karachi"
  province: string;      // "Punjab" | "Sindh"
  country:  string;      // ISO 3166  "PK"
}

// ── Branch ───────────────────────────────────────────────────────────────────

export interface Branch extends BaseEntity {
  orgId:     string;
  cityId:    string;
  name:      string;     // "DHA Phase 5" | "Gulberg"
  code:      string;     // Short code  "DHA5" — used on receipts
  address:   Address;
  phone?:    string;
  email?:    string;
  managerId: string | null;  // userId of branch manager
  openTime:  string;     // "09:00"
  closeTime: string;     // "23:00"
  taxConfigId: string | null;  // branch can override org tax
}

// ── Terminal ──────────────────────────────────────────────────────────────────

export interface Terminal extends BaseEntity {
  branchId:    string;
  name:        string;   // "Counter 1" | "Drive-thru" | "Kiosk"
  description: string;
  lastSeenAt:  string | null;
}

// ── DTOs ─────────────────────────────────────────────────────────────────────

export interface CreateBranchDTO {
  orgId:     string;
  cityId:    string;
  name:      string;
  code:      string;
  address:   Address;
  phone?:    string;
  email?:    string;
  openTime:  string;
  closeTime: string;
}

export interface CreateTerminalDTO {
  branchId:    string;
  name:        string;
  description: string;
}
