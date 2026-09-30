import React, { useEffect, useState, useCallback } from 'react';
import { Container } from '../components/layout/Container';
import { Section } from '../components/layout/Section';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';
import { SectionHeader } from '../components/content/SectionHeader';
import { usePageMeta } from '../hooks/usePageMeta';
import { apiService } from '../services/api';
import { ActivityItem } from '../types';

export const ActivitiesPage: React.FC = () => {
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
      setError(err?.message || 'Failed to load activities. Please check server connection.');
    } finally {
      setLoading(false);
    }
  }, [page, selectedCategory]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

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
              <Badge variant="saffron">ACTIVITIES & SEVA</Badge>
              <Badge variant="neutral">COMMUNITY INITIATIVES</Badge>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-stone-900 tracking-tight mb-3">
              Community Activities & Events
            </h1>
            <p className="text-base sm:text-lg text-stone-600 leading-relaxed">
              From festival organization and prasad distribution to voluntary welfare programs, sports competitions, and youth camps.
            </p>
          </div>
        </Container>
      </section>

      {/* Main Activities Section */}
      <Section background="default" size="lg">
        <Container size="lg">
          <div className="space-y-8">
            <SectionHeader
              badge="PROGRAMS"
              title="Club Activities & Welfare Programs"
              subtitle="Browse active programs and upcoming events organized by our committee."
            />

            {/* Category Filter Bar */}
            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex items-center flex-wrap gap-2">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider mr-2">
                Category:
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
                  {cat}
                </button>
              ))}
            </div>

            {/* Content Handling */}
            {loading ? (
              <LoadingState message="Loading club activities..." />
            ) : error ? (
              <ErrorState
                title="Unable to load activities"
                message={error}
                onRetry={fetchActivities}
              />
            ) : activities.length === 0 ? (
              <EmptyState
                title="No activities available yet."
                description="Activity schedules and official welfare event reports will appear here as they are officially announced by Mahaveer Youth Club Banza."
              />
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activities.map((activity) => (
                    <div
                      key={activity.id}
                      className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                    >
                      <div>
                        {activity.image && (
                          <div className="aspect-16/9 bg-stone-100 overflow-hidden">
                            <img
                              src={activity.image}
                              alt={activity.title}
                              className="w-full h-full object-cover"
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
