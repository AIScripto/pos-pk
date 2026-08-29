import { useState } from 'react';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { authApi } from '@/lib/api/auth.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ManagerApprovalDialogProps {
  open: boolean;
  branchId?: string;
  actionLabel: string;
  reason: string;
  onApproved: (token: string) => void;
  onOpenChange: (open: boolean) => void;
}

export function ManagerApprovalDialog({
  open,
  branchId,
  actionLabel,
  reason,
  onApproved,
  onOpenChange,
}: ManagerApprovalDialogProps) {
  const [pin, setPin] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setPin('');
    setEmail('');
    setPassword('');
    setError('');
  };

  const approve = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await authApi.managerApproval({
        branchId,
        action: 'discount.override',
        reason,
        pin: pin.trim() || undefined,
        email: email.trim() || undefined,
        password: password || undefined,
      });
      onApproved(result.token);
      reset();
      onOpenChange(false);
    } catch (err: Error | unknown) {
      const message = err instanceof Error ? err.message : 'Manager approval failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) reset(); onOpenChange(next); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10 text-warning-text">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <DialogTitle>Manager Approval Required</DialogTitle>
          <DialogDescription>
            {actionLabel} needs a manager with discount override permission.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-md border border-warning-border bg-warning-subtle px-3 py-2 text-xs font-semibold text-warning-text">
            {reason}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="manager-pin">Manager PIN</Label>
            <Input
              id="manager-pin"
              value={pin}
              onChange={(event) => setPin(event.target.value)}
              maxLength={4}
              inputMode="numeric"
              placeholder="4-digit PIN"
            />
          </div>

          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-xs text-muted-foreground">
            <span className="h-px bg-border" />
            <span>or password</span>
            <span className="h-px bg-border" />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="manager-email">Manager Email</Label>
            <Input id="manager-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="manager-password">Password</Label>
            <Input id="manager-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
          </div>

          {error && <p className="text-sm font-semibold text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
          <Button onClick={approve} disabled={loading || (!pin.trim() && (!email.trim() || !password))}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Approve
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
