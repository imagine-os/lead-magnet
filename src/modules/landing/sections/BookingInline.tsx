/**
 * The secondary CTA with the calendar inline, never a link-out (R-C02). This grid is a preview of the same seven days
 * B-01 shows, from the shared engine generator (`src/engine/slots.ts`): three free slots a day in the prospect's
 * timezone. Picking one deep-links B-01 with `?slot=`, so the booking module still owns every write and there is one
 * source of truth for availability. `booking_started` fires as we leave.
 */
import { useMemo } from 'react';
import { Button } from '../../../components/atom/Button/Button';
import { useI18n } from '../../../i18n/I18nProvider';
import type { Section } from '../../../engine/types';
import { dayLabel, previewSlots, slotGrid, timeLabel, tzForProspect } from '../../../engine/slots';
import { useLanding } from '../context';
import { useLiveActions } from '../hooks';
import { SectionShell } from './SectionShell';
import { ExpiryLine } from './ExpiryLine';

type Booking = Extract<Section, { kind: 'booking_inline' }>;

export function BookingInline({ section }: { section: Booking }) {
  const { bi, t, lang } = useI18n();
  const { pageCode, prospect, bookCall } = useLanding();
  const tz = useMemo(() => tzForProspect(prospect), [prospect]);
  const days = useMemo(() => previewSlots(slotGrid(prospect.id, tz)), [prospect.id, tz]);
  const firstIso = days.find((d) => d.slots.length)?.slots[0]?.iso;
  const pick = (iso: string) => { bookCall(section.id, iso); return `opening the booking page for ${iso}`; };
  useLiveActions(pageCode, { 'landing.pickSlot': (p) => { const iso = String(p?.slot ?? firstIso ?? ''); return iso ? pick(iso) : 'no free slot this week'; } });

  return (
    <SectionShell id={section.id} kind="booking_inline" label={bi(section.headline)}>
      <div className="lp-head">
        <h2 className="lp-h2">{bi(section.headline)}</h2>
        <p className="lp-sub">{bi(section.sub)} · {t('landing.duration', { min: section.durationMin })} · {t('landing.book_tz', { tz: tz.abbr })}</p>
      </div>
      <div className="lp-book">
        {days.map(({ day, slots }) => (
          <div key={day.key} className="lp-book-day">
            <div className="lp-book-dayhead">
              <span className="lp-book-dow">{dayLabel(day, tz, lang)}</span>
              <span className="lp-book-date">{day.closed ? t('landing.closed_day') : t('landing.slots_free', { n: day.slots.filter((s) => s.available).length })}</span>
            </div>
            <div className="lp-book-slots">
              {slots.map((s) => (
                <Button key={s.iso} size="sm" variant="outline" className="lp-book-slot" onClick={() => pick(s.iso)}>
                  {timeLabel(s, tz, lang)}
                </Button>
              ))}
              {!slots.length && <span className="lp-book-date">{day.closed ? '—' : t('landing.no_slots')}</span>}
            </div>
          </div>
        ))}
      </div>
      <ExpiryLine />
      <p className="lp-note">{t('landing.book_note')}</p>
    </SectionShell>
  );
}
