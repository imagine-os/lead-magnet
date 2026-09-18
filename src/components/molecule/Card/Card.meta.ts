import { createElement as h } from 'react';
import { defineMeta } from '../../../design/meta';
import { Card } from './Card';
export default defineMeta({ tier: 'molecule', name: 'Card', description: 'Surface container with padding and tone variants.', props: [{ name: 'padding', type: "'none'|'sm'|'md'|'lg'", default: 'md', description: '' }, { name: 'tone', type: "'surface'|'tint'|'ink'", default: 'surface', description: '' }, { name: 'interactive', type: 'boolean', description: 'Hover / focus-within lift' }], states: ['default', 'interactive'],
  usages: [{ title: 'Tones', render: () => h('div', { className: 'grid grid-3' }, h(Card, null, 'Surface'), h(Card, { tone: 'tint' }, 'Tint'), h(Card, { tone: 'ink' }, 'Ink')) }], a11y: ['Decorative container; interactive cards contain a real link or button.'], usedBy: ['HUB-01', 'D-07'] });
