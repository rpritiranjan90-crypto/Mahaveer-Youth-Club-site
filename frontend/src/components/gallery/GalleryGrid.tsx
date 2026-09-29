import React, { useState } from 'react';
import { GalleryCard, GalleryItem } from './GalleryCard';
import { ImageViewer } from './ImageViewer';

export interface GalleryGridProps {
  items: GalleryItem[];
  categories?: string[];
}

export const GalleryGrid: React.FC<GalleryGridProps> = ({
  items,
  categories = ['All', 'Pandal', 'Rituals', 'Cultural', 'Social Work'],
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  const filteredItems =
    activeCategory === 'All'
      ? items
      : items.filter((item) => item.category.toLowerCase() === activeCategory.toLowerCase());

  return (
    <div className="w-full">
      {/* Category Filter Pills */}
      {categories && categories.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {categories.map((cat) => {
            const isActive = activeCategory.toLowerCase() === cat.toLowerCase();
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#8B1E1E] text-white shadow-xs'
                    : 'bg-white text-[#6B625D] hover:bg-[#FBF4EA] hover:text-[#241A17] border border-[#E9DED1]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      )}

      {/* Responsive Grid: 2 cols on mobile, 3 on tablet, 4 on desktop */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5">
        {filteredItems.map((item) => (
          <GalleryCard key={item.id} item={item} onClick={(it) => setSelectedItem(it)} />
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12 text-sm text-[#6B625D]">
          No photos found in this category.
        </div>
      )}

      {/* Lightbox Modal */}
      <ImageViewer
        item={selectedItem}
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </div>
  );
};
