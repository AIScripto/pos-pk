import {
  Beef, Sandwich, Drumstick, Popcorn, CupSoda, Pizza,
  IceCreamCone, Salad, Utensils, Sparkles, LayoutGrid,
  type LucideIcon,
} from 'lucide-react';

/**
 * Category icons come from the icon set, not from emoji.
 *
 * Emoji render as different artwork on every OS these terminals run — Windows,
 * Android and iOS each ship their own — and they ignore `currentColor`, so they
 * stayed full-colour against a selected tab's inverted text. Drawn icons are one
 * weight, one size, and take the tab's own colour.
 *
 * This mapping used to be copy-pasted into both the product and the deal filter;
 * a new category added to one of them silently kept the fallback in the other.
 */
export function getIconForCategory(name: string): LucideIcon {
  const lower = name.toLowerCase();
  if (lower.includes('burger')) return Beef;
  if (lower.includes('wrap')) return Sandwich;
  if (lower.includes('chicken')) return Drumstick;
  if (lower.includes('fry') || lower.includes('fries')) return Popcorn;
  if (lower.includes('drink') || lower.includes('beverage')) return CupSoda;
  if (lower.includes('pizza')) return Pizza;
  if (lower.includes('dessert') || lower.includes('sweet')) return IceCreamCone;
  if (lower.includes('salad')) return Salad;
  return Utensils;
}

/** The two synthetic tabs that are not real categories. */
export const ALL_CATEGORIES_ICON: LucideIcon = LayoutGrid;
export const DEALS_ICON: LucideIcon = Sparkles;

export type { LucideIcon };
