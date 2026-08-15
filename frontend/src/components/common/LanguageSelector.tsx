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
    <div className={`relative flex items-center gap-1 bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-xl p-1 shadow-xs ${className}`}>
      <Globe className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 ml-1.5 shrink-0" />
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
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
              }`}
              title={`${lang.label} (${lang.nativeLabel})`}
            >
              <span>{lang.flag}</span>
              <span className={lang.dir === 'rtl' ? 'font-sans' : 'font-mono'}>
                {variant === 'full' ? lang.nativeLabel : lang.code.toUpperCase()}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
