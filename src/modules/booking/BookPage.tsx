import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useData, useRow, useTable } from '../../data/DataContext';
import type { BookingRow, PageRow, ProspectRow } from '../../data/schema/core';
import { prospectStyle } from '../../design/tokens';
import { useI18n } from '../../i18n/I18nProvider';
import { useSession } from '../../auth/SessionProvider';
import { useActions } from '../../actions';
import { track, trackOnce } from '../../tracking';
import { Card } from '../../components/molecule/Card/Card';
import { Field } from '../../components/molecule/Field/Field';
import { Input } from '../../components/atom/Input/Input';
import { Textarea } from '../../components/atom/Textarea/Textarea';
import { Button } from '../../components/atom/Button/Button';
import { Badge } from '../../components/atom/Badge/Badge';
import { Chip } from '../../components/atom/Chip/Chip';
import { Icon } from '../../components/atom/Icon/Icon';
import { EmptyState } from '../../components/molecule/EmptyState/EmptyState';
import { LangToggle } from '../../components/molecule/LangToggle/LangToggle';
import { useToast } from '../../components/molecule/Toast/Toast';
import { DURATION_MIN, dayLabel, findSlot, normalizeSlotIso, slotGrid, slotInWords, timeLabel, tzForProspect, withRequested } from '../../engine/slots';
import { useNarrow } from './useNarrow';
import './booking.css';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** B-01 - the prospect picks a 15-minute walkthrough, then gives their details. Public page, own chrome, their palette. */
export function BookPage() {
  const { prospectId } = useParams();
  const [params] = useSearchParams();
  const nav = useNavigate(); const data = useData(); const toast = useToast();
  const { t, lang, setLang } = useI18n(); const { devMode } = useSession();
  const narrow = useNarrow(900);
  const prospect = useRow<ProspectRow>('prospects', prospectId);
  const { rows: pages } = useTable<PageRow>('pages', { where: { prospect_id: prospectId ?? '' } });
  const page = pages.find((p) => p.status === 'live') ?? pages[0] ?? null;

  const tz = useMemo(() => tzForProspect({ city: prospect?.city ?? '', country: prospect?.country ?? 'US' }), [prospect?.city, prospect?.country]);
  // ?slot=<iso> from a landing page CTA: any valid instant is honoured. If the generated grid lacks it, it is appended
  // and marked "requested" (never silently swapped for another time), so the page preselects what the prospect picked.
  const qSlot = params.get('slot');
  const grid = useMemo(() => withRequested(slotGrid(prospectId ?? 'anon', tz), qSlot), [prospectId, tz, qSlot]);
  const openDays = grid.days.filter((d) => !d.closed);
  const [dayKey, setDayKey] = useState(() => openDays[0]?.key ?? grid.days[0].key);
  const [slot, setSlot] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', note: '' });
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const ctx = { page_id: page?.id ?? null, prospect_id: prospectId ?? null };

  useEffect(() => {
    const found = findSlot(grid, normalizeSlotIso(qSlot)); if (!found) return;
    setSlot(found.iso); const day = grid.days.find((d) => d.slots.some((s) => s.iso === found.iso)); if (day) setDayKey(day.key);
  }, [grid, qSlot]);

  const pick = (iso: string) => { setSlot(iso); trackOnce(`booking_started|${prospectId}`, 'booking_started', { slot: iso, duration_min: DURATION_MIN }, ctx); };
  const clear = () => setSlot(null);
  const nameError = touched && !form.name.trim() ? t('booking.err_name') : undefined;
  const emailError = touched && !EMAIL_RE.test(form.email.trim()) ? t('booking.err_email') : undefined;

  async function confirm() {
    if (!prospect || !slot) return;
    setTouched(true);
    if (!form.name.trim() || !EMAIL_RE.test(form.email.trim())) return;
    setBusy(true);
    try {
      const row = await data.insert<BookingRow>('bookings', { prospect_id: prospect.id, page_id: page?.id ?? null, slot, duration_min: DURATION_MIN, status: 'requested', contact_name: form.name.trim(), contact_email: form.email.trim(), contact_phone: form.phone.trim() || null, notes: form.note.trim() });
      await track('booking_confirmed', { slot, duration_min: DURATION_MIN, booking_id: row.id }, ctx);
      nav(`/book/${prospect.id}/confirmed?booking=${row.id}`);
    } catch (e) {
      toast.push({ tone: 'danger', title: t('booking.save_failed'), body: String((e as Error).message ?? e) });
      setBusy(false);
    }
  }

  // The actions bus registers once per page code, so handlers read the latest render through a ref (P-05: idempotent, by id).
  const api = useRef({ grid, slot, pick, clear, confirm });
  api.current = { grid, slot, pick, clear, confirm };
  useActions('B-01', {
    'booking.pickSlot': (p) => { const found = findSlot(api.current.grid, normalizeSlotIso(String(p?.slot ?? ''))); if (!found) return `no free slot at ${String(p?.slot)}`; api.current.pick(found.iso); return found.iso; },
    'booking.clearSlot': () => { api.current.clear(); return 'slot cleared'; },
    'booking.confirm': async () => { if (!api.current.slot) return 'pick a slot first (R-B01)'; await api.current.confirm(); return 'confirmed'; },
    'booking.setLang': (p) => setLang((p?.lang as 'en' | 'es') ?? 'en'),
    'booking.openDemo': () => { if (prospectId) nav(`/demo/${prospectId}`); },
  });

  if (!prospect) return (<div className="bk"><main className="container page"><EmptyState icon="calendar" title={t('booking.unknown_title')} body={t('booking.unknown_body')} action={<Link to="/"><Button variant="outline">{t('booking.to_hub')}</Button></Link>} /></main></div>);

  const days = narrow ? grid.days.filter((d) => d.key === dayKey) : grid.days;
  const ready = !!slot;
  return (<div className="bk" style={prospectStyle(prospect.style.palette, prospect.style.font)} lang={lang}>
    <header className="bk-bar">
      <Link to={page ? `/p/${page.slug}` : `/book/${prospect.id}`} className="bk-mark">{prospect.business_name}</Link>
      <div className="row"><span className="xs bk-tz">{tz.abbr}</span><LangToggle size="sm" /></div>
    </header>
    <main className="bk-main">
      <div className="bk-head">
        <Badge tone="accent" size="sm">{t('booking.minutes', { n: DURATION_MIN })}</Badge>
        <h1 className="bk-h1">{t('booking.h1', { first: prospect.first_name })}</h1>
        <p className="bk-sub">{t('booking.sub', { business: prospect.business_name, city: prospect.city })}</p>
      </div>

      <section className="bk-panel" aria-labelledby="bk-slots-h">
        <div className="bk-panel-head"><h2 id="bk-slots-h">{t('booking.step1')}</h2><span className="xs bk-muted">{t('booking.tz_note', { tz: tz.abbr, city: prospect.city })}</span></div>
        {narrow && <div className="bk-daychips" role="group" aria-label={t('booking.choose_day')}>{grid.days.map((d) => <Chip key={d.key} selected={d.key === dayKey} onClick={() => setDayKey(d.key)}>{dayLabel(d, tz, lang)}{d.closed ? ` · ${t('booking.closed')}` : ''}</Chip>)}</div>}
        <div className="bk-week" style={{ ['--bk-cols' as string]: String(days.length) }}>
          {days.map((d) => (<div key={d.key} className="bk-day">
            <div className="bk-dayhead">{dayLabel(d, tz, lang)}</div>
            {d.closed ? <p className="bk-closed xs">{t('booking.closed')}</p> : (<ul className="bk-times">
              {d.slots.filter((s) => s.available).map((s) => (<li key={s.iso}>
                <button type="button" className={`bk-slot ${slot === s.iso ? 'is-picked' : ''} ${s.requested ? 'is-requested' : ''}`} aria-pressed={slot === s.iso} onClick={() => pick(s.iso)}>{timeLabel(s, tz, lang)}{s.requested && <span className="bk-slot-tag">{t('booking.requested_slot')}</span>}</button>
              </li>))}
            </ul>)}
          </div>))}
        </div>
      </section>

      <section className="bk-panel" aria-labelledby="bk-details-h">
        <div className="bk-panel-head"><h2 id="bk-details-h">{t('booking.step2')}</h2>{ready ? <span className="row xs bk-picked"><Icon name="check" size={16} />{slotInWords(slot!, tz, lang)}<Button variant="link" size="sm" onClick={clear}>{t('booking.change')}</Button></span> : <span className="xs bk-muted">{t('booking.pick_first')}</span>}</div>
        <Card className="bk-form" padding="md">
          <form onSubmit={(e) => { e.preventDefault(); void confirm(); }} className="stack">
            <fieldset className="bk-fieldset" disabled={!ready}>
              <div className="bk-fields">
                <Field label={t('booking.name')} required error={nameError}><Input value={form.name} autoComplete="name" onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
                <Field label={t('booking.email')} required error={emailError} hint={t('booking.email_hint')}><Input type="email" value={form.email} autoComplete="email" onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
                <Field label={t('booking.phone')} hint={t('booking.optional')}><Input type="tel" value={form.phone} autoComplete="tel" onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
              </div>
              <Field label={t('booking.note')} hint={t('booking.note_hint')}><Textarea rows={3} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} /></Field>
            </fieldset>
            <div className="bk-actions">
              <Button type="submit" size="lg" variant="primary" icon="calendar" loading={busy} disabled={!ready || busy}>{t('booking.confirm_cta')}</Button>
              <Link to={`/demo/${prospect.id}`} className="bk-secondary"><Button type="button" variant="ghost" size="lg" icon="play">{t('booking.open_demo')}</Button></Link>
            </div>
            <p className="xs bk-muted">{ready ? t('booking.confirm_hint', { slot: slotInWords(slot!, tz, lang) }) : t('booking.pick_first')}</p>
          </form>
        </Card>
      </section>

      {devMode && <Card className="bk-devnote" tone="tint" padding="sm"><div className="row"><Icon name="info" size={18} /><div><strong className="xs">{t('booking.dev_title')}</strong><p className="xs bk-muted">{t('booking.dev_body')}</p></div></div></Card>}
    </main>
  </div>);
}
