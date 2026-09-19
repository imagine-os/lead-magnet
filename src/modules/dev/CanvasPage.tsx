import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getRoutes, routeStatus } from '../../app/registry';
import { SURFACE_LABEL, type RouteDef, type Surface } from '../../specs/types';
import { useActions } from '../../actions';
import { Button } from '../../components/atom/Button/Button';
import { IconButton } from '../../components/atom/IconButton/IconButton';
import { Chip } from '../../components/atom/Chip/Chip';
import { Badge } from '../../components/atom/Badge/Badge';
import { Toggle } from '../../components/atom/Toggle/Toggle';
import { Tooltip } from '../../components/molecule/Tooltip/Tooltip';
import { fillParams } from './QaPreviewPage';
import './canvas.css';

const SURFACE_ORDER: Surface[] = ['public', 'demo', 'studio', 'admin', 'plan', 'docs', 'manual', 'dev'];
const CARD_W = 300, THUMB_W = 1280, THUMB_H = 800, MIN = 0.2, MAX = 2.5;
/** Fit never shrinks a card's controls under 44 px (P-03): the card body link is ~105 px tall at zoom 1, so 0.45 is the floor; on a phone the canvas pans instead. */
const FIT_MIN = 0.45;
const STAGE_W = 1720;

function Thumb({ route, load, onLoad }: { route: RouteDef; load: boolean; onLoad: () => void }) {
  const scale = (CARD_W - 2) / THUMB_W;
  const src = `${window.location.pathname}${window.location.search}#${fillParams(route.path)}`;
  return (<div className="cv-thumb" style={{ height: THUMB_H * scale }}>
    {load ? <iframe src={src} title={`${route.spec.code} preview`} width={THUMB_W} height={THUMB_H} style={{ transform: `scale(${scale})` }} loading="lazy" tabIndex={-1} aria-hidden />
      : <button type="button" className="cv-thumb-load" onClick={onLoad}><span className="cv-thumb-code">{route.spec.code}</span><span className="xs">Load live thumbnail</span></button>}
  </div>);
}

