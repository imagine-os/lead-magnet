import { createElement as h } from 'react';
import { defineMeta } from '../../../design/meta';
import { ViewportFrame } from './ViewportFrame';
export default defineMeta({ tier: 'molecule', name: 'ViewportFrame', description: 'Same-origin iframe of any route at a fixed width, scaled to fit (QA preview D-08).', props: [{ name: 'route', type: 'string', required: true, description: 'Hash route' }, { name: 'width', type: 'number', required: true, description: 'Viewport px' }, { name: 'height', type: 'number', default: '800', description: '' }], states: ['default'], usages: [{ title: 'Hub at 390', render: () => h('div', { style: { maxWidth: 300 } }, h(ViewportFrame, { route: '/no-access', width: 390, height: 500 })) }], a11y: ['iframe has a title.'], usedBy: ['D-08', 'D-07'] });
