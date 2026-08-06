import { useState, useEffect } from 'react';
import FormDialog from '@/components/admin/FormDialog';
import FormSection, { FormField } from '@/components/admin/FormSection';
import { FormInput } from '@/components/admin/FormInputs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FoodType, CreateFoodTypeInput, UpdateFoodTypeInput } from '@/lib/api/admin-food-type.api';

interface AdminFoodTypeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  foodType?: FoodType | null;
  onSave: (data: CreateFoodTypeInput | UpdateFoodTypeInput) => Promise<void>;
  isLoading?: boolean;
  apiError?: string | null;
}

export default function AdminFoodTypeFormDialog({
  open,
  onOpenChange,
  foodType,
  onSave,
  isLoading = false,
  apiError = null,
}: AdminFoodTypeFormDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    sortOrder: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (foodType) {
      setFormData({
        name: foodType.name,
        slug: foodType.slug,
        sortOrder: foodType.sortOrder?.toString() || '',
      });
    } else {
      resetForm();
    }
    setErrors({});
  }, [foodType, open]);

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      sortOrder: '',
    });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Food type name is required';
    }

    if (!formData.slug?.trim()) {
      newErrors.slug = 'Slug is required';
    } else if (!/^[A-Z0-9]{3}$/.test(formData.slug.toUpperCase())) {
      newErrors.slug = 'Slug must be exactly 3 characters (letters/numbers)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const data: CreateFoodTypeInput | UpdateFoodTypeInput = {
        name: formData.name.trim(),
        slug: formData.slug.toUpperCase().trim(),
        sortOrder: formData.sortOrder ? parseInt(formData.sortOrder) : undefined,
      };

      await onSave(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={foodType ? 'Edit Food Type' : 'Add Food Type'}
      description={foodType ? 'Update food type information' : 'Create a new food type'}
      isLoading={isLoading}
      onSubmit={handleSubmit}
      submitText={foodType ? 'Update' : 'Create'}
    >
      {apiError && (
        <Alert variant="destructive">
          <AlertDescription>{apiError}</AlertDescription>
        </Alert>
      )}
      <FormSection title="Food Type Details" columns={2}>
        <FormField label="Name" required error={errors.name}>
          <FormInput
            placeholder="e.g., Fast Food"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </FormField>

        <FormField label="Slug (3 letters)" required error={errors.slug}>
          <FormInput
            placeholder="e.g., FFD"
            value={formData.slug.toUpperCase()}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            maxLength={3}
          />
        </FormField>

        <FormField label="Sort Order">
          <FormInput
            type="number"
            placeholder="e.g., 1"
            value={formData.sortOrder}
            onChange={(e) => setFormData({ ...formData, sortOrder: e.target.value })}
          />
        </FormField>
      </FormSection>
    </FormDialog>
  );
}
