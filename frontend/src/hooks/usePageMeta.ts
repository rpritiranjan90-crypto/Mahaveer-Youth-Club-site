import { useEffect } from 'react';

interface PageMetaOptions {
  title: string;
  description?: string;
  canonical?: string;
}

export function usePageMeta({ title, description, canonical }: PageMetaOptions): void {
  useEffect(() => {
    // 1. Update document title
    document.title = title ? `${title} — Mahaveer Youth Club Banza` : 'Mahaveer Youth Club Banza';

    // 2. Update meta description
    if (description) {
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', description);
    }

    // 3. Update canonical link if provided
    if (canonical) {
      let linkCanonical = document.querySelector('link[rel="canonical"]');
      if (!linkCanonical) {
        linkCanonical = document.createElement('link');
        linkCanonical.setAttribute('rel', 'canonical');
        document.head.appendChild(linkCanonical);
      }
      linkCanonical.setAttribute('href', canonical);
    }
  }, [title, description, canonical]);
}
