/**
 * L-01..L-04. One component, four archetypes: the route decides the archetype, the PageModel decides the sections.
 *
 * The page owns its chrome (no app shell): a slim bar with the prospect's business name as the wordmark, EN / ES and
 * the primary CTA. The whole tree is themed by `prospectStyle()` on the root, so every section reads --lp-* and no
 * token is forked per prospect (P-02). Conversion mechanics live here, not in the sections: sticky CTA on a phone,
 * exit intent once per session, "save your workspace" only at the moment of value (R-C01), and the tracking contract
 * (view, section_view, scroll_depth, cta_click, demo_open, booking_started, exit_intent, form_submit).
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Archetype } from '../../data/schema/core';
import { prospectStyle } from '../../design/tokens';
import { useDefaultLang, useI18n } from '../../i18n/I18nProvider';
import { track } from '../../tracking';
import { Button } from '../../components/atom/Button/Button';
import { Input } from '../../components/atom/Input/Input';
import { Field } from '../../components/molecule/Field/Field';
import { LangToggle } from '../../components/molecule/LangToggle/LangToggle';
import { Modal } from '../../components/organism/Modal/Modal';
import { useToast } from '../../components/molecule/Toast/Toast';
import { LandingProvider, type LandingCtx } from './context';
import { usePageModel, daysLeft } from './usePageModel';
import { useExitIntent, useLiveActions, useViewTracking } from './hooks';
import { renderSection } from './sections';
import { ExpiredPage } from './ExpiredPage';
import './landing.css';

const DEMO_FLAG = 'leadmagnet.demoOpened';
const SAVED_FLAG = 'leadmagnet.workspaceSaved';
const read = (k: string) => { try { return sessionStorage.getItem(k); } catch { return null; } };
const write = (k: string, v: string) => { try { sessionStorage.setItem(k, v); } catch { /* private mode */ } };

export function LandingPage({ archetype, pageCode }: { archetype: Archetype; pageCode: string }) {
  const { slug } = useParams();
  const state = usePageModel(slug, archetype);
  const { t } = useI18n();
  if (state.status === 'loading') return <div className="lp-loading" role="status">{t('landing.loading')}</div>;
  if (state.status !== 'live') return <ExpiredPage />;
  return <LiveLanding key={`${slug}-${archetype}`} state={state} pageCode={pageCode} />;
}

type Live = Extract<ReturnType<typeof usePageModel>, { status: 'live' }>;

