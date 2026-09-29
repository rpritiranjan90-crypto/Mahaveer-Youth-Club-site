import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Container } from '../components/layout/Container';
import { Section } from '../components/layout/Section';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { ActivityCard } from '../components/content/ActivityCard';
import { activitiesData, ActivityItem } from '../data/activities';
import { clubInfo } from '../data/club';
import { usePageMeta } from '../utils/seo';
import { usePublicActivities } from '../utils/usePublicData';

export const PujaPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const { activities } = usePublicActivities();

  usePageMeta({
    title: `Puja & Activities — ${clubInfo.name}`,
    description: `Complete 10-day ritual schedule, daily Aarti timings, cultural programs, and community welfare camps organized by ${clubInfo.name}.`,
  });

  const categories = ['All', 'Ritual', 'Welfare', 'Cultural', 'Sports'];

  const allActivities = activities.length > 0 ? activities : activitiesData;

  const filteredActivities =
    selectedCategory === 'All'
      ? allActivities
      : allActivities.filter((act) => act.category.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <div className="space-y-0 text-left">
      {/* 1. Page Header */}
      <div className="bg-gradient-to-b from-[#FFF8EE] to-[#FFEDD5]/30 border-b border-[#E9DED1] py-12 sm:py-16">
        <Container size="lg">
          <div className="max-w-3xl">
            <Badge variant="maroon" size="md" className="mb-3 font-bold uppercase tracking-wider">
              ANNUAL GANESH UTSAV 2026
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#241A17] tracking-tight">
              Puja & Community Activities
            </h1>
            <p className="text-base sm:text-lg text-[#6B625D] mt-4 leading-relaxed">
              Explore the complete 10-day ritual schedule, sacred daily Aarti timings, community blood donation camps, cultural evenings, and youth athletic meets.
            </p>
          </div>
        </Container>
      </div>

      {/* 2. Activities & Category Filter */}
      <Section
        eyebrow="EVENT SCHEDULE"
        title="10-Day Festival & Welfare Programs"
        description="Filter by category to explore ritual timings, cultural nights, and welfare drives."
        align="center"
        background="white"
      >
        {/* Category Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {categories.map((cat) => {
            const isActive = selectedCategory.toLowerCase() === cat.toLowerCase();
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all ${
                  isActive
                    ? 'bg-[#8B1E1E] text-white shadow-xs scale-[1.02]'
                    : 'bg-[#FFF8EE] text-[#6B625D] hover:text-[#241A17] border border-[#E9DED1] hover:border-[#D1C0AF]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Activity Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredActivities.map((act: ActivityItem) => (
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

        {filteredActivities.length === 0 && (
          <div className="text-center py-12 text-[#6B625D] text-sm">
            No activities found under this category.
          </div>
        )}
      </Section>

      {/* 3. Devotee Guidelines & Daily Timings */}
      <Section
        eyebrow="VISITOR GUIDELINES"
        title="Important Daily Ritual Timings & Guidelines"
        description="Key information to help devotees and families plan their visit smoothly."
        align="left"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 bg-white border border-[#E9DED1]">
            <span className="text-3xl mb-2 inline-block">🌅</span>
            <h3 className="text-base font-bold text-[#8B1E1E] mb-1">Morning Aarti & Darshan</h3>
            <p className="text-xs font-semibold text-[#241A17] mb-2">Daily at 7:30 AM</p>
            <p className="text-xs sm:text-sm text-[#6B625D] leading-relaxed">
              Commences with Vedic chanting, Pushpanjali, and distribution of Morning Charanamrit to early visitors.
            </p>
          </Card>

          <Card className="p-6 bg-white border border-[#E9DED1]">
            <span className="text-3xl mb-2 inline-block">🍲</span>
            <h3 className="text-base font-bold text-[#8B1E1E] mb-1">Maha Bhog & Anna Seva</h3>
            <p className="text-xs font-semibold text-[#241A17] mb-2">12:30 PM – 3:30 PM</p>
            <p className="text-xs sm:text-sm text-[#6B625D] leading-relaxed">
              Sanctified satvik lunch prasadam served in designated covered pandal dining corridors. Free for all devotees.
            </p>
          </Card>

          <Card className="p-6 bg-white border border-[#E9DED1]">
            <span className="text-3xl mb-2 inline-block">🪔</span>
            <h3 className="text-base font-bold text-[#8B1E1E] mb-1">Sandhya Maha Aarti</h3>
            <p className="text-xs font-semibold text-[#241A17] mb-2">Daily at 8:00 PM</p>
            <p className="text-xs sm:text-sm text-[#6B625D] leading-relaxed">
              Grand evening Deeparadhana with live traditional Dhaak drumming, conch blowing, followed by cultural musical programs.
            </p>
          </Card>
        </div>
      </Section>

      {/* 4. Support CTA */}
      <Section
        eyebrow="SEVA SPONSORSHIP"
        title="Sponsor a Day's Maha Bhog or Aarti"
        description="Devotees wishing to dedicate a day's Pushpanjali, Maha Bhog, or cultural program can contribute online."
        align="center"
        background="white"
      >
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link to="/donate">
            <Button variant="primary" size="lg" className="font-bold shadow-festive">
              Contribute via Official UPI QR ❤️
            </Button>
          </Link>
          <Link to="/contact">
            <Button variant="secondary" size="lg" className="font-bold">
              Contact Organizing Committee →
            </Button>
          </Link>
        </div>
      </Section>
    </div>
  );
};
