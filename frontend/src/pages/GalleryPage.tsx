import React from 'react';
import { Link } from 'react-router-dom';
import { Container } from '../components/layout/Container';
import { Section } from '../components/layout/Section';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { GalleryGrid } from '../components/gallery/GalleryGrid';
import { galleryData, galleryCategories } from '../data/gallery';
import { clubInfo } from '../data/club';
import { usePageMeta } from '../utils/seo';
import { usePublicGallery } from '../utils/usePublicData';

export const GalleryPage: React.FC = () => {
  const { gallery } = usePublicGallery();

  usePageMeta({
    title: `Photo & Video Gallery — ${clubInfo.name}`,
    description: `Browse photographs and memorable moments from ${clubInfo.name} Ganesh Utsav celebrations, theme pandals, Aarti rituals, and welfare drives.`,
  });

  const activeGallery = gallery.length > 0 ? gallery : galleryData;

  return (
    <div className="space-y-0 text-left">
      {/* 1. Page Header */}
      <div className="bg-gradient-to-b from-[#FFF8EE] to-[#FFEDD5]/30 border-b border-[#E9DED1] py-12 sm:py-16">
        <Container size="lg">
          <div className="max-w-3xl">
            <Badge variant="maroon" size="md" className="mb-3 font-bold uppercase tracking-wider">
              VISUAL ARCHIVE
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#241A17] tracking-tight">
              Photo & Video Gallery
            </h1>
            <p className="text-base sm:text-lg text-[#6B625D] mt-4 leading-relaxed">
              Explore vibrant memories from our grand theme pandals, divine evening Aartis, youth cultural performances, and philanthropic community drives.
            </p>
          </div>
        </Container>
      </div>

      {/* 2. Gallery Grid with Interactive Lightbox */}
      <Section
        eyebrow="ARCHIVE"
        title="Ganesh Utsav & Seva Memories"
        description="Click any image to open the high-resolution lightbox viewer."
        align="center"
        background="white"
      >
        <GalleryGrid items={activeGallery} categories={galleryCategories} />
      </Section>

      {/* 3. Community Submission CTA */}
      <Section
        eyebrow="CONTRIBUTE PHOTOS"
        title="Have Festival Photos from Past Years?"
        description="Devotees and youth volunteers with high-quality photographs or video recordings from our celebrations are invited to share them with our media team."
        align="center"
      >
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link to="/contact">
            <Button variant="primary" size="lg" className="font-bold shadow-festive">
              Contact Media Team →
            </Button>
          </Link>
          <Link to="/donate">
            <Button variant="secondary" size="lg" className="font-bold">
              Support 2026 Celebrations ❤️
            </Button>
          </Link>
        </div>
      </Section>
    </div>
  );
};
