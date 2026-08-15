// =============================================================================
// AuthContext — global auth state, login/logout, permission checks
// =============================================================================

import React, {
  createContext, useContext, useState,
  useEffect, useCallback, ReactNode,
} from 'react';
import { authApi } from '@/lib/api/auth.api';

const SCREEN_LOCK_STORAGE_KEY = 'pos-app-screen-locked';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id:           string;
  name:         string;
  email:        string;
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

interface AuthState {
  user:        AuthUser | null;
  isLoading:   boolean;
  isLoggedIn:  boolean;
}

interface AuthContextValue extends AuthState {
  /** Email + password login — returns the logged-in user so callers can redirect by role */
  login:      (email: string, password: string, branchId?: string, terminalId?: string) => Promise<AuthUser>;
  /** 4-digit PIN login (cashiers) — requires terminal selection */
  pinLogin:   (branchId: string, terminalId: string, pin: string) => Promise<AuthUser>;
  logout:     () => void;
  /** Check if the logged-in user has a specific permission */
  can:        (permission: string) => boolean;
  /** Check if the user has a minimum role level */
  hasRole:    (minRole: string)    => boolean;
}

// ── Role rank (mirrors server) ────────────────────────────────────────────────

const ROLE_RANK: Record<string, number> = {
  super_admin:    100,
  org_admin:       80,
  admin:           80,
  city_manager:    60,
  branch_manager:  40,
  manager:         40,
  cashier:         20,
  kitchen:         10,
};

// ── Context ───────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user:      null,
    isLoading: true,   // true until we check localStorage
    isLoggedIn: false,
  });

  // ── Restore session on mount ─────────────────────────────────────────────

  useEffect(() => {
    authApi.me()
      .then((user) => {
        setState({ user: user as AuthUser, isLoading: false, isLoggedIn: true });
      })
      .catch(() => {
        setState({ user: null, isLoading: false, isLoggedIn: false });
      });
  }, []);

  // ── Login ────────────────────────────────────────────────────────────────

  const login = useCallback(async (email: string, password: string, branchId?: string, terminalId?: string): Promise<AuthUser> => {
    const normalizedEmail = email.trim().toLowerCase();
    const result = await authApi.login(normalizedEmail, password, branchId, terminalId);
    const user = result.user as AuthUser;
    localStorage.removeItem(SCREEN_LOCK_STORAGE_KEY);
    setState({ user, isLoading: false, isLoggedIn: true });
    return user;
  }, []);

  const pinLogin = useCallback(async (branchId: string, terminalId: string, pin: string): Promise<AuthUser> => {
    const result = await authApi.pinLogin(branchId, terminalId, pin);
    const user = result.user as AuthUser;
    localStorage.removeItem(SCREEN_LOCK_STORAGE_KEY);
    setState({ user, isLoading: false, isLoggedIn: true });
    return user;
  }, []);

  // ── Logout ───────────────────────────────────────────────────────────────

  const logout = useCallback(() => {
    authApi.logout().catch(() => {});
    setState({ user: null, isLoading: false, isLoggedIn: false });
  }, []);

  // ── Permission helpers ───────────────────────────────────────────────────

  const can = useCallback((permission: string): boolean => {
    return state.user?.permissions?.includes(permission) ?? false;
  }, [state.user]);

  const hasRole = useCallback((minRole: string): boolean => {
    const userRank = ROLE_RANK[state.user?.role ?? ''] ?? 0;
    const minRank  = ROLE_RANK[minRole]               ?? 0;
    return userRank >= minRank;
  }, [state.user]);

  return (
    <AuthContext.Provider value={{ ...state, login, pinLogin, logout, can, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Hooks ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

/** Convenience hook — returns true if user has the permission */
export function usePermission(permission: string): boolean {
  const { can } = useAuth();
  return can(permission);
}

/** Convenience hook — returns true if user meets minimum role */
export function useRole(minRole: string): boolean {
  const { hasRole } = useAuth();
  return hasRole(minRole);
}
