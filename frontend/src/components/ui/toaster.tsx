import { useToast } from "@/hooks/use-toast";
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast";
import { CheckCircle2, AlertTriangle } from "lucide-react";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        const isDestructive = variant === 'destructive';

        return (
          <Toast key={id} variant={variant} {...props}>
            <div className="flex items-start gap-2.5 min-w-0">
              <div className="mt-0.5 shrink-0">
                {isDestructive ? (
                  <AlertTriangle className="h-4.5 w-4.5 text-rose-200 dark:text-white" />
                ) : (
                  <CheckCircle2 className="h-4.5 w-4.5 text-blue-400 dark:text-blue-600" />
                )}
              </div>
              <div className="grid gap-0.5 min-w-0">
                {title && <ToastTitle className="font-extrabold text-xs">{title}</ToastTitle>}
                {description && <ToastDescription className="text-xs opacity-90 leading-snug">{description}</ToastDescription>}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
