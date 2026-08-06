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
    <div className="flex-shrink-0 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm">
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
                  ? 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
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
            className="flex-shrink-0 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-sm transition-all duration-150 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:text-blue-600 dark:hover:text-blue-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
