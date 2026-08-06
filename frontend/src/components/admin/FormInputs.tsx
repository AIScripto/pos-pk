import { Input } from '@/components/ui/input';
import { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, ReactNode } from 'react';

// Reusable text input with consistent styling
export function FormInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <Input
      {...props}
      className="h-8 text-xs border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-400 dark:focus:ring-blue-500"
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
      className="w-full h-8 rounded-lg border border-slate-300 bg-slate-50 px-3 py-1 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:focus:ring-blue-500 dark:disabled:bg-slate-700 dark:disabled:text-slate-400"
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
      className="w-full h-20 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-400 dark:focus:ring-blue-500"
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
    primary: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200',
    success: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-200',
    gray: 'bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-100',
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
    <div className="mt-2 text-xs font-mono font-semibold text-white dark:text-slate-100">
      {label}: <span className="text-blue-400 dark:text-blue-300">{value}</span>
    </div>
  );
}
