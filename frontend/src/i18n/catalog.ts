// ─────────────────────────────────────────────────────────────────────────────
// Multilingual Product Catalog & Category Localization
// Provides authentic Arabic & Urdu translations for catalog products & categories
// ─────────────────────────────────────────────────────────────────────────────

import { LanguageCode } from './index';

export const CATEGORY_TRANSLATIONS: Record<string, Record<LanguageCode, string>> = {
  all: {
    en: 'ALL ITEMS',
    ar: 'جميع الأصناف',
    ur: 'تمام آئٹمز',
  },
  deals: {
    en: 'DEALS',
    ar: 'العروض',
    ur: 'ڈیلز',
  },
  burgers: {
    en: 'BURGERS',
    ar: 'برغر',
    ur: 'برگر',
  },
  wraps: {
    en: 'WRAPS',
    ar: 'سندويشات',
    ur: 'ریپس',
  },
  chicken: {
    en: 'CHICKEN',
    ar: 'دجاج',
    ur: 'چکن',
  },
  fries: {
    en: 'FRIES',
    ar: 'بطاطس',
    ur: 'فرائز',
  },
  drinks: {
    en: 'DRINKS',
    ar: 'مشروبات',
    ur: 'مشروبات',
  },
  desserts: {
    en: 'DESSERTS',
    ar: 'حلويات',
    ur: 'ڈیزرٹس',
  },
};

export const PRODUCT_TRANSLATIONS: Record<string, Record<LanguageCode, string>> = {
  // Deals
  'Wrap & Go': {
    en: 'Wrap & Go',
    ar: 'وجبة راب آند غو',
    ur: 'ریپ اینڈ گو ڈیل',
  },
  'Family Pack': {
    en: 'Family Pack',
    ar: 'وجبة عائلية',
    ur: 'فیملی پیک ڈیل',
  },
  'Double Trouble': {
    en: 'Double Trouble',
    ar: 'دبل تروبل',
    ur: 'ڈبل ٹربل ڈیل',
  },
  'Classic Combo': {
    en: 'Classic Combo',
    ar: 'كومبو كلاسيك',
    ur: 'کلاسک کومبو',
  },
  'Chicken Feast': {
    en: 'Chicken Feast',
    ar: 'وليمة الدجاج',
    ur: 'چکن فیسٹ ڈیل',
  },

  // Burgers & Wraps
  'Chicken Wrap': {
    en: 'Chicken Wrap',
    ar: 'راب دجاج',
    ur: 'چکن ریپ',
  },
  'BBQ Bacon Burger': {
    en: 'BBQ Bacon Burger',
    ar: 'برغر باربيكيو بيكون',
    ur: 'بی بی کیو برگر',
  },
  'Crispy Chicken Burger': {
    en: 'Crispy Chicken Burger',
    ar: 'برغر دجاج مقرمش',
    ur: 'کرسپی چکن برگر',
  },
  'Double Stack Burger': {
    en: 'Double Stack Burger',
    ar: 'برغر دبل ستاك',
    ur: 'ڈبل اسٹیک برگر',
  },
  'Classic Crip Burger': {
    en: 'Classic Crip Burger',
    ar: 'برغر كلاسيك كريب',
    ur: 'کلاسک برگر',
  },
  'Zinger Wrap': {
    en: 'Zinger Wrap',
    ar: 'زينجر راب',
    ur: 'زنگر ریپ',
  },
  'Beef Wrap': {
    en: 'Beef Wrap',
    ar: 'راب لحم بقري',
    ur: 'بیف ریپ',
  },

  // Chicken
  'Popcorn Chicken': {
    en: 'Popcorn Chicken',
    ar: 'بوب كورن دجاج',
    ur: 'پاپ کارن چکن',
  },
  'Crispy Tenders (8 pcs)': {
    en: 'Crispy Tenders (8 pcs)',
    ar: 'تندر دجاج مقرمش (٨ قطع)',
    ur: 'کرسپی ٹینڈرز (8 عدد)',
  },
  'Crispy Tenders (4 pcs)': {
    en: 'Crispy Tenders (4 pcs)',
    ar: 'تندر دجاج مقرمش (٤ قطع)',
    ur: 'کرسپی ٹینڈرز (4 عدد)',
  },

  // Fries & Drinks
  'Loaded Cheese Fries': {
    en: 'Loaded Cheese Fries',
    ar: 'بطاطس بالجبنة',
    ur: 'لوڈڈ چیز فرائز',
  },
  'Large Fries': {
    en: 'Large Fries',
    ar: 'بطاطس مقلية كبيرة',
    ur: 'بڑے فرائز',
  },
  'Regular Fries': {
    en: 'Regular Fries',
    ar: 'بطاطس مقلية عادية',
    ur: 'ریگولر فرائز',
  },
  'Soft Drink (Large)': {
    en: 'Soft Drink (Large)',
    ar: 'مشروب غازي (كبير)',
    ur: 'کولڈ ڈرنک (بڑی)',
  },
  'Soft Drink (Regular)': {
    en: 'Soft Drink (Regular)',
    ar: 'مشروب غازي (عادي)',
    ur: 'کولڈ ڈرنک (ریگولر)',
  },
  'Soft Drink (Reg)': {
    en: 'Soft Drink (Reg)',
    ar: 'مشروب غازي (عادي)',
    ur: 'کولڈ ڈرنک (ریگولر)',
  },
  'Milkshake': {
    en: 'Milkshake',
    ar: 'ميلك شيك',
    ur: 'ملک شیک',
  },
  'Fresh Juice': {
    en: 'Fresh Juice',
    ar: 'عصير طازج',
    ur: 'تازہ جوس',
  },
  'Mineral Water': {
    en: 'Mineral Water',
    ar: 'مياه معدنية',
    ur: 'منرل واٹر',
  },
  'Classic Beef Burger': {
    en: 'Classic Beef Burger',
    ar: 'برغر لحم كلاسيك',
    ur: 'کلاسک بیف برگر',
  },
  'Chicken Wings (6pc)': {
    en: 'Chicken Wings (6pc)',
    ar: 'أجنحة دجاج (٦ قطع)',
    ur: 'چکن ونگز (6 عدد)',
  },
  'Chicken Wings (12pc)': {
    en: 'Chicken Wings (12pc)',
    ar: 'أجنحة دجاج (١٢ قطعة)',
    ur: 'چکن ونگز (12 عدد)',
  },
  'Loaded Fries': {
    en: 'Loaded Fries',
    ar: 'بطاطس مقلية بالجبنة',
    ur: 'لوڈڈ فرائز',
  },
  'Sweet Potato Fries': {
    en: 'Sweet Potato Fries',
    ar: 'بطاطس حلوة مقلية',
    ur: 'میٹھے آلو کے فرائز',
  },
  'Iced Tea': {
    en: 'Iced Tea',
    ar: 'شاي مثلج',
    ur: 'آئسڈ ٹی',
  },
  'Lemonade': {
    en: 'Lemonade',
    ar: 'عصير ليموناضة',
    ur: 'لیمونیڈ',
  },
};

