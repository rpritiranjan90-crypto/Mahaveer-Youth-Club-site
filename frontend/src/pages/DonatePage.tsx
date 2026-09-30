import React from 'react';
import { Container } from '../components/layout/Container';
import { Section } from '../components/layout/Section';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { SectionHeader } from '../components/content/SectionHeader';
import { usePageMeta } from '../hooks/usePageMeta';

export const DonatePage: React.FC = () => {
  usePageMeta({
    title: 'Donation & Contributions — Mahaveer Youth Club Banza',
    description: 'Informational guide for voluntary contributions to Mahaveer Youth Club Banza Sri Ganesh Puja and welfare initiatives.',
  });

  return (
    <div>
      {/* Page Header */}
      <section className="bg-gradient-to-b from-orange-50/50 to-[#FCFBF9] py-12 sm:py-16 border-b border-stone-200">
        <Container size="lg">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="saffron">DONATIONS & SEVA</Badge>
              <Badge variant="neutral">VOLUNTARY CONTRIBUTIONS</Badge>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-stone-900 tracking-tight mb-3">
              Support Our Community Initiatives
            </h1>
            <p className="text-base sm:text-lg text-stone-600 leading-relaxed">
              Voluntary contributions directly support our annual Sri Ganesh Puja, prasad distribution, pandal arrangements, and neighborhood welfare seva in Banza.
            </p>
          </div>
        </Container>
      </section>

      {/* Main Donation Guidelines */}
      <Section background="default" size="lg">
        <Container size="lg">
          <div className="max-w-4xl mx-auto space-y-8">
            <SectionHeader
              badge="CONTRIBUTION MODES"
              title="How You Can Contribute"
              subtitle="All contributions are received with gratitude and utilized transparently for festival arrangements and charitable activities."
              align="center"
            />

            {/* Recipient Verification Warning */}
            <div className="p-4 sm:p-5 bg-amber-50 border-l-4 border-amber-500 rounded-r-xl shadow-2xs">
              <div className="flex items-start space-x-3">
                <span className="text-2xl shrink-0" aria-hidden="true">⚠️</span>
                <div>
                  <h3 className="text-sm font-bold text-amber-900">
                    Important Recipient Verification Notice
                  </h3>
                  <p className="text-xs sm:text-sm text-amber-800 mt-1 leading-relaxed">
                    Please verify the recipient name shown in your UPI app before completing the payment.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              {/* Mode 1: Digital UPI Payment */}
              <Card className="p-6 sm:p-8 bg-white border border-stone-200 space-y-6">
                <div className="flex items-center space-x-3 border-b border-stone-100 pb-4">
                  <span className="w-10 h-10 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-lg">
                    📱
                  </span>
                  <div>
                    <h3 className="font-bold text-stone-900 text-lg">1. UPI Digital Payment</h3>
                    <p className="text-xs text-stone-500">Fast & direct mobile transfer</p>
                  </div>
                </div>

                {/* QR Code Placeholder Box */}
                <div className="flex flex-col items-center justify-center p-8 bg-stone-50 rounded-xl border-2 border-dashed border-stone-300 text-center space-y-3">
                  <div className="w-40 h-40 bg-stone-200 rounded-lg flex flex-col items-center justify-center p-3 text-stone-500 text-xs text-center border border-stone-300">
                    <span className="text-3xl mb-1" aria-hidden="true">📷</span>
                    <span className="font-semibold text-stone-600">
                      [OFFICIAL UPI QR — TO BE PROVIDED]
                    </span>
                  </div>
                  <span className="text-xs text-stone-500">
                    Scan using any UPI App (GPay, PhonePe, Paytm, BHIM)
                  </span>
                </div>

                {/* Official UPI ID Field */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
                    Official Club UPI ID
                  </label>
                  <div className="p-3 bg-stone-100 rounded-lg border border-stone-200 text-center font-mono text-sm font-bold text-stone-800 select-all">
                    [OFFICIAL UPI ID — TO BE PROVIDED]
                  </div>
                </div>
              </Card>

              {/* Mode 2: Cash & In-Person Contribution */}
              <Card className="p-6 sm:p-8 bg-white border border-stone-200 space-y-6">
                <div className="flex items-center space-x-3 border-b border-stone-100 pb-4">
                  <span className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-lg">
                    💵
                  </span>
                  <div>
                    <h3 className="font-bold text-stone-900 text-lg">2. Cash / Direct Chanda</h3>
                    <p className="text-xs text-stone-500">In-person pandal donations</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-stone-50 rounded-lg border border-stone-200">
                    <h4 className="font-bold text-stone-900 text-sm mb-1">
                      Pandal Counter Guidance
                    </h4>
                    <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                      Cash donations may be handed over to authorized club seniors at the pandal.
                    </p>
                  </div>

                  <div className="space-y-2 text-xs text-stone-600 leading-relaxed">
                    <h5 className="font-bold text-stone-800 uppercase tracking-wide">
                      What your contribution supports:
                    </h5>
                    <ul className="space-y-1.5 list-disc list-inside">
                      <li>Sri Ganesh murti installation and daily rituals</li>
                      <li>Community prasad distribution (Bhog seva)</li>
                      <li>Pandal decoration, sound, and lighting arrangements</li>
                      <li>Neighborhood cleanliness and social seva drives</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-orange-50/60 rounded-lg border border-orange-200/80 text-xs text-orange-900">
                    <p className="font-semibold mb-0.5">Physical Chanda Receipts:</p>
                    <p className="text-orange-800">
                      Authorized senior members issue physical counterfoil receipts for all in-person contributions at the puja mandap.
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* General Policy Note */}
            <div className="p-6 bg-stone-100 rounded-xl border border-stone-200 text-center text-xs text-stone-600 max-w-2xl mx-auto">
              Mahaveer Youth Club Banza expresses sincere thanks to all well-wishers and village devotees for their continuous support.
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
};
