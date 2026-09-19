import { useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useData, useRow, useTable } from '../../data/DataContext';
import { CHANNELS, type PageRow, type ProspectRow, type StackGuessRow, type TouchRow } from '../../data/schema/core';
import { savings } from '../../engine';
import { useI18n } from '../../i18n/I18nProvider';
import { useSession } from '../../auth/SessionProvider';
import { useActions } from '../../actions';
import { DataTable, type Column } from '../../components/organism/DataTable/DataTable';
import { Card } from '../../components/molecule/Card/Card';
import { Field } from '../../components/molecule/Field/Field';
import { EmptyState } from '../../components/molecule/EmptyState/EmptyState';
import { SegmentedControl } from '../../components/molecule/SegmentedControl/SegmentedControl';
import { Badge } from '../../components/atom/Badge/Badge';
import { Button } from '../../components/atom/Button/Button';
import { Input } from '../../components/atom/Input/Input';
import { Placeholder } from '../../components/atom/Placeholder/Placeholder';
import { Select } from '../../components/atom/Select/Select';
import { Textarea } from '../../components/atom/Textarea/Textarea';
import { useToast } from '../../components/molecule/Toast/Toast';
import { ProspectNav } from './ProspectNav';
import { TEMPLATES, fillTokens, templatesFor, type Channel } from './templates';
import { industryLabel, livePageOf, publicUrl, shortTime, slugFor, usd } from './lib';
import './studio.css';

