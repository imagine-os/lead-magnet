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

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/**
 * Two scroll measurements for one element, because the page needs both:
 *  - `progress` (0 as the element enters the viewport, 1 once it has left the top) drives the CSS reveal, so the
 *    devices are already visible on first paint at the top of the page.
 *  - `scrub` maps the *section itself* to 0..1 (0 with its top at the top of the viewport, 1 when its bottom reaches
 *    the bottom), which is what a frame sequence needs: frame 0 when you arrive, the last frame when you leave.
 * `frame` is the scrub mapped onto `count` frames. Reduced motion pins the reveal open and the frame to the first one
 * (P-03): the still is the poster, and the walkthrough's prev / next buttons still move through the tour.
 */
export function useScrollFrames<T extends HTMLElement = HTMLDivElement>(count: number) {
  const ref = useRef<T | null>(null);
  const reduced = usePrefersReducedMotion();
  const [m, setM] = useState<{ progress: number; scrub: number }>(reduced ? { progress: 1, scrub: 0 } : { progress: 0, scrub: 0 });
  useEffect(() => {
    if (reduced) { setM({ progress: 1, scrub: 0 }); return; }
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const measure = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const span = r.height + vh;
      const progress = span <= 0 ? 0 : clamp01((vh - r.top) / span);
      // A section taller than the viewport scrubs through its own height; a short one reuses the enter mapping.
      const scrub = r.height > vh + 8 ? clamp01(-r.top / Math.max(1, r.height - vh)) : progress;
      setM((prev) => (Math.abs(prev.progress - progress) < 0.002 && Math.abs(prev.scrub - scrub) < 0.002 ? prev : { progress, scrub }));
    };
    const onScroll = () => { if (!raf) raf = window.requestAnimationFrame(measure); };
    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); if (raf) window.cancelAnimationFrame(raf); };
  }, [reduced]);
  const frames = Math.max(1, count);
  const frame = Math.min(frames - 1, Math.max(0, Math.round(m.scrub * (frames - 1))));
  return { ref, frame, frames, progress: m.progress, scrub: m.scrub, reduced };
}

/* ---------------------------------------------------------------------------------------------------------------
 * Video-on-scroll frames (T41-lite)
 * `npm run frames` walks the real OS demo and writes public/frames/<prospectId>/{NN.jpg, desk-NN.jpg, index.json}.
 * This hook loads that index once per prospect, preloads the images, and returns null when the sequence was never
 * generated - which is the whole fallback story: the sections keep rendering the live <MiniOs> composition.
 * ------------------------------------------------------------------------------------------------------------- */

export interface FrameIndex {
  prospect_id: string; generated_at: string; roles: string[];
  count: number; width: number; height: number; labels: string[];
  desk_count: number; desk_width: number; desk_height: number; desk_labels: string[];
  bytes: number;
}
export interface FrameSet { phone: string[]; desk: string[]; labels: string[]; deskLabels: string[]; index: FrameIndex }

/** Where files from `public/` live at runtime. Vite's base is './', and HashRouter never changes the pathname. */
export function assetBase(): string {
  const b = import.meta.env.BASE_URL;
  if (b && b !== './' && b !== '.') return b.endsWith('/') ? b : `${b}/`;
  try { return new URL('.', window.location.href.split('#')[0]).href; } catch { return '/'; }
}

const pad2 = (n: number) => String(n).padStart(2, '0');
const frameCache = new Map<string, FrameSet | null>();
const framePending = new Map<string, Promise<FrameSet | null>>();

function preload(srcs: string[]): Promise<void> {
  if (typeof Image === 'undefined') return Promise.resolve();
  // Await the first few so the first paint never flashes an empty screen; let the rest warm the cache behind them.
  const head = srcs.slice(0, 4).map((src) => new Promise<void>((done) => { const img = new Image(); img.onload = img.onerror = () => done(); img.src = src; }));
  for (const src of srcs.slice(4)) { const img = new Image(); img.decoding = 'async'; img.src = src; }
  return Promise.all(head).then(() => undefined);
}

async function loadFrameSet(prospectId: string): Promise<FrameSet | null> {
  const dir = `${assetBase()}frames/${prospectId}/`;
  try {
    const res = await fetch(`${dir}index.json`, { cache: 'force-cache' });
    if (!res.ok) return null;
    const index = (await res.json()) as FrameIndex;
    if (!index || !Number.isFinite(index.count) || index.count < 1) return null;
    const phone = Array.from({ length: index.count }, (_, i) => `${dir}${pad2(i)}.jpg`);
    const desk = Array.from({ length: Math.max(0, index.desk_count ?? 0) }, (_, i) => `${dir}desk-${pad2(i)}.jpg`);
    await preload([...phone.slice(0, 4), ...desk.slice(0, 2)]);
    void preload([...phone, ...desk]);
    return { phone, desk, labels: index.labels ?? [], deskLabels: index.desk_labels ?? [], index };
  } catch { return null; } // no sequence generated for this prospect: the caller falls back to <MiniOs>
}

