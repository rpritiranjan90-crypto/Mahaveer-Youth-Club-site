import React, { useState } from 'react';
import { EmptyState } from '../ui/EmptyState';
import { Badge } from '../ui/Badge';
import { GalleryLightbox } from './GalleryLightbox';
import { GalleryPhoto } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { resolveMediaUrl } from '../../utils/media';

export interface GalleryGridProps {
  photos?: GalleryPhoto[];
  availableYears?: string[];
  availableCategories?: string[];
  selectedYear?: string;
  selectedCategory?: string;
  onYearChange?: (year: string) => void;
  onCategoryChange?: (category: string) => void;
}

export const GalleryGrid: React.FC<GalleryGridProps> = ({
  photos = [],
  availableYears = ['All'],
  availableCategories = ['All'],
  selectedYear = 'All',
  selectedCategory = 'All',
  onYearChange,
  onCategoryChange,
}) => {
  const { t } = useLanguage();
  const [internalYear, setInternalYear] = useState<string>('All');
  const [internalCategory, setInternalCategory] = useState<string>('All');
  const [activePhoto, setActivePhoto] = useState<GalleryPhoto | null>(null);

  const currentYear = onYearChange ? selectedYear : internalYear;
  const currentCategory = onCategoryChange ? selectedCategory : internalCategory;

  const handleYearClick = (year: string) => {
    if (onYearChange) {
      onYearChange(year);
    } else {
      setInternalYear(year);
    }
  };

  const handleCategoryClick = (cat: string) => {
    if (onCategoryChange) {
      onCategoryChange(cat);
    } else {
      setInternalCategory(cat);
    }
  };

  return (
    <div className="space-y-8">
      {/* Filter controls */}
      <div className="bg-white p-4 sm:p-6 rounded-xl border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Year Filter */}
        <div className="flex items-center flex-wrap gap-2">
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wider mr-1">
            {t('celebrations.filter.year')}
          </span>
          {availableYears.map((year) => (
            <button
              key={year}
              type="button"
              onClick={() => handleYearClick(year)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                currentYear === year
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              {year === 'All' ? t('common.all') : year}
            </button>
          ))}
        </div>

        {/* Category Filter */}
        <div className="flex items-center flex-wrap gap-2">
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wider mr-1">
            {t('celebrations.filter.category')}
          </span>
          {availableCategories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => handleCategoryClick(category)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                currentCategory === category
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              {category === 'All' ? t('common.all') : category}
            </button>
          ))}
        </div>
      </div>

      {/* Grid or Empty State */}
      {photos.length === 0 ? (
        <EmptyState
          title={t('celebrations.empty.title')}
          description={t('celebrations.empty.desc')}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {photos.map((photo) => {
            const thumbUrl = photo.thumbnail_url || photo.image_url || photo.url || '';
            return (
              <button
                key={photo.id}
                type="button"
                onClick={() => setActivePhoto(photo)}
                className="group relative bg-stone-100 rounded-xl overflow-hidden border border-stone-200 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-orange-500 text-left transition-all hover:shadow-md hover:border-orange-300"
              >
                <div className="aspect-4/3 overflow-hidden bg-stone-200">
                  <img
                    src={resolveMediaUrl(thumbUrl)}
                    alt={photo.alt_text || photo.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-103"
                  />
                </div>
                <div className="p-3 bg-white">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <Badge variant="saffron">{photo.year}</Badge>
                    <span className="text-[11px] text-stone-500 font-medium">
                      {photo.category}
                    </span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-stone-900 line-clamp-1">
                    {photo.title}
                  </h4>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Lightbox Modal */}
      <GalleryLightbox
        photo={activePhoto}
        photos={photos}
        onClose={() => setActivePhoto(null)}
        onSelectPhoto={setActivePhoto}
      />
    </div>
  );
};
