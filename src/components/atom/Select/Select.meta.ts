import { createElement as h } from 'react';
import { defineMeta } from '../../../design/meta';
import { Select } from './Select';
export default defineMeta({ tier: 'atom', name: 'Select', description: 'Native select styled with tokens.', props: [{ name: 'options', type: 'SelectOption[]', required: true, description: '' }, { name: 'placeholder', type: 'string', description: 'Disabled first option' }], states: ['default', 'focus', 'invalid'],
  usages: [{ title: 'Default', render: () => h(Select, { 'aria-label': 'Archetype', defaultValue: 'reveal', options: [{ value: 'reveal', label: 'A. The Reveal' }, { value: 'audit', label: 'B. Savings Audit' }, { value: 'walkthrough', label: 'C. Walkthrough' }, { value: 'letter', label: 'D. Letter' }], style: { maxWidth: 320 } }) }], a11y: ['Native element: full keyboard and AT support.'], usedBy: ['HUB-01', 'D-09'] });
