import { Search, X, LayoutGrid, Grid3x3, List } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/i18n';

interface ProductGridHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  viewMode: 'card' | 'button' | 'list';
  onViewModeChange: (mode: 'card' | 'button' | 'list') => void;
}

export function ProductGridHeader({
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
}: ProductGridHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="border-b border-border bg-card px-3 py-2.5 flex items-center justify-between gap-2.5 flex-wrap">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          data-pos-search="true"
          placeholder={t.common.searchPlaceholder}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-xl border border-border bg-secondary py-2 pl-9 pr-8 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            aria-label="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {[
          { mode: 'card' as const, label: t.common.card, icon: LayoutGrid, title: 'Card View (Rich Images)' },
          { mode: 'button' as const, label: t.common.button, icon: Grid3x3, title: 'Touch Button Matrix (Ultra-Fast)' },
          { mode: 'list' as const, label: t.common.list, icon: List, title: 'Compact List View' },
        ].map((vm) => {
          const Icon = vm.icon;
          const isActive = viewMode === vm.mode;
          return (
            <button
              key={vm.mode}
              type="button"
              onClick={() => onViewModeChange(vm.mode)}
              title={vm.title}
              className={cn(
                'flex flex-col items-center justify-center min-w-[60px] sm:min-w-[68px] h-11 px-2.5 py-1 rounded-xl border transition-all cursor-pointer shadow-xs active:scale-[0.96] group shrink-0',
                isActive
                  ? 'bg-primary border-primary text-white font-black shadow-md scale-[1.02]'
                  : 'bg-secondary border-border text-foreground hover:bg-secondary/80 dark:hover:bg-muted hover:border-primary/80'
              )}
            >
              <Icon className={cn('w-4 h-4 shrink-0 transition-transform duration-150 group-hover:scale-110', isActive ? 'text-white' : 'text-foreground')} />
              <span className="font-display font-extrabold text-[11px] sm:text-xs tracking-tight leading-tight mt-0.5">
                {vm.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
