import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './dialog';
import { Button } from './button';

interface ThemedPromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  inputLabel: string;
  value: string;
  onChange: (value: string) => void;
  onConfirm: (val: string) => void;
  theme?: 'blue' | 'orange' | 'emerald' | 'amber' | 'danger';
  confirmText?: string;
  cancelText?: string;
}

export default function ThemedPromptDialog({
  open,
  onOpenChange,
  title,
  description,
  inputLabel,
  value,
  onChange,
  onConfirm,
  theme = 'blue',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
}: ThemedPromptDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-slate-200 bg-slate-50 text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-white p-6 rounded-lg shadow-xl">
        <DialogHeader className="mb-4">
          <DialogTitle className={`text-lg font-black tracking-tight ${
            theme === 'orange' ? 'text-orange-600 dark:text-orange-400' :
            theme === 'emerald' ? 'text-emerald-600 dark:text-emerald-400' :
            theme === 'amber' ? 'text-amber-600 dark:text-amber-400' :
            theme === 'danger' ? 'text-rose-600 dark:text-rose-400' :
            'text-blue-600 dark:text-blue-400'
          }`}>
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black uppercase tracking-wider text-slate-400">
              {inputLabel}
            </label>
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={`Enter ${inputLabel.toLowerCase()}...`}
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white focus:dark:border-blue-400"
              autoFocus
            />
          </div>
        </div>

        <DialogFooter className="mt-6 flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-slate-200 dark:border-slate-800"
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            onClick={() => {
              onConfirm(value);
              onOpenChange(false);
            }}
            className={`font-semibold text-white ${
              theme === 'orange' ? 'bg-orange-600 hover:bg-orange-700' :
              theme === 'emerald' ? 'bg-emerald-600 hover:bg-emerald-700' :
              theme === 'amber' ? 'bg-amber-600 hover:bg-amber-700' :
              theme === 'danger' ? 'bg-rose-600 hover:bg-rose-700' :
              'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
