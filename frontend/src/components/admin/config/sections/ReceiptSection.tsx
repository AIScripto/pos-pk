import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminConfigApi, type OrgConfig } from '@/lib/api/admin-config.api';
import { Switch } from '@/components/ui/switch';
import {
  Field,
  SaveButton,
  SaveFeedback,
  SectionCard,
} from '@/components/admin/config/ConfigFormPrimitives';

export function ReceiptSection() {
  const qc   = useQueryClient();
  const { data: cfg, isLoading } = useQuery({ queryKey: ['orgConfig'], queryFn: adminConfigApi.getOrgConfig });
  const [form, setForm] = useState<Partial<OrgConfig>>({});
  const [saved,  setSaved]  = useState(false);
  const [failed, setFailed] = useState(false);

  if (cfg && !Object.keys(form).length) setForm(cfg);

  const mut = useMutation({
    mutationFn: (data: Partial<OrgConfig>) => adminConfigApi.upsertOrgConfig(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['orgConfig'] }); setSaved(true); setTimeout(() => setSaved(false), 3000); },
    onError:   () => { setFailed(true); setTimeout(() => setFailed(false), 3000); },
  });

  const set = <K extends keyof OrgConfig>(key: K, val: OrgConfig[K]) =>
    setForm((f) => ({ ...f, [key]: val }));
  if (isLoading) return <div className="py-10 text-center text-muted-foreground/70">Loading…</div>;

  return (
    <form onSubmit={(e) => { e.preventDefault(); mut.mutate(form); }} className="space-y-6">
      <SectionCard title="Receipt Customisation">
        <div className="space-y-4">
          <Field label="Receipt Header" hint="Shown at the top of every receipt">
            <textarea
              value={form.receiptHeader ?? ''}
              onChange={e => set('receiptHeader', e.target.value)}
              rows={3}
              placeholder="Welcome to Crip & Crumbs!"
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
            />
          </Field>
          <Field label="Receipt Footer" hint="Shown at the bottom of every receipt">
            <textarea
              value={form.receiptFooter ?? ''}
              onChange={e => set('receiptFooter', e.target.value)}
              rows={3}
              placeholder="Thank you! Please visit again."
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
            />
          </Field>
          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div>
              <p className="text-sm font-medium text-foreground">Show Loyalty Points on Receipt</p>
              <p className="text-xs text-muted-foreground">Display customer loyalty balance on printed receipt</p>
            </div>
            <Switch
              checked={form.showLoyaltyOnReceipt ?? true}
              onCheckedChange={val => set('showLoyaltyOnReceipt', val)}
            />
          </div>
        </div>
      </SectionCard>

      <div className="flex items-center justify-between">
        <SaveFeedback success={saved} error={failed} />
        <SaveButton loading={mut.isPending} />
      </div>
    </form>
  );
}
