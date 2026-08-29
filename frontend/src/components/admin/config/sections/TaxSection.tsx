import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  adminConfigApi,
  type TaxConfig,
  type TaxMode,
  type TaxAppliesTo,
  type TaxPaymentMethod,
} from '@/lib/api/admin-config.api';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label }  from '@/components/ui/label';
import { Save, Loader2, CheckCircle2, CreditCard, Banknote } from 'lucide-react';
import {
  Field,
  Grid,
  Input,
  SectionCard,
  Select,
} from '@/components/admin/config/ConfigFormPrimitives';

/** The fields this form writes — a tax rule minus its server-owned identifiers. */
type TaxForm = Pick<TaxConfig, 'name' | 'label' | 'rate' | 'mode' | 'appliesTo' | 'paymentMethod' | 'isDefault'>;

const PAYMENT_METHOD_LABELS: Record<string, { label: string; desc: string; color: string }> = {
  all:    { label: 'Cash / Other',  desc: 'Applies to cash, wallet, and all non-card payments', color: 'green'  },
  card:   { label: 'Card Payment',  desc: 'Applies to credit card and debit card payments',     color: 'purple' },
  cash:   { label: 'Cash Only',     desc: 'Applies to cash payments only',                      color: 'green'  },
  wallet: { label: 'Digital Wallet',desc: 'Applies to JazzCash, EasyPaisa, etc.',               color: 'blue'   },
};

function TaxRuleCard({ tax, onEdit, onDelete }: { tax: TaxConfig; onEdit: () => void; onDelete: () => void }) {
  const pm   = PAYMENT_METHOD_LABELS[tax.paymentMethod] ?? PAYMENT_METHOD_LABELS['all'];
  const colors: Record<string, string> = {
    green:  'border-success-border bg-success-subtle dark:border-success dark:bg-success/30',
    purple: 'border-special-border bg-special-subtle',
    blue:   'border-info-border bg-info-subtle',
  };
  const badgeColors: Record<string, string> = {
    green:  'bg-success-subtle text-success-text dark:bg-success/40',
    purple: 'bg-special-subtle text-special-text',
    blue:   'bg-info-subtle text-primary',
  };

  return (
    <div className={`rounded-xl border-2 p-5 ${colors[pm.color]}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${badgeColors[pm.color]}`}>
              {pm.label}
            </span>
            {tax.isDefault && (
              <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                Default
              </span>
            )}
            <span className="rounded-full bg-white/70 px-2.5 py-0.5 text-xs font-semibold text-foreground dark:bg-background">
              {tax.mode === 'inclusive' ? 'Inclusive' : 'Exclusive'}
            </span>
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{tax.rate}%
              <span className="ml-2 text-sm font-normal text-muted-foreground">({tax.label})</span>
            </p>
            <p className="text-sm font-medium text-muted-foreground">{tax.name}</p>
            <p className="text-xs text-muted-foreground mt-1">{pm.desc}</p>
          </div>
        </div>
        <div className="flex flex-col gap-2 shrink-0">
          <Button
            size="sm"
            variant="outline"
            onClick={onEdit}
            className="border-info-border bg-info-subtle text-xs font-semibold text-primary hover:bg-info-subtle"
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onDelete}
            className="border-danger-border bg-danger-subtle text-xs font-semibold text-danger-text hover:bg-danger-subtle dark:hover:bg-danger/25"
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}

