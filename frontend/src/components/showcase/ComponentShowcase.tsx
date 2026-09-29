import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/Card';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import { Checkbox } from '../ui/Checkbox';
import { Modal } from '../ui/Modal';
import { Spinner } from '../ui/Spinner';
import { Skeleton } from '../ui/Skeleton';
import { Alert } from '../ui/Alert';
import { EmptyState } from '../ui/EmptyState';
import { ErrorState } from '../ui/ErrorState';
import { Container } from '../layout/Container';
import { Section } from '../layout/Section';
import { Hero } from '../content/Hero';
import { UpdateCard } from '../content/UpdateCard';
import { ActivityCard } from '../content/ActivityCard';
import { Timeline, TimelineItem } from '../content/Timeline';
import { DonationUI } from '../content/DonationUI';
import { GalleryGrid } from '../gallery/GalleryGrid';
import { GalleryItem } from '../gallery/GalleryCard';

export const ComponentShowcase: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const [sampleInput, setSampleInput] = useState('');
  const [sampleError, setSampleError] = useState(false);

  const sampleTimeline: TimelineItem[] = [
    {
      year: '1998',
      title: 'Club Founded by Local Youths',
      description: 'Mahaveer Youth Club was established by enthusiastic community youths to celebrate the first neighborhood Ganesh Puja and organize youth sports.',
      tag: 'Inception',
    },
    {
      year: '2005',
      title: 'First Mega Vedic Pandal & Relief Drive',
      description: 'Expanded celebrations to a 10-day grand festival and launched the club’s annual flood relief and winter cloth distribution initiative.',
      tag: 'Milestone',
    },
    {
      year: '2015',
      title: 'Annual Blood Donation & Eco-Friendly Murti',
      description: 'Pioneered 100% biodegradable clay murtis with zero chemical dyes and partnered with district hospitals for annual voluntary blood donation camps.',
      tag: 'Social Seva',
    },
    {
      year: '2026',
      title: 'Silver Jubilee & Digital Community Portal',
      description: 'Celebrating 28+ years of uninterrupted community service, launching the official digital portal for devotees, volunteers, and patrons.',
      tag: 'Current Year',
    },
  ];

  const sampleGallery: GalleryItem[] = [
    {
      id: '1',
      title: 'Maha Aarti at Grand Pandal',
      year: '2025',
      category: 'Rituals',
      altText: 'Devotees offering Evening Maha Aarti with Diyas',
      description: 'Over 2,000 devotees gathered for the Sandhya Maha Aarti on Ganesh Chaturthi.',
    },
    {
      id: '2',
      title: 'Eco-Friendly Vedic Palace Theme',
      year: '2025',
      category: 'Pandal',
      altText: 'Traditional palace pandal illuminated with warm golden lights',
      description: 'Crafted entirely from sustainable bamboo, jute, and natural clay.',
    },
    {
      id: '3',
      title: 'Youth Cultural Bhajan Sandhya',
      year: '2024',
      category: 'Cultural',
      altText: 'Children and youth artists performing devotional songs',
      description: 'Annual cultural night encouraging young local musical talent.',
    },
    {
      id: '4',
      title: 'Annual Voluntary Blood Donation Camp',
      year: '2024',
      category: 'Social Work',
      altText: 'Volunteers and local residents donating blood',
      description: '150+ units of blood collected in partnership with Red Cross Society.',
    },
  ];

  return (
    <div className="space-y-16 pb-16 text-left">
      {/* Showcase Banner */}
      <div className="bg-[#8B1E1E] text-white py-6 border-b-4 border-[#F97316]">
        <Container size="lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-white/20 text-white text-xs font-semibold px-2.5 py-0.5 rounded-full mb-1.5">
                <span>🎨</span>
                <span>Phase 2 Technical Showcase</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                Design System & UI Component Foundation
              </h2>
              <p className="text-xs sm:text-sm text-red-100/90 mt-0.5">
                Visual building blocks for Traditional Indian Festival × Modern Minimal aesthetic.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="gold"
                size="sm"
                onClick={() => setModalOpen(true)}
              >
                Test Modal Dialog ↗
              </Button>
            </div>
          </div>
        </Container>
      </div>

      {/* 1. Hero Foundation Showcase */}
      <section>
        <Container size="lg">
          <h3 className="text-xs font-bold uppercase tracking-widest text-[#8B1E1E] mb-3">
            1. Hero Component Foundation
          </h3>
        </Container>
        <Hero
          eyebrow="GANPATI BAPPA MORYA"
          heading="Celebrating faith, tradition and community together."
          description="Welcome to Mahaveer Youth Club. Join us for our annual Ganesh Utsav rituals, cultural evenings, and round-the-year youth social welfare initiatives."
          primaryCtaText="Donate Now ❤️"
          secondaryCtaText="Explore Puja & Story"
        />
      </section>

      {/* 2. Color Palette & Typography */}
      <Section
        eyebrow="Tokens & Hierarchy"
        title="Color System & Typography Tokens"
        description="Carefully tailored traditional festival tones (Saffron, Maroon, Gold, Cream) matched with crisp Inter typography."
        align="left"
      >
        <div className="space-y-6">
          {/* Swatches */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            <div className="p-3 bg-white rounded-card border border-[#E9DED1] shadow-2xs">
              <div className="h-14 rounded-md bg-[#F97316] mb-2 shadow-2xs" />
              <p className="text-xs font-bold text-[#241A17]">Primary (Saffron)</p>
              <p className="text-[11px] font-mono text-[#6B625D]">#F97316</p>
            </div>
            <div className="p-3 bg-white rounded-card border border-[#E9DED1] shadow-2xs">
              <div className="h-14 rounded-md bg-[#8B1E1E] mb-2 shadow-2xs" />
              <p className="text-xs font-bold text-[#241A17]">Secondary (Maroon)</p>
              <p className="text-[11px] font-mono text-[#6B625D]">#8B1E1E</p>
            </div>
            <div className="p-3 bg-white rounded-card border border-[#E9DED1] shadow-2xs">
              <div className="h-14 rounded-md bg-[#D4A017] mb-2 shadow-2xs" />
              <p className="text-xs font-bold text-[#241A17]">Accent (Gold)</p>
              <p className="text-[11px] font-mono text-[#6B625D]">#D4A017</p>
            </div>
            <div className="p-3 bg-white rounded-card border border-[#E9DED1] shadow-2xs">
              <div className="h-14 rounded-md bg-[#FFF8EE] border border-[#E9DED1] mb-2 shadow-2xs" />
              <p className="text-xs font-bold text-[#241A17]">Warm Cream Bg</p>
              <p className="text-[11px] font-mono text-[#6B625D]">#FFF8EE</p>
            </div>
            <div className="p-3 bg-white rounded-card border border-[#E9DED1] shadow-2xs">
              <div className="h-14 rounded-md bg-white border border-[#E9DED1] mb-2 shadow-2xs" />
              <p className="text-xs font-bold text-[#241A17]">Surface White</p>
              <p className="text-[11px] font-mono text-[#6B625D]">#FFFFFF</p>
            </div>
            <div className="p-3 bg-white rounded-card border border-[#E9DED1] shadow-2xs">
              <div className="h-14 rounded-md bg-[#241A17] mb-2 shadow-2xs" />
              <p className="text-xs font-bold text-white">Main Text</p>
              <p className="text-[11px] font-mono text-[#8C827C]">#241A17</p>
            </div>
          </div>

          {/* Typography Scale */}
          <div className="p-5 bg-white rounded-card border border-[#E9DED1] space-y-3">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#241A17]">
              Hero Heading (36–48px) — Ganpati Bappa Morya
            </h1>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#241A17]">
              Page Heading (28–36px) — Annual Puja & Community Activities
            </h2>
            <h3 className="text-xl font-bold text-[#241A17]">
              Section Heading (20–24px) — Our Rich Cultural Heritage
            </h3>
            <p className="text-base text-[#241A17] leading-relaxed">
              Body Text (16px) — Mahaveer Youth Club has been organizing traditional community celebrations and welfare campaigns with transparency, devotion, and youth leadership.
            </p>
            <p className="text-xs sm:text-sm text-[#6B625D]">
              Small / Caption Text (12–14px) — Official registration: MYC-2026 • Verified Community Youth Organization.
            </p>
          </div>
        </div>
      </Section>

      {/* 3. Button & Badge System */}
      <Section
        eyebrow="Interactive Elements"
        title="Button & Badge Component System"
        description="Accessible button states (default, hover, active, disabled, loading) and semantic status badges."
        align="left"
        background="white"
      >
        <div className="space-y-6">
          {/* Buttons */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#6B625D]">
              Button Variants & Sizes
            </h4>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary" size="lg">
                Primary Large (Donate) →
              </Button>
              <Button variant="primary" size="md">
                Primary Medium
              </Button>
              <Button variant="primary" size="sm">
                Primary Small
              </Button>
              <Button variant="secondary" size="md">
                Secondary Button
              </Button>
              <Button variant="gold" size="md">
                Gold Accent
              </Button>
              <Button variant="outline" size="md">
                Outline Button
              </Button>
              <Button variant="text" size="md">
                Text Button →
              </Button>
              <Button variant="danger" size="md">
                Danger Action
              </Button>
              <Button
                variant="primary"
                size="md"
                isLoading={btnLoading}
                onClick={() => {
                  setBtnLoading(true);
                  setTimeout(() => setBtnLoading(false), 1500);
                }}
              >
                {btnLoading ? 'Processing...' : 'Click for Loading State'}
              </Button>
              <Button variant="primary" size="md" disabled>
                Disabled State
              </Button>
            </div>
          </div>

          {/* Badges */}
          <div className="space-y-3 pt-4 border-t border-[#F2E8DC]">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#6B625D]">
              Badge Variants
            </h4>
            <div className="flex flex-wrap items-center gap-2.5">
              <Badge variant="saffron" size="md">
                2026 Puja
              </Badge>
              <Badge variant="maroon" size="md">
                Ritual Highlight
              </Badge>
              <Badge variant="gold" size="md">
                Gold Sponsor
              </Badge>
              <Badge variant="success" size="md">
                Verified Donation
              </Badge>
              <Badge variant="warning" size="md">
                Pending Verification
              </Badge>
              <Badge variant="error" size="md">
                Alert Notice
              </Badge>
              <Badge variant="neutral" size="md">
                Community Update
              </Badge>
            </div>
          </div>

          {/* Card Structure Demo */}
          <div className="space-y-3 pt-4 border-t border-[#F2E8DC]">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#6B625D]">
              Standard Card Component Architecture
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card hoverable>
                <CardHeader>
                  <CardTitle>Standard Card Header</CardTitle>
                  <CardDescription>Subtle border and structured header slot</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-[#6B625D]">
                    This demonstrates the basic Card, CardHeader, CardContent, and CardFooter hierarchy.
                  </p>
                </CardContent>
                <CardFooter className="justify-between">
                  <span className="text-xs text-[#8C827C]">Card Footer Metadata</span>
                  <Button variant="secondary" size="sm">Action</Button>
                </CardFooter>
              </Card>

              <Card className="bg-[#FBF4EA]/60">
                <CardContent className="space-y-2">
                  <h4 className="font-bold text-[#8B1E1E]">Custom Accent Card Surface</h4>
                  <p className="text-sm text-[#6B625D]">
                    Cards use white surface or warm subtle background with rounded-card radius.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </Section>

      {/* 4. Form Controls */}
      <Section
        eyebrow="Form System"
        title="Form Input Controls & Validation States"
        description="Accessible inputs, textareas, selects, and checkboxes with error and helper text states."
        align="left"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-card border border-[#E9DED1]">
          <Input
            label="Full Name"
            placeholder="e.g. Ramesh Chandra Patra"
            value={sampleInput}
            onChange={(e) => setSampleInput(e.target.value)}
            helperText="Enter your official name for receipt issuance"
            required
          />

          <Input
            label="Phone Number"
            placeholder="+91 98765 43210"
            error={sampleError ? 'Please enter a valid 10-digit mobile number' : undefined}
            helperText={!sampleError ? 'WhatsApp number preferred for instant updates' : undefined}
            required
          />

          <Select
            label="Volunteer Department Preference"
            options={[
              { value: 'pandal', label: 'Pandal & Decoration Committee' },
              { value: 'crowd', label: 'Crowd Management & Security' },
              { value: 'prasad', label: 'Bhog & Prasad Distribution' },
              { value: 'cultural', label: 'Cultural Program Coordination' },
            ]}
          />

          <Textarea
            label="Special Message / Prayer Note"
            placeholder="Write your prayers, suggestions, or notes for the organizing committee..."
            rows={3}
          />

          <div className="md:col-span-2 pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <Checkbox
              label="I agree to receive puja updates & official digital receipts via WhatsApp/SMS"
              description="We respect devotee privacy. No spam guarantee."
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSampleError(!sampleError)}
            >
              Toggle Error Validation State
            </Button>
          </div>
        </div>
      </Section>

      {/* 5. Update Cards & Activity Cards */}
      <Section
        eyebrow="Content Cards"
        title="Update & Activity Card Systems"
        description="Structured cards for breaking notices, puja schedules, and welfare initiatives."
        align="left"
        background="white"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <UpdateCard
            category="Announcement"
            date="28 September 2026"
            title="Pandal Bhumi Pujan & Sthapana Ritual Schedule Announced"
            description="The auspicious Bhumi Pujan will take place this Sunday morning with Vedic chanting by local priests. Devotees are cordially invited."
          />
          <ActivityCard
            category="Ritual"
            date="Daily (10 Days)"
            time="7:30 AM & 8:00 PM"
            location="Mahaveer Youth Club Main Sanctum"
            title="Maha Aarti & Vedic Pushpanjali"
            description="Experience the divine morning and evening Aarti with live Dhaak drumming, traditional conch blowing, and Maha Prasad distribution."
          />
          <ActivityCard
            category="Welfare"
            date="Day 4 • 2:00 PM"
            location="Community Health Center"
            title="Annual Voluntary Blood Donation Camp"
            description="Our flagship youth social service initiative supporting district government hospital blood banks."
          />
        </div>
      </Section>

      {/* 6. History Timeline Component */}
      <Section
        eyebrow="Our Heritage"
        title="History Timeline Component"
        description="Visual milestone chronicle showcasing the club's founding and festive journey over 25+ years."
        align="center"
      >
        <Timeline items={sampleTimeline} />
      </Section>

      {/* 7. Gallery Grid & Lightbox */}
      <Section
        eyebrow="Visual Archive"
        title="Responsive Gallery System & Lightbox"
        description="Filtered grid layout (2 cols mobile, 3-4 cols desktop) with interactive modal image viewer."
        align="center"
        background="white"
      >
        <GalleryGrid items={sampleGallery} />
      </Section>

      {/* 8. Locked Donation UI Component */}
      <Section
        eyebrow="Donation Foundation"
        title="Official Club UPI QR Donation System"
        description="Clean, trustworthy, and locked Version 1 donation interface with preset amounts, UPI QR box, and reference entry."
        align="center"
      >
        <DonationUI
          clubName="Mahaveer Youth Club"
          upiId="mahaveeryouthclub@upi"
        />
      </Section>

      {/* 9. Feedback, Empty & Loading States */}
      <Section
        eyebrow="System States"
        title="Loading, Empty, Error & Alert States"
        description="Graceful handling of edge conditions without technical jargon."
        align="left"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Alerts */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#6B625D]">
              Alert Banners
            </h4>
            <Alert variant="info" title="Devotee Notice">
              Evening Maha Aarti will commence at 8:00 PM today due to cultural music rehearsals.
            </Alert>
            <Alert variant="success" title="Payment Recorded">
              Your contribution details have been saved for committee verification.
            </Alert>
            <Alert variant="warning" title="Weather Advisory">
              Light rain expected during evening procession. Covered pandal corridors are open.
            </Alert>
            <Alert variant="error" title="Submission Error">
              Please ensure the 12-digit UTR reference number is entered correctly.
            </Alert>
          </div>

          {/* Loaders & Skeletons */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#6B625D]">
              Loading Skeletons & Spinners
            </h4>
            <div className="p-5 bg-white rounded-card border border-[#E9DED1] space-y-3">
              <div className="flex items-center space-x-3">
                <Spinner size="md" color="saffron" />
                <Spinner size="md" color="maroon" />
                <Spinner size="md" color="gold" />
                <span className="text-xs text-[#6B625D]">Active Spinners</span>
              </div>
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="rectangular" height={36} />
              <div className="grid grid-cols-2 gap-2">
                <Skeleton variant="rectangular" height={40} />
                <Skeleton variant="rectangular" height={40} />
              </div>
            </div>
          </div>

          {/* Empty State */}
          <div className="md:col-span-1">
            <EmptyState
              title="No upcoming notices today"
              description="All current events are proceeding as per schedule. Check back later for breaking updates."
              actionLabel="Refresh Updates"
              onAction={() => alert('Empty state action triggered')}
            />
          </div>

          {/* Error State */}
          <div className="md:col-span-1">
            <ErrorState
              title="Unable to load festival updates"
              description="A temporary network issue occurred. Please verify your internet connection and try again."
              onRetry={() => alert('Retry triggered')}
            />
          </div>
        </div>
      </Section>

      {/* Modal Dialog */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Mahaveer Youth Club — Notice Modal"
        description="Accessible modal dialog with backdrop blur, keyboard navigation, and focus management."
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={() => setModalOpen(false)}>
              Acknowledge & Close
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-xs sm:text-sm text-[#6B625D] leading-relaxed">
          <p>
            This modal demonstrates the accessible dialog foundation. You can close it using the <strong>Escape key</strong>, by clicking the backdrop, or clicking the close button.
          </p>
          <div className="p-3 bg-[#FFF8EE] rounded border border-[#E9DED1] text-[#8B1E1E] font-medium">
            🚩 Ganpati Bappa Morya! All components in Phase 2 are verified and ready for Phase 3 page composition.
          </div>
        </div>
      </Modal>
    </div>
  );
};
