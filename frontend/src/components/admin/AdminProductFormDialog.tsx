import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import FormDialog from '@/components/admin/FormDialog';
import FormSection, { FormField } from '@/components/admin/FormSection';
import { FormInput, FormTextarea } from '@/components/admin/FormInputs';
import ImageUpload from '@/components/admin/ImageUpload';
import SearchableSelect from '@/components/admin/SearchableSelect';
import { adminProductApi, Product, CreateProductInput, UpdateProductInput } from '@/lib/api/admin-product.api';
import { adminCategoryApi, Category } from '@/lib/api/admin-category.api';
import { getCurrencyConfig } from '@/config/currency';

interface AdminProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
  onSave: (data: CreateProductInput | UpdateProductInput) => Promise<void>;
  isLoading?: boolean;
}

export default function AdminProductFormDialog({
  open,
  onOpenChange,
  product,
  onSave,
  isLoading = false,
}: AdminProductFormDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    sku: '',
    basePricePaisa: '',
    salePricePaisa: '',
    description: '',
    imageUrl: '',
    sortOrder: '',
  });
  const [skuPreview, setSkuPreview] = useState('');
  const [skuLoading, setSkuLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => adminCategoryApi.list(),
    enabled: open,
  });

  // Populate form when editing
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        categoryId: product.categoryId || '',
        sku: product.sku,
        basePricePaisa: (product.basePricePaisa / 100).toString(),
        salePricePaisa: product.salePricePaisa ? (product.salePricePaisa / 100).toString() : '',
        description: product.description || '',
        imageUrl: product.imageUrl || '',
        sortOrder: product.sortOrder?.toString() || '',
      });
      setSkuPreview(product.sku);
    } else {
      resetForm();
    }
    setErrors({});
  }, [product, open]);

  // Live SKU preview when category changes (only for new products)
  useEffect(() => {
    if (product || !formData.categoryId) {
      if (!formData.categoryId) setSkuPreview('');
      return;
    }

    let cancelled = false;
    setSkuLoading(true);
    setSkuPreview('...');

    adminProductApi.getNextSku(formData.categoryId)
      .then((sku) => {
        if (!cancelled) setSkuPreview(sku);
      })
      .catch(() => {
        if (!cancelled) {
          const cat = categories.find((c: Category) => c.id === formData.categoryId);
          setSkuPreview(cat ? `${cat.tag}-????` : '');
        }
      })
      .finally(() => {
        if (!cancelled) setSkuLoading(false);
      });

    return () => { cancelled = true; };
  }, [formData.categoryId, product, categories]);

  const resetForm = () => {
    setFormData({
      name: '',
      categoryId: '',
      sku: '',
      basePricePaisa: '',
      salePricePaisa: '',
      description: '',
      imageUrl: '',
      sortOrder: '',
    });
    setSkuPreview('');
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) newErrors.name = 'Product name is required';
    if (!formData.categoryId?.trim()) newErrors.categoryId = 'Category is required';
    if (!formData.basePricePaisa?.trim()) {
      newErrors.basePricePaisa = 'Base price is required';
    } else if (isNaN(parseFloat(formData.basePricePaisa))) {
      newErrors.basePricePaisa = 'Base price must be a number';
    }
    if (formData.salePricePaisa && isNaN(parseFloat(formData.salePricePaisa))) {
      newErrors.salePricePaisa = 'Sale price must be a number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (product) {
        const data: UpdateProductInput = {
          name: formData.name.trim(),
          basePricePaisa: Math.round(parseFloat(formData.basePricePaisa) * 100),
          salePricePaisa: formData.salePricePaisa ? Math.round(parseFloat(formData.salePricePaisa) * 100) : null,
          description: formData.description?.trim() || null,
          imageUrl: formData.imageUrl?.trim() || null,
          sortOrder: formData.sortOrder ? parseInt(formData.sortOrder) : undefined,
        };
        await onSave(data);
      } else {
        const data: CreateProductInput = {
          name: formData.name.trim(),
          categoryId: formData.categoryId,
          basePricePaisa: Math.round(parseFloat(formData.basePricePaisa) * 100),
          salePricePaisa: formData.salePricePaisa ? Math.round(parseFloat(formData.salePricePaisa) * 100) : null,
          description: formData.description?.trim() || null,
          imageUrl: formData.imageUrl?.trim() || null,
          sortOrder: formData.sortOrder ? parseInt(formData.sortOrder) : undefined,
        };
        await onSave(data);
      }
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  // Build category options for searchable select
  const categoryOptions = categories.map((cat: Category) => ({
    value: cat.id,
    label: cat.name,
    sublabel: cat.tag,
  }));

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={product ? 'Edit Product' : 'Add Product'}
      description={product ? 'Update product information' : 'Create a new product'}
      isLoading={isLoading}
      onSubmit={handleSubmit}
      submitText={product ? 'Update' : 'Create'}
      isCreating={!product}
    >
      <FormSection title="Product Details" columns={2}>
        {/* Category — searchable */}
        <FormField label="Category" required error={errors.categoryId}>
          <SearchableSelect
            options={categoryOptions}
            value={formData.categoryId}
            onChange={(val) => setFormData({ ...formData, categoryId: val })}
            placeholder="Select category..."
            searchPlaceholder="Search categories..."
            disabled={!!product}
          />
        </FormField>

        {/* SKU — live preview */}
        <FormField label="SKU (Auto-generated)">
          <FormInput
            value={skuLoading ? 'Generating...' : (skuPreview || '—')}
            disabled
            className="bg-slate-100 dark:bg-slate-800 font-mono text-slate-600 dark:text-slate-400"
          />
        </FormField>

        <FormField label="Product Name" required error={errors.name}>
          <FormInput
            placeholder="e.g., Classic Cheeseburger"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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

      <FormSection title="Pricing" columns={2}>
        <FormField label={`Base Price (${getCurrencyConfig().currencySymbol})`} required error={errors.basePricePaisa}>
          <FormInput
            type="number"
            placeholder="e.g., 650"
            step="0.01"
            value={formData.basePricePaisa}
            onChange={(e) => setFormData({ ...formData, basePricePaisa: e.target.value })}
          />
        </FormField>

        <FormField label={`Sale Price (${getCurrencyConfig().currencySymbol})`} error={errors.salePricePaisa}>
          <FormInput
            type="number"
            placeholder="e.g., 600"
            step="0.01"
            value={formData.salePricePaisa}
            onChange={(e) => setFormData({ ...formData, salePricePaisa: e.target.value })}
          />
        </FormField>
      </FormSection>

      <FormSection title="Additional Info" columns={1}>
        <FormField label="Description">
          <FormTextarea
            placeholder="Product description (optional)"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
          />
        </FormField>

        <ImageUpload
          label="Product Image"
          value={formData.imageUrl}
          onChange={(url) => setFormData({ ...formData, imageUrl: url })}
          module="products"
        />
      </FormSection>
    </FormDialog>
  );
}
