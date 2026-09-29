import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Container } from '../components/layout/Container';
import { Section } from '../components/layout/Section';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { UpdateCard } from '../components/content/UpdateCard';
import { updatesData, UpdateItem } from '../data/updates';
import { clubInfo } from '../data/club';
import { usePageMeta } from '../utils/seo';
import { usePublicUpdates } from '../utils/usePublicData';

export const UpdatesPage: React.FC = () => {
  const [selectedUpdate, setSelectedUpdate] = useState<UpdateItem | null>(null);
  const { updates } = usePublicUpdates();

  usePageMeta({
    title: `Updates & Notices — ${clubInfo.name}`,
    description: `Official announcements, pandal preparations, volunteer rosters, and festival advisories from ${clubInfo.name}.`,
  });

  const activeUpdates = updates.length > 0 ? updates : updatesData;
  const featured = activeUpdates.find((u) => u.featured) || activeUpdates[0];
  const otherUpdates = activeUpdates.filter((u) => u.id !== featured.id);

  return (
    <div className="space-y-0 text-left">
      {/* 1. Page Header */}
      <div className="bg-gradient-to-b from-[#FFF8EE] to-[#FFEDD5]/30 border-b border-[#E9DED1] py-12 sm:py-16">
        <Container size="lg">
          <div className="max-w-3xl">
            <Badge variant="maroon" size="md" className="mb-3 font-bold uppercase tracking-wider">
              COMMUNITY BULLETINS
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#241A17] tracking-tight">
              Updates & Announcements
            </h1>
            <p className="text-base sm:text-lg text-[#6B625D] mt-4 leading-relaxed">
              Official press releases, festival preparation bulletins, volunteer duty guidelines, and emergency community notices from the executive committee.
            </p>
          </div>
        </Container>
      </div>

      {/* 2. Featured Update Spotlight */}
      <Section
        eyebrow="SPOTLIGHT"
        title="Featured Announcement"
        description="Important breaking news regarding upcoming Ganesh Utsav festivities."
        align="left"
        background="white"
      >
        <Card hoverable className="p-6 sm:p-8 bg-[#FFF8EE] border-2 border-[#E9DED1] shadow-warm-md">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-8 space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="saffron" size="sm">
                  {featured.category}
                </Badge>
                <span className="text-xs font-semibold text-[#8B1E1E]">
                  📅 {featured.date}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-[#241A17] leading-snug">
                {featured.title}
              </h2>

              <p className="text-sm text-[#6B625D] leading-relaxed">
                {featured.description}
              </p>

              <div className="pt-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setSelectedUpdate(featured)}
                  className="font-bold"
                >
                  Read Full Notice →
                </Button>
              </div>
            </div>

            <div className="lg:col-span-4 flex justify-center">
              <div className="w-full aspect-16/10 rounded-lg bg-white border border-[#E9DED1] p-4 flex flex-col items-center justify-center text-center shadow-2xs">
                <span className="text-4xl mb-1">📢</span>
                <span className="text-xs font-bold text-[#8B1E1E] uppercase">Official Committee Release</span>
                <span className="text-[11px] text-[#8C827C] mt-0.5">Mahaveer Youth Club Executive Board</span>
              </div>
            </div>
          </div>
        </Card>
      </Section>

      {/* 3. All Updates Grid */}
      <Section
        eyebrow="ALL BULLETINS"
        title="Recent Notices & Press Releases"
        description="Chronological stream of club notices and updates."
        align="left"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {otherUpdates.map((item) => (
            <UpdateCard
              key={item.id}
              title={item.title}
              date={item.date}
              category={item.category}
              description={item.description}
              onReadMore={() => setSelectedUpdate(item)}
            />
          ))}
        </div>
      </Section>

      {/* 4. Full Notice Detail Modal */}
      <Modal
        isOpen={!!selectedUpdate}
        onClose={() => setSelectedUpdate(null)}
        title={selectedUpdate?.title}
        size="lg"
        footer={
          <div className="w-full flex items-center justify-between">
            <span className="text-xs text-[#6B625D]">
              Issued by: Executive Committee • {clubInfo.name}
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setSelectedUpdate(null)}
            >
              Close Notice
            </Button>
          </div>
        }
      >
        {selectedUpdate && (
          <div className="space-y-4 text-left">
            <div className="flex items-center gap-2 pb-2 border-b border-[#F2E8DC]">
              <Badge variant="saffron" size="sm">
                {selectedUpdate.category}
              </Badge>
              <span className="text-xs font-semibold text-[#8B1E1E]">
                Date: {selectedUpdate.date}
              </span>
            </div>

            <p className="text-sm font-semibold text-[#241A17] leading-relaxed">
              {selectedUpdate.description}
            </p>

            {selectedUpdate.fullContent && (
              <div className="text-xs sm:text-sm text-[#6B625D] space-y-3 leading-relaxed pt-2 border-t border-[#F2E8DC]">
                <p>{selectedUpdate.fullContent}</p>
                <div className="p-3 bg-[#FFF8EE] rounded border border-[#E9DED1] text-xs text-[#241A17]">
                  <strong>Note for Devotees:</strong> For queries regarding this announcement, please reach out via the <Link to="/contact" className="text-[#F97316] font-bold underline">Contact Page</Link>.
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* 5. Support / Contact CTA */}
      <Section
        eyebrow="STAY UPDATED"
        title="Never Miss a Festival Update"
        description="Follow our official social community channels or join our volunteer group for real-time announcements."
        align="center"
        background="white"
      >
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link to="/contact">
            <Button variant="primary" size="lg" className="font-bold shadow-festive">
              Join Volunteer WhatsApp Group →
            </Button>
          </Link>
          <Link to="/donate">
            <Button variant="secondary" size="lg" className="font-bold">
              Support Our Club (UPI) ❤️
            </Button>
          </Link>
        </div>
      </Section>
    </div>
  );
};