/**
 * Returns localized name for a product or deal
 */
export function getLocalizedItemName(
  item: { name: string; nameAr?: string; nameUr?: string } | undefined | null,
  lang: LanguageCode = 'en'
): string {
  if (!item || !item.name) return '';
  
  // 1. Direct database multilingual override (Dynamic Add/Update/Delete support)
  if (lang === 'ar' && item.nameAr) return item.nameAr;
  if (lang === 'ur' && item.nameUr) return item.nameUr;

  // 2. Direct dictionary lookup
  const cleanName = item.name.trim();
  const directMatch = PRODUCT_TRANSLATIONS[cleanName];
  if (directMatch && directMatch[lang]) {
    return directMatch[lang];
  }

  // 3. Case-insensitive dictionary lookup
  const lowerName = cleanName.toLowerCase();
  const foundKey = Object.keys(PRODUCT_TRANSLATIONS).find((k) => k.toLowerCase() === lowerName);
  if (foundKey && PRODUCT_TRANSLATIONS[foundKey][lang]) {
    return PRODUCT_TRANSLATIONS[foundKey][lang];
  }

  // 4. Fallback to base name (for newly added custom products)
  return item.name;
}

/**
 * Returns localized category title
 */
export function getLocalizedCategoryName(categoryKey: string, lang: LanguageCode = 'en'): string {
  const lower = (categoryKey || '').toLowerCase();
  const match = CATEGORY_TRANSLATIONS[lower];
  if (match && match[lang]) {
    return match[lang];
  }
  return categoryKey;
}
