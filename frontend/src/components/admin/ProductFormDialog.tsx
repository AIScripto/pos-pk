import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Product, Category } from '@/types/pos';
import { categoryLabels } from '@/data/products';
import { Tag } from 'lucide-react';

const CATEGORIES: string[] = ['burgers', 'wraps', 'chicken', 'fries', 'drinks'];

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'SKU is required'),
  category: z.string().min(1, 'Category is required'),
  wasPrice: z.coerce.number().positive('Price must be greater than 0'),
  image: z.string().optional().default(''),
  description: z.string().optional().default(''),
});

type FormValues = z.infer<typeof schema>;
type DiscountMode = 'none' | '%' | '$';

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product;
  onSave: (values: Omit<Product, 'id'>) => void;
  existingCodes: string[];
}

export function ProductFormDialog({
  open,
  onOpenChange,
  product,
  onSave,
  existingCodes,
}: ProductFormDialogProps) {
  const isEdit = !!product;

  // Discount state lives outside react-hook-form (reactive preview)
  const [discountMode, setDiscountMode] = useState<DiscountMode>('none');
  const [discountValue, setDiscountValue] = useState<string>('');

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      code: '',
      category: 'burgers',
      wasPrice: undefined,
      image: '',
      description: '',
    },
  });

  const selectedCategory = watch('category');
  const wasPrice = watch('wasPrice') ?? 0;

  // ── Compute "Now" price live ───────────────────────────────────────────────
  const discountNum = parseFloat(discountValue) || 0;

  const nowPrice = (() => {
    if (discountMode === '%') {
      const pct = Math.min(100, Math.max(0, discountNum));
      return Math.max(0, wasPrice * (1 - pct / 100));
    }
    if (discountMode === '$') {
      return Math.max(0, wasPrice - discountNum);
    }
    return wasPrice; // no discount
  })();

  const hasDiscount = discountMode !== 'none' && discountNum > 0 && nowPrice < wasPrice;

  const discountLabel = (() => {
    if (!hasDiscount) return null;
    if (discountMode === '%') return `${discountNum}% off`;
    return `$${discountNum.toFixed(2)} off`;
  })();

  // ── Populate form when editing ────────────────────────────────────────────
  useEffect(() => {
    if (open && product) {
      const wasVal = product.originalPrice ?? product.price;
      reset({
        name: product.name,
        code: product.code,
        category: product.category,
        wasPrice: wasVal,
        image: product.image ?? '',
        description: product.description ?? '',
      });
      // Restore discount state from stored product
      if (product.originalPrice && product.originalPrice > product.price) {
        const savedDiscount = product.originalPrice - product.price;
        setDiscountMode('$');
        setDiscountValue(savedDiscount.toFixed(2));
      } else {
        setDiscountMode('none');
        setDiscountValue('');
      }
    } else if (open && !product) {
      reset({ name: '', code: '', category: 'burgers', wasPrice: undefined, image: '', description: '' });
      setDiscountMode('none');
      setDiscountValue('');
    }
  }, [open, product, reset]);

  function onSubmit(values: FormValues) {
    const isDuplicate = existingCodes
      .filter(c => !isEdit || c !== product?.code)
      .includes(values.code);
    if (isDuplicate) return;

    onSave({
      name: values.name,
      code: values.code,
      category: values.category,
      price: hasDiscount ? parseFloat(nowPrice.toFixed(2)) : values.wasPrice,
      originalPrice: hasDiscount ? values.wasPrice : undefined,
      image: values.image || '',
      description: values.description || '',
    });
    onOpenChange(false);
  }

  const duplicateSKU =
    !!watch('code') &&
    existingCodes
      .filter(c => !isEdit || c !== product?.code)
      .includes(watch('code'));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Product' : 'Add New Product'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="pf-name">Name *</Label>
            <Input id="pf-name" placeholder="Classic Cheeseburger" {...register('name')} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          {/* SKU + Category */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="pf-code">SKU *</Label>
              <Input id="pf-code" placeholder="BRG-001" {...register('code')} />
              {errors.code && <p className="text-xs text-destructive">{errors.code.message}</p>}
              {duplicateSKU && <p className="text-xs text-destructive">SKU already exists</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Category *</Label>
              <Select
                value={selectedCategory}
                onValueChange={(v) => setValue('category', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {categoryLabels[cat as keyof typeof categoryLabels] || cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* ── Pricing ────────────────────────────────────────────── */}
          <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Tag className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Pricing</span>
            </div>

            {/* Was Price */}
            <div className="space-y-1.5">
              <Label htmlFor="pf-was">
                {hasDiscount ? 'Was Price ($) *' : 'Price ($) *'}
              </Label>
              <Input
                id="pf-was"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="7.99"
                {...register('wasPrice')}
              />
              {errors.wasPrice && <p className="text-xs text-destructive">{errors.wasPrice.message}</p>}
            </div>

            {/* Discount row */}
            <div className="space-y-1.5">
              <Label>Discount (optional)</Label>
              <div className="flex gap-2">
                {/* Mode selector */}
                <div className="flex rounded-lg border border-border overflow-hidden shrink-0">
                  {(['none', '%', '$'] as DiscountMode[]).map(mode => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => { setDiscountMode(mode); if (mode === 'none') setDiscountValue(''); }}
                      className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
                        discountMode === mode
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-background text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      {mode === 'none' ? 'None' : mode}
                    </button>
                  ))}
                </div>

                {/* Discount value */}
                <Input
                  type="number"
                  min="0"
                  step={discountMode === '%' ? '1' : '0.01'}
                  placeholder={discountMode === '%' ? 'e.g. 15' : 'e.g. 1.50'}
                  value={discountValue}
                  onChange={e => setDiscountValue(e.target.value)}
                  disabled={discountMode === 'none'}
                  className="flex-1"
                />
              </div>
            </div>

            {/* Live Was → Now preview */}
            {wasPrice > 0 && (
              <div className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${
                hasDiscount
                  ? 'bg-success/10 border border-success/20'
                  : 'bg-secondary'
              }`}>
                {hasDiscount ? (
                  <>
                    <div className="flex flex-col">
                      <span className="text-2xs uppercase tracking-wide text-muted-foreground">Was</span>
                      <span className="line-through text-muted-foreground font-mono">
                        ${wasPrice.toFixed(2)}
                      </span>
                    </div>
                    <span className="text-muted-foreground">→</span>
                    <div className="flex flex-col">
                      <span className="text-2xs uppercase tracking-wide text-muted-foreground">Now</span>
                      <span className="font-bold text-success-text font-mono">
                        ${nowPrice.toFixed(2)}
                      </span>
                    </div>
                    <span className="ml-auto text-xs font-semibold text-success-text bg-success/15 px-2 py-0.5 rounded-full">
                      {discountLabel}
                    </span>
                  </>
                ) : (
                  <div className="flex items-center justify-between w-full">
                    <span className="text-muted-foreground text-xs">Selling price</span>
                    <span className="font-bold font-mono">${wasPrice.toFixed(2)}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Image URL */}
          <div className="space-y-1.5">
            <Label htmlFor="pf-image">Image URL</Label>
            <Input id="pf-image" placeholder="https://..." {...register('image')} />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="pf-desc">Description</Label>
            <Textarea
              id="pf-desc"
              placeholder="Short product description..."
              rows={2}
              {...register('description')}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={duplicateSKU}>
              {isEdit ? 'Save Changes' : 'Add Product'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
