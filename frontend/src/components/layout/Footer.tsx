import React from 'react';
import { Link } from 'react-router-dom';
import { Container } from './Container';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-[#E9DED1] text-[#241A17] pt-12 pb-8">
      <Container size="lg">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12 text-left">
          {/* Col 1: About Club */}
          <div className="flex flex-col space-y-3">
            <div className="flex items-center space-x-2">
              <span className="text-2xl" role="img" aria-label="Ganesh">🐘</span>
              <span className="font-extrabold text-base text-[#241A17] tracking-tight">
                MAHAVEER YOUTH CLUB
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#6B625D] leading-relaxed">
              Celebrating faith, tradition, and youth community welfare since 1998. Dedicated to cultural preservation, annual Ganesh Utsav, and social service.
            </p>
            <div className="pt-2 flex items-center space-x-3 text-[#8B1E1E]">
              <span className="text-xs font-semibold bg-[#FEE2E2] px-2.5 py-1 rounded-full border border-[#FCA5A5]">
                Ganpati Bappa Morya 🙏
              </span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-[#241A17] tracking-wider uppercase mb-3">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-[#6B625D]">
              <li>
                <Link to="/" className="hover:text-[#F97316] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-[#F97316] transition-colors">
                  About Our Club
                </Link>
              </li>
              <li>
                <Link to="/history" className="hover:text-[#F97316] transition-colors">
                  Our History & Milestones
                </Link>
              </li>
              <li>
                <Link to="/puja" className="hover:text-[#F97316] transition-colors">
                  Puja & Activities
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="hover:text-[#F97316] transition-colors">
                  Photo & Video Gallery
                </Link>
              </li>
              <li>
                <Link to="/updates" className="hover:text-[#F97316] transition-colors">
                  Latest Updates & Notices
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Support & Contact Placeholders */}
          <div>
            <h4 className="text-sm font-bold text-[#241A17] tracking-wider uppercase mb-3">
              Contact & Location
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-[#6B625D]">
              <li className="flex items-start space-x-2">
                <span className="text-[#F97316] mt-0.5">📍</span>
                <span>Club Address Placeholder, Ward No. 12, Main Pandal Ground, India</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-[#F97316]">📞</span>
                <span>+91 XXXXX XXXXX</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-[#F97316]">✉️</span>
                <span>club@example.com</span>
              </li>
              <li className="pt-2">
                <Link
                  to="/donate"
                  className="inline-flex items-center text-xs font-bold text-[#F97316] hover:underline"
                >
                  Contribute Online (UPI QR) →
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Community & Social Links */}
          <div>
            <h4 className="text-sm font-bold text-[#241A17] tracking-wider uppercase mb-3">
              Community Channels
            </h4>
            <p className="text-xs text-[#6B625D] mb-3">
              Stay connected with live festival broadcasts and event highlights:
            </p>
            <div className="flex flex-wrap gap-2">
              <a
                href="#instagram-placeholder"
                className="px-3 py-1.5 rounded-md text-xs font-medium bg-[#FBF4EA] hover:bg-[#FFEDD5] text-[#241A17] hover:text-[#F97316] border border-[#E9DED1] transition-colors"
              >
                📷 Instagram
              </a>
              <a
                href="#facebook-placeholder"
                className="px-3 py-1.5 rounded-md text-xs font-medium bg-[#FBF4EA] hover:bg-[#FFEDD5] text-[#241A17] hover:text-[#F97316] border border-[#E9DED1] transition-colors"
              >
                👥 Facebook
              </a>
              <a
                href="#youtube-placeholder"
                className="px-3 py-1.5 rounded-md text-xs font-medium bg-[#FBF4EA] hover:bg-[#FFEDD5] text-[#241A17] hover:text-[#F97316] border border-[#E9DED1] transition-colors"
              >
                ▶️ YouTube Live
              </a>
            </div>
          </div>
        </div>

        {/* Copyright & Disclaimer */}
        <div className="pt-8 border-t border-[#F2E8DC] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6B625D]">
          <p>© 2026 Ganesh Puja Club — Mahaveer Youth Club. All rights reserved.</p>
          <p className="text-[11px] text-[#8C827C]">
            Phase 2 Design System & UI Foundation • Traditional Indian Festival × Modern Minimal
          </p>
        </div>
      </Container>
    </footer>
  );
};
