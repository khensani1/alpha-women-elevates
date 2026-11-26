import { Navigate, Outlet } from 'react-router-dom';

export function normalizeRole(role: string | null) {
  if (!role) return null;
  if (role === 'admin') return 'marketing';
  return role;
}

export function ProtectedRoute() {
  const token = localStorage.getItem('awe_token');
  const role = normalizeRole(localStorage.getItem('awe_role'));

  if (!token || (role !== 'marketing' && role !== 'super_admin')) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}

/** Restrict route to specific roles. */
export function RoleRoute({ allow }: { allow: Array<'marketing' | 'super_admin'> }) {
  const token = localStorage.getItem('awe_token');
  const role = normalizeRole(localStorage.getItem('awe_role')) as
    | 'marketing'
    | 'super_admin'
    | null;

  if (!token || !role) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!allow.includes(role)) {
    const fallback = role === 'super_admin' ? '/admin/dashboard' : '/admin/gallery';
    return <Navigate to={fallback} replace />;
  }

  return <Outlet />;
}
