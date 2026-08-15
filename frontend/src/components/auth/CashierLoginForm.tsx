import React from 'react';
import { Loader2, LogIn, Store, User, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface TerminalOption {
  id: string;
  name: string;
  code?: string | null;
}

interface CashierLoginFormProps {
  username: string;
  setUsername: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  terminals: TerminalOption[];
  terminalId: string;
  setTerminalId: (val: string) => void;
  terminalsLoading: boolean;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

/**
 * CashierLoginForm Component
 * 
 * Ergonomic POS Cashier authentication form optimized for touch displays and quick entry.
 * Features tactile 48px+ touch targets, clear field icons, and accessible focus states.
 * 
 * @component
 */
export const CashierLoginForm: React.FC<CashierLoginFormProps> = ({
  username,
  setUsername,
  password,
  setPassword,
  terminals,
  terminalId,
  setTerminalId,
  terminalsLoading,
  loading,
  onSubmit,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Till / Register Selection */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="till-select" className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Store className="w-3.5 h-3.5 text-emerald-400" />
            <span>Assigned Terminal / Register</span>
          </Label>
          <span className="text-[11px] font-medium text-emerald-400/90 bg-emerald-950/60 border border-emerald-500/20 px-2 py-0.5 rounded">
            POS Mode
          </span>
        </div>
        <div className="relative">
          <select
            id="till-select"
            value={terminalId}
            onChange={(e) => setTerminalId(e.target.value)}
            disabled={terminalsLoading}
            className="w-full h-12 px-3.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white text-sm font-medium focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 focus:outline-none transition-all disabled:opacity-50 appearance-none cursor-pointer"
          >
            {terminals.length === 0 && (
              <option value="">
                {terminalsLoading ? 'Scanning network tills...' : 'Default Register (Auto-assigned)'}
              </option>
            )}
            {terminals.map((t) => (
              <option key={t.id} value={t.id}>
                {t.code ? `${t.code} — ${t.name}` : t.name}
              </option>
            ))}
          </select>
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Cashier Username Input */}
      <div className="space-y-1.5">
        <Label htmlFor="cashier-username" className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-slate-400" />
          <span>Cashier Username</span>
        </Label>
        <div className="relative">
          <Input
            id="cashier-username"
            type="text"
            placeholder="e.g. cashier1, cashier2, tariq"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            className="w-full h-12 px-3.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white text-sm placeholder-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 focus:outline-none transition-all font-medium"
            required
            autoFocus
          />
        </div>
      </div>

      {/* Cashier Password Input */}
      <div className="space-y-1.5">
        <Label htmlFor="cashier-password" className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-slate-400" />
          <span>Security Passcode / Password</span>
        </Label>
        <div className="relative">
          <Input
            id="cashier-password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-12 px-3.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white text-sm placeholder-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 focus:outline-none transition-all"
            required
          />
        </div>
      </div>

      {/* Submit Action Button */}
      <Button
        type="submit"
        disabled={loading}
        className="w-full h-12 mt-6 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white font-bold text-sm sm:text-base rounded-xl transition-all shadow-lg shadow-emerald-900/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin inline" />
            <span>Verifying Terminal...</span>
          </>
        ) : (
          <>
            <LogIn className="w-4 h-4 inline" />
            <span>Launch POS Register</span>
          </>
        )}
      </Button>
    </form>
  );
};

export default CashierLoginForm;
