import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminConfigApi, type OrgConfig } from '@/lib/api/admin-config.api';
import { branchApi } from '@/lib/api/branch.api';
import SearchableSelect from '@/components/admin/SearchableSelect';
import { MapPin, Globe, Hash, Phone, Mail } from 'lucide-react';
import {
  Field,
  Grid,
  Input,
  SaveButton,
  SaveFeedback,
  SectionCard,
} from '@/components/admin/config/ConfigFormPrimitives';

export function ProfileSection() {
  const qc = useQueryClient();
  const { data: cfg, isLoading } = useQuery({ queryKey: ['orgConfig'], queryFn: adminConfigApi.getOrgConfig });
  const { data: branches = [] }  = useQuery({ queryKey: ['adminBranches'], queryFn: () => branchApi.list() });

  const [form,   setForm]   = useState<Partial<OrgConfig>>({});
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

  // Find the currently selected branch to show its address preview
  const selectedBranch = branches.find((b) => b.id === form.defaultBranchId);

  if (isLoading) return <div className="py-10 text-center text-muted-foreground/70">Loading…</div>;

  return (
    <form onSubmit={(e) => { e.preventDefault(); mut.mutate(form); }} className="space-y-6">

      {/* Business Info */}
      <SectionCard title="Business Information">
        <Grid cols={2}>
          <Field label="Business Name">
            <Input value={form.businessName ?? ''} onChange={e => set('businessName', e.target.value)} placeholder="Crip & Crumbs" />
          </Field>
          <Field label="Logo URL">
            <Input value={form.logoUrl ?? ''} onChange={e => set('logoUrl', e.target.value)} placeholder="https://..." />
          </Field>
          <Field label="Business Email">
            <Input type="email" value={form.businessEmail ?? ''} onChange={e => set('businessEmail', e.target.value)} placeholder="info@cripcrumbs.com" />
          </Field>
          <Field label="Business Phone">
            <Input value={form.businessPhone ?? ''} onChange={e => set('businessPhone', e.target.value)} placeholder="+92300000000" />
          </Field>
        </Grid>
      </SectionCard>

      {/* Tax Registration */}
      <SectionCard title="Tax Registration">
        <Grid cols={2}>
          <Field label="Tax Reg Label" hint="e.g. NTN, GST, VAT">
            <Input value={form.taxRegLabel ?? 'NTN'} onChange={e => set('taxRegLabel', e.target.value)} placeholder="NTN" />
          </Field>
          <Field label="Tax Reg Number">
            <Input value={form.taxRegNumber ?? ''} onChange={e => set('taxRegNumber', e.target.value)} placeholder="1234567-8" />
          </Field>
        </Grid>
      </SectionCard>

      {/* Default Branch */}
      <SectionCard title="Default Branch">
        <div className="space-y-4">
          <Field label="Default Branch" hint="Address, city and area are sourced from the selected branch">
            <SearchableSelect
              options={branches.map((b) => ({
                value: b.id,
                label: `${b.name} (${b.label})`,
              }))}
              value={form.defaultBranchId ?? ''}
              onChange={val => set('defaultBranchId', val)}
              placeholder="— Select default branch —"
            />
          </Field>

          {/* Branch Address Preview */}
          {selectedBranch ? (
            <div className="rounded-lg border border-info-border bg-info-subtle p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-primary">
                Branch Address Preview
              </p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Address</p>
                    <p className="text-sm font-medium text-foreground">
                      {selectedBranch.addrLine1 || '—'}
                      {selectedBranch.addrLine2 && <>, {selectedBranch.addrLine2}</>}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Globe className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">City / Area</p>
                    <p className="text-sm font-medium text-foreground">
                      {selectedBranch.addrCity || selectedBranch.city?.name || '—'}
                      {selectedBranch.addrArea && ` · ${selectedBranch.addrArea}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Hash className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">State / Country</p>
                    <p className="text-sm font-medium text-foreground">
                      {selectedBranch.addrState || '—'} · {selectedBranch.addrCountry || 'PK'}
                    </p>
                  </div>
                </div>
                {selectedBranch.phone && (
                  <div className="flex items-start gap-2">
                    <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Branch Phone</p>
                      <p className="text-sm font-medium text-foreground">{selectedBranch.phone}</p>
                    </div>
                  </div>
                )}
                {selectedBranch.email && (
                  <div className="flex items-start gap-2">
                    <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Branch Email</p>
                      <p className="text-sm font-medium text-foreground">{selectedBranch.email}</p>
                    </div>
                  </div>
                )}
              </div>
              <p className="mt-3 text-xs text-primary">
                ℹ️ To update the address, edit the branch in Location Management → Branches.
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border bg-muted/40 p-4 text-center">
              <MapPin className="mx-auto mb-2 h-6 w-6 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Select a default branch to preview its address</p>
            </div>
          )}
        </div>
      </SectionCard>

      <div className="flex items-center justify-between">
        <SaveFeedback success={saved} error={failed} />
        <SaveButton loading={mut.isPending} />
      </div>
    </form>
  );
}
