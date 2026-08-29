// =============================================================================
// SearchableSelect — reusable combobox with search/filter capability
// =============================================================================

import { useState, useRef, useEffect } from 'react';
import { Check, ChevronsUpDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string;
  label: string;
  sublabel?: string;
}

interface Props {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  className?: string;
}

export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  searchPlaceholder = 'Search...',
  disabled = false,
  className,
}: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = options.find((o) => o.value === value);

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase()) ||
    (o.sublabel?.toLowerCase().includes(search.toLowerCase()) ?? false)
  );

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input on open
  useEffect(() => {
    if (open) {
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [open]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setOpen(false);
    setSearch('');
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* Trigger button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen(!open)}
        className={cn(
          'w-full flex items-center justify-between rounded-md border border-border bg-white px-3 py-2 text-sm shadow-sm transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary/40',
          'dark:border-border dark:bg-muted dark:text-foreground',
          disabled && 'cursor-not-allowed opacity-60 bg-secondary',
          !disabled && 'hover:border-primary/40 cursor-pointer'
        )}
      >
        <span className={cn('truncate', !selected && 'text-muted-foreground/70')}>
          {selected ? (
            <span className="flex items-center gap-2">
              <span>{selected.label}</span>
              {selected.sublabel && (
                <span className="text-xs text-muted-foreground font-mono bg-secondary px-1.5 py-0.5 rounded">
                  {selected.sublabel}
                </span>
              )}
            </span>
          ) : (
            placeholder
          )}
        </span>
        <ChevronsUpDown className="w-4 h-4 text-muted-foreground/70 shrink-0 ml-2" />
      </button>

      {/* Dropdown */}
      {open && (
        <div className={cn(
          'absolute z-50 mt-1 w-full rounded-md border border-border bg-white shadow-lg',
          'dark:border-border dark:bg-muted'
        )}>
          {/* Search input */}
          <div className="flex items-center gap-2 border-b border-border px-3 py-2">
            <Search className="w-4 h-4 text-muted-foreground/70 shrink-0" />
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className={cn(
                'flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/70',
                'dark:text-foreground dark:placeholder:text-muted-foreground'
              )}
            />
          </div>

          {/* Options list */}
          <ul className="max-h-52 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-muted-foreground/70 text-center">
                No results found
              </li>
            ) : (
              filtered.map((option) => (
                <li key={option.value}>
                  <button
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    className={cn(
                      'w-full flex items-center justify-between px-3 py-2 text-sm transition-colors',
                      'hover:bg-secondary',
                      value === option.value && 'bg-secondary font-medium'
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-foreground">{option.label}</span>
                      {option.sublabel && (
                        <span className="text-xs text-muted-foreground font-mono bg-secondary px-1.5 py-0.5 rounded">
                          {option.sublabel}
                        </span>
                      )}
                    </span>
                    {value === option.value && (
                      <Check className="w-4 h-4 text-muted-foreground shrink-0" />
                    )}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
