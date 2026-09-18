import { createElement as h } from 'react';
import { defineMeta } from '../../../design/meta';
import { IconButton } from './IconButton';
export default defineMeta({ tier: 'atom', name: 'IconButton', description: 'Icon-only button; `label` is required and doubles as the tooltip.', props: [{ name: 'icon', type: 'IconName', required: true, description: '' }, { name: 'label', type: 'string', required: true, description: 'aria-label + title' }, { name: 'variant', type: "'ghost'|'outline'|'primary'", default: 'ghost', description: '' }], states: ['default', 'hover', 'disabled'],
  usages: [{ title: 'Variants', render: () => h('div', { className: 'row' }, h(IconButton, { icon: 'moon', label: 'Dark mode' }), h(IconButton, { icon: 'close', label: 'Close', variant: 'outline' }), h(IconButton, { icon: 'plus', label: 'Add', variant: 'primary' })) }], a11y: ['aria-label always present.', '44+ px target.'], usedBy: ['HUB-01'] });
