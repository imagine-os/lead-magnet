import { Link, useNavigate } from 'react-router-dom';
import { useT } from '../../i18n';
import { Button } from '../../components/atom/Button/Button';
import { Select } from '../../components/atom/Select/Select';

export interface ChapterRef { code: string; slug: string; to: string; part: string; title: string }

/** Switcher + prev / next + print, shared by M-01..M-05. Every control is a real control: no hover-only affordance. */
export function ChapterNav({ chapters, current, onPrint }: { chapters: ChapterRef[]; current: string; onPrint: () => void }) {
  const t = useT();
  const nav = useNavigate();
  const i = chapters.findIndex((c) => c.code === current);
  const prev = i > 0 ? chapters[i - 1] : null;
  const next = i >= 0 && i < chapters.length - 1 ? chapters[i + 1] : null;
  return (<nav className="mn-nav row-between" aria-label={t('manual.chapter_nav')}>
    <div className="row mn-nav-left">
      <label className="sr-only" htmlFor="mn-switch">{t('manual.jump')}</label>
      <Select id="mn-switch" className="mn-switch" value={current} onChange={(e) => { const c = chapters.find((x) => x.code === e.target.value); if (c) nav(c.to); }}
        options={chapters.map((c) => ({ value: c.code, label: `${c.part} · ${c.title}` }))} />
      <span className="xs faint mn-langhint">{t('manual.lang_hint')}</span>
    </div>
    <div className="row mn-nav-right">
      {prev ? <Button variant="ghost" size="sm" icon="arrow-left" onClick={() => nav(prev.to)}>{t('manual.prev')}</Button> : <span className="mn-nav-gap" aria-hidden />}
      {next ? <Button variant="ghost" size="sm" iconRight="arrow-right" onClick={() => nav(next.to)}>{t('manual.next')}</Button> : <span className="mn-nav-gap" aria-hidden />}
      <Button variant="outline" size="sm" icon="doc" onClick={onPrint}>{t('manual.print')}</Button>
    </div>
  </nav>);
}

/** The prev / next pair repeated under a chapter, with the chapter titles spelled out. */
export function ChapterFooterNav({ chapters, current }: { chapters: ChapterRef[]; current: string }) {
  const t = useT();
  const i = chapters.findIndex((c) => c.code === current);
  const prev = i > 0 ? chapters[i - 1] : null;
  const next = i >= 0 && i < chapters.length - 1 ? chapters[i + 1] : null;
  return (<nav className="mn-footnav" aria-label={t('manual.chapter_nav')}>
    {prev ? <Link className="mn-footnav-link" to={prev.to}><span className="eyebrow">← {t('manual.prev')}</span><span>{prev.part} · {prev.title}</span></Link> : <span />}
    {next ? <Link className="mn-footnav-link is-next" to={next.to}><span className="eyebrow">{t('manual.next')} →</span><span>{next.part} · {next.title}</span></Link> : <span />}
  </nav>);
}
