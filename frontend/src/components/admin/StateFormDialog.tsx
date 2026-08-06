import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import FormDialog from '@/components/admin/FormDialog';
import FormSection, { FormField } from '@/components/admin/FormSection';
import { FormInput } from '@/components/admin/FormInputs';
import { State, stateApi, CreateStateInput, UpdateStateInput } from '@/lib/api/state.api';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface StateFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  state?: State;
  onSuccess?: () => void;
}

export default function StateFormDialog({
  open,
  onOpenChange,
  state,
  onSuccess,
}: StateFormDialogProps) {
  const queryClient = useQueryClient();
  const isEdit = !!state;

  const [formData, setFormData] = useState<CreateStateInput>({
    tag: '',
    name: '',
    code: '',
    zipCode: '',
    country: 'PK',
    region: '',
    isActive: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (state && open) {
      setFormData({
        tag: state.tag,
        name: state.name,
        code: state.code,
        zipCode: state.zipCode || '',
        country: state.country,
        region: state.region || '',
        isActive: state.isActive,
      });
    } else if (open) {
      resetForm();
    }
    setErrors({});
  }, [state, open]);

  const resetForm = () => {
    setFormData({
      tag: '',
      name: '',
      code: '',
      zipCode: '',
      country: 'PK',
      region: '',
      isActive: true,
    });
  };

  const mutation = useMutation({
    mutationFn: async (data: CreateStateInput | UpdateStateInput) => {
      if (isEdit && state) {
        return stateApi.update(state.id, data as UpdateStateInput);
      } else {
        return stateApi.create(data as CreateStateInput);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['states'] });
      onSuccess?.();
      onOpenChange(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.tag?.trim()) newErrors.tag = 'Tag is required';
    if (!formData.name?.trim()) newErrors.name = 'Name is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    mutation.mutate({
      ...formData,
      tag: formData.tag?.toUpperCase().trim(),
      name: formData.name?.trim(),
      code: formData.code?.trim(),
      zipCode: formData.zipCode?.trim(),
      region: formData.region?.trim(),
    });
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? 'Edit State' : 'Create State'}
      description={isEdit ? 'Update state information' : 'Add a new state'}
      isLoading={mutation.isPending}
      onSubmit={handleSubmit}
      submitText={isEdit ? 'Update' : 'Create'}
      error={mutation.isError ? 'Failed to save state' : undefined}
    >
      <FormSection title="Basic Information" columns={2}>
        <FormField label="Tag" required error={errors.tag}>
          <FormInput
            placeholder="e.g., PJ, ICT"
            value={formData.tag}
            onChange={(e) => setFormData({ ...formData, tag: e.target.value.toUpperCase() })}
            maxLength={5}
          />
        </FormField>

        <FormField label="Name" required error={errors.name}>
          <FormInput
            placeholder="e.g., Punjab"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </FormField>

        <FormField label="Code">
          <FormInput
            placeholder="e.g., PB"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            maxLength={5}
          />
        </FormField>

        <FormField label="Country">
          <FormInput
            placeholder="e.g., PK"
            value={formData.country}
            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            maxLength={2}
          />
        </FormField>

        <FormField label="Zip Code">
          <FormInput
            placeholder="e.g., 75500"
            value={formData.zipCode}
            onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
          />
        </FormField>

        <FormField label="Region">
          <FormInput
            placeholder="e.g., Northern"
            value={formData.region}
            onChange={(e) => setFormData({ ...formData, region: e.target.value })}
          />
        </FormField>
      </FormSection>

      <FormSection title="Status" columns={1}>
        <div className="flex items-center justify-between">
          <Label htmlFor="state-status" className="text-sm font-medium">
            Active
          </Label>
          <Switch
            id="state-status"
            checked={formData.isActive}
            onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
          />
        </div>
      </FormSection>
    </FormDialog>
  );
}
