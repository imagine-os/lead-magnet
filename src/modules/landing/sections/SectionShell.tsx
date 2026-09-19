/**
 * Every section is wrapped here so R-C06 holds by construction: one `section_view` per section per session.
 * Reveal: sections are visible by default. Only a section that starts below the fold gets `is-pre` (hidden + shifted);
 * the observer removes it when it scrolls in, a 1.2 s fallback removes it regardless (full-page screenshots, scaled
 * preview iframes, browsers without IntersectionObserver), and reduced motion never hides anything.
 */
import { useEffect, useLayoutEffect, useState, type ReactNode } from 'react';
import { useInView, usePrefersReducedMotion } from '../hooks';
import { useLanding } from '../context';

export interface SectionShellProps { id: string; kind: string; className?: string; label?: string; children: ReactNode }
const REVEAL_FALLBACK_MS = 1200;

export function SectionShell({ id, kind, className = '', label, children }: SectionShellProps) {
  const { trackOnce } = useLanding();
  const reduced = usePrefersReducedMotion();
  const { ref, inView } = useInView<HTMLElement>(0.2);
  const [pre, setPre] = useState(false);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || reduced || typeof IntersectionObserver === 'undefined') return;
    if (el.getBoundingClientRect().top > window.innerHeight) setPre(true);
  }, [reduced]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (!pre) return; if (inView) { setPre(false); return; } const t = window.setTimeout(() => setPre(false), REVEAL_FALLBACK_MS); return () => window.clearTimeout(t); }, [pre, inView]);
  useEffect(() => { if (inView) trackOnce(`section:${id}`, 'section_view', { section: kind, id }); }, [inView, id, kind, trackOnce]);
  return (
    <section ref={ref} id={`sec-${id}`} data-section={kind} aria-label={label} className={`lp-sec lp-sec-${kind} ${pre ? 'is-pre' : 'is-in'} ${className}`}>
      <div className="lp-wrap">{children}</div>
    </section>
  );
}
