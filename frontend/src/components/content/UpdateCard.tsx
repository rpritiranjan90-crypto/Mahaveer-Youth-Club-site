import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

export interface UpdateCardProps {
  title: string;
  date: string;
  description: string;
  category?: string;
  imageSrc?: string;
  onReadMore?: () => void;
}

export const UpdateCard: React.FC<UpdateCardProps> = ({
  title,
  date,
  description,
  category = 'Update',
  imageSrc,
  onReadMore,
}) => {
  return (
    <Card hoverable className="flex flex-col h-full text-left">
      {/* Image / Header Slot */}
      <div className="relative aspect-16/9 w-full bg-[#FBF4EA] overflow-hidden border-b border-[#E9DED1] flex items-center justify-center">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-[#8C827C] space-y-1">
            <span className="text-3xl">📰</span>
            <span className="text-xs font-medium">Club Announcement</span>
          </div>
        )}

        {category && (
          <div className="absolute top-3 left-3">
            <Badge variant="saffron" size="sm" className="shadow-2xs">
              {category}
            </Badge>
          </div>
        )}
      </div>

      {/* Body Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="text-xs font-semibold text-[#8B1E1E] mb-1.5 flex items-center gap-1">
            <span>📅</span>
            <span>{date}</span>
          </div>
          <h4 className="text-base sm:text-lg font-bold text-[#241A17] line-clamp-2 mb-2 leading-snug">
            {title}
          </h4>
          <p className="text-xs sm:text-sm text-[#6B625D] line-clamp-3 leading-relaxed mb-4">
            {description}
          </p>
        </div>

        {/* Read More Link */}
        <div className="pt-3 border-t border-[#F2E8DC] mt-auto">
          <button
            type="button"
            onClick={onReadMore}
            className="inline-flex items-center text-xs sm:text-sm font-bold text-[#F97316] hover:text-[#EA580C] group focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#F97316] rounded"
          >
            <span>Read More</span>
            <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </div>
      </div>
    </Card>
  );
};
