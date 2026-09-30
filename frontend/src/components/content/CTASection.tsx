import React from 'react';
import { Link } from 'react-router-dom';
import { Container } from '../layout/Container';
import { Button } from '../ui/Button';

export interface CTASectionProps {
  title: string;
  description: string;
  primaryAction: {
    label: string;
    to: string;
  };
  secondaryAction?: {
    label: string;
    to: string;
  };
  variant?: 'warm' | 'maroon' | 'stone';
}

export const CTASection: React.FC<CTASectionProps> = ({
  title,
  description,
  primaryAction,
  secondaryAction,
  variant = 'warm',
}) => {
  const bgStyles = {
    warm: 'bg-gradient-to-br from-orange-600 to-amber-700 text-white',
    maroon: 'bg-gradient-to-br from-rose-900 to-stone-900 text-white',
    stone: 'bg-stone-900 text-white border border-stone-800',
  }[variant];

  return (
    <section className="py-12 sm:py-16">
      <Container size="lg">
        <div className={`rounded-2xl p-8 sm:p-12 text-center shadow-lg ${bgStyles}`}>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3">
            {title}
          </h2>
          <p className="text-sm sm:text-base text-white/90 max-w-2xl mx-auto mb-8 leading-relaxed">
            {description}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to={primaryAction.to} className="w-full sm:w-auto">
              <Button
                variant="white"
                size="lg"
                className="w-full sm:w-auto font-bold shadow-md"
              >
                {primaryAction.label}
              </Button>
            </Link>
            {secondaryAction && (
              <Link to={secondaryAction.to} className="w-full sm:w-auto">
                <Button
                  variant="white-outline"
                  size="lg"
                  className="w-full sm:w-auto font-semibold"
                >
                  {secondaryAction.label}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
};
