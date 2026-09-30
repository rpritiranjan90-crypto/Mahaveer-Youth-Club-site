import React from 'react';
import { Container } from '../components/layout/Container';
import { Section } from '../components/layout/Section';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { SectionHeader } from '../components/content/SectionHeader';
import { usePageMeta } from '../hooks/usePageMeta';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { useLanguage } from '../context/LanguageContext';

export const ContactPage: React.FC = () => {
  const { t } = useLanguage();
  const pageRef = useScrollReveal<HTMLDivElement>({ threshold: 0.1 });

  usePageMeta({
    title: 'Contact Us — Mahaveer Youth Club Banza',
    description: 'Official contact details, location directions, and communication channels for Mahaveer Youth Club Banza.',
  });

  return (
    <div ref={pageRef}>
      {/* Page Header */}
      <section className="bg-gradient-to-b from-orange-50/60 to-[#FCFBF9] py-10 sm:py-14 border-b border-stone-200">
        <Container size="lg">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="saffron">{t('contact.badge.touch')}</Badge>
              <Badge variant="neutral">{t('contact.badge.channels')}</Badge>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-stone-900 tracking-tight mb-3">
              {t('contact.title')}
            </h1>
            <p className="text-base sm:text-lg text-stone-600 leading-relaxed">
              {t('contact.subtitle')}
            </p>
          </div>
        </Container>
      </section>

      {/* Main Contact Section */}
      <Section background="default" size="md">
        <Container size="lg">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="reveal-on-scroll">
              <SectionHeader
                badge={t('contact.section.badge')}
                title={t('contact.section.title')}
                subtitle={t('contact.section.subtitle')}
              />
            </div>

            {/* Contact Action Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* 1. Direct Call */}
              <div className="reveal-on-scroll stagger-1">
                <Card interactive className="p-6 bg-white border border-stone-200 flex flex-col justify-between h-full">
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center text-2xl select-none">
                      📞
                    </div>
                    <div>
                      <h3 className="font-bold text-stone-900 text-base">
                        {t('contact.call.title')}
                      </h3>
                      <p className="text-xs text-stone-500">
                        {t('contact.call.subtitle')}
                      </p>
                    </div>
                    <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-200 text-xs font-mono text-stone-700 text-center select-all">
                      +91 9337310332
                    </div>
                  </div>
                  <div className="pt-4">
                    {/* Call Action Button */}
                    <a
                      href="tel:9337310332"
                      className="btn-interactive inline-flex items-center justify-center w-full px-3 py-2 text-xs font-semibold rounded-lg bg-orange-600 text-white hover:bg-orange-700 transition-colors shadow-2xs"
                    >
                      📞 {t('contact.call.btn')}
                    </a>
                  </div>
                </Card>
              </div>

              {/* 2. WhatsApp Messaging */}
              <div className="reveal-on-scroll stagger-2">
                <Card interactive className="p-6 bg-white border border-stone-200 flex flex-col justify-between h-full">
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-2xl select-none">
                      💬
                    </div>
                    <div>
                      <h3 className="font-bold text-stone-900 text-base">
                        {t('contact.whatsapp.title')}
                      </h3>
                      <p className="text-xs text-stone-500">
                        {t('contact.whatsapp.subtitle')}
                      </p>
                    </div>
                    <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-200 text-xs font-mono text-stone-700 text-center select-all">
                      +91 9337310332
                    </div>
                  </div>
                  <div className="pt-4">
                    {/* WhatsApp Action Button - without prefilled message */}
                    <a
                      href="https://wa.me/919337310332"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-interactive inline-flex items-center justify-center w-full px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs"
                    >
                      💬 {t('contact.whatsapp.btn')}
                    </a>
                  </div>
                </Card>
              </div>

              {/* 3. Google Maps Directions */}
              <div className="reveal-on-scroll stagger-3">
                <Card interactive className="p-6 bg-white border border-stone-200 flex flex-col justify-between h-full">
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center text-2xl select-none">
                      📍
                    </div>
                    <div>
                      <h3 className="font-bold text-stone-900 text-base">
                        {t('contact.maps.title')}
                      </h3>
                      <p className="text-xs text-stone-500">
                        {t('contact.maps.subtitle')}
                      </p>
                    </div>
                    <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-200 text-xs font-mono text-stone-700 text-center select-all">
                      Banza, Jajpur, Odisha
                    </div>
                  </div>
                  <div className="pt-4">
                    {/* Google Maps Directions Action Button */}
                    <a
                      href="https://maps.app.goo.gl/2j6DYPzNLEagMvNR8"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-interactive inline-flex items-center justify-center w-full px-3 py-2 text-xs font-semibold rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-colors shadow-2xs"
                    >
                      📍 {t('contact.maps.btn')}
                    </a>
                  </div>
                </Card>
              </div>

              {/* 4. Instagram */}
              <div className="reveal-on-scroll stagger-1">
                <Card interactive className="p-6 bg-white border border-stone-200 flex flex-col justify-between h-full">
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center text-2xl select-none">
                      📷
                    </div>
                    <div>
                      <h3 className="font-bold text-stone-900 text-base">
                        {t('contact.instagram.title')}
                      </h3>
                      <p className="text-xs text-stone-500">
                        {t('contact.instagram.subtitle')}
                      </p>
                    </div>
                    <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-200 text-xs font-mono text-stone-700 text-center select-all">
                      @mahaveer_youth_club_banza
                    </div>
                  </div>
                  <div className="pt-4">
                    <a
                      href="https://www.instagram.com/mahaveer_youth_club_banza"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-interactive inline-flex items-center justify-center w-full px-3 py-2 text-xs font-semibold rounded-lg bg-stone-100 text-stone-700 hover:bg-stone-200 transition-colors"
                    >
                      {t('contact.instagram.btn')}
                    </a>
                  </div>
                </Card>
              </div>

              {/* 5. YouTube */}
              <div className="reveal-on-scroll stagger-2">
                <Card interactive className="p-6 bg-white border border-stone-200 flex flex-col justify-between h-full">
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-red-100 text-red-700 flex items-center justify-center text-2xl select-none">
                      ▶️
                    </div>
                    <div>
                      <h3 className="font-bold text-stone-900 text-base">
                        {t('contact.youtube.title')}
                      </h3>
                      <p className="text-xs text-stone-500">
                        {t('contact.youtube.subtitle')}
                      </p>
                    </div>
                    <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-200 text-xs font-mono text-stone-700 text-center select-all">
                      @mahaveer_youthclub
                    </div>
                  </div>
                  <div className="pt-4">
                    <a
                      href="https://youtube.com/@mahaveer_youthclub"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-interactive inline-flex items-center justify-center w-full px-3 py-2 text-xs font-semibold rounded-lg bg-stone-100 text-stone-700 hover:bg-stone-200 transition-colors"
                    >
                      {t('contact.youtube.btn')}
                    </a>
                  </div>
                </Card>
              </div>

              {/* 6. Physical Mandap Address Box */}
              <div className="reveal-on-scroll stagger-3">
                <Card className="p-6 bg-stone-50 border border-stone-200 flex flex-col justify-between h-full">
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-stone-200 text-stone-800 flex items-center justify-center text-2xl select-none">
                      🏛️
                    </div>
                    <div>
                      <h3 className="font-bold text-stone-900 text-base">
                        {t('contact.address.title')}
                      </h3>
                      <p className="text-xs text-stone-500">
                        {t('contact.address.subtitle')}
                      </p>
                    </div>
                    <p className="text-xs text-stone-600 font-mono">
                      Mahaveer Youth Club Banza, Banza, Jajpur, Odisha, India
                    </p>
                  </div>
                  <div className="pt-4 text-[11px] text-stone-500">
                    {t('contact.address.hours')}
                  </div>
                </Card>
              </div>
            </div>

            {/* In-Person Meeting Note */}
            <div className="reveal-on-scroll p-5 bg-stone-100 rounded-xl border border-stone-200 text-center text-xs text-stone-600">
              {t('contact.footerNote')}
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
};
