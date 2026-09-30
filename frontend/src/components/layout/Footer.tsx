import React from 'react';
import { Link } from 'react-router-dom';
import { Container } from './Container';
import { useLanguage } from '../../context/LanguageContext';

export const Footer: React.FC = () => {
  const { t } = useLanguage();

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
                  {t('footer.aboutTitle')}
                </span>
                <span className="text-xs text-orange-400 font-semibold">
                  {t('footer.established')}
                </span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-stone-400 leading-relaxed max-w-md">
              {t('footer.aboutText')}
            </p>
            <div className="pt-1 text-xs text-stone-500 font-mono">
              Mahaveer Youth Club Banza, Banza, Jajpur, Odisha, India
            </div>
          </div>

          {/* 2. Public Navigation */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-200 mb-3">
              {t('footer.explore')}
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="text-stone-400 hover:text-white transition-colors">
                  {t('nav.home')}
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-stone-400 hover:text-white transition-colors">
                  {t('nav.about')}
                </Link>
              </li>
              <li>
                <Link to="/history" className="text-stone-400 hover:text-white transition-colors">
                  {t('nav.history')}
                </Link>
              </li>
              <li>
                <Link to="/members" className="text-stone-400 hover:text-white transition-colors">
                  {t('nav.members')}
                </Link>
              </li>
              <li>
                <Link to="/celebrations" className="text-stone-400 hover:text-white transition-colors">
                  {t('nav.celebrations')}
                </Link>
              </li>
              <li>
                <Link to="/activities" className="text-stone-400 hover:text-white transition-colors">
                  {t('nav.activities')}
                </Link>
              </li>
              <li>
                <Link to="/updates" className="text-stone-400 hover:text-white transition-colors">
                  {t('nav.updates')}
                </Link>
              </li>
            </ul>
          </div>

          {/* 3. Seva & Contact Shortcuts */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-200 mb-3">
              {t('footer.sevaContact')}
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/donate" className="text-orange-400 hover:text-orange-300 font-semibold transition-colors">
                  {t('footer.donateLink')}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-stone-400 hover:text-white transition-colors">
                  {t('footer.contactLink')}
                </Link>
              </li>
              <li>
                <Link to="/admin" className="text-stone-500 hover:text-stone-400 transition-colors">
                  {t('footer.adminLink')}
                </Link>
              </li>
            </ul>
            <div className="mt-6 pt-4 border-t border-stone-800">
              <span className="inline-block px-2.5 py-1 rounded bg-stone-800 border border-stone-700 text-[11px] font-mono text-stone-400">
                {t('footer.version')}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="border-t border-stone-800/80 py-6 text-xs text-stone-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} Mahaveer Youth Club Banza. {t('footer.rights')}</p>
          <p className="text-[11px] text-stone-600 font-mono">
            Banza, Odisha • Since 2012
          </p>
        </div>
      </Container>
    </footer>
  );
};
