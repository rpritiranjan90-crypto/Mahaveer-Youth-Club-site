import React, { useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { Button } from '../ui/Button';

export interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  links: Array<{ path: string; name: string }>;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose, links }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Mobile navigation">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#241A17]/60 backdrop-blur-xs transition-opacity animate-modal-backdrop"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={menuRef}
        className="fixed top-0 right-0 bottom-0 w-full max-w-xs bg-white shadow-2xl border-l border-[#E9DED1] flex flex-col z-10 animate-fade-in text-left overflow-y-auto"
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-[#F2E8DC] bg-[#FFF8EE] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xl" role="img" aria-label="Ganesh">🐘</span>
            <span className="font-extrabold text-sm text-[#241A17] tracking-tight uppercase">
              Mahaveer Youth Club
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="p-2 rounded-md text-[#6B625D] hover:text-[#241A17] hover:bg-[#F2E8DC] transition-colors focus-visible:ring-2 focus-visible:ring-[#F97316]"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Links List */}
        <div className="flex-1 px-4 py-6">
          <nav className="flex flex-col space-y-1.5" aria-label="Mobile page navigation">
            {links.map((link) => {
              const isDonate = link.path === '/donate';
              if (isDonate) return null; // Render donate separately below
              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `px-4 py-3 rounded-md text-sm font-semibold transition-colors flex items-center justify-between ${
                      isActive
                        ? 'bg-[#FFEDD5] text-[#C2410C] font-bold border-l-4 border-[#F97316]'
                        : 'text-[#241A17] hover:bg-[#FBF4EA] hover:text-[#F97316]'
                    }`
                  }
                >
                  <span>{link.name}</span>
                  <svg className="w-4 h-4 text-[#8C827C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </NavLink>
              );
            })}
          </nav>

          <div className="mt-6 pt-6 border-t border-[#F2E8DC]">
            <NavLink to="/donate" onClick={onClose} className="block w-full">
              <Button variant="primary" size="lg" fullWidth>
                Donate Now ❤️
              </Button>
            </NavLink>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-[#F2E8DC] bg-[#FFF8EE] text-center text-xs text-[#6B625D]">
          <p className="font-semibold text-[#8B1E1E]">Ganpati Bappa Morya</p>
          <p className="mt-0.5 text-[11px] text-[#8C827C]">Traditional Indian Festival × Modern Minimal</p>
        </div>
      </div>
    </div>
  );
};
