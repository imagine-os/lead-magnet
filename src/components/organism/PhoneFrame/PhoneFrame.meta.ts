import { createElement as h } from 'react';
import { defineMeta } from '../../../design/meta';
import { PhoneFrame } from './PhoneFrame';
export default defineMeta({ tier: 'organism', name: 'PhoneFrame', description: 'Scaled 390 x 844 phone with a live iframe of any route (hub demo simulator).', props: [{ name: 'src', type: 'string', description: 'e.g. `${location.pathname}#/demo/pro_maya`' }, { name: 'scale', type: 'number', default: '1', description: '' }], states: ['default'], usages: [{ title: 'Scaled 0.35', render: () => h(PhoneFrame, { scale: 0.35, title: 'No access page' }, h('div', { style: { padding: 24, fontSize: 28 } }, 'Screen')) }], a11y: ['role=group; iframe titled.'], usedBy: ['HUB-01'] });
