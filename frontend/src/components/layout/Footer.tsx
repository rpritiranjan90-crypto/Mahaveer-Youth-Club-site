import React from 'react';
import { Link } from 'react-router-dom';
import { Container } from './Container';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-stone-900 text-stone-300 mt-auto border-t border-stone-800 text-left">
      <Container size="lg">
        <div className="py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* 1. Organization Information */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center space-x-3">
              <span
                className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center font-black text-base shadow-sm"
                aria-hidden="true"
              >
                MYC
              </span>
              <div>
                <span className="text-white font-bold text-lg tracking-tight block">
                  Mahaveer Youth Club Banza
                </span>
                <span className="text-xs text-orange-400 font-semibold">
                  Established 2012
                </span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-stone-400 leading-relaxed max-w-md">
              A grassroots community organization in Banza committed to devotional celebrations of Ganesh Chaturthi, youth unity, and neighborhood welfare seva.
            </p>
            <div className="pt-1 text-xs text-stone-500 font-mono">
              [OFFICIAL ADDRESS — TO BE PROVIDED]
            </div>
          </div>

          {/* 2. Public Navigation */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-200 mb-3">
              Explore Website
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="text-stone-400 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-stone-400 hover:text-white transition-colors">
                  About the Club
                </Link>
              </li>
              <li>
                <Link to="/history" className="text-stone-400 hover:text-white transition-colors">
                  History & Chronicle
                </Link>
              </li>
              <li>
                <Link to="/members" className="text-stone-400 hover:text-white transition-colors">
                  Our Members
                </Link>
              </li>
              <li>
                <Link to="/celebrations" className="text-stone-400 hover:text-white transition-colors">
                  Celebrations & Gallery
                </Link>
              </li>
              <li>
                <Link to="/activities" className="text-stone-400 hover:text-white transition-colors">
                  Community Activities
                </Link>
              </li>
              <li>
                <Link to="/updates" className="text-stone-400 hover:text-white transition-colors">
                  Updates & Bulletins
                </Link>
              </li>
            </ul>
          </div>

          {/* 3. Seva & Contact Shortcuts */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-200 mb-3">
              Seva & Contact
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/donate" className="text-orange-400 hover:text-orange-300 font-semibold transition-colors">
                  Donation & Seva Info →
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-stone-400 hover:text-white transition-colors">
                  Contact Committee
                </Link>
              </li>
              <li>
                <Link to="/admin" className="text-stone-500 hover:text-stone-400 transition-colors">
                  Admin Portal (Phase 1 Shell)
                </Link>
              </li>
            </ul>
            <div className="mt-6 pt-4 border-t border-stone-800">
              <span className="inline-block px-2.5 py-1 rounded bg-stone-800 border border-stone-700 text-[11px] font-mono text-stone-400">
                Community Portal V2
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="border-t border-stone-800/80 py-6 text-xs text-stone-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} Mahaveer Youth Club Banza. All rights reserved.</p>
          <p className="text-[11px] text-stone-600">
            Phase 2: Public Website Experience
          </p>
        </div>
      </Container>
    </footer>
  );
};
