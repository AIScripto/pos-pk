import { useState } from 'react';
import {
  Building2, Globe, Receipt, Percent, Gift, Star,
  ChevronRight
} from 'lucide-react';
import { ProfileSection } from '@/components/admin/config/sections/ProfileSection';
import { CurrencySection } from '@/components/admin/config/sections/CurrencySection';
import { ReceiptSection } from '@/components/admin/config/sections/ReceiptSection';
import { TaxSection } from '@/components/admin/config/sections/TaxSection';
import { DiscountsSection } from '@/components/admin/config/sections/DiscountsSection';
import { LoyaltySection } from '@/components/admin/config/sections/LoyaltySection';
import { useTranslation } from '@/i18n';

// ── Section IDs ───────────────────────────────────────────────────────────────
type SectionId = 'profile' | 'currency' | 'receipt' | 'tax' | 'discounts' | 'loyalty';

export default function AdminConfig() {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState<SectionId>('profile');

  const SECTIONS = [
    { id: 'profile'   as SectionId, label: t.config.businessProfile, icon: Building2,  desc: t.config.orgInfo },
    { id: 'currency'  as SectionId, label: t.config.currencySymbol,  icon: Globe,       desc: t.config.currencySymbol },
    { id: 'receipt'   as SectionId, label: t.config.receiptTemplates, icon: Receipt,    desc: t.receipt.invoiceNumber },
    { id: 'tax'       as SectionId, label: t.config.taxSettings,     icon: Percent,     desc: t.config.taxRate },
    { id: 'discounts' as SectionId, label: t.discount.discountTitle, icon: Gift,        desc: t.discount.discountTitle },
    { id: 'loyalty'   as SectionId, label: t.customer.customerTitle, icon: Star,        desc: t.customer.phone },
  ];

  const renderSection = () => {
    switch (activeSection) {
      case 'profile':   return <ProfileSection />;
      case 'currency':  return <CurrencySection />;
      case 'receipt':   return <ReceiptSection />;
      case 'tax':       return <TaxSection />;
      case 'discounts': return <DiscountsSection />;
      case 'loyalty':   return <LoyaltySection />;
    }
  };

  const active = SECTIONS.find(s => s.id === activeSection)!;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t.config.configTitle}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-300 mt-1">{t.config.businessProfile}</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar nav */}
        <aside className="w-60 shrink-0">
          <nav className="space-y-1 rounded-xl border border-slate-200 bg-white p-2 shadow-sm dark:border-slate-600 dark:bg-slate-900">
            {SECTIONS.map(section => {
              const Icon = section.icon;
              const isActive = section.id === activeSection;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{section.label}</p>
                    {!isActive && <p className="text-xs opacity-60 truncate">{section.desc}</p>}
                  </div>
                  {isActive && <ChevronRight className="w-4 h-4 ml-auto shrink-0" />}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Section content */}
        <div className="flex-1 min-w-0">
          <div className="mb-4 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-300">
            <span>{t.config.configTitle}</span>
            <ChevronRight className="w-3 h-3" />
            <span className="font-medium text-slate-900 dark:text-white">{active.label}</span>
          </div>
          {renderSection()}
        </div>
      </div>
    </div>
  );
}

