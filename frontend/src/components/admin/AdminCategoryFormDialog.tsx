import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Category, adminCategoryApi, CreateCategoryInput, UpdateCategoryInput } from '@/lib/api/admin-category.api';
import { adminFoodTypeApi } from '@/lib/api/admin-food-type.api';
import FormDialog from '@/components/admin/FormDialog';
import FormSection, { FormField } from '@/components/admin/FormSection';
import { FormInput } from '@/components/admin/FormInputs';
import SearchableSelect from '@/components/admin/SearchableSelect';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category;
  onSuccess?: () => void;
}

export default function AdminCategoryFormDialog({ open, onOpenChange, category, onSuccess }: Props) {
  const queryClient = useQueryClient();
  const isEdit = !!category;

  const [formData, setFormData] = useState({
    name: '',
    tag: '',
    foodTypeId: '',
    sortOrder: '0',
    isActive: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);

  const { data: foodTypes = [] } = useQuery({
    queryKey: ['food-types'],
    queryFn: () => adminFoodTypeApi.list(),
    enabled: open,
  });

  useEffect(() => {
    if (category && open) {
      setFormData({
        name: category.name,
        tag: category.tag,
        foodTypeId: category.foodTypeId || '',
        sortOrder: category.sortOrder.toString(),
        isActive: category.isActive,
      });
    } else if (open) {
      resetForm();
    }
    setErrors({});
    setApiError(null);
  }, [category, open]);

  const resetForm = () => {
    setFormData({
      name: '',
      tag: '',
      foodTypeId: '',
      sortOrder: '0',
      isActive: true,
    });
  };

  const mutation = useMutation({
    mutationFn: async (data: CreateCategoryInput | UpdateCategoryInput) => {
      if (isEdit && category) {
        return adminCategoryApi.update(category.id, data as UpdateCategoryInput);
      } else {
        return adminCategoryApi.create(data as CreateCategoryInput);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      onSuccess?.();
      onOpenChange(false);
      setApiError(null);
    },
    onError: (error: Error) => {
      const message = error?.message || 'Failed to save category';
      setApiError(message);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.foodTypeId?.trim()) newErrors.foodTypeId = 'Food type is required';
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.tag.trim()) newErrors.tag = 'Tag is required';

    const tag = formData.tag.toUpperCase().trim();
    if (!/^[A-Z0-9]{3}$/.test(tag)) {
      newErrors.tag = 'Tag must be exactly 3 characters (letters/numbers)';
    }

    const sortOrder = parseInt(formData.sortOrder, 10);
    if (isNaN(sortOrder) || sortOrder < 0) {
      newErrors.sortOrder = 'Sort order must be 0 or greater';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    mutation.mutate({
      name: formData.name.trim(),
      tag: tag.toUpperCase(),
      foodTypeId: formData.foodTypeId,
      sortOrder,
      isActive: formData.isActive,
    });
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? 'Edit Category' : 'Create Category'}
      description={isEdit ? 'Update category information' : 'Add a new product category'}
      isLoading={mutation.isPending}
      onSubmit={handleSubmit}
      submitText={isEdit ? 'Update' : 'Create'}
    >
      {apiError && (
        <Alert variant="destructive">
          <AlertDescription>{apiError}</AlertDescription>
        </Alert>
      )}
      <FormSection title="Basic Information" columns={1}>
        <FormField label="Food Type" required error={errors.foodTypeId}>
          <SearchableSelect
            options={foodTypes.map((ft) => ({
              value: ft.id,
              label: ft.name,
              sublabel: ft.slug,
            }))}
            value={formData.foodTypeId}
            onChange={(val) => setFormData({ ...formData, foodTypeId: val })}
            placeholder="Select food type..."
            searchPlaceholder="Search food types..."
            disabled={isEdit}
          />
        </FormField>

        <FormField label="Name" required error={errors.name}>
          <FormInput
            placeholder="e.g., Burgers"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </FormField>

        <FormField label="Tag (Identifier)" required error={errors.tag}>
          <FormInput
            placeholder="e.g., BRG (3 letters)"
            value={formData.tag.toUpperCase()}
            onChange={(e) => setFormData({ ...formData, tag: e.target.value.toUpperCase() })}
            maxLength={3}
          />
        </FormField>

        <FormField label="Sort Order" error={errors.sortOrder}>
          <FormInput
            type="number"
            placeholder="0"
            value={formData.sortOrder}
            onChange={(e) => setFormData({ ...formData, sortOrder: e.target.value })}
            min="0"
          />
        </FormField>
      </FormSection>

      <FormSection title="Status" columns={1}>
        <div className="flex items-center justify-between">
          <Label htmlFor="category-status" className="text-sm font-medium">Active</Label>
          <Switch
            id="category-status"
            checked={formData.isActive}
            onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
          />
        </div>
      </FormSection>
    </FormDialog>
  );
}
