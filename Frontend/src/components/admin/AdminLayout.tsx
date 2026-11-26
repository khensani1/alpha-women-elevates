import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Image,
  Newspaper,
  LogOut,
  LayoutDashboard,
  ShoppingBag,
  Truck,
  Users,
} from 'lucide-react';
import { normalizeRole } from '../ProtectedRoute';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const role = normalizeRole(localStorage.getItem('awe_role'));
  const isSuper = role === 'super_admin';
  const isMarketing = role === 'marketing' || isSuper;

  const handleLogout = () => {
    localStorage.removeItem('awe_token');
    localStorage.removeItem('awe_role');
    navigate('/admin/login');
  };

  const linkClass = (path: string) => {
    const active = location.pathname === path;
    return `flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider rounded transition-colors ${
      active
        ? 'bg-pink-200/80 text-pink-950'
        : 'text-pink-800 hover:text-pink-950 hover:bg-pink-200/60'
    }`;
  };

  return (
    <div className="flex min-h-screen bg-pink-50 text-neutral-800">
      <aside className="w-64 bg-pink-100 border-r border-pink-200 flex flex-col justify-between fixed h-full">
        <div>
          <div className="h-20 flex flex-col justify-center px-6 border-b border-pink-200">
            <span className="font-serif text-lg font-bold tracking-wider text-pink-900 leading-tight">
              Alpha Women Elevates Control Hub
            </span>
            <span className="text-[9px] uppercase tracking-[0.2em] text-pink-700 font-bold mt-1">
              {isSuper ? 'Super Admin' : 'Marketing Studio'}
            </span>
          </div>

          <nav className="p-4 space-y-2">
            {isSuper && (
              <>
                <Link to="/admin/dashboard" className={linkClass('/admin/dashboard')}>
                  <LayoutDashboard size={16} />
                  CRM Dashboard
                </Link>
                <Link to="/admin/tracking" className={linkClass('/admin/tracking')}>
                  <Truck size={16} />
                  Tracking
                </Link>
                <Link to="/admin/members" className={linkClass('/admin/members')}>
                  <Users size={16} />
                  Members
                </Link>
              </>
            )}

            {isMarketing && (
              <>
                {isSuper && (
                  <p className="px-4 pt-4 pb-1 text-[9px] uppercase tracking-[0.2em] text-pink-600 font-bold">
                    Content (full access)
                  </p>
                )}
                <Link to="/admin/gallery" className={linkClass('/admin/gallery')}>
                  <Image size={16} />
                  Manage Gallery
                </Link>
                <Link to="/admin/shop" className={linkClass('/admin/shop')}>
                  <ShoppingBag size={16} />
                  Shop
                </Link>
                <Link to="/admin/community" className={linkClass('/admin/community')}>
                  <Newspaper size={16} />
                  Manage Community
                </Link>
              </>
            )}
          </nav>
        </div>

        <div className="p-4 border-t border-pink-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider text-red-600 hover:text-red-700 hover:bg-red-100/50 transition-colors rounded cursor-pointer"
          >
            <LogOut size={16} />
            Exit Studio
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-64 p-10 min-h-screen bg-pink-50">{children}</main>
    </div>
  );
}
