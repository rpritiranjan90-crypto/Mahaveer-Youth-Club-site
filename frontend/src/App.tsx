import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { PlaceholderPage } from './components/PlaceholderPage';
import { HealthStatus, NavRoute } from './types';

const routes: NavRoute[] = [
  { path: '/', name: 'Home' },
  { path: '/about', name: 'About' },
  { path: '/history', name: 'History' },
  { path: '/puja', name: 'Puja' },
  { path: '/gallery', name: 'Gallery' },
  { path: '/updates', name: 'Updates' },
  { path: '/donate', name: 'Donate' },
  { path: '/contact', name: 'Contact' },
];

export const App: React.FC = () => {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [healthError, setHealthError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/v1/health')
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        return res.json();
      })
      .then((data: HealthStatus) => {
        setHealth(data);
        setHealthError(null);
      })
      .catch((err: Error) => {
        setHealthError(err.message);
      });
  }, []);

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans">
        {/* Foundation Header */}
        <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <span className="text-xl font-bold tracking-tight text-amber-400">
              Mahaveer Youth Club
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
              Phase 1 Foundation
            </span>
          </div>

          {/* Backend Status Indicator */}
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-400">Backend API:</span>
            {health ? (
              <span className="inline-flex items-center text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>
                Connected ({health.service} v{health.version})
              </span>
            ) : healthError ? (
              <span className="inline-flex items-center text-amber-400 bg-amber-950/60 border border-amber-800 px-2 py-0.5 rounded">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mr-1.5"></span>
                API Standby ({healthError})
              </span>
            ) : (
              <span className="text-slate-500">Checking...</span>
            )}
          </div>
        </header>

        {/* Development Navigation Bar */}
        <nav className="border-b border-slate-800/80 bg-slate-900/40 px-6 py-2 overflow-x-auto">
          <ul className="flex items-center space-x-1 sm:space-x-2">
            {routes.map((route) => (
              <li key={route.path}>
                <NavLink
                  to={route.path}
                  end={route.path === '/'}
                  className={({ isActive }) =>
                    `px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`
                  }
                >
                  {route.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Route Viewport */}
        <main className="flex-1 flex items-center justify-center p-6">
          <Routes>
            <Route path="/" element={<PlaceholderPage title="Home" routePath="/" />} />
            <Route path="/about" element={<PlaceholderPage title="About / Our Story" routePath="/about" />} />
            <Route path="/history" element={<PlaceholderPage title="Our History" routePath="/history" />} />
            <Route path="/puja" element={<PlaceholderPage title="Puja & Activities" routePath="/puja" />} />
            <Route path="/gallery" element={<PlaceholderPage title="Gallery" routePath="/gallery" />} />
            <Route path="/updates" element={<PlaceholderPage title="Updates & Announcements" routePath="/updates" />} />
            <Route path="/donate" element={<PlaceholderPage title="Donation / Chanda" routePath="/donate" />} />
            <Route path="/contact" element={<PlaceholderPage title="Contact Us" routePath="/contact" />} />
            <Route
              path="*"
              element={
                <div className="text-center p-8">
                  <h2 className="text-2xl font-bold text-red-400 mb-2">404 - Not Found</h2>
                  <p className="text-sm text-slate-400">The requested page route does not exist.</p>
                </div>
              }
            />
          </Routes>
        </main>

        {/* Minimal Footer */}
        <footer className="border-t border-slate-800/80 bg-slate-950 px-6 py-3 text-center text-xs text-slate-500">
          Mahaveer Youth Club — Phase 1 Technical Foundation Ready. Phase 2 UI Design Pending.
        </footer>
      </div>
    </BrowserRouter>
  );
};

export default App;
