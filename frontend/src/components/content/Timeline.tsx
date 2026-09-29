import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

export interface TimelineItem {
  year: string;
  title: string;
  description: string;
  tag?: string;
  imageSrc?: string;
}

export interface TimelineProps {
  items: TimelineItem[];
}

export const Timeline: React.FC<TimelineProps> = ({ items }) => {
  return (
    <div className="relative pl-6 sm:pl-8 border-l-2 border-[#E9DED1] space-y-8 sm:space-y-12 text-left my-6 max-w-3xl mx-auto">
      {items.map((item, index) => (
        <div key={`${item.year}-${index}`} className="relative group">
          {/* Timeline Dot Marker */}
          <div className="absolute -left-[31px] sm:-left-[39px] top-1 w-5 h-5 rounded-full bg-white border-4 border-[#F97316] group-hover:scale-125 group-hover:border-[#8B1E1E] transition-transform duration-200 shadow-xs" />

          {/* Year & Tag Header */}
          <div className="flex items-center gap-2.5 mb-2">
            <span className="text-sm sm:text-base font-extrabold text-[#8B1E1E] tracking-tight">
              {item.year}
            </span>
            {item.tag && (
              <Badge variant="gold" size="sm">
                {item.tag}
              </Badge>
            )}
          </div>

          {/* Content Card */}
          <Card className="p-5">
            <h4 className="text-base sm:text-lg font-bold text-[#241A17] mb-1.5">
              {item.title}
            </h4>
            <p className="text-xs sm:text-sm text-[#6B625D] leading-relaxed">
              {item.description}
            </p>

            {item.imageSrc && (
              <div className="mt-4 rounded-md overflow-hidden border border-[#E9DED1] aspect-16/9 bg-[#FBF4EA]">
                <img
                  src={item.imageSrc}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            )}
          </Card>
        </div>
      ))}
    </div>
  );
};
