import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminConfigApi } from '@/lib/api/admin-config.api';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label }  from '@/components/ui/label';
import { Save, Loader2, CheckCircle2 } from 'lucide-react';
import {
  Field,
  Grid,
  Input,
  SectionCard,
  Select,
} from '@/components/admin/config/ConfigFormPrimitives';

const PAYMENT_METHOD_LABELS: Record<string, { label: string; desc: string; color: string }> = {
  all:    { label: 'Cash / Other',  desc: 'Applies to cash, wallet, and all non-card payments', color: 'green'  },
  card:   { label: 'Card Payment',  desc: 'Applies to credit card and debit card payments',     color: 'purple' },
  cash:   { label: 'Cash Only',     desc: 'Applies to cash payments only',                      color: 'green'  },
  wallet: { label: 'Digital Wallet',desc: 'Applies to JazzCash, EasyPaisa, etc.',               color: 'blue'   },
};

function TaxRuleCard({ tax, onEdit, onDelete }: { tax: any; onEdit: () => void; onDelete: () => void }) {
  const pm   = PAYMENT_METHOD_LABELS[tax.paymentMethod] ?? PAYMENT_METHOD_LABELS['all'];
  const colors: Record<string, string> = {
    green:  'border-green-200  bg-green-50  dark:border-green-800  dark:bg-green-950/30',
    purple: 'border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950/30',
    blue:   'border-blue-200   bg-blue-50   dark:border-blue-800   dark:bg-blue-950/30',
  };
  const badgeColors: Record<string, string> = {
    green:  'bg-green-100  text-green-700  dark:bg-green-900/40  dark:text-green-300',
    purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
    blue:   'bg-blue-100   text-blue-700   dark:bg-blue-900/40   dark:text-blue-300',
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
              <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                Default
              </span>
            )}
            <span className="rounded-full bg-white/70 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-950 dark:text-slate-200">
              {tax.mode === 'inclusive' ? 'Inclusive' : 'Exclusive'}
            </span>
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{tax.rate}%
              <span className="ml-2 text-sm font-normal text-slate-500 dark:text-slate-300">({tax.label})</span>
            </p>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{tax.name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-300 mt-1">{pm.desc}</p>
          </div>
        </div>
        <div className="flex flex-col gap-2 shrink-0">
          <Button
            size="sm"
            variant="outline"
            onClick={onEdit}
            className="border-blue-200 bg-blue-50 text-xs font-semibold text-blue-700 hover:bg-blue-100 dark:border-blue-500/40 dark:bg-blue-500/15 dark:text-blue-100 dark:hover:bg-blue-500/25"
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onDelete}
            className="border-red-200 bg-red-50 text-xs font-semibold text-red-700 hover:bg-red-100 dark:border-red-500/40 dark:bg-red-500/15 dark:text-red-100 dark:hover:bg-red-500/25"
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

  const emptyForm = { name: '', label: 'GST', rate: 16, mode: 'exclusive', appliesTo: 'all', paymentMethod: 'all', isDefault: false };
  const [form,   setForm]   = useState<any>(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [saved,  setSaved]  = useState(false);

  const createMut = useMutation({
    mutationFn: (data: any) => adminConfigApi.createTaxConfig(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['taxConfigs'] }); setSaved(true); setTimeout(() => setSaved(false), 3000); resetForm(); },
  });
  const updateMut = useMutation({
    mutationFn: ({ id, data }: any) => adminConfigApi.updateTaxConfig(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['taxConfigs'] }); setSaved(true); setTimeout(() => setSaved(false), 3000); resetForm(); },
  });
  const deleteMut = useMutation({
    mutationFn: (id: string) => adminConfigApi.deleteTaxConfig(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['taxConfigs'] }),
  });

  const resetForm = () => { setForm(emptyForm); setEditId(null); };
  const set = (key: string, val: any) => setForm((f: any) => ({ ...f, [key]: val }));

  const handleEdit = (tax: any) => {
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
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
        <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">How Payment-based Tax Works</p>
        <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">
          Only <strong>one tax rate</strong> is applied per transaction — determined by the payment method chosen at checkout.
          Card payments apply the Card Tax rate. All other payments apply the Standard (Cash/Other) rate.
        </p>
        <div className="mt-2 flex flex-wrap gap-3 text-xs text-amber-700 dark:text-amber-400">
          <span>💳 Card → <strong>Card Tax (5%)</strong></span>
          <span>💵 Cash / Wallet → <strong>Standard GST (16%)</strong></span>
        </div>
      </div>

      {/* Tax rule cards */}
      <SectionCard title="Tax Rates">
        {isLoading ? (
          <div className="py-6 text-center text-slate-400">Loading…</div>
        ) : taxes.length === 0 ? (
          <p className="py-4 text-center text-sm text-slate-400">No tax configurations. Add one below.</p>
        ) : (
          <div className="space-y-3">
            {taxes.map((tax: any) => (
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
              <Select value={form.paymentMethod} onChange={e => set('paymentMethod', e.target.value)}>
                <option value="all">Cash / Other (all non-card)</option>
                <option value="card">Card (credit + debit)</option>
                <option value="wallet">Digital Wallet only</option>
              </Select>
            </Field>
            <Field label="Mode">
              <Select value={form.mode} onChange={e => set('mode', e.target.value)}>
                <option value="exclusive">Exclusive (added on top of price)</option>
                <option value="inclusive">Inclusive (included in price)</option>
              </Select>
            </Field>
            <Field label="Applies To Order Type">
              <Select value={form.appliesTo} onChange={e => set('appliesTo', e.target.value)}>
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
            <Button type="submit" disabled={createMut.isPending || updateMut.isPending} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
              {(createMut.isPending || updateMut.isPending) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {editId ? 'Update Tax Rate' : 'Add Tax Rate'}
            </Button>
            {editId && (
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                className="border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-500 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
              >
                Cancel
              </Button>
            )}
            {saved && <span className="flex items-center gap-1 text-sm text-green-600"><CheckCircle2 className="w-4 h-4" /> Saved</span>}
          </div>
        </form>
      </SectionCard>
    </div>
  );
}
