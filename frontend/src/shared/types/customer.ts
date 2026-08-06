// ─────────────────────────────────────────────────────────────────────────────
// Customer & Loyalty
// ─────────────────────────────────────────────────────────────────────────────

import type { BaseEntity } from './common.js';

// ── Customer ──────────────────────────────────────────────────────────────────

export interface Customer extends BaseEntity {
  orgId:          string;
  name:           string;
  phone:          string;          // primary key for lookup
  email:          string | null;
  dateOfBirth:    string | null;   // ISO date "YYYY-MM-DD"
  phoneVerified:  boolean;
  marketingOptIn: boolean;
  smsOptIn:       boolean;

  // Loyalty balances
  loyaltyPoints:   number;         // current redeemable balance
  lifetimePoints:  number;         // all-time earned (never decreases)
  tierId:          string | null;  // current LoyaltyTier id

  // Stats (denormalised for fast display)
  totalOrders:     number;
  totalSpentPaisa: number;
  lastOrderAt:     string | null;
  lastBranchId:    string | null;
}

// ── Loyalty Transaction (full audit trail) ────────────────────────────────────

export type LoyaltyTxType =
  | 'earn'
  | 'redeem'
  | 'expire'
  | 'manual_add'
  | 'manual_deduct';

export interface LoyaltyTransaction extends BaseEntity {
  customerId:  string;
  orgId:       string;
  branchId:    string;
  invoiceId:   string | null;
  type:        LoyaltyTxType;
  points:      number;    // positive = earn, negative = redeem/expire
  balance:     number;    // balance AFTER this transaction
  description: string;
  approvedBy:  string | null;   // userId if manual adjustment
}

// ── OTP ───────────────────────────────────────────────────────────────────────

export type OtpPurpose = 'register' | 'login' | 'redeem';

export interface OtpCode extends BaseEntity {
  customerId: string | null;
  phone:      string;
  purpose:    OtpPurpose;
  expiresAt:  string;
  usedAt:     string | null;
}

// ── Messaging ─────────────────────────────────────────────────────────────────

export type MessageChannel = 'sms' | 'whatsapp' | 'email';
export type MessageType =
  | 'otp' | 'deal' | 'birthday' | 'points_earned'
  | 'points_expiry' | 'tier_upgrade' | 'receipt';
export type MessageStatus = 'pending' | 'sent' | 'delivered' | 'failed';

export interface CustomerMessage extends BaseEntity {
  customerId: string;
  orgId:      string;
  channel:    MessageChannel;
  type:       MessageType;
  content:    string;
  status:     MessageStatus;
  sentAt:     string | null;
  deliveredAt: string | null;
}

// ── DTOs ─────────────────────────────────────────────────────────────────────

export interface RegisterCustomerDTO {
  orgId:          string;
  name:           string;
  phone:          string;
  email?:         string;
  dateOfBirth?:   string;
  marketingOptIn?: boolean;
  smsOptIn?:      boolean;
}

export interface VerifyOtpDTO {
  phone:   string;
  code:    string;
  purpose: OtpPurpose;
}
