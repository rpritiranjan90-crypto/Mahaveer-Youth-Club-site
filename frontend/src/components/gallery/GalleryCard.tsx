import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

export interface GalleryItem {
  id: string;
  title: string;
  year: string;
  category: string;
  imageSrc?: string;
  altText: string;
  description?: string;
}

export interface GalleryCardProps {
  item: GalleryItem;
  onClick?: (item: GalleryItem) => void;
}

export const GalleryCard: React.FC<GalleryCardProps> = ({ item, onClick }) => {
  return (
    <Card
      hoverable
      className="cursor-pointer group flex flex-col h-full overflow-hidden text-left"
      onClick={() => onClick && onClick(item)}
    >
      {/* Image container with aspect ratio */}
      <div className="relative aspect-4/3 w-full bg-[#FBF4EA] overflow-hidden">
        {item.imageSrc ? (
          <img
            src={item.imageSrc}
            alt={item.altText}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-[#8C827C] space-y-1 bg-gradient-to-tr from-[#FFEDD5]/40 to-[#FEF3C7]/40">
            <span className="text-3xl">🖼️</span>
            <span className="text-[11px] font-semibold">{item.category}</span>
          </div>
        )}

        {/* Badges on image overlay */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          <Badge variant="maroon" size="sm" className="shadow-xs font-bold">
            {item.year}
          </Badge>
          <Badge variant="gold" size="sm" className="shadow-xs">
            {item.category}
          </Badge>
        </div>

        {/* Hover overlay hint */}
        <div className="absolute inset-0 bg-[#241A17]/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold backdrop-blur-2xs">
          <span>🔍 View Full Photo</span>
        </div>
      </div>

      {/* Card Info */}
      <div className="p-3.5 bg-white">
        <h4 className="text-xs sm:text-sm font-bold text-[#241A17] line-clamp-1 group-hover:text-[#F97316] transition-colors">
          {item.title}
        </h4>
        {item.description && (
          <p className="text-[11px] text-[#6B625D] line-clamp-1 mt-0.5">
            {item.description}
          </p>
        )}
      </div>
    </Card>
  );
};
