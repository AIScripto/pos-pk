import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import FormDialog from '@/components/admin/FormDialog';
import FormSection, { FormField } from '@/components/admin/FormSection';
import { FormInput } from '@/components/admin/FormInputs';
import SearchableSelect from '@/components/admin/SearchableSelect';
import { User, CreateUserInput, UpdateUserInput, userApi } from '@/lib/api/user.api';
import { roleApi } from '@/lib/api/role.api';
import { branchApi } from '@/lib/api/branch.api';
import { KeyRound, MapPin, ShieldCheck, Wand2 } from 'lucide-react';

// Role tags that require a branch
const BRANCH_SCOPED = new Set(['manager', 'branch_manager', 'cashier', 'pos_operator', 'kitchen', 'kitchen_operator']);
// Role tags where PIN login is used (PIN required on create)
const PIN_REQUIRED  = new Set(['cashier', 'pos_operator', 'kitchen', 'kitchen_operator']);

interface Props {
  open:         boolean;
  onOpenChange: (open: boolean) => void;
  user?:        User | null;
  onSave:       (data: CreateUserInput | UpdateUserInput) => Promise<void>;
  isLoading?:   boolean;
}

const blank = { username: '', name: '', email: '', phone: '', roleId: '', branchId: '', pin: '', password: '' };

