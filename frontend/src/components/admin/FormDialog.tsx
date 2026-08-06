import { ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface FormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  error?: string;
  isLoading?: boolean;
  onSubmit: (e: React.FormEvent) => void;
  children: ReactNode;
  submitText?: string;
  isCreating?: boolean;
}

export default function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  error,
  isLoading = false,
  onSubmit,
  children,
  submitText = 'Save',
  isCreating = false,
}: FormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0">
        <div className="px-6 py-4">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
        </div>

        <form id="admin-form" onSubmit={onSubmit} className="px-6 space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {children}
        </form>

        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700">
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="admin-form"
              disabled={isLoading}
              variant={isCreating ? 'create' : 'edit'}
              className="gap-2"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {submitText}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
