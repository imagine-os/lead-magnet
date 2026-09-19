import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTable } from '../../data/DataContext';
import type { PageRow } from '../../data/schema/core';
import { useI18n } from '../../i18n/I18nProvider';
import { useSession } from '../../auth/SessionProvider';
import { useActions } from '../../actions';
import { track } from '../../tracking';
import { SiteChrome } from './SiteChrome';
import { Card } from '../../components/molecule/Card/Card';
import { Badge } from '../../components/atom/Badge/Badge';
import { Button } from '../../components/atom/Button/Button';
import { Icon, type IconName } from '../../components/atom/Icon/Icon';

const STEPS: { k: string; icon: IconName }[] = [
  { k: 'intake', icon: 'search' }, { k: 'guess', icon: 'dollar' }, { k: 'compose', icon: 'wand' },
  { k: 'demo', icon: 'play' }, { k: 'book', icon: 'calendar' }, { k: 'adapt', icon: 'refresh' },
];
const FAQ = ['real', 'data', 'wrong', 'switch', 'lang', 'own'];
/** Honest list shown in dev mode only (P-09): what the product still fakes. */
const NOT_WIRED = [
  { k: 'images', by: 'T40' }, { k: 'llm', by: 'T43' }, { k: 'booking', by: 'T42' },
  { k: 'stripe', by: 'T51' }, { k: 'supabase', by: 'T44' }, { k: 'esign', by: 'later pass' },
];

export function HowPage() {
  const { t } = useI18n();
  const { devMode } = useSession();
  const nav = useNavigate();
  const { rows: pages } = useTable<PageRow>('pages');
  const slug = useRef<string>('');
  slug.current = pages[0]?.slug ?? '';
  useActions('W-02', {
    'site.startPurchase': () => { nav('/site/pricing'); return '/site/pricing'; },
    'site.seeSample': () => { if (!slug.current) return 'no sample pages'; nav(`/p/${slug.current}`); return `/p/${slug.current}`; },
  });
  useEffect(() => { void track('view', { code: 'W-02' }, {}); }, []);
  const go = (cta: string, to: string) => () => { void track('cta_click', { cta, code: 'W-02' }, {}); nav(to); };

  return (<SiteChrome active="how">
    <section className="site-section site-section-top container container-wide stack">
      <span className="eyebrow">{t('site.how_eyebrow')}</span>
      <h1 className="site-h1 font-display">{t('site.how_h1')}</h1>
      <p className="site-lede">{t('site.how_lede')}</p>
    </section>

    <section className="site-section container container-wide">
      <h2 className="site-h2 font-display">{t('site.how_steps_h2')}</h2>
      <ol className="site-steps-list">
        {STEPS.map((s, i) => (<li key={s.k}><Card className="site-step-row">
          <span className="site-step-icon"><Icon name={s.icon} /></span>
          <div className="stack-sm">
            <div className="row wrap"><span className="eyebrow">{t('site.step_n', { n: i + 1 })}</span><h3 className="site-h3">{t(`site.how_${s.k}`)}</h3></div>
            <p className="small muted">{t(`site.how_${s.k}_body`)}</p>
          </div>
        </Card></li>))}
      </ol>
    </section>

    <section className="site-section container container-wide stack">
      <h2 className="site-h2 font-display">{t('site.how_diagram_h2')}</h2>
      <p className="small muted">{t('site.how_diagram_sub')}</p>
      <Card padding="lg" className="site-diagram-card">
        <svg className="site-diagram" viewBox="0 0 980 230" role="img" aria-labelledby="dgt dgd" preserveAspectRatio="xMidYMid meet">
          <title id="dgt">{t('site.how_diagram_title')}</title>
          <desc id="dgd">{t('site.how_diagram_desc')}</desc>
          <defs><marker id="site-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" className="site-diagram-arrow" /></marker></defs>
          {STEPS.map((s, i) => { const x = 10 + i * 162; return (<g key={s.k}>
            <rect x={x} y="56" width="140" height="66" rx="12" className={`site-diagram-node ${i === 5 ? 'is-loop' : ''}`} />
            <text x={x + 70} y="82" textAnchor="middle" className="site-diagram-n">{i + 1}</text>
            <text x={x + 70} y="104" textAnchor="middle" className="site-diagram-label">{t(`site.how_${s.k}`)}</text>
            {i < 5 && <line x1={x + 142} y1="89" x2={x + 158} y2="89" className="site-diagram-line" markerEnd="url(#site-arrow)" />}
          </g>); })}
          <path d="M 890 126 C 890 190, 420 200, 360 152" className="site-diagram-line is-loop" markerEnd="url(#site-arrow)" fill="none" />
          <text x="620" y="196" textAnchor="middle" className="site-diagram-caption">{t('site.how_diagram_loop')}</text>
        </svg>
      </Card>
    </section>

    <section className="site-section container container-wide">
      <h2 className="site-h2 font-display">{t('site.faq_h2')}</h2>
      <div className="grid grid-2 site-faq">
        {FAQ.map((k) => (<Card key={k} className="site-faq-item"><h3 className="site-h3">{t(`site.faq_${k}_q`)}</h3><p className="small muted">{t(`site.faq_${k}_a`)}</p></Card>))}
      </div>
    </section>

    {devMode && (<section className="site-section container container-wide">
      <div className="page-head"><h2 className="site-h2 font-display">{t('site.notwired_h2')}</h2><Badge tone="warn">{t('site.devmode_only')}</Badge></div>
      <p className="small muted">{t('site.notwired_sub')}</p>
      <ul className="site-notwired">
        {NOT_WIRED.map((n) => (<li key={n.k}><span className="site-notwired-k">{t(`site.notwired_${n.k}`)}</span><Badge size="sm" status="stub">{n.by}</Badge></li>))}
      </ul>
    </section>)}

    <section className="site-cta">
      <div className="container container-wide site-cta-in">
        <div className="stack-sm"><h2 className="site-h2 font-display">{t('site.cta_h2')}</h2><p className="site-lede-sm">{t('site.cta_sub')}</p></div>
        <div className="row wrap">
          <Button size="lg" variant="accent" iconRight="arrow-right" onClick={go('get_yours_how', '/site/pricing')}>{t('site.get_yours')}</Button>
          {slug.current && <Button size="lg" variant="outline" icon="eye" onClick={go('see_sample_how', `/p/${slug.current}`)}>{t('site.see_sample')}</Button>}
        </div>
      </div>
    </section>
  </SiteChrome>);
}
