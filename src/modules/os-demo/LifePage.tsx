/** C-06 life view: the people in their life as views of their own, shared calendar, shared lists and family chat. */
import { useMemo } from 'react';
import { useI18n } from '../../i18n/I18nProvider';
import { useActions } from '../../actions';
import { Card } from '../../components/molecule/Card/Card';
import { Badge } from '../../components/atom/Badge/Badge';
import { Button } from '../../components/atom/Button/Button';
import { Avatar } from '../../components/atom/Avatar/Avatar';
import { Placeholder } from '../../components/atom/Placeholder/Placeholder';
import { EmptyState } from '../../components/molecule/EmptyState/EmptyState';
import { DemoShell, type Demo } from './DemoShell';
import { SectionHead, ThreadMessages, WeekStrip } from './widgets';
import { familyChat, sharedLists, weekFor } from './sample';
import { personFor, titleCase, viewKey } from './people';

function Life({ d }: { d: Demo }) {
  const { t, bi } = useI18n();
  const week = useMemo(() => weekFor(d.prospect, d.ind, 'life', ['7:30', '9:00', '12:00', '17:00', '19:30']), [d.prospect, d.ind]);
  const lists = useMemo(() => sharedLists(d.prospect), [d.prospect]);
  const chat = useMemo(() => familyChat(d.prospect), [d.prospect]);
  useActions('C-06', { 'demo.openLifeRole': (p) => { d.goRole(String(p?.role ?? '')); return String(p?.role ?? ''); } });
  if (!d.life.length) return <EmptyState icon="heart" title={t('demo.no_life')} body={t('demo.no_life_body')} />;
  return (
    <div className="demo-page">
      <SectionHead title={t('demo.life')} sub={t('demo.life_sub', { first: d.prospect.first_name })} />
      <section className="demo-peoplerow" aria-label={t('demo.life_people')}>
        {d.life.map((v) => {
          const p = personFor(d.prospect, v.role);
          return (
            <Card key={viewKey(v)} className="demo-personcard" padding="md" interactive>
              <Avatar name={p.name} color={p.color} size="lg" />
              <div className="demo-personcard-text"><div className="demo-person-name">{p.name}</div><div className="xs muted">{titleCase(v.role)}</div></div>
              <Badge size="sm" tone="neutral">{v.widgets.length} {t('demo.widgets_n')}</Badge>
              <Button size="sm" variant="ghost" iconRight="arrow-right" onClick={() => d.goView(v)}>{t('demo.open_view')}</Button>
            </Card>
          );
        })}
      </section>

      <section className="demo-block">
        <SectionHead title={t('demo.shared_cal')} sub={t('demo.shared_cal_sub')} />
        <Card padding="md"><WeekStrip events={week} label={t('demo.shared_cal')} /></Card>
      </section>

      <div className="demo-lifegrid">
        <section className="demo-block">
          <SectionHead title={t('demo.lists')} sub={t('demo.lists_sub')} />
          <div className="demo-lists">
            {lists.map((l) => (
              <Card key={l.id} padding="md" className="demo-list">
                <h3 className="demo-col-title">{bi(l.title)}</h3>
                <ul className="demo-items">{l.items.map((it) => <li key={it.en}><span className="grow">{bi(it)}</span><Badge size="sm" tone="neutral">{t('demo.shared')}</Badge></li>)}</ul>
                <Placeholder will="add an item and sync it to everyone on the list in realtime" by="T48 realtime" button={{ label: t('demo.add_item'), variant: 'ghost', size: 'sm', icon: 'plus' }} />
              </Card>
            ))}
          </div>
        </section>
        <section className="demo-block">
          <SectionHead title={t('demo.family_chat')} sub={t('demo.family_chat_sub')} />
          <Card padding="md">
            <ThreadMessages messages={chat} />
            <div className="demo-composer">
              <Placeholder will="send a family message through the comms provider" by="comms provider (no task yet)" button={{ label: t('demo.send'), variant: 'primary', icon: 'message' }} />
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}
export const LifePage = () => <DemoShell code="C-06" section="life">{(d) => <Life d={d} />}</DemoShell>;
