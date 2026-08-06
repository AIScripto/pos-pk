// =============================================================================
// ProtectedRoute — redirect to /login if not authenticated
//                — show 403 if missing required role or permission
// =============================================================================

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth }               from '@/context/AuthContext';
import { Loader2, ShieldX }      from 'lucide-react';

interface Props {
  children:       React.ReactNode;
  /** Minimum role required to access this route */
  minRole?:       string;
  /** Specific permission required to access this route */
  permission?:    string;
  /** POS billing requires a terminal-bound PIN login */
  requireTerminal?: boolean;
}

export default function ProtectedRoute({ children, minRole, permission, requireTerminal }: Props) {
  const { isLoggedIn, isLoading, user, hasRole, can } = useAuth();
  const location = useLocation();

  // Still checking localStorage / server
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  // Not logged in → redirect to login, remember where they were
  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Logged in but missing required role
  if (minRole && !hasRole(minRole)) {
    return <AccessDenied reason={`Requires role: ${minRole} or above`} />;
  }

  // Logged in but missing required permission
  if (permission && !can(permission)) {
    return <AccessDenied reason={`Missing permission: ${permission}`} />;
  }

  if (requireTerminal && !user?.terminalId) {
    return <AccessDenied reason="POS billing requires branch terminal PIN login. Admin login is for configuration only." />;
  }

  return <>{children}</>;
}

// ── 403 screen ────────────────────────────────────────────────────────────────

function AccessDenied({ reason }: { reason: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50 text-center p-8">
      <ShieldX className="w-16 h-16 text-red-400" />
      <h1 className="text-2xl font-bold text-gray-800">Access Denied</h1>
      <p className="text-gray-500 max-w-sm">{reason}</p>
      <a href="/" className="text-orange-500 underline text-sm">← Go back</a>
    </div>
  );
}
