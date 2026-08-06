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
import { Badge } from '@/components/ui/badge';
import { Deal, Product } from '@/types/pos';
import { X } from 'lucide-react';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'SKU is required'),
  price: z.coerce.number().positive('Price must be greater than 0'),
  originalPrice: z.coerce.number().positive('Original price must be greater than 0'),
  image: z.string().optional().default(''),
  description: z.string().optional().default(''),
});

type FormValues = z.infer<typeof schema>;

interface DealFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deal?: Deal;
  availableProducts: Product[];
  onSave: (values: Omit<Deal, 'id'>) => void;
  existingCodes: string[];
}

export function DealFormDialog({
  open,
  onOpenChange,
  deal,
  availableProducts,
  onSave,
  existingCodes,
}: DealFormDialogProps) {
  const isEdit = !!deal;
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      code: '',
      price: undefined,
      originalPrice: undefined,
      image: '',
      description: '',
    },
  });

  useEffect(() => {
    if (open && deal) {
      reset({
        name: deal.name,
        code: deal.code,
        price: deal.price,
        originalPrice: deal.originalPrice,
        image: deal.image ?? '',
        description: deal.description ?? '',
      });
      setSelectedProductIds(deal.products.map(p => p.id));
    } else if (open && !deal) {
      reset({ name: '', code: '', price: undefined, originalPrice: undefined, image: '', description: '' });
      setSelectedProductIds([]);
    }
  }, [open, deal, reset]);

  function toggleProduct(id: string) {
    setSelectedProductIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  }

  function onSubmit(values: FormValues) {
    const isDuplicate = existingCodes
      .filter(c => !isEdit || c !== deal?.code)
      .includes(values.code);
    if (isDuplicate) return;

    const products = selectedProductIds
      .map(id => availableProducts.find(p => p.id === id))
      .filter(Boolean) as Product[];

    onSave({
      name: values.name,
      code: values.code,
      price: values.price,
      originalPrice: values.originalPrice,
      image: values.image || '',
      description: values.description || '',
      products,
    });
    onOpenChange(false);
  }

  const duplicateSKU =
    !!watch('code') &&
    existingCodes
      .filter(c => !isEdit || c !== deal?.code)
      .includes(watch('code'));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Deal' : 'Add New Deal'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="df-name">Name *</Label>
            <Input id="df-name" placeholder="Classic Combo" {...register('name')} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="df-code">SKU *</Label>
            <Input id="df-code" placeholder="DEAL-001" {...register('code')} />
            {errors.code && <p className="text-xs text-destructive">{errors.code.message}</p>}
            {duplicateSKU && <p className="text-xs text-destructive">SKU already exists</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="df-price">Deal Price ($) *</Label>
              <Input
                id="df-price"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="9.99"
                {...register('price')}
              />
              {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="df-orig">Original Price ($) *</Label>
              <Input
                id="df-orig"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="12.97"
                {...register('originalPrice')}
              />
              {errors.originalPrice && (
                <p className="text-xs text-destructive">{errors.originalPrice.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="df-image">Image URL</Label>
            <Input id="df-image" placeholder="https://..." {...register('image')} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="df-desc">Description</Label>
            <Textarea
              id="df-desc"
              placeholder="Brief deal description..."
              rows={2}
              {...register('description')}
            />
          </div>

          <div className="space-y-2">
            <Label>Included Products</Label>
            <div className="flex flex-wrap gap-1.5 rounded-lg border border-input bg-secondary/50 p-2 min-h-[2.5rem]">
              {selectedProductIds.length === 0 && (
                <span className="text-xs text-muted-foreground self-center">No products selected</span>
              )}
              {selectedProductIds.map(id => {
                const prod = availableProducts.find(p => p.id === id);
                if (!prod) return null;
                return (
                  <Badge key={id} variant="secondary" className="gap-1 pr-1">
                    {prod.name}
                    <button
                      type="button"
                      onClick={() => toggleProduct(id)}
                      className="ml-0.5 rounded-full hover:bg-muted-foreground/20 p-0.5"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </Badge>
                );
              })}
            </div>
            <div className="max-h-40 overflow-y-auto rounded-lg border border-input divide-y divide-border">
              {availableProducts.map(prod => (
                <button
                  key={prod.id}
                  type="button"
                  onClick={() => toggleProduct(prod.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm text-left transition-colors hover:bg-secondary ${
                    selectedProductIds.includes(prod.id) ? 'bg-primary/10 text-primary' : ''
                  }`}
                >
                  <span>{prod.name}</span>
                  <span className="text-muted-foreground">${prod.price.toFixed(2)}</span>
                </button>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={duplicateSKU}>
              {isEdit ? 'Save Changes' : 'Add Deal'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
