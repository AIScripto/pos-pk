import type { OrgConfig } from '@/lib/api/admin-config.api';

export type CurrencyConfig = Pick<
  OrgConfig,
  'currencyCode' | 'currencySymbol' | 'symbolPosition' | 'decimalPlaces' | 'thousandSep' | 'decimalSep' | 'locale'
>;

const DEFAULT_CURRENCY_CONFIG: CurrencyConfig = {
  currencyCode: 'PKR',
  currencySymbol: 'Rs',
  symbolPosition: 'before',
  decimalPlaces: 2,
  thousandSep: ',',
  decimalSep: '.',
  locale: 'en-PK',
};

let activeCurrencyConfig: CurrencyConfig = { ...DEFAULT_CURRENCY_CONFIG };

const normaliseSymbolPosition = (value?: string): CurrencyConfig['symbolPosition'] =>
  value === 'after' ? 'after' : 'before';

export function configureCurrency(config?: Partial<CurrencyConfig> | null) {
  if (!config) return;

  activeCurrencyConfig = {
    ...activeCurrencyConfig,
    ...config,
    currencySymbol: config.currencySymbol?.trim() || activeCurrencyConfig.currencySymbol,
    symbolPosition: normaliseSymbolPosition(config.symbolPosition),
    decimalPlaces: Number.isFinite(config.decimalPlaces)
      ? Math.max(0, Math.min(4, Number(config.decimalPlaces)))
      : activeCurrencyConfig.decimalPlaces,
    thousandSep: config.thousandSep ?? activeCurrencyConfig.thousandSep,
    decimalSep: config.decimalSep ?? activeCurrencyConfig.decimalSep,
    locale: config.locale || activeCurrencyConfig.locale,
  };
}

export function getCurrencyConfig(): CurrencyConfig {
  return activeCurrencyConfig;
}

export function formatConfiguredCurrency(amount: number, config: Partial<CurrencyConfig> = activeCurrencyConfig): string {
  const merged = { ...DEFAULT_CURRENCY_CONFIG, ...activeCurrencyConfig, ...config };
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  const sign = safeAmount < 0 ? '-' : '';
  const absoluteAmount = Math.abs(safeAmount);
  const fixed = absoluteAmount.toFixed(merged.decimalPlaces);
  const [integerPart, decimalPart = ''] = fixed.split('.');
  const groupedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, merged.thousandSep);
  const numberText = merged.decimalPlaces > 0
    ? `${groupedInteger}${merged.decimalSep}${decimalPart}`
    : groupedInteger;
  let symbol = merged.currencySymbol.trim();
  if (symbol.toUpperCase() === 'RS') {
    symbol = 'Rs';
  }

  if (merged.symbolPosition === 'after') {
    return `${sign}${numberText} ${symbol}`.trim();
  }

  return `${sign}${symbol} ${numberText}`.trim();
}
