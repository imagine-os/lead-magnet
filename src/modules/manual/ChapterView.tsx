import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { useI18n, useT, type Lang } from '../../i18n';
import { Badge } from '../../components/atom/Badge/Badge';
import { Card } from '../../components/molecule/Card/Card';
import { loadAll, loadChapter, MANUAL_CHAPTERS, parseSegments, type Chapter, type Segment } from './chapters';
import type { ChapterRef } from './ChapterNav';
import { LiveBlock } from './LiveBlock';
import './manual.css';

/** 1280 px light shots, hashed into the build by Vite. A chapter asks for a code; a missing shot is a dashed frame. */
const SHOTS = import.meta.glob<string>('../../../docs/screenshots/*/1280.jpg', { eager: true, query: '?url', import: 'default' });
const shotUrl = (code: string): string | null => SHOTS[`../../../docs/screenshots/${code}/1280.jpg`] ?? null;

export function useChapter(slug: string): { chapter: Chapter | null; loading: boolean; lang: Lang } {
  const { lang } = useI18n();
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let live = true;
    setLoading(true);
    loadChapter(slug, lang).then((c) => { if (live) { setChapter(c); setLoading(false); } });
    return () => { live = false; };
  }, [slug, lang]);
  return { chapter, loading, lang };
}

/** Every `> DECISION NEEDED:` in a chapter, in order. M-01 collects these across the manual. */
export const decisionsOf = (c: Chapter): string[] => parseSegments(c.body).filter((s): s is Extract<Segment, { kind: 'decision' }> => s.kind === 'decision').map((s) => s.text);

export function ChapterBody({ chapter }: { chapter: Chapter }) {
  const segments = useMemo(() => parseSegments(chapter.body), [chapter.body]);
  return (<div className="mn-body">{segments.map((s) => {
    switch (s.kind) {
      case 'md': return <div key={s.key} className="prose"><ReactMarkdown>{s.text}</ReactMarkdown></div>;
      case 'live': return <LiveBlock key={s.key} name={s.name} arg={s.arg} raw={s.raw} />;
      case 'shot': return <Figure key={s.key} code={s.code} caption={s.caption} />;
      case 'decision': return <DecisionCallout key={s.key} text={s.text} />;
    }
  })}</div>);
}

function Figure({ code, caption }: { code: string; caption: string }) {
  const t = useT();
  const url = shotUrl(code);
  return (<figure className={`mn-figure ${url ? '' : 'is-missing'}`}>
    {url
      ? <img src={url} alt={t('manual.figure_alt', { code, caption })} loading="lazy" width={1280} height={800} />
      : <div className="mn-figure-empty"><span className="eyebrow">{t('manual.figure_missing')}</span><code>docs/screenshots/{code}/1280.jpg</code></div>}
    <figcaption className="small"><Badge size="sm" tone="neutral">{code}</Badge> {caption}</figcaption>
  </figure>);
}

export function DecisionCallout({ text, from }: { text: string; from?: { slug: string; to: string; title: string } }) {
  const t = useT();
  return (<Card className={`mn-decision ${from ? 'is-listed' : ''}`}>
    <div className="row mn-decision-head"><Badge tone="warn" size="sm">{t('manual.decision_needed')}</Badge>{from && <Link className="xs" to={from.to}>{from.title}</Link>}</div>
    <p className="small">{text}</p>
  </Card>);
}

/** Every chapter of the current language, in part order, with its route. Chapters are small; the manual loads all five. */
export function useAllChapters(): { chapters: Chapter[]; loading: boolean } {
  const { lang } = useI18n();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let live = true;
    setLoading(true);
    loadAll(lang).then((c) => { if (live) { setChapters(c); setLoading(false); } });
    return () => { live = false; };
  }, [lang]);
  return { chapters, loading };
}
/** ChapterNav rows built from the loaded chapters (falls back to the code while a chapter is still loading). */
export function refsOf(chapters: Chapter[]): ChapterRef[] {
  return MANUAL_CHAPTERS.map((r) => {
    const c = chapters.find((x) => x.slug === r.slug);
    return { code: r.code, slug: r.slug, to: r.to, part: c?.meta.part || r.code, title: c?.meta.title || r.slug };
  });
}