export function TaxSection() {
  const qc = useQueryClient();
  const { data: taxes = [], isLoading } = useQuery({ queryKey: ['taxConfigs'], queryFn: adminConfigApi.listTaxConfigs });

  const emptyForm: TaxForm = { name: '', label: 'GST', rate: 16, mode: 'exclusive', appliesTo: 'all', paymentMethod: 'all', isDefault: false };
  const [form,   setForm]   = useState<TaxForm>(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [saved,  setSaved]  = useState(false);

  const createMut = useMutation({
    mutationFn: (data: TaxForm) => adminConfigApi.createTaxConfig(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['taxConfigs'] }); setSaved(true); setTimeout(() => setSaved(false), 3000); resetForm(); },
  });
  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: TaxForm }) => adminConfigApi.updateTaxConfig(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['taxConfigs'] }); setSaved(true); setTimeout(() => setSaved(false), 3000); resetForm(); },
  });
  const deleteMut = useMutation({
    mutationFn: (id: string) => adminConfigApi.deleteTaxConfig(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['taxConfigs'] }),
  });

  const resetForm = () => { setForm(emptyForm); setEditId(null); };
  const set = <K extends keyof TaxForm>(key: K, val: TaxForm[K]) =>
    setForm((f) => ({ ...f, [key]: val }));

  const handleEdit = (tax: TaxConfig) => {
    setForm({ name: tax.name, label: tax.label, rate: tax.rate, mode: tax.mode, appliesTo: tax.appliesTo, paymentMethod: tax.paymentMethod ?? 'all', isDefault: tax.isDefault });
    setEditId(tax.id);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) updateMut.mutate({ id: editId, data: form });
    else createMut.mutate(form);
  };

  return (
    <div className="space-y-6">

      {/* How it works info box */}
      <div className="rounded-lg border border-warning-border bg-warning-subtle p-4">
        <p className="text-sm font-semibold text-warning-text">How Payment-based Tax Works</p>
        <p className="mt-1 text-xs text-warning-text">
          Only <strong>one tax rate</strong> is applied per transaction — determined by the payment method chosen at checkout.
          Card payments apply the Card Tax rate. All other payments apply the Standard (Cash/Other) rate.
        </p>
        <div className="mt-2 flex flex-wrap gap-3 text-xs text-warning-text">
          <span className="inline-flex items-center gap-1.5"><CreditCard className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />Card → <strong>Card Tax (5%)</strong></span>
          <span className="inline-flex items-center gap-1.5"><Banknote className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />Cash / Wallet → <strong>Standard GST (16%)</strong></span>
        </div>
      </div>

      {/* Tax rule cards */}
      <SectionCard title="Tax Rates">
        {isLoading ? (
          <div className="py-6 text-center text-muted-foreground/70">Loading…</div>
        ) : taxes.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground/70">No tax configurations. Add one below.</p>
        ) : (
          <div className="space-y-3">
            {taxes.map((tax) => (
              <TaxRuleCard
                key={tax.id}
                tax={tax}
                onEdit={() => handleEdit(tax)}
                onDelete={() => deleteMut.mutate(tax.id)}
              />
            ))}
          </div>
        )}
      </SectionCard>

      {/* Add / Edit form */}
      <SectionCard title={editId ? 'Edit Tax Rate' : 'Add Tax Rate'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Grid cols={2}>
            <Field label="Name" hint="e.g. Standard GST, Card WHT">
              <Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Standard GST" required />
            </Field>
            <Field label="Label" hint="Shown on receipt (e.g. GST, WHT)">
              <Input value={form.label} onChange={e => set('label', e.target.value)} placeholder="GST" />
            </Field>
            <Field label="Rate (%)">
              <Input type="number" step="0.01" min={0} max={100} value={form.rate} onChange={e => set('rate', parseFloat(e.target.value))} />
            </Field>
            <Field label="Payment Method" hint="Which payment method triggers this tax">
              <Select value={form.paymentMethod} onChange={e => set('paymentMethod', e.target.value as TaxPaymentMethod)}>
                <option value="all">Cash / Other (all non-card)</option>
                <option value="card">Card (credit + debit)</option>
                <option value="wallet">Digital Wallet only</option>
              </Select>
            </Field>
            <Field label="Mode">
              <Select value={form.mode} onChange={e => set('mode', e.target.value as TaxMode)}>
                <option value="exclusive">Exclusive (added on top of price)</option>
                <option value="inclusive">Inclusive (included in price)</option>
              </Select>
            </Field>
            <Field label="Applies To Order Type">
              <Select value={form.appliesTo} onChange={e => set('appliesTo', e.target.value as TaxAppliesTo)}>
                <option value="all">All Orders</option>
                <option value="dine_in">Dine-in Only</option>
                <option value="takeaway">Takeaway Only</option>
                <option value="delivery">Delivery Only</option>
              </Select>
            </Field>
          </Grid>
          <div className="flex items-center gap-2">
            <Switch checked={form.isDefault} onCheckedChange={val => set('isDefault', val)} />
            <Label className="text-sm">Set as default (used when no payment method matched)</Label>
          </div>
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={createMut.isPending || updateMut.isPending} className="bg-primary hover:bg-primary/90 text-white gap-2">
              {(createMut.isPending || updateMut.isPending) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {editId ? 'Update Tax Rate' : 'Add Tax Rate'}
            </Button>
            {editId && (
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                className="border-border bg-card text-foreground hover:bg-secondary"
              >
                Cancel
              </Button>
            )}
            {saved && <span className="flex items-center gap-1 text-sm text-success-text"><CheckCircle2 className="w-4 h-4" /> Saved</span>}
          </div>
        </form>
      </SectionCard>
    </div>
  );
}
