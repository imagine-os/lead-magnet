/** C-02 widget renderers: one per Widget kind from deriveRoleViews, plus the shared week strip, mini chart and thread list. */
import { useMemo, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../../i18n/I18nProvider';
import type { Bi, Industry, Prospect, Widget } from '../../engine/types';
import { Card } from '../../components/molecule/Card/Card';
import { Stat } from '../../components/molecule/Stat/Stat';
import { Badge } from '../../components/atom/Badge/Badge';
import { Button } from '../../components/atom/Button/Button';
import { Icon, type IconName } from '../../components/atom/Icon/Icon';
import { Avatar } from '../../components/atom/Avatar/Avatar';
import { Placeholder } from '../../components/atom/Placeholder/Placeholder';
import { DataTable, type Column } from '../../components/organism/DataTable/DataTable';
import { DAYS, weekFor, type CalEvent, type Msg } from './sample';

export const asStrings = (s: unknown): string[] => (Array.isArray(s) ? s.filter((x): x is string => typeof x === 'string') : []);
export const asNumbers = (s: unknown): number[] => (Array.isArray(s) ? s.filter((x): x is number => typeof x === 'number') : []);
export const asChat = (s: unknown): { from: string; text: string }[] => (Array.isArray(s) ? s.filter((x): x is { from: string; text: string } => !!x && typeof x === 'object' && 'from' in x && 'text' in x) : []);
export const asRows = (s: unknown): string[][] => (Array.isArray(s) ? s.filter((x): x is string[] => Array.isArray(x) && x.every((y) => typeof y === 'string')) : []);

const WIDGET_ICON: Record<Widget['kind'], IconName> = { kpi: 'target', list: 'list', calendar: 'calendar', chat: 'message', table: 'table', chart: 'chart', doc: 'doc' };

/** Small inline SVG: bars with a trend line. No chart library, no hover-only information (values are labelled). */
export function MiniChart({ values, label, height = 72 }: { values: number[]; label: string; height?: number }) {
  const v = values.length ? values : [0];
  const max = Math.max(...v, 1);
  const w = 100, gap = 2, bw = (w - gap * (v.length - 1)) / v.length;
  const pts = v.map((n, i) => `${i * (bw + gap) + bw / 2},${34 - (n / max) * 30}`).join(' ');
  return (
    <div className="dw-chart">
      <svg viewBox={`0 0 ${w} 36`} height={height} width="100%" role="img" aria-label={`${label}: ${v.join(', ')}`} preserveAspectRatio="none">
        {v.map((n, i) => <rect key={i} x={i * (bw + gap)} y={34 - (n / max) * 30} width={bw} height={Math.max(1, (n / max) * 30)} rx="1" fill="var(--lp-primary)" opacity={0.28 + 0.72 * (n / max)} />)}
        <polyline points={pts} fill="none" stroke="var(--lp-accent)" strokeWidth="1.2" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="dw-chart-scale xs"><span>{Math.min(...v)}</span><span>{max}</span></div>
    </div>
  );
}

/** A week of themed events. Seven columns on desktop, horizontally scrollable with keyboard-reachable day headers on phone. */
export function WeekStrip({ events, label }: { events: CalEvent[]; label: string }) {
  const { lang, bi } = useI18n();
  const days = DAYS[lang];
  const today = new Date().getDay(); // 0 = Sunday
  const todayIdx = (today + 6) % 7;
  return (
    <div className="dw-week" role="group" aria-label={label} tabIndex={0}>
      {days.map((day, i) => (
        <div key={day} className={`dw-day ${i === todayIdx ? 'is-today' : ''}`}>
          <div className="dw-day-head xs"><span>{day}</span>{i === todayIdx && <span className="dw-dot" aria-hidden />}</div>
          <div className="dw-day-body">
            {events.filter((e) => e.day === i).map((e) => (
              <div key={e.id} className={`dw-ev dw-ev-${e.tone}`}><span className="dw-ev-time xs">{e.time}</span><span className="dw-ev-title">{bi(e.title)}</span><span className="dw-ev-who xs">{e.who}</span></div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function ThreadMessages({ messages, compact }: { messages: Msg[]; compact?: boolean }) {
  const { bi } = useI18n();
  return (
    <ul className={`dw-msgs ${compact ? 'is-compact' : ''}`}>
      {messages.map((m) => (
        <li key={m.id} className={`dw-msg ${m.mine ? 'is-mine' : ''}`}>
          <span className="dw-msg-meta xs"><strong>{m.from}</strong> · {m.at}</span>
          <span className="dw-msg-text">{bi(m.text)}</span>
        </li>
      ))}
    </ul>
  );
}

export function SectionHead({ title, sub, right }: { title: string; sub?: string; right?: ReactNode }) {
  return <div className="demo-sechead"><div><h2 className="demo-h2">{title}</h2>{sub && <p className="xs muted">{sub}</p>}</div>{right}</div>;
}

/** One widget from the engine, rendered by kind. `open` is the C-02 demo.openWidget affordance. */
export function WidgetCard({ w, p, ind, open }: { w: Widget; p: Prospect; ind: Industry; open: (w: Widget) => { to?: string; will?: string } }) {
  const { t, bi } = useI18n();
  const nav = useNavigate();
  const target = open(w);
  const title = bi(w.title as Bi);
  const rows = useMemo(() => asRows(w.sample).map((r, i) => ({ id: `r${i}`, a: r[0] ?? '', b: r[1] ?? '' })), [w.sample]);
  const cols: Column<{ id: string; a: string; b: string }>[] = [{ key: 'a', header: t('demo.item') }, { key: 'b', header: t('demo.value'), align: 'right' }];
  return (
    <Card className={`dw dw-${w.kind}`} padding="md">
      <div className="dw-head">
        <span className="dw-icon" aria-hidden><Icon name={WIDGET_ICON[w.kind]} size={16} /></span>
        <h3 className="dw-title">{title}</h3>
        <Badge size="sm" tone="neutral">{t(`demo.kind_${w.kind}`)}</Badge>
        {target.to
          ? <Button size="sm" variant="ghost" iconRight="arrow-right" onClick={() => nav(target.to!)}>{t('demo.open')}</Button>
          : <Placeholder will={target.will ?? `open the full ${title} view`} by="T13 os-demo"><Button size="sm" variant="ghost" iconRight="arrow-right">{t('demo.open')}</Button></Placeholder>}
      </div>
      <div className="dw-body">
        {w.kind === 'kpi' && <Stat label={title} value={String(w.sample ?? '—')} hint={t('demo.kpi_hint')} size="lg" />}
        {w.kind === 'chart' && <MiniChart values={asNumbers(w.sample)} label={title} />}
        {w.kind === 'list' && (
          <ul className="dw-list">{asStrings(w.sample).map((s, i) => (
            <li key={s + i}><span className="dw-tick" aria-hidden><Icon name="alert" size={14} /></span><span className="grow">{s}</span><Badge size="sm" tone={i === 0 ? 'warn' : 'neutral'}>{i === 0 ? t('demo.now') : t('demo.queued')}</Badge></li>
          ))}</ul>
        )}
        {w.kind === 'doc' && (
          <ul className="dw-docs">{asStrings(w.sample).map((s, i) => (
            <li key={s + i}><span className="dw-doc-ic" aria-hidden><Icon name="doc" size={16} /></span><span className="grow">{s}</span><span className="xs muted">{t('demo.doc_edited')}</span></li>
          ))}</ul>
        )}
        {w.kind === 'calendar' && <WeekStrip events={weekFor(p, ind, w.id, asStrings(w.sample))} label={title} />}
        {w.kind === 'chat' && (
          <ul className="dw-threads">{asChat(w.sample).map((c, i) => (
            <li key={c.from + i}><Avatar name={c.from} size="sm" /><span className="grow"><strong className="xs">{c.from}</strong><span className="dw-thread-text">{c.text}</span></span></li>
          ))}</ul>
        )}
        {w.kind === 'table' && <DataTable columns={cols} rows={rows} caption={title} dense empty={{ title: t('demo.no_rows') }} />}
      </div>
    </Card>
  );
}
