import React from 'react';
import { Container } from '../components/layout/Container';
import { Section } from '../components/layout/Section';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { SectionHeader } from '../components/content/SectionHeader';
import { usePageMeta } from '../hooks/usePageMeta';

export const ContactPage: React.FC = () => {
  usePageMeta({
    title: 'Contact Us — Mahaveer Youth Club Banza',
    description: 'Official contact details, location directions, and communication channels for Mahaveer Youth Club Banza.',
  });

  return (
    <div>
      {/* Page Header */}
      <section className="bg-gradient-to-b from-orange-50/50 to-[#FCFBF9] py-12 sm:py-16 border-b border-stone-200">
        <Container size="lg">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="saffron">GET IN TOUCH</Badge>
              <Badge variant="neutral">COMMUNICATION CHANNELS</Badge>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-stone-900 tracking-tight mb-3">
              Contact Mahaveer Youth Club
            </h1>
            <p className="text-base sm:text-lg text-stone-600 leading-relaxed">
              Reach out to our organizing committee for puja inquiries, seva coordination, or location assistance in Banza.
            </p>
          </div>
        </Container>
      </section>

      {/* Main Contact Section */}
      <Section background="default" size="lg">
        <Container size="lg">
          <div className="max-w-4xl mx-auto space-y-10">
            <SectionHeader
              badge="COMMUNICATION"
              title="Official Contact Channels"
              subtitle="Connect directly with our authorized coordinators through phone, messaging, or social channels."
            />

            {/* Contact Action Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* 1. Direct Call */}
              <Card className="p-6 bg-white border border-stone-200 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center text-2xl">
                    📞
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-900 text-base">Direct Call</h3>
                    <p className="text-xs text-stone-500">Official committee contact</p>
                  </div>
                  <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-200 text-xs font-mono text-stone-700 text-center select-all">
                    [OFFICIAL PHONE NUMBER — TO BE PROVIDED]
                  </div>
                </div>
                <div className="pt-4">
                  <Button variant="secondary" size="sm" className="w-full text-xs" disabled>
                    📞 Call Coordinator
                  </Button>
                </div>
              </Card>

              {/* 2. WhatsApp Messaging */}
              <Card className="p-6 bg-white border border-stone-200 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-2xl">
                    💬
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-900 text-base">WhatsApp</h3>
                    <p className="text-xs text-stone-500">Instant messaging support</p>
                  </div>
                  <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-200 text-xs font-mono text-stone-700 text-center select-all">
                    [OFFICIAL WHATSAPP NUMBER — TO BE PROVIDED]
                  </div>
                </div>
                <div className="pt-4">
                  <Button variant="secondary" size="sm" className="w-full text-xs" disabled>
                    💬 Message on WhatsApp
                  </Button>
                </div>
              </Card>

              {/* 3. Google Maps Directions */}
              <Card className="p-6 bg-white border border-stone-200 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center text-2xl">
                    📍
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-900 text-base">Location Directions</h3>
                    <p className="text-xs text-stone-500">Puja mandap location</p>
                  </div>
                  <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-200 text-xs font-mono text-stone-700 text-center select-all">
                    [OFFICIAL LOCATION DIRECTIONS — TO BE PROVIDED]
                  </div>
                </div>
                <div className="pt-4">
                  <Button variant="secondary" size="sm" className="w-full text-xs" disabled>
                    📍 Open in Google Maps
                  </Button>
                </div>
              </Card>

              {/* 4. Instagram */}
              <Card className="p-6 bg-white border border-stone-200 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center text-2xl">
                    📷
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-900 text-base">Instagram</h3>
                    <p className="text-xs text-stone-500">Festival media & reels</p>
                  </div>
                  <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-200 text-xs font-mono text-stone-700 text-center select-all">
                    [OFFICIAL INSTAGRAM — TO BE PROVIDED]
                  </div>
                </div>
                <div className="pt-4">
                  <Button variant="ghost" size="sm" className="w-full text-xs" disabled>
                    View Instagram Profile
                  </Button>
                </div>
              </Card>

              {/* 5. YouTube */}
              <Card className="p-6 bg-white border border-stone-200 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-red-100 text-red-700 flex items-center justify-center text-2xl">
                    ▶️
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-900 text-base">YouTube</h3>
                    <p className="text-xs text-stone-500">Live streaming & bhajans</p>
                  </div>
                  <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-200 text-xs font-mono text-stone-700 text-center select-all">
                    [OFFICIAL YOUTUBE — TO BE PROVIDED]
                  </div>
                </div>
                <div className="pt-4">
                  <Button variant="ghost" size="sm" className="w-full text-xs" disabled>
                    View YouTube Channel
                  </Button>
                </div>
              </Card>

              {/* 6. Physical Mandap Address Box */}
              <Card className="p-6 bg-stone-50 border border-stone-200 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-stone-200 text-stone-800 flex items-center justify-center text-2xl">
                    🏛️
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-900 text-base">Physical Address</h3>
                    <p className="text-xs text-stone-500">Banza Village, Odisha</p>
                  </div>
                  <p className="text-xs text-stone-600 font-mono">
                    [OFFICIAL ADDRESS — TO BE PROVIDED]
                  </p>
                </div>
                <div className="pt-4 text-[11px] text-stone-500">
                  Visitor hours: Open daily during Ganesh Utsav festivities.
                </div>
              </Card>
            </div>

            {/* In-Person Meeting Note */}
            <div className="p-5 bg-stone-100 rounded-xl border border-stone-200 text-center text-xs text-stone-600">
              For official representation and community queries, please meet our authorized coordinators at the Sri Ganesh Puja Mandap in Banza.
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
};
