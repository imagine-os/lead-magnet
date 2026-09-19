/**
 * The prospect's operating system, drawn small enough to live inside a DeviceMockup screen: their wordmark, their role
 * rail and three widgets from `deriveRoleViews` in their palette. Phone shows one column, laptop two, the TV three,
 * so the same composition reads at arm's length and from ten feet (P-01).
 */
import type { ProspectRow } from '../../../data/schema/core';
import type { RoleView, Widget } from '../../../engine/types';
import { useI18n } from '../../../i18n/I18nProvider';
import { cap } from '../format';

const asStrings = (v: unknown): string[] => (Array.isArray(v) ? v.map((x) => String(x)) : []);
const asNumbers = (v: unknown): number[] => (Array.isArray(v) ? v.map((x) => Number(x) || 0) : []);
const asChat = (v: unknown): { from: string; text: string }[] => (Array.isArray(v) ? (v as { from?: unknown; text?: unknown }[]).map((m) => ({ from: String(m.from ?? ''), text: String(m.text ?? '') })) : []);
const asRows = (v: unknown): string[][] => (Array.isArray(v) ? (v as unknown[]).map((r) => asStrings(r)) : []);

export function MiniWidget({ widget }: { widget: Widget }) {
  const { bi } = useI18n();
  const title = bi(widget.title);
  return (
    <div className="lp-w" data-kind={widget.kind}>
      <div className="lp-w-title">{title}</div>
      {widget.kind === 'kpi' && <div className="lp-w-kpi">{String(widget.sample)}</div>}
      {widget.kind === 'calendar' && <ul className="lp-w-cal">{asStrings(widget.sample).slice(0, 4).map((s, i) => <li key={i}><span className="lp-w-dot" aria-hidden />{s}</li>)}</ul>}
      {widget.kind === 'list' && <ul className="lp-w-list">{asStrings(widget.sample).slice(0, 3).map((s, i) => <li key={i}>{s}</li>)}</ul>}
      {widget.kind === 'chat' && <ul className="lp-w-chat">{asChat(widget.sample).slice(0, 3).map((m, i) => <li key={i}><b>{m.from}</b> {m.text}</li>)}</ul>}
      {widget.kind === 'table' && <table className="lp-w-table"><tbody>{asRows(widget.sample).slice(0, 3).map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>)}</tbody></table>}
      {widget.kind === 'chart' && (() => { const n = asNumbers(widget.sample); const max = Math.max(1, ...n); return <div className="lp-w-chart" aria-hidden>{n.slice(0, 8).map((v, i) => <span key={i} style={{ height: `${Math.max(8, (v / max) * 100)}%` }} />)}</div>; })()}
      {widget.kind === 'doc' && <ul className="lp-w-doc">{asStrings(widget.sample).slice(0, 3).map((s, i) => <li key={i}>{s}</li>)}</ul>}
    </div>
  );
}

export interface MiniOsProps { prospect: ProspectRow; views: RoleView[]; device: 'phone' | 'laptop' | 'tv'; /** Which role view is on screen; the scroll frame drives this. */ index?: number }

export function MiniOs({ prospect, views, device, index = 0 }: MiniOsProps) {
  const { bi } = useI18n();
  const count = device === 'phone' ? 1 : device === 'laptop' ? 2 : 3;
  const activeIdx = views.length ? ((index % views.length) + views.length) % views.length : -1;
  const active = activeIdx >= 0 ? views[activeIdx] : null;
  const rail = views.slice(0, device === 'phone' ? 3 : 6);
  return (
    <div className={`lp-os lp-os-${device}`} aria-hidden>
      <div className="lp-os-bar">
        <span className="lp-os-mark">{prospect.business_name.slice(0, 1)}</span>
        <span className="lp-os-name">{prospect.business_name}</span>
        <span className="lp-os-city">{prospect.city}</span>
      </div>
      <div className="lp-os-body">
        <div className="lp-os-rail">{rail.map((v, i) => <span key={`${v.kind}-${v.role}`} className={`lp-os-role ${i === activeIdx ? 'is-on' : ''}`}>{cap(v.role)}</span>)}</div>
        <div className="lp-os-main">
          {active && <div className="lp-os-head">{bi(active.headline)}</div>}
          <div className="lp-os-grid" style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }}>
            {(active?.widgets ?? []).slice(0, device === 'phone' ? 2 : 3).map((w) => <MiniWidget key={w.id} widget={w} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
