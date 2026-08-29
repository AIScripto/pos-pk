import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import FormDialog from '@/components/admin/FormDialog';
import FormSection, { FormField } from '@/components/admin/FormSection';
import { FormInput, FormSelect, FormTextarea } from '@/components/admin/FormInputs';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { X, Search, Clock, Calendar } from 'lucide-react';
import { Deal, CreateDealInput, UpdateDealInput } from '@/lib/api/admin-deal.api';
import { adminProductApi } from '@/lib/api/admin-product.api';
import { adminCategoryApi } from '@/lib/api/admin-category.api';
import { getCurrencyConfig } from '@/config/currency';

interface AdminDealFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deal?: Deal | null;
  onSave: (data: CreateDealInput | UpdateDealInput) => Promise<unknown>;
  isLoading?: boolean;
}

const ALL_DAYS = [
  { key: 'MON', label: 'Mon' },
  { key: 'TUE', label: 'Tue' },
  { key: 'WED', label: 'Wed' },
  { key: 'THU', label: 'Thu' },
  { key: 'FRI', label: 'Fri' },
  { key: 'SAT', label: 'Sat' },
  { key: 'SUN', label: 'Sun' },
];

export default function AdminDealFormDialog({
  open,
  onOpenChange,
  deal,
  onSave,
  isLoading = false,
}: AdminDealFormDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    tag: '',
    categoryId: '',
    description: '',
    basePricePaisa: '',
    salePricePaisa: '',
    discountPercentage: '',
    availabilityType: 'all_time' as 'all_time' | 'scheduled',
    startTime: '09:00',
    endTime: '23:00',
    isActive: true,
  });
  const [selectedDays, setSelectedDays] = useState<string[]>(['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']);
  const [selectedProducts, setSelectedProducts] = useState<Record<string, number>>({});
  const [productSearch, setProductSearch] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDescriptionDirty, setIsDescriptionDirty] = useState(false);

  // Load all products
  const { data: products = [] } = useQuery({
    queryKey: ['adminProducts'],
    queryFn: () => adminProductApi.list(),
    enabled: open,
  });

  // Load all categories
  const { data: categories = [] } = useQuery({
    queryKey: ['adminCategories'],
    queryFn: () => adminCategoryApi.list(),
    enabled: open,
  });

  // Dynamic description generation
  useEffect(() => {
    if (isDescriptionDirty) return;

    const generatedDesc = Object.entries(selectedProducts)
      .map(([id, qty]) => {
        const prod = products.find(p => p.id === id);
        return prod ? `${qty} x ${prod.name}` : '';
      })
      .filter(Boolean)
      .join(' + ');

    setFormData(prev => ({
      ...prev,
      description: generatedDesc,
    }));
  }, [selectedProducts, products, isDescriptionDirty]);

  useEffect(() => {
    if (deal) {
      setFormData({
        name: deal.name,
        tag: deal.tag,
        categoryId: deal.categoryId || '',
        description: deal.description || '',
        basePricePaisa: (deal.basePricePaisa / 100).toString(),
        salePricePaisa: deal.salePricePaisa ? (deal.salePricePaisa / 100).toString() : '',
        discountPercentage: deal.discountPercentage?.toString() || '',
        availabilityType: deal.availabilityType === 'scheduled' ? 'scheduled' : 'all_time',
        startTime: deal.startTime || '09:00',
        endTime: deal.endTime || '23:00',
        isActive: deal.isActive,
      });

      if (deal.availableDays) {
        setSelectedDays(deal.availableDays.split(',').map(d => d.trim()).filter(Boolean));
      } else {
        setSelectedDays(['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']);
      }

      const initialMap: Record<string, number> = {};
      (deal.productIds || []).forEach(id => {
        initialMap[id] = (initialMap[id] || 0) + 1;
      });
      setSelectedProducts(initialMap);
      setIsDescriptionDirty(!!deal.description);
    } else {
      resetForm();
    }
    setErrors({});
    setProductSearch('');
  }, [deal, open]);

  const resetForm = () => {
    setFormData({
      name: '',
      tag: '',
      categoryId: '',
      description: '',
      basePricePaisa: '',
      salePricePaisa: '',
      discountPercentage: '',
      availabilityType: 'all_time',
      startTime: '09:00',
      endTime: '23:00',
      isActive: true,
    });
    setSelectedDays(['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']);
    setSelectedProducts({});
    setIsDescriptionDirty(false);
  };

  const toggleDay = (dayKey: string) => {
    setSelectedDays(prev =>
      prev.includes(dayKey) ? prev.filter(d => d !== dayKey) : [...prev, dayKey]
    );
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Deal name is required';
    }

    if (!formData.tag?.trim()) {
      newErrors.tag = 'Deal tag is required';
    } else if (!/^[a-z0-9-]+$/i.test(formData.tag)) {
      newErrors.tag = 'Tag must contain only letters, numbers, and hyphens';
    }

    if (!formData.basePricePaisa?.trim()) {
      newErrors.basePricePaisa = 'Base price is required';
    } else if (isNaN(parseFloat(formData.basePricePaisa))) {
      newErrors.basePricePaisa = 'Base price must be a number';
    }

    if (formData.salePricePaisa && isNaN(parseFloat(formData.salePricePaisa))) {
      newErrors.salePricePaisa = 'Sale price must be a number';
    }

    if (formData.discountPercentage) {
      const discountNum = parseFloat(formData.discountPercentage);
      if (isNaN(discountNum) || discountNum < 0 || discountNum > 100) {
        newErrors.discountPercentage = 'Discount must be between 0 and 100';
      }
    }

    if (formData.availabilityType === 'scheduled' && selectedDays.length === 0) {
      newErrors.availableDays = 'Select at least one day for scheduled deal';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const incrementProduct = (id: string) => {
    setSelectedProducts(prev => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
  };

  const decrementProduct = (id: string) => {
    setSelectedProducts(prev => {
      const next = { ...prev };
      if (!next[id]) return prev;
      if (next[id] <= 1) {
        delete next[id];
      } else {
        next[id] -= 1;
      }
      return next;
    });
  };

  const removeProduct = (id: string) => {
    setSelectedProducts(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const flatProductIds: string[] = [];
      Object.entries(selectedProducts).forEach(([id, qty]) => {
        for (let i = 0; i < qty; i++) {
          flatProductIds.push(id);
        }
      });

      const data = {
        name: formData.name.trim(),
        tag: formData.tag.trim().toLowerCase(),
        categoryId: formData.categoryId || null,
        description: formData.description?.trim() || null,
        productIds: flatProductIds,
        basePricePaisa: Math.round(parseFloat(formData.basePricePaisa) * 100),
        salePricePaisa: formData.salePricePaisa ? Math.round(parseFloat(formData.salePricePaisa) * 100) : null,
        discountPercentage: formData.discountPercentage ? parseFloat(formData.discountPercentage) : null,
        availabilityType: formData.availabilityType,
        availableDays: formData.availabilityType === 'scheduled' ? selectedDays.join(',') : null,
        startTime: formData.availabilityType === 'scheduled' ? formData.startTime : null,
        endTime: formData.availabilityType === 'scheduled' ? formData.endTime : null,
        ...(deal ? { isActive: formData.isActive } : {}),
      };

      await onSave(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const filteredProducts = products.filter(p =>
    p.isActive && (
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.sku.toLowerCase().includes(productSearch.toLowerCase())
    )
  );

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={deal ? 'Edit Deal' : 'Create Deal'}
      description={deal ? 'Update deal information' : 'Create a new promotional deal'}
      isLoading={isLoading}
      onSubmit={handleSubmit}
      submitText={deal ? 'Update' : 'Create'}
    >
      <FormSection title="Deal Categorization & Info" columns={2}>
        <FormField label="Deal Name" required error={errors.name}>
          <FormInput
            placeholder="e.g., Combo Burger Special"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </FormField>

        <FormField label="Deal Tag" required error={errors.tag}>
          <FormInput
            placeholder="e.g., combo-burger-special"
            value={formData.tag}
            onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
            disabled={!!deal}
          />
        </FormField>

        <FormField label="Category (Tier 1)">
          <FormSelect
            value={formData.categoryId}
            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
          >
            <option value="">-- No Category (General Deal) --</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name} ({cat.tag})
              </option>
            ))}
          </FormSelect>
        </FormField>
      </FormSection>

      <FormSection title="Pricing" columns={3}>
        <FormField label={`Base Price (${getCurrencyConfig().currencySymbol})`} required error={errors.basePricePaisa}>
          <FormInput
            type="number"
            placeholder="e.g., 1200"
            step="0.01"
            value={formData.basePricePaisa}
            onChange={(e) => setFormData({ ...formData, basePricePaisa: e.target.value })}
          />
        </FormField>

        <FormField label={`Sale Price (${getCurrencyConfig().currencySymbol})`} error={errors.salePricePaisa}>
          <FormInput
            type="number"
            placeholder="e.g., 1000"
            step="0.01"
            value={formData.salePricePaisa}
            onChange={(e) => setFormData({ ...formData, salePricePaisa: e.target.value })}
          />
        </FormField>

        <FormField label="Discount (%)" error={errors.discountPercentage}>
          <FormInput
            type="number"
            placeholder="e.g., 15"
            min="0"
            max="100"
            step="0.01"
            value={formData.discountPercentage}
            onChange={(e) => setFormData({ ...formData, discountPercentage: e.target.value })}
          />
        </FormField>
      </FormSection>

      <FormSection title="Deal Schedule & Timing (Tier 2)" columns={1}>
        <div className="space-y-3">
          <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 p-2.5">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, availabilityType: 'all_time' })}
              className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-3 rounded-md text-xs font-semibold transition-all ${
                formData.availabilityType === 'all_time'
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-white dark:bg-muted text-foreground border border-border hover:bg-secondary'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              All Time (24/7 Always Active)
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, availabilityType: 'scheduled' })}
              className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-3 rounded-md text-xs font-semibold transition-all ${
                formData.availabilityType === 'scheduled'
                  ? 'bg-warning text-white shadow-xs'
                  : 'bg-white dark:bg-muted text-foreground border border-border hover:bg-secondary'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              Specific Hours / Days
            </button>
          </div>

          {formData.availabilityType === 'scheduled' && (
            <div className="p-3 rounded-lg border border-warning-border bg-warning/50 space-y-3 dark:bg-warning/20">
              <FormField label="Available Days" error={errors.availableDays}>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {ALL_DAYS.map((day) => {
                    const isSelected = selectedDays.includes(day.key);
                    return (
                      <button
                        key={day.key}
                        type="button"
                        onClick={() => toggleDay(day.key)}
                        className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                          isSelected
                            ? 'bg-warning text-white shadow-xs'
                            : 'bg-secondary text-muted-foreground hover:bg-secondary'
                        }`}
                      >
                        {day.label}
                      </button>
                    );
                  })}
                </div>
              </FormField>

              <div className="grid grid-cols-2 gap-3">
                <FormField label="Start Time (HH:mm)">
                  <FormInput
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  />
                </FormField>
                <FormField label="End Time (HH:mm)">
                  <FormInput
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  />
                </FormField>
              </div>
            </div>
          )}
        </div>
      </FormSection>

      <FormSection title="Included Products" columns={1}>
        <div className="space-y-3">
          <div className="flex flex-col gap-1.5 rounded-lg border border-border bg-muted/50 p-2.5 min-h-[3rem]">
            {Object.keys(selectedProducts).length === 0 && (
              <span className="text-xs text-muted-foreground self-center py-2">No products selected</span>
            )}
            {Object.entries(selectedProducts).map(([id, qty]) => {
              const prod = products.find(p => p.id === id);
              if (!prod) return null;
              return (
                <div key={id} className="flex items-center justify-between gap-2 p-1.5 rounded-md bg-card border border-border shadow-sm">
                  <span className="text-xs font-semibold text-foreground">{prod.name}</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => decrementProduct(id)}
                      className="h-6 w-6 rounded-md bg-secondary flex items-center justify-center font-bold text-xs text-foreground hover:bg-secondary active:scale-95"
                    >
                      -
                    </button>
                    <span className="text-xs font-bold text-foreground min-w-[12px] text-center">{qty}</span>
                    <button
                      type="button"
                      onClick={() => incrementProduct(id)}
                      className="h-6 w-6 rounded-md bg-secondary flex items-center justify-center font-bold text-xs text-foreground hover:bg-secondary active:scale-95"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => removeProduct(id)}
                      className="ml-2 rounded p-1 hover:bg-danger-subtle text-danger"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground/70" />
            <FormInput
              placeholder="Search products by name or code to add..."
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              className="pl-9 text-xs sm:text-sm"
            />
          </div>

          <div className="max-h-40 overflow-y-auto rounded-lg border border-border divide-y divide-border">
            {filteredProducts.map(prod => {
              const qty = selectedProducts[prod.id] || 0;
              return (
                <button
                  key={prod.id}
                  type="button"
                  onClick={() => incrementProduct(prod.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs sm:text-sm text-left transition-colors hover:bg-muted dark:hover:bg-muted ${
                    qty > 0
                      ? 'bg-primary/50 text-primary dark:bg-primary/20 font-semibold'
                      : 'text-foreground'
                  }`}
                >
                  <span>
                    {prod.name}{' '}
                    <span className="text-2xs text-muted-foreground/70 font-mono">({prod.sku})</span>
                    {qty > 0 && (
                      <Badge variant="secondary" className="ml-2 bg-info-subtle text-primary py-0 text-2xs">
                        {qty} selected
                      </Badge>
                    )}
                  </span>
                  <span className="text-muted-foreground tabular-nums">{getCurrencyConfig().currencySymbol} {(prod.basePricePaisa / 100).toFixed(2)}</span>
                </button>
              );
            })}
            {filteredProducts.length === 0 && (
              <div className="p-3 text-center text-xs text-muted-foreground/70">
                No matching products found
              </div>
            )}
          </div>
        </div>
      </FormSection>

      <FormSection title="Additional Info" columns={1}>
        <FormField label="Description">
          <FormTextarea
            placeholder="Describe the deal promotion (optional)"
            value={formData.description}
            onChange={(e) => {
              setFormData({ ...formData, description: e.target.value });
              setIsDescriptionDirty(true);
            }}
            rows={3}
          />
        </FormField>

        {deal && (
          <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 px-3 py-2">
            <div>
              <p className="text-xs font-semibold text-foreground">Active</p>
              <p className="text-xs text-muted-foreground">Show this deal as available.</p>
            </div>
            <Switch
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
            />
          </div>
        )}
      </FormSection>
    </FormDialog>
  );
}
