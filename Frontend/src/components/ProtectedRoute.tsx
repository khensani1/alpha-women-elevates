import { Navigate, Outlet } from 'react-router-dom';

export function ProtectedRoute() {
  const token = localStorage.getItem('awe_token');
  const userRole = localStorage.getItem('awe_role'); 

  // 🔄 FIX: Change "/login" to "/admin/login" to match your App.tsx routes
  if (!token || userRole !== 'admin') {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}