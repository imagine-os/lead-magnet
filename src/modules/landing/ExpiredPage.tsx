/**
 * L-05. An expired or unknown workspace link never 404s (R-C05): it says plainly what happened, offers a fresh
 * workspace (a real `feedback` row of kind `request`, which the studio triages) and, when we still know whose page it
 * was, the calendar. Same chrome and, where we can, the same palette as the page they were promised.
 */
import { useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { Button } from '../../components/atom/Button/Button';
import { Input } from '../../components/atom/Input/Input';
import { Textarea } from '../../components/atom/Textarea/Textarea';
import { Field } from '../../components/molecule/Field/Field';
import { LangToggle } from '../../components/molecule/LangToggle/LangToggle';
import { Card } from '../../components/molecule/Card/Card';
import { Placeholder } from '../../components/atom/Placeholder/Placeholder';
import { useToast } from '../../components/molecule/Toast/Toast';
import { useData, useTable } from '../../data/DataContext';
import type { FeedbackRow, PageRow, ProspectRow } from '../../data/schema/core';
import { prospectStyle } from '../../design/tokens';
import { useI18n } from '../../i18n/I18nProvider';
import { track } from '../../tracking';
import { useLiveActions } from './hooks';
import './landing.css';

export function ExpiredPage() {
  const { slug } = useParams();
  const loc = useLocation();
  const { t } = useI18n();
  const data = useData();
  const toast = useToast();
  const { rows: pages } = useTable<PageRow>('pages');
  const { rows: prospects } = useTable<ProspectRow>('prospects');
  const page = pages.find((p) => p.slug === slug) ?? null;
  const prospect = page ? prospects.find((p) => p.id === page.prospect_id) ?? null : null;
  const [email, setEmail] = useState('');
  const [note, setNote] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const style = useMemo(() => (prospect ? prospectStyle(prospect.style.palette, prospect.style.font) : undefined), [prospect]);

  const request = async () => {
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { setError(t('landing.save_email_err')); return 'invalid email'; }
    setError('');
    await data.insert<FeedbackRow>('feedback', {
      user_id: 'anon', user_name: prospect ? `${prospect.first_name} ${prospect.last_name}` : email, role: 'prospect',
      page_code: 'L-05', route: loc.pathname, kind: 'request',
      text: `Fresh workspace requested for "${slug ?? 'unknown slug'}" by ${email}.${note ? ` Note: ${note}` : ''}`,
      element_path: null, component: null, viewport: String(window.innerWidth), theme: document.documentElement.dataset.theme ?? null,
      status: 'new', triage: null, triage_note: null, decision_ref: null, owner_reply: null,
    });
    await track('form_submit', { form: 'request_workspace', slug: slug ?? null, email }, { page_id: page?.id ?? null, prospect_id: prospect?.id ?? null });
    setSent(true);
    toast.push({ tone: 'success', title: t('landing.expired_sent'), body: t('landing.expired_sent_body') });
    return 'workspace requested';
  };
  useLiveActions('L-05', {
    'landing.requestRefresh': () => request(),
    'landing.bookCall': () => (prospect ? `open /book/${prospect.id}` : 'no prospect on this link yet'),
  });

  return (
    <div className="lp lp-expired" style={style}>
      <header className="lp-topbar">
        <div className="lp-wrap lp-topbar-in">
          <span className="lp-wordmark"><span className="lp-wordmark-dot" aria-hidden />{prospect?.business_name ?? 'Imagine'}</span>
          <div className="lp-topbar-right"><LangToggle size="sm" /></div>
        </div>
      </header>
      <main className="lp-wrap lp-expired-main">
        <p className="lp-eyebrow">{t('landing.expired_eyebrow')}</p>
        <h1 className="lp-h1">{prospect ? t('landing.expired_h1', { business: prospect.business_name }) : t('landing.expired_h1_unknown')}</h1>
        <p className="lp-lede">{t('landing.expired_body')}</p>
        <Card className="lp-expired-card">
          {sent ? (
            <div className="stack">
              <h2 className="lp-h2">{t('landing.expired_sent')}</h2>
              <p className="lp-sub">{t('landing.expired_sent_body')}</p>
            </div>
          ) : (
            <div className="stack">
              <h2 className="lp-h2">{t('landing.expired_form_title')}</h2>
              <Field label={t('landing.save_email')} error={error || undefined}>
                <Input type="email" value={email} inputMode="email" autoComplete="email" onChange={(e) => setEmail(e.target.value)} />
              </Field>
              <Field label={t('landing.expired_note')} hint={t('landing.expired_note_hint')}>
                <Textarea value={note} rows={3} onChange={(e) => setNote(e.target.value)} />
              </Field>
              <div className="lp-cta-row">
                <Button variant="primary" className="lp-btn-primary" icon="refresh" onClick={() => void request()}>{t('landing.expired_request')}</Button>
                {prospect
                  ? <Link to={`/book/${prospect.id}`} className="lp-linkwrap"><Button variant="outline" className="lp-btn-secondary" icon="calendar">{t('landing.expired_book')}</Button></Link>
                  : <Placeholder will="book a call without a workspace link" by="booking module (T14)" button={{ label: t('landing.expired_book'), variant: 'outline', icon: 'calendar' }} />}
              </div>
            </div>
          )}
        </Card>
        <p className="lp-note">{t('landing.expired_foot')} <Link to="/site">{t('landing.expired_site')}</Link></p>
      </main>
    </div>
  );
}
