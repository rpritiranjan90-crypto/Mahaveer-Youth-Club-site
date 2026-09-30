import { useEffect, useRef } from 'react';

export interface UseScrollRevealOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

/**
 * Lightweight, zero-dependency scroll-reveal hook using native IntersectionObserver.
 * Observes child elements with `.reveal-on-scroll` or `.reveal-scale` and adds `.is-revealed`.
 * Automatically reveals in-viewport elements on mount and respects `prefers-reduced-motion`.
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  options: UseScrollRevealOptions = {}
) {
  const containerRef = useRef<T | null>(null);
  const { threshold = 0.05, rootMargin = '50px 0px 50px 0px', triggerOnce = true } = options;

  useEffect(() => {
    const rootNode = containerRef.current;
    if (!rootNode) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      rootNode.classList.add('is-revealed');
      rootNode.querySelectorAll('.reveal-on-scroll, .reveal-scale').forEach((el) => {
        el.classList.add('is-revealed');
      });
      return;
    }

    const targets = rootNode.querySelectorAll<HTMLElement>('.reveal-on-scroll, .reveal-scale');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            if (triggerOnce) {
              observer.unobserve(entry.target);
            }
          }
        });
      },
      { threshold, rootMargin }
    );

    if (targets.length > 0) {
      targets.forEach((el) => {
        // Immediate check: If element is within or above the viewport on load, reveal immediately
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight + 100) {
          el.classList.add('is-revealed');
        } else {
          observer.observe(el);
        }
      });
    } else {
      observer.observe(rootNode);
    }

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, triggerOnce]);

  return containerRef;
}
