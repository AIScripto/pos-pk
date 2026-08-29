import React from 'react';
import { useTranslation, LanguageCode } from '@/i18n';
import { Globe } from 'lucide-react';

interface LanguageSelectorProps {
  variant?: 'compact' | 'full';
  className?: string;
}

export function LanguageSelector({ variant = 'compact', className = '' }: LanguageSelectorProps) {
  const { language, setLanguage, availableLanguages } = useTranslation();

  return (
    <div className={`relative flex items-center gap-1 bg-secondary border border-border rounded-xl p-1 shadow-xs ${className}`}>
      <Globe className="w-3.5 h-3.5 text-muted-foreground ml-1.5 shrink-0" />
      <div className="flex items-center gap-0.5">
        {availableLanguages.map((lang) => {
          const isActive = language === lang.code;
          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => setLanguage(lang.code as LanguageCode)}
              className={`h-7 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
              }`}
              title={`${lang.label} (${lang.nativeLabel})`}
            >
              <span
                aria-hidden="true"
                className="font-mono text-[11px] font-bold tracking-wider opacity-70"
              >
                {lang.tag}
              </span>
              <span className="font-sans" lang={lang.code}>
                {variant === 'full' ? lang.nativeLabel : lang.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
