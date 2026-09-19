/**
 * Landing-page hooks: scroll-driven motion, view tracking, exit intent.
 * Every motion hook respects `prefers-reduced-motion` (P-03) by jumping to the finished state instead of animating.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useActions, type ActionHandler } from '../../actions';
import { track, trackOnce, type TrackCtx } from '../../tracking';

/** True when the viewer asked for reduced motion; follows changes live. */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => {
    try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { return false; }
  });
  useEffect(() => {
    let m: MediaQueryList;
    try { m = window.matchMedia('(prefers-reduced-motion: reduce)'); } catch { return; }
    const on = () => setReduced(m.matches);
    on(); m.addEventListener('change', on);
    return () => m.removeEventListener('change', on);
  }, []);
  return reduced;
}

/**
 * Maps the scroll progress of an element (0 when it enters the viewport, 1 when it has left the top) to a frame index.
 * This is the seam video-on-scroll plugs into (T41): once generated frame sequences exist, render `frames[frame]`
 * instead of a CSS transform and nothing else about the section changes.
 */
export function useScrollFrames<T extends HTMLElement = HTMLDivElement>(count: number) {
  const ref = useRef<T | null>(null);
  const reduced = usePrefersReducedMotion();
  const [progress, setProgress] = useState(reduced ? 1 : 0);
  useEffect(() => {
    if (reduced) { setProgress(1); return; }
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const measure = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const span = r.height + vh;
      setProgress(span <= 0 ? 0 : Math.min(1, Math.max(0, (vh - r.top) / span)));
    };
    const onScroll = () => { if (!raf) raf = window.requestAnimationFrame(measure); };
    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); if (raf) window.cancelAnimationFrame(raf); };
  }, [reduced]);
  const frames = Math.max(1, count);
  const frame = Math.min(frames - 1, Math.max(0, Math.round(progress * (frames - 1))));
  return { ref, frame, frames, progress, reduced };
}

/** Observes an element and reports the first time it is meaningfully on screen (reveal + section_view tracking). */
export function useInView<T extends HTMLElement = HTMLDivElement>(threshold = 0.25, once = true) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') { setInView(true); return; }
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) { setInView(true); if (once) io.disconnect(); }
        else if (!once) setInView(false);
      }
    }, { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [threshold, once]);
  return { ref, inView };
}

/** Animated count-up for a money / count Stat. Reduced motion (or an inactive section) shows the final value at once. */
export function useCountUp(target: number, active: boolean, durationMs = 1100): number {
  const reduced = usePrefersReducedMotion();
  const [value, setValue] = useState(reduced || !active ? target : 0);
  useEffect(() => {
    if (reduced || !active) { setValue(target); return; }
    let raf = 0;
    const from = 0, t0 = performance.now();
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / durationMs);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(from + (target - from) * eased);
      if (p < 1) raf = window.requestAnimationFrame(step);
    };
    raf = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(raf);
  }, [target, active, reduced, durationMs]);
  return value;
}

/** `view` on mount plus `scroll_depth` at 25 / 50 / 75 / 100 %, once per session per page (R-C06). */
export function useViewTracking(ctx: TrackCtx, meta: Record<string, unknown>, ready: boolean) {
  const metaRef = useRef(meta); metaRef.current = meta;
  const pageId = ctx.page_id ?? null, prospectId = ctx.prospect_id ?? null;
  useEffect(() => {
    if (!ready) return;
    const c: TrackCtx = { page_id: pageId, prospect_id: prospectId };
    void track('view', metaRef.current, c);
    let raf = 0;
    const measure = () => {
      raf = 0;
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      const depth = scrollable <= 0 ? 1 : Math.min(1, (window.scrollY + window.innerHeight) / doc.scrollHeight);
      for (const d of [0.25, 0.5, 0.75, 1]) if (depth >= d - 0.01) trackOnce(`depth:${d}`, 'scroll_depth', { depth: d }, c);
    };
    const onScroll = () => { if (!raf) raf = window.requestAnimationFrame(measure); };
    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); if (raf) window.cancelAnimationFrame(raf); };
  }, [ready, pageId, prospectId]);
}

const EXIT_KEY = 'leadmagnet.exitintent';
/**
 * Second chance, once per session (playbook 7): desktop = pointer leaves through the top of the viewport;
 * touch = the back gesture (a pushed history entry) or 45 s idle. Never a discount, always the calendar.
 */
export function useExitIntent(onFire: () => void, enabled: boolean) {
  const fired = useRef(false);
  const cb = useRef(onFire); cb.current = onFire;
  useEffect(() => {
    if (!enabled) return;
    try { if (sessionStorage.getItem(EXIT_KEY) === '1') return; } catch { /* private mode */ }
    const fire = () => {
      if (fired.current) return;
      fired.current = true;
      try { sessionStorage.setItem(EXIT_KEY, '1'); } catch { /* private mode */ }
      cb.current();
    };
    const coarse = (() => { try { return window.matchMedia('(pointer: coarse)').matches; } catch { return false; } })();
    const onMouseOut = (e: MouseEvent) => { if (!e.relatedTarget && e.clientY <= 4) fire(); };
    let idle = 0;
    const resetIdle = () => { window.clearTimeout(idle); idle = window.setTimeout(fire, 45000); };
    const onPop = () => { fire(); };
    if (coarse) {
      try { history.pushState({ lm: 'exit' }, ''); } catch { /* ignore */ }
      window.addEventListener('popstate', onPop);
      for (const ev of ['touchstart', 'scroll', 'keydown'] as const) window.addEventListener(ev, resetIdle, { passive: true });
      resetIdle();
    } else {
      document.addEventListener('mouseout', onMouseOut);
    }
    return () => {
      document.removeEventListener('mouseout', onMouseOut);
      window.removeEventListener('popstate', onPop);
      for (const ev of ['touchstart', 'scroll', 'keydown'] as const) window.removeEventListener(ev, resetIdle);
      window.clearTimeout(idle);
    };
  }, [enabled]);
}

/** useActions with handlers that always see the latest render's closure (the bus registers once per page code). */
/** Kept for the sections' imports: `useActions` itself now calls the latest render's handler (see src/actions). */
export const useLiveActions: (pageCode: string, map: Record<string, ActionHandler>) => void = useActions;

/** Smooth-scrolls an element into view, honouring reduced motion; used by prev / next and role navigation. */
export function useScrollTo() {
  const reduced = usePrefersReducedMotion();
  return useCallback((el: Element | null | undefined, block: ScrollLogicalPosition = 'center') => {
    if (!el) return;
    try { el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block, inline: 'center' }); } catch { el.scrollIntoView(); }
  }, [reduced]);
}
