/** C-04 unified inbox: calls, email, SMS and WhatsApp in one list, themed sample messages, composer as a Placeholder. */
import { useMemo, useState } from 'react';
import { useI18n } from '../../i18n/I18nProvider';
import { useActions } from '../../actions';
import { track } from '../../tracking';
import { Card } from '../../components/molecule/Card/Card';
import { Tabs } from '../../components/molecule/Tabs/Tabs';
import { Badge } from '../../components/atom/Badge/Badge';
import { Avatar } from '../../components/atom/Avatar/Avatar';
import { Icon, type IconName } from '../../components/atom/Icon/Icon';
import { Textarea } from '../../components/atom/Textarea/Textarea';
import { Placeholder } from '../../components/atom/Placeholder/Placeholder';
import { EmptyState } from '../../components/molecule/EmptyState/EmptyState';
import { DemoShell, type Demo } from './DemoShell';
import { SectionHead, ThreadMessages } from './widgets';
import { threadsFor, type Channel } from './sample';

const CH_ICON: Record<Channel, IconName> = { call: 'phone', email: 'mail', sms: 'message', whatsapp: 'message' };

function Comms({ d }: { d: Demo }) {
  const { t, bi } = useI18n();
  const threads = useMemo(() => threadsFor(d.prospect, d.ind), [d.prospect, d.ind]);
  const [tab, setTab] = useState<'all' | Channel>('all');
  const [openId, setOpenId] = useState(threads[0]?.id ?? '');
  const shown = threads.filter((x) => tab === 'all' || x.channel === tab);
  const open = threads.find((x) => x.id === openId) ?? shown[0] ?? null;
  useActions('C-04', {
    'demo.filterChannel': (p) => { setTab((String(p?.channel ?? 'all') as 'all' | Channel)); return String(p?.channel ?? 'all'); },
    'demo.openThread': (p) => { setOpenId(String(p?.thread ?? '')); return String(p?.thread ?? ''); },
    'demo.reply': (p) => `reply to ${String(p?.thread ?? '')} is not wired yet (T42 comms provider)`,
  });
  const tabs = ([['all', 'demo.ch_all'], ['call', 'demo.ch_calls'], ['email', 'demo.ch_email'], ['sms', 'demo.ch_sms'], ['whatsapp', 'demo.ch_whatsapp']] as const)
    .map(([id, k]) => ({ id: id as 'all' | Channel, label: t(k), count: id === 'all' ? threads.length : threads.filter((x) => x.channel === id).length }));
  return (
    <div className="demo-page">
      <SectionHead title={t('demo.comms')} sub={t('demo.comms_sub', { business: d.prospect.business_name })} />
      <Tabs tabs={tabs} value={tab} onChange={(v) => { setTab(v); void track('section_view', { section: 'C-04', channel: v }, d.ctx); }} label={t('demo.ch_label')} />
      <div className="demo-inbox" id={`panel-${tab}`} role="tabpanel" aria-labelledby={`tab-${tab}`}>
        <Card className="demo-threads" padding="none">
          <ul className="demo-threadlist" aria-label={t('demo.threads')}>
            {shown.map((th) => (
              <li key={th.id}>
                <button type="button" className={`demo-thread ${th.id === open?.id ? 'is-active' : ''}`} aria-current={th.id === open?.id ? 'true' : undefined} onClick={() => setOpenId(th.id)}>
                  <Avatar name={th.who} size="sm" />
                  <span className="grow demo-thread-main">
                    <span className="demo-thread-top"><strong>{th.who}</strong><span className="xs muted">{th.at}</span></span>
                    <span className="demo-thread-sub xs">{bi(th.subject)}</span>
                    <span className="demo-thread-prev">{bi(th.preview)}</span>
                  </span>
                  <span className="demo-thread-ch"><Icon name={CH_ICON[th.channel]} size={16} />{th.unread && <Badge size="sm" tone="primary">{t('demo.new')}</Badge>}</span>
                </button>
              </li>
            ))}
          </ul>
        </Card>
        <Card className="demo-pane" padding="md">
          {open ? (<>
            <header className="demo-pane-head">
              <Avatar name={open.who} />
              <div className="grow"><div className="demo-pane-who">{open.who}</div><div className="xs muted">{bi(open.subject)} · {t(`demo.ch_${open.channel}`)}</div></div>
              <Badge size="sm" tone="neutral">{t('demo.one_inbox')}</Badge>
            </header>
            <ThreadMessages messages={open.messages} />
            <div className="demo-composer">
              <label className="sr-only" htmlFor="demo-composer">{t('demo.composer')}</label>
              <Textarea id="demo-composer" rows={2} placeholder={t('demo.composer_ph')} readOnly value="" />
              <Placeholder will="send this reply through the comms provider (calls, email, SMS, WhatsApp on one number)" by="T42 comms provider" button={{ label: t('demo.send'), variant: 'primary', icon: 'arrow-right' }} />
            </div>
          </>) : <EmptyState icon="message" title={t('demo.no_threads')} />}
        </Card>
      </div>
    </div>
  );
}
export const CommsPage = () => <DemoShell code="C-04" section="comms">{(d) => <Comms d={d} />}</DemoShell>;
