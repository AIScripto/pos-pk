import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { authApi } from '@/lib/api/auth.api';
import { LogIn, Store, AlertCircle } from 'lucide-react';
import { SHOW_DEMO_CREDENTIALS, LOCAL_DEV_CREDENTIALS, localDefault } from '@/config/localCredentials';
import { rememberPosSelection } from '@/lib/pos-terminal-selection';
import { roleHomePage } from '@/utils/roleRedirect';

// Modular Auth Sub-Components
import { BrandHero } from '@/components/auth/BrandHero';
import { CashierLoginForm, TerminalOption } from '@/components/auth/CashierLoginForm';
import { AdminLoginForm } from '@/components/auth/AdminLoginForm';
import { DemoCredentialsPanel } from '@/components/auth/DemoCredentialsPanel';

type Mode = 'cashier' | 'admin';

/**
 * LoginPage Component
 * 
 * Orchestrating container component for POS & Back-Office authentication.
 * Manages mode switching (Cashier vs Admin), error states, till options,
 * and delegates form rendering to isolated, single-responsibility sub-components.
 * 
 * @component
 */
export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<Mode>('cashier');

  // Cashier Auth Form State
  const [cashierEmail, setCashierEmail] = useState<string>(localDefault(LOCAL_DEV_CREDENTIALS.pos.email));
  const [cashierPassword, setCashierPassword] = useState(localDefault(LOCAL_DEV_CREDENTIALS.pos.password));
  const [terminals, setTerminals] = useState<TerminalOption[]>([]);
  const [terminalId, setTerminalId] = useState('');
  const [terminalsLoading, setTerminalsLoading] = useState(false);

  // Admin Auth Form State
  const [email, setEmail] = useState<string>(localDefault(LOCAL_DEV_CREDENTIALS.admin.email));
  const [password, setPassword] = useState(localDefault(LOCAL_DEV_CREDENTIALS.admin.password));

  // Async Execution States
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // ── Effects ─────────────────────────────────────────────────────────────────

  /** Load available registers for web POS mode */
  useEffect(() => {
    if (mode !== 'cashier' || terminals.length > 0) return;
    setTerminalsLoading(true);
    authApi.terminals()
      .then((list) => {
        setTerminals(list);
        if (list.length > 0) {
          setTerminalId(list[0].id);
        }
      })
      .catch(() => {})
      .finally(() => setTerminalsLoading(false));
  }, [mode, terminals.length]);

  // ── Action Handlers ─────────────────────────────────────────────────────────

  const handleCashierLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(cashierEmail, cashierPassword, undefined, terminalId || undefined);
      const selectedTerm = terminals.find((t) => t.id === terminalId) ?? null;
      rememberPosSelection(user.branchId, selectedTerm);
      navigate(roleHomePage(user.role));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      navigate(roleHomePage(user.role));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTestAccount = (role: 'admin' | 'manager' | 'pos') => {
    setError('');
    const cred = LOCAL_DEV_CREDENTIALS[role];
    if (role === 'pos') {
      setMode('cashier');
      setCashierEmail(cred.email);
      setCashierPassword(cred.password);
    } else {
      setMode('admin');
      setEmail(cred.email);
      setPassword(cred.password);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
      {/* Background Glow Overlay */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl -ml-48 -mb-48"></div>
      </div>

      <div className="relative w-full h-full flex flex-col lg:flex-row">
        {/* Left Side Enterprise Brand Hero */}
        <BrandHero />

        {/* Right Side Interactive Login Section */}
        <div className="flex flex-col lg:w-2/3 items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden">
          {/* Mobile Branding Header */}
          <div className="lg:hidden mb-4 sm:mb-6">
            <div className="flex items-center justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-600 rounded-xl blur-lg opacity-50"></div>
                <div className="relative flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl shadow-xl">
                  <Store className="w-9 h-9 text-white" />
                </div>
              </div>
            </div>
            <h1 className="text-3xl font-black text-white text-center mt-3">Enterprise POS</h1>
          </div>

          {/* Main Form Card */}
          <div className="w-full max-w-sm lg:max-w-md">
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden h-fit flex flex-col">
              
              {/* Auth Mode Toggle Tabs */}
              <div className="flex border-b border-slate-700/50 p-1 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setMode('cashier');
                    setError('');
                  }}
                  className={`flex-1 py-2 sm:py-3 px-3 sm:px-4 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 rounded-lg ${
                    mode === 'cashier'
                      ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                      : 'text-slate-400 hover:text-slate-300'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Cashier</span>
                  <span className="sm:hidden">POS</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('admin');
                    setError('');
                  }}
                  className={`flex-1 py-2 sm:py-3 px-3 sm:px-4 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 rounded-lg ${
                    mode === 'admin'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      : 'text-slate-400 hover:text-slate-300'
                  }`}
                >
                  <Store className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Admin</span>
                </button>
              </div>

              {/* Form Content Area */}
              <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(100vh-200px)] sm:max-h-none">
                {/* Global Error Banner */}
                {error && (
                  <div className="mb-4 flex gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <p className="text-xs sm:text-sm font-semibold text-red-300">{error}</p>
                  </div>
                )}

                {/* Local Dev Demo Account Helper */}
                {SHOW_DEMO_CREDENTIALS && (
                  <DemoCredentialsPanel mode={mode} onSelectRole={handleSelectTestAccount} />
                )}

                {/* Active Form Renderer */}
                {mode === 'cashier' ? (
                  <CashierLoginForm
                    email={cashierEmail}
                    setEmail={setCashierEmail}
                    password={cashierPassword}
                    setPassword={setCashierPassword}
                    terminals={terminals}
                    terminalId={terminalId}
                    setTerminalId={setTerminalId}
                    terminalsLoading={terminalsLoading}
                    loading={loading}
                    onSubmit={handleCashierLogin}
                  />
                ) : (
                  <AdminLoginForm
                    email={email}
                    setEmail={setEmail}
                    password={password}
                    setPassword={setPassword}
                    loading={loading}
                    onSubmit={handleAdminLogin}
                  />
                )}
              </div>

              {/* Card Footer */}
              <div className="px-6 py-3 bg-slate-900/30 border-t border-slate-700/50 text-center">
                <p className="text-[11px] text-slate-400 font-medium">
                  Enterprise POS v1.0 • Point of Sale
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
