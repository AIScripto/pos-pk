// =============================================================================
// Auth API — login, PIN login, me, logout
// =============================================================================

import { api, setToken, clearToken } from './client';

export interface AuthUser {
  id:           string;
  name:         string;
  email?:       string;
  username?:    string;
  role:         string;
  branchId:     string;
  branchName:   string | null;
  branchIds:    string[];
  orgId:        string;
  terminalId:   string | null;
  terminalName: string | null;
  permissions:  string[];
}

export interface LoginResult {
  token: string;
  user:  AuthUser;
}

export interface ManagerApprovalResult {
  token: string;
  approvedBy: { id: string; name: string };
  expiresInSeconds: number;
}

export const authApi = {
  login(email: string, password: string, branchId?: string, terminalId?: string) {
    return api.post<LoginResult>('/auth/login', { email, password, branchId, terminalId }).then((r) => {
      setToken(r.token);
      return r;
    });
  },
  pinLogin(branchId: string, terminalId: string, pin: string) {
    return api.post<LoginResult>('/auth/pin', { branchId, terminalId, pin }).then((r) => {
      setToken(r.token);
      return r;
    });
  },
  managerApproval(input: {
    branchId?: string;
    action: 'discount.override';
    reason: string;
    email?: string;
    password?: string;
    pin?: string;
  }) {
    return api.post<ManagerApprovalResult>('/auth/manager-approval', input);
  },
  branches() {
    return api.get<{ id: string; name: string; label: string; addrCity: string }[]>(
      '/auth/branches'
    );
  },
  terminals(branchId?: string) {
    return api.get<{ id: string; name: string; code?: string | null; type?: string; description: string; hasOpenSession: boolean; openedBy: string | null }[]>(
      '/auth/terminals', branchId ? { branchId } : undefined
    );
  },
  me()     { return api.get<AuthUser>('/auth/me'); },
  logout() { clearToken(); return api.post<void>('/auth/logout', {}); },
  /** Verify current session user's PIN for lock-screen unlock (no new JWT issued). */
  verifyPin(pin: string) {
    return api.post<{ valid: boolean; reason?: string }>('/auth/verify-pin', { pin });
  },
};
