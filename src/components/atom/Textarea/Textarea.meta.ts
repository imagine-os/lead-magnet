import { createElement as h } from 'react';
import { defineMeta } from '../../../design/meta';
import { Textarea } from './Textarea';
export default defineMeta({ tier: 'atom', name: 'Textarea', description: 'Multi-line input sharing Input styling.', props: [{ name: 'rows', type: 'number', default: '4', description: '' }, { name: 'invalid', type: 'boolean', description: '' }], states: ['default', 'focus', 'invalid'], usages: [{ title: 'Default', render: () => h(Textarea, { placeholder: 'Notes about the prospect', 'aria-label': 'Notes', style: { maxWidth: 420 } }) }], a11y: ['Always labelled.'], usedBy: ['D-09'] });