export function OutreachPage() {
  const { id } = useParams();
  const { t, bi, lang } = useI18n();
  const { can } = useSession();
  const data = useData();
  const toast = useToast();
  const nav = useNavigate();
  const p = useRow<ProspectRow>('prospects', id);
  const { rows: guesses } = useTable<StackGuessRow>('stack_guesses', { where: { prospect_id: id ?? '' } });
  const { rows: pages } = useTable<PageRow>('pages', { where: { prospect_id: id ?? '' } });
  const { rows: touches } = useTable<TouchRow>('touches', { where: { prospect_id: id ?? '' }, orderBy: { column: 'created_at', dir: 'desc' } });
  const page = p ? livePageOf(pages, p.id) : null;
  const writable = can('prospects.write');

  const [channel, setChannel] = useState<Channel | null>(null);
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [msgLang, setMsgLang] = useState<'en' | 'es' | null>(null);
  const [subject, setSubject] = useState<string | null>(null);
  const [body, setBody] = useState<string | null>(null);

  const theChannel: Channel = channel ?? (p?.source === 'cold_email' ? 'cold_email' : p?.source === 'linkedin' ? 'linkedin_dm' : p?.source === 'referral' ? 'warm_intro' : 'cold_email');
  const list = templatesFor(theChannel);
  const template = list.find((x) => x.id === templateId) ?? list[0];
  const theLang: 'en' | 'es' = msgLang ?? p?.lang ?? 'en';

  const tokens = useMemo(() => {
    if (!p) return {} as Record<string, string>;
    const sav = savings(p, guesses);
    const slug = slugFor(p, page);
    return {
      first_name: p.first_name, last_name: p.last_name, business: p.business_name, city: p.city,
      industry: industryLabel(p.industry, bi).toLowerCase(), savings_annual: usd(sav.net_annual), savings_monthly: usd(sav.net_monthly),
      tools_cut: String(sav.tools_cut), page_url: publicUrl(page?.archetype ?? 'reveal', slug),
    };
  }, [p, guesses, page, bi]);

  const filledSubject = template ? fillTokens(theLang === 'es' ? template.subject.es : template.subject.en, tokens) : '';
  const filledBody = template ? fillTokens(theLang === 'es' ? template.body.es : template.body.en, tokens) : '';
  const theSubject = subject ?? filledSubject;
  const theBody = body ?? filledBody;
  const reset = () => { setSubject(null); setBody(null); };

  const draft = async () => {
    if (!p || !writable) return;
    await data.insert<TouchRow>('touches', { prospect_id: p.id, channel: theChannel, subject: theSubject, body_preview: theBody.slice(0, 280), sent_at: null, opened_at: null, clicked_at: null, page_id: page?.id ?? null, status: 'draft' });
    toast.push({ tone: 'success', title: t('studio.drafted'), body: t(`studio.channel_${theChannel}`) });
  };
  const markSent = async (touchId: string) => { await data.update<TouchRow>('touches', touchId, { status: 'sent', sent_at: new Date().toISOString() }); toast.push({ tone: 'success', title: t('studio.marked_sent'), body: t('studio.marked_sent_body') }); };

  const latest = useRef({ draft, markSent, touches, list });
  latest.current = { draft, markSent, touches, list };
  useActions('S-05', {
    'studio.pickChannel': (a) => { const v = String(a?.channel ?? ''); if ((CHANNELS as readonly string[]).includes(v)) { setChannel(v as Channel); setTemplateId(null); reset(); } },
    'studio.pickTemplate': (a) => { const v = String(a?.template ?? ''); if (TEMPLATES.some((x) => x.id === v)) { setTemplateId(v); reset(); } },
    'studio.draftTouch': () => latest.current.draft(),
    'studio.sendTouch': () => { toast.push({ tone: 'info', title: t('studio.not_wired'), body: t('studio.send_will') }); },
    'studio.markTouchSent': (a) => { const row = latest.current.touches.find((x) => x.id === a?.touch) ?? latest.current.touches.find((x) => x.status === 'draft'); return row ? latest.current.markSent(row.id) : undefined; },
  });

  if (!p) return <div className="container page"><EmptyState icon="user" title={t('studio.not_found')} body={t('studio.not_found_body')} action={<Button variant="outline" icon="arrow-left" onClick={() => nav('/studio')}>{t('studio.all_prospects')}</Button>} /></div>;

  const columns: Column<TouchRow>[] = [
    { key: 'channel', header: t('studio.col_channel'), render: (x) => <Badge size="sm" tone="primary">{t(`studio.channel_${x.channel}`)}</Badge> },
    { key: 'subject', header: t('studio.col_subject'), render: (x) => <span><span className="st-strong">{x.subject}</span><span className="xs muted st-block">{x.body_preview.slice(0, 90)}…</span></span> },
    { key: 'status', header: t('studio.col_status'), render: (x) => <Badge size="sm" tone={x.status === 'replied' ? 'success' : x.status === 'bounced' ? 'danger' : x.status === 'draft' ? 'neutral' : 'info'}>{t(`studio.touch_${x.status}`)}</Badge> },
    { key: 'sent_at', header: t('studio.col_sent'), render: (x) => <span className="xs muted">{x.sent_at ? shortTime(x.sent_at, lang) : '-'}</span> },
    { key: 'opened_at', header: t('studio.col_opened'), render: (x) => <span className="xs muted">{x.opened_at ? shortTime(x.opened_at, lang) : '-'}</span>, hideOnCard: true },
    { key: 'act', header: t('studio.col_act'), render: (x) => (x.sent_at ? <span className="xs muted">-</span> : <Button size="sm" variant="outline" icon="check" disabled={!writable} onClick={() => void markSent(x.id)}>{t('studio.mark_sent')}</Button>) },
  ];

  return (
    <div className="container container-wide page stack st-page">
      <ProspectNav p={p} />

      <Card className="stack-sm">
        <div className="row wrap"><h1 className="grow">{t('studio.s05_title')}</h1>{!page && <Badge tone="warn">{t('studio.no_page_yet')}</Badge>}</div>
        <p className="muted small">{t('studio.s05_sub')}</p>
        <div className="row wrap st-filters">
          <label className="st-inline-field"><span className="xs muted">{t('studio.channel')}</span>
            <Select aria-label={t('studio.channel')} value={theChannel} onChange={(e) => { setChannel(e.target.value as Channel); setTemplateId(null); reset(); }} options={CHANNELS.map((c) => ({ value: c, label: t(`studio.channel_${c}`) }))} />
          </label>
          <SegmentedControl label={t('studio.message_lang')} value={theLang} onChange={(v) => { setMsgLang(v); reset(); }} options={[{ value: 'en' as const, label: 'EN' }, { value: 'es' as const, label: 'ES' }]} />
          <span className="xs muted">{t('studio.tokens_hint')}</span>
        </div>
      </Card>

      <div className="st-cols">
        <div className="stack">
          <Card className="stack-sm">
            <h2>{t('studio.templates')}</h2>
            <div className="grid grid-2">
              {list.map((x) => (
                <Card key={x.id} tone={x.id === template?.id ? 'tint' : 'surface'} className="stack-sm">
                  <div className="row wrap"><span className="st-strong grow">{bi(x.name)}</span>{x.id === template?.id && <Badge size="sm" tone="success">{t('studio.in_use')}</Badge>}</div>
                  <p className="xs muted st-clamp">{fillTokens(theLang === 'es' ? x.subject.es : x.subject.en, tokens)}</p>
                  <Button size="sm" variant={x.id === template?.id ? 'primary' : 'outline'} icon="edit" onClick={() => { setTemplateId(x.id); reset(); }}>{t('studio.use_template')}</Button>
                </Card>
              ))}
            </div>
          </Card>

          <Card className="stack-sm">
            <h2>{t('studio.message')}</h2>
            <Field label={t('studio.col_subject')} hint={t('studio.subject_hint')}><Input value={theSubject} disabled={!writable} onChange={(e) => setSubject(e.target.value)} /></Field>
            <Field label={t('studio.body')} hint={t('studio.body_hint')}><Textarea value={theBody} rows={12} disabled={!writable} onChange={(e) => setBody(e.target.value)} /></Field>
            <div className="row wrap">
              <Button icon="edit" disabled={!writable} onClick={() => void draft()}>{t('studio.draft')}</Button>
              <Placeholder will={t('studio.send_will')} by="T4x"><Button variant="accent" icon="mail">{t('studio.send')}</Button></Placeholder>
              <Button variant="ghost" icon="refresh" onClick={reset}>{t('studio.reset_template')}</Button>
            </div>
          </Card>
        </div>

        <div className="stack">
          <Card className="stack-sm">
            <h2>{t('studio.preview')}</h2>
            <div className="st-msg">
              <div className="st-msg-head"><Badge size="sm" tone="primary">{t(`studio.channel_${theChannel}`)}</Badge><span lang={theLang} className="xs muted">{theLang.toUpperCase()}</span></div>
              <div className="st-msg-subject" lang={theLang}>{theSubject}</div>
              <pre className="st-msg-body" lang={theLang}>{theBody}</pre>
            </div>
            <p className="xs muted">{t('studio.page_url')}: <code>{tokens.page_url}</code></p>
          </Card>
        </div>
      </div>

      <Card className="stack-sm">
        <h2>{t('studio.history')}</h2>
        <DataTable caption={t('studio.history')} rows={touches} columns={columns} empty={{ title: t('studio.no_touches'), body: t('studio.no_touches_body') }} />
      </Card>
    </div>
  );
}
