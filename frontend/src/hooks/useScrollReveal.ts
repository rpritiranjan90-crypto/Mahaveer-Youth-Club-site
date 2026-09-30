import { useEffect, useRef } from 'react';

export interface UseScrollRevealOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

/**
 * Lightweight, zero-dependency scroll-reveal hook using native IntersectionObserver.
 * Observes child elements with `.reveal-on-scroll` or the container itself and adds `.is-revealed`.
 * Automatically respects `prefers-reduced-motion`.
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  options: UseScrollRevealOptions = {}
) {
  const containerRef = useRef<T | null>(null);
  const { threshold = 0.15, rootMargin = '0px 0px -40px 0px', triggerOnce = true } = options;

  useEffect(() => {
    // Check for prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      // If user prefers reduced motion, immediately reveal everything
      if (containerRef.current) {
        containerRef.current.classList.add('is-revealed');
        const elements = containerRef.current.querySelectorAll('.reveal-on-scroll');
        elements.forEach((el) => el.classList.add('is-revealed'));
      }
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            if (triggerOnce) {
              observer.unobserve(entry.target);
            }
          } else if (!triggerOnce) {
            entry.target.classList.remove('is-revealed');
          }
        });
      },
      { threshold, rootMargin }
    );

    const rootNode = containerRef.current;
    if (!rootNode) return;

    // Observe children with `.reveal-on-scroll` or the root node itself
    const targets = rootNode.querySelectorAll('.reveal-on-scroll');
    if (targets.length > 0) {
      targets.forEach((el) => observer.observe(el));
    } else {
      observer.observe(rootNode);
    }

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, triggerOnce]);

  return containerRef;
}
