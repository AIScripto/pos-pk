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
  const [cashierUsername, setCashierUsername] = useState<string>(localDefault(LOCAL_DEV_CREDENTIALS.pos.username));
  const [cashierPassword, setCashierPassword] = useState(localDefault(LOCAL_DEV_CREDENTIALS.pos.password));
  const [terminals, setTerminals] = useState<TerminalOption[]>([]);
  const [terminalId, setTerminalId] = useState('');
  const [terminalsLoading, setTerminalsLoading] = useState(false);

  // Admin Auth Form State
  const [adminUsername, setAdminUsername] = useState<string>(localDefault(LOCAL_DEV_CREDENTIALS.admin.username));
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
      const user = await login(cashierUsername, cashierPassword, undefined, terminalId || undefined);
      const selectedTerm =
        terminals.find((t) => t.id === (terminalId || user?.terminalId)) ??
        (user?.terminalId ? { id: user.terminalId, name: user.terminalName || 'Default Register' } : null);
      rememberPosSelection(user?.branchId, selectedTerm);
      navigate(roleHomePage(user?.role || 'cashier'));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(adminUsername, password);
      navigate(roleHomePage(user.role));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTestAccount = (role: 'admin' | 'manager' | 'pos') => {
    setError('');
    const cred = LOCAL_DEV_CREDENTIALS[role];
    if (role === 'pos') {
      setMode('cashier');
      setCashierUsername(cred.username);
      setCashierPassword(cred.password);
    } else {
      setMode('admin');
      setAdminUsername(cred.username);
      setPassword(cred.password);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-screen-raised via-screen-raised-2 to-screen-raised overflow-hidden">
      {/* Background Glow Overlay */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-warning/10 rounded-full blur-3xl -ml-48 -mb-48"></div>
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
                <div className="absolute inset-0 bg-gradient-to-r from-brand to-brand-deep rounded-xl blur-lg opacity-50"></div>
                <div className="relative flex items-center justify-center w-16 h-16 bg-gradient-to-br from-brand to-brand-deep rounded-xl shadow-xl">
                  <Store className="w-9 h-9 text-screen-foreground" />
                </div>
              </div>
            </div>
            <h1 className="text-3xl font-black text-screen-foreground text-center mt-3">Enterprise POS</h1>
          </div>

          {/* Main Form Card */}
          <div className="w-full max-w-sm lg:max-w-md">
            <div className="bg-screen-raised-2/50 backdrop-blur-xl rounded-2xl border border-screen-border/50 shadow-2xl overflow-hidden h-fit flex flex-col">
              
              {/* Auth Mode Toggle Tabs */}
              <div className="flex border-b border-screen-border/60 p-1.5 bg-screen-raised/60 shrink-0 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setMode('cashier');
                    setError('');
                  }}
                  className={`flex-1 py-2.5 px-3 font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 rounded-xl ${
                    mode === 'cashier'
                      ? 'bg-success/20 text-success border border-success/40 shadow-sm'
                      : 'text-screen-muted hover:text-screen-foreground hover:bg-screen-border/40'
                  }`}
                >
                  <LogIn className="w-4 h-4" />
                  <span>Cashier (POS)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('admin');
                    setError('');
                  }}
                  className={`flex-1 py-2.5 px-3 font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 rounded-xl ${
                    mode === 'admin'
                      ? 'bg-primary/20 text-primary border border-primary/40 shadow-sm'
                      : 'text-screen-muted hover:text-screen-foreground hover:bg-screen-border/40'
                  }`}
                >
                  <Store className="w-4 h-4" />
                  <span>Admin Portal</span>
                </button>
              </div>

              {/* Form Content Area */}
              <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(100vh-200px)] sm:max-h-none">
                {/* Global Error Banner */}
                {error && (
                  <div className="mb-4 flex gap-2 rounded-lg border border-danger/30 bg-danger/10 p-3">
                    <AlertCircle className="w-4 h-4 text-danger shrink-0 mt-0.5" />
                    <p className="text-xs sm:text-sm font-semibold text-danger">{error}</p>
                  </div>
                )}

                {/* Local Dev Demo Account Helper */}
                {SHOW_DEMO_CREDENTIALS && (
                  <DemoCredentialsPanel mode={mode} onSelectRole={handleSelectTestAccount} />
                )}

                {/* Active Form Renderer */}
                {mode === 'cashier' ? (
                  <CashierLoginForm
                    username={cashierUsername}
                    setUsername={setCashierUsername}
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
                    username={adminUsername}
                    setUsername={setAdminUsername}
                    password={password}
                    setPassword={setPassword}
                    loading={loading}
                    onSubmit={handleAdminLogin}
                  />
                )}
              </div>

              {/* Card Footer */}
              <div className="px-6 py-3 bg-screen-raised/30 border-t border-screen-border/50 text-center">
                <p className="text-[11px] text-screen-muted font-medium">
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
