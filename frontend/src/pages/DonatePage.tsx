import React from 'react';
import { Container } from '../components/layout/Container';
import { Section } from '../components/layout/Section';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { Alert } from '../components/ui/Alert';
import { DonationUI } from '../components/content/DonationUI';
import { clubInfo } from '../data/club';
import { usePageMeta } from '../utils/seo';

export const DonatePage: React.FC = () => {
  usePageMeta({
    title: `Donate & Support — ${clubInfo.name}`,
    description: `Support ${clubInfo.name} Ganesh Utsav festivities, Maha Anna Seva, and annual voluntary blood donation drives via official UPI QR code.`,
  });

  return (
    <div className="space-y-0 text-left">
      {/* 1. Page Header */}
      <div className="bg-gradient-to-b from-[#FFF8EE] to-[#FFEDD5]/30 border-b border-[#E9DED1] py-12 sm:py-16">
        <Container size="lg">
          <div className="max-w-3xl">
            <Badge variant="maroon" size="md" className="mb-3 font-bold uppercase tracking-wider">
              VOLUNTARY CONTRIBUTION
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#241A17] tracking-tight">
              Support Our Puja & Community Seva
            </h1>
            <p className="text-base sm:text-lg text-[#6B625D] mt-4 leading-relaxed">
              Every voluntary rupee contributed directly empowers our 10-day Vedic rituals, community Maha Bhog distribution, and annual youth blood donation camps.
            </p>
          </div>
        </Container>
      </div>

      {/* 2. Official UPI QR Section */}
      <Section
        eyebrow="DIRECT UPI CONTRIBUTION"
        title="Official Club UPI QR Donation"
        description="Scan using Google Pay, PhonePe, Paytm, BHIM, or any certified UPI app on your mobile."
        align="center"
        background="white"
      >
        <DonationUI
          clubName={clubInfo.name}
          upiId={clubInfo.upiId}
        />
      </Section>

      {/* 3. Trust & Safety Guidelines */}
      <Section
        eyebrow="TRANSPARENCY & TRUST"
        title="Important Verification & Safety Guidelines"
        description="We uphold 100% financial discipline and public accountability."
        align="left"
      >
        <div className="space-y-6">
          <Alert variant="warning" title="Recipient Verification Notice">
            Please verify that the payee name shown in your UPI payment app displays <strong>{clubInfo.name}</strong> ({clubInfo.upiId}) before entering your UPI PIN and confirming payment.
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 bg-white border border-[#E9DED1]">
              <span className="text-2xl mb-2 inline-block">🍲</span>
              <h3 className="text-base font-bold text-[#241A17] mb-1.5">Where Your Seva Goes</h3>
              <p className="text-xs sm:text-sm text-[#6B625D] leading-relaxed">
                100% of collected funds are allocated directly to sacred Prasad ingredients, Vedic pandal artisans, cultural staging, and blood camp logistics.
              </p>
            </Card>

            <Card className="p-6 bg-white border border-[#E9DED1]">
              <span className="text-2xl mb-2 inline-block">📜</span>
              <h3 className="text-base font-bold text-[#241A17] mb-1.5">Digital Receipt Issuance</h3>
              <p className="text-xs sm:text-sm text-[#6B625D] leading-relaxed">
                By providing your 12-digit transaction UTR number above, your contribution is logged for official receipt verification by the club treasurer.
              </p>
            </Card>

            <Card className="p-6 bg-white border border-[#E9DED1]">
              <span className="text-2xl mb-2 inline-block">📊</span>
              <h3 className="text-base font-bold text-[#241A17] mb-1.5">Audited Accounts</h3>
              <p className="text-xs sm:text-sm text-[#6B625D] leading-relaxed">
                Annual financial statements and expenditure audit ledgers are publicly presented to all community members and patrons following festival conclusion.
              </p>
            </Card>
          </div>
        </div>
      </Section>

      {/* 4. Alternative Bank Transfer Info */}
      <Section
        eyebrow="OFFLINE & BANK TRANSFER"
        title="Direct Bank Account Transfer (NEFT / RTGS / IMPS)"
        description="For larger sponsorship contributions or organization patrons requiring direct bank ledger transfers."
        align="center"
        background="white"
      >
        <div className="max-w-xl mx-auto">
          <Card className="p-6 bg-[#FFF8EE] border border-[#E9DED1] text-left space-y-3 text-xs sm:text-sm text-[#241A17]">
            <div className="flex justify-between py-1.5 border-b border-[#E9DED1]">
              <span className="text-[#6B625D]">Account Name:</span>
              <strong className="font-semibold">{clubInfo.name}</strong>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#E9DED1]">
              <span className="text-[#6B625D]">Account Number:</span>
              <strong className="font-mono font-semibold">XXXXXXXXXXXX</strong>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#E9DED1]">
              <span className="text-[#6B625D]">IFSC Code:</span>
              <strong className="font-mono font-semibold">SBIN000XXXX</strong>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#E9DED1]">
              <span className="text-[#6B625D]">Bank & Branch:</span>
              <strong className="font-semibold">State Bank of India, Main Branch</strong>
            </div>
            <p className="text-[11px] text-[#6B625D] pt-2 italic text-center">
              Please email your transaction confirmation screenshot to <strong>{clubInfo.email}</strong> for formal receipt generation.
            </p>
          </Card>
        </div>
      </Section>
    </div>
  );
};
