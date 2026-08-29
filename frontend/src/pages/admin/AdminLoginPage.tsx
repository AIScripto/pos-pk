import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Settings, LogIn, CheckCircle2, AlertCircle } from 'lucide-react';
import { SHOW_DEMO_CREDENTIALS, LOCAL_DEV_CREDENTIALS, localDefault } from '@/config/localCredentials';
import { roleHomePage } from '@/utils/roleRedirect';
import { useTranslation } from '@/i18n';

export default function AdminLoginPage() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState<string>(localDefault(LOCAL_DEV_CREDENTIALS.admin.username));
  const [password, setPassword] = useState(localDefault(LOCAL_DEV_CREDENTIALS.admin.password));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(username, password);
      navigate(roleHomePage(user.role));
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      setError(errorObj.message ?? 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };
  const handleSelectTestAccount = (role: 'admin' | 'manager' | 'pos') => {
    setError('');
    const cred = LOCAL_DEV_CREDENTIALS[role];
    setUsername(cred.username);
    setPassword(cred.password);
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-screen-raised via-screen-raised-2 to-screen-raised overflow-hidden flex items-center justify-center">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-success/10 rounded-full blur-3xl -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-success/10 rounded-full blur-3xl -ml-48 -mb-48"></div>
      </div>

      {/* Centered Container */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-4 sm:p-6">
        {/* Logo & Brand */}
        <div className="text-center mb-6 sm:mb-8 max-w-md">
          <div className="flex items-center justify-center mb-4 sm:mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-brand-admin to-brand-admin-deep rounded-2xl blur-lg opacity-50"></div>
              <div className="relative flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-brand-admin to-brand-admin-deep rounded-2xl shadow-xl">
                <Settings className="w-9 h-9 sm:w-11 sm:h-11 text-screen-foreground" />
              </div>
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-screen-foreground mb-1.5 sm:mb-2">{t.admin.backOffice}</h1>
          <p className="text-lg sm:text-xl text-success font-bold tracking-wide mb-2 sm:mb-3">{t.config.configTitle}</p>
        </div>

        {/* Main Card - Responsive */}
        <div className="w-full max-w-sm">
          <div className="bg-screen-raised-2/50 backdrop-blur-xl rounded-2xl border border-screen-border/50 shadow-2xl overflow-hidden h-fit flex flex-col">

            {/* Form Content */}
            <div className="p-4 sm:p-6">
              {/* Error Alert */}
              {error && (
                <div className="mb-4 flex gap-2.5 rounded-lg border border-danger/30 bg-danger/10 p-3 sm:p-4">
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-danger shrink-0 mt-0.5" />
                  <p className="text-xs sm:text-sm font-semibold text-danger">{error}</p>
                </div>
              )}

              {/* Demo Credentials */}
              {SHOW_DEMO_CREDENTIALS && (
                <div className="mb-4 rounded-xl border border-screen-border bg-screen-raised/40 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    <p className="text-xs font-bold text-screen-subtle uppercase tracking-wider">Demo Accounts</p>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-2">
                    <button
                      type="button"
                      onClick={() => handleSelectTestAccount('admin')}
                      className="flex flex-col text-left p-2.5 rounded-lg border border-screen-border/50 bg-screen-raised-2/40 hover:bg-screen-border/50 hover:border-screen-muted/60 transition-all text-xs cursor-pointer"
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className="font-bold text-success">{t.roles.admin}</span>
                        <span className="px-1.5 py-0.5 rounded bg-success/15 text-success font-mono text-2xs">PIN: 1234</span>
                      </div>
                      <p className="text-screen-muted font-mono text-2xs truncate">{LOCAL_DEV_CREDENTIALS.admin.username} · {LOCAL_DEV_CREDENTIALS.admin.password}</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelectTestAccount('manager')}
                      className="flex flex-col text-left p-2.5 rounded-lg border border-screen-border/50 bg-screen-raised-2/40 hover:bg-screen-border/50 hover:border-screen-muted/60 transition-all text-xs cursor-pointer"
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className="font-bold text-special">{t.roles.manager}</span>
                        <span className="px-1.5 py-0.5 rounded bg-special/15 text-special font-mono text-2xs">PIN: 1234</span>
                      </div>
                      <p className="text-screen-muted font-mono text-2xs truncate">{LOCAL_DEV_CREDENTIALS.manager.username} · {LOCAL_DEV_CREDENTIALS.manager.password}</p>
                    </button>
                  </div>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-3 sm:space-y-4">
                {/* Username */}
                <div>
                  <Label htmlFor="username" className="block text-xs sm:text-sm font-bold text-screen-foreground mb-1.5">
                    {t.auth.username}
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder={t.auth.username}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg bg-screen-border/50 border border-screen-dim text-screen-foreground text-xs sm:text-sm placeholder-screen-muted focus:border-success focus:ring-2 focus:ring-success/20 focus:outline-none transition-all"
                    required
                    autoFocus
                  />
                </div>

                {/* Password */}
                <div>
                  <Label htmlFor="password" className="block text-xs sm:text-sm font-bold text-screen-foreground mb-1.5">
                    {t.auth.password}
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg bg-screen-border/50 border border-screen-dim text-screen-foreground text-xs sm:text-sm placeholder-screen-muted focus:border-success focus:ring-2 focus:ring-success/20 focus:outline-none transition-all"
                    required
                  />
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2 sm:py-3 mt-4 sm:mt-6 bg-success hover:bg-success/90 text-screen-foreground font-bold text-sm sm:text-base rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 animate-spin inline" />
                      <span className="text-xs sm:text-base">{t.common.loading}</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 inline" />
                      <span className="text-xs sm:text-base">{t.auth.loginButton}</span>
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-screen-border/50">
                <p className="text-2xs sm:text-xs text-screen-muted text-center">
                  Looking for POS?{' '}
                  <a href="/login" className="text-success hover:text-success font-bold transition-colors">
                    Go to POS login
                  </a>
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-screen-border/50 px-4 sm:px-6 py-2.5 sm:py-3 bg-screen-raised/30 shrink-0">
              <p className="text-center text-2xs sm:text-xs text-screen-muted font-medium">
                Enterprise POS v1.0 • Administration
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

