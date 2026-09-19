/** C-05 money: the crossed-out stack from stack_guesses with the savings, cash today, payments and payroll (Placeholder). */
import { useMemo } from 'react';
import { useI18n } from '../../i18n/I18nProvider';
import { useTable } from '../../data/DataContext';
import { useActions } from '../../actions';
import type { StackGuessRow } from '../../data/schema/core';
import { savings } from '../../engine';
import { Card } from '../../components/molecule/Card/Card';
import { Stat } from '../../components/molecule/Stat/Stat';
import { Badge } from '../../components/atom/Badge/Badge';
import { Placeholder } from '../../components/atom/Placeholder/Placeholder';
import { DataTable, type Column } from '../../components/organism/DataTable/DataTable';
import { DemoShell, type Demo } from './DemoShell';
import { MiniChart, SectionHead } from './widgets';
import { paymentsFor, type Payment } from './sample';

const usd = (n: number) => `$${Math.round(n).toLocaleString('en-US')}`;

function Money({ d }: { d: Demo }) {
  const { t, bi } = useI18n();
  const { rows: guesses } = useTable<StackGuessRow>('stack_guesses', { where: { prospect_id: d.prospect.id } });
  const s = useMemo(() => savings(d.prospect, guesses.map((g) => ({ tool: g.tool, category: g.category, monthly_cost: g.monthly_cost, confidence: g.confidence, status: g.status, replaced_by: g.replaced_by }))), [d.prospect, guesses]);
  const pays = useMemo(() => paymentsFor(d.prospect), [d.prospect]);
  const cashToday = pays.filter((p) => p.status === 'paid').reduce((a, b) => a + b.amount, 0);
  useActions('C-05', { 'demo.openPayment': (p) => `payment ${String(p?.payment ?? '')} detail is not wired yet (T51 Stripe)` });
  const cols: Column<Payment>[] = [
    { key: 'who', header: t('demo.customer') },
    { key: 'kind', header: t('demo.kind'), render: (r) => bi(r.kind) },
    { key: 'method', header: t('demo.method'), render: (r) => bi(r.method), hideOnCard: true },
    { key: 'amount', header: t('demo.amount'), align: 'right', render: (r) => usd(r.amount) },
    { key: 'status', header: t('demo.status'), render: (r) => <Badge size="sm" tone={r.status === 'paid' ? 'success' : r.status === 'pending' ? 'warn' : 'danger'}>{t(`demo.pay_${r.status}`)}</Badge> },
  ];
  return (
    <div className="demo-page">
      <SectionHead title={t('demo.money')} sub={t('demo.money_sub', { business: d.prospect.business_name })} />
      <section className="demo-stats">
        <Stat label={t('demo.cash_today')} value={usd(cashToday)} hint={t('demo.cash_hint')} size="lg" />
        <Stat label={t('demo.stack_now')} value={`${usd(s.monthly_current)}/mo`} hint={t('demo.tools_cut', { n: s.tools_cut })} />
        <Stat label={t('demo.our_price')} value={`${usd(s.our_price_monthly)}/mo`} hint={t(`demo.band_${s.price_band}`)} />
        <Stat label={t('demo.net_year')} value={usd(s.net_annual)} hint={t('demo.net_hint')} tone="success" size="lg" />
      </section>

      <section className="demo-block">
        <SectionHead title={t('demo.stack_title')} sub={t('demo.stack_sub')} />
        <ul className="demo-stack">
          {s.items.map((g) => (
            <li key={g.tool} className="demo-stackrow">
              <span className="demo-strike">{g.tool}</span>
              <span className="xs muted grow">{g.category}</span>
              <span className="demo-strike-cost">{usd(g.monthly_cost)}/mo</span>
              <span className="demo-replaced"><Badge size="sm" tone="primary">{g.replaced_by}</Badge></span>
              <span className="xs muted demo-conf">{g.status === 'confirmed' ? t('demo.confirmed') : t('demo.guessed', { pct: Math.round(g.confidence * 100) })}</span>
            </li>
          ))}
        </ul>
        <div className="demo-trend">
          <span className="eyebrow">{t('demo.savings_curve')}</span>
          <MiniChart values={[0, 1, 2, 3, 4, 5, 6].map((m) => Math.round((s.net_monthly * m) / 100))} label={t('demo.savings_curve')} />
        </div>
      </section>

      <section className="demo-block">
        <SectionHead title={t('demo.payments')} sub={t('demo.payments_sub')} />
        <DataTable columns={cols} rows={pays} caption={t('demo.payments')} empty={{ title: t('demo.no_rows') }} />
      </section>

      <section className="demo-block">
        <SectionHead title={t('demo.payroll')} sub={t('demo.payroll_sub')} />
        <Card padding="md" className="demo-payroll">
          <div className="grow"><div className="demo-payroll-title">{t('demo.payroll_run', { n: d.prospect.team_size })}</div><div className="xs muted">{t('demo.payroll_note')}</div></div>
          <Placeholder will="run payroll and payouts through Stripe" by="T51 Stripe" button={{ label: t('demo.run_payroll'), variant: 'primary', icon: 'dollar' }} />
        </Card>
      </section>
    </div>
  );
}
export const MoneyPage = () => <DemoShell code="C-05" section="money">{(d) => <Money d={d} />}</DemoShell>;
