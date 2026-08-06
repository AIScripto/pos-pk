import type { ReactNode } from 'react';
import type { InputHTMLAttributes, SelectHTMLAttributes } from 'react';
import { AlertCircle, CheckCircle2, Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">{label}</label>
      {children}
      {hint && <p className="text-xs text-slate-500 dark:text-slate-300">{hint}</p>}
    </div>
  );
}

export function Input({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400
        focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20
        dark:border-slate-500 dark:bg-slate-950 dark:text-slate-50 dark:placeholder-slate-400
        dark:focus:border-blue-400 disabled:opacity-50 ${className}`}
      {...props}
    />
  );
}

export function Select({ className = '', children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={`w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900
        focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20
        dark:border-slate-500 dark:bg-slate-950 dark:text-slate-50 disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}

export function SaveButton({ loading }: { loading: boolean }) {
  return (
    <Button type="submit" disabled={loading} className="gap-2 bg-blue-600 text-white hover:bg-blue-700">
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
      {loading ? 'Saving...' : 'Save Changes'}
    </Button>
  );
}

export function SaveFeedback({ success, error }: { success: boolean; error: boolean }) {
  if (success) return (
    <span className="flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400">
      <CheckCircle2 className="h-4 w-4" /> Saved successfully
    </span>
  );
  if (error) return (
    <span className="flex items-center gap-1.5 text-sm text-red-600 dark:text-red-400">
      <AlertCircle className="h-4 w-4" /> Failed to save
    </span>
  );
  return null;
}

export function SectionCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-600 dark:bg-slate-900">
      <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-600">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

export function Grid({ cols = 2, children }: { cols?: number; children: ReactNode }) {
  return (
    <div className={`grid gap-4 ${cols === 2 ? 'grid-cols-1 sm:grid-cols-2' : cols === 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1'}`}>
      {children}
    </div>
  );
}
