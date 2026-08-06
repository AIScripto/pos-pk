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
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
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
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 p-8 text-center">
      <ShieldX className="h-16 w-16 text-red-400" />
      <h1 className="text-2xl font-bold text-slate-800">Access Denied</h1>
      <p className="max-w-sm text-slate-500">
        The Manager Operations panel requires a manager role or above.
      </p>
      <a href="/" className="text-sm text-orange-500 underline">← Go to POS</a>
    </div>
  );
}
