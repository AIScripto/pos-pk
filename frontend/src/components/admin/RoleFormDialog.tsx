import { useState, useEffect } from 'react';
import FormDialog from '@/components/admin/FormDialog';
import FormSection, { FormField } from '@/components/admin/FormSection';
import { FormInput } from '@/components/admin/FormInputs';
import { Role, CreateRoleInput, UpdateRoleInput } from '@/lib/api/role.api';

interface RoleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role?: Role | null;
  onSave: (data: CreateRoleInput | UpdateRoleInput) => Promise<void>;
  isLoading?: boolean;
}

export default function RoleFormDialog({
  open,
  onOpenChange,
  role,
  onSave,
  isLoading = false,
}: RoleFormDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    tag: '',
    description: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name,
        tag: role.tag,
        description: role.description || '',
      });
    } else {
      resetForm();
    }
    setErrors({});
  }, [role, open]);

  const resetForm = () => {
    setFormData({
      name: '',
      tag: '',
      description: '',
    });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Role name is required';
    }

    if (!formData.tag?.trim()) {
      newErrors.tag = 'Role tag is required';
    } else if (!/^[a-z0-9_-]+$/.test(formData.tag.trim())) {
      newErrors.tag = 'Tag must contain only lowercase letters, numbers, hyphens, and underscores';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await onSave({
        name: formData.name.trim(),
        tag: formData.tag.toLowerCase().trim(),
        description: formData.description.trim() || undefined,
      });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={role ? 'Edit Role' : 'Create Role'}
      description={role ? 'Update role information' : 'Add a new role for your organization'}
      isLoading={isLoading}
      onSubmit={handleSubmit}
      submitText={role ? 'Update' : 'Create'}
    >
      <FormSection title="Role Information" columns={1}>
        <FormField label="Role Name" required error={errors.name}>
          <FormInput
            placeholder="e.g., Manager, Supervisor"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </FormField>

        <FormField label="Tag" required error={errors.tag}>
          <FormInput
            placeholder="e.g., manager, supervisor"
            value={formData.tag}
            onChange={(e) => setFormData({ ...formData, tag: e.target.value.toLowerCase() })}
            maxLength={50}
          />
        </FormField>

        <FormField label="Description">
          <FormInput
            placeholder="What is this role responsible for?"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </FormField>
      </FormSection>
    </FormDialog>
  );
}
