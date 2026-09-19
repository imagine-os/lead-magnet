import { useCallback } from 'react';
import { useActions } from '../../actions';
import { useT } from '../../i18n';
import { Badge } from '../../components/atom/Badge/Badge';
import { EmptyState } from '../../components/molecule/EmptyState/EmptyState';
import { ChapterFooterNav, ChapterNav } from './ChapterNav';
import { ChapterBody, useAllChapters, useChapter, refsOf } from './ChapterView';
import { chapterRouteOf, type Chapter } from './chapters';
import './manual.css';

/** M-02..M-05: one chapter, live numbers, prev / next, print. The language follows the app toggle (P-13). */
export function ChapterPage({ code }: { code: string }) {
  const t = useT();
  const slug = chapterRouteOf(code)?.slug ?? '';
  const { chapter, loading, lang } = useChapter(slug);
  const { chapters } = useAllChapters();
  const refs = refsOf(chapters);
  const print = useCallback(() => window.print(), []);
  const go = useCallback((dir: 1 | -1) => {
    const i = refs.findIndex((r) => r.code === code);
    const to = refs[i + dir];
    if (to) window.location.hash = `#${to.to}`;
    return to?.code ?? null;
  }, [refs, code]);
  useActions(code, {
    'manual.openChapter': (p) => { const r = refs.find((x) => x.code === String(p?.chapter) || x.slug === String(p?.chapter)); if (r) window.location.hash = `#${r.to}`; return r?.code ?? null; },
    'manual.nextChapter': () => go(1), 'manual.prevChapter': () => go(-1), 'manual.print': () => { print(); return code; },
  });
  if (loading) return <div className="container page stack"><p className="muted">{t('manual.loading')}</p></div>;
  if (!chapter) return <div className="container page stack"><EmptyState icon="book" title={t('manual.missing', { slug })} body={t('manual.missing_body')} /></div>;
  return (<article className="container page stack mn-page">
    <ChapterHead chapter={chapter} code={code} lang={lang} />
    <ChapterNav chapters={refs} current={code} onPrint={print} />
    <ChapterBody chapter={chapter} />
    <ChapterFooterNav chapters={refs} current={code} />
  </article>);
}

/** Shared chapter header: code, part, title, summary, and the six front-matter keys as provenance. */
export function ChapterHead({ chapter, code, lang }: { chapter: Chapter; code: string; lang: string }) {
  const t = useT();
  return (<header className="mn-head">
    <div className="row mn-head-top">
      <Badge tone="primary" size="sm">{code}</Badge>
      <span className="eyebrow">{t('manual.part', { part: chapter.meta.part })}</span>
      {chapter.lang !== lang && <Badge tone="warn" size="sm">{t('manual.no_translation')}</Badge>}
    </div>
    <h1>{chapter.heading}</h1>
    <p className="mn-summary">{chapter.meta.summary}</p>
    <p className="xs muted mn-meta">
      {t('manual.for_role', { role: chapter.meta.role })} · {t('manual.version', { version: chapter.meta.version })} · {t('manual.updated', { updated: chapter.meta.updated })}
      {chapter.missing.length > 0 && <> · <span className="mn-warn">{t('manual.missing_keys', { keys: chapter.missing.join(', ') })}</span></>}
    </p>
  </header>);
}
