import { Link, useNavigate } from 'react-router-dom';
import { Image, Newspaper, LogOut, LayoutDashboard } from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    // For now, clear credentials and boot to login
    localStorage.removeItem('awe_token');
    localStorage.removeItem('awe_role');
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-neutral-900 text-neutral-100">
      {/* VERTICAL SIDEBAR */}
      <aside className="w-64 bg-neutral-950 border-r border-neutral-800 flex flex-col justify-between fixed h-full">
        <div>
          {/* Dashboard Header */}
          <div className="h-20 flex items-center px-6 border-b border-neutral-800">
            <span className="font-serif text-lg font-bold tracking-wider text-brand-indigo">
              AWE Control Hub
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-2">
            <Link
              to="/admin/dashboard"
              className="flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors rounded"
            >
              <LayoutDashboard size={16} />
              Overview
            </Link>
            <Link
              to="/admin/gallery"
              className="flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors rounded"
            >
              <Image size={16} />
              Manage Gallery
            </Link>
            <Link
              to="/admin/community"
              className="flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors rounded"
            >
              <Newspaper size={16} />
              Manage Community
            </Link>
          </nav>
        </div>

        {/* Logout Action Area */}
        <div className="p-4 border-t border-neutral-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider text-red-400 hover:text-red-300 hover:bg-red-950/30 transition-colors rounded cursor-pointer"
          >
            <LogOut size={16} />
            Exit Studio
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT PANELS CONTAINER */}
      <main className="flex-1 ml-64 p-10 min-h-screen bg-neutral-900">
        {children}
      </main>
    </div>
  );
}