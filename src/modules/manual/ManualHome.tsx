import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useActions } from '../../actions';
import { useT } from '../../i18n';
import { Badge } from '../../components/atom/Badge/Badge';
import { Button } from '../../components/atom/Button/Button';
import { Card } from '../../components/molecule/Card/Card';
import { Stat } from '../../components/molecule/Stat/Stat';
import { EmptyState } from '../../components/molecule/EmptyState/EmptyState';
import { ChapterNav } from './ChapterNav';
import { ChapterBody, DecisionCallout, decisionsOf, refsOf, useAllChapters } from './ChapterView';
import { ChapterHead } from './ChapterPage';
import { MANUAL_CHAPTERS, translationGaps, unroutedSlugs, type Chapter } from './chapters';
import './manual.css';

/** M-01 `/manual`: the chapter index, every open decision in the manual, the translation state, and chapter I itself. */
export function ManualHome() {
  const t = useT();
  const { chapters, loading } = useAllChapters();
  const [readAll, setReadAll] = useState(false);
  const refs = refsOf(chapters);
  const first = chapters.find((c) => c.slug === MANUAL_CHAPTERS[0].slug) ?? null;
  const gaps = translationGaps();
  const unrouted = unroutedSlugs();
  const decisions = useMemo(() => chapters.flatMap((c) => decisionsOf(c).map((text) => ({ text, chapter: c }))), [chapters]);
  const stale = chapters.filter((c) => c.missing.length > 0);
  const print = useCallback(() => window.print(), []);
  useActions('M-01', {
    'manual.openChapter': (p) => { const r = refs.find((x) => x.code === String(p?.chapter) || x.slug === String(p?.chapter)); if (r) window.location.hash = `#${r.to}`; return r?.code ?? null; },
    'manual.readAll': (p) => { const on = p?.on == null ? true : p.on === true || p.on === 'true'; setReadAll(on); return on; },
    'manual.print': () => { print(); return 'M-01'; },
    'manual.listDecisions': () => decisions.map((d) => ({ chapter: d.chapter.meta.title, text: d.text })),
  });
  if (loading) return <div className="container page stack"><p className="muted">{t('manual.loading')}</p></div>;
  return (<div className="container page stack mn-page">
    {first && <ChapterHead chapter={first} code="M-01" lang={first.lang} />}
    <ChapterNav chapters={refs} current="M-01" onPrint={print} />

    <section className="stack" aria-labelledby="mn-index-h">
      <h2 id="mn-index-h" className="mn-h2">{t('manual.chapters')}</h2>
      <div className="grid mn-index">{refs.map((r) => {
        const c = chapters.find((x) => x.slug === r.slug);
        return (<Card key={r.code} interactive className="mn-index-card">
          <div className="row mn-index-top"><Badge size="sm" tone="primary">{r.code}</Badge><span className="eyebrow">{t('manual.part', { part: r.part })}</span></div>
          <h3 className="mn-index-title"><Link to={r.to}>{r.title}</Link></h3>
          <p className="small muted">{c?.meta.summary ?? ''}</p>
          <p className="xs faint">{t('manual.for_role', { role: c?.meta.role ?? '—' })} · {t('manual.updated', { updated: c?.meta.updated ?? '—' })}</p>
        </Card>);
      })}</div>
    </section>

    <section className="stack" aria-labelledby="mn-dec-h">
      <div className="row-between"><h2 id="mn-dec-h" className="mn-h2">{t('manual.open_decisions')}</h2><Badge tone={decisions.length ? 'warn' : 'success'} size="sm">{decisions.length}</Badge></div>
      <p className="small muted">{t('manual.open_decisions_hint')}</p>
      {decisions.length === 0
        ? <EmptyState icon="check" title={t('manual.no_decisions')} body={t('manual.no_decisions_body')} />
        : <div className="stack-sm">{decisions.map((d, i) => {
            const r = refs.find((x) => x.slug === d.chapter.slug);
            return <DecisionCallout key={`${d.chapter.slug}-${i}`} text={d.text} from={r ? { slug: r.slug, to: r.to, title: `${r.part} · ${r.title}` } : undefined} />;
          })}</div>}
    </section>

    <section className="stack" aria-labelledby="mn-health-h">
      <h2 id="mn-health-h" className="mn-h2">{t('manual.health')}</h2>
      <div className="grid mn-stats">
        <Stat label={t('manual.stat_chapters')} value={refs.length} />
        <Stat label={t('manual.stat_translated')} value={`${refs.length - gaps.length} / ${refs.length}`} tone={gaps.length ? 'warn' : 'success'} hint={t('manual.rule_m02')} />
        <Stat label={t('manual.stat_frontmatter')} value={`${refs.length - stale.length} / ${refs.length}`} tone={stale.length ? 'warn' : 'success'} hint={t('manual.stat_frontmatter_hint')} />
        <Stat label={t('manual.stat_decisions')} value={decisions.length} tone={decisions.length ? 'warn' : 'default'} />
      </div>
      {gaps.length > 0 && <p className="small mn-warn">{t('manual.gaps', { list: gaps.join(', ') })}</p>}
      {unrouted.length > 0 && <p className="small mn-warn">{t('manual.unrouted', { list: unrouted.join(', ') })}</p>}
    </section>

    <section className="stack" aria-labelledby="mn-read-h">
      <div className="row-between">
        <h2 id="mn-read-h" className="mn-h2">{readAll ? t('manual.whole_manual') : t('manual.this_chapter')}</h2>
        <Button variant={readAll ? 'secondary' : 'outline'} size="sm" icon="book" onClick={() => setReadAll((v) => !v)} aria-pressed={readAll}>{readAll ? t('manual.read_one') : t('manual.read_all')}</Button>
      </div>
      {readAll
        ? <div className="stack mn-all">{chapters.map((c) => <AllChapter key={c.slug} chapter={c} code={MANUAL_CHAPTERS.find((m) => m.slug === c.slug)?.code ?? '—'} />)}</div>
        : first
          ? <ChapterBody chapter={first} />
          : <EmptyState icon="book" title={t('manual.missing', { slug: MANUAL_CHAPTERS[0].slug })} body={t('manual.missing_body')} />}
    </section>
  </div>);
}

function AllChapter({ chapter, code }: { chapter: Chapter; code: string }) {
  return (<section className="mn-allchapter" aria-label={chapter.meta.title}>
    <ChapterHead chapter={chapter} code={code} lang={chapter.lang} />
    <ChapterBody chapter={chapter} />
  </section>);
}
