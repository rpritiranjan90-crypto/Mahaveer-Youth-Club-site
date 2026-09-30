import React from 'react';
import { Link } from 'react-router-dom';
import { Container } from '../components/layout/Container';
import { Section } from '../components/layout/Section';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { SectionHeader } from '../components/content/SectionHeader';
import { usePageMeta } from '../hooks/usePageMeta';

export const AboutPage: React.FC = () => {
  usePageMeta({
    title: 'About Us — Mahaveer Youth Club Banza',
    description: 'Learn about the purpose, founding story, and community welfare mission of Mahaveer Youth Club Banza, established in 2012.',
  });

  return (
    <div>
      {/* Page Header */}
      <section className="bg-gradient-to-b from-orange-50/50 to-[#FCFBF9] py-12 sm:py-16 border-b border-stone-200">
        <Container size="lg">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="saffron">ABOUT US</Badge>
              <Badge variant="neutral">SINCE 2012</Badge>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-stone-900 tracking-tight mb-3">
              About Mahaveer Youth Club Banza
            </h1>
            <p className="text-base sm:text-lg text-stone-600 leading-relaxed">
              A grassroots community organization dedicated to devotional celebrations, youth development, and social welfare in Banza.
            </p>
          </div>
        </Container>
      </section>

      {/* Main Content Sections */}
      <Section background="default" size="lg">
        <Container size="lg">
          <div className="space-y-12 max-w-4xl">
            {/* 1. Introduction & Overview */}
            <div className="space-y-4">
              <SectionHeader
                badge="OVERVIEW"
                title="Who We Are"
                subtitle="Uniting our village community through devotion, cultural celebrations, and social harmony."
              />
              <p className="text-sm sm:text-base text-stone-700 leading-relaxed">
                Mahaveer Youth Club Banza is a vibrant community association comprising senior advisers, active youth organizers, and village residents. Based in Banza, the club serves as the focal point for collective cultural programs, annual spiritual festivals, and benevolent assistance.
              </p>
            </div>

            {/* 2. Confirmed Founding Story */}
            <Card className="p-6 sm:p-10 bg-orange-50/40 border border-orange-200/80 shadow-xs">
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-orange-600 text-white flex items-center justify-center font-bold text-2xl shrink-0 shadow-xs">
                  🏛️
                </div>
                <div className="space-y-3">
                  <div className="inline-block">
                    <Badge variant="saffron">CONFIRMED FOUNDING (2012)</Badge>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
                    Our Founding Story
                  </h3>
                  <p className="text-sm sm:text-base text-stone-700 leading-relaxed italic border-l-4 border-orange-500 pl-4 py-1 bg-white/70 rounded-r-md">
                    "The senior members started the club to celebrate Ganesh Chaturthi in a devotional way and bring happiness to the region."
                  </p>
                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed pt-1">
                    In 2012, respected elders and passionate local youth gathered to establish Mahaveer Youth Club Banza. Their collective vision was to uphold religious sanctity, organize orderly Ganesh Chaturthi festivities, and build a lasting platform for community service.
                  </p>
                </div>
              </div>
            </Card>

            {/* 3. Core Purpose & Values */}
            <div className="space-y-6">
              <SectionHeader
                badge="PILLARS"
                title="Our Purpose & Mission"
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 bg-white border border-stone-200">
                  <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center text-xl mb-4">
                    🪔
                  </div>
                  <h4 className="font-bold text-stone-900 text-base mb-2">
                    Devotional Traditions
                  </h4>
                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                    Upholding authentic rituals, morning and evening aartis, spiritual bhajans, and disciplined festival observances during Sri Ganesh Puja.
                  </p>
                </Card>

                <Card className="p-6 bg-white border border-stone-200">
                  <div className="w-10 h-10 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center text-xl mb-4">
                    🤝
                  </div>
                  <h4 className="font-bold text-stone-900 text-base mb-2">
                    Community Seva
                  </h4>
                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                    Organizing food distribution (prasad seva), health camps, emergency neighborhood support, and cleanliness drives for village welfare.
                  </p>
                </Card>

                <Card className="p-6 bg-white border border-stone-200">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center text-xl mb-4">
                    👥
                  </div>
                  <h4 className="font-bold text-stone-900 text-base mb-2">
                    Youth Engagement
                  </h4>
                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                    Encouraging constructive youth leadership, teamwork, athletic events, and active participation in civic development.
                  </p>
                </Card>
              </div>
            </div>

            {/* 4. Community Focus & Navigation Callout */}
            <div className="p-6 sm:p-8 bg-stone-100 rounded-2xl border border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-stone-900 text-base">
                  Explore Our Journey & Roster
                </h4>
                <p className="text-xs sm:text-sm text-stone-600 mt-1">
                  View the club's chronological history or meet our member roster.
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Link to="/history">
                  <Button variant="outline" size="sm">
                    View History
                  </Button>
                </Link>
                <Link to="/members">
                  <Button variant="primary" size="sm">
                    View Members
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
};
