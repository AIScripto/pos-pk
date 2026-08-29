// =============================================================================
// ManagerProtectedRoute — requires role >= branch_manager.
// Wraps content in ManagerLayout.
// =============================================================================

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Loader2, ShieldX } from 'lucide-react';
import ManagerLayout from '@/components/layout/ManagerLayout';

const MANAGER_ROLES = ['super_admin', 'org_admin', 'admin', 'city_manager', 'branch_manager', 'manager'];

interface Props { children: React.ReactNode }

export default function ManagerProtectedRoute({ children }: Props) {
  const { isLoggedIn, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40">
        <Loader2 className="h-8 w-8 animate-spin text-warning" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!MANAGER_ROLES.includes(user?.role ?? '')) {
    return <AccessDenied />;
  }

  return <ManagerLayout>{children}</ManagerLayout>;
}

function AccessDenied() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-muted/40 p-8 text-center">
      <ShieldX className="h-16 w-16 text-danger" />
      <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
      <p className="max-w-sm text-muted-foreground">
        The Manager Operations panel requires a manager role or above.
      </p>
      <a href="/" className="text-sm text-warning underline">← Go to POS</a>
    </div>
  );
}
