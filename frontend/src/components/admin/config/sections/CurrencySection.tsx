import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminConfigApi, type OrgConfig } from '@/lib/api/admin-config.api';
import {
  Field,
  Grid,
  Input,
  SaveButton,
  SaveFeedback,
  SectionCard,
  Select,
} from '@/components/admin/config/ConfigFormPrimitives';

export function CurrencySection() {
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
  if (isLoading) return <div className="py-10 text-center text-muted-foreground">Loading…</div>;
  const symbol = form.currencySymbol ?? 'Rs';

  return (
    <form onSubmit={(e) => { e.preventDefault(); mut.mutate(form); }} className="space-y-6">
      <SectionCard title="Currency Settings">
        <Grid cols={3}>
          <Field label="Currency Code" hint="ISO 4217 code">
            <Input value={form.currencyCode ?? 'PKR'} onChange={e => set('currencyCode', e.target.value)} maxLength={3} placeholder="PKR" />
          </Field>
          <Field label="Currency Symbol">
            <Input value={form.currencySymbol ?? 'Rs'} onChange={e => set('currencySymbol', e.target.value)} maxLength={5} placeholder="Rs" />
          </Field>
          <Field label="Symbol Position">
            <Select value={form.symbolPosition ?? 'before'} onChange={e => set('symbolPosition', e.target.value)}>
              <option value="before">Before amount ({symbol} 100)</option>
              <option value="after">After amount (100 {symbol})</option>
            </Select>
          </Field>
          <Field label="Decimal Places">
            <Select value={form.decimalPlaces ?? 2} onChange={e => set('decimalPlaces', parseInt(e.target.value))}>
              <option value={0}>0 (100)</option>
              <option value={2}>2 (100.00)</option>
            </Select>
          </Field>
          <Field label="Thousands Separator">
            <Select value={form.thousandSep ?? ','} onChange={e => set('thousandSep', e.target.value)}>
              <option value=",">, (1,000)</option>
              <option value=".">. (1.000)</option>
              <option value=" ">Space (1 000)</option>
            </Select>
          </Field>
          <Field label="Decimal Separator">
            <Select value={form.decimalSep ?? '.'} onChange={e => set('decimalSep', e.target.value)}>
              <option value=".">. (100.00)</option>
              <option value=",">, (100,00)</option>
            </Select>
          </Field>
        </Grid>
      </SectionCard>

      <SectionCard title="Locale & Timezone">
        <Grid cols={2}>
          <Field label="Locale">
            <Select value={form.locale ?? 'en-PK'} onChange={e => set('locale', e.target.value)}>
              <option value="en-PK">English (Pakistan)</option>
              <option value="en-US">English (US)</option>
              <option value="en-GB">English (UK)</option>
              <option value="ur-PK">Urdu (Pakistan)</option>
            </Select>
          </Field>
          <Field label="Timezone">
            <Select value={form.timezone ?? 'Asia/Karachi'} onChange={e => set('timezone', e.target.value)}>
              <option value="Asia/Karachi">Asia/Karachi (PKT +05:00)</option>
              <option value="Asia/Dubai">Asia/Dubai (GST +04:00)</option>
              <option value="UTC">UTC</option>
            </Select>
          </Field>
          <Field label="Date Format">
            <Select value={form.dateFormat ?? 'DD/MM/YYYY'} onChange={e => set('dateFormat', e.target.value)}>
              <option value="DD/MM/YYYY">DD/MM/YYYY (31/12/2025)</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY (12/31/2025)</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD (2025-12-31)</option>
            </Select>
          </Field>
          <Field label="Time Format">
            <Select value={form.timeFormat ?? '24h'} onChange={e => set('timeFormat', e.target.value)}>
              <option value="24h">24-hour (14:30)</option>
              <option value="12h">12-hour (2:30 PM)</option>
            </Select>
          </Field>
          <Field label="Phone Country Code">
            <Input value={form.phoneCountryCode ?? '+92'} onChange={e => set('phoneCountryCode', e.target.value)} maxLength={5} placeholder="+92" />
          </Field>
        </Grid>
      </SectionCard>

      <div className="flex items-center justify-between">
        <SaveFeedback success={saved} error={failed} />
        <SaveButton loading={mut.isPending} />
      </div>
    </form>
  );
}
