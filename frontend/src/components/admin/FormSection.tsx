import { ReactNode } from 'react';
import { Label } from '@/components/ui/label';

interface FormSectionProps {
  title: string;
  children: ReactNode;
  columns?: 1 | 2 | 3;
}

export default function FormSection({ title, children, columns = 1 }: FormSectionProps) {
  return (
    <div className="space-y-3 border-b border-border pb-4 last:border-b-0">
      <h3 className="font-semibold text-sm text-foreground">{title}</h3>
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
      <Label className="text-xs font-semibold text-foreground">
        {label}
        {required && <span className="text-danger ml-1">*</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-danger font-medium">{error}</p>}
    </div>
  );
}
