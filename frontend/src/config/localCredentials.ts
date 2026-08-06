export const SHOW_DEMO_CREDENTIALS =
  import.meta.env.DEV || import.meta.env.VITE_SHOW_DEMO_CREDENTIALS === 'true';

/**
 * ⚠️ TEST CREDENTIALS ONLY
 * These are hardcoded test passwords for development/testing only.
 * CRITICAL: Remove this file or move credentials to backend environment variables
 * before deploying to production.
 */
export const LOCAL_DEV_CREDENTIALS = {
  admin: {
    label: 'Admin panel',
    email: 'admin@aipos.pk',
    password: 'admin123',
    pin: '1234',
  },
  pos: {
    label: 'POS cashier PIN',
    email: 'cashier@aipos.pk',
    password: 'cashier123',
    pin: '8591',
  },
  manager: {
    label: 'Manager panels',
    email: 'manager@aipos.pk',
    password: 'manager123',
    pin: '1234',
  },
} as const;

export const localDefault = (value: string) => (SHOW_DEMO_CREDENTIALS ? value : '');
