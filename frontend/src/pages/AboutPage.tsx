import React from 'react';
import { Link } from 'react-router-dom';
import { Container } from '../components/layout/Container';
import { Section } from '../components/layout/Section';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { clubInfo } from '../data/club';
import { usePageMeta } from '../utils/seo';

export const AboutPage: React.FC = () => {
  usePageMeta({
    title: `About Us — ${clubInfo.name}`,
    description: `Discover the story, mission, and community values of ${clubInfo.name}. Founded in ${clubInfo.foundedYear}, uniting youth for cultural heritage and social seva.`,
  });

  return (
    <div className="space-y-0 text-left">
      {/* 1. Page Header */}
      <div className="bg-gradient-to-b from-[#FFF8EE] to-[#FFEDD5]/30 border-b border-[#E9DED1] py-12 sm:py-16">
        <Container size="lg">
          <div className="max-w-3xl">
            <Badge variant="maroon" size="md" className="mb-3 font-bold uppercase tracking-wider">
              OUR STORY & HERITAGE
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#241A17] tracking-tight">
              About Mahaveer Youth Club
            </h1>
            <p className="text-base sm:text-lg text-[#6B625D] mt-4 leading-relaxed">
              Founded in {clubInfo.foundedYear} by neighborhood youths, Mahaveer Youth Club has blossomed from a humble local committee into one of the region’s most respected community and cultural organizations.
            </p>
          </div>
        </Container>
      </div>

      {/* 2. Club Genesis & Heritage */}
      <Section
        eyebrow="GENESIS"
        title="Rooted in Devotion, Driven by Youth"
        description="A journey of faith, collective responsibility, and unwavering service to the neighborhood."
        align="left"
        background="white"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4 text-sm sm:text-base text-[#6B625D] leading-relaxed">
            <p>
              In {clubInfo.foundedYear}, a small group of visionary young residents came together with a shared dream: to create a sacred space where the entire neighborhood could gather, pray, celebrate, and support one another as one big family.
            </p>
            <p>
              What started with a modest 3-foot clay idol and handmade paper decorations has grown into a prestigious annual 10-day celebration that welcomes tens of thousands of devotees while remaining deeply faithful to its founding ideals.
            </p>
            <p>
              Beyond the festive grandeur, the youth club has continually stood at the frontline of community welfare—organizing voluntary blood donation drives, winter warmth campaigns for the elderly, and free distribution of school supplies for underprivileged children.
            </p>
          </div>

          <div className="lg:col-span-5">
            <Card className="p-6 bg-[#FFF8EE] border-2 border-[#E9DED1] shadow-warm-md">
              <div className="text-center space-y-3">
                <span className="text-4xl">🕉️</span>
                <h3 className="text-lg font-bold text-[#8B1E1E]">Our Guiding Motto</h3>
                <p className="text-sm font-semibold text-[#241A17] italic">
                  "Seva Paramo Dharmah — Devotion through Selfless Service."
                </p>
                <div className="pt-3 border-t border-[#E9DED1] text-xs text-[#6B625D] space-y-1 text-left">
                  <p><strong>Official Registration:</strong> {clubInfo.regNumber}</p>
                  <p><strong>Active Youth Members:</strong> 150+ Registered Volunteers</p>
                  <p><strong>Headquarters:</strong> {clubInfo.location}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </Section>

      {/* 3. Core Pillars & Values */}
      <Section
        eyebrow="OUR VALUES"
        title="The Four Pillars of Our Club"
        description="The foundational principles that guide every decision, festival, and welfare campaign we undertake."
        align="center"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          <Card className="p-6 bg-white border border-[#E9DED1] hover:shadow-warm-md transition-shadow">
            <div className="w-12 h-12 rounded-full bg-[#FFEDD5] border border-[#FDBA74] flex items-center justify-center text-2xl mb-4">
              🪔
            </div>
            <h3 className="text-base font-bold text-[#241A17] mb-2">Bhakti (Devotion)</h3>
            <p className="text-xs sm:text-sm text-[#6B625D] leading-relaxed">
              Preserving traditional Vedic rituals, daily Maha Aartis, sacred chanting, and fostering spiritual connection among all generations.
            </p>
          </Card>

          <Card className="p-6 bg-white border border-[#E9DED1] hover:shadow-warm-md transition-shadow">
            <div className="w-12 h-12 rounded-full bg-[#FEE2E2] border border-[#FCA5A5] flex items-center justify-center text-2xl mb-4">
              🤝
            </div>
            <h3 className="text-base font-bold text-[#241A17] mb-2">Seva (Service)</h3>
            <p className="text-xs sm:text-sm text-[#6B625D] leading-relaxed">
              Extending continuous support to the underprivileged through medical camps, blood donation drives, and hot meal distributions.
            </p>
          </Card>

          <Card className="p-6 bg-white border border-[#E9DED1] hover:shadow-warm-md transition-shadow">
            <div className="w-12 h-12 rounded-full bg-[#FEF3C7] border border-[#FDE68A] flex items-center justify-center text-2xl mb-4">
              🌱
            </div>
            <h3 className="text-base font-bold text-[#241A17] mb-2">Eco-Prakriti</h3>
            <p className="text-xs sm:text-sm text-[#6B625D] leading-relaxed">
              100% committed to sustainable festival practices: clay murtis, zero single-use plastics, and artificial eco-immersion tanks.
            </p>
          </Card>

          <Card className="p-6 bg-white border border-[#E9DED1] hover:shadow-warm-md transition-shadow">
            <div className="w-12 h-12 rounded-full bg-[#DCFCE7] border border-[#86EFAC] flex items-center justify-center text-2xl mb-4">
              👥
            </div>
            <h3 className="text-base font-bold text-[#241A17] mb-2">Yuva Shakti</h3>
            <p className="text-xs sm:text-sm text-[#6B625D] leading-relaxed">
              Channeling youth energy into productive leadership, community disaster preparedness, and inter-generational respect.
            </p>
          </Card>
        </div>
      </Section>

      {/* 4. What We Do */}
      <Section
        eyebrow="OUR WORK"
        title="Year-Round Community Initiatives"
        description="Our engagement extends far beyond the 10 festive days of Ganesh Utsav."
        align="left"
        background="white"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 bg-[#FFF8EE] border border-[#E9DED1]">
            <span className="text-3xl mb-3 inline-block">🩸</span>
            <h3 className="text-lg font-bold text-[#241A17] mb-1.5">Blood Donation Drives</h3>
            <p className="text-xs sm:text-sm text-[#6B625D] leading-relaxed">
              Conducting annual voluntary blood camps contributing 150+ units every year to state trauma centers and thalassemia patients.
            </p>
          </Card>

          <Card className="p-6 bg-[#FFF8EE] border border-[#E9DED1]">
            <span className="text-3xl mb-3 inline-block">🍲</span>
            <h3 className="text-lg font-bold text-[#241A17] mb-1.5">Maha Anna Seva</h3>
            <p className="text-xs sm:text-sm text-[#6B625D] leading-relaxed">
              Serving satvik cooked meals to over 3,500 devotees, senior citizens, and needy community members during festival days.
            </p>
          </Card>

          <Card className="p-6 bg-[#FFF8EE] border border-[#E9DED1]">
            <span className="text-3xl mb-3 inline-block">🏏</span>
            <h3 className="text-lg font-bold text-[#241A17] mb-1.5">Youth Sports Tournaments</h3>
            <p className="text-xs sm:text-sm text-[#6B625D] leading-relaxed">
              Organizing neighborhood cricket, badminton, and athletic meets to inspire healthy active lifestyles and youth brotherhood.
            </p>
          </Card>
        </div>
      </Section>

      {/* 5. Join / Support CTA */}
      <Section
        eyebrow="GET INVOLVED"
        title="Be Part of Our Community Mission"
        description="Whether you wish to register as an active volunteer or support our cultural and welfare drives through a voluntary donation, we welcome you."
        align="center"
      >
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link to="/contact">
            <Button variant="primary" size="lg" className="font-bold shadow-festive">
              Join as a Youth Volunteer →
            </Button>
          </Link>
          <Link to="/donate">
            <Button variant="secondary" size="lg" className="font-bold">
              Contribute Online (UPI) ❤️
            </Button>
          </Link>
        </div>
      </Section>
    </div>
  );
};