function LiveLanding({ state, pageCode }: { state: Live; pageCode: string }) {
  const { page, prospect, model, guesses } = state;
  const { bi, t, lang, setLang } = useI18n();
  useDefaultLang(prospect.lang); // the page opens in the prospect's language unless the viewer chose one (P-13)
  const nav = useNavigate();
  const toast = useToast();
  const [showExit, setShowExit] = useState(false);
  const [showSave, setShowSave] = useState(false);
  const [sticky, setSticky] = useState(false);
  const [form, setForm] = useState({ name: `${prospect.first_name} ${prospect.last_name}`.trim(), email: '' });
  const [emailError, setEmailError] = useState('');
  const mainRef = useRef<HTMLElement>(null);
  const pressTimer = useRef(0);
  const trackCtx = useMemo(() => ({ page_id: page.id, prospect_id: prospect.id }), [page.id, prospect.id]);

  useViewTracking(trackCtx, { archetype: model.archetype, lang, slug: page.slug, variant: page.variant }, true);
  useEffect(() => { document.title = `${prospect.business_name} · ${bi(model.cta.primary.label)}`; }, [prospect.business_name, model, bi]);

  // Sticky CTA appears once the first section (the hero) has scrolled away; phone only, by CSS.
  useEffect(() => {
    const first = mainRef.current?.querySelector('.lp-sec');
    if (!first || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([e]) => setSticky(!e.isIntersecting && e.boundingClientRect.bottom <= 0), { threshold: 0 });
    io.observe(first);
    return () => io.disconnect();
  }, []);

  useExitIntent(() => { setShowExit(true); void track('exit_intent', { archetype: model.archetype }, trackCtx); }, true);

  // Moment of value: they opened the demo in this session and came back. Only then do we ask for an email.
  useEffect(() => {
    if (read(DEMO_FLAG) !== '1' || read(SAVED_FLAG) === '1') return;
    const id = window.setTimeout(() => setShowSave(true), 2500);
    return () => window.clearTimeout(id);
  }, []);

  const openDemo = async (from: string) => {
    await track('cta_click', { cta: 'primary', action: 'landing.openDemo', section: from }, trackCtx);
    await track('demo_open', { from, archetype: model.archetype }, trackCtx);
    write(DEMO_FLAG, '1');
    nav(model.cta.primary.to);
    return `opening ${prospect.business_name}'s demo`;
  };
  const bookCall = async (from: string, slot?: string) => {
    await track('cta_click', { cta: 'secondary', action: 'landing.bookCall', section: from, slot: slot ?? null }, trackCtx);
    await track('booking_started', { from, slot: slot ?? null }, trackCtx);
    setShowExit(false);
    nav(slot ? `${model.cta.secondary.to}?slot=${encodeURIComponent(slot)}` : model.cta.secondary.to);
    return slot ? `opening the booking page at ${slot}` : 'opening the booking page';
  };
  const saveWorkspace = (from: string) => { setShowSave(true); void track('cta_click', { cta: 'save', action: 'landing.saveWorkspace', section: from }, trackCtx); return 'asking for a name and email to save the workspace'; };

  const submitSave = async () => {
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) { setEmailError(t('landing.save_email_err')); return; }
    setEmailError('');
    await track('form_submit', { form: 'save_workspace', name: form.name, email: form.email, archetype: model.archetype }, trackCtx);
    write(SAVED_FLAG, '1');
    setShowSave(false);
    toast.push({ tone: 'success', title: t('landing.save_done'), body: t('landing.save_done_body', { days: daysLeft(page.expires_at) ?? 14 }) });
  };

  useLiveActions(pageCode, {
    'landing.openDemo': () => openDemo('action'),
    'landing.bookCall': (p) => bookCall('action', p?.slot ? String(p.slot) : undefined),
    'landing.saveWorkspace': () => saveWorkspace('action'),
    'landing.setLang': (p) => { const l = p?.lang === 'es' ? 'es' : 'en'; setLang(l); return `language set to ${l}`; },
  });

  const ctx: LandingCtx = { pageCode, page, prospect, model, guesses, trackCtx, openDemo: (f) => void openDemo(f), bookCall: (f, s) => void bookCall(f, s), saveWorkspace };
  const days = daysLeft(page.expires_at);

  return (
    <LandingProvider value={ctx}>
      <div className="lp" data-archetype={model.archetype} style={prospectStyle(model.palette, model.font)}>
        <a className="lp-skip" href="#lp-main">{t('landing.skip')}</a>
        <header className="lp-topbar">
          <div className="lp-wrap lp-topbar-in">
            <span className="lp-wordmark"><span className="lp-wordmark-dot" aria-hidden />{prospect.business_name}</span>
            <div className="lp-topbar-right">
              <LangToggle size="sm" />
              <Button size="sm" variant="primary" className="lp-btn-primary lp-topbar-cta" icon="play" onClick={() => void openDemo('topbar')}>{bi(model.cta.primary.label)}</Button>
            </div>
          </div>
        </header>

        <main id="lp-main" className="lp-main" ref={mainRef}>
          {model.sections.map((s) => renderSection(s))}
        </main>

        <footer className="lp-foot">
          <div className="lp-wrap lp-foot-in">
            <span>{t('landing.foot_built', { business: prospect.business_name })}</span>
            <span className="lp-foot-meta">
              {days != null ? t('landing.foot_expiry', { days }) : t('landing.foot_no_expiry')}
              {' · '}
              <button type="button" className="lp-linkbtn" onClick={() => saveWorkspace('footer')}>{t('landing.save_cta')}</button>
            </span>
          </div>
        </footer>

        <div className={`lp-sticky ${sticky ? 'is-on' : ''}`} aria-hidden={!sticky}>
          <Button
            block size="lg" variant="primary" className="lp-btn-primary" icon="play"
            onClick={() => void openDemo('sticky')}
            onPointerDown={() => { pressTimer.current = window.setTimeout(() => saveWorkspace('sticky-longpress'), 600); }}
            onPointerUp={() => window.clearTimeout(pressTimer.current)}
            onPointerLeave={() => window.clearTimeout(pressTimer.current)}
            tabIndex={sticky ? 0 : -1}
          >{bi(model.cta.primary.label)}</Button>
          <Button size="lg" variant="outline" className="lp-btn-secondary" icon="calendar" onClick={() => void bookCall('sticky')} tabIndex={sticky ? 0 : -1} aria-label={bi(model.cta.secondary.label)} />
        </div>

        <Modal open={showExit} onClose={() => setShowExit(false)} title={t('landing.exit_title', { first: prospect.first_name })} size="sm"
          footer={<><Button variant="ghost" onClick={() => setShowExit(false)}>{t('landing.exit_stay')}</Button><Button variant="primary" className="lp-btn-primary" icon="calendar" onClick={() => void bookCall('exit_intent')}>{bi(model.cta.secondary.label)}</Button></>}>
          <p>{t('landing.exit_body', { business: prospect.business_name })}</p>
        </Modal>

        <Modal open={showSave} onClose={() => setShowSave(false)} title={t('landing.save_title')} size="sm"
          footer={<><Button variant="ghost" onClick={() => setShowSave(false)}>{t('landing.save_later')}</Button><Button variant="primary" className="lp-btn-primary" icon="check" onClick={() => void submitSave()}>{t('landing.save_submit')}</Button></>}>
          <p className="lp-sub">{t('landing.save_body', { days: days ?? 14 })}</p>
          <Field label={t('landing.save_name')}><Input value={form.name} autoComplete="name" onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label={t('landing.save_email')} error={emailError || undefined}>
            <Input type="email" value={form.email} autoComplete="email" inputMode="email" onChange={(e) => setForm({ ...form, email: e.target.value })} onKeyDown={(e) => { if (e.key === 'Enter') void submitSave(); }} />
          </Field>
        </Modal>
      </div>
    </LandingProvider>
  );
}
