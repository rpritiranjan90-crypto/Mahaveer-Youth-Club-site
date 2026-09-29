import React from 'react';
import { Link } from 'react-router-dom';
import { Container } from '../components/layout/Container';
import { Section } from '../components/layout/Section';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { Timeline } from '../components/content/Timeline';
import { historyTimelineData } from '../data/history';
import { clubInfo } from '../data/club';
import { usePageMeta } from '../utils/seo';
import { usePublicHistory } from '../utils/usePublicData';

export const HistoryPage: React.FC = () => {
  const { history } = usePublicHistory();

  usePageMeta({
    title: `Our History & Milestones — ${clubInfo.name}`,
    description: `Chronicle of ${clubInfo.name} from its founding in ${clubInfo.foundedYear} to the present day. 28+ years of cultural heritage, eco-initiatives, and community seva.`,
  });

  const activeHistory = history.length > 0 ? history : historyTimelineData;

  return (
    <div className="space-y-0 text-left">
      {/* 1. Page Header */}
      <div className="bg-gradient-to-b from-[#FFF8EE] to-[#FFEDD5]/30 border-b border-[#E9DED1] py-12 sm:py-16">
        <Container size="lg">
          <div className="max-w-3xl">
            <Badge variant="maroon" size="md" className="mb-3 font-bold uppercase tracking-wider">
              28+ YEARS OF TRADITION
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#241A17] tracking-tight">
              Our History & Milestones
            </h1>
            <p className="text-base sm:text-lg text-[#6B625D] mt-4 leading-relaxed">
              Explore the transformative journey of Mahaveer Youth Club—from a humble neighborhood gathering in {clubInfo.foundedYear} to a beacon of festive unity and youth service.
            </p>
          </div>
        </Container>
      </div>

      {/* 2. Timeline Chronicle */}
      <Section
        eyebrow="CHRONICLE"
        title="Key Historical Milestones (1998 – 2026)"
        description="A decade-by-decade look at how our youth volunteers built an enduring cultural institution."
        align="center"
        background="white"
      >
        <Timeline items={activeHistory} />
      </Section>

      {/* 3. Current Chapter & Future Vision */}
      <Section
        eyebrow="PRESENT ERA"
        title="The Present Chapter: Digital, Eco-Conscious & Inclusive"
        description="Carrying forward the sacred torch with modern transparency and deep community engagement."
        align="left"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 bg-white border border-[#E9DED1]">
            <div className="text-3xl mb-3">🌿</div>
            <h3 className="text-lg font-bold text-[#241A17] mb-2">100% Eco-Friendly Pledge</h3>
            <p className="text-xs sm:text-sm text-[#6B625D] leading-relaxed">
              Continuing our commitment to clay murtis, natural herbal paints, zero-plastic decorations, and localized artificial tank immersions.
            </p>
          </Card>

          <Card className="p-6 bg-white border border-[#E9DED1]">
            <div className="text-3xl mb-3">📱</div>
            <h3 className="text-lg font-bold text-[#241A17] mb-2">Digital Transparency</h3>
            <p className="text-xs sm:text-sm text-[#6B625D] leading-relaxed">
              Implementing direct UPI QR donations, real-time schedule trackers, and verified receipts for complete financial integrity.
            </p>
          </Card>

          <Card className="p-6 bg-white border border-[#E9DED1]">
            <div className="text-3xl mb-3">🤝</div>
            <h3 className="text-lg font-bold text-[#241A17] mb-2">Inter-Generational Unity</h3>
            <p className="text-xs sm:text-sm text-[#6B625D] leading-relaxed">
              Mentoring third-generation youth organizers under the guidance of founding elders and veteran social workers.
            </p>
          </Card>
        </div>
      </Section>

      {/* 4. CTA */}
      <Section
        eyebrow="HERITAGE CONTINUES"
        title="Help Us Write the Next Chapter"
        description="Join our vibrant youth volunteer team or support our 2026 festival preparations."
        align="center"
        background="white"
      >
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link to="/puja">
            <Button variant="secondary" size="lg" className="font-bold">
              Explore 2026 Puja Activities →
            </Button>
          </Link>
          <Link to="/donate">
            <Button variant="primary" size="lg" className="font-bold shadow-festive">
              Contribute Online (UPI QR) ❤️
            </Button>
          </Link>
        </div>
      </Section>
    </div>
  );
};
