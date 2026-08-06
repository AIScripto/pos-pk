import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Area, areaApi, CreateAreaInput, UpdateAreaInput } from '@/lib/api/area.api';
import { cityApi, City } from '@/lib/api/city.api';
import FormDialog from '@/components/admin/FormDialog';
import FormSection, { FormField } from '@/components/admin/FormSection';
import { FormInput } from '@/components/admin/FormInputs';
import SearchableSelect from '@/components/admin/SearchableSelect';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  area?: Area;
  initialCityId?: string;
  onSuccess?: () => void;
}

export default function AreaFormDialog({ open, onOpenChange, area, initialCityId = '', onSuccess }: Props) {
  const queryClient = useQueryClient();
  const isEdit = !!area;

  const [formData, setFormData] = useState({
    cityId: '',
    tag: '',
    name: '',
    details: '',
    latitude: '',
    longitude: '',
    isActive: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (area && open) {
      setFormData({
        cityId: area.cityId,
        tag: area.tag,
        name: area.name,
        details: area.details || '',
        latitude: area.latitude?.toString() || '',
        longitude: area.longitude?.toString() || '',
        isActive: area.isActive,
      });
    } else if (open) {
      resetForm(initialCityId);
    }
    setErrors({});
  }, [area, initialCityId, open]);

  const resetForm = (cityId = '') => {
    setFormData({
      cityId,
      tag: '',
      name: '',
      details: '',
      latitude: '',
      longitude: '',
      isActive: true,
    });
  };

  const { data: cities = [] } = useQuery({
    queryKey: ['cities'],
    queryFn: () => cityApi.list(),
    enabled: open,
  });

  const mutation = useMutation({
    mutationFn: async (data: CreateAreaInput | UpdateAreaInput) => {
      if (isEdit && area) {
        return areaApi.update(area.id, data as UpdateAreaInput);
      } else {
        return areaApi.create(data as CreateAreaInput);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['areas'] });
      onSuccess?.();
      onOpenChange(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.cityId) newErrors.cityId = 'City is required';
    if (!formData.tag.trim()) newErrors.tag = 'Tag is required';
    if (!formData.name.trim()) newErrors.name = 'Name is required';

    if (formData.latitude) {
      const lat = parseFloat(formData.latitude);
      if (isNaN(lat) || lat < -90 || lat > 90) newErrors.latitude = 'Must be -90 to 90';
    }

    if (formData.longitude) {
      const lng = parseFloat(formData.longitude);
      if (isNaN(lng) || lng < -180 || lng > 180) newErrors.longitude = 'Must be -180 to 180';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    mutation.mutate({
      ...formData,
      tag: formData.tag.toUpperCase().trim(),
      name: formData.name.trim(),
      details: formData.details.trim() || undefined,
      latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
      longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
    });
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? 'Edit Area' : 'Create Area'}
      description={isEdit ? 'Update area information' : 'Add a new area to a city'}
      isLoading={mutation.isPending}
      onSubmit={handleSubmit}
      submitText={isEdit ? 'Update' : 'Create'}
    >
      <FormSection title="Basic Information" columns={1}>
        <FormField label="City" required error={errors.cityId}>
          <SearchableSelect
            value={formData.cityId}
            onChange={(val) => setFormData({ ...formData, cityId: val })}
            placeholder="Select City"
            disabled={isEdit}
            options={cities.map((city: City) => ({ value: city.id, label: city.name, sublabel: city.code }))}
          />
        </FormField>

        <FormField label="Tag" required error={errors.tag}>
          <FormInput
            placeholder="e.g., DHA, FD-01"
            value={formData.tag}
            onChange={(e) => setFormData({ ...formData, tag: e.target.value.toUpperCase() })}
            maxLength={20}
          />
        </FormField>

        <FormField label="Name" required error={errors.name}>
          <FormInput
            placeholder="e.g., DHA Phase 1-4"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </FormField>

        <FormField label="Details">
          <FormInput
            placeholder="Description or notes..."
            value={formData.details}
            onChange={(e) => setFormData({ ...formData, details: e.target.value })}
          />
        </FormField>
      </FormSection>

      <FormSection title="Coordinates (Optional)" columns={2}>
        <FormField label="Latitude" error={errors.latitude}>
          <FormInput
            type="number"
            placeholder="-90 to 90"
            step="0.0001"
            value={formData.latitude}
            onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
          />
        </FormField>

        <FormField label="Longitude" error={errors.longitude}>
          <FormInput
            type="number"
            placeholder="-180 to 180"
            step="0.0001"
            value={formData.longitude}
            onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
          />
        </FormField>
      </FormSection>

      <FormSection title="Status" columns={1}>
        <div className="flex items-center justify-between">
          <Label htmlFor="area-status" className="text-sm font-medium">Active</Label>
          <Switch
            id="area-status"
            checked={formData.isActive}
            onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
          />
        </div>
      </FormSection>
    </FormDialog>
  );
}
