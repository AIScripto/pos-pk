import { Product, Deal, Category } from '@/types/pos';
import { useProducts } from '@/context/ProductContext';
import { ProductCard } from './ProductCard';
import { DealCard } from './DealCard';
import { CategoryTabs } from './CategoryTabs';
import { ProductButtonTile } from './ProductButtonTile';
import { DealButtonTile } from './DealButtonTile';
import { ProductListItem } from './ProductListItem';
import { DealListItem } from './DealListItem';
import { ProductGridHeader } from './ProductGridHeader';
import { DealCategoryFilter } from './DealCategoryFilter';
import { useState } from 'react';
import { Search } from 'lucide-react';
import { useTranslation } from '@/i18n';
import { getLocalizedCategoryName } from '@/i18n/catalog';
import { toLocalizedDigits } from '@/i18n/digits';

interface ProductGridProps {
  onAddProduct: (product: Product) => void;
  onAddDeal: (deal: Deal) => void;
  onToggleCart?: () => void;
  onOpenHeld?: () => void;
  onToggleOrders?: () => void;
  onToggleProducts?: () => void;
  onToggleInvoices?: () => void;
}

export function ProductGrid({
  onAddProduct,
  onAddDeal,
  onToggleCart,
  onOpenHeld,
  onToggleOrders,
  onToggleProducts,
  onToggleInvoices,
}: ProductGridProps) {
  const { t, language } = useTranslation();
  const { products, deals } = useProducts();
  const [activeCategory, setActiveCategory] = useState<Category | 'all'>('all');
  const [dealSubCategory, setDealSubCategory] = useState<Category | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'card' | 'button' | 'list'>('card');

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      activeCategory === 'all' ? true
      : activeCategory === 'deals' ? false
      : product.category === activeCategory;
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const isDealScheduleActive = (deal: Deal): boolean => {
    if (deal.availabilityType !== 'scheduled') return true;
    const now = new Date();
    const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const currentDay = dayNames[now.getDay()];

    if (deal.availableDays) {
      const allowedDays = deal.availableDays.split(',').map(d => d.trim().toUpperCase());
      if (allowedDays.length > 0 && !allowedDays.includes(currentDay)) {
        return false;
      }
    }

    if (deal.startTime && deal.endTime) {
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const [startH, startM] = deal.startTime.split(':').map(Number);
      const [endH, endM] = deal.endTime.split(':').map(Number);
      const startMinutes = startH * 60 + (startM || 0);
      const endMinutes = endH * 60 + (endM || 0);

      if (startMinutes <= endMinutes) {
        if (currentMinutes < startMinutes || currentMinutes > endMinutes) return false;
      } else {
        // Cross midnight
        if (currentMinutes < startMinutes && currentMinutes > endMinutes) return false;
      }
    }

    return true;
  };

  const filteredDeals = deals.filter((deal) => {
    const matchesSearch =
      deal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deal.code.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      activeCategory === 'all'
        ? true
        : activeCategory === 'deals'
        ? (dealSubCategory === 'all' ? true : deal.category === dealSubCategory)
        : deal.category === activeCategory;

    const isActiveTime = isDealScheduleActive(deal);

    return matchesSearch && matchesCategory && isActiveTime;
  });

  const showDeals = filteredDeals.length > 0;
  const showProducts = activeCategory !== 'deals';
  const isEmpty = filteredProducts.length === 0 && filteredDeals.length === 0;

  const categoryLabel =
    activeCategory === 'all' ? t.common.allItems
    : activeCategory === 'deals' ? t.common.deals
    : getLocalizedCategoryName(activeCategory, language);

  const visibleCount = (showDeals ? filteredDeals.length : 0) + (showProducts ? filteredProducts.length : 0);

  return (
    <div className="flex h-full overflow-hidden">
      {/* Vertical category sidebar */}
      <div className="w-[72px] shrink-0 border-r border-border bg-card overflow-y-auto pos-scrollbar">
        <CategoryTabs
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          products={products}
          deals={deals}
        />
      </div>

      {/* Main product area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <ProductGridHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        {activeCategory === 'deals' && (
          <DealCategoryFilter
            dealSubCategory={dealSubCategory}
            onSubCategoryChange={setDealSubCategory}
            deals={deals}
          />
        )}

        {/* Section label & Item Count */}
        <div className="flex items-center justify-between px-3 pt-2.5 pb-1 gap-2 flex-wrap">
          <span className="font-display font-black text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {categoryLabel}
          </span>

          {!isEmpty && (
            <span className="text-2xs text-muted-foreground/60 tabular-nums">
              {toLocalizedDigits(visibleCount, language)} {visibleCount === 1 ? t.common.item : t.common.items}
            </span>
          )}
        </div>

        {/* Product Display Container */}
        <div className="flex-1 overflow-y-auto pos-scrollbar px-3 pb-3">
          {isEmpty ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center mb-3">
                <Search className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-semibold text-muted-foreground">{t.common.noItemsFound}</p>
              <p className="text-xs text-muted-foreground mt-1 opacity-60">{t.common.tryDifferentSearch}</p>
            </div>
          ) : viewMode === 'card' ? (
            /* 1. Rich Card View */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2">
              {showDeals && filteredDeals.map((deal) => (
                <DealCard key={deal.id} deal={deal} onAdd={onAddDeal} />
              ))}
              {showProducts && filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} onAdd={onAddProduct} />
              ))}
            </div>
          ) : viewMode === 'button' ? (
            /* 2. Quick Touch Button Matrix View */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-1.5">
              {showDeals && filteredDeals.map((deal) => (
                <DealButtonTile key={deal.id} deal={deal} onAdd={onAddDeal} />
              ))}
              {showProducts && filteredProducts.map((product) => (
                <ProductButtonTile key={product.id} product={product} onAdd={onAddProduct} />
              ))}
            </div>
          ) : (
            /* 3. Compact List View */
            <div className="space-y-1.5">
              {showDeals && filteredDeals.map((deal) => (
                <DealListItem key={deal.id} deal={deal} onAdd={onAddDeal} />
              ))}
              {showProducts && filteredProducts.map((product) => (
                <ProductListItem key={product.id} product={product} onAdd={onAddProduct} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