export default function UserFormDialog({ open, onOpenChange, user, onSave, isLoading = false }: Props) {
  const [form, setForm]     = useState({ ...blank });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: roles = [] } = useQuery({ queryKey: ['roles'], queryFn: () => roleApi.list(), enabled: open });
  const { data: branches = [] } = useQuery({ queryKey: ['branches'], queryFn: () => branchApi.list(), enabled: open });

  const selectedRole    = useMemo(() => roles.find((r) => r.id === form.roleId), [roles, form.roleId]);
  const selectedRoleTag = selectedRole?.tag?.toLowerCase() ?? '';
  const isGlobalAdmin   = selectedRoleTag === 'admin' || selectedRoleTag === 'super_admin' || selectedRoleTag === 'org_admin';
  const needsBranch     = !isGlobalAdmin; // All cashiers, managers, and operators are branch-scoped!
  const pinRequired     = PIN_REQUIRED.has(selectedRoleTag) && !user; // required only on create
  const showPin         = true; // Always allow configuring PIN for all users

  // Auto-suggest username on role change (create mode only)
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);
  const handleRoleChange = async (roleId: string) => {
    setForm((f) => ({ ...f, roleId }));
    if (user) return;
    const tag = roles.find((r) => r.id === roleId)?.tag;
    if (!tag) return;
    setLoadingSuggestion(true);
    try {
      const { username } = await userApi.suggestUsername(tag);
      setForm((f) => ({ ...f, roleId, username }));
    } catch { /* best-effort */ } finally {
      setLoadingSuggestion(false);
    }
  };

  // Reset / populate form when dialog opens
  useEffect(() => {
    if (user) {
      setForm({ username: user.username ?? '', name: user.name ?? '', email: user.email ?? '',
                phone: user.phone ?? '', roleId: user.roleId ?? '', branchId: user.branchId ?? '', pin: '', password: '' });
    } else {
      setForm({ ...blank });
    }
    setErrors({});
  }, [user, open]);

  useEffect(() => {
    if (!needsBranch) setForm((f) => ({ ...f, branchId: '' }));
  }, [needsBranch]);

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.username.trim())                                 e.username = 'Username is required';
    if (!form.name.trim())                                     e.name     = 'Full name is required';
    if (!form.email.trim())                                    e.email    = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))  e.email    = 'Invalid email format';
    if (!form.roleId)                                          e.roleId   = 'Role is required';
    if (needsBranch && !form.branchId)                         e.branchId = 'Branch is required for this role';
    if (pinRequired && !form.pin.trim())                       e.pin      = 'PIN is required for this role';
    if (form.pin && !/^\d{4}$/.test(form.pin))                 e.pin      = 'PIN must be exactly 4 digits';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSave({
      username: form.username.trim(),
      name:     form.name.trim(),
      email:    form.email.trim(),
      phone:    form.phone.trim() || undefined,
      roleId:   form.roleId,
      branchId: needsBranch ? form.branchId : undefined,
      pin:      form.pin.trim() || undefined,
      password: form.password.trim() || undefined,
    });
  };

  const set = (key: keyof typeof blank) => (val: string) => setForm((f) => ({ ...f, [key]: val }));

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={user ? 'Edit User' : 'Add User'}
      description={user ? 'Update user details and branch assignment' : 'Create a new user and assign their branch'}
      isLoading={isLoading}
      onSubmit={handleSubmit}
      submitText={user ? 'Save Changes' : 'Create User'}
      isCreating={!user}
    >
      {/* ── User Info ──────────────────────────────────────────────────────── */}
      <FormSection title="User Information" columns={1}>
        <FormField
          label={
            <span className="flex items-center gap-1.5">
              Username
              {!user && <span className="text-2xs font-normal text-muted-foreground">— auto-filled when role is selected</span>}
            </span>
          }
          required
          error={errors.username}
        >
          <div className="relative">
            <FormInput
              placeholder={loadingSuggestion ? 'Generating…' : 'Select a role to auto-fill'}
              value={form.username}
              onChange={(e) => !user && set('username')(e.target.value)}
              disabled={!!user || loadingSuggestion}
            />
            {loadingSuggestion && (
              <Wand2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-pulse text-warning" />
            )}
          </div>
        </FormField>

        <FormField label="Full Name" required error={errors.name}>
          <FormInput placeholder="e.g. Ahmed Khan" value={form.name}
            onChange={(e) => set('name')(e.target.value)} />
        </FormField>

        <FormField label="Email" required error={errors.email}>
          <FormInput type="email" placeholder="e.g. ahmed@example.com" value={form.email}
            onChange={(e) => set('email')(e.target.value)} />
        </FormField>

        <FormField label="Phone">
          <FormInput type="tel" placeholder="e.g. +92300123456" value={form.phone}
            onChange={(e) => set('phone')(e.target.value)} />
        </FormField>
      </FormSection>

      {/* ── Role & Branch ──────────────────────────────────────────────────── */}
      <FormSection title="Role & Branch Assignment" columns={1}>
        <FormField label="Role" required error={errors.roleId}>
          <SearchableSelect
            value={form.roleId}
            onChange={handleRoleChange}
            placeholder="Select a role"
            options={roles.map((r) => ({ value: r.id, label: r.name, sublabel: r.tag }))}
          />
        </FormField>

        {needsBranch && (
          <FormField
            label={<span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-warning" />Assigned Branch</span>}
            required
            error={errors.branchId}
          >
            <SearchableSelect
              value={form.branchId}
              onChange={set('branchId')}
              placeholder="Select a branch"
              options={branches.map((b) => ({ value: b.id, label: b.name, sublabel: b.label }))}
            />
            <p className="mt-1 text-[11px] text-muted-foreground">
              This user will only be able to operate at the selected branch.
            </p>
          </FormField>
        )}

        {form.roleId && !needsBranch && (
          <p className="rounded-md border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
            This role has organisation-wide access — no branch restriction needed.
          </p>
        )}
      </FormSection>

      {/* ── Password ──────────────────────────────────────────────────────── */}
      <FormSection title="Account Password" columns={1}>
        <FormField
          label={
            <span className="flex items-center gap-1.5">
              <KeyRound className="h-3.5 w-3.5 text-muted-foreground" />
              {user ? 'New Password (leave blank to keep current)' : 'Password (optional — generated automatically if left blank)'}
            </span>
          }
          error={errors.password}
        >
          <FormInput
            type="password"
            placeholder={user ? 'Enter new password' : 'e.g. SecretPass123!'}
            value={form.password}
            onChange={(e) => set('password')(e.target.value)}
          />
          <p className="mt-1 text-[11px] text-muted-foreground">
            {user
              ? 'Enter a new password to update this user password, or leave blank to keep current password.'
              : 'Used to log in to the Web Admin Portal & Manager Panel.'}
          </p>
        </FormField>
      </FormSection>

      {/* ── PIN ────────────────────────────────────────────────────────────── */}
      {showPin && (
        <FormSection title="Counter PIN" columns={1}>
          {user?.hasPin && !form.pin && (
            <div className="flex items-center gap-2 rounded-md border border-success-border bg-success-subtle px-3 py-2 text-xs font-semibold text-success-text">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              PIN is already set. Enter a new PIN below to change it, or leave blank to keep the current one.
            </div>
          )}

          <FormField
            label={
              <span className="flex items-center gap-1.5">
                <KeyRound className="h-3.5 w-3.5 text-muted-foreground" />
                {user ? 'New PIN (leave blank to keep current)' : `4-Digit PIN${pinRequired ? '' : ' (optional)'}`}
              </span>
            }
            required={pinRequired}
            error={errors.pin}
          >
            <FormInput
              type="password"
              inputMode="numeric"
              maxLength={4}
              placeholder="e.g. 1234"
              value={form.pin}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                set('pin')(val);
              }}
              className="tracking-[0.5em] text-center font-mono text-lg"
            />
            <p className="mt-1 text-[11px] text-muted-foreground">
              {PIN_REQUIRED.has(selectedRoleTag)
                ? 'Required — cashiers and kitchen staff log in with their PIN at the terminal.'
                : 'Optional — allows this manager to log in quickly at the counter using a PIN.'}
            </p>
          </FormField>
        </FormSection>
      )}
    </FormDialog>
  );
}
