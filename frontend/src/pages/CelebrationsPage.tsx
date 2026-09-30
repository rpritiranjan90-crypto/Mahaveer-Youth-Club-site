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
import { apiService } from '../services/api';
import { GalleryPhoto } from '../types';

export const CelebrationsPage: React.FC = () => {
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

  // Load filter metadata (dynamic years and categories)
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
      setError(err?.message || 'Failed to load celebration photos.');
    } finally {
      setLoading(false);
    }
  }, [page, selectedYear, selectedCategory]);

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
    <div>
      {/* Page Header */}
      <section className="bg-gradient-to-b from-orange-50/50 to-[#FCFBF9] py-12 sm:py-16 border-b border-stone-200">
        <Container size="lg">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="saffron">CELEBRATIONS & PUJA</Badge>
              <Badge variant="neutral">PHOTO ARCHIVE</Badge>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-stone-900 tracking-tight mb-3">
              Celebrations & Festivities
            </h1>
            <p className="text-base sm:text-lg text-stone-600 leading-relaxed">
              Explore the devotion, cultural vibrancy, and festive moments of Sri Ganesh Puja celebrations organized by Mahaveer Youth Club Banza.
            </p>
          </div>
        </Container>
      </section>

      {/* Main Gallery Section */}
      <Section background="default" size="lg">
        <Container size="lg">
          <div className="space-y-8">
            <SectionHeader
              badge="PHOTO GALLERY"
              title="Festival Moments & Archives"
              subtitle="Filter celebration photos by year and category. Dynamic years are retrieved automatically."
            />

            {loading ? (
              <LoadingState message="Loading celebration photos..." />
            ) : error ? (
              <ErrorState
                title="Unable to load gallery"
                message={error}
                onRetry={fetchPhotos}
              />
            ) : (
              <>
                <GalleryGrid
                  photos={photos}
                  availableYears={availableYears}
                  availableCategories={availableCategories}
                  selectedYear={selectedYear}
                  selectedCategory={selectedCategory}
                  onYearChange={handleYearChange}
                  onCategoryChange={handleCategoryChange}
                />

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-6">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      Previous
                    </Button>
                    <span className="text-xs text-stone-600 px-3">
                      Page {page} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    >
                      Next
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
