/**
 * Fair questions, answered before the call. Disclosure buttons (aria-expanded), never hover-only, never drag-only.
 *
 * Pass 3 added the objections the composed list never covered, and they are all the same objection in different
 * clothes: *cutting software we already depend on is risky*. Nobody says that on a call, they just do not book one,
 * so the page has to say it first. Since the pass-3 integration they live in `composePage()` (every archetype
 * composes a `faq` section), so the studio can edit them per prospect and this section only renders the PageModel.
 */
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
  const items = section.items.map((it) => ({ key: it.q.en, q: bi(it.q), a: bi(it.a), both: `${it.q.en} ${it.q.es}`.toLowerCase() }));
  const toggle = (i: number) => setOpen((o) => (o.includes(i) ? o.filter((x) => x !== i) : [...o, i]));
  useLiveActions(pageCode, {
    'landing.toggleFaq': (p) => {
      const q = String(p?.question ?? '').toLowerCase();
      const i = items.findIndex((it) => it.both.includes(q)); // EN and ES: the vocabulary phrasing is English even on an ES page
      if (i < 0) return `no question matching "${q}"`;
      toggle(i);
      return items[i].a;
    },
  });
  return (
    <SectionShell id={section.id} kind="faq" label={bi(section.headline)}>
      <div className="lp-head"><h2 className="lp-h2">{bi(section.headline)}</h2></div>
      <ul className="lp-faq">
        {items.map((it, i) => {
          const isOpen = open.includes(i);
          return (
            <li key={it.key} className={`lp-faq-item ${isOpen ? 'is-open' : ''}`}>
              <button type="button" className="lp-faq-q" aria-expanded={isOpen} onClick={() => toggle(i)}>
                <span>{it.q}</span>
                <Icon name={isOpen ? 'chevron-up' : 'chevron-down'} size={20} />
              </button>
              {isOpen && <p className="lp-faq-a">{it.a}</p>}
            </li>
          );
        })}
      </ul>
    </SectionShell>
  );
}
