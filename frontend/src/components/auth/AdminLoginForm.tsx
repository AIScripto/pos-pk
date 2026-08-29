import React from 'react';
import { Loader2, LogIn, User, Lock, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslation } from '@/i18n';

interface AdminLoginFormProps {
  username: string;
  setUsername: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export const AdminLoginForm: React.FC<AdminLoginFormProps> = ({
  username,
  setUsername,
  password,
  setPassword,
  loading,
  onSubmit,
}) => {
  const { t } = useTranslation();

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Admin Mode Badge */}
      <div className="flex items-center justify-between pb-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-screen-muted flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-primary" />
          <span>{t.admin.backOffice}</span>
        </span>
        <span className="text-[11px] font-medium text-primary/90 bg-primary/60 border border-primary/20 px-2 py-0.5 rounded">
          {t.admin.backOffice}
        </span>
      </div>

      {/* Admin Username Input */}
      <div className="space-y-1.5">
        <Label htmlFor="admin-username" className="text-xs font-semibold uppercase tracking-wider text-screen-subtle flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-screen-muted" />
          <span>{t.auth.username}</span>
        </Label>
        <div className="relative">
          <Input
            id="admin-username"
            type="text"
            placeholder={t.auth.username}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            className="w-full h-12 px-3.5 rounded-xl bg-screen-raised/80 border border-screen-border/80 text-screen-foreground text-sm placeholder-screen-dim focus:border-primary focus:ring-2 focus:ring-primary/30 focus:outline-none transition-all font-medium"
            required
            autoFocus
          />
        </div>
      </div>

      {/* Admin Password Input */}
      <div className="space-y-1.5">
        <Label htmlFor="admin-password" className="text-xs font-semibold uppercase tracking-wider text-screen-subtle flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-screen-muted" />
          <span>{t.auth.password}</span>
        </Label>
        <div className="relative">
          <Input
            id="admin-password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-12 px-3.5 rounded-xl bg-screen-raised/80 border border-screen-border/80 text-screen-foreground text-sm placeholder-screen-dim focus:border-primary focus:ring-2 focus:ring-primary/30 focus:outline-none transition-all"
            required
          />
        </div>
      </div>

      {/* Submit Action Button */}
      <Button
        type="submit"
        disabled={loading}
        className="w-full h-12 mt-6 bg-primary hover:bg-primary active:scale-[0.99] text-screen-foreground font-bold text-sm sm:text-base rounded-xl transition-all shadow-lg shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin inline" />
            <span>{t.common.loading}</span>
          </>
        ) : (
          <>
            <LogIn className="w-4 h-4 inline" />
            <span>{t.auth.loginButton}</span>
          </>
        )}
      </Button>
    </form>
  );
};

export default AdminLoginForm;

