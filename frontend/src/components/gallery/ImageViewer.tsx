import React from 'react';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { GalleryItem } from './GalleryCard';

export interface ImageViewerProps {
  item: GalleryItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({ item, isOpen, onClose }) => {
  if (!item) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={item.title}
      size="lg"
      footer={
        <div className="w-full flex items-center justify-between text-xs text-[#6B625D]">
          <span>Ganesh Utsav Archive • Mahaveer Youth Club</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 bg-white hover:bg-[#FBF4EA] border border-[#E9DED1] rounded-md text-[#241A17] font-semibold"
          >
            Close (Esc)
          </button>
        </div>
      }
    >
      <div className="flex flex-col space-y-4">
        {/* Fullsize Image Preview */}
        <div className="relative aspect-16/10 w-full rounded-lg bg-[#241A17] overflow-hidden flex items-center justify-center">
          {item.imageSrc ? (
            <img
              src={item.imageSrc}
              alt={item.altText}
              className="max-h-full max-w-full object-contain"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-amber-200 p-8 text-center">
              <span className="text-6xl mb-2">📸</span>
              <p className="text-sm font-bold text-white">{item.title}</p>
              <p className="text-xs text-amber-300/80 mt-1">High-Resolution Photo Placeholder</p>
            </div>
          )}
        </div>

        {/* Caption & Metadata */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#F2E8DC]">
          <div className="flex items-center gap-2">
            <Badge variant="maroon" size="sm">
              Year: {item.year}
            </Badge>
            <Badge variant="gold" size="sm">
              Category: {item.category}
            </Badge>
          </div>
        </div>

        {item.description && (
          <p className="text-xs sm:text-sm text-[#6B625D] leading-relaxed">
            {item.description}
          </p>
        )}
      </div>
    </Modal>
  );
};
