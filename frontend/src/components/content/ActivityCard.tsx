import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

export interface ActivityCardProps {
  title: string;
  category?: 'Ritual' | 'Welfare' | 'Cultural' | 'Sports' | string;
  date: string;
  time?: string;
  location?: string;
  description: string;
  imageSrc?: string;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({
  title,
  category = 'Ritual',
  date,
  time,
  location = 'Main Pandal Ground',
  description,
  imageSrc,
}) => {
  const getBadgeVariant = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'ritual':
        return 'maroon';
      case 'welfare':
        return 'success';
      case 'cultural':
        return 'gold';
      case 'sports':
        return 'saffron';
      default:
        return 'neutral';
    }
  };

  return (
    <Card hoverable className="flex flex-col h-full text-left">
      {/* Top Image or Icon Banner */}
      <div className="relative aspect-16/10 w-full bg-[#FBF4EA] overflow-hidden border-b border-[#E9DED1] flex items-center justify-center">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-[#8C827C] space-y-1">
            <span className="text-3xl">🪔</span>
            <span className="text-xs font-medium">Puja & Seva Activity</span>
          </div>
        )}

        <div className="absolute top-3 left-3">
          <Badge variant={getBadgeVariant(category)} size="sm">
            {category}
          </Badge>
        </div>
      </div>

      {/* Body Details */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h4 className="text-base sm:text-lg font-bold text-[#241A17] mb-2 leading-snug">
            {title}
          </h4>

          {/* Metadata Rows */}
          <div className="space-y-1.5 text-xs text-[#6B625D] mb-3">
            <div className="flex items-center gap-1.5">
              <span className="text-[#F97316]">📅</span>
              <span className="font-semibold text-[#241A17]">{date}</span>
            </div>
            {time && (
              <div className="flex items-center gap-1.5">
                <span className="text-[#8B1E1E]">⏰</span>
                <span>{time}</span>
              </div>
            )}
            {location && (
              <div className="flex items-center gap-1.5">
                <span className="text-[#D4A017]">📍</span>
                <span className="truncate">{location}</span>
              </div>
            )}
          </div>

          <p className="text-xs sm:text-sm text-[#6B625D] line-clamp-3 leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </Card>
  );
};
