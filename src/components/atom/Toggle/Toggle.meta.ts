import { createElement as h, useState } from 'react';
import { defineMeta } from '../../../design/meta';
import { Toggle } from './Toggle';
function Demo() { const [v, set] = useState(true); return h(Toggle, { checked: v, onChange: set, label: 'Dev mode', description: 'Spec chips, placeholders and the inspector on every page' }); }
export default defineMeta({ tier: 'atom', name: 'Toggle', description: 'Switch with a visible label and optional description.', props: [{ name: 'checked', type: 'boolean', required: true, description: '' }, { name: 'onChange', type: '(v: boolean) => void', required: true, description: '' }, { name: 'label', type: 'string', required: true, description: '' }], states: ['on', 'off', 'disabled'], usages: [{ title: 'Dev mode', render: () => h(Demo) }], a11y: ['role=switch with aria-checked.', 'Label is a real <label>.'], usedBy: ['HUB-01'] });
