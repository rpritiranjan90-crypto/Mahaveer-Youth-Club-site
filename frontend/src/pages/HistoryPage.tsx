import React from 'react';
import { Container } from '../components/layout/Container';
import { Section } from '../components/layout/Section';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { SectionHeader } from '../components/content/SectionHeader';
import { usePageMeta } from '../hooks/usePageMeta';

interface TimelineItem {
  year: string;
  title: string;
  description: string;
  isConfirmed: boolean;
}

const TIMELINE_DATA: TimelineItem[] = [
  {
    year: '2012',
    title: 'Foundation of Mahaveer Youth Club Banza',
    description:
      'The senior members started the club to celebrate Ganesh Chaturthi in a devotional way and bring happiness to the region.',
    isConfirmed: true,
  },
  {
    year: '2013 – 2022',
    title: 'Annual Celebrations & Community Welfare',
    description:
      'Annual celebrations of Sri Ganesh Puja, prasad distribution, and community welfare seva conducted each year. History details will be updated as official information is provided.',
    isConfirmed: false,
  },
  {
    year: '2023 – 2025',
    title: 'Recent Festivities & Youth Initiatives',
    description:
      'Expanded cultural programs, sports activities, and youth volunteer participation in Banza. History details will be updated as official information is provided.',
    isConfirmed: false,
  },
  {
    year: '2026',
    title: 'Current Year Celebrations & Digital Portal',
    description:
      'Launch of the official Mahaveer Youth Club Banza digital portal and preparations for upcoming Ganesh Chaturthi festivities.',
    isConfirmed: true,
  },
];

export const HistoryPage: React.FC = () => {
  usePageMeta({
    title: 'History & Milestones — Mahaveer Youth Club Banza',
    description: 'Chronicle and history of Mahaveer Youth Club Banza, founded in 2012.',
  });

  return (
    <div>
      {/* Page Header */}
      <section className="bg-gradient-to-b from-orange-50/50 to-[#FCFBF9] py-12 sm:py-16 border-b border-stone-200">
        <Container size="lg">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="saffron">CHRONICLE</Badge>
              <Badge variant="neutral">FOUNDED 2012</Badge>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-stone-900 tracking-tight mb-3">
              History of Mahaveer Youth Club Banza
            </h1>
            <p className="text-base sm:text-lg text-stone-600 leading-relaxed">
              A decade-long legacy of devotion, cultural unity, and voluntary service in Banza.
            </p>
          </div>
        </Container>
      </section>

      {/* Main Timeline Section */}
      <Section background="default" size="lg">
        <Container size="lg">
          <div className="max-w-3xl mx-auto space-y-8">
            <SectionHeader
              badge="TIMELINE"
              title="Our Historical Journey"
              subtitle="From our 2012 founding to present-day community activities."
            />

            {/* Visual Timeline Tree */}
            <div className="relative border-l-2 border-orange-300 ml-4 sm:ml-6 space-y-8 pl-6 sm:pl-8 py-2">
              {TIMELINE_DATA.map((item, index) => (
                <div key={index} className="relative group">
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
                  <Card className="p-5 sm:p-6 bg-white border border-stone-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="px-3 py-1 bg-orange-50 text-orange-800 border border-orange-200 rounded-md font-black text-sm sm:text-base">
                        {item.year}
                      </span>
                      <Badge variant={item.isConfirmed ? 'success' : 'neutral'}>
                        {item.isConfirmed ? 'Confirmed' : 'Placeholder'}
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
            <Card className="p-6 bg-stone-50 border border-stone-200 text-center">
              <span className="text-2xl block mb-2" aria-hidden="true">📜</span>
              <h4 className="font-bold text-stone-900 text-sm mb-1">
                Official Archival Verification
              </h4>
              <p className="text-xs text-stone-500 max-w-md mx-auto">
                History details will be updated as official information is provided by the club committee.
              </p>
            </Card>
          </div>
        </Container>
      </Section>
    </div>
  );
};
