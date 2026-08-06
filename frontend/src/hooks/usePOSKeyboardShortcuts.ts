import { useEffect } from 'react';

interface POSKeyboardShortcutHandlers {
  onToggleCart: () => void;
  onToggleHeld: () => void;
  onToggleOrders: () => void;
  onToggleProducts: () => void;
  onToggleInvoices: () => void;
}

/**
 * usePOSKeyboardShortcuts Hook
 * 
 * Manages global function key shortcuts for POS operators:
 * - F1: Focus Search Input
 * - F2: Toggle Cart Panel
 * - F3: Toggle Held Orders Drawer
 * - F4: Toggle Active Orders Panel
 * - F5: Click Deals Category Button
 * - F6: Toggle Product Management Panel
 * - F7: Toggle Invoice History Drawer
 * - F12: Trigger Manager Operations Button
 * 
 * @hook
 */
export function usePOSKeyboardShortcuts({
  onToggleCart,
  onToggleHeld,
  onToggleOrders,
  onToggleProducts,
  onToggleInvoices,
}: POSKeyboardShortcutHandlers) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F1') {
        e.preventDefault();
        const searchInput = document.querySelector<HTMLInputElement>('input[placeholder*="Search"]');
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      } else if (e.key === 'F2') {
        e.preventDefault();
        onToggleCart();
      } else if (e.key === 'F3') {
        e.preventDefault();
        onToggleHeld();
      } else if (e.key === 'F4') {
        e.preventDefault();
        onToggleOrders();
      } else if (e.key === 'F5') {
        e.preventDefault();
        const dealsBtn = document.querySelector<HTMLButtonElement>('button[data-category="deals"]');
        if (dealsBtn) dealsBtn.click();
      } else if (e.key === 'F6') {
        e.preventDefault();
        onToggleProducts();
      } else if (e.key === 'F7') {
        e.preventDefault();
        onToggleInvoices();
      } else if (e.key === 'F12') {
        e.preventDefault();
        const managerBtn = document.querySelector<HTMLButtonElement>('button[data-manager-btn="true"]');
        if (managerBtn) managerBtn.click();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onToggleCart, onToggleHeld, onToggleOrders, onToggleProducts, onToggleInvoices]);
}
