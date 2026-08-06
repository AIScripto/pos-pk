import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminConfigApi } from '@/lib/api/admin-config.api';
import { useAppConfig } from '@/context/AppConfigContext';
import { formatCurrency } from '@/utils/pos';
import { Button } from '@/components/ui/button';
import { Save, Loader2 } from 'lucide-react';
import {
  Field,
  Grid,
  Input,
  SectionCard,
  Select,
} from '@/components/admin/config/ConfigFormPrimitives';

export function DiscountsSection() {
  const { currencyConfig } = useAppConfig();
  const qc = useQueryClient();
  const { data: discounts = [], isLoading } = useQuery({ queryKey: ['discounts'], queryFn: adminConfigApi.listDiscounts });
  const [form, setForm] = useState({ name: '', type: 'percentage', value: 10, sortOrder: 0 });
  const [editId, setEditId] = useState<string | null>(null);

  const createMut = useMutation({
    mutationFn: (data: any) => adminConfigApi.createDiscount(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['discounts'] }); resetForm(); },
  });
  const updateMut = useMutation({
    mutationFn: ({ id, data }: any) => adminConfigApi.updateDiscount(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['discounts'] }); resetForm(); },
  });
  const deleteMut = useMutation({
    mutationFn: (id: string) => adminConfigApi.deleteDiscount(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['discounts'] }),
  });

  const resetForm = () => { setForm({ name: '', type: 'percentage', value: 10, sortOrder: 0 }); setEditId(null); };
  const set = (key: string, val: any) => setForm(f => ({ ...f, [key]: val }));

  const handleEdit = (d: any) => {
    setForm({ name: d.name, type: d.type, value: d.value, sortOrder: d.sortOrder });
    setEditId(d.id);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) updateMut.mutate({ id: editId, data: form });
    else createMut.mutate(form);
  };

  return (
    <div className="space-y-6">
      <SectionCard title="Discount Presets">
        {isLoading ? (
          <div className="py-6 text-center text-slate-400">Loading…</div>
        ) : discounts.length === 0 ? (
          <p className="py-4 text-center text-sm text-slate-400">No discount presets yet.</p>
        ) : (
          <div className="space-y-2">
            {discounts.map((d: any) => (
              <div
                key={d.id}
                className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-600 dark:bg-slate-950/40"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">{d.name}</p>
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                    {d.type === 'percentage' ? `${d.value}% off` : `${formatCurrency(d.value)} off`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(d)}
                    className="border-blue-200 bg-blue-50 font-semibold text-blue-700 hover:bg-blue-100 dark:border-blue-500/40 dark:bg-blue-500/15 dark:text-blue-100 dark:hover:bg-blue-500/25"
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-200 bg-red-50 font-semibold text-red-700 hover:bg-red-100 dark:border-red-500/40 dark:bg-red-500/15 dark:text-red-100 dark:hover:bg-red-500/25"
                    onClick={() => deleteMut.mutate(d.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard title={editId ? 'Edit Discount' : 'Add Discount Preset'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Grid cols={2}>
            <Field label="Name" hint="e.g. Staff Discount, Student Discount">
              <Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Staff Discount" required />
            </Field>
            <Field label="Type">
              <Select value={form.type} onChange={e => set('type', e.target.value)}>
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount ({currencyConfig.currencySymbol})</option>
              </Select>
            </Field>
            <Field label={form.type === 'percentage' ? 'Discount %' : `Discount Amount (${currencyConfig.currencySymbol})`}>
              <Input type="number" step="0.01" min={0} value={form.value} onChange={e => set('value', parseFloat(e.target.value))} />
            </Field>
            <Field label="Sort Order">
              <Input type="number" min={0} value={form.sortOrder} onChange={e => set('sortOrder', parseInt(e.target.value))} />
            </Field>
          </Grid>
          <div className="flex gap-2">
            <Button type="submit" disabled={createMut.isPending || updateMut.isPending} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
              {(createMut.isPending || updateMut.isPending) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {editId ? 'Update' : 'Add Preset'}
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
          </div>
        </form>
      </SectionCard>
    </div>
  );
}
