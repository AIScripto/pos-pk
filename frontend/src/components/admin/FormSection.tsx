import { ReactNode } from 'react';
import { Label } from '@/components/ui/label';

interface FormSectionProps {
  title: string;
  children: ReactNode;
  columns?: 1 | 2 | 3;
}

export default function FormSection({ title, children, columns = 1 }: FormSectionProps) {
  return (
    <div className="space-y-3 border-b border-slate-200 pb-4 last:border-b-0 dark:border-slate-700">
      <h3 className="font-semibold text-sm text-slate-900 dark:text-white">{title}</h3>
      <div className={`grid gap-4 ${columns === 2 ? 'grid-cols-2' : columns === 3 ? 'grid-cols-3' : 'grid-cols-1'}`}>
        {children}
      </div>
    </div>
  );
}

interface FormFieldProps {
  label: ReactNode;
  required?: boolean;
  error?: string;
  children: ReactNode;
}

export function FormField({ label, required = false, error, children }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label className="text-xs font-semibold text-slate-700 dark:text-slate-100">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
}
