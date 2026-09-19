/** Fair questions, answered before the call. Disclosure buttons (aria-expanded), never hover-only, never drag-only. */
import { useState } from 'react';
import { Icon } from '../../../components/atom/Icon/Icon';
import { useI18n } from '../../../i18n/I18nProvider';
import type { Section } from '../../../engine/types';
import { useLanding } from '../context';
import { useLiveActions } from '../hooks';
import { SectionShell } from './SectionShell';

type Faq = Extract<Section, { kind: 'faq' }>;

export function FaqSection({ section }: { section: Faq }) {
  const { bi } = useI18n();
  const { pageCode } = useLanding();
  const [open, setOpen] = useState<number[]>([0]);
  const toggle = (i: number) => setOpen((o) => (o.includes(i) ? o.filter((x) => x !== i) : [...o, i]));
  useLiveActions(pageCode, {
    'landing.toggleFaq': (p) => {
      const q = String(p?.question ?? '').toLowerCase();
      const i = section.items.findIndex((it) => it.q.en.toLowerCase().includes(q) || it.q.es.toLowerCase().includes(q));
      if (i < 0) return `no question matching "${q}"`;
      toggle(i);
      return bi(section.items[i].a);
    },
  });
  return (
    <SectionShell id={section.id} kind="faq" label={bi(section.headline)}>
      <div className="lp-head"><h2 className="lp-h2">{bi(section.headline)}</h2></div>
      <ul className="lp-faq">
        {section.items.map((it, i) => {
          const isOpen = open.includes(i);
          return (
            <li key={it.q.en} className={`lp-faq-item ${isOpen ? 'is-open' : ''}`}>
              <button type="button" className="lp-faq-q" aria-expanded={isOpen} onClick={() => toggle(i)}>
                <span>{bi(it.q)}</span>
                <Icon name={isOpen ? 'chevron-up' : 'chevron-down'} size={20} />
              </button>
              {isOpen && <p className="lp-faq-a">{bi(it.a)}</p>}
            </li>
          );
        })}
      </ul>
    </SectionShell>
  );
}
