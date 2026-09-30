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

    const checkAndObserve = () => {
      if (!containerRef.current) return;
      const targets = containerRef.current.querySelectorAll<HTMLElement>('.reveal-on-scroll, .reveal-scale');
      targets.forEach((el) => {
        if (el.classList.contains('is-revealed')) return;
        const rect = el.getBoundingClientRect();
        // If element is already in or above viewport, reveal immediately
        if (rect.top < window.innerHeight + 100) {
          el.classList.add('is-revealed');
        } else {
          observer.observe(el);
        }
      });
    };

    // Run initial scan
    checkAndObserve();

    // Listen to dynamic DOM mutations (when async data like members or gallery loads)
    const mutationObserver = new MutationObserver(() => {
      checkAndObserve();
    });

    mutationObserver.observe(rootNode, {
      childList: true,
      subtree: true,
    });

    // Timeout safety scan
    const timer1 = setTimeout(checkAndObserve, 60);
    const timer2 = setTimeout(checkAndObserve, 250);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      mutationObserver.disconnect();
      observer.disconnect();
    };
  }, [threshold, rootMargin, triggerOnce]);

  return containerRef;
}
