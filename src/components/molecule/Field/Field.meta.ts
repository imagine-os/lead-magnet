import { createElement as h } from 'react';
import { defineMeta } from '../../../design/meta';
import { Field } from './Field';
import { Input } from '../../atom/Input/Input';
export default defineMeta({ tier: 'molecule', name: 'Field', description: 'Label + control + hint / error wrapper; wires id and aria-describedby.', props: [{ name: 'label', type: 'string', required: true, description: '' }, { name: 'hint', type: 'string', description: '' }, { name: 'error', type: 'string', description: 'Shown as role=alert; sets invalid on the child' }], states: ['default', 'error'],
  usages: [{ title: 'Fields', render: () => h('div', { className: 'stack', style: { maxWidth: 360 } }, h(Field, { label: 'Business name', hint: 'As it appears on their sign', required: true }, h(Input, { placeholder: 'Paws & Play Austin' })), h(Field, { label: 'Email', error: 'Enter a valid email' }, h(Input, { defaultValue: 'maya@' }))) }], a11y: ['Real <label for>; error is role=alert.'], usedBy: ['D-09'] });
