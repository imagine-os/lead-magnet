import { createElement as h } from 'react';
import { defineMeta } from '../../../design/meta';
import { Icon, ICON_NAMES } from './Icon';
export default defineMeta({ tier: 'atom', name: 'Icon', description: 'Single-path outline icon set (Lucide weight). Every component takes IconName.', props: [{ name: 'name', type: 'IconName', required: true, description: 'Icon key' }, { name: 'size', type: 'number', default: '20', description: 'px' }, { name: 'label', type: 'string', description: 'Accessible label; without it the icon is decorative' }], states: ['default'],
  usages: [{ title: 'All icons', render: () => h('div', { className: 'row wrap', style: { gap: 12 } }, ...ICON_NAMES.map((n) => h('span', { key: n, className: 'row xs', style: { gap: 4 } }, h(Icon, { name: n }), n))) }], a11y: ['aria-hidden unless `label` is given.'] });
