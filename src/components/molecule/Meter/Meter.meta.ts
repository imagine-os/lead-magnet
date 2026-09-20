import { createElement as h } from 'react';
import { defineMeta } from '../../../design/meta';
import { Meter } from './Meter';
export default defineMeta({ tier: 'molecule', name: 'Meter', description: 'Capacity gauge for the one resource a business runs on (rooms tonight, caseload vs capacity, mats booked): value, capacity, unit, percentage and a bar, with a near-capacity state that is never colour alone.',
  props: [{ name: 'value', type: 'number', required: true, description: 'Clamped into 0..max' }, { name: 'max', type: 'number', required: true, description: 'Capacity; under 1 is treated as 1' }, { name: 'label', type: 'string', required: true, description: 'Already localised by the caller' }, { name: 'unit', type: 'string', description: 'Read after the capacity: "50 / 58 rooms"' }, { name: 'hint', type: 'string', description: 'Line under the bar' }, { name: 'size', type: "'sm'|'md'", default: 'md', description: '' }, { name: 'tone', type: "'default'|'prospect'", default: 'default', description: 'prospect reads --lp-* with --color-* fallbacks' }, { name: 'warnAt', type: 'number', default: '0.9', description: 'Fraction at which the meter reads as near capacity' }, { name: 'warnLabel', type: 'string', description: 'Shown at or past warnAt (already localised)' }, { name: 'className', type: 'string', description: '' }, { name: 'style', type: 'CSSProperties', description: 'Host sizing only: --meter-value-size / --meter-text-size / --meter-track-h' }],
  states: ['default', 'near capacity (>= warnAt)', 'full', 'empty', 'sm', 'prospect'],
  usages: [{ title: 'Capacity across three businesses', render: () => h('div', { className: 'grid grid-3' },
    h(Meter, { label: 'Rooms occupied tonight', value: 50, max: 58, unit: 'rooms', hint: '50 of 58 rooms' }),
    h(Meter, { label: 'Caseload vs capacity', value: 73, max: 90, unit: 'cases', hint: '73 of 90 cases' }),
    h(Meter, { label: 'Mats booked, next class', value: 14, max: 15, unit: 'mats', hint: '14 of 15 mats', warnLabel: 'near capacity' })) },
    { title: 'Sizes, empty and full', render: () => h('div', { className: 'grid grid-3' },
      h(Meter, { size: 'sm', label: 'Groomer slots', value: 6, max: 16, unit: 'slots' }),
      h(Meter, { label: 'Daycare spots', value: 0, max: 20, unit: 'spots', hint: 'Nothing booked yet' }),
      h(Meter, { label: 'Enrolled vs licensed capacity', value: 104, max: 104, unit: 'children', warnLabel: 'at capacity' })) },
    { title: 'tone="prospect" (inherits --lp-* from an ancestor)', render: () => h('div', { className: 'grid grid-2', style: { '--lp-primary': '#B3542E', '--lp-surface': '#FFF8F2', '--lp-text': '#2B1C14', '--lp-bg': '#F4E9DF' } as Record<string, string> },
      h(Meter, { tone: 'prospect', label: 'Rooms occupied tonight', value: 50, max: 58, unit: 'rooms', hint: '50 of 58 rooms' }),
      h(Meter, { tone: 'prospect', size: 'sm', label: 'Units occupied', value: 464, max: 486, unit: 'units', warnLabel: 'near capacity' })) }],
  a11y: ['role="meter" on the track with aria-label, aria-valuenow / min / max and an aria-valuetext that reads "50 / 58 rooms · 86%".', 'Value, capacity and percentage are text: the fill and the warn colour only reinforce them.', 'No hover-only or drag-only information; nothing interactive, so nothing to focus.'],
  usedBy: ['C-01', 'C-02', 'L-01', 'L-03', 'L-06'] });
