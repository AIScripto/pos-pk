import React from 'react';
import { Loader2, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AdminLoginFormProps {
  email: string;
  setEmail: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

/**
 * AdminLoginForm Component
 * 
 * Modular form component handling Admin back-office authentication.
 * Includes Email and Password inputs, styled focus rings, and submit button.
 * 
 * @component
 */
export const AdminLoginForm: React.FC<AdminLoginFormProps> = ({
  email,
  setEmail,
  password,
  setPassword,
  loading,
  onSubmit,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-3 sm:space-y-4">
      {/* Admin Email Input */}
      <div>
        <Label htmlFor="admin-email" className="block text-xs sm:text-sm font-bold text-slate-200 mb-1.5">
          Email
        </Label>
        <Input
          id="admin-email"
          type="email"
          placeholder="admin@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="off"
          className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg bg-slate-700/50 border border-slate-600 text-white text-xs sm:text-sm placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
          required
          autoFocus
        />
      </div>

      {/* Admin Password Input */}
      <div>
        <Label htmlFor="admin-password" className="block text-xs sm:text-sm font-bold text-slate-200 mb-1.5">
          Password
        </Label>
        <Input
          id="admin-password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg bg-slate-700/50 border border-slate-600 text-white text-xs sm:text-sm placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
          required
        />
      </div>

      {/* Submit Action Button */}
      <Button
        type="submit"
        disabled={loading}
        className="w-full py-2 sm:py-3 mt-4 sm:mt-6 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold text-sm sm:text-base rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
      >
        {loading ? (
          <>
            <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 animate-spin inline" />
            <span className="text-xs sm:text-base">Signing in...</span>
          </>
        ) : (
          <>
            <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 inline" />
            <span className="text-xs sm:text-base">Enter Back Office</span>
          </>
        )}
      </Button>
    </form>
  );
};

export default AdminLoginForm;
