import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Container } from './Container';
import { Button } from '../ui/Button';
import { MobileMenu } from './MobileMenu';

export interface NavItem {
  path: string;
  name: string;
}

export const navLinks: NavItem[] = [
  { path: '/', name: 'Home' },
  { path: '/about', name: 'About' },
  { path: '/history', name: 'History' },
  { path: '/puja', name: 'Puja' },
  { path: '/gallery', name: 'Gallery' },
  { path: '/updates', name: 'Updates' },
  { path: '/donate', name: 'Donate' },
  { path: '/contact', name: 'Contact' },
];

export const Navbar: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-[#E9DED1] shadow-2xs">
        <Container size="lg">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Brand Logo */}
            <Link
              to="/"
              className="flex items-center space-x-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316] rounded-md p-1"
            >
              <div className="w-10 h-10 rounded-full bg-[#FFEDD5] border border-[#FDBA74] flex items-center justify-center text-xl shadow-2xs group-hover:scale-105 transition-transform">
                <span role="img" aria-label="Ganesha">🐘</span>
              </div>
              <div className="flex flex-col text-left">
                <span className="font-extrabold text-sm sm:text-base text-[#241A17] tracking-tight leading-tight group-hover:text-[#F97316] transition-colors">
                  MAHAVEER YOUTH CLUB
                </span>
                <span className="text-[10px] sm:text-xs font-semibold text-[#8B1E1E] tracking-wider uppercase">
                  Ganesh Utsav • Seva • Sanskriti
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2" aria-label="Main navigation">
              {navLinks.map((link) => {
                const isDonate = link.path === '/donate';

                if (isDonate) {
                  return (
                    <NavLink key={link.path} to="/donate" className="ml-2">
                      <Button variant="primary" size="sm" className="font-bold shadow-xs">
                        Donate Now ❤️
                      </Button>
                    </NavLink>
                  );
                }

                return (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    end={link.path === '/'}
                    className={({ isActive }) =>
                      `px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                        isActive
                          ? 'text-[#F97316] bg-[#FFEDD5]/60 font-semibold'
                          : 'text-[#241A17] hover:text-[#F97316] hover:bg-[#FBF4EA]'
                      }`
                    }
                  >
                    {link.name}
                  </NavLink>
                );
              })}
            </nav>

            {/* Mobile Hamburger Button */}
            <div className="flex items-center lg:hidden space-x-2">
              <NavLink to="/donate">
                <Button variant="primary" size="sm" className="font-bold text-xs px-2.5 py-1">
                  Donate
                </Button>
              </NavLink>

              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                aria-label="Open navigation menu"
                aria-expanded={mobileOpen}
                className="p-2 rounded-md text-[#241A17] hover:bg-[#FBF4EA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316]"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </Container>
      </header>

      {/* Accessible Mobile Menu */}
      <MobileMenu
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        links={navLinks}
      />
    </>
  );
};
