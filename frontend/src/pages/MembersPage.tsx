import React, { useEffect, useState, useCallback } from 'react';
import { Container } from '../components/layout/Container';
import { Section } from '../components/layout/Section';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';
import { usePageMeta } from '../hooks/usePageMeta';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { useLanguage } from '../context/LanguageContext';
import { apiService } from '../services/api';
import { resolveMediaUrl } from '../utils/media';
import { MemberItem } from '../types';

export const MembersPage: React.FC = () => {
  const { t } = useLanguage();
  const pageRef = useScrollReveal<HTMLDivElement>({ threshold: 0.1 });

  usePageMeta({
    title: 'Our Members — Mahaveer Youth Club Banza',
    description: 'Official roster of dedicated members, office bearers, and volunteers of Mahaveer Youth Club Banza.',
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

  const getInitials = (name: string): string => {
    if (!name) return 'MY';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div ref={pageRef}>
      {/* Page Header */}
      <section className="bg-gradient-to-b from-orange-50/60 to-[#FCFBF9] py-10 sm:py-14 border-b border-stone-200">
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

      {/* Main Members Grid Section */}
      <Section background="default" size="md">
        <Container size="lg">
          <div className="space-y-6">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                  {members.map((member, index) => {
                    const memberName = member.name || member.display_name || 'Club Member';
                    const memberRole = member.designation || member.role || t('members.defaultRole');
                    const hasPhoto = Boolean(member.photo_url);

                    return (
                      <div
                        key={member.id}
                        className={`reveal-on-scroll stagger-${(index % 4) + 1}`}
                      >
                        <Card
                          interactive
                          className="p-5 bg-white border border-stone-200/90 hover:border-orange-200 shadow-soft hover:shadow-md transition-all duration-300 flex flex-col items-center text-center h-full rounded-2xl group"
                        >
                          {/* Member Photo or Fallback Initials Avatar */}
                          <div className="relative mb-4">
                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-orange-100 shadow-xs flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50 group-hover:scale-105 transition-transform duration-300">
                              {hasPhoto ? (
                                <img
                                  src={resolveMediaUrl(member.photo_url)}
                                  alt={t('members.photoAlt', { name: memberName, designation: memberRole })}
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                  onError={(e) => {
                                    // Fallback to initials if image load fails
                                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                                    const sibling = (e.currentTarget as HTMLImageElement).nextElementSibling;
                                    if (sibling) (sibling as HTMLElement).style.display = 'flex';
                                  }}
                                />
                              ) : null}
                              <div
                                className={`w-full h-full flex items-center justify-center font-bold text-lg sm:text-xl text-orange-800 tracking-wider font-mono select-none ${hasPhoto ? 'hidden' : 'flex'}`}
                                aria-hidden="true"
                              >
                                {getInitials(memberName)}
                              </div>
                            </div>

                            {/* Sequential Badge indicator */}
                            <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 bg-stone-900 text-white rounded-md text-[10px] font-mono font-bold shadow-xs">
                              #{(index + 1).toString().padStart(2, '0')}
                            </span>
                          </div>

                          {/* Member Details */}
                          <div className="w-full space-y-1">
                            <h3 className="text-base font-bold text-stone-900 group-hover:text-orange-700 transition-colors leading-snug">
                              {memberName}
                            </h3>
                            <p className="text-xs font-semibold text-orange-700">
                              {memberRole}
                            </p>
                            {member.bio ? (
                              <p className="text-xs text-stone-600 leading-relaxed pt-2 line-clamp-3 text-stone-500">
                                {member.bio}
                              </p>
                            ) : null}
                          </div>
                        </Card>
                      </div>
                    );
                  })}
                </div>

                <div className="reveal-on-scroll p-6 bg-stone-50 rounded-2xl border border-stone-200/80 text-center text-xs text-stone-600 max-w-2xl mx-auto">
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
