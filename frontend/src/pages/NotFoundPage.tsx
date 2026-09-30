import React from 'react';
import { Link } from 'react-router-dom';
import { Container } from '../components/layout/Container';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { usePageMeta } from '../hooks/usePageMeta';
import { useLanguage } from '../context/LanguageContext';

export const NotFoundPage: React.FC = () => {
  const { t } = useLanguage();

  usePageMeta({
    title: '404 — Page Not Found',
    description: 'The requested page route could not be found.',
  });

  return (
    <div className="py-20 sm:py-28 text-center">
      <Container size="md">
        <Card className="p-8 sm:p-12 bg-white border border-stone-200 shadow-sm max-w-lg mx-auto">
          <div className="flex justify-center mb-4">
            <Badge variant="error">ERROR 404</Badge>
          </div>
          <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight mb-2">
            {t('notFound.title')}
          </h1>
          <p className="text-sm text-stone-600 max-w-sm mx-auto leading-relaxed mb-6">
            {t('notFound.desc')}
          </p>

          <Link to="/">
            <Button variant="primary" size="lg" className="font-bold">
              {t('notFound.returnHome')}
            </Button>
          </Link>
        </Card>
      </Container>
    </div>
  );
};
