import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import FormDialog from '@/components/admin/FormDialog';
import FormSection, { FormField } from '@/components/admin/FormSection';
import { FormInput, FormPreview } from '@/components/admin/FormInputs';
import SearchableSelect from '@/components/admin/SearchableSelect';
import { Branch, CreateBranchInput, UpdateBranchInput } from '@/lib/api/branch.api';
import { cityApi } from '@/lib/api/city.api';
import { areaApi } from '@/lib/api/area.api';
import { brandApi } from '@/lib/api/brand.api';

interface BranchFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branch?: Branch;
  onSave: (data: CreateBranchInput | UpdateBranchInput) => Promise<void>;
  isLoading?: boolean;
}

export default function BranchFormDialog({
  open,
  onOpenChange,
  branch,
  onSave,
  isLoading = false,
}: BranchFormDialogProps) {
  const [selectedCityId, setSelectedCityId] = useState('');
  const [branchSequence, setBranchSequence] = useState('');
  const [formData, setFormData] = useState<CreateBranchInput>({
    brandId: '',
    cityId: '',
    label: '',
    name: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load data
  const { data: brands = [] } = useQuery({
    queryKey: ['brands'],
    queryFn: () => brandApi.list(),
  });

  const { data: cities = [] } = useQuery({
    queryKey: ['cities'],
    queryFn: () => cityApi.list(),
  });

  const { data: areas = [] } = useQuery({
    queryKey: ['areas', selectedCityId],
    queryFn: () => (selectedCityId ? areaApi.list(selectedCityId) : Promise.resolve([])),
    enabled: !!selectedCityId,
  });

  // Initialize form
  useEffect(() => {
    if (branch) {
      setSelectedCityId(branch.cityId);
      const parts = branch.label.split('-');
      const sequence = parts.length > 2 ? parts[parts.length - 1] : '';
      setBranchSequence(sequence);
      setFormData({
        brandId: branch.brandId,
        cityId: branch.cityId,
        areaId: branch.areaId || undefined,
        label: branch.label,
        name: branch.name,
        phone: branch.phone,
        email: branch.email,
        managerId: branch.managerId,
        openTime: branch.openTime,
        closeTime: branch.closeTime,
        addrLine1: branch.addrLine1,
        addrLine2: branch.addrLine2,
        addrState: branch.addrState,
        addrCountry: branch.addrCountry,
        addrPostCode: branch.addrPostCode,
        addrLat: branch.addrLat,
        addrLng: branch.addrLng,
      });
    } else {
      resetForm();
      // Set default brand
      const crispCrumbsBrand = brands.find(
        (b) => b.name.toLowerCase().includes('crisp') && b.name.toLowerCase().includes('crumb')
      );
      if (crispCrumbsBrand) {
        setFormData((prev) => ({ ...prev, brandId: crispCrumbsBrand.id }));
      }
    }
    setErrors({});
  }, [branch, open, brands]);

  const resetForm = () => {
    setFormData({
      brandId: '',
      cityId: '',
      label: '',
      name: '',
    });
    setSelectedCityId('');
    setBranchSequence('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'cityId') {
      setSelectedCityId(value);
      setFormData({ ...formData, [name]: value, addrCity: cities.find((c) => c.id === value)?.name || '' });
      updateLabel(value, formData.areaId, branchSequence);
      return;
    }

    if (name === 'areaId') {
      const selectedArea = areas.find((a) => a.id === value);
      setFormData({ ...formData, [name]: value, addrArea: selectedArea?.name || '' });
      updateLabel(formData.cityId, value, branchSequence);
      return;
    }

    if (name === 'branchSequence') {
      setBranchSequence(value);
      updateLabel(formData.cityId, formData.areaId, value);
      return;
    }

    if (name === 'addrLat' || name === 'addrLng') {
      setFormData({ ...formData, [name]: value ? parseFloat(value) : undefined });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const updateLabel = (cityId: string, areaId: string | undefined, sequence: string) => {
    const selectedCity = cities.find((c) => c.id === cityId);
    const selectedArea = areaId ? areas.find((a) => a.id === areaId) : null;

    let newLabel = '';
    if (selectedCity) {
      newLabel = selectedCity.code;
      if (selectedArea) {
        newLabel += `-${selectedArea.tag}`;
      }
      if (sequence) {
        newLabel += `-${sequence}`;
      }
    }

    setFormData((prev) => ({ ...prev, label: newLabel }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.brandId) newErrors.brandId = 'Brand is required';
    if (!formData.cityId) newErrors.cityId = 'City is required';
    if (!formData.label) newErrors.label = 'Branch code is required';
    if (!formData.name) newErrors.name = 'Branch name is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await onSave(formData);
      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={branch ? 'Edit Branch' : 'Create Branch'}
      description={branch ? 'Update branch details' : 'Add a new branch'}
      isLoading={isLoading}
      onSubmit={handleSubmit}
      submitText={branch ? 'Update' : 'Create'}
    >
      {/* Branch Identifiers */}
      <FormSection title="Branch Identifiers" columns={2}>
        <FormField label="Brand" required error={errors.brandId}>
          <SearchableSelect
            value={formData.brandId}
            onChange={(val) => setFormData({ ...formData, brandId: val })}
            placeholder="Select Brand"
            options={brands.map((brand) => ({ value: brand.id, label: brand.name }))}
          />
        </FormField>

        <FormField label="City" required error={errors.cityId}>
          <SearchableSelect
            value={formData.cityId}
            onChange={(val) => {
              setSelectedCityId(val);
              const city = cities.find((c) => c.id === val);
              setFormData({ ...formData, cityId: val, addrCity: city?.name || '' });
              updateLabel(val, formData.areaId, branchSequence);
            }}
            placeholder="Select City"
            options={cities.map((city) => ({ value: city.id, label: city.name, sublabel: city.code }))}
          />
        </FormField>

        <FormField label="Area (Optional)">
          <SearchableSelect
            value={formData.areaId || ''}
            onChange={(val) => {
              const area = areas.find((a) => a.id === val);
              setFormData({ ...formData, areaId: val, addrArea: area?.name || '' });
              updateLabel(formData.cityId, val, branchSequence);
            }}
            placeholder="No Area"
            disabled={!selectedCityId || areas.length === 0}
            options={[
              { value: '', label: 'No Area' },
              ...areas.map((area) => ({ value: area.id, label: area.name, sublabel: area.tag })),
            ]}
          />
        </FormField>

        {/* Branch Code */}
        <div className="space-y-1">
          <label className="text-xs font-semibold">Branch Code</label>
          <div className="flex gap-2 items-center h-8">
            <div className="flex items-center px-3 py-1 bg-gray-100 rounded-lg border border-gray-300 text-xs font-mono text-gray-700 min-w-fit dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100">
              {formData.cityId
                ? `${cities.find((c) => c.id === formData.cityId)?.code || ''}-${
                    formData.areaId ? `${areas.find((a) => a.id === formData.areaId)?.tag || ''}-` : ''
                  }`
                : 'City-Area-'}
            </div>
            <FormInput
              name="branchSequence"
              value={branchSequence}
              onChange={handleChange}
              placeholder="0001"
              maxLength={10}
              className="flex-1"
            />
          </div>
          {formData.label && (
            <div className="mt-2 text-xs font-mono font-semibold text-white dark:text-slate-100">
              Final: <span className="text-blue-400 dark:text-blue-300">{formData.label}</span>
            </div>
          )}
        </div>
      </FormSection>

      {/* Basic Info */}
      <FormSection title="Basic Information" columns={1}>
        <FormField label="Branch Name" required error={errors.name}>
          <FormInput
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., Downtown Branch, City"
          />
        </FormField>
      </FormSection>

      {/* Contact */}
      <FormSection title="Contact Information" columns={3}>
        <FormField label="Phone">
          <FormInput
            name="phone"
            value={formData.phone || ''}
            onChange={handleChange}
            placeholder="+92300123456"
          />
        </FormField>
        <FormField label="Email">
          <FormInput
            name="email"
            type="email"
            value={formData.email || ''}
            onChange={handleChange}
            placeholder="branch@example.com"
          />
        </FormField>
        <FormField label="Manager ID">
          <FormInput
            name="managerId"
            value={formData.managerId || ''}
            onChange={handleChange}
            placeholder="Manager username"
          />
        </FormField>
      </FormSection>

      {/* Hours */}
      <FormSection title="Operating Hours" columns={2}>
        <FormField label="Open Time">
          <FormInput
            name="openTime"
            type="time"
            value={formData.openTime || '09:00'}
            onChange={handleChange}
          />
        </FormField>
        <FormField label="Close Time">
          <FormInput
            name="closeTime"
            type="time"
            value={formData.closeTime || '23:00'}
            onChange={handleChange}
          />
        </FormField>
      </FormSection>

      {/* Address */}
      <FormSection title="Address" columns={2}>
        <FormField label="Address Line 1">
          <FormInput
            name="addrLine1"
            value={formData.addrLine1 || ''}
            onChange={handleChange}
            placeholder="Street address"
          />
        </FormField>
        <FormField label="Address Line 2">
          <FormInput
            name="addrLine2"
            value={formData.addrLine2 || ''}
            onChange={handleChange}
            placeholder="Apt, suite (optional)"
          />
        </FormField>
        <FormField label="State">
          <FormInput
            name="addrState"
            value={formData.addrState || ''}
            onChange={handleChange}
            placeholder="e.g., Punjab"
          />
        </FormField>
        <FormField label="Postal Code">
          <FormInput
            name="addrPostCode"
            value={formData.addrPostCode || ''}
            onChange={handleChange}
            placeholder="e.g., 75500"
          />
        </FormField>
        <FormField label="Country">
          <FormInput
            name="addrCountry"
            value={formData.addrCountry || 'PK'}
            onChange={handleChange}
            placeholder="Country code"
          />
        </FormField>
      </FormSection>

      {/* Coordinates */}
      <FormSection title="Coordinates (Optional)" columns={2}>
        <FormField label="Latitude">
          <FormInput
            name="addrLat"
            type="number"
            step="0.0001"
            min="-90"
            max="90"
            value={formData.addrLat || ''}
            onChange={handleChange}
            placeholder="e.g., 31.5205"
          />
        </FormField>
        <FormField label="Longitude">
          <FormInput
            name="addrLng"
            type="number"
            step="0.0001"
            min="-180"
            max="180"
            value={formData.addrLng || ''}
            onChange={handleChange}
            placeholder="e.g., 74.3457"
          />
        </FormField>
      </FormSection>
    </FormDialog>
  );
}
