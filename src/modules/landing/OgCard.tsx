/**
 * L-06 `/og/:slug` - the social card for one prospect's page, rendered as a real page instead of drawn in an image
 * editor, so it is themed by the same `prospectStyle()` and built from the same `PageModel` as the page it previews.
 *
 * `npm run og` screenshots `.og-card` at exactly 1200x630 to `public/og/<slug>.jpg`, and the landing page points
 * `og:image` at that file. Below the card (and outside the capture) the route shows a caption and a link to the page,
 * because a human who opens this URL should not hit a dead end.
 */
import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Button } from '../../components/atom/Button/Button';
import { Badge } from '../../components/atom/Badge/Badge';
import { DeviceMockup } from '../../components/molecule/DeviceMockup/DeviceMockup';
import { useTable } from '../../data/DataContext';
import type { PageRow, ProspectRow } from '../../data/schema/core';
import { prospectStyle } from '../../design/tokens';
import { useI18n } from '../../i18n/I18nProvider';
import { deriveRoleViews, industryFor } from '../../engine';
import type { PageModel, Section } from '../../engine/types';
import { useLiveActions } from './hooks';
import { MiniOs } from './sections/MiniOs';
import './landing.css';

const DEVICES = ['phone', 'laptop', 'tv'] as const;

export function OgCard() {
  const { slug } = useParams();
  const { t, bi } = useI18n();
  const { rows: pages } = useTable<PageRow>('pages', slug ? { where: { slug } } : { where: { slug: '\u0000none' } });
  const { rows: prospects } = useTable<ProspectRow>('prospects');
  const page = pages[0] ?? null;
  const prospect = page ? prospects.find((p) => p.id === page.prospect_id) ?? null : null;
  const model = (page?.model ?? null) as PageModel | null;
  const views = useMemo(() => (prospect ? deriveRoleViews(prospect) : []), [prospect]);

  useLiveActions('L-06', {
    'landing.openPage': () => (page ? `open /p/${page.slug}` : 'no page for this slug'),
  });

  if (!prospect || !page) {
    return (
      <div className="lp og-route">
        <div className="og-fit"><div className="og-card og-card-blank"><span className="og-mark" aria-hidden>I</span><p className="og-h">{t('landing.og_unknown')}</p></div></div>
        <p className="lp-note og-cap">{t('landing.og_unknown_body', { slug: slug ?? '—' })}</p>
      </div>
    );
  }

  const hero = model?.sections.find((s) => s.kind === 'hero_reveal') as Extract<Section, { kind: 'hero_reveal' }> | undefined;
  const headline = hero ? bi(hero.headline) : t('landing.og_fallback_h', { business: prospect.business_name });
  const ind = industryFor(prospect); // same resolved industry as the page and the demo (T62)

  return (
    <div className="lp og-route" style={prospectStyle(prospect.style.palette, prospect.style.font)}>
      <div className="og-fit">
        <div className="og-card" role="img" aria-label={`${prospect.business_name} — ${headline}`}>
          <div className="og-copy">
            <p className="og-eyebrow"><span className="og-mark" aria-hidden>{prospect.business_name.slice(0, 1)}</span>{prospect.business_name} · {prospect.city}</p>
            <p className="og-h">{headline}</p>
            <p className="og-sub">{bi(ind.label)} · {t('landing.og_sub')}</p>
            <div className="og-swatches" aria-hidden>
              {[prospect.style.palette.primary, prospect.style.palette.accent, prospect.style.palette.surface].map((c) => <span key={c} style={{ background: c }} />)}
            </div>
          </div>
          <div className="og-devices" aria-hidden>
            {DEVICES.map((d, i) => (
              <div key={d} className={`og-device og-device-${d}`}>
                <DeviceMockup kind={d} title={`${prospect.business_name} ${d}`}>
                  <MiniOs prospect={prospect} views={views} device={d} index={i} />
                </DeviceMockup>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="og-cap">
        <Badge tone="neutral" size="sm">1200 × 630</Badge>
        <p className="lp-note">{t('landing.og_cap')}</p>
        <Link to={`/p/${page.slug}`} className="lp-linkwrap"><Button variant="primary" className="lp-btn-primary" icon="arrow-right">{t('landing.og_open')}</Button></Link>
      </div>
    </div>
  );
}
