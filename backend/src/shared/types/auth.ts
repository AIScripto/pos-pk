// ─────────────────────────────────────────────────────────────────────────────
// Authentication & Authorisation
// ─────────────────────────────────────────────────────────────────────────────

import type { BaseEntity } from './common.js';

// ── Role hierarchy ────────────────────────────────────────────────────────────

export type UserRole =
  | 'super_admin'     // platform owner — all orgs
  | 'org_admin'       // HQ — full org access
  | 'city_manager'    // one city, all its branches
  | 'branch_manager'  // one branch, all its terminals
  | 'cashier'         // one terminal / assigned branch
  | 'kitchen';        // read-only KDS view

export type ScopeType =
  | 'platform'
  | 'organisation'
  | 'city'
  | 'branch';

// ── User ─────────────────────────────────────────────────────────────────────

export interface User extends BaseEntity {
  orgId:        string;
  name:         string;
  email:        string | null;
  phone:        string | null;
  /** 4-digit PIN for quick counter login (hashed server-side). */
  hasPin:       boolean;
  roles:        UserRoleAssignment[];
}

export interface UserRoleAssignment {
  id:        string;
  userId:    string;
  role:      UserRole;
  scopeType: ScopeType;
  scopeId:   string;   // org / city / branch id
}

// ── Auth payloads ─────────────────────────────────────────────────────────────

export interface LoginWithPasswordDTO {
  email:    string;
  password: string;
}

export interface LoginWithPinDTO {
  branchId: string;
  pin:      string;     // raw 4-digit PIN
}

/** Decoded JWT payload — embedded in every request */
export interface AuthToken {
  userId:      string;
  name:        string;
  role:        UserRole;
  scopeType:   ScopeType;
  scopeId:     string;
  branchId:    string;
  cityId:      string;
  orgId:       string;
  terminalId:  string | null;
  /** Resolved permissions: default role set + org overrides, baked into JWT */
  permissions: string[];
  iat:         number;
  exp:         number;
}

export interface AuthResult {
  token: string;
  user:  Omit<User, 'roles'> & {
    role:        UserRole;
    branchId:    string;
    orgId:       string;
    permissions: string[];
  };
}

// ── Permission helpers ────────────────────────────────────────────────────────

export const ROLE_RANK: Record<UserRole, number> = {
  super_admin:    100,
  org_admin:       80,
  city_manager:    60,
  branch_manager:  40,
  cashier:         20,
  kitchen:         10,
};

export const hasMinRole = (userRole: UserRole, minRole: UserRole): boolean =>
  ROLE_RANK[userRole] >= ROLE_RANK[minRole];
