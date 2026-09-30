import React from 'react';
import { Container } from '../components/layout/Container';
import { Section } from '../components/layout/Section';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { SectionHeader } from '../components/content/SectionHeader';
import { usePageMeta } from '../hooks/usePageMeta';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { useLanguage } from '../context/LanguageContext';

export const HistoryPage: React.FC = () => {
  const { t } = useLanguage();
  const pageRef = useScrollReveal<HTMLDivElement>({ threshold: 0.1 });

  usePageMeta({
    title: 'History & Milestones — Mahaveer Youth Club Banza',
    description: 'Chronicle and history of Mahaveer Youth Club Banza, founded in 2012.',
  });

  const timelineItems = [
    {
      year: t('history.item1.year'),
      title: t('history.item1.title'),
      description: t('history.item1.desc'),
      isConfirmed: true,
    },
    {
      year: t('history.item2.year'),
      title: t('history.item2.title'),
      description: t('history.item2.desc'),
      isConfirmed: false,
    },
    {
      year: t('history.item3.year'),
      title: t('history.item3.title'),
      description: t('history.item3.desc'),
      isConfirmed: false,
    },
    {
      year: t('history.item4.year'),
      title: t('history.item4.title'),
      description: t('history.item4.desc'),
      isConfirmed: true,
    },
  ];

  return (
    <div ref={pageRef}>
      {/* Page Header */}
      <section className="bg-gradient-to-b from-orange-50/60 to-[#FCFBF9] py-12 sm:py-16 border-b border-stone-200">
        <Container size="lg">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="saffron">{t('history.badge.chronicle')}</Badge>
              <Badge variant="neutral">{t('history.badge.founded')}</Badge>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-stone-900 tracking-tight mb-3">
              {t('history.title')}
            </h1>
            <p className="text-base sm:text-lg text-stone-600 leading-relaxed">
              {t('history.subtitle')}
            </p>
          </div>
        </Container>
      </section>

      {/* Main Timeline Section */}
      <Section background="default" size="lg">
        <Container size="lg">
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="reveal-on-scroll">
              <SectionHeader
                badge={t('history.timeline.badge')}
                title={t('history.timeline.title')}
                subtitle={t('history.timeline.subtitle')}
              />
            </div>

            {/* Visual Timeline Tree */}
            <div className="relative border-l-2 border-orange-300 ml-4 sm:ml-6 space-y-8 pl-6 sm:pl-8 py-2">
              {timelineItems.map((item, index) => (
                <div key={index} className={`relative group reveal-on-scroll stagger-${(index % 4) + 1}`}>
                  {/* Timeline Dot */}
                  <div
                    className={`absolute -left-[31px] sm:-left-[39px] top-1.5 w-5 h-5 rounded-full border-4 border-white ${
                      item.isConfirmed
                        ? 'bg-orange-600 ring-2 ring-orange-400'
                        : 'bg-stone-400 ring-2 ring-stone-300'
                    }`}
                    aria-hidden="true"
                  />

                  {/* Timeline Card */}
                  <Card interactive className="p-5 sm:p-6 bg-white border border-stone-200">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="px-3 py-1 bg-orange-50 text-orange-800 border border-orange-200 rounded-md font-black text-sm sm:text-base font-mono">
                        {item.year}
                      </span>
                      <Badge variant={item.isConfirmed ? 'success' : 'neutral'}>
                        {item.isConfirmed ? t('history.confirmed') : t('history.placeholder')}
                      </Badge>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-stone-900 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                      {item.description}
                    </p>
                  </Card>
                </div>
              ))}
            </div>

            {/* Archival Notice Card */}
            <div className="reveal-on-scroll">
              <Card className="p-6 bg-stone-50 border border-stone-200 text-center">
                <span className="text-2xl block mb-2 select-none" aria-hidden="true">📜</span>
                <h4 className="font-bold text-stone-900 text-sm mb-1">
                  {t('history.archivalNotice.title')}
                </h4>
                <p className="text-xs text-stone-500 max-w-md mx-auto">
                  {t('history.archivalNotice.desc')}
                </p>
              </Card>
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
};
