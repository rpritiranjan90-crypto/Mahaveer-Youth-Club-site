import React from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../admin/AuthContext';
import { Container } from '../components/layout/Container';
import { Button } from '../components/ui/Button';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login', { replace: true });
  };

  const navLinks = [
    { name: 'Dashboard', path: '/admin', end: true },
    { name: 'Updates', path: '/admin/updates' },
    { name: 'Activities', path: '/admin/activities' },
    { name: 'Gallery', path: '/admin/gallery' },
    { name: 'Members', path: '/admin/members' },
    { name: 'Security & 2FA', path: '/admin/security' },
    { name: 'Audit Logs', path: '/admin/audit-logs' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-stone-100 text-stone-900">
      {/* Admin Top Navigation */}
      <header className="bg-stone-900 text-white border-b border-stone-800 sticky top-0 z-30 shadow-sm">
        <Container size="lg">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Title */}
            <Link to="/admin" className="flex items-center space-x-3">
              <span className="w-8 h-8 rounded-lg bg-orange-600 text-white flex items-center justify-center font-black text-sm">
                MYC
              </span>
              <div className="flex flex-col">
                <span className="font-bold text-sm sm:text-base leading-tight">
                  Mahaveer Youth Club Banza
                </span>
                <span className="text-[11px] text-orange-400 font-semibold tracking-wider">
                  Admin Control Panel
                </span>
              </div>
            </Link>

            {/* Desktop Nav Links */}
            <nav className="hidden lg:flex items-center space-x-1" aria-label="Admin Navigation">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  end={link.end}
                  className={({ isActive }) =>
                    `px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      isActive
                        ? 'bg-stone-800 text-white border border-stone-700 font-bold'
                        : 'text-stone-400 hover:text-white hover:bg-stone-800/60'
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              ))}
            </nav>

            {/* User Session & Logout */}
            <div className="flex items-center space-x-3">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-medium text-stone-200">
                  {user?.email}
                </span>
                <span className="text-[10px] text-stone-400">
                  {user?.totp_enabled ? '🛡️ 2FA Active' : '⚠️ 2FA Disabled'}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-stone-300 hover:text-white hover:bg-stone-800 text-xs"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </Container>
      </header>

      {/* Sub-bar for navigation on small screens & Public link */}
      <div className="bg-stone-800/90 text-stone-300 py-2 border-b border-stone-700/60 overflow-x-auto">
        <Container size="lg">
          <div className="flex items-center justify-between text-xs min-w-max">
            <div className="flex lg:hidden items-center space-x-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  end={link.end}
                  className={({ isActive }) =>
                    `px-2.5 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap ${
                      isActive ? 'bg-stone-700 text-white' : 'text-stone-400 hover:text-white'
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              ))}
            </div>
            <Link
              to="/"
              className="text-stone-400 hover:text-white transition-colors ml-auto flex items-center gap-1 pl-4"
            >
              <span>← Public Website</span>
            </Link>
          </div>
        </Container>
      </div>

      {/* Main Admin Content */}
      <main className="flex-1 py-8">
        <Container size="lg">
          <Outlet />
        </Container>
      </main>

      {/* Footer */}
      <footer className="bg-stone-200 border-t border-stone-300 py-4 text-center text-xs text-stone-600">
        Mahaveer Youth Club Banza • Phase 4 Content Management System
      </footer>
    </div>
  );
};
