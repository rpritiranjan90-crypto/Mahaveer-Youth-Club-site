import { useEffect } from 'react';

export interface PageMeta {
  title: string;
  description: string;
}

export const usePageMeta = (meta: PageMeta) => {
  useEffect(() => {
    // Update Document Title
    document.title = `${meta.title} | Mahaveer Youth Club`;

    // Update Meta Description
    let metaDescriptionTag = document.querySelector('meta[name="description"]');
    if (!metaDescriptionTag) {
      metaDescriptionTag = document.createElement('meta');
      metaDescriptionTag.setAttribute('name', 'description');
      document.head.appendChild(metaDescriptionTag);
    }
    metaDescriptionTag.setAttribute('content', meta.description);

    // Scroll to top smoothly on page transition
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [meta.title, meta.description]);
};
