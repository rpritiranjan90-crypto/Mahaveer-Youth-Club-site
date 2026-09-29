import React from 'react';
import { Link } from 'react-router-dom';
import { Container } from '../components/layout/Container';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { usePageMeta } from '../utils/seo';

export const NotFoundPage: React.FC = () => {
  usePageMeta({
    title: '404 — Page Not Found',
    description: 'The requested page route could not be found.',
  });

  return (
    <div className="py-20 sm:py-28 text-center">
      <Container size="md">
        <Card className="p-8 sm:p-14 bg-white border-2 border-[#E9DED1] shadow-warm-lg max-w-lg mx-auto">
          <div className="w-20 h-20 rounded-full bg-[#FFEDD5] border-2 border-[#FDBA74] flex items-center justify-center text-4xl mx-auto mb-5 shadow-2xs">
            🐘
          </div>
          <span className="text-xs font-bold text-[#8B1E1E] uppercase tracking-widest bg-[#FEE2E2] px-3 py-1 rounded-full border border-[#FCA5A5] inline-block mb-3">
            ERROR 404
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#241A17] tracking-tight mb-2">
            Page Not Found
          </h1>
          <p className="text-xs sm:text-sm text-[#6B625D] max-w-sm mx-auto leading-relaxed mb-6">
            The page you are looking for might have been moved, renamed, or is temporarily unavailable.
          </p>

          <Link to="/">
            <Button variant="primary" size="lg" className="font-bold shadow-festive">
              ← Back to Home
            </Button>
          </Link>
        </Card>
      </Container>
    </div>
  );
};
