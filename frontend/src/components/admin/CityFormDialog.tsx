import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import FormDialog from '@/components/admin/FormDialog';
import FormSection, { FormField } from '@/components/admin/FormSection';
import { FormInput } from '@/components/admin/FormInputs';
import SearchableSelect from '@/components/admin/SearchableSelect';
import { City, CreateCityInput, UpdateCityInput } from '@/lib/api/city.api';
import { stateApi } from '@/lib/api/state.api';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface CityFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  city?: City;
  onSave: (data: CreateCityInput | UpdateCityInput) => Promise<void>;
  isLoading?: boolean;
}

interface CityFormData {
  name: string;
  code: string;
  stateId: string;
  country: string;
  latitude: string;
  longitude: string;
  isActive: boolean;
}

const initialCityFormData = (): CityFormData => ({
  name: '',
  code: '',
  stateId: '',
  country: 'PK',
  latitude: '',
  longitude: '',
  isActive: true,
});

export default function CityFormDialog({
  open,
  onOpenChange,
  city,
  onSave,
  isLoading = false,
}: CityFormDialogProps) {
  const [formData, setFormData] = useState<CityFormData>(initialCityFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load states
  const { data: states = [] } = useQuery({
    queryKey: ['states'],
    queryFn: () => stateApi.list(),
  });

  useEffect(() => {
    if (city) {
      setFormData({
        name: city.name,
        code: city.code,
        stateId: city.stateId || '',
        country: city.country,
        latitude: city.latitude?.toString() || '',
        longitude: city.longitude?.toString() || '',
        isActive: city.isActive,
      });
    } else {
      resetForm();
    }
    setErrors({});
  }, [city, open]);

  const resetForm = () => {
    setFormData(initialCityFormData());
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) newErrors.name = 'City name is required';

    if (!formData.code?.trim()) {
      newErrors.code = 'Code is required';
    } else if (formData.code.length !== 3) {
      newErrors.code = 'Code must be 3 letters';
    }

    if (formData.latitude) {
      const lat = parseFloat(formData.latitude);
      if (isNaN(lat) || lat < -90 || lat > 90) {
        newErrors.latitude = 'Must be -90 to 90';
      }
    }

    if (formData.longitude) {
      const lng = parseFloat(formData.longitude);
      if (isNaN(lng) || lng < -180 || lng > 180) {
        newErrors.longitude = 'Must be -180 to 180';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await onSave({
        ...formData,
        code: formData.code.toUpperCase(),
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
      });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={city ? 'Edit City' : 'Create City'}
      description={city ? 'Update city information' : 'Add a new city location'}
      isLoading={isLoading}
      onSubmit={handleSubmit}
      submitText={city ? 'Update' : 'Create'}
    >
      <FormSection title="Basic Information" columns={2}>
        <FormField label="City Name" required error={errors.name}>
          <FormInput
            placeholder="e.g., City Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </FormField>

        <FormField label="Code (Tag)" required error={errors.code}>
          <FormInput
            placeholder="e.g., LHR"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
            maxLength={3}
          />
        </FormField>

        <FormField label="State/Province">
          <SearchableSelect
            value={formData.stateId}
            onChange={(val) => setFormData({ ...formData, stateId: val })}
            placeholder="Select State"
            options={states.map((state) => ({ value: state.id, label: state.name, sublabel: state.tag }))}
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
          <Label htmlFor="city-status" className="text-sm font-medium">Active</Label>
          <Switch
            id="city-status"
            checked={formData.isActive}
            onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
          />
        </div>
      </FormSection>
    </FormDialog>
  );
}
