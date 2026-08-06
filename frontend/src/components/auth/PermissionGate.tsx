// =============================================================================
// PermissionGate — show/hide UI elements based on permission or role
// Usage:
//   <PermissionGate permission="invoice.void">
//     <VoidButton />
//   </PermissionGate>
//
//   <PermissionGate minRole="branch_manager" fallback={<p>No access</p>}>
//     <ReportsPanel />
//   </PermissionGate>
// =============================================================================

import { useAuth } from '@/context/AuthContext';

interface Props {
  children:    React.ReactNode;
  /** Specific permission required */
  permission?: string;
  /** Minimum role required */
  minRole?:    string;
  /** What to render when access is denied (default: nothing) */
  fallback?:   React.ReactNode;
}

export default function PermissionGate({ children, permission, minRole, fallback = null }: Props) {
  const { can, hasRole } = useAuth();

  const allowed =
    (!permission || can(permission)) &&
    (!minRole    || hasRole(minRole));

  return <>{allowed ? children : fallback}</>;
}