/** The generated tour for a prospect, or null while it loads / when it does not exist. */
export function useFrames(prospectId: string | undefined | null): FrameSet | null {
  const [set, setSet] = useState<FrameSet | null>(() => (prospectId ? frameCache.get(prospectId) ?? null : null));
  useEffect(() => {
    if (!prospectId) { setSet(null); return; }
    if (frameCache.has(prospectId)) { setSet(frameCache.get(prospectId) ?? null); return; }
    let alive = true;
    let p = framePending.get(prospectId);
    if (!p) { p = loadFrameSet(prospectId).then((r) => { frameCache.set(prospectId, r); framePending.delete(prospectId); return r; }); framePending.set(prospectId, p); }
    void p.then((r) => { if (alive) setSet(r); });
    return () => { alive = false; };
  }, [prospectId]);
  return set;
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
      for (const d of [0.25, 0.5, 0.75, 1]) if (depth >= d - 0.01) trackOnce(`depth:${d}`, 'scroll_depth', { ...metaRef.current, depth: d }, c);
    };
    const onScroll = () => { if (!raf) raf = window.requestAnimationFrame(measure); };
    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); if (raf) window.cancelAnimationFrame(raf); };
  }, [ready, pageId, prospectId]);
}

const EXIT_KEY = 'leadmagnet.exitintent';
/** A flick back up the page faster than this (px per second) reads as "I am done here" on a touch screen. */
const FLICK_UP_PX_PER_S = 1400;
/**
 * Second chance, once per session (playbook 7). Never a discount, always the calendar.
 *
 * Three intents, none of them hover-only (P-03):
 *  - fine pointer: the pointer leaves through the top of the viewport (for the tab bar or the close button);
 *  - coarse pointer: the back gesture (a pushed history entry), **a fast flick back up the page** after they have
 *    read some of it - the touch equivalent of reaching for the back button - or 45 s of no interaction at all;
 *  - either: the tab being hidden is not used, because switching apps is not leaving.
 *
 * The flick only arms once the viewer is past a quarter of the page, so scrolling back to re-read the hero on arrival
 * never triggers it, and it needs a sustained upward move (two samples) rather than one jittery frame.
 */
export function useExitIntent(onFire: () => void, enabled: boolean) {
  const fired = useRef(false);
  const cb = useRef(onFire); cb.current = onFire;
  useEffect(() => {
    if (!enabled) return;
    try { if (sessionStorage.getItem(EXIT_KEY) === '1') return; } catch { /* private mode */ }
    // The coarse-pointer back gesture is caught with a pushed history entry; when the intent fires another way (idle, flick)
    // or the page unmounts, that entry is popped again so Back never needs pressing twice.
    const ours = () => { try { return (history.state as { lm?: string } | null)?.lm === 'exit'; } catch { return false; } };
    let pushed = false;
    const consumeEntry = () => { if (pushed && ours()) { pushed = false; try { history.back(); } catch { /* ignore */ } } };
    const fire = (viaPop = false) => {
      if (fired.current) return;
      fired.current = true;
      if (viaPop) pushed = false; else consumeEntry();
      try { sessionStorage.setItem(EXIT_KEY, '1'); } catch { /* private mode */ }
      cb.current();
    };
    const coarse = (() => { try { return window.matchMedia('(pointer: coarse)').matches; } catch { return false; } })();
    const onMouseOut = (e: MouseEvent) => { if (!e.relatedTarget && e.clientY <= 4) fire(); };
    let idle = 0;
    const resetIdle = () => { window.clearTimeout(idle); idle = window.setTimeout(() => fire(), 45000); };
    const onPop = () => { if (pushed) { pushed = false; fire(true); } };

    // Fast scroll-up intent (touch). Sampled on scroll, so it costs nothing and needs no touch listeners.
    let lastY = window.scrollY, lastT = performance.now(), ups = 0;
    const onScrollUp = () => {
      const y = window.scrollY, now = performance.now();
      const dt = Math.max(16, now - lastT);
      const speed = ((lastY - y) / dt) * 1000; // positive when moving up the page
      const doc = document.documentElement;
      const readEnough = y > Math.max(600, (doc.scrollHeight - window.innerHeight) * 0.25);
      if (readEnough && speed > FLICK_UP_PX_PER_S) { ups += 1; if (ups >= 2) fire(); } else if (speed <= 0) ups = 0;
      lastY = y; lastT = now;
    };

    if (coarse) {
      try { history.pushState({ lm: 'exit' }, ''); pushed = true; } catch { /* ignore */ }
      window.addEventListener('popstate', onPop);
      window.addEventListener('scroll', onScrollUp, { passive: true });
      for (const ev of ['touchstart', 'scroll', 'keydown'] as const) window.addEventListener(ev, resetIdle, { passive: true });
      resetIdle();
    } else {
      document.addEventListener('mouseout', onMouseOut);
    }
    return () => {
      document.removeEventListener('mouseout', onMouseOut);
      window.removeEventListener('popstate', onPop);
      window.removeEventListener('scroll', onScrollUp);
      for (const ev of ['touchstart', 'scroll', 'keydown'] as const) window.removeEventListener(ev, resetIdle);
      window.clearTimeout(idle);
      consumeEntry();
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
