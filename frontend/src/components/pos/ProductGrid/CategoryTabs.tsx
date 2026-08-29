import React, { useState, useEffect } from 'react';
import { Category, Product, Deal } from '@/types/pos';
import { cn } from '@/lib/utils';
import { GripVertical } from 'lucide-react';
import {
  getIconForCategory,
  ALL_CATEGORIES_ICON,
  DEALS_ICON,
  type LucideIcon,
} from './categoryIcons';

interface CategorySidebarProps {
  activeCategory: Category | 'all';
  onCategoryChange: (category: Category | 'all') => void;
  products: Product[];
  deals: Deal[];
}

export interface CategoryItem {
  key: Category | 'all' | 'deals';
  label: string;
  icon: LucideIcon;
  isDeals?: boolean;
}

import { useProducts } from '@/context/ProductContext';
import { useTranslation } from '@/i18n';
import { getLocalizedCategoryName } from '@/i18n/catalog';
import { toLocalizedDigits } from '@/i18n/digits';

const STORAGE_KEY = 'aipos_category_order_v1';


export function CategoryTabs({ activeCategory, onCategoryChange, products, deals }: CategorySidebarProps) {
  const { t, language } = useTranslation();
  const { categories: dynamicCategories } = useProducts();
  const [categories, setCategories] = useState<CategoryItem[]>([]);

  useEffect(() => {
    const defaultBase: CategoryItem[] = [
      { key: 'all', label: 'All', icon: ALL_CATEGORIES_ICON }
    ];
    
    const sortedDynamic = [...dynamicCategories].sort((a, b) => a.sortOrder - b.sortOrder);
    const dynamicItems: CategoryItem[] = sortedDynamic.map(c => ({
      key: c.name,
      label: c.name,
      icon: getIconForCategory(c.name)
    }));

    const dealsBase: CategoryItem[] = [
      { key: 'deals', label: 'Deals', icon: DEALS_ICON, isDeals: true }
    ];

    const currentDefault = [...defaultBase, ...dynamicItems, ...dealsBase];

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsedKeys: string[] = JSON.parse(saved);
        const ordered = parsedKeys
          .map((k) => currentDefault.find((item) => item.key === k))
          .filter((item): item is CategoryItem => Boolean(item));
        
        const missing = currentDefault.filter((d) => !ordered.some((o) => o.key === d.key));
        setCategories([...ordered, ...missing]);
        return;
      }
    } catch (e) {
      console.warn('Failed to load category order', e);
    }
    
    setCategories(currentDefault);
  }, [dynamicCategories]);

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Save category order when changed
  useEffect(() => {
    if (categories.length === 0) return;
    try {
      const keys = categories.map((c) => c.key);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
    } catch (e) {
      console.warn('Failed to save category order', e);
    }
  }, [categories]);

  // Live count helper
  const countFor = (key: CategoryItem['key']): number => {
    if (key === 'all') return products.length + deals.length;
    if (key === 'deals') return deals.length;
    const prodCount = products.filter((p) => p.category === key).length;
    const dealCount = deals.filter((d) => d.category === key).length;
    return prodCount + dealCount;
  };

  // Drag & Drop Handlers
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    // Transparent ghost effect or data
    e.dataTransfer.setData('text/plain', String(index));
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const updated = [...categories];
    const [movedItem] = updated.splice(draggedIndex, 1);
    updated.splice(targetIndex, 0, movedItem);

    setCategories(updated);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <nav className="flex flex-col gap-2 p-2 overflow-y-auto pos-scrollbar bg-secondary/70 border-r border-border select-none">
      {categories.map((cat, index) => {
        const count = countFor(cat.key);
        const isActive = activeCategory === cat.key;
        const isDragging = draggedIndex === index;
        const isDragOver = dragOverIndex === index && draggedIndex !== index;

        return (
          <div
            key={cat.key}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            className={cn(
              'relative transition-all duration-150 rounded-xl',
              isDragging && 'opacity-40 scale-95',
              isDragOver && 'ring-2 ring-ring scale-[1.03] shadow-lg z-10'
            )}
          >
            <button
              onClick={() => onCategoryChange(cat.key as Category | 'all')}
              data-category={cat.isDeals ? 'deals' : undefined}
              aria-label={`${cat.label} (${count})`}
              aria-pressed={isActive}
              className={cn(
                'w-full flex flex-col items-center gap-1.5 px-2 py-2.5 rounded-xl border transition-all duration-200 touch-manipulation cursor-grab active:cursor-grabbing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring group relative',
                cat.isDeals
                  ? isActive
                    ? 'bg-gradient-to-b from-warning to-warning border-warning/50 text-white shadow-md shadow-warning/30 font-black scale-[1.02]'
                    : 'bg-gradient-to-b from-warning/10 to-warning/10 dark:from-warning/20 dark:to-warning/20 border-warning/30 text-warning-text hover:from-warning/20 hover:to-warning/20 hover:border-warning/50 shadow-sm'
                  : isActive
                  ? 'bg-gradient-to-b from-primary to-primary border-primary/50 text-white shadow-md shadow-primary/30 font-black scale-[1.02]'
                  : 'bg-secondary border-border text-foreground hover:bg-secondary/80 dark:hover:bg-muted hover:border-primary/60 font-extrabold shadow-sm'
              )}
            >
              {/* Drag handle affordance */}
              <span className="absolute top-1 right-1 opacity-40 group-hover:opacity-100 transition-opacity text-muted-foreground/70">
                <GripVertical className="w-3 h-3" />
              </span>

              <cat.icon
                aria-hidden="true"
                className="h-6 w-6 shrink-0 transition-transform duration-200 group-hover:scale-110"
                strokeWidth={1.75}
              />
              <span className="font-display font-extrabold text-2xs uppercase tracking-wider leading-none text-center">
                {cat.key === 'all' ? t.common.allItems : cat.key === 'deals' ? t.common.deals : getLocalizedCategoryName(cat.label, language)}
              </span>
              <span className={cn(
                'text-2xs tabular-nums font-black px-2 py-0.5 rounded-full leading-none border transition-all',
                isActive
                  ? 'bg-white/25 border-white/30 text-white shadow-sm'
                  : cat.isDeals
                  ? 'bg-warning/80 dark:bg-warning/30 border-warning-border dark:border-warning/50 text-warning-text dark:text-warning shadow-sm'
                  : 'bg-secondary/90 border-border/80 text-foreground shadow-sm'
              )}>
                {toLocalizedDigits(count, language)}
              </span>
            </button>
          </div>
        );
      })}
    </nav>
  );
}
