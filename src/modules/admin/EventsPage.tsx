import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTable, indexById } from '../../data/DataContext';
import type { EventRow, PageRow, ProspectRow } from '../../data/schema/core';
import { EVENT_TYPES } from '../../data/schema/core';
import { useI18n } from '../../i18n/I18nProvider';
import { useActions } from '../../actions';
import { Card } from '../../components/molecule/Card/Card';
import { Field } from '../../components/molecule/Field/Field';
import { Select } from '../../components/atom/Select/Select';
import { Badge } from '../../components/atom/Badge/Badge';
import { Button } from '../../components/atom/Button/Button';
import { Icon } from '../../components/atom/Icon/Icon';
import { DataTable, type Column } from '../../components/organism/DataTable/DataTable';
import { Drawer } from '../../components/organism/Drawer/Drawer';
import { EVENT_ICON, eventSummary, when } from './timeline';
import './admin.css';

const ALL = '';
/** A-03 - the raw events log with the four filters that matter and the full meta JSON per row. */
export function EventsPage() {
  const { t } = useI18n();
  const { rows: events } = useTable<EventRow>('events');
  const { rows: pages } = useTable<PageRow>('pages');
  const { rows: prospects } = useTable<ProspectRow>('prospects');
  const [type, setType] = useState(ALL); const [pageId, setPageId] = useState(ALL); const [session, setSession] = useState(ALL); const [prospectId, setProspectId] = useState(ALL);
  const [open, setOpen] = useState<EventRow | null>(null);

  const pageById = useMemo(() => indexById(pages), [pages]);
  const prospectById = useMemo(() => indexById(prospects), [prospects]);
  const sessions = useMemo(() => [...new Set(events.map((e) => e.session_id))].sort(), [events]);
  const rows = useMemo(() => events
    .filter((e) => (!type || e.type === type) && (!pageId || e.page_id === pageId) && (!session || e.session_id === session) && (!prospectId || e.prospect_id === prospectId))
    .sort((a, b) => String(b.ts).localeCompare(String(a.ts))), [events, type, pageId, session, prospectId]);

  const api = useRef({ setType, setPageId, setSession, setProspectId, setOpen, rows });
  api.current = { setType, setPageId, setSession, setProspectId, setOpen, rows };
  useActions('A-03', {
    'admin.filterEvents': (p) => {
      if (p?.type !== undefined) api.current.setType(String(p.type ?? ''));
      if (p?.page !== undefined) api.current.setPageId(String(p.page ?? ''));
      if (p?.session !== undefined) api.current.setSession(String(p.session ?? ''));
      if (p?.prospect !== undefined) api.current.setProspectId(String(p.prospect ?? ''));
      return { type, page: pageId, session, prospect: prospectId };
    },
    'admin.clearEventFilters': () => { api.current.setType(''); api.current.setPageId(''); api.current.setSession(''); api.current.setProspectId(''); return 'cleared'; },
    'admin.openEventMeta': (p) => { const row = api.current.rows.find((e) => e.id === String(p?.id ?? '')); api.current.setOpen(row ?? null); return row ? row.id : 'not found'; },
  });

  const columns: Column<EventRow>[] = [
    { key: 'ts', header: t('admin.ev_when'), width: '12rem', render: (r) => <span className="xs">{when(String(r.ts))}</span> },
    { key: 'type', header: t('admin.ev_type'), render: (r) => <span className="row xs"><Icon name={EVENT_ICON[r.type] ?? 'info'} size={14} />{t(`admin.ev_${r.type}`)}</span> },
    { key: 'prospect', header: t('admin.ev_prospect'), render: (r) => (r.prospect_id && prospectById[r.prospect_id] ? <Link to={`/admin/prospects/${r.prospect_id}`}>{(prospectById[r.prospect_id] as ProspectRow).business_name}</Link> : <span className="xs muted">—</span>) },
    { key: 'page', header: t('admin.ev_page'), render: (r) => <span className="xs">{r.page_id && pageById[r.page_id] ? `${(pageById[r.page_id] as PageRow).slug} · ${(pageById[r.page_id] as PageRow).variant}` : '—'}</span> },
    { key: 'session_id', header: t('admin.ev_session'), render: (r) => <code className="ad-code">{r.session_id}</code> },
    { key: 'meta', header: t('admin.ev_meta'), render: (r) => <span className="xs muted">{eventSummary(r) || '{}'}</span> },
    { key: 'open', header: t('admin.ev_json'), align: 'right', hideOnCard: true, render: (r) => <Button size="sm" variant="ghost" icon="code" onClick={() => setOpen(r)}>JSON</Button> },
  ];

  return (<div className="container container-wide page stack ad">
    <div className="page-head"><div><h1>{t('admin.events_h1')}</h1><p className="xs muted">{t('admin.events_sub')}</p></div><Badge tone="primary" size="sm">A-03</Badge></div>
    <Card padding="sm">
      <div className="ad-filter-grid">
        <Field label={t('admin.ev_type')}><Select value={type} onChange={(e) => setType(e.target.value)} options={[{ value: ALL, label: t('admin.all') }, ...EVENT_TYPES.map((x) => ({ value: x, label: t(`admin.ev_${x}`) }))]} /></Field>
        <Field label={t('admin.ev_page')}><Select value={pageId} onChange={(e) => setPageId(e.target.value)} options={[{ value: ALL, label: t('admin.all') }, ...pages.map((p) => ({ value: p.id, label: `${p.slug} · ${p.variant}` }))]} /></Field>
        <Field label={t('admin.ev_session')}><Select value={session} onChange={(e) => setSession(e.target.value)} options={[{ value: ALL, label: t('admin.all') }, ...sessions.map((s) => ({ value: s, label: s }))]} /></Field>
        <Field label={t('admin.ev_prospect')}><Select value={prospectId} onChange={(e) => setProspectId(e.target.value)} options={[{ value: ALL, label: t('admin.all') }, ...prospects.map((p) => ({ value: p.id, label: p.business_name }))]} /></Field>
      </div>
      <div className="row wrap"><Button size="sm" variant="outline" icon="refresh" onClick={() => { setType(''); setPageId(''); setSession(''); setProspectId(''); }}>{t('admin.clear_filters')}</Button><span className="xs muted">{t('admin.ev_count', { shown: String(rows.length), all: String(events.length) })}</span></div>
    </Card>
    <DataTable caption={t('admin.events_h1')} dense rows={rows} columns={columns} onRowClick={(r) => setOpen(r)} empty={{ title: t('admin.no_events'), body: t('admin.no_events_body') }} />
    <Drawer open={!!open} onClose={() => setOpen(null)} title={open ? t(`admin.ev_${open.type}`) : t('admin.ev_meta')} width={520}>
      {open && (<div className="stack-sm">
        <div className="row wrap xs"><Badge size="sm">{open.type}</Badge><code className="ad-code">{open.id}</code><span className="muted">{when(String(open.ts))}</span></div>
        <dl className="ad-dl">
          <dt>{t('admin.ev_session')}</dt><dd><code className="ad-code">{open.session_id}</code></dd>
          <dt>{t('admin.ev_page')}</dt><dd>{open.page_id ? <code className="ad-code">{open.page_id}</code> : '—'}</dd>
          <dt>{t('admin.ev_prospect')}</dt><dd>{open.prospect_id ? <Link to={`/admin/prospects/${open.prospect_id}`}>{open.prospect_id}</Link> : '—'}</dd>
        </dl>
        <div className="eyebrow">{t('admin.ev_meta')}</div>
        <pre className="ad-json">{JSON.stringify(open.meta ?? {}, null, 2)}</pre>
      </div>)}
    </Drawer>
  </div>);
}
