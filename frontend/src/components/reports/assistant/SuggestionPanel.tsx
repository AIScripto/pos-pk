import { useState } from 'react';
import { SUGGESTION_CATEGORIES } from './constants';

export function SuggestionPanel({
  onSelect,
  disabled,
}: {
  onSelect: (q: string) => void;
  disabled: boolean;
}) {
  const [activeKey, setActiveKey] = useState('revenue');
  const activeCategory = SUGGESTION_CATEGORIES.find(c => c.key === activeKey) ?? SUGGESTION_CATEGORIES[0];

  return (
    <div className="flex-shrink-0 border-b border-border bg-white/90 dark:bg-muted/90 backdrop-blur-sm">
      <div className="scrollbar-hide flex gap-1 overflow-x-auto px-4 pt-3">
        {SUGGESTION_CATEGORIES.map(cat => {
          const Icon = cat.icon;
          const isActive = cat.key === activeKey;

          return (
            <button
              key={cat.key}
              onClick={() => setActiveKey(cat.key)}
              className={`flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl border px-3 py-1.5 text-xs font-bold transition-all duration-150 ${
                isActive
                  ? 'border-info-border bg-info-subtle text-primary shadow-sm'
                  : 'border-transparent text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${isActive ? '' : cat.color}`} />
              {cat.label}
            </button>
          );
        })}
      </div>

      <div className="scrollbar-hide flex gap-2 overflow-x-auto px-4 py-2.5">
        {activeCategory.suggestions.map(s => (
          <button
            key={s}
            onClick={() => onSelect(s)}
            disabled={disabled}
            className="flex-shrink-0 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-semibold text-muted-foreground shadow-sm transition-all duration-150 hover:border-primary hover:bg-info-subtle hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
