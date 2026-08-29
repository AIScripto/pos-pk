import type { ReactNode } from 'react';
import type { InputHTMLAttributes, SelectHTMLAttributes } from 'react';
import { AlertCircle, CheckCircle2, Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-foreground">{label}</label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function Input({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 ${className}`}
      {...props}
    />
  );
}

/**
 * A `<select>` whose value is a union rather than a bare string.
 *
 * `value` is typed as the union the field actually holds (a tax mode, a discount
 * type, a decimal-place count) rather than a bare string, so the option list and
 * the state it drives cannot drift apart. `onChange` still yields the raw string
 * the DOM gives us — the caller narrows or parses it.
 */
interface SelectProps<T extends string | number>
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'value' | 'onChange'> {
  value: T;
  onChange: (event: { target: { value: string } }) => void;
}

export function Select<T extends string | number>({ className = '', children, onChange, ...props }: SelectProps<T>) {
  return (
    <select
      className={`w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 ${className}`}
      onChange={(e) => onChange({ target: { value: e.target.value } })}
      {...props}
    >
      {children}
    </select>
  );
}

export function SaveButton({ loading }: { loading: boolean }) {
  return (
    <Button type="submit" disabled={loading} className="gap-2 bg-primary text-white hover:bg-primary/90">
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
      {loading ? 'Saving...' : 'Save Changes'}
    </Button>
  );
}

export function SaveFeedback({ success, error }: { success: boolean; error: boolean }) {
  if (success) return (
    <span className="flex items-center gap-1.5 text-sm text-success-text">
      <CheckCircle2 className="h-4 w-4" /> Saved successfully
    </span>
  );
  if (error) return (
    <span className="flex items-center gap-1.5 text-sm text-danger-text">
      <AlertCircle className="h-4 w-4" /> Failed to save
    </span>
  );
  return null;
}

export function SectionCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <div className="border-b border-border px-6 py-4">
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
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
