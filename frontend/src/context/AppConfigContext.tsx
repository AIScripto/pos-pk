import { createContext, useContext, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { configureCurrency, getCurrencyConfig, type CurrencyConfig } from '@/config/currency';
import { configureTaxRules } from '@/config/tax';
import { adminConfigApi, type OrgConfig, type TaxConfig, type LoyaltyConfig } from '@/lib/api/admin-config.api';

interface AppConfigContextValue {
  orgConfig?: OrgConfig;
  taxConfigs: TaxConfig[];
  currencyConfig: CurrencyConfig;
  loyaltyConfig?: LoyaltyConfig;
  isLoading: boolean;
}

const AppConfigContext = createContext<AppConfigContextValue>({
  taxConfigs: [],
  currencyConfig: getCurrencyConfig(),
  isLoading: false,
});

export function AppConfigProvider({ children }: { children: ReactNode }) {
  const orgConfigQuery = useQuery({
    queryKey: ['orgConfig'],
    queryFn: adminConfigApi.getOrgConfig,
    retry: false,
  });

  const taxConfigQuery = useQuery({
    queryKey: ['taxConfigs'],
    queryFn: adminConfigApi.listTaxConfigs,
    retry: false,
  });

  const loyaltyConfigQuery = useQuery({
    queryKey: ['loyaltyConfig'],
    queryFn: adminConfigApi.getLoyaltyConfig,
    retry: false,
  });

  // Keep the legacy formatting/calculation helpers in sync before children render.
  configureCurrency(orgConfigQuery.data);
  configureTaxRules(taxConfigQuery.data);

  const isLoading = orgConfigQuery.isLoading || taxConfigQuery.isLoading || loyaltyConfigQuery.isLoading;

  const value: AppConfigContextValue = {
    orgConfig: orgConfigQuery.data,
    taxConfigs: taxConfigQuery.data ?? [],
    currencyConfig: getCurrencyConfig(),
    loyaltyConfig: loyaltyConfigQuery.data,
    isLoading,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-400"></div>
      </div>
    );
  }

  return (
    <AppConfigContext.Provider value={value}>
      {children}
    </AppConfigContext.Provider>
  );
}

export const useAppConfig = () => useContext(AppConfigContext);
