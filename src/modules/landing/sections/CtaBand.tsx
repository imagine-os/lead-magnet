/**
 * The repeated primary CTA with the honest urgency line (playbook 8, R-C04): the real `expires_at` from the page row,
 * counted in days, never a fake countdown. One primary ("Open your demo"), one secondary (the calendar, inline below).
 */
import { Button } from '../../../components/atom/Button/Button';
import { Badge } from '../../../components/atom/Badge/Badge';
import { useI18n } from '../../../i18n/I18nProvider';
import type { Section } from '../../../engine/types';
import { useLanding } from '../context';
import { daysLeft } from '../usePageModel';
import { SectionShell } from './SectionShell';

type Band = Extract<Section, { kind: 'cta_band' }>;

export function CtaBand({ section }: { section: Band }) {
  const { bi, t, lang } = useI18n();
  const { model, page, openDemo, bookCall } = useLanding();
  const days = daysLeft(page.expires_at);
  const until = page.expires_at ? new Date(page.expires_at).toLocaleDateString(lang === 'es' ? 'es-MX' : 'en-US', { month: 'long', day: 'numeric' }) : null;
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
        <p className="lp-urgency">
          <Badge tone={days != null && days <= 3 ? 'warn' : 'neutral'} size="sm">{t('landing.urgency_badge')}</Badge>
          {days != null && until ? t('landing.urgency_real', { days, date: until }) : bi(section.urgency)}
        </p>
      </div>
    </SectionShell>
  );
}
