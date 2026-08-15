export const SHOW_DEMO_CREDENTIALS =
  import.meta.env.DEV || import.meta.env.VITE_SHOW_DEMO_CREDENTIALS === 'true';

/**
 * ⚠️ TEST CREDENTIALS ONLY (USERNAME BASED)
 * Use simple name-based usernames (e.g. admin, superadmin, cashier1, cashier2, tariq)
 */
export const LOCAL_DEV_CREDENTIALS = {
  admin: {
    label: 'Admin / SuperAdmin',
    username: 'admin',
    password: 'admin1234',
    pin: '1234',
  },
  pos: {
    label: 'Cashier Account',
    username: 'cashier1',
    password: 'cashier123',
    pin: '8591',
  },
  manager: {
    label: 'Manager (Tariq)',
    username: 'tariq',
    password: 'manager123',
    pin: '1234',
  },
} as const;

export const localDefault = (value: string) => (SHOW_DEMO_CREDENTIALS ? value : '');

