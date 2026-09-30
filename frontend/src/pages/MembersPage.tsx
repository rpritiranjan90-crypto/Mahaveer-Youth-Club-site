import React, { useEffect, useState, useCallback } from 'react';
import { Container } from '../components/layout/Container';
import { Section } from '../components/layout/Section';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';
import { SectionHeader } from '../components/content/SectionHeader';
import { usePageMeta } from '../hooks/usePageMeta';
import { useLanguage } from '../context/LanguageContext';
import { apiService } from '../services/api';
import { MemberItem } from '../types';

export const MembersPage: React.FC = () => {
  const { t } = useLanguage();

  usePageMeta({
    title: 'Our Members — Mahaveer Youth Club Banza',
    description: 'Roster of active members and volunteers of Mahaveer Youth Club Banza.',
  });

  const [members, setMembers] = useState<MemberItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getPublicMembers(1, 100);
      setMembers(data.items);
      setTotalCount(data.total);
    } catch (err: any) {
      setError(err?.message || t('members.error'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  return (
    <div>
      {/* Page Header */}
      <section className="bg-gradient-to-b from-orange-50/50 to-[#FCFBF9] py-12 sm:py-16 border-b border-stone-200">
        <Container size="lg">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="saffron">{t('members.badge')}</Badge>
              <Badge variant="neutral">
                {loading
                  ? t('common.loading')
                  : t('members.badgeCount', { count: totalCount })}
              </Badge>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-stone-900 tracking-tight mb-3">
              {t('members.title')}
            </h1>
            <p className="text-base sm:text-lg text-stone-600 leading-relaxed">
              {t('members.subtitle')}
            </p>
          </div>
        </Container>
      </section>

      {/* Main Members Grid */}
      <Section background="default" size="lg">
        <Container size="lg">
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <SectionHeader
                badge={t('members.directory.badge')}
                title={t('members.directory.title')}
                subtitle={t('members.directory.subtitle')}
                className="mb-0 sm:mb-0"
              />
            </div>

            {loading ? (
              <LoadingState message={t('members.loading')} />
            ) : error ? (
              <ErrorState
                title={t('members.error')}
                message={error}
                onRetry={fetchMembers}
              />
            ) : members.length === 0 ? (
              <EmptyState
                title={t('members.empty.title')}
                description={t('members.empty.desc')}
              />
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {members.map((member, index) => (
                    <Card
                      key={member.id}
                      className="p-4 bg-white border border-stone-200 hover:border-orange-300 hover:shadow-sm transition-all flex items-center space-x-3"
                    >
                      <div className="w-10 h-10 rounded-full bg-stone-100 border border-stone-200 text-stone-700 font-bold text-xs flex items-center justify-center shrink-0 font-mono">
                        {(index + 1).toString().padStart(2, '0')}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-bold text-stone-900 truncate">
                          {member.display_name}
                        </h3>
                        <p className="text-[11px] text-stone-500 truncate">
                          {member.role || t('members.defaultRole')}
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>

                <div className="p-6 bg-stone-100 rounded-xl border border-stone-200 text-center text-xs text-stone-600">
                  {t('members.footerNote')}
                </div>
              </>
            )}
          </div>
        </Container>
      </Section>
    </div>
  );
};
