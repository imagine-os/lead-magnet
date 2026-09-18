import { createElement as h } from 'react';
import { defineMeta } from '../../../design/meta';
import { Input } from './Input';
export default defineMeta({ tier: 'atom', name: 'Input', description: 'Text input, 48 px tall, tokens only. Wrap in Field for label / hint / error.', props: [{ name: 'invalid', type: 'boolean', description: 'aria-invalid + red border' }], states: ['default', 'focus', 'invalid', 'disabled'],
  usages: [{ title: 'States', render: () => h('div', { className: 'stack-sm', style: { maxWidth: 360 } }, h(Input, { placeholder: 'Business name', 'aria-label': 'Business name' }), h(Input, { invalid: true, defaultValue: 'not-an-email', 'aria-label': 'Email' }), h(Input, { disabled: true, defaultValue: 'Disabled', 'aria-label': 'Disabled' })) }], a11y: ['Always labelled (Field or aria-label).', 'aria-invalid when invalid.'], usedBy: ['D-09'] });
