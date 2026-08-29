import { Input } from '@/components/ui/input';
import { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, ReactNode } from 'react';

// Reusable text input with consistent styling
export function FormInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <Input
      {...props}
      className="h-8 text-xs border-border bg-muted/40 text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-ring"
    />
  );
}

// Reusable select with consistent styling
export function FormSelect(
  props: SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode }
) {
  const { children, ...rest } = props;
  return (
    <select
      {...rest}
      className="w-full h-8 rounded-lg border border-border bg-muted/40 px-3 py-1 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:bg-secondary disabled:text-muted-foreground"
    >
      {children}
    </select>
  );
}

// Reusable textarea with consistent styling
export function FormTextarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className="w-full h-20 rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-ring"
    />
  );
}

// Badge display for auto-filled values
interface BadgeProps {
  children: ReactNode;
  variant?: 'primary' | 'success' | 'gray';
}

export function FormBadge({ children, variant = 'gray' }: BadgeProps) {
  const variants = {
    primary: 'bg-info-subtle text-primary',
    success: 'bg-success-subtle text-success-text dark:bg-success/40',
    gray: 'bg-secondary text-foreground/80',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${variants[variant]}`}
    >
      {children}
    </span>
  );
}

// Preview display for final generated values
interface PreviewProps {
  label: string;
  value: string;
}

export function FormPreview({ label, value }: PreviewProps) {
  return (
    <div className="mt-2 text-xs font-mono font-semibold text-white dark:text-foreground">
      {label}: <span className="text-primary">{value}</span>
    </div>
  );
}
