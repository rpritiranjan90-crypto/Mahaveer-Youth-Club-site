import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Container } from '../components/layout/Container';
import { Section } from '../components/layout/Section';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { SectionHeader } from '../components/content/SectionHeader';
import { CTASection } from '../components/content/CTASection';
import { usePageMeta } from '../hooks/usePageMeta';
import { useLanguage } from '../context/LanguageContext';
import { apiService } from '../services/api';
import { HealthStatus } from '../types';

export const HomePage: React.FC = () => {
  const { t } = useLanguage();

  usePageMeta({
    title: 'Mahaveer Youth Club Banza — Community, Culture, Celebration',
    description: 'Official website for Mahaveer Youth Club Banza. Founded in 2012 to celebrate Ganesh Chaturthi in a devotional way and foster community welfare.',
  });

  const [backendHealth, setBackendHealth] = useState<HealthStatus | null>(null);
  const [healthLoading, setHealthLoading] = useState<boolean>(true);

  useEffect(() => {
    apiService.getHealth()
      .then((data) => setBackendHealth(data))
      .catch(() => setBackendHealth(null))
      .finally(() => setHealthLoading(false));
  }, []);

  return (
    <div className="space-y-0">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-orange-50/60 via-[#FCFBF9] to-[#FCFBF9] py-16 sm:py-24 border-b border-stone-200/60">
        <Container size="lg">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 mb-4">
              <Badge variant="saffron">{t('home.badge.established')}</Badge>
              <Badge variant="neutral">{t('home.badge.community')}</Badge>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-stone-900 tracking-tight leading-tight mb-4">
              {t('home.hero.title')} <span className="text-orange-600">Banza</span>
            </h1>

            <p className="text-base sm:text-xl font-medium text-stone-700 tracking-wide mb-3">
              {t('home.hero.tagline')}
            </p>

            <p className="text-xs sm:text-base text-stone-600 max-w-2xl mx-auto leading-relaxed mb-8">
              {t('home.hero.subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/celebrations">
                <Button variant="primary" size="lg" className="w-full sm:w-auto font-bold shadow-md">
                  {t('home.hero.exploreCelebrations')}
                </Button>
              </Link>
              <Link to="/about">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  {t('home.hero.aboutClub')}
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* 2. About / Purpose Overview Section */}
      <Section background="default" size="md">
        <Container size="lg">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <SectionHeader
                badge={t('home.about.badge')}
                title={t('home.about.title')}
                subtitle={t('home.about.subtitle')}
              />
              <p className="text-sm text-stone-600 leading-relaxed">
                {t('home.about.description')}
              </p>
              <div className="pt-2">
                <Link to="/about">
                  <Button variant="secondary" size="md">
                    {t('home.about.readStory')}
                  </Button>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5">
              <Card className="p-6 sm:p-8 bg-white border border-stone-200 shadow-sm space-y-4">
                <div className="flex items-center space-x-3 border-b border-stone-100 pb-4">
                  <span className="w-10 h-10 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-lg select-none">
                    🙏
                  </span>
                  <div>
                    <h3 className="font-bold text-stone-900 text-base">{t('home.pillars.devotion')}</h3>
                    <p className="text-xs text-stone-500">{t('home.pillars.devotionDesc')}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 border-b border-stone-100 pb-4">
                  <span className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-lg select-none">
                    🤝
                  </span>
                  <div>
                    <h3 className="font-bold text-stone-900 text-base">{t('home.pillars.seva')}</h3>
                    <p className="text-xs text-stone-500">{t('home.pillars.sevaDesc')}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg select-none">
                    🏛️
                  </span>
                  <div>
                    <h3 className="font-bold text-stone-900 text-base">{t('home.pillars.heritage')}</h3>
                    <p className="text-xs text-stone-500">{t('home.pillars.heritageDesc')}</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </Container>
      </Section>

      {/* 3. History Highlight Section */}
      <Section background="muted" size="md">
        <Container size="lg">
          <div className="max-w-4xl mx-auto">
            <SectionHeader
              badge={t('home.history.badge')}
              title={t('home.history.title')}
              subtitle={t('home.history.subtitle')}
              align="center"
            />

            <Card className="p-6 sm:p-8 bg-white border border-stone-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="px-4 py-2 bg-orange-600 text-white rounded-lg font-black text-xl tracking-tight">
                  2012
                </div>
                <div className="space-y-1 flex-1">
                  <h3 className="text-base font-bold text-stone-900">
                    {t('home.history.cardTitle')}
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                    {t('home.history.cardDesc')}
                  </p>
                </div>
                <Link to="/history" className="shrink-0 mt-2 sm:mt-0">
                  <Button variant="outline" size="sm">
                    {t('home.history.viewTimeline')}
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </Container>
      </Section>

      {/* 4. Previews Grid: Celebrations, Activities, Updates, Members */}
      <Section background="default" size="md">
        <Container size="lg">
          <SectionHeader
            badge={t('home.hub.badge')}
            title={t('home.hub.title')}
            subtitle={t('home.hub.subtitle')}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Celebrations Preview */}
            <Card className="p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center text-xl select-none">
                  🌺
                </div>
                <h3 className="font-bold text-stone-900 text-base">{t('home.hub.celebrations')}</h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {t('home.hub.celebrationsDesc')}
                </p>
              </div>
              <div className="pt-4">
                <Link to="/celebrations">
                  <Button variant="ghost" size="sm" className="w-full justify-between text-orange-700 font-semibold px-0">
                    <span>{t('home.hub.celebrationsAction')}</span>
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Activities Preview */}
            <Card className="p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center text-xl select-none">
                  🎯
                </div>
                <h3 className="font-bold text-stone-900 text-base">{t('home.hub.activities')}</h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {t('home.hub.activitiesDesc')}
                </p>
              </div>
              <div className="pt-4">
                <Link to="/activities">
                  <Button variant="ghost" size="sm" className="w-full justify-between text-rose-700 font-semibold px-0">
                    <span>{t('home.hub.activitiesAction')}</span>
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Updates Preview */}
            <Card className="p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center text-xl select-none">
                  📢
                </div>
                <h3 className="font-bold text-stone-900 text-base">{t('home.hub.updates')}</h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {t('home.hub.updatesDesc')}
                </p>
              </div>
              <div className="pt-4">
                <Link to="/updates">
                  <Button variant="ghost" size="sm" className="w-full justify-between text-amber-700 font-semibold px-0">
                    <span>{t('home.hub.updatesAction')}</span>
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Members Preview */}
            <Card className="p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-lg bg-stone-100 text-stone-700 flex items-center justify-center text-xl select-none">
                  👥
                </div>
                <h3 className="font-bold text-stone-900 text-base">{t('home.hub.members')}</h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {t('home.hub.membersDesc')}
                </p>
              </div>
              <div className="pt-4">
                <Link to="/members">
                  <Button variant="ghost" size="sm" className="w-full justify-between text-stone-700 font-semibold px-0">
                    <span>{t('home.hub.membersAction')}</span>
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </Container>
      </Section>

      {/* 5. Donation CTA Section */}
      <CTASection
        title={t('home.cta.title')}
        description={t('home.cta.description')}
        primaryAction={{
          label: t('home.cta.donate'),
          to: '/donate',
        }}
        secondaryAction={{
          label: t('home.cta.contact'),
          to: '/contact',
        }}
        variant="warm"
      />

      {/* 6. System Status / Connectivity Card */}
      <section className="py-6 bg-[#FCFBF9] border-t border-stone-200">
        <Container size="lg">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
              <span className="font-semibold text-stone-800">
                {t('home.status.backend')}
              </span>
              <span className="text-stone-600 font-mono">
                {healthLoading
                  ? t('home.status.checking')
                  : backendHealth?.status === 'ok'
                  ? `${t('home.status.online')} (v${backendHealth.version})`
                  : 'Backend API reachable'}
              </span>
            </div>
            <div className="text-stone-500 text-[11px] font-mono">
              Mahaveer Youth Club Banza • Established 2012
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
};
