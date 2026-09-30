import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Container } from './Container';
import { NavRoute } from '../../types';

export const PUBLIC_NAV_ROUTES: NavRoute[] = [
  { name: 'Home', path: '/' },
  { name: 'About', path: '/about' },
  { name: 'History', path: '/history' },
  { name: 'Members', path: '/members' },
  { name: 'Celebrations', path: '/celebrations' },
  { name: 'Activities', path: '/activities' },
  { name: 'Updates', path: '/updates' },
  { name: 'Donate', path: '/donate' },
  { name: 'Contact', path: '/contact' },
];

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen((prev) => !prev);
  const closeMenu = () => setIsOpen(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xs border-b border-stone-200">
      {/* Skip to Content for Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-orange-600 focus:text-white focus:rounded-md focus:shadow-md"
      >
        Skip to main content
      </a>

      <Container size="lg">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand Logo & Name */}
          <Link
            to="/"
            onClick={closeMenu}
            className="flex items-center space-x-3 group focus-visible:outline-none"
          >
            <span
              className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center font-black text-lg shadow-sm group-hover:bg-orange-700 transition-colors"
              aria-hidden="true"
            >
              MYC
            </span>
            <div className="flex flex-col text-left">
              <span className="font-bold text-base sm:text-lg text-stone-900 leading-tight">
                Mahaveer Youth Club
              </span>
              <span className="text-xs text-orange-700 font-semibold tracking-wider">
                Banza
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav
            aria-label="Main Navigation"
            className="hidden xl:flex items-center space-x-1"
          >
            {PUBLIC_NAV_ROUTES.map((route) => (
              <NavLink
                key={route.path}
                to={route.path}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-orange-50 text-orange-700 font-bold border border-orange-200/60'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                  }`
                }
              >
                {route.name}
              </NavLink>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex xl:hidden items-center space-x-2">
            <button
              type="button"
              onClick={toggleMenu}
              aria-expanded={isOpen}
              aria-controls="mobile-navigation"
              aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
              className="p-2 rounded-lg text-stone-700 hover:bg-stone-100 focus-visible:ring-2 focus-visible:ring-orange-500"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                {isOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </Container>

      {/* Mobile Dropdown Navigation */}
      {isOpen && (
        <nav
          id="mobile-navigation"
          aria-label="Mobile Navigation"
          className="xl:hidden bg-white border-b border-stone-200 py-3 px-4 shadow-lg animate-in fade-in duration-150"
        >
          <div className="flex flex-col space-y-1">
            {PUBLIC_NAV_ROUTES.map((route) => (
              <NavLink
                key={route.path}
                to={route.path}
                onClick={closeMenu}
                className={({ isActive }) =>
                  `px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors text-left ${
                    isActive
                      ? 'bg-orange-50 text-orange-700 font-bold border border-orange-200'
                      : 'text-stone-700 hover:bg-stone-100'
                  }`
                }
              >
                {route.name}
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
};
