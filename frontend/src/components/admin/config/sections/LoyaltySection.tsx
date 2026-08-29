import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminConfigApi, type LoyaltyConfig } from '@/lib/api/admin-config.api';
import { useAppConfig } from '@/context/AppConfigContext';
import { formatCurrency } from '@/utils/pos';
import { Switch } from '@/components/ui/switch';
import { AlertCircle, Lightbulb } from 'lucide-react';
import {
  Field,
  Grid,
  Input,
  SaveButton,
  SaveFeedback,
  SectionCard,
} from '@/components/admin/config/ConfigFormPrimitives';

export function LoyaltySection() {
  const { currencyConfig } = useAppConfig();
  const qc = useQueryClient();
  const { data: cfg, isLoading } = useQuery({ queryKey: ['loyaltyConfig'], queryFn: adminConfigApi.getLoyaltyConfig });
  const [form, setForm] = useState<Partial<LoyaltyConfig>>({});
  const [saved,     setSaved]     = useState(false);
  const [failedMsg, setFailedMsg] = useState('');

  if (cfg && !Object.keys(form).length) setForm(cfg);

  const mut = useMutation({
    mutationFn: (data: Partial<LoyaltyConfig>) => adminConfigApi.upsertLoyaltyConfig(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['loyaltyConfig'] }); setSaved(true); setTimeout(() => setSaved(false), 3000); },
    onError:   (err: Error) => {
      const msg = err.message || 'Unknown error';
      console.error('Loyalty save error:', err);
      setFailedMsg(msg);
      setTimeout(() => setFailedMsg(''), 8000);
    },
  });

  const set = <K extends keyof LoyaltyConfig>(key: K, val: LoyaltyConfig[K]) =>
    setForm((f) => ({ ...f, [key]: val }));
  if (isLoading) return <div className="py-10 text-center text-muted-foreground/70">Loading…</div>;

  const pointValue = formatCurrency((form.pointValuePaisa ?? 50) / 100);
  const earnSpend = formatCurrency((form.earnRatePaisa ?? 1000) / 100);

  return (
    <form onSubmit={(e) => { e.preventDefault(); mut.mutate(form); }} className="space-y-6">
      <SectionCard title="Loyalty Program Settings">
        <div className="space-y-6">
          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div>
              <p className="text-sm font-semibold text-foreground">Enable Loyalty Program</p>
              <p className="text-xs text-muted-foreground">Customers earn and redeem points on every purchase</p>
            </div>
            <Switch checked={form.isEnabled ?? true} onCheckedChange={val => set('isEnabled', val)} />
          </div>

          <Grid cols={2}>
            <Field label={`Earn Rate (${currencyConfig.currencyCode} minor units per spend)`} hint={`Customer spends ${earnSpend} → earns 1 point`}>
              <Input type="number" min={1} value={form.earnRatePaisa ?? 1000} onChange={e => set('earnRatePaisa', parseInt(e.target.value))} />
            </Field>
            <Field label={`Point Value (${currencyConfig.currencyCode} minor units per point)`} hint={`1 point = ${pointValue}`}>
              <Input type="number" min={1} value={form.pointValuePaisa ?? 50} onChange={e => set('pointValuePaisa', parseInt(e.target.value))} />
            </Field>
            <Field label="Minimum Points to Redeem">
              <Input type="number" min={0} value={form.minPointsRedeem ?? 100} onChange={e => set('minPointsRedeem', parseInt(e.target.value))} />
            </Field>
            <Field label="Max Redemption %" hint="Max % of bill that can be paid with points">
              <Input type="number" min={0} max={100} step={5} value={form.maxRedeemPct ?? 20} onChange={e => set('maxRedeemPct', parseFloat(e.target.value))} />
            </Field>
            <Field label="Points Expiry (Days)" hint="Leave empty for no expiry">
              <Input type="number" min={0} value={form.pointsExpireDays ?? ''} onChange={e => set('pointsExpireDays', e.target.value ? parseInt(e.target.value) : null)} placeholder="No expiry" />
            </Field>
          </Grid>

          {/* Summary box */}
          <div className="rounded-lg bg-info-subtle p-4 border border-info-border">
            <p className="mb-1 flex items-center gap-1.5 text-sm font-medium text-primary">
              <Lightbulb className="h-4 w-4 shrink-0" aria-hidden="true" />Summary
            </p>
            <p className="text-xs text-primary">
              Customer spends <strong>{earnSpend}</strong> → earns <strong>1 point</strong> (worth <strong>{pointValue}</strong>).
              Minimum <strong>{form.minPointsRedeem ?? 100} points</strong> to redeem. Max <strong>{form.maxRedeemPct ?? 20}%</strong> of bill.
            </p>
          </div>
        </div>
      </SectionCard>

      <div className="flex items-center justify-between">
        {failedMsg
          ? <span className="flex items-center gap-1.5 text-sm text-danger-text"><AlertCircle className="w-4 h-4" /> {failedMsg}</span>
          : <SaveFeedback success={saved} error={false} />
        }
        <SaveButton loading={mut.isPending} />
      </div>
    </form>
  );
}