/** D-07: every route as a card grouped by surface on a zoomable, pannable canvas. Zoom: buttons, + / - keys, wheel. Pan: arrow keys, drag on the background, scrollbars. */
export function CanvasPage() {
  const nav = useNavigate();
  const routes = useMemo(() => getRoutes().filter((r) => r.path !== '*').sort((a, b) => a.spec.code.localeCompare(b.spec.code)), []);
  const [zoom, setZoom] = useState(0.6);
  const [thumbs, setThumbs] = useState(false);
  const [loaded, setLoaded] = useState<Set<string>>(new Set());
  const [surfaces, setSurfaces] = useState<Set<Surface>>(new Set(SURFACE_ORDER));
  const [status, setStatus] = useState<'all' | 'built' | 'stub'>('all');
  const view = useRef<HTMLDivElement>(null); const stage = useRef<HTMLDivElement>(null);
  const [stageH, setStageH] = useState(1200);
  useEffect(() => { const el = stage.current; if (!el) return; const ro = new ResizeObserver(() => setStageH(el.scrollHeight)); ro.observe(el); return () => ro.disconnect(); }, []);

  const zoomTo = useCallback((z: number, cx?: number, cy?: number) => {
    const v = view.current; const nz = Math.min(MAX, Math.max(MIN, z));
    if (v && cx != null && cy != null) { const rect = v.getBoundingClientRect(); const px = (v.scrollLeft + cx - rect.left) / zoom, py = (v.scrollTop + cy - rect.top) / zoom; setZoom(nz); requestAnimationFrame(() => { v.scrollLeft = px * nz - (cx - rect.left); v.scrollTop = py * nz - (cy - rect.top); }); }
    else setZoom(nz);
  }, [zoom]);
  const fit = useCallback(() => { const v = view.current; if (!v) return; setZoom(Math.min(MAX, Math.max(MIN, FIT_MIN, (v.clientWidth - 24) / STAGE_W))); v.scrollTo(0, 0); }, []);
  useEffect(() => { fit(); }, [fit]);
  const pan = (dx: number, dy: number) => view.current?.scrollBy({ left: dx, top: dy, behavior: 'smooth' });
  const openCode = useCallback((code: string) => { const r = routes.find((x) => x.spec.code === code); if (r) nav(fillParams(r.path)); }, [routes, nav]);
  useActions('D-07', { 'dev.canvasZoomIn': () => zoomTo(zoom * 1.25), 'dev.canvasZoomOut': () => zoomTo(zoom / 1.25), 'dev.canvasFit': fit, 'dev.canvasThumbnails': () => setThumbs((t) => !t), 'dev.canvasOpen': (p) => openCode(String(p?.code)) });

  const onKey = (e: React.KeyboardEvent) => {
    if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'SELECT') return;
    const k = e.key;
    if (k === '+' || k === '=') { e.preventDefault(); zoomTo(zoom * 1.25); } else if (k === '-' || k === '_') { e.preventDefault(); zoomTo(zoom / 1.25); } else if (k === '0') { e.preventDefault(); fit(); }
    else if (k === 'ArrowLeft') { e.preventDefault(); pan(-120, 0); } else if (k === 'ArrowRight') { e.preventDefault(); pan(120, 0); } else if (k === 'ArrowUp') { e.preventDefault(); pan(0, -120); } else if (k === 'ArrowDown') { e.preventDefault(); pan(0, 120); }
  };
  useEffect(() => { const v = view.current; if (!v) return; const onWheel = (e: WheelEvent) => { if (e.shiftKey) return; e.preventDefault(); zoomTo(zoom * (e.deltaY < 0 ? 1.1 : 1 / 1.1), e.clientX, e.clientY); }; v.addEventListener('wheel', onWheel, { passive: false }); return () => v.removeEventListener('wheel', onWheel); }, [zoom, zoomTo]);
  const drag = useRef<{ x: number; y: number; sl: number; st: number } | null>(null);
  const onPointerDown = (e: React.PointerEvent) => { if ((e.target as HTMLElement).closest('.cv-card')) return; const v = view.current!; drag.current = { x: e.clientX, y: e.clientY, sl: v.scrollLeft, st: v.scrollTop }; v.setPointerCapture(e.pointerId); v.classList.add('is-dragging'); };
  const onPointerMove = (e: React.PointerEvent) => { const d = drag.current; if (!d) return; const v = view.current!; v.scrollLeft = d.sl - (e.clientX - d.x); v.scrollTop = d.st - (e.clientY - d.y); };
  const onPointerUp = () => { drag.current = null; view.current?.classList.remove('is-dragging'); };

  const visible = routes.filter((r) => surfaces.has(r.surface) && (status === 'all' || routeStatus(r) === status));
  const groups = SURFACE_ORDER.filter((s) => surfaces.has(s)).map((s) => ({ surface: s, routes: visible.filter((r) => r.surface === s) })).filter((g) => g.routes.length);
  const built = routes.filter((r) => routeStatus(r) === 'built').length;
  return (<div className="cv">
    <div className="cv-toolbar">
      <div className="row wrap"><h1 className="cv-title">D-07 · Page canvas</h1><span className="xs muted">{routes.length} routes · {built} built · {routes.length - built} stubs</span></div>
      <div className="row wrap">
        <Tooltip text="Zoom out (-)"><IconButton icon="zoom-out" label="Zoom out" variant="outline" onClick={() => zoomTo(zoom / 1.25)} /></Tooltip>
        <span className="cv-zoom mono" aria-live="polite">{Math.round(zoom * 100)}%</span>
        <Tooltip text="Zoom in (+)"><IconButton icon="zoom-in" label="Zoom in" variant="outline" onClick={() => zoomTo(zoom * 1.25)} /></Tooltip>
        <Tooltip text="Fit to width (0)"><IconButton icon="maximize" label="Fit to width" variant="outline" onClick={fit} /></Tooltip>
        <Toggle checked={thumbs} onChange={(v) => { setThumbs(v); if (v) setLoaded(new Set(routes.map((r) => r.path))); }} label="Live thumbnails" />
      </div>
      <div className="row wrap">{SURFACE_ORDER.map((s) => <Chip key={s} selected={surfaces.has(s)} onClick={() => setSurfaces((set) => { const n = new Set(set); if (n.has(s)) n.delete(s); else n.add(s); return n; })}>{SURFACE_LABEL[s]}</Chip>)}<span className="faint">|</span>{(['all', 'built', 'stub'] as const).map((s) => <Chip key={s} selected={status === s} onClick={() => setStatus(s)}>{s}</Chip>)}</div>
    </div>
    <div ref={view} className="cv-view" data-spatial="skip" tabIndex={0} role="region" aria-label="Page canvas. Zoom with plus and minus, fit with 0, pan with arrow keys or drag." onKeyDown={onKey} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}>
      <div className="cv-scroll" style={{ width: STAGE_W * zoom, height: stageH * zoom }}>
        <div ref={stage} className="cv-stage" style={{ width: STAGE_W, transform: `scale(${zoom})` }}>
          {groups.map((g) => (<section key={g.surface} className={`cv-group cv-group-${g.surface}`} aria-label={SURFACE_LABEL[g.surface]}>
            <header className="cv-group-head"><h2>{SURFACE_LABEL[g.surface]}</h2><Badge size="sm">{g.routes.length}</Badge><span className="xs muted">{g.routes.filter((r) => routeStatus(r) === 'built').length} built</span></header>
            <div className="cv-cards">{g.routes.map((r) => { const st = routeStatus(r); return (<article key={r.path} className={`cv-card is-${st}`} style={{ width: CARD_W }}>
              <div className="cv-card-head"><Link to={fillParams(r.path)} className="cv-code" title={`Open ${r.spec.name}`}>{r.spec.code}</Link><Badge status={st} size="sm">{st}</Badge><span className="cv-actions xs" title="actions declared">{r.spec.actions.length} act</span></div>
              <Thumb route={r} load={thumbs || loaded.has(r.path)} onLoad={() => setLoaded((s) => new Set(s).add(r.path))} />
              <Link to={fillParams(r.path)} className="cv-card-body"><div className="cv-name">{r.spec.name}</div><div className="cv-path mono xs">{r.path}</div><div className="xs muted cv-purpose">{r.spec.purpose}</div></Link>
            </article>); })}</div>
          </section>))}
        </div>
      </div>
    </div>
    <div className="cv-help xs muted"><kbd>+</kbd> <kbd>-</kbd> zoom · <kbd>0</kbd> fit · wheel zooms at the cursor · <kbd>Shift</kbd>+wheel or arrow keys pan · drag the background to pan · click a code or card to open · <Button variant="link" size="sm" onClick={() => setLoaded(new Set())}>unload thumbnails</Button></div>
  </div>);
}
