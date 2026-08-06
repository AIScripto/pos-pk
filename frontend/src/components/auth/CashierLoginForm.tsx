import React from 'react';
import { Loader2, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface TerminalOption {
  id: string;
  name: string;
  code?: string | null;
}

interface CashierLoginFormProps {
  email: string;
  setEmail: (val: string) => void;
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
 * Modular form component handling POS Cashier authentication.
 * Includes Till/Register selection, Email & Password input fields,
 * and submit action button with loading spinner.
 * 
 * @component
 */
export const CashierLoginForm: React.FC<CashierLoginFormProps> = ({
  email,
  setEmail,
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
    <form onSubmit={onSubmit} className="space-y-3 sm:space-y-4">
      {/* Till / Register Selection Dropdown */}
      <div>
        <Label htmlFor="till-select" className="block text-xs sm:text-sm font-bold text-slate-200 mb-1.5">
          Till / Register
        </Label>
        <select
          id="till-select"
          value={terminalId}
          onChange={(e) => setTerminalId(e.target.value)}
          disabled={terminalsLoading}
          className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg bg-slate-700/50 border border-slate-600 text-white text-xs sm:text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition-all disabled:opacity-50"
        >
          <option value="">
            {terminalsLoading ? 'Loading tills...' : 'Default Register (Counter 01)'}
          </option>
          {terminals.map((t) => (
            <option key={t.id} value={t.id}>
              {t.code ? `${t.code} - ${t.name}` : t.name}
            </option>
          ))}
        </select>
      </div>

      {/* Cashier Email Input */}
      <div>
        <Label htmlFor="cashier-email" className="block text-xs sm:text-sm font-bold text-slate-200 mb-1.5">
          Email
        </Label>
        <Input
          id="cashier-email"
          type="email"
          placeholder="cashier@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="off"
          className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg bg-slate-700/50 border border-slate-600 text-white text-xs sm:text-sm placeholder-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition-all"
          required
          autoFocus
        />
      </div>

      {/* Cashier Password Input */}
      <div>
        <Label htmlFor="cashier-password" className="block text-xs sm:text-sm font-bold text-slate-200 mb-1.5">
          Password
        </Label>
        <Input
          id="cashier-password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg bg-slate-700/50 border border-slate-600 text-white text-xs sm:text-sm placeholder-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition-all"
          required
        />
      </div>

      {/* Submit Action Button */}
      <Button
        type="submit"
        disabled={loading}
        className="w-full py-2 sm:py-3 mt-4 sm:mt-6 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold text-sm sm:text-base rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
      >
        {loading ? (
          <>
            <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 animate-spin inline" />
            <span className="text-xs sm:text-base">Signing in...</span>
          </>
        ) : (
          <>
            <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 inline" />
            <span className="text-xs sm:text-base">Enter POS</span>
          </>
        )}
      </Button>
    </form>
  );
};

export default CashierLoginForm;
