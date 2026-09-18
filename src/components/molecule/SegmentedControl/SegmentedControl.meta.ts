import { createElement as h, useState } from 'react';
import { defineMeta } from '../../../design/meta';
import { SegmentedControl } from './SegmentedControl';
function Demo() { const [v, set] = useState('kanban'); return h(SegmentedControl, { label: 'View', value: v, onChange: set, options: [{ value: 'kanban', label: 'Kanban' }, { value: 'list', label: 'List' }, { value: 'timeline', label: 'Timeline' }] }); }
export default defineMeta({ tier: 'molecule', name: 'SegmentedControl', description: 'Exclusive choice among 2-5 options (view switcher, EN/ES).', props: [{ name: 'options', type: 'SegmentedOption[]', required: true, description: '' }, { name: 'value', type: 'T', required: true, description: '' }, { name: 'label', type: 'string', required: true, description: 'Group label' }], states: ['default', 'active'], usages: [{ title: 'View switcher', render: () => h(Demo) }], a11y: ['role=radiogroup; arrow keys move; one tab stop.'], usedBy: ['HUB-01', 'D-07'] });
