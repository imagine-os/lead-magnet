import { useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useData, useTable, indexById } from '../../data/DataContext';
import type { BookingRow, ProspectRow } from '../../data/schema/core';
import { BOOKING_STATUS } from '../../data/schema/core';
import { useI18n } from '../../i18n/I18nProvider';
import { useSession } from '../../auth/SessionProvider';
import { useActions } from '../../actions';
import { Card } from '../../components/molecule/Card/Card';
import { Stat } from '../../components/molecule/Stat/Stat';
import { Select } from '../../components/atom/Select/Select';
import { Badge } from '../../components/atom/Badge/Badge';
import { DataTable, type Column } from '../../components/organism/DataTable/DataTable';
import { useToast } from '../../components/molecule/Toast/Toast';
import { when } from './timeline';
import { tzForProspect, slotInWords } from '../../engine/slots';
import './admin.css';

/** A-05 - upcoming and past walkthroughs; status is written by id through the provider (R-B03, P-14). */
export function BookingsPage() {
  const { t, lang } = useI18n(); const { can } = useSession(); const data = useData(); const toast = useToast();
  const { rows: bookings } = useTable<BookingRow>('bookings');
  const { rows: prospects } = useTable<ProspectRow>('prospects');
  const prospectById = useMemo(() => indexById(prospects), [prospects]);
  const writable = can('prospects.write');
  const now = Date.now();
  const sorted = useMemo(() => [...bookings].sort((a, b) => String(a.slot).localeCompare(String(b.slot))), [bookings]);
  const upcoming = sorted.filter((b) => new Date(b.slot).getTime() >= now && b.status !== 'cancelled');
  const past = [...sorted].reverse().filter((b) => new Date(b.slot).getTime() < now || b.status === 'cancelled');

  async function setStatus(id: string, status: string) {
    if (!(BOOKING_STATUS as readonly string[]).includes(status)) return `status must be one of ${BOOKING_STATUS.join('|')}`;
    await data.update<BookingRow>('bookings', id, { status: status as BookingRow['status'] });
    toast.push({ tone: 'success', title: t('admin.bk_moved', { status: t(`booking.status_${status}`) }) });
    return status;
  }
  const api = useRef({ setStatus });
  api.current = { setStatus };
  useActions('A-05', { 'admin.setBookingStatus': async (p) => { const id = String(p?.id ?? ''); if (!id) return 'pass id=<booking id> and status='; return api.current.setStatus(id, String(p?.status ?? '')); } });

  const columns: Column<BookingRow>[] = [
    { key: 'slot', header: t('admin.bk_slot'), sortable: true, accessor: (r) => String(r.slot), render: (r) => { const p = prospectById[r.prospect_id] as ProspectRow | undefined; return <span className="ad-strong ad-nowrap">{p ? slotInWords(r.slot, tzForProspect(p), lang) : when(r.slot)}</span>; } },
    { key: 'prospect', header: t('admin.ev_prospect'), sortable: true, accessor: (r) => (prospectById[r.prospect_id] as ProspectRow | undefined)?.business_name ?? null, render: (r) => { const p = prospectById[r.prospect_id] as ProspectRow | undefined; return p ? <Link to={`/admin/prospects/${p.id}`}>{p.business_name}</Link> : <code className="ad-code">{r.prospect_id}</code>; } },
    { key: 'duration_min', header: t('admin.bk_duration'), align: 'right', sortable: true, render: (r) => <span className="ad-num">{r.duration_min}′</span> },
    { key: 'contact', header: t('admin.bk_contact'), sortable: true, accessor: (r) => r.contact_name || null, render: (r) => <span className="stack-sm"><strong>{r.contact_name || '—'}</strong>{r.contact_email && <a className="xs" href={`mailto:${r.contact_email}`}>{r.contact_email}</a>}{r.contact_phone && <a className="xs muted" href={`tel:${r.contact_phone}`}>{r.contact_phone}</a>}</span> },
    { key: 'notes', header: t('admin.bk_notes'), render: (r) => <span className="xs muted">{r.notes || '—'}</span> },
    { key: 'created_at', header: t('admin.bk_requested'), sortable: true, render: (r) => <span className="xs muted ad-nowrap">{when(r.created_at)}</span> },
    { key: 'status', header: t('admin.bk_status'), sortable: true, accessor: (r) => t(`booking.status_${r.status}`), render: (r) => (<span className="ad-status"><Badge size="sm" status={r.status}>{t(`booking.status_${r.status}`)}</Badge>
      <Select value={r.status} disabled={!writable} aria-label={t('admin.bk_set_status')} onChange={(e) => void setStatus(r.id, e.target.value)} options={BOOKING_STATUS.map((s) => ({ value: s, label: t(`booking.status_${s}`) }))} /></span>) },
  ];

  return (<div className="container container-wide page stack ad">
    <div className="page-head"><div><h1>{t('admin.bookings_h1')}</h1><p className="xs muted">{t('admin.bookings_sub')}</p></div><Badge tone="primary" size="sm">A-05</Badge></div>
    <div className="grid grid-4">
      <Stat label={t('admin.bk_upcoming')} value={upcoming.length} />
      <Stat label={t('admin.bk_past')} value={past.length} />
      <Stat label={t('booking.status_requested')} value={bookings.filter((b) => b.status === 'requested').length} tone="warn" hint={t('admin.bk_requested_hint')} />
      <Stat label={t('booking.status_confirmed')} value={bookings.filter((b) => b.status === 'confirmed').length} tone="success" />
    </div>
    <Card className="stack-sm"><div className="row wrap"><h2>{t('admin.bk_upcoming')}</h2><Badge size="sm">{upcoming.length}</Badge></div>
      <DataTable caption={t('admin.bk_upcoming')} rows={upcoming} columns={columns} defaultSort={{ key: 'slot', dir: 'asc' }} empty={{ title: t('admin.bk_none_upcoming'), body: t('admin.bk_none_upcoming_body') }} /></Card>
    <Card className="stack-sm"><div className="row wrap"><h2>{t('admin.bk_past')}</h2><Badge size="sm">{past.length}</Badge></div>
      <DataTable caption={t('admin.bk_past')} dense rows={past} columns={columns} defaultSort={{ key: 'slot', dir: 'desc' }} empty={{ title: t('admin.bk_none_past'), body: t('admin.bk_none_past_body') }} /></Card>
    <p className="xs muted">{t('admin.bookings_note')} <Link to="/book/pro_maya">B-01</Link></p>
  </div>);
}
