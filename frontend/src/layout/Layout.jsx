import { useMemo, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BrandLogoLink from '../components/BrandLogoLink';

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: '▦' },
  { to: '/imei-check', label: 'IMEI Check', icon: '🔍' },
  { to: '/add-funds', label: 'Add Funds', icon: '💳' },
  { to: '/orders', label: 'Order History', icon: '📋' },
  { to: '/invoices', label: 'Invoices', icon: '🧾' },
  { to: '/api-access', label: 'API Access', icon: '🔑' },
  { to: '/profile', label: 'Profile', icon: '👤' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isAdmin = user?.user_type === 'admin' || user?.user_type === 'superadmin';
  const isSuperAdmin = user?.user_type === 'superadmin';

  const navItems = useMemo(() => {
    const items = [...NAV];

    if (isAdmin) {
      items.splice(1, 0, { to: '/admin/services', label: 'Services', icon: '🧩' });
    }

    if (isSuperAdmin) {
      items.splice(1, 0, { to: '/admin/invoices', label: 'All Invoices', icon: '🗂' });
      items.splice(1, 0, { to: '/admin/users', label: 'Users', icon: '🛠' });
    }

    return items;
  }, [isAdmin, isSuperAdmin]);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed z-30 inset-y-0 left-0 w-64 flex flex-col bg-slate-900 border-r border-slate-800 transform transition-transform duration-200 md:static md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand */}
        <div className="px-5 py-4 border-b border-slate-800">
          <BrandLogoLink className="inline-flex items-center" imageClassName="h-8 w-auto" fallbackClassName="text-lg font-bold tracking-tight text-white" />
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {navItems.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <span className="text-base leading-none">{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div className="px-4 py-4 border-t border-slate-800 space-y-1">
          <p className="text-xs text-slate-400 truncate">{user?.email}</p>
          <p className="text-xs text-slate-500 uppercase tracking-wide">{user?.user_type || 'user'}</p>
          <p className="text-sm font-semibold text-emerald-400">
            Balance: ${Number(user?.balance ?? 0).toFixed(2)}
          </p>
          <button
            onClick={handleLogout}
            className="mt-2 w-full text-left text-xs text-rose-400 hover:text-rose-300"
          >
            Logout →
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800 md:hidden">
          <BrandLogoLink className="inline-flex items-center" imageClassName="h-7 w-auto" fallbackClassName="font-bold text-white" />
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-slate-300 hover:text-white"
          >
            ☰
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
