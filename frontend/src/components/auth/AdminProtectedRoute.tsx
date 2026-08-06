// =============================================================================
// AdminProtectedRoute — requires org_admin / city_manager / super_admin.
// Branch managers are redirected to /manager instead.
// =============================================================================

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Loader2, ShieldX } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';

// Only org-level roles reach the admin back-office
const ADMIN_ROLES    = ['super_admin', 'org_admin', 'admin', 'city_manager'];
const MANAGER_ROLES  = ['branch_manager', 'manager'];

interface Props { children: React.ReactNode }

export default function AdminProtectedRoute({ children }: Props) {
  const { isLoggedIn, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  const role = user?.role ?? '';

  // Branch managers belong in the Manager Operations panel, not here
  if (MANAGER_ROLES.includes(role)) {
    return <Navigate to="/manager" replace />;
  }

  if (!ADMIN_ROLES.includes(role)) {
    return <AccessDenied reason="The Admin panel is for organisation administrators only." />;
  }

  return <AdminLayout>{children}</AdminLayout>;
}

function AccessDenied({ reason }: { reason: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 p-8 text-center">
      <ShieldX className="h-16 w-16 text-red-400" />
      <h1 className="text-2xl font-bold text-gray-800">Access Denied</h1>
      <p className="max-w-sm text-gray-500">{reason}</p>
      <a href="/" className="text-sm text-orange-500 underline">← Go back</a>
    </div>
  );
}
