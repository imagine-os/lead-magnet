import { createElement as h } from 'react';
import { defineMeta } from '../../../design/meta';
import { SpecChip } from './SpecChip';
export default defineMeta({ tier: 'molecule', name: 'SpecChip', description: 'Dev-mode floating chip with page code, name and spec completeness; opens the InspectorPanel.', props: [{ name: 'code', type: 'string', required: true, description: '' }, { name: 'completeness', type: 'number', required: true, description: '0..100' }], states: ['good', 'mid', 'low'], usages: [{ title: 'Static', render: () => h('div', { style: { position: 'relative', height: 60 } }, h('div', { style: { position: 'absolute', inset: 0 } }, h(SpecChip, { code: 'HUB-01', name: 'Testing hub', completeness: 89 }))) }], a11y: ['It is a button with a title.'], usedBy: ['HUB-01'] });
