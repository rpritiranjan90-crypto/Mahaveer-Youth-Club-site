import React, { useState } from 'react';
import { Container } from '../components/layout/Container';
import { Section } from '../components/layout/Section';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Select } from '../components/ui/Select';
import { Checkbox } from '../components/ui/Checkbox';
import { Alert } from '../components/ui/Alert';
import { clubInfo } from '../data/club';
import { usePageMeta } from '../utils/seo';

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: 'General Query',
    message: '',
    isVolunteer: false,
  });

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  usePageMeta({
    title: `Contact Us & Location — ${clubInfo.name}`,
    description: `Contact the organizing committee of ${clubInfo.name}. Pandal ground address, phone number, email, volunteer sign-up, and feedback form.`,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim() || !formData.message.trim()) {
      setError('Please fill in your name, contact phone number, and query message.');
      return;
    }

    setError(null);
    setIsLoading(true);

    // Simulated frontend submission response
    setTimeout(() => {
      setIsLoading(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <div className="space-y-0 text-left">
      {/* 1. Page Header */}
      <div className="bg-gradient-to-b from-[#FFF8EE] to-[#FFEDD5]/30 border-b border-[#E9DED1] py-12 sm:py-16">
        <Container size="lg">
          <div className="max-w-3xl">
            <Badge variant="maroon" size="md" className="mb-3 font-bold uppercase tracking-wider">
              REACH OUT
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#241A17] tracking-tight">
              Contact Us & Location
            </h1>
            <p className="text-base sm:text-lg text-[#6B625D] mt-4 leading-relaxed">
              We welcome devotees, prospective volunteers, neighborhood residents, and patrons. Get in touch with our executive committee members.
            </p>
          </div>
        </Container>
      </div>

      {/* 2. Contact Details Cards & Contact Form Grid */}
      <Section
        eyebrow="GET IN TOUCH"
        title="Send a Message or Visit Our Pandal"
        description="Fill out the form below or contact our volunteer coordinators directly."
        align="left"
        background="white"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form */}
          <div className="lg:col-span-7">
            <Card className="p-6 sm:p-8 bg-white border-2 border-[#E9DED1] shadow-warm-md">
              <h3 className="text-lg font-bold text-[#241A17] mb-1">Send an Inquiry or Feedback</h3>
              <p className="text-xs text-[#6B625D] mb-6">
                Our committee members review messages daily during festival season.
              </p>

              {submitted ? (
                <div className="py-8 text-center space-y-4 animate-fade-in">
                  <div className="w-14 h-14 bg-[#DCFCE7] text-[#15803D] rounded-full flex items-center justify-center text-2xl mx-auto border-2 border-[#86EFAC]">
                    ✓
                  </div>
                  <h4 className="text-lg font-bold text-[#241A17]">Message Received 🙏</h4>
                  <p className="text-xs sm:text-sm text-[#6B625D] max-w-sm mx-auto">
                    Thank you, <strong>{formData.name}</strong>. Your query regarding <em>"{formData.subject}"</em> has been received. Our volunteer coordinator will reach out to <strong>{formData.phone}</strong> soon.
                  </p>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({
                        name: '',
                        phone: '',
                        email: '',
                        subject: 'General Query',
                        message: '',
                        isVolunteer: false,
                      });
                    }}
                  >
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <Alert variant="error" title="Form Incomplete">
                      {error}
                    </Alert>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Full Name"
                      placeholder="Your full name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />

                    <Input
                      label="Mobile / WhatsApp"
                      placeholder="+91 98765 XXXXX"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Email Address (Optional)"
                      type="email"
                      placeholder="your.email@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />

                    <Select
                      label="Inquiry Category"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      options={[
                        { value: 'General Query', label: 'General Query' },
                        { value: 'Volunteer Sign-up', label: 'Volunteer Sign-up' },
                        { value: 'Maha Bhog / Puja Sponsorship', label: 'Maha Bhog / Puja Sponsorship' },
                        { value: 'Blood Donation Camp Registration', label: 'Blood Donation Camp Registration' },
                        { value: 'Media / Press Inquiry', label: 'Media / Press Inquiry' },
                      ]}
                    />
                  </div>

                  <Textarea
                    label="Your Message or Query"
                    placeholder="Describe how we can assist you..."
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                  />

                  <Checkbox
                    label="I am interested in joining as an active youth volunteer for Ganesh Utsav 2026"
                    checked={formData.isVolunteer}
                    onChange={(e) => setFormData({ ...formData, isVolunteer: e.target.checked })}
                  />

                  <div className="pt-2">
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      isLoading={isLoading}
                      fullWidth
                      className="font-bold shadow-festive"
                    >
                      Submit Message →
                    </Button>
                  </div>
                </form>
              )}
            </Card>
          </div>

          {/* Right Column: Contact Cards & Address */}
          <div className="lg:col-span-5 space-y-4">
            <Card className="p-6 bg-[#FFF8EE] border border-[#E9DED1]">
              <span className="text-2xl mb-2 inline-block">📍</span>
              <h4 className="text-sm font-bold text-[#241A17] uppercase tracking-wider mb-1">
                Main Pandal & Club Location
              </h4>
              <p className="text-xs sm:text-sm text-[#6B625D] leading-relaxed">
                {clubInfo.address}, {clubInfo.city}, {clubInfo.state} – {clubInfo.pincode}
              </p>
              <div className="mt-3 pt-3 border-t border-[#E9DED1] text-xs text-[#8B1E1E] font-semibold">
                Landmark: Near Community Hall & Ward 12 Main Park
              </div>
            </Card>

            <Card className="p-6 bg-[#FFF8EE] border border-[#E9DED1]">
              <span className="text-2xl mb-2 inline-block">📞</span>
              <h4 className="text-sm font-bold text-[#241A17] uppercase tracking-wider mb-1">
                Helpline & Coordination
              </h4>
              <p className="text-xs sm:text-sm text-[#6B625D]">
                Phone: <strong className="text-[#241A17]">{clubInfo.phone}</strong>
              </p>
              <p className="text-xs sm:text-sm text-[#6B625D] mt-1">
                Email: <strong className="text-[#241A17]">{clubInfo.email}</strong>
              </p>
              <p className="text-xs text-[#6B625D] mt-2">
                Available: 8:00 AM – 9:00 PM throughout festival season
              </p>
            </Card>

            <Card className="p-6 bg-[#FFF8EE] border border-[#E9DED1]">
              <span className="text-2xl mb-2 inline-block">👥</span>
              <h4 className="text-sm font-bold text-[#241A17] uppercase tracking-wider mb-1">
                Social Channels
              </h4>
              <p className="text-xs text-[#6B625D] mb-3">
                Watch live Aarti streams and event announcements:
              </p>
              <div className="flex flex-wrap gap-2 text-xs font-semibold">
                <a
                  href={clubInfo.socials.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded bg-white hover:bg-[#FFEDD5] border border-[#E9DED1] text-[#241A17] transition-colors"
                >
                  Instagram
                </a>
                <a
                  href={clubInfo.socials.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded bg-white hover:bg-[#FFEDD5] border border-[#E9DED1] text-[#241A17] transition-colors"
                >
                  Facebook
                </a>
                <a
                  href={clubInfo.socials.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded bg-white hover:bg-[#FFEDD5] border border-[#E9DED1] text-[#241A17] transition-colors"
                >
                  YouTube Live
                </a>
              </div>
            </Card>
          </div>
        </div>
      </Section>
    </div>
  );
};
