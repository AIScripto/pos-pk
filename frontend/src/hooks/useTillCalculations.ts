import { useState, useCallback } from 'react';
import { DenominationEntry, blankDenominations, sumDenominations } from '@/types/till';
import { useAppConfig } from '@/context/AppConfigContext';

export function useTillCalculations(initialCurrency?: string) {
  const { currencyConfig } = useAppConfig();
  const currencyCode = initialCurrency || currencyConfig.currencyCode;

  const [denominations, setDenominations] = useState<DenominationEntry[]>(() =>
    blankDenominations(currencyCode)
  );

  const resetDenominations = useCallback(() => {
    setDenominations(blankDenominations(currencyCode));
  }, [currencyCode]);

  const updateCount = useCallback((value: number, count: number) => {
    setDenominations((prev) => 
      prev.map(e => e.value === value ? { ...e, count: Math.max(0, count), total: e.value * Math.max(0, count) } : e)
    );
  }, []);

  const totalCash = sumDenominations(denominations);

  const getVariance = useCallback(
    (expectedCash: number) => {
      const variance = totalCash - expectedCash;
      const isShort = variance < 0;
      const isOver = variance > 0;
      const isBalanced = Math.abs(variance) < 0.005;
      return { variance, isShort, isOver, isBalanced };
    },
    [totalCash]
  );

  return {
    denominations,
    setDenominations,
    resetDenominations,
    updateCount,
    totalCash,
    getVariance,
    currencyCode,
  };
}
