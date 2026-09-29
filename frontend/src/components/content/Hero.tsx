import React from 'react';
import { Container } from '../layout/Container';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export interface HeroProps {
  eyebrow?: string;
  heading?: string;
  description?: string;
  primaryCtaText?: string;
  primaryCtaAction?: () => void;
  secondaryCtaText?: string;
  secondaryCtaAction?: () => void;
  imageSrc?: string;
  imageAlt?: string;
}

export const Hero: React.FC<HeroProps> = ({
  eyebrow = 'GANPATI BAPPA MORYA',
  heading = 'Celebrating faith, tradition and community together.',
  description = 'Welcome to the official portal of Mahaveer Youth Club. Join us for our annual Ganesh Utsav rituals, cultural celebrations, and community social welfare drives.',
  primaryCtaText = 'Donate Now ❤️',
  primaryCtaAction,
  secondaryCtaText = 'Explore Puja & Story',
  secondaryCtaAction,
  imageSrc,
  imageAlt = 'Lord Ganesha Festive Sculpture',
}) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-[#FFF8EE] via-[#FFF3E0]/40 to-[#FFF8EE] border-b border-[#E9DED1] py-12 sm:py-16 md:py-24">
      {/* Decorative Traditional Motifs */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-[#FFEDD5]/40 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-[#FEE2E2]/30 blur-3xl pointer-events-none" />

      <Container size="lg">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Typography & CTAs */}
          <div className="lg:col-span-7 text-left flex flex-col items-start space-y-5 sm:space-y-6">
            {eyebrow && (
              <Badge variant="maroon" size="md" className="font-bold tracking-wider uppercase">
                {eyebrow}
              </Badge>
            )}

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-extrabold text-[#241A17] tracking-tight leading-[1.15]">
              {heading}
            </h1>

            <p className="text-base sm:text-lg text-[#6B625D] leading-relaxed max-w-xl">
              {description}
            </p>

            <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-2 w-full sm:w-auto">
              <Button
                variant="primary"
                size="lg"
                onClick={primaryCtaAction}
                className="font-bold shadow-festive"
              >
                {primaryCtaText}
              </Button>

              {secondaryCtaText && (
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={secondaryCtaAction}
                  className="font-semibold"
                >
                  {secondaryCtaText}
                </Button>
              )}
            </div>

            {/* Micro Highlights */}
            <div className="pt-4 border-t border-[#E9DED1] grid grid-cols-3 gap-4 w-full max-w-lg">
              <div>
                <span className="block text-xl sm:text-2xl font-extrabold text-[#8B1E1E]">25+</span>
                <span className="text-xs text-[#6B625D]">Years of Legacy</span>
              </div>
              <div>
                <span className="block text-xl sm:text-2xl font-extrabold text-[#F97316]">10</span>
                <span className="text-xs text-[#6B625D]">Days of Festivities</span>
              </div>
              <div>
                <span className="block text-xl sm:text-2xl font-extrabold text-[#D4A017]">100%</span>
                <span className="text-xs text-[#6B625D]">Community Driven</span>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Frame */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-sm sm:max-w-md bg-white p-3 sm:p-4 rounded-card border-2 border-[#E9DED1] shadow-warm-lg">
              <div className="relative aspect-4/5 w-full rounded-lg overflow-hidden bg-gradient-to-tr from-[#FFEDD5] to-[#FEF3C7] flex flex-col items-center justify-center p-6 text-center border border-[#FDBA74]">
                {imageSrc ? (
                  <img
                    src={imageSrc}
                    alt={imageAlt}
                    className="w-full h-full object-cover object-center rounded"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="w-24 h-24 rounded-full bg-white/80 border-2 border-[#D4A017] flex items-center justify-center text-5xl shadow-sm">
                      🕉️
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-xl font-bold text-[#8B1E1E]">Shree Ganesha</h3>
                      <p className="text-xs text-[#6B625D] max-w-xs">
                        Vighnaharta • Sukhkarta • Mangalmurti
                      </p>
                    </div>
                    <div className="inline-flex items-center space-x-1.5 bg-[#8B1E1E] text-white text-xs font-semibold px-3 py-1 rounded-full shadow-2xs">
                      <span>Annual Ganesh Utsav 2026</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-3 text-center text-xs font-medium text-[#6B625D] flex items-center justify-center gap-1">
                <span>📍</span>
                <span>Main Pandal • Mahaveer Youth Club Ground</span>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};
