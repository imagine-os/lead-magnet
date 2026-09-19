import { useMemo, useRef } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useRow, useTable } from '../../data/DataContext';
import type { BookingRow, PageRow, ProspectRow } from '../../data/schema/core';
import { prospectStyle } from '../../design/tokens';
import { useI18n } from '../../i18n/I18nProvider';
import { useActions } from '../../actions';
import { Card } from '../../components/molecule/Card/Card';
import { Button } from '../../components/atom/Button/Button';
import { Badge } from '../../components/atom/Badge/Badge';
import { Icon } from '../../components/atom/Icon/Icon';
import { Placeholder } from '../../components/atom/Placeholder/Placeholder';
import { EmptyState } from '../../components/molecule/EmptyState/EmptyState';
import { LangToggle } from '../../components/molecule/LangToggle/LangToggle';
import { slotInWords, tzForProspect } from '../../engine/slots';
import { useGamepadNav, useSpatialNav } from '../../a11y';
import './booking.css';

/** B-02 - confirmation. Reads the row back by id (R-B03) and sends them into the demo; .ics waits for T42. */
export function ConfirmedPage() {
  const root = useRef<HTMLDivElement>(null); const spatial = useSpatialNav(root); useGamepadNav(spatial); // P-04: arrows / d-pad move focus (pass-3 integration)
  const { prospectId } = useParams();
  const [params] = useSearchParams();
  const nav = useNavigate();
  const { t, lang, setLang } = useI18n();
  const prospect = useRow<ProspectRow>('prospects', prospectId);
  const { rows: bookings } = useTable<BookingRow>('bookings', { where: { prospect_id: prospectId ?? '' }, orderBy: { column: 'created_at', dir: 'desc' } });
  const { rows: pages } = useTable<PageRow>('pages', { where: { prospect_id: prospectId ?? '' } });
  const page = pages.find((p) => p.status === 'live') ?? pages[0] ?? null;
  const wanted = params.get('booking');
  const booking = (wanted ? bookings.find((b) => b.id === wanted) : undefined) ?? bookings[0] ?? null;
  const tz = useMemo(() => tzForProspect({ city: prospect?.city ?? '', country: prospect?.country ?? 'US' }), [prospect?.city, prospect?.country]);

  useActions('B-02', {
    'booking.openDemo': () => { if (prospectId) nav(`/demo/${prospectId}`); },
    'booking.openPage': () => { if (page) nav(`/p/${page.slug}`); },
    'booking.setLang': (p) => setLang((p?.lang as 'en' | 'es') ?? 'en'),
  });

  if (!prospect || !booking) return (<div className="bk"><main className="container page"><EmptyState icon="calendar" title={t('booking.none_title')} body={t('booking.none_body')} action={prospectId ? <Link to={`/book/${prospectId}`}><Button variant="primary">{t('booking.pick_time')}</Button></Link> : undefined} /></main></div>);

  const words = slotInWords(booking.slot, tz, lang);
  return (<div className="bk" ref={root} style={prospectStyle(prospect.style.palette, prospect.style.font)} lang={lang}>
    <header className="bk-bar">
      <Link to={page ? `/p/${page.slug}` : `/book/${prospect.id}`} className="bk-mark">{prospect.business_name}</Link>
      <div className="row"><span className="xs bk-tz">{tz.abbr}</span><LangToggle size="sm" /></div>
    </header>
    <main className="bk-main bk-main-narrow">
      <Card className="bk-confirm" padding="lg">
        <span className="bk-tick" aria-hidden><Icon name="check" size={28} /></span>
        <Badge tone="accent" size="sm">{t('booking.status_' + booking.status)}</Badge>
        <h1 className="bk-h1">{t('booking.confirmed_h1', { first: prospect.first_name })}</h1>
        <p className="bk-slotwords">{words}</p>
        <p className="bk-sub">{t('booking.confirmed_sub', { minutes: String(booking.duration_min), business: prospect.business_name })}</p>
        <ol className="bk-next">
          <li>{t('booking.next_1')}</li>
          <li>{t('booking.next_2', { business: prospect.business_name })}</li>
          <li>{t('booking.next_3')}</li>
        </ol>
        <div className="bk-actions">
          <Placeholder will={t('booking.ics_will')} by="T42"><Button variant="secondary" size="lg" icon="calendar">{t('booking.add_calendar')}</Button></Placeholder>
          <Link to={`/demo/${prospect.id}`}><Button variant="primary" size="lg" icon="play">{t('booking.open_demo')}</Button></Link>
          {page && <Link to={`/p/${page.slug}`}><Button variant="ghost" size="lg" icon="arrow-left">{t('booking.back_page')}</Button></Link>}
        </div>
        <p className="xs bk-muted">{t('booking.ref', { id: booking.id })}</p>
      </Card>
    </main>
  </div>);
}
