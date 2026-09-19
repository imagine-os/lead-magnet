/**
 * The repeated primary CTA with the honest urgency line (playbook 8, R-C04): the real `expires_at` from the page row,
 * counted in days and named as a date, never a fake countdown. One primary ("Open your demo"), one secondary (the
 * calendar, inline below). The urgency copy itself lives in <ExpiryLine tone="band" /> so the band, the hero, the
 * letter, the booking grid and the sticky bar can never disagree about when the workspace goes down.
 */
import { Button } from '../../../components/atom/Button/Button';
import { useI18n } from '../../../i18n/I18nProvider';
import type { Section } from '../../../engine/types';
import { useLanding } from '../context';
import { SectionShell } from './SectionShell';
import { ExpiryLine } from './ExpiryLine';

type Band = Extract<Section, { kind: 'cta_band' }>;

export function CtaBand({ section }: { section: Band }) {
  const { bi } = useI18n();
  const { model, openDemo, bookCall } = useLanding();
  return (
    <SectionShell id={section.id} kind="cta_band" label={bi(section.headline)}>
      <div className="lp-band">
        <div className="lp-band-copy">
          <h2 className="lp-h2">{bi(section.headline)}</h2>
          <p className="lp-sub">{bi(section.sub)}</p>
        </div>
        <div className="lp-cta-row">
          <Button size="lg" variant="primary" icon="play" className="lp-btn-primary" onClick={() => openDemo(section.id)}>{bi(model.cta.primary.label)}</Button>
          <Button size="lg" variant="outline" icon="calendar" className="lp-btn-secondary" onClick={() => bookCall(section.id)}>{bi(model.cta.secondary.label)}</Button>
        </div>
        <ExpiryLine tone="band" fallback={bi(section.urgency)} />
      </div>
    </SectionShell>
  );
}
