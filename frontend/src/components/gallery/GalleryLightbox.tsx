import React, { useEffect, useCallback } from 'react';
import { GalleryPhoto } from '../../types';

export interface GalleryLightboxProps {
  photo: GalleryPhoto | null;
  photos: GalleryPhoto[];
  onClose: () => void;
  onSelectPhoto: (photo: GalleryPhoto) => void;
}

export const GalleryLightbox: React.FC<GalleryLightboxProps> = ({
  photo,
  photos,
  onClose,
  onSelectPhoto,
}) => {
  const currentIndex = photo ? photos.findIndex((p) => p.id === photo.id) : -1;

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      onSelectPhoto(photos[currentIndex - 1]);
    } else if (photos.length > 0) {
      onSelectPhoto(photos[photos.length - 1]);
    }
  }, [currentIndex, photos, onSelectPhoto]);

  const handleNext = useCallback(() => {
    if (currentIndex < photos.length - 1) {
      onSelectPhoto(photos[currentIndex + 1]);
    } else if (photos.length > 0) {
      onSelectPhoto(photos[0]);
    }
  }, [currentIndex, photos, onSelectPhoto]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!photo) return;
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [photo, onClose, handlePrev, handleNext]);

  if (!photo) return null;

  const displayUrl = photo.image_url || photo.url || '';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 sm:p-6 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label={`Photo viewer: ${photo.title}`}
    >
      {/* Backdrop click */}
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 w-full h-full cursor-default -z-10"
        aria-label="Close photo viewer"
      />

      {/* Top action bar */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <button
          type="button"
          onClick={onClose}
          className="p-2.5 rounded-full bg-stone-800/80 text-white hover:bg-stone-700 transition-colors focus:ring-2 focus:ring-white"
          aria-label="Close image lightbox"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Navigation buttons */}
      {photos.length > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-stone-800/80 text-white hover:bg-stone-700 transition-colors focus:ring-2 focus:ring-white z-10"
            aria-label="Previous photo"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-stone-800/80 text-white hover:bg-stone-700 transition-colors focus:ring-2 focus:ring-white z-10"
            aria-label="Next photo"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Main image content container */}
      <div className="max-w-4xl max-h-[85vh] flex flex-col items-center justify-center">
        <img
          src={displayUrl}
          alt={photo.alt_text || photo.title}
          className="max-h-[70vh] max-w-full object-contain rounded-lg shadow-2xl"
        />
        <div className="mt-4 text-center text-white max-w-xl">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-orange-600">
              {photo.year}
            </span>
            <span className="text-xs font-medium text-stone-300">
              {photo.category}
            </span>
          </div>
          <h3 className="text-lg font-bold">{photo.title}</h3>
          {photo.alt_text && photo.alt_text !== photo.title && (
            <p className="text-xs text-stone-300 mt-1">{photo.alt_text}</p>
          )}
        </div>
      </div>
    </div>
  );
};
