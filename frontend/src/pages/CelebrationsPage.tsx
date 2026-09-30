import React, { useEffect, useState, useCallback } from 'react';
import { Container } from '../components/layout/Container';
import { Section } from '../components/layout/Section';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { SectionHeader } from '../components/content/SectionHeader';
import { GalleryGrid } from '../components/gallery/GalleryGrid';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';
import { usePageMeta } from '../hooks/usePageMeta';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { useLanguage } from '../context/LanguageContext';
import { apiService } from '../services/api';
import { GalleryPhoto } from '../types';

export const CelebrationsPage: React.FC = () => {
  const { t } = useLanguage();
  const pageRef = useScrollReveal<HTMLDivElement>({ threshold: 0.1 });

  usePageMeta({
    title: 'Celebrations & Gallery — Mahaveer Youth Club Banza',
    description: 'Explore photos and moments from annual Ganesh Chaturthi celebrations and community festivals at Mahaveer Youth Club Banza.',
  });

  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [availableYears, setAvailableYears] = useState<string[]>(['All']);
  const [availableCategories, setAvailableCategories] = useState<string[]>(['All']);
  const [selectedYear, setSelectedYear] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Load filter metadata (dynamic years and categories from API)
  useEffect(() => {
    Promise.all([apiService.getGalleryYears(), apiService.getGalleryCategories()])
      .then(([yearsData, catsData]) => {
        if (yearsData?.years?.length) {
          setAvailableYears(['All', ...yearsData.years]);
        }
        if (catsData?.categories?.length) {
          setAvailableCategories(['All', ...catsData.categories]);
        }
      })
      .catch((err) => {
        console.warn('Failed to load gallery filter metadata:', err);
      });
  }, []);

  const fetchPhotos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getPublicGallery(
        page,
        24,
        selectedYear !== 'All' ? selectedYear : undefined,
        selectedCategory !== 'All' ? selectedCategory : undefined
      );
      setPhotos(data.items);
      setTotalPages(data.total_pages);
    } catch (err: any) {
      setError(err?.message || t('celebrations.error'));
    } finally {
      setLoading(false);
    }
  }, [page, selectedYear, selectedCategory, t]);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  const handleYearChange = (year: string) => {
    setSelectedYear(year);
    setPage(1);
  };

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setPage(1);
  };

  return (
    <div ref={pageRef}>
      {/* Page Header */}
      <section className="bg-gradient-to-b from-orange-50/60 to-[#FCFBF9] py-12 sm:py-16 border-b border-stone-200">
        <Container size="lg">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="saffron">{t('celebrations.badge.puja')}</Badge>
              <Badge variant="neutral">{t('celebrations.badge.archive')}</Badge>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-stone-900 tracking-tight mb-3">
              {t('celebrations.title')}
            </h1>
            <p className="text-base sm:text-lg text-stone-600 leading-relaxed">
              {t('celebrations.subtitle')}
            </p>
          </div>
        </Container>
      </section>

      {/* Main Gallery Section */}
      <Section background="default" size="lg">
        <Container size="lg">
          <div className="space-y-8">
            <div className="reveal-on-scroll">
              <SectionHeader
                badge={t('celebrations.gallery.badge')}
                title={t('celebrations.gallery.title')}
                subtitle={t('celebrations.gallery.subtitle')}
              />
            </div>

            {loading ? (
              <LoadingState message={t('celebrations.loading')} />
            ) : error ? (
              <ErrorState
                title={t('celebrations.error')}
                message={error}
                onRetry={fetchPhotos}
              />
            ) : (
              <>
                <div className="reveal-on-scroll">
                  <GalleryGrid
                    photos={photos}
                    availableYears={availableYears}
                    availableCategories={availableCategories}
                    selectedYear={selectedYear}
                    selectedCategory={selectedCategory}
                    onYearChange={handleYearChange}
                    onCategoryChange={handleCategoryChange}
                  />
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="reveal-on-scroll flex items-center justify-center gap-2 pt-6">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      {t('common.previous')}
                    </Button>
                    <span className="text-xs text-stone-600 px-3 font-mono">
                      {t('common.pageOf', { page, totalPages })}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    >
                      {t('common.next')}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </Container>
      </Section>
    </div>
  );
};
