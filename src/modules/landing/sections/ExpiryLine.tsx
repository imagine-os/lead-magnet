/**
 * Honest urgency, next to every CTA (playbook 8, R-C04). One line, from the real `pages.expires_at`: the date it goes
 * down and how many days that is. Never a countdown timer, never a red bar, never a number that resets when you
 * reload - the whole point is that the deadline is a fact about our process, not a pressure device.
 *
 * `tone="band"` is the copy used inside the CTA band (on the primary colour, with the badge); the default is the
 * quiet version that sits under the hero, the letter and the booking grid.
 */
import { Badge } from '../../../components/atom/Badge/Badge';
import { useI18n } from '../../../i18n/I18nProvider';
import { useLanding } from '../context';
import { daysLeft } from '../usePageModel';

/** The expiry date in the viewer's language, e.g. "October 3". Null when the page has no expiry. */
export function useExpiry(): { days: number; date: string } | null {
  const { lang } = useI18n();
  const { page } = useLanding();
  const days = daysLeft(page.expires_at);
  if (days == null || !page.expires_at) return null;
  return { days, date: new Date(page.expires_at).toLocaleDateString(lang === 'es' ? 'es-MX' : 'en-US', { month: 'long', day: 'numeric' }) };
}

export function ExpiryLine({ tone = 'quiet', fallback }: { tone?: 'quiet' | 'band'; /** Composed copy to show when the row has no `expires_at` at all (the band keeps the model's line). */ fallback?: string }) {
  const { t } = useI18n();
  const expiry = useExpiry();
  if (!expiry) return tone === 'band' ? <p className="lp-urgency"><Badge tone="neutral" size="sm">{t('landing.urgency_badge')}</Badge>{fallback ?? t('landing.foot_no_expiry')}</p> : null;
  const text = t('landing.live_until', { date: expiry.date, days: expiry.days });
  if (tone === 'band') {
    return (
      <p className="lp-urgency">
        <Badge tone={expiry.days <= 3 ? 'warn' : 'neutral'} size="sm">{t('landing.urgency_badge')}</Badge>
        {t('landing.urgency_real', { days: expiry.days, date: expiry.date })}
      </p>
    );
  }
  return <p className="lp-expiry" data-days={expiry.days}>{text}</p>;
}
