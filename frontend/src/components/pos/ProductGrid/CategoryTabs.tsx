import React, { useState, useEffect } from 'react';
import { Category, Product, Deal } from '@/types/pos';
import { cn } from '@/lib/utils';
import { GripVertical } from 'lucide-react';

interface CategorySidebarProps {
  activeCategory: Category | 'all';
  onCategoryChange: (category: Category | 'all') => void;
  products: Product[];
  deals: Deal[];
}

export interface CategoryItem {
  key: Category | 'all' | 'deals';
  label: string;
  icon: string;
  isDeals?: boolean;
}

import { useProducts } from '@/context/ProductContext';
import { useTranslation } from '@/i18n';
import { getLocalizedCategoryName } from '@/i18n/catalog';
import { toLocalizedDigits } from '@/i18n/digits';

const STORAGE_KEY = 'aipos_category_order_v1';

const getIconForCategory = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes('burger')) return '🍔';
  if (lower.includes('wrap')) return '🌯';
  if (lower.includes('chicken')) return '🍗';
  if (lower.includes('fry') || lower.includes('fries')) return '🍟';
  if (lower.includes('drink') || lower.includes('beverage')) return '🥤';
  if (lower.includes('pizza')) return '🍕';
  if (lower.includes('dessert') || lower.includes('sweet')) return '🍦';
  if (lower.includes('salad')) return '🥗';
  return '🍽️';
};

export function CategoryTabs({ activeCategory, onCategoryChange, products, deals }: CategorySidebarProps) {
  const { t, language } = useTranslation();
  const { categories: dynamicCategories } = useProducts();
  const [categories, setCategories] = useState<CategoryItem[]>([]);

  useEffect(() => {
    const defaultBase: CategoryItem[] = [
      { key: 'all', label: 'All', icon: '⚡' }
    ];
    
    const sortedDynamic = [...dynamicCategories].sort((a, b) => a.sortOrder - b.sortOrder);
    const dynamicItems: CategoryItem[] = sortedDynamic.map(c => ({
      key: c.name,
      label: c.name,
      icon: getIconForCategory(c.name)
    }));

    const dealsBase: CategoryItem[] = [
      { key: 'deals', label: 'Deals', icon: '🎉', isDeals: true }
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
    <nav className="flex flex-col gap-2 p-2 overflow-y-auto pos-scrollbar bg-slate-100/70 dark:bg-slate-900/60 border-r border-slate-200/80 dark:border-slate-800 select-none">
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
              isDragOver && 'ring-2 ring-blue-500 scale-[1.03] shadow-lg z-10'
            )}
          >
            <button
              onClick={() => onCategoryChange(cat.key as Category | 'all')}
              data-category={cat.isDeals ? 'deals' : undefined}
              aria-label={`${cat.label} (${count})`}
              aria-pressed={isActive}
              className={cn(
                'w-full flex flex-col items-center gap-1.5 px-2 py-2.5 rounded-xl border transition-all duration-200 touch-manipulation cursor-grab active:cursor-grabbing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 group relative',
                cat.isDeals
                  ? isActive
                    ? 'bg-gradient-to-b from-amber-500 to-orange-600 border-amber-400/50 text-white shadow-md shadow-amber-500/30 font-black scale-[1.02]'
                    : 'bg-gradient-to-b from-amber-500/10 to-orange-500/10 dark:from-amber-500/20 dark:to-orange-500/20 border-amber-500/30 text-amber-900 dark:text-amber-300 hover:from-amber-500/20 hover:to-orange-500/20 hover:border-amber-500/50 shadow-sm'
                  : isActive
                  ? 'bg-gradient-to-b from-blue-600 to-indigo-600 border-blue-500/50 text-white shadow-md shadow-blue-500/30 font-black scale-[1.02]'
                  : 'bg-slate-200/80 dark:bg-slate-900/90 border-slate-300 dark:border-slate-700/90 text-slate-800 dark:text-slate-100 hover:bg-slate-300/80 dark:hover:bg-slate-800 hover:border-blue-500/60 font-extrabold shadow-sm'
              )}
            >
              {/* Drag handle affordance */}
              <span className="absolute top-1 right-1 opacity-40 group-hover:opacity-100 transition-opacity text-slate-400 dark:text-slate-500">
                <GripVertical className="w-3 h-3" />
              </span>

              <span className="text-2xl leading-none transition-transform duration-200 group-hover:scale-110">{cat.icon}</span>
              <span className="font-display font-extrabold text-[10px] uppercase tracking-wider leading-none text-center">
                {cat.key === 'all' ? t.common.allItems : cat.key === 'deals' ? t.common.deals : getLocalizedCategoryName(cat.label, language)}
              </span>
              <span className={cn(
                'text-[10px] tabular-nums font-black px-2 py-0.5 rounded-full leading-none border transition-all',
                isActive
                  ? 'bg-white/25 border-white/30 text-white shadow-sm'
                  : cat.isDeals
                  ? 'bg-amber-200/80 dark:bg-amber-500/30 border-amber-300 dark:border-amber-700/50 text-amber-950 dark:text-amber-100 shadow-sm'
                  : 'bg-slate-200/90 dark:bg-slate-700/80 border-slate-300/80 dark:border-slate-600 text-slate-900 dark:text-slate-100 shadow-sm'
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
