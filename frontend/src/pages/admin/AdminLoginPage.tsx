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

export default function AdminLoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState<string>(localDefault(LOCAL_DEV_CREDENTIALS.admin.email));
  const [password, setPassword] = useState(localDefault(LOCAL_DEV_CREDENTIALS.admin.password));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      navigate(roleHomePage(user.role));
    } catch (err: any) {
      setError(err.message ?? 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };
  const handleSelectTestAccount = (role: 'admin' | 'manager' | 'pos') => {
    setError('');
    const cred = LOCAL_DEV_CREDENTIALS[role];
    setEmail(cred.email);
    setPassword(cred.password);
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden flex items-center justify-center">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl -ml-48 -mb-48"></div>
      </div>

      {/* Centered Container */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-4 sm:p-6">
        {/* Logo & Brand */}
        <div className="text-center mb-6 sm:mb-8 max-w-md">
          <div className="flex items-center justify-center mb-4 sm:mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-teal-600 rounded-2xl blur-lg opacity-50"></div>
              <div className="relative flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-teal-400 to-teal-600 rounded-2xl shadow-xl">
                <Settings className="w-9 h-9 sm:w-11 sm:h-11 text-white" />
              </div>
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-1.5 sm:mb-2">Admin Panel</h1>
          <p className="text-lg sm:text-xl text-teal-300 font-bold tracking-wide mb-2 sm:mb-3">Configuration & Management</p>
          <p className="text-slate-400 text-sm sm:text-base">Manage your POS system</p>
        </div>

        {/* Main Card - Responsive */}
        <div className="w-full max-w-sm">
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden h-fit flex flex-col">

            {/* Form Content */}
            <div className="p-4 sm:p-6">
              {/* Error Alert */}
              {error && (
                <div className="mb-4 flex gap-2.5 rounded-lg border border-red-500/30 bg-red-500/10 p-3 sm:p-4">
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-xs sm:text-sm font-semibold text-red-300">{error}</p>
                </div>
              )}

              {/* Demo Credentials */}
              {SHOW_DEMO_CREDENTIALS && (
                <div className="mb-4 rounded-xl border border-slate-700 bg-slate-900/40 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 className="w-4 h-4 text-teal-400" />
                    <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">Test Accounts (Click to Auto-fill)</p>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-2">
                    <button
                      type="button"
                      onClick={() => handleSelectTestAccount('admin')}
                      className="flex flex-col text-left p-2.5 rounded-lg border border-slate-700/50 bg-slate-800/40 hover:bg-slate-700/50 hover:border-slate-600 transition-all text-xs"
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className="font-bold text-teal-400">Admin Account</span>
                        <span className="px-1.5 py-0.5 rounded bg-teal-500/15 text-teal-400 font-mono text-[9px]">PIN: 1234</span>
                      </div>
                      <p className="text-slate-400 font-mono text-[10px] truncate">{LOCAL_DEV_CREDENTIALS.admin.email} · {LOCAL_DEV_CREDENTIALS.admin.password}</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelectTestAccount('manager')}
                      className="flex flex-col text-left p-2.5 rounded-lg border border-slate-700/50 bg-slate-800/40 hover:bg-slate-700/50 hover:border-slate-600 transition-all text-xs"
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className="font-bold text-purple-400">Manager Account</span>
                        <span className="px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-400 font-mono text-[9px]">PIN: 1234</span>
                      </div>
                      <p className="text-slate-400 font-mono text-[10px] truncate">{LOCAL_DEV_CREDENTIALS.manager.email} · {LOCAL_DEV_CREDENTIALS.manager.password}</p>
                    </button>
                  </div>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-3 sm:space-y-4">
                {/* Email */}
                <div>
                  <Label htmlFor="email" className="block text-xs sm:text-sm font-bold text-slate-200 mb-1.5">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="off"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg bg-slate-700/50 border border-slate-600 text-white text-xs sm:text-sm placeholder-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none transition-all"
                    required
                    autoFocus
                  />
                </div>

                {/* Password */}
                <div>
                  <Label htmlFor="password" className="block text-xs sm:text-sm font-bold text-slate-200 mb-1.5">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg bg-slate-700/50 border border-slate-600 text-white text-xs sm:text-sm placeholder-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none transition-all"
                    required
                  />
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2 sm:py-3 mt-4 sm:mt-6 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-bold text-sm sm:text-base rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 animate-spin inline" />
                      <span className="text-xs sm:text-base">Signing in...</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 inline" />
                      <span className="text-xs sm:text-base">Sign In</span>
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-slate-700/50">
                <p className="text-[10px] sm:text-xs text-slate-400 text-center">
                  Looking for POS?{' '}
                  <a href="/login" className="text-teal-400 hover:text-teal-300 font-bold transition-colors">
                    Go to POS login
                  </a>
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-700/50 px-4 sm:px-6 py-2.5 sm:py-3 bg-slate-900/30 shrink-0">
              <p className="text-center text-[10px] sm:text-xs text-slate-400 font-medium">
                Enterprise POS v1.0 • Administration
              </p>
            </div>
          </div>

          {/* Support Text */}
          <div className="mt-4 sm:mt-6 text-center text-slate-400 text-xs sm:text-sm hidden sm:block">
            <p>For support, contact your administrator</p>
          </div>
        </div>
      </div>
    </div>
  );
}
