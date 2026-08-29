// =============================================================================
// AdminOrganisation — View & edit the current organisation's core details
// Single-org mode: only one organisation exists per deployment
// =============================================================================

import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { organisationApi, UpdateOrganisationInput } from '@/lib/api/organisation.api';
import AdminPageLayout from '@/components/admin/AdminPageLayout';
import {
  Building2, Globe, Phone, Mail, MapPin,
  Save, Loader2, CheckCircle2, AlertCircle, Hash, Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// ── Shared sub-components ─────────────────────────────────────────────────────

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-muted-foreground">{label}</label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function Input({ className = '', ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      {...props}
    />
  );
}

function SectionCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-center gap-2 border-b border-border px-5 py-4">
        <span className="text-muted-foreground">{icon}</span>
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      </div>
      <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">{children}</div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminOrganisation() {
  const queryClient = useQueryClient();
  const [form, setForm]       = useState<UpdateOrganisationInput>({});
  const [saved, setSaved]     = useState(false);
  const [errMsg, setErrMsg]   = useState('');

  const { data: org, isLoading } = useQuery({
    queryKey: ['organisation'],
    queryFn:  organisationApi.get,
  });

  // Populate the form the first time the organisation loads, and only then —
  // re-running would discard whatever the user has typed since. The guard used
  // to read `form` without depending on it; a ref says "once" directly.
  const populated = useRef(false);
  useEffect(() => {
    if (!org || populated.current) return;
    populated.current = true;
    const { id, slug, createdAt, updatedAt, ...rest } = org;
    setForm(rest);
  }, [org]);

  const mutation = useMutation({
    mutationFn: (data: UpdateOrganisationInput) => organisationApi.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organisation'] });
      setSaved(true);
      setErrMsg('');
      setTimeout(() => setSaved(false), 3000);
    },
    onError: (err: Error) => {
      // The API client throws ApiError, which carries the server's message
      // directly — the axios-shaped `err.response.data.message` chain that used
      // to be checked here never matched anything.
      setErrMsg(err.message || 'Failed to save');
      setTimeout(() => setErrMsg(''), 5000);
    },
  });

  function set<K extends keyof UpdateOrganisationInput>(key: K, value: UpdateOrganisationInput[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    mutation.mutate(form);
  }

  if (isLoading) {
    return (
      <AdminPageLayout title="Organisation" description="Loading…" icon={<Building2 className="w-5 h-5" />}>
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminPageLayout>
    );
  }

  return (
    <AdminPageLayout
      title="Organisation Setup"
      description="Core identity, contact details, and registered address for your organisation"
      icon={<Building2 className="w-5 h-5" />}
    >
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ── Identity ─────────────────────────────────────────────────── */}
        <SectionCard title="Identity" icon={<Building2 className="w-4 h-4" />}>
          <Field label="Organisation Name" hint="Displayed on receipts and reports">
            <Input
              value={form.name ?? ''}
              onChange={e => set('name', e.target.value)}
              placeholder="Your Company Name"
              required
            />
          </Field>

          <Field label="Slug" hint="URL-safe identifier — cannot be changed">
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-2.5 w-4 h-4 text-muted-foreground/70" />
              <Input value={org?.slug ?? ''} disabled className="pl-9 bg-muted/40" />
            </div>
          </Field>

          <Field label="Logo URL" hint="Direct URL to your logo image">
            <Input
              value={form.logo ?? ''}
              onChange={e => set('logo', e.target.value)}
              placeholder="https://example.com/logo.png"
              type="url"
            />
          </Field>

          <Field label="Website">
            <div className="relative">
              <Globe className="pointer-events-none absolute left-3 top-2.5 w-4 h-4 text-muted-foreground/70" />
              <Input
                value={form.website ?? ''}
                onChange={e => set('website', e.target.value)}
                placeholder="https://example.com"
                type="url"
                className="pl-9"
              />
            </div>
          </Field>
        </SectionCard>

        {/* ── Contact ──────────────────────────────────────────────────── */}
        <SectionCard title="Contact" icon={<Phone className="w-4 h-4" />}>
          <Field label="Email">
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-2.5 w-4 h-4 text-muted-foreground/70" />
              <Input
                value={form.email ?? ''}
                onChange={e => set('email', e.target.value)}
                placeholder="info@example.com"
                type="email"
                className="pl-9"
              />
            </div>
          </Field>

          <Field label="Phone">
            <div className="relative">
              <Phone className="pointer-events-none absolute left-3 top-2.5 w-4 h-4 text-muted-foreground/70" />
              <Input
                value={form.phone ?? ''}
                onChange={e => set('phone', e.target.value)}
                placeholder="+92 300 1234567"
                className="pl-9"
              />
            </div>
          </Field>
        </SectionCard>

        {/* ── Registered Address ───────────────────────────────────────── */}
        <SectionCard title="Registered Address" icon={<MapPin className="w-4 h-4" />}>
          <Field label="Address Line 1" hint="Street / building number">
            <Input
              value={form.addrLine1 ?? ''}
              onChange={e => set('addrLine1', e.target.value)}
              placeholder="123 Main Street"
            />
          </Field>

          <Field label="Address Line 2" hint="Floor, suite, landmark (optional)">
            <Input
              value={form.addrLine2 ?? ''}
              onChange={e => set('addrLine2', e.target.value)}
              placeholder="2nd Floor, Building Name"
            />
          </Field>

          <Field label="City">
            <Input
              value={form.addrCity ?? ''}
              onChange={e => set('addrCity', e.target.value)}
              placeholder="City Name"
            />
          </Field>

          <Field label="State / Province">
            <Input
              value={form.addrState ?? ''}
              onChange={e => set('addrState', e.target.value)}
              placeholder="Punjab"
            />
          </Field>

          <Field label="Country">
            <Input
              value={form.addrCountry ?? ''}
              onChange={e => set('addrCountry', e.target.value)}
              placeholder="PK"
              maxLength={2}
            />
          </Field>

          <Field label="Postal Code">
            <div className="relative">
              <Hash className="pointer-events-none absolute left-3 top-2.5 w-4 h-4 text-muted-foreground/70" />
              <Input
                value={form.addrPostCode ?? ''}
                onChange={e => set('addrPostCode', e.target.value)}
                placeholder="54000"
                className="pl-9"
              />
            </div>
          </Field>
        </SectionCard>

        {/* ── Footer actions ───────────────────────────────────────────── */}
        <div className="flex items-center justify-between rounded-xl border border-border bg-card px-5 py-4 shadow-sm">
          <div className="flex items-center gap-3">
            {saved && (
              <span className="flex items-center gap-1.5 text-sm text-success-text">
                <CheckCircle2 className="w-4 h-4" /> Saved successfully
              </span>
            )}
            {errMsg && (
              <span className="flex items-center gap-1.5 text-sm text-danger-text">
                <AlertCircle className="w-4 h-4" /> {errMsg}
              </span>
            )}
          </div>
          <Button type="submit" disabled={mutation.isPending} className="bg-primary hover:bg-primary/90 text-white gap-2">
            {mutation.isPending
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
              : <><Save className="w-4 h-4" /> Save Changes</>}
          </Button>
        </div>

      </form>
    </AdminPageLayout>
  );
}
