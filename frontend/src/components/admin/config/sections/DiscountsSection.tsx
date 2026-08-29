import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminConfigApi, type DiscountPreset, type DiscountType } from '@/lib/api/admin-config.api';
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

/** The fields this form writes — a preset minus its server-owned identifiers. */
type DiscountForm = Pick<DiscountPreset, 'name' | 'type' | 'value' | 'sortOrder'>;

export function DiscountsSection() {
  const { currencyConfig } = useAppConfig();
  const qc = useQueryClient();
  const { data: discounts = [], isLoading } = useQuery({ queryKey: ['discounts'], queryFn: adminConfigApi.listDiscounts });
  const [form, setForm] = useState<DiscountForm>({ name: '', type: 'percentage', value: 10, sortOrder: 0 });
  const [editId, setEditId] = useState<string | null>(null);

  const createMut = useMutation({
    mutationFn: (data: DiscountForm) => adminConfigApi.createDiscount(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['discounts'] }); resetForm(); },
  });
  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: DiscountForm }) => adminConfigApi.updateDiscount(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['discounts'] }); resetForm(); },
  });
  const deleteMut = useMutation({
    mutationFn: (id: string) => adminConfigApi.deleteDiscount(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['discounts'] }),
  });

  const resetForm = () => { setForm({ name: '', type: 'percentage', value: 10, sortOrder: 0 }); setEditId(null); };
  const set = <K extends keyof DiscountForm>(key: K, val: DiscountForm[K]) =>
    setForm(f => ({ ...f, [key]: val }));

  const handleEdit = (d: DiscountPreset) => {
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
          <div className="py-6 text-center text-muted-foreground/70">Loading…</div>
        ) : discounts.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground/70">No discount presets yet.</p>
        ) : (
          <div className="space-y-2">
            {discounts.map((d) => (
              <div
                key={d.id}
                className="flex items-center justify-between gap-4 rounded-lg border border-border bg-muted/80 p-3"
              >
                <div>
                  <p className="text-sm font-semibold text-foreground">{d.name}</p>
                  <p className="text-xs font-medium text-muted-foreground">
                    {d.type === 'percentage' ? `${d.value}% off` : `${formatCurrency(d.value)} off`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(d)}
                    className="border-info-border bg-info-subtle font-semibold text-primary hover:bg-info-subtle"
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-danger-border bg-danger-subtle font-semibold text-danger-text hover:bg-danger-subtle dark:hover:bg-danger/25"
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
              <Select value={form.type} onChange={e => set('type', e.target.value as DiscountType)}>
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
            <Button type="submit" disabled={createMut.isPending || updateMut.isPending} className="bg-primary hover:bg-primary/90 text-white gap-2">
              {(createMut.isPending || updateMut.isPending) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {editId ? 'Update' : 'Add Preset'}
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
          </div>
        </form>
      </SectionCard>
    </div>
  );
}
