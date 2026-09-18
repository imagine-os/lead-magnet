import { createElement as h } from 'react';
import { defineMeta } from '../../../design/meta';
import { Chip } from './Chip';
export default defineMeta({ tier: 'atom', name: 'Chip', description: 'Tag / filter chip; clickable (aria-pressed) or removable.', props: [{ name: 'selected', type: 'boolean', description: '' }, { name: 'onClick', type: '() => void', description: 'Makes it a toggle button' }, { name: 'onRemove', type: '() => void', description: 'Adds a labelled remove button' }], states: ['default', 'selected'],
  usages: [{ title: 'Chips', render: () => h('div', { className: 'row wrap' }, h(Chip, null, 'restaurant'), h(Chip, { selected: true, onClick: () => {} }, 'cold'), h(Chip, { onClick: () => {} }, 'warm'), h(Chip, { onRemove: () => {} }, 'Toast POS')) }], a11y: ['Toggle chips expose aria-pressed.', 'Remove button has aria-label.'], usedBy: ['D-07', 'D-04'] });
