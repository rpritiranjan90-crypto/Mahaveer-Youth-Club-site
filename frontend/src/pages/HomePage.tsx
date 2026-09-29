import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Hero } from '../components/content/Hero';
import { Section } from '../components/layout/Section';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ActivityCard } from '../components/content/ActivityCard';
import { UpdateCard } from '../components/content/UpdateCard';
import { GalleryGrid } from '../components/gallery/GalleryGrid';
import { Timeline } from '../components/content/Timeline';
import { DonationUI } from '../components/content/DonationUI';
import { activitiesData } from '../data/activities';
import { updatesData } from '../data/updates';
import { galleryData } from '../data/gallery';
import { historyTimelineData } from '../data/history';
import { clubInfo } from '../data/club';
import { usePageMeta } from '../utils/seo';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  usePageMeta({
    title: `${clubInfo.name} — Ganesh Puja Club & Community Portal`,
    description: `Official website of ${clubInfo.name}. Join us for our 28th Annual Ganesh Utsav rituals, daily Aarti timings, community welfare camps, and UPI donations.`,
  });

  const featuredActivities = activitiesData.filter((a) => a.featured).slice(0, 3);
  const latestUpdates = updatesData.slice(0, 3);
  const previewGallery = galleryData.slice(0, 4);
  const previewTimeline = historyTimelineData.slice(0, 3);

  return (
    <div className="space-y-0 text-left">
      {/* 1. Home Hero */}
      <Hero
        eyebrow="GANPATI BAPPA MORYA"
        heading="Celebrating Faith, Tradition & Community"
        description="Welcome to Mahaveer Youth Club. Celebrating our 28th year of unbroken devotion, youth empowerment, cultural preservation, and community social service."
        primaryCtaText="Donate Now ❤️"
        primaryCtaAction={() => navigate('/donate')}
        secondaryCtaText="Our Story"
        secondaryCtaAction={() => navigate('/about')}
      />

      {/* 2. About Preview */}
      <Section
        eyebrow="OUR STORY"
        title="A Tradition Built by Our Community"
        description="For more than two decades, Mahaveer Youth Club has stood as a beacon of unity, cultural pride, and selfless social service."
        align="left"
        background="white"
        action={
          <Link to="/about">
            <Button variant="primary" size="md">
              Read Our Full Story →
            </Button>
          </Link>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <Card className="p-6 bg-[#FFF8EE] border border-[#E9DED1]">
            <div className="text-3xl mb-3">🪔</div>
            <h3 className="text-lg font-bold text-[#241A17] mb-2">Sacred Devotion</h3>
            <p className="text-xs sm:text-sm text-[#6B625D] leading-relaxed">
              Organizing the 10-day Ganesh Utsav with authentic Vedic rituals, eco-friendly clay idols, and sanctified community Mahaprasad.
            </p>
          </Card>

          <Card className="p-6 bg-[#FFF8EE] border border-[#E9DED1]">
            <div className="text-3xl mb-3">🤝</div>
            <h3 className="text-lg font-bold text-[#241A17] mb-2">Community Seva</h3>
            <p className="text-xs sm:text-sm text-[#6B625D] leading-relaxed">
              Conducting annual voluntary blood donation drives, winter blanket distribution, and disaster relief assistance for needy families.
            </p>
          </Card>

          <Card className="p-6 bg-[#FFF8EE] border border-[#E9DED1]">
            <div className="text-3xl mb-3">🚩</div>
            <h3 className="text-lg font-bold text-[#241A17] mb-2">Youth Leadership</h3>
            <p className="text-xs sm:text-sm text-[#6B625D] leading-relaxed">
              Fostering leadership, cultural responsibility, and team camaraderie among 150+ neighborhood youth members and volunteers.
            </p>
          </Card>
        </div>
      </Section>

      {/* 3. Current Puja & Activities */}
      <Section
        eyebrow="FESTIVAL & RITUALS"
        title="Upcoming Puja & Community Activities"
        description="Mark your calendar for sacred daily Aartis, youth sports championships, and philanthropic camps."
        align="left"
        action={
          <Link to="/puja">
            <Button variant="secondary" size="md">
              View All Activities →
            </Button>
          </Link>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredActivities.map((act) => (
            <ActivityCard
              key={act.id}
              title={act.title}
              category={act.category}
              date={act.date}
              time={act.time}
              location={act.location}
              description={act.description}
            />
          ))}
        </div>
      </Section>

      {/* 4. Latest Updates */}
      <Section
        eyebrow="ANNOUNCEMENTS"
        title="Latest Club Updates & Notices"
        description="Stay informed on pandal construction progress, volunteer duty rosters, and festival advisories."
        align="left"
        background="white"
        action={
          <Link to="/updates">
            <Button variant="secondary" size="md">
              View All Updates →
            </Button>
          </Link>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {latestUpdates.map((upd) => (
            <UpdateCard
              key={upd.id}
              title={upd.title}
              date={upd.date}
              category={upd.category}
              description={upd.description}
              onReadMore={() => navigate('/updates')}
            />
          ))}
        </div>
      </Section>

      {/* 5. Gallery Preview */}
      <Section
        eyebrow="FESTIVE ARCHIVE"
        title="Memories from Our Celebrations"
        description="Highlights from past years of divine Aarti, grand pandals, cultural evenings, and social work."
        align="center"
        action={
          <Link to="/gallery">
            <Button variant="secondary" size="md">
              View Full Gallery →
            </Button>
          </Link>
        }
      >
        <GalleryGrid items={previewGallery} categories={[]} />
      </Section>

      {/* 6. History Milestone Preview */}
      <Section
        eyebrow="OUR HERITAGE"
        title="28+ Years of Unbroken Tradition"
        description="A brief glimpse into the founding and key milestones of Mahaveer Youth Club since 1998."
        align="center"
        background="white"
        action={
          <Link to="/history">
            <Button variant="secondary" size="md">
              Explore Full History →
            </Button>
          </Link>
        }
      >
        <Timeline items={previewTimeline} />
      </Section>

      {/* 7. Donation CTA */}
      <Section
        eyebrow="SEVA & SUPPORT"
        title="Support Our Tradition & Community Seva"
        description="Your voluntary contribution directly powers our daily Maha Bhog, Vedic pandal construction, and annual blood donation camps."
        align="center"
      >
        <DonationUI
          clubName={clubInfo.name}
          upiId={clubInfo.upiId}
          onPaymentSubmitted={() => {
            // Development notification
          }}
        />
      </Section>

      {/* 8. Contact CTA Section */}
      <Section
        eyebrow="GET IN TOUCH"
        title="We'd Love to Hear From You"
        description="Have queries regarding festival darshan timings, volunteer registration, or blood donation camps? Reach out to our organizing committee."
        align="center"
        background="white"
      >
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            <div className="p-4 bg-[#FFF8EE] rounded-lg border border-[#E9DED1]">
              <span className="text-xl">📍</span>
              <h4 className="text-xs font-bold text-[#241A17] uppercase tracking-wider mt-1">Location</h4>
              <p className="text-xs text-[#6B625D] mt-0.5">{clubInfo.location}</p>
            </div>
            <div className="p-4 bg-[#FFF8EE] rounded-lg border border-[#E9DED1]">
              <span className="text-xl">📞</span>
              <h4 className="text-xs font-bold text-[#241A17] uppercase tracking-wider mt-1">Phone</h4>
              <p className="text-xs text-[#6B625D] mt-0.5">{clubInfo.phone}</p>
            </div>
            <div className="p-4 bg-[#FFF8EE] rounded-lg border border-[#E9DED1]">
              <span className="text-xl">✉️</span>
              <h4 className="text-xs font-bold text-[#241A17] uppercase tracking-wider mt-1">Email</h4>
              <p className="text-xs text-[#6B625D] mt-0.5">{clubInfo.email}</p>
            </div>
          </div>

          <Link to="/contact">
            <Button variant="primary" size="lg" className="font-bold shadow-festive">
              Visit Contact Page →
            </Button>
          </Link>
        </div>
      </Section>
    </div>
  );
};
