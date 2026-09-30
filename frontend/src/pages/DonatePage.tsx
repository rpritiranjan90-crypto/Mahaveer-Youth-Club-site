import React, { useState } from 'react';
import { Container } from '../components/layout/Container';
import { Section } from '../components/layout/Section';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { SectionHeader } from '../components/content/SectionHeader';
import { usePageMeta } from '../hooks/usePageMeta';
import { useLanguage } from '../context/LanguageContext';

export const DonatePage: React.FC = () => {
  const { t } = useLanguage();
  const [copied, setCopied] = useState<boolean>(false);

  usePageMeta({
    title: 'Donation & Contributions — Mahaveer Youth Club Banza',
    description: 'Informational guide for voluntary contributions to Mahaveer Youth Club Banza Sri Ganesh Puja and welfare initiatives.',
  });

  const handleCopyUpiId = async () => {
    const upiId = t('donate.upi.idValue');
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(upiId);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = upiId;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div>
      {/* Page Header */}
      <section className="bg-gradient-to-b from-orange-50/50 to-[#FCFBF9] py-12 sm:py-16 border-b border-stone-200">
        <Container size="lg">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="saffron">{t('donate.badge.seva')}</Badge>
              <Badge variant="neutral">{t('donate.badge.voluntary')}</Badge>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-stone-900 tracking-tight mb-3">
              {t('donate.title')}
            </h1>
            <p className="text-base sm:text-lg text-stone-600 leading-relaxed">
              {t('donate.subtitle')}
            </p>
          </div>
        </Container>
      </section>

      {/* Main Donation Guidelines */}
      <Section background="default" size="lg">
        <Container size="lg">
          <div className="max-w-4xl mx-auto space-y-8">
            <SectionHeader
              badge={t('donate.modes.badge')}
              title={t('donate.modes.title')}
              subtitle={t('donate.modes.subtitle')}
              align="center"
            />

            {/* Recipient Verification Warning */}
            <div className="p-4 sm:p-5 bg-amber-50 border-l-4 border-amber-500 rounded-r-xl shadow-2xs">
              <div className="flex items-start space-x-3">
                <span className="text-2xl shrink-0 select-none" aria-hidden="true">⚠️</span>
                <div>
                  <h3 className="text-sm font-bold text-amber-900">
                    {t('donate.warning.title')}
                  </h3>
                  <p className="text-xs sm:text-sm text-amber-800 mt-1 leading-relaxed">
                    {t('donate.warning.text')}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              {/* Mode 1: Digital UPI Payment */}
              <Card className="p-6 sm:p-8 bg-white border border-stone-200 space-y-6">
                <div className="flex items-center space-x-3 border-b border-stone-100 pb-4">
                  <span className="w-10 h-10 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-lg select-none">
                    📱
                  </span>
                  <div>
                    <h3 className="font-bold text-stone-900 text-lg">
                      {t('donate.upi.title')}
                    </h3>
                    <p className="text-xs text-stone-500">
                      {t('donate.upi.subtitle')}
                    </p>
                  </div>
                </div>

                {/* QR Code Placeholder Box */}
                <div className="flex flex-col items-center justify-center p-6 sm:p-8 bg-stone-50 rounded-xl border-2 border-dashed border-stone-300 text-center space-y-3">
                  <div className="w-44 h-44 bg-stone-200 rounded-lg flex flex-col items-center justify-center p-3 text-stone-600 text-xs text-center border border-stone-300 shadow-2xs">
                    <span className="text-3xl mb-2 select-none" aria-hidden="true">📷</span>
                    <span className="font-semibold text-stone-700">
                      {t('donate.upi.qrPlaceholder')}
                    </span>
                  </div>
                  <span className="text-xs text-stone-500 leading-normal max-w-xs">
                    {t('donate.upi.scanInstructions')}
                  </span>
                </div>

                {/* Official UPI ID Field & Copy Button */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
                    {t('donate.upi.idLabel')}
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="p-3 bg-stone-100 rounded-lg border border-stone-200 text-center font-mono text-xs sm:text-sm font-bold text-stone-800 select-all flex-1">
                      {t('donate.upi.idValue')}
                    </div>
                    <Button
                      type="button"
                      variant={copied ? 'secondary' : 'outline'}
                      size="sm"
                      onClick={handleCopyUpiId}
                      className="shrink-0"
                    >
                      {copied ? '✓ ' + t('common.copied') : t('donate.upi.copyBtn')}
                    </Button>
                  </div>
                  {copied && (
                    <p className="text-xs text-emerald-700 font-semibold text-center animate-in fade-in duration-150">
                      ✓ {t('donate.upi.copiedToast')}
                    </p>
                  )}
                </div>
              </Card>

              {/* Mode 2: Cash & In-Person Contribution */}
              <Card className="p-6 sm:p-8 bg-white border border-stone-200 space-y-6">
                <div className="flex items-center space-x-3 border-b border-stone-100 pb-4">
                  <span className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-lg select-none">
                    💵
                  </span>
                  <div>
                    <h3 className="font-bold text-stone-900 text-lg">
                      {t('donate.cash.title')}
                    </h3>
                    <p className="text-xs text-stone-500">
                      {t('donate.cash.subtitle')}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-stone-50 rounded-lg border border-stone-200">
                    <h4 className="font-bold text-stone-900 text-sm mb-1">
                      {t('donate.cash.guidanceTitle')}
                    </h4>
                    <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                      {t('donate.cash.guidanceText')}
                    </p>
                  </div>

                  <div className="space-y-2 text-xs text-stone-600 leading-relaxed">
                    <h5 className="font-bold text-stone-800 uppercase tracking-wide">
                      {t('donate.cash.supportsTitle')}
                    </h5>
                    <ul className="space-y-1.5 list-disc list-inside text-stone-700">
                      <li>{t('donate.cash.support1')}</li>
                      <li>{t('donate.cash.support2')}</li>
                      <li>{t('donate.cash.support3')}</li>
                      <li>{t('donate.cash.support4')}</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-orange-50/60 rounded-lg border border-orange-200/80 text-xs text-orange-900">
                    <p className="font-semibold mb-0.5">{t('donate.cash.receiptTitle')}</p>
                    <p className="text-orange-800">
                      {t('donate.cash.receiptText')}
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* General Policy Note */}
            <div className="p-6 bg-stone-100 rounded-xl border border-stone-200 text-center text-xs text-stone-600 max-w-2xl mx-auto">
              {t('donate.footerNote')}
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
};
