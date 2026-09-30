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
import { useScrollReveal } from '../hooks/useScrollReveal';
import { useLanguage } from '../context/LanguageContext';
import { apiService } from '../services/api';
import { UpdateItem } from '../types';

export const UpdatesPage: React.FC = () => {
  const { t } = useLanguage();
  const pageRef = useScrollReveal<HTMLDivElement>({ threshold: 0.1 });

  usePageMeta({
    title: 'Updates & Announcements — Mahaveer Youth Club Banza',
    description: 'Official notices, circulars, and announcements from Mahaveer Youth Club Banza committee.',
  });

  const [updates, setUpdates] = useState<UpdateItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>('');
  const [activeSearch, setActiveSearch] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [selectedUpdate, setSelectedUpdate] = useState<UpdateItem | null>(null);

  const fetchUpdates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getPublicUpdates(page, 12, activeSearch || undefined);
      setUpdates(data.items);
      setTotalPages(data.total_pages);
    } catch (err: any) {
      setError(err?.message || t('updates.error'));
    } finally {
      setLoading(false);
    }
  }, [page, activeSearch, t]);

  useEffect(() => {
    fetchUpdates();
  }, [fetchUpdates]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setActiveSearch(search.trim());
  };

  const handleClearSearch = () => {
    setSearch('');
    setActiveSearch('');
    setPage(1);
  };

  return (
    <div ref={pageRef}>
      {/* Page Header */}
      <section className="bg-gradient-to-b from-orange-50/60 to-[#FCFBF9] py-12 sm:py-16 border-b border-stone-200">
        <Container size="lg">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="saffron">{t('updates.badge.news')}</Badge>
              <Badge variant="neutral">{t('updates.badge.notices')}</Badge>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-stone-900 tracking-tight mb-3">
              {t('updates.title')}
            </h1>
            <p className="text-base sm:text-lg text-stone-600 leading-relaxed">
              {t('updates.subtitle')}
            </p>
          </div>
        </Container>
      </section>

      {/* Main Updates Section */}
      <Section background="default" size="lg">
        <Container size="lg">
          <div className="space-y-8">
            <div className="reveal-on-scroll flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <SectionHeader
                badge={t('updates.circulars.badge')}
                title={t('updates.circulars.title')}
                subtitle={t('updates.circulars.subtitle')}
                className="mb-0 sm:mb-0"
              />

              {/* Search Box */}
              <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 max-w-sm w-full">
                <input
                  type="text"
                  placeholder={t('updates.search.placeholder')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-orange-500 bg-white"
                />
                <Button type="submit" variant="primary" size="sm">
                  {t('updates.search.button')}
                </Button>
                {activeSearch && (
                  <Button type="button" variant="ghost" size="sm" onClick={handleClearSearch}>
                    {t('updates.search.clear')}
                  </Button>
                )}
              </form>
            </div>

            {loading ? (
              <LoadingState message={t('updates.loading')} />
            ) : error ? (
              <ErrorState
                title={t('updates.error')}
                message={error}
                onRetry={fetchUpdates}
              />
            ) : updates.length === 0 ? (
              <EmptyState
                title={activeSearch ? t('updates.emptySearch.title') : t('updates.empty.title')}
                description={
                  activeSearch
                    ? t('updates.emptySearch.desc')
                    : t('updates.empty.desc')
                }
              />
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {updates.map((item, index) => (
                    <article
                      key={item.id}
                      onClick={() => setSelectedUpdate(item)}
                      className={`reveal-on-scroll stagger-${(index % 3) + 1} card-interactive cursor-pointer bg-white rounded-xl border border-stone-200 p-6 shadow-xs flex flex-col justify-between space-y-4`}
                    >
                      {item.featured_image && (
                        <div className="aspect-16/9 rounded-lg overflow-hidden bg-stone-100 -mx-2 -mt-2 mb-2">
                          <img
                            src={item.featured_image}
                            alt={item.title}
                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-103"
                            loading="lazy"
                          />
                        </div>
                      )}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <Badge variant="saffron">{item.category}</Badge>
                          <span className="text-xs text-stone-500 font-medium">
                            {item.published_at ? new Date(item.published_at).toLocaleDateString() : new Date(item.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-stone-900 line-clamp-2">
                          {item.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed line-clamp-3">
                          {item.excerpt || item.content.replace(/<[^>]*>?/gm, '').slice(0, 140) + '...'}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs font-semibold text-orange-600">
                        <span>{t('updates.card.readFull')}</span>
                        <span>→</span>
                      </div>
                    </article>
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

      {/* Update Detail Modal */}
      {selectedUpdate && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          onClick={() => setSelectedUpdate(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-stone-200 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="saffron">{selectedUpdate.category}</Badge>
                  <span className="text-xs text-stone-500">
                    {selectedUpdate.published_at ? new Date(selectedUpdate.published_at).toLocaleDateString() : new Date(selectedUpdate.created_at).toLocaleDateString()}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
                  {selectedUpdate.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUpdate(null)}
                className="text-stone-400 hover:text-stone-600 text-2xl font-bold p-1 rounded-lg"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {selectedUpdate.featured_image && (
              <div className="rounded-xl overflow-hidden max-h-72 w-full bg-stone-100">
                <img
                  src={selectedUpdate.featured_image}
                  alt={selectedUpdate.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {selectedUpdate.excerpt && (
              <p className="text-sm font-medium text-stone-700 bg-amber-50/60 p-4 rounded-xl border border-amber-200">
                {selectedUpdate.excerpt}
              </p>
            )}

            {/* Sanitized HTML content */}
            <div
              className="prose prose-stone text-xs sm:text-sm text-stone-700 leading-relaxed space-y-3"
              dangerouslySetInnerHTML={{ __html: selectedUpdate.content }}
            />

            <div className="pt-4 border-t border-stone-100 flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setSelectedUpdate(null)}>
                {t('updates.modal.close')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
