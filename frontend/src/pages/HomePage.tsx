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
import { apiService } from '../services/api';
import { HealthStatus } from '../types';

export const HomePage: React.FC = () => {
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
              <Badge variant="saffron">ESTABLISHED 2012</Badge>
              <Badge variant="neutral">COMMUNITY ORGANIZATION</Badge>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-stone-900 tracking-tight leading-tight mb-4">
              Mahaveer Youth Club <span className="text-orange-600">Banza</span>
            </h1>

            <p className="text-base sm:text-xl font-medium text-stone-700 tracking-wide mb-3">
              Community • Culture • Celebration
            </p>

            <p className="text-xs sm:text-base text-stone-600 max-w-2xl mx-auto leading-relaxed mb-8">
              Dedicated to devotional celebrations of Ganesh Chaturthi, youth solidarity, and charitable community initiatives in the Banza region.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/celebrations">
                <Button variant="primary" size="lg" className="w-full sm:w-auto font-bold shadow-md">
                  Explore Celebrations
                </Button>
              </Link>
              <Link to="/about">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  About the Club
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
                badge="ABOUT THE CLUB"
                title="Fostering Devotion & Community Unity"
                subtitle="The senior members founded the club to celebrate Ganesh Chaturthi in a devotional way and bring happiness to the region."
              />
              <p className="text-sm text-stone-600 leading-relaxed">
                Since our founding in 2012, Mahaveer Youth Club Banza has brought together local youth and elders for cultural festivals, community seva, and neighborhood welfare initiatives.
              </p>
              <div className="pt-2">
                <Link to="/about">
                  <Button variant="secondary" size="md">
                    Read Our Full Story →
                  </Button>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5">
              <Card className="p-6 sm:p-8 bg-white border border-stone-200 shadow-sm space-y-4">
                <div className="flex items-center space-x-3 border-b border-stone-100 pb-4">
                  <span className="w-10 h-10 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-lg">
                    🙏
                  </span>
                  <div>
                    <h3 className="font-bold text-stone-900 text-base">Devotional Tradition</h3>
                    <p className="text-xs text-stone-500">Ganesh Chaturthi Utsav</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 border-b border-stone-100 pb-4">
                  <span className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-lg">
                    🤝
                  </span>
                  <div>
                    <h3 className="font-bold text-stone-900 text-base">Community Seva</h3>
                    <p className="text-xs text-stone-500">Youth Welfare & Assistance</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg">
                    🏛️
                  </span>
                  <div>
                    <h3 className="font-bold text-stone-900 text-base">Banza Heritage</h3>
                    <p className="text-xs text-stone-500">Cultural Harmony & Unity</p>
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
              badge="CHRONICLE"
              title="Club History & Milestones"
              subtitle="Tracing the milestones of Mahaveer Youth Club Banza from its 2012 beginnings."
              align="center"
            />

            <Card className="p-6 sm:p-8 bg-white border border-stone-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="px-4 py-2 bg-orange-600 text-white rounded-lg font-black text-xl tracking-tight">
                  2012
                </div>
                <div className="space-y-1 flex-1">
                  <h3 className="text-base font-bold text-stone-900">
                    Foundation of Mahaveer Youth Club Banza
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                    The senior members established the club in Banza to conduct Sri Ganesh Puja with traditional sanctity and unite the youth for local welfare.
                  </p>
                </div>
                <Link to="/history" className="shrink-0 mt-2 sm:mt-0">
                  <Button variant="outline" size="sm">
                    View Timeline →
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
            badge="EXPLORE PORTAL"
            title="Public Community Hub"
            subtitle="Discover our annual festivities, welfare activities, latest circulars, and youth roster."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Celebrations Preview */}
            <Card className="p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center text-xl">
                  🌺
                </div>
                <h3 className="font-bold text-stone-900 text-base">Celebrations</h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Annual Ganesh Chaturthi puja archive, rituals, and festive galleries across past years.
                </p>
              </div>
              <div className="pt-4">
                <Link to="/celebrations">
                  <Button variant="ghost" size="sm" className="w-full justify-between text-orange-700 font-semibold px-0">
                    <span>View Gallery</span>
                    <span>→</span>
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Activities Preview */}
            <Card className="p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center text-xl">
                  🎯
                </div>
                <h3 className="font-bold text-stone-900 text-base">Activities</h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Community service drives, welfare camps, cultural evenings, and sports tournaments.
                </p>
              </div>
              <div className="pt-4">
                <Link to="/activities">
                  <Button variant="ghost" size="sm" className="w-full justify-between text-rose-700 font-semibold px-0">
                    <span>View Activities</span>
                    <span>→</span>
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Updates Preview */}
            <Card className="p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center text-xl">
                  📢
                </div>
                <h3 className="font-bold text-stone-900 text-base">Updates & Notices</h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Official announcements, festival dates, and meeting circulars from club committee.
                </p>
              </div>
              <div className="pt-4">
                <Link to="/updates">
                  <Button variant="ghost" size="sm" className="w-full justify-between text-amber-700 font-semibold px-0">
                    <span>Read Updates</span>
                    <span>→</span>
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Members Preview */}
            <Card className="p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-lg bg-stone-100 text-stone-700 flex items-center justify-center text-xl">
                  👥
                </div>
                <h3 className="font-bold text-stone-900 text-base">Our Members</h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Dedicated club volunteers and youth members supporting annual organization efforts.
                </p>
              </div>
              <div className="pt-4">
                <Link to="/members">
                  <Button variant="ghost" size="sm" className="w-full justify-between text-stone-700 font-semibold px-0">
                    <span>View Roster</span>
                    <span>→</span>
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </Container>
      </Section>

      {/* 5. Donation CTA Section */}
      <CTASection
        title="Support Mahaveer Youth Club Initiatives"
        description="Your voluntary contributions directly support our annual Ganesh Puja celebrations, community feasts, and neighborhood welfare seva."
        primaryAction={{
          label: 'Donation Information & UPI',
          to: '/donate',
        }}
        secondaryAction={{
          label: 'Contact Club Committee',
          to: '/contact',
        }}
        variant="warm"
      />

      {/* 6. System Status / Connectivity Card (Phase 1+2 Integration) */}
      <section className="py-6 bg-[#FCFBF9] border-t border-stone-200">
        <Container size="lg">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
              <span className="font-semibold text-stone-800">
                Backend System Status:
              </span>
              <span className="text-stone-600 font-mono">
                {healthLoading
                  ? 'Checking...'
                  : backendHealth?.status === 'ok'
                  ? `Online (v${backendHealth.version})`
                  : 'Backend API reachable'}
              </span>
            </div>
            <div className="text-stone-500 text-[11px]">
              Mahaveer Youth Club Banza V2 • Phase 2 Verified
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
};
