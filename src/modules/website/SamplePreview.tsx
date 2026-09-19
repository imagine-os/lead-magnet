import type { ProspectRow } from '../../data/schema/core';
import { deriveRoleViews, industry } from '../../engine';
import { prospectStyle } from '../../design/tokens';
import { useI18n } from '../../i18n/I18nProvider';

const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
const BARS = [38, 52, 44, 61, 57, 72, 66];

/**
 * A designed, themed preview of one prospect's OS for the device frames on W-01.
 * Drawn (not iframed) so it stays legible at every device size and on a 4K screen; the live thing is one click away.
 */
export function SamplePreview({ prospect, variant }: { prospect: ProspectRow; variant: 'laptop' | 'tv' }) {
  const { bi, t } = useI18n();
  const ind = industry(prospect.industry);
  const roles = deriveRoleViews(prospect).slice(0, 3);
  const kpis = ind.kpis.slice(0, variant === 'tv' ? 3 : 2);
  const pains = ind.pains.slice(0, 2);
  return (<div className={`spv-fit spv-fit-${variant}`} aria-hidden="true"><div className="spv" style={prospectStyle(prospect.style.palette, prospect.style.font)}>
    <header className="spv-top">
      <span className="spv-logo" aria-hidden>{initials(prospect.business_name)}</span>
      <span className="spv-name">{prospect.business_name}</span>
      <span className="spv-city">{prospect.city}</span>
    </header>
    <div className="spv-body">
      <nav className="spv-nav" aria-hidden>{roles.map((r) => <span key={r.role} className="spv-navitem">{r.role}</span>)}</nav>
      <div className="spv-main">
        <div className="spv-kpis">{kpis.map((k) => (<div key={k.sample + bi(k.label)} className="spv-kpi"><span className="spv-kpi-v">{k.sample}</span><span className="spv-kpi-l">{bi(k.label)}</span></div>))}</div>
        <div className="spv-cols">
          <div className="spv-card"><span className="spv-card-t">{t('site.preview_attention')}</span>{pains.map((p) => (<span key={bi(p)} className="spv-row"><span className="spv-dot" aria-hidden />{bi(p)}</span>))}</div>
          <div className="spv-card"><span className="spv-card-t">{t('site.preview_month')}</span><span className="spv-bars" aria-hidden>{BARS.map((b, i) => <span key={i} className="spv-bar" style={{ height: `${b}%` }} />)}</span></div>
        </div>
      </div>
    </div>
  </div></div>);
}
