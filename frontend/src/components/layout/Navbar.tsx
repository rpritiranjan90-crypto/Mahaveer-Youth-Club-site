import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Container } from './Container';
import { useLanguage } from '../../context/LanguageContext';
import { useBrand } from '../../context/BrandContext';

export interface NavItemConfig {
  key: string;
  path: string;
}

export const NAV_ITEMS: NavItemConfig[] = [
  { key: 'nav.home', path: '/' },
  { key: 'nav.about', path: '/about' },
  { key: 'nav.history', path: '/history' },
  { key: 'nav.members', path: '/members' },
  { key: 'nav.celebrations', path: '/celebrations' },
  { key: 'nav.activities', path: '/activities' },
  { key: 'nav.updates', path: '/updates' },
  { key: 'nav.donate', path: '/donate' },
  { key: 'nav.contact', path: '/contact' },
];

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const { logo } = useBrand();

  const toggleMenu = () => setIsOpen((prev) => !prev);
  const closeMenu = () => setIsOpen(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xs border-b border-stone-200">
      {/* Skip to Content for Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-orange-600 focus:text-white focus:rounded-md focus:shadow-md"
      >
        {t('nav.skipToContent')}
      </a>

      <Container size="lg">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand Logo & Name */}
          <Link
            to="/"
            onClick={closeMenu}
            className="flex items-center space-x-3 group focus-visible:outline-hidden"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-full overflow-hidden flex items-center justify-center bg-white shadow-xs border border-orange-100 group-hover:scale-105 transition-transform">
              <img
                src={logo?.image_url || '/images/official_club_logo.png'}
                alt={t('brand.logoAlt')}
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  if (!target.src.endsWith('/images/official_club_logo.png')) {
                    target.src = '/images/official_club_logo.png';
                  }
                }}
                className="w-full h-full object-contain p-0.5"
              />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-bold text-base sm:text-lg text-stone-900 leading-tight">
                {t('nav.brandName')}
              </span>
              <span className="text-xs text-orange-700 font-semibold tracking-wider">
                {t('nav.brandLocation')}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links & Language Switcher */}
          <div className="hidden xl:flex items-center space-x-3">
            <nav
              aria-label="Main Navigation"
              className="flex items-center space-x-1"
            >
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      isActive
                        ? 'bg-orange-50 text-orange-700 font-bold border border-orange-200/60'
                        : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                    }`
                  }
                >
                  {t(item.key)}
                </NavLink>
              ))}
            </nav>

            {/* Language Toggle Control (Desktop) */}
            <div
              className="flex items-center border border-stone-300 rounded-lg p-0.5 bg-stone-50 text-xs font-semibold shadow-2xs"
              role="group"
              aria-label="Language selection"
            >
              <button
                type="button"
                onClick={() => setLanguage('en')}
                aria-pressed={language === 'en'}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  language === 'en'
                    ? 'bg-white text-orange-700 shadow-2xs font-bold border border-stone-200/80'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                English
              </button>
              <span className="text-stone-300 px-0.5 select-none" aria-hidden="true">|</span>
              <button
                type="button"
                onClick={() => setLanguage('or')}
                aria-pressed={language === 'or'}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  language === 'or'
                    ? 'bg-white text-orange-700 shadow-2xs font-bold border border-stone-200/80'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                ଓଡ଼ିଆ
              </button>
            </div>
          </div>

          {/* Mobile Right Controls: Language Switcher + Hamburger Menu Button */}
          <div className="flex xl:hidden items-center space-x-2">
            {/* Quick Language Toggle on Mobile Top Bar */}
            <div
              className="flex items-center border border-stone-200 rounded-lg p-0.5 bg-stone-50 text-xs font-semibold"
              role="group"
              aria-label="Language selection"
            >
              <button
                type="button"
                onClick={() => setLanguage('en')}
                aria-pressed={language === 'en'}
                className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  language === 'en'
                    ? 'bg-white text-orange-700 shadow-2xs'
                    : 'text-stone-500'
                }`}
              >
                EN
              </button>
              <span className="text-stone-300 select-none" aria-hidden="true">|</span>
              <button
                type="button"
                onClick={() => setLanguage('or')}
                aria-pressed={language === 'or'}
                className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  language === 'or'
                    ? 'bg-white text-orange-700 shadow-2xs'
                    : 'text-stone-500'
                }`}
              >
                ଓଡ଼ି
              </button>
            </div>

            <button
              type="button"
              onClick={toggleMenu}
              aria-expanded={isOpen}
              aria-controls="mobile-navigation"
              aria-label={isOpen ? t('nav.closeMenu') : t('nav.toggleMenu')}
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
          {/* Full Language Switcher in Mobile Drawer */}
          <div className="mb-3 p-2 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between">
            <span className="text-xs font-bold text-stone-600 uppercase tracking-wide">
              {t('nav.language')}:
            </span>
            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  language === 'en'
                    ? 'bg-orange-600 text-white font-bold shadow-2xs'
                    : 'bg-stone-200/80 text-stone-700'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLanguage('or')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  language === 'or'
                    ? 'bg-orange-600 text-white font-bold shadow-2xs'
                    : 'bg-stone-200/80 text-stone-700'
                }`}
              >
                ଓଡ଼ିଆ
              </button>
            </div>
          </div>

          <div className="flex flex-col space-y-1">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={closeMenu}
                className={({ isActive }) =>
                  `px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors text-left ${
                    isActive
                      ? 'bg-orange-50 text-orange-700 font-bold border border-orange-200'
                      : 'text-stone-700 hover:bg-stone-100'
                  }`
                }
              >
                {t(item.key)}
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
};
