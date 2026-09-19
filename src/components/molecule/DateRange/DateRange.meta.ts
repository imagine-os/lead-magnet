import { createElement as h, useState } from 'react';
import { defineMeta } from '../../../design/meta';
import { DateRange, lastDays, type DateRangeValue } from './DateRange';
function Demo({ size, inputsOnCustomOnly }: { size?: 'sm' | 'md'; inputsOnCustomOnly?: boolean }) {
  const [v, set] = useState<DateRangeValue>(lastDays(30));
  return h('div', { className: 'stack-sm' }, h(DateRange, { value: v, onChange: set, size, inputsOnCustomOnly, label: 'Date range', labels: { from: 'From', to: 'To', custom: 'Custom' }, presets: [{ days: 7, label: '7 days' }, { days: 30, label: '30 days' }, { days: 90, label: '90 days' }] }), h('code', { className: 'xs' }, `${v.from} → ${v.to}`));
}
export default defineMeta({ tier: 'molecule', name: 'DateRange', description: 'Presets (7 / 30 / 90 days) + custom from / to dates for A-01, A-03, plan and studio filters. Value is { from, to } as ISO calendar dates; the active preset is derived from the value.',
  props: [{ name: 'value', type: '{ from: string; to: string }', required: true, description: 'YYYY-MM-DD, inclusive' }, { name: 'onChange', type: '(v) => void', required: true, description: '' }, { name: 'label', type: 'string', required: true, description: 'Group / radiogroup label' }, { name: 'labels', type: '{ from, to, custom }', required: true, description: 'Module strings' }, { name: 'presets', type: '{ days, label }[]', default: '7d / 30d / 90d', description: '' }, { name: 'today', type: 'string', default: 'today (local)', description: 'Anchor for presets; pass a fixed day in tests / seeds' }, { name: 'size', type: "'sm'|'md'", default: 'md', description: '' }, { name: 'inputsOnCustomOnly', type: 'boolean', description: 'Hide from / to until Custom is picked' }],
  states: ['preset active', 'custom', 'invalid (from > to)'],
  usages: [{ title: 'Presets + custom (inputs always shown)', render: () => h(Demo) }, { title: 'sm, inputs only on custom', render: () => h(Demo, { size: 'sm', inputsOnCustomOnly: true }) }],
  a11y: ['Presets are a SegmentedControl (role=radiogroup, arrow keys, 44 px).', 'From / to are native date inputs inside real <label>s (48 px); from > to marks both invalid.', 'Helpers exported: isoDay(), shiftDay(), lastDays(days, today).'], usedBy: ['D-02', 'A-01', 'A-03'] });
