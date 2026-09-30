import React from 'react';
import { Link } from 'react-router-dom';
import { Container } from '../components/layout/Container';
import { Section } from '../components/layout/Section';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { SectionHeader } from '../components/content/SectionHeader';
import { usePageMeta } from '../hooks/usePageMeta';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { useLanguage } from '../context/LanguageContext';

export const AboutPage: React.FC = () => {
  const { t } = useLanguage();
  const pageRef = useScrollReveal<HTMLDivElement>({ threshold: 0.1 });

  usePageMeta({
    title: 'About Us — Mahaveer Youth Club Banza',
    description: 'Learn about the purpose, founding story, and community welfare mission of Mahaveer Youth Club Banza, established in 2012.',
  });

  return (
    <div ref={pageRef}>
      {/* Page Header */}
      <section className="bg-gradient-to-b from-orange-50/60 to-[#FCFBF9] py-10 sm:py-14 border-b border-stone-200">
        <Container size="lg">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="saffron">{t('about.badge.about')}</Badge>
              <Badge variant="neutral">{t('about.badge.since')}</Badge>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-stone-900 tracking-tight mb-3">
              {t('about.title')}
            </h1>
            <p className="text-base sm:text-lg text-stone-600 leading-relaxed">
              {t('about.subtitle')}
            </p>
          </div>
        </Container>
      </section>

      {/* Main Content Sections */}
      <Section background="default" size="md">
        <Container size="lg">
          <div className="space-y-10 max-w-4xl">
            {/* 1. Introduction & Overview */}
            <div className="space-y-4 reveal-on-scroll">
              <SectionHeader
                badge={t('about.overview.badge')}
                title={t('about.overview.title')}
                subtitle={t('about.overview.subtitle')}
              />
              <p className="text-sm sm:text-base text-stone-700 leading-relaxed">
                {t('about.overview.text')}
              </p>
            </div>

            {/* 2. Confirmed Founding Story */}
            <div className="reveal-scale">
              <Card interactive className="p-6 sm:p-10 bg-orange-50/40 border border-orange-200/80 shadow-xs">
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-orange-600 text-white flex items-center justify-center font-bold text-2xl shrink-0 shadow-xs select-none">
                    🏛️
                  </div>
                  <div className="space-y-3">
                    <div className="inline-block">
                      <Badge variant="saffron">{t('about.founding.badge')}</Badge>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
                      {t('about.founding.title')}
                    </h3>
                    <p className="text-sm sm:text-base text-stone-700 leading-relaxed italic border-l-4 border-orange-500 pl-4 py-1 bg-white/70 rounded-r-md">
                      {t('about.founding.quote')}
                    </p>
                    <p className="text-xs sm:text-sm text-stone-600 leading-relaxed pt-1">
                      {t('about.founding.text')}
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* 3. Core Purpose & Values */}
            <div className="space-y-6">
              <div className="reveal-on-scroll">
                <SectionHeader
                  badge={t('about.pillars.badge')}
                  title={t('about.pillars.title')}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="reveal-on-scroll stagger-1">
                  <Card interactive className="p-6 h-full bg-white border border-stone-200">
                    <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center text-xl mb-4 select-none">
                      🪔
                    </div>
                    <h4 className="font-bold text-stone-900 text-base mb-2">
                      {t('about.pillars.devotionTitle')}
                    </h4>
                    <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                      {t('about.pillars.devotionText')}
                    </p>
                  </Card>
                </div>

                <div className="reveal-on-scroll stagger-2">
                  <Card interactive className="p-6 h-full bg-white border border-stone-200">
                    <div className="w-10 h-10 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center text-xl mb-4 select-none">
                      🤝
                    </div>
                    <h4 className="font-bold text-stone-900 text-base mb-2">
                      {t('about.pillars.sevaTitle')}
                    </h4>
                    <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                      {t('about.pillars.sevaText')}
                    </p>
                  </Card>
                </div>

                <div className="reveal-on-scroll stagger-3">
                  <Card interactive className="p-6 h-full bg-white border border-stone-200">
                    <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center text-xl mb-4 select-none">
                      👥
                    </div>
                    <h4 className="font-bold text-stone-900 text-base mb-2">
                      {t('about.pillars.youthTitle')}
                    </h4>
                    <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                      {t('about.pillars.youthText')}
                    </p>
                  </Card>
                </div>
              </div>
            </div>

            {/* 4. Community Focus & Navigation Callout */}
            <div className="reveal-on-scroll">
              <div className="p-6 sm:p-8 bg-stone-100/90 rounded-2xl border border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-stone-900 text-base">
                    {t('about.journey.title')}
                  </h4>
                  <p className="text-xs sm:text-sm text-stone-600 mt-1">
                    {t('about.journey.text')}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Link to="/history">
                    <Button variant="outline" size="sm">
                      {t('about.journey.historyBtn')}
                    </Button>
                  </Link>
                  <Link to="/members">
                    <Button variant="primary" size="sm">
                      {t('about.journey.membersBtn')}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
};
