import { useState, useEffect, useCallback } from 'react';
import { Delete, LockKeyhole, LogIn } from 'lucide-react';
import { useLock }   from '@/context/LockContext';
import { useAuth }   from '@/context/AuthContext';
import { useAppConfig } from '@/context/AppConfigContext';
import { authApi }   from '@/lib/api/auth.api';
import { useTranslation } from '@/i18n';
import { SHOW_DEMO_CREDENTIALS, LOCAL_DEV_CREDENTIALS, localDefault } from '@/config/localCredentials';

const KEYS = ['1','2','3','4','5','6','7','8','9','','0','⌫'];
const PIN_LENGTH = 4;

export function LockScreen() {
  const { t }                     = useTranslation();
  const { unlock }                = useLock();
  const { user }                  = useAuth();
  const { currencyConfig }        = useAppConfig();

  const [pin,         setPin]     = useState('');
  const [error,       setError]   = useState('');
  const [shaking,     setShaking] = useState(false);
  const [loading,     setLoading] = useState(false);
  const [usePassword, setUsePassword] = useState(() => !user?.branchId && !user?.branchName);
  // Default to PIN if user has one set; fall back to password for admin users without a PIN
  const [username,    setUsername] = useState(() => user?.username ?? user?.email ?? LOCAL_DEV_CREDENTIALS.admin.username);
  const [password,    setPassword] = useState(() => localDefault(LOCAL_DEV_CREDENTIALS.admin.password));
  const [time,        setTime]    = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const shake = useCallback(() => {
    setShaking(true);
    setPin('');
    setTimeout(() => setShaking(false), 600);
  }, []);

  // ── PIN submit — validates against current session user, no new JWT ────────

  const submitPin = useCallback(async (fullPin: string) => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const { valid, reason } = await authApi.verifyPin(fullPin);
      if (!valid) {
        if (reason === 'NO_PIN_SET') {
          setError(t.lock.invalidPin);
          setUsePassword(true);
        } else {
          setError(t.lock.invalidPin);
        }
        shake();
        return;
      }
      unlock();
    } catch {
      setError(t.lock.invalidPin);
      shake();
    } finally {
      setLoading(false);
    }
  }, [user, unlock, shake, t]);


  // ── PIN key handler ───────────────────────────────────────────────────────

  const handleKey = useCallback((key: string) => {
    if (loading) return;
    if (key === '⌫') {
      setPin(p => p.slice(0, -1));
      setError('');
      return;
    }
    if (!/^\d$/.test(key)) return;
    const next = pin + key;
    if (next.length > PIN_LENGTH) return;
    setPin(next);
    setError('');
    if (next.length === PIN_LENGTH) submitPin(next);
  }, [pin, loading, submitPin]);

  // ── Keyboard support ──────────────────────────────────────────────────────

  useEffect(() => {
    if (usePassword) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (/^\d$/.test(e.key)) handleKey(e.key);
      else if (e.key === 'Backspace') handleKey('⌫');
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleKey, usePassword]);

  // ── Password submit (manager / admin) ────────────────────────────────────

  const submitPassword = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authApi.login(username, password);
      unlock();
    } catch {
      setError('Invalid credentials.');
      setPassword(localDefault(LOCAL_DEV_CREDENTIALS.admin.password));
    } finally {
      setLoading(false);
    }
  }, [username, password, unlock]);

  // ── Formatted time ────────────────────────────────────────────────────────

  const formattedTime = time.toLocaleTimeString(currencyConfig.locale, {
    hour: '2-digit', minute: '2-digit', hour12: false,
  });
  const formattedDate = time.toLocaleDateString(currencyConfig.locale, {
    weekday: 'long', month: 'long', day: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-md select-none">

      {/* Clock */}
      <div className="mb-8 text-center">
        <p className="font-display font-extrabold text-6xl tabular-nums text-foreground leading-none">
          {formattedTime}
        </p>
        <p className="mt-1 font-display text-sm uppercase tracking-widest text-muted-foreground">
          {formattedDate}
        </p>
      </div>

      {/* Card */}
      <div className="w-full max-w-xs rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex flex-col items-center gap-2 px-6 pt-6 pb-4 border-b border-border">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-warning shadow-lg shadow-primary/30">
            <LockKeyhole className="w-6 h-6 text-white" />
          </div>
          <div className="text-center">
            <p className="font-display font-extrabold text-base text-foreground">
              {user?.name ?? t.lock.lockedTitle}
            </p>
            {user?.role && (
              <span className="inline-block mt-0.5 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 font-body text-2xs uppercase tracking-wider text-primary font-semibold">
                {user.role.replace('_', ' ')}
              </span>
            )}
          </div>
        </div>

        <div className="px-6 py-5">
          {!usePassword ? (
            <>
              {/* PIN dots */}
              <div
                className={`flex justify-center gap-3 mb-5 transition-transform ${shaking ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}
              >
                {Array.from({ length: PIN_LENGTH }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-3 w-3 rounded-full border-2 transition-all duration-150 ${
                      i < pin.length
                        ? 'bg-primary border-primary scale-110'
                        : 'bg-transparent border-muted-foreground/40'
                    }`}
                  />
                ))}
              </div>

              {/* Error */}
              {error && (
                <p className="mb-3 text-center text-xs font-body text-destructive">
                  {error}
                </p>
              )}

              {/* Numpad */}
              <div className="grid grid-cols-3 gap-2">
                {KEYS.map((key, idx) => {
                  if (key === '') return <div key={idx} />;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleKey(key)}
                      disabled={loading}
                      className={`flex items-center justify-center rounded-xl border font-display font-bold text-lg transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer
                        ${key === '⌫'
                          ? 'border-border bg-secondary text-muted-foreground hover:bg-muted h-11'
                          : 'border-border bg-secondary text-foreground hover:bg-muted h-11'
                        }
                        disabled:opacity-50`}
                    >
                      {key === '⌫' ? <Delete className="w-4 h-4" /> : key}
                    </button>
                  );
                })}
              </div>

              {/* Switch to password */}
              <button
                onClick={() => {
                  setUsePassword(true);
                  setPin('');
                  setError('');
                  setUsername(user?.username ?? user?.email ?? LOCAL_DEV_CREDENTIALS.admin.username);
                  setPassword(localDefault(LOCAL_DEV_CREDENTIALS.admin.password));
                }}
                className="mt-4 w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors font-body cursor-pointer"
              >
                {t.auth.passwordLoginTab}
              </button>
            </>
          ) : (
            /* Password form */
            <form onSubmit={submitPassword} className="flex flex-col gap-3">
              <input
                type="text"
                placeholder={t.auth.emailPlaceholder}
                value={username}
                onChange={e => setUsername(e.target.value)}
                autoFocus
                required
                className="w-full rounded-xl border border-border bg-secondary px-3 py-2.5 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                type="password"
                placeholder={t.auth.passwordPlaceholder}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-border bg-secondary px-3 py-2.5 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {error && (
                <p className="text-center text-xs font-body text-destructive">{error}</p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 font-display font-bold text-sm text-white transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-60 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                {loading ? t.common.loading : t.lock.unlock}
              </button>
              <button
                type="button"
                onClick={() => {
                  setUsePassword(false);
                  setError('');
                  setUsername(user?.username ?? user?.email ?? LOCAL_DEV_CREDENTIALS.admin.username);
                  setPassword(localDefault(LOCAL_DEV_CREDENTIALS.admin.password));
                }}
                className="text-center text-xs text-muted-foreground hover:text-foreground transition-colors font-body cursor-pointer"
              >
                {t.auth.pinLoginTab}
              </button>
            </form>
          )}
        </div>
      </div>


      {/* Brand footer */}
      <p className="mt-8 font-display text-2xs uppercase tracking-widest text-muted-foreground/50">
        Crisp &amp; Crumbs POS
      </p>

      <style>{`
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          15%      { transform: translateX(-8px); }
          30%      { transform: translateX(8px); }
          45%      { transform: translateX(-6px); }
          60%      { transform: translateX(6px); }
          75%      { transform: translateX(-3px); }
          90%      { transform: translateX(3px); }
        }
      `}</style>
    </div>
  );
}
