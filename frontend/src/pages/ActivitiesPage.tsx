import React, { useEffect, useState, useCallback } from 'react';
import { Container } from '../components/layout/Container';
import { Section } from '../components/layout/Section';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';
import { usePageMeta } from '../hooks/usePageMeta';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { useLanguage } from '../context/LanguageContext';
import { apiService } from '../services/api';
import { resolveMediaUrl } from '../utils/media';
import { ActivityItem } from '../types';

export const ActivitiesPage: React.FC = () => {
  const { t } = useLanguage();
  const pageRef = useScrollReveal<HTMLDivElement>({ threshold: 0.1 });

  usePageMeta({
    title: 'Activities & Programs — Mahaveer Youth Club Banza',
    description: 'Explore community service, welfare drives, and cultural programs organized by Mahaveer Youth Club Banza.',
  });

  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  const categories = ['All', 'Puja & Rituals', 'Community Seva', 'Sports & Culture', 'Other'];

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getPublicActivities(
        page,
        12,
        selectedCategory !== 'All' ? selectedCategory : undefined
      );
      setActivities(data.items);
      setTotalPages(data.total_pages);
    } catch (err: any) {
      setError(err?.message || t('activities.error'));
    } finally {
      setLoading(false);
    }
  }, [page, selectedCategory, t]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setPage(1);
  };

  return (
    <div ref={pageRef}>
      {/* Page Header */}
      <section className="bg-gradient-to-b from-orange-50/60 to-[#FCFBF9] py-10 sm:py-14 border-b border-stone-200">
        <Container size="lg">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="saffron">{t('activities.badge.seva')}</Badge>
              <Badge variant="neutral">{t('activities.badge.initiatives')}</Badge>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-stone-900 tracking-tight mb-3">
              {t('activities.title')}
            </h1>
            <p className="text-base sm:text-lg text-stone-600 leading-relaxed">
              {t('activities.subtitle')}
            </p>
          </div>
        </Container>
      </section>

      {/* Main Activities Section */}
      <Section background="default" size="md">
        <Container size="lg">
          <div className="space-y-6">

            {/* Category Filter Bar */}
            <div className="reveal-on-scroll bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex items-center flex-wrap gap-2">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider mr-2">
                {t('common.category')}
              </span>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleCategoryChange(cat)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    selectedCategory === cat
                      ? 'bg-orange-600 text-white shadow-xs'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  {cat === 'All' ? t('common.all') : cat}
                </button>
              ))}
            </div>

            {/* Content Handling */}
            {loading ? (
              <LoadingState message={t('activities.loading')} />
            ) : error ? (
              <ErrorState
                title={t('activities.error')}
                message={error}
                onRetry={fetchActivities}
              />
            ) : activities.length === 0 ? (
              <EmptyState
                title={t('activities.empty.title')}
                description={t('activities.empty.desc')}
              />
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activities.map((activity, index) => (
                    <div
                      key={activity.id}
                      className={`reveal-on-scroll stagger-${(index % 3) + 1} card-interactive bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs flex flex-col justify-between`}
                    >
                      <div>
                        {activity.image && (
                          <div className="aspect-16/9 bg-stone-100 overflow-hidden">
                            <img
                              src={resolveMediaUrl(activity.image)}
                              alt={activity.title}
                              className="w-full h-full object-cover transition-transform duration-300 hover:scale-103"
                              loading="lazy"
                            />
                          </div>
                        )}
                        <div className="p-5 space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <Badge variant="saffron">{activity.category}</Badge>
                            <span className="text-xs text-stone-500 font-medium">
                              {activity.date}
                            </span>
                          </div>
                          <h3 className="text-base font-bold text-stone-900">
                            {activity.title}
                          </h3>
                          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed whitespace-pre-line">
                            {activity.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
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
