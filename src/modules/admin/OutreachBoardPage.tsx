import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useData, useTable, indexById } from '../../data/DataContext';
import type { PageRow, ProspectRow, TouchRow } from '../../data/schema/core';
import { CHANNELS } from '../../data/schema/core';
import { useI18n } from '../../i18n/I18nProvider';
import { useSession } from '../../auth/SessionProvider';
import { useActions } from '../../actions';
import { Card } from '../../components/molecule/Card/Card';
import { Field } from '../../components/molecule/Field/Field';
import { Select } from '../../components/atom/Select/Select';
import { Badge } from '../../components/atom/Badge/Badge';
import { Icon } from '../../components/atom/Icon/Icon';
import { EmptyState } from '../../components/molecule/EmptyState/EmptyState';
import { useToast } from '../../components/molecule/Toast/Toast';
import { CHANNEL_ICON, when } from './timeline';
import './admin.css';

/** The five board columns; anything else (scheduled, bounced) lands in `other` so no touch can disappear. */
const COLUMNS = ['draft', 'sent', 'opened', 'clicked', 'replied', 'other'] as const;
type ColumnKey = (typeof COLUMNS)[number];
const MOVABLE = ['draft', 'scheduled', 'sent', 'opened', 'clicked', 'replied', 'bounced'] as const;
const columnOf = (status: string): ColumnKey => ((COLUMNS as readonly string[]).includes(status) && status !== 'other' ? (status as ColumnKey) : 'other');
/** Moving a touch forward stamps the timestamp that status implies, and never clears an earlier one. */
function stamps(status: string, row: TouchRow): Partial<TouchRow> {
  const now = new Date().toISOString();
  const patch: Partial<TouchRow> = { status: status as TouchRow['status'] };
  if (status === 'draft') return patch;
  if (['sent', 'opened', 'clicked', 'replied', 'bounced'].includes(status) && !row.sent_at) patch.sent_at = now;
  if (['opened', 'clicked', 'replied'].includes(status) && !row.opened_at) patch.opened_at = now;
  if (['clicked', 'replied'].includes(status) && !row.clicked_at) patch.clicked_at = now;
  return patch;
}

/** A-04 - outreach as a board: five status columns, channel on every card, moved with a Select (never drag-only, P-03). */
export function OutreachBoardPage() {
  const { t } = useI18n(); const { can } = useSession(); const data = useData(); const toast = useToast();
  const { rows: touches } = useTable<TouchRow>('touches');
  const { rows: prospects } = useTable<ProspectRow>('prospects');
  const { rows: pages } = useTable<PageRow>('pages');
  const [channel, setChannel] = useState('');
  const prospectById = useMemo(() => indexById(prospects), [prospects]);
  const pageById = useMemo(() => indexById(pages), [pages]);
  const shown = useMemo(() => touches.filter((c) => !channel || c.channel === channel), [touches, channel]);
  const writable = can('prospects.write');

  async function move(id: string, status: string) {
    const row = touches.find((c) => c.id === id);
    if (!row) return 'not found';
    await data.update<TouchRow>('touches', id, stamps(status, row));
    toast.push({ tone: 'success', title: t('admin.touch_moved', { status: t(`admin.ts_${status}`) }) });
    return status;
  }
  const api = useRef({ move, setChannel });
  api.current = { move, setChannel };
  useActions('A-04', {
    'admin.moveTouch': async (p) => { const id = String(p?.touch ?? ''); const status = String(p?.status ?? ''); if (!id || !(MOVABLE as readonly string[]).includes(status)) return `pass touch=<id> and status=${MOVABLE.join('|')}`; return api.current.move(id, status); },
    'admin.filterOutreach': (p) => { const c = String(p?.channel ?? ''); api.current.setChannel((CHANNELS as readonly string[]).includes(c) ? c : ''); return c || 'all'; },
  });

  return (<div className="container container-wide page stack ad">
    <div className="page-head"><div><h1>{t('admin.outreach_h1')}</h1><p className="xs muted">{t('admin.outreach_sub')}</p></div><Badge tone="primary" size="sm">A-04</Badge></div>
    <Card padding="sm"><div className="ad-filter-grid ad-filter-one">
      <Field label={t('admin.channel')} inline><Select value={channel} onChange={(e) => setChannel(e.target.value)} options={[{ value: '', label: t('admin.all') }, ...CHANNELS.map((c) => ({ value: c, label: t(`admin.ch_${c}`) }))]} /></Field>
      <span className="xs muted">{t('admin.touch_count', { shown: String(shown.length), all: String(touches.length) })}</span>
    </div></Card>

    <div className="ad-board">
      {COLUMNS.map((col) => { const cards = shown.filter((c) => columnOf(c.status) === col); return (<section key={col} className="ad-col" aria-labelledby={`ad-col-${col}`}>
        <div className="ad-col-head"><h2 id={`ad-col-${col}`} className="ad-col-title">{t(`admin.ts_${col}`)}</h2><Badge size="sm">{cards.length}</Badge></div>
        {cards.length === 0 ? <p className="xs muted ad-col-empty">{t('admin.col_empty')}</p> : cards.map((c) => { const p = prospectById[c.prospect_id] as ProspectRow | undefined; const pg = c.page_id ? (pageById[c.page_id] as PageRow | undefined) : undefined; return (
          <Card key={c.id} padding="sm" className="ad-touch stack-sm">
            <div className="row wrap xs"><span className="row"><Icon name={CHANNEL_ICON[c.channel] ?? 'mail'} size={14} />{t(`admin.ch_${c.channel}`)}</span><span className="grow" />{p && <Badge size="sm" tone={p.warmth === 'hot' ? 'danger' : p.warmth === 'warm' ? 'warn' : 'info'}>{t(`admin.warm_${p.warmth}`)}</Badge>}</div>
            <div className="ad-strong ad-touch-subject">{c.subject}</div>
            <p className="xs muted ad-touch-body">{c.body_preview}</p>
            <div className="xs muted">{p ? <Link to={`/admin/prospects/${p.id}`}>{p.business_name}</Link> : '—'}{pg && <> · <Link to={`/p/${pg.slug}`}>{pg.slug}</Link></>}</div>
            <div className="xs muted">{[c.sent_at && `${t('admin.ts_sent')} ${when(c.sent_at)}`, c.opened_at && `${t('admin.ts_opened')} ${when(c.opened_at)}`, c.clicked_at && `${t('admin.ts_clicked')} ${when(c.clicked_at)}`].filter(Boolean).join(' · ') || t('admin.touch_nostamps')}</div>
            <Field label={t('admin.move_to')} inline><Select value={c.status} disabled={!writable} onChange={(e) => void move(c.id, e.target.value)} options={MOVABLE.map((s) => ({ value: s, label: t(`admin.ts_${s}`) }))} /></Field>
          </Card>); })}
      </section>); })}
    </div>
    {touches.length === 0 && <EmptyState icon="mail" title={t('admin.no_touches')} body={t('admin.no_touches_body')} />}
    <p className="xs muted">{t('admin.outreach_note')}</p>
  </div>);
}
