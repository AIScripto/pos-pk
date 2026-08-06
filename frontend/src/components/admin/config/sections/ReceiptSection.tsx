import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminConfigApi } from '@/lib/api/admin-config.api';
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
  const [form, setForm] = useState<any>({});
  const [saved,  setSaved]  = useState(false);
  const [failed, setFailed] = useState(false);

  if (cfg && !Object.keys(form).length) setForm(cfg);

  const mut = useMutation({
    mutationFn: (data: any) => adminConfigApi.upsertOrgConfig(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['orgConfig'] }); setSaved(true); setTimeout(() => setSaved(false), 3000); },
    onError:   () => { setFailed(true); setTimeout(() => setFailed(false), 3000); },
  });

  const set = (key: string, val: any) => setForm((f: any) => ({ ...f, [key]: val }));
  if (isLoading) return <div className="py-10 text-center text-slate-400">Loading…</div>;

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
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400
                focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20
                dark:border-slate-500 dark:bg-slate-950 dark:text-slate-50 resize-none"
            />
          </Field>
          <Field label="Receipt Footer" hint="Shown at the bottom of every receipt">
            <textarea
              value={form.receiptFooter ?? ''}
              onChange={e => set('receiptFooter', e.target.value)}
              rows={3}
              placeholder="Thank you! Please visit again."
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400
                focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20
                dark:border-slate-500 dark:bg-slate-950 dark:text-slate-50 resize-none"
            />
          </Field>
          <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4 dark:border-slate-700">
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">Show Loyalty Points on Receipt</p>
              <p className="text-xs text-slate-500 dark:text-slate-300">Display customer loyalty balance on printed receipt</p>
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
