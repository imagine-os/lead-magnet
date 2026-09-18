import { createElement as h } from 'react';
import { defineMeta } from '../../../design/meta';
import { Button } from './Button';
export default defineMeta({ tier: 'atom', name: 'Button', description: 'The one button for every surface. primary (electric), accent (lime CTA for landing pages), secondary, outline, ghost, danger, link.',
  props: [{ name: 'variant', type: "'primary'|'accent'|'secondary'|'outline'|'ghost'|'danger'|'link'", default: 'primary', description: 'Visual weight' }, { name: 'size', type: "'sm'|'md'|'lg'", default: 'md', description: '44 / 48 / 56 px' }, { name: 'icon', type: 'IconName', description: 'Leading icon' }, { name: 'loading', type: 'boolean', description: 'Spinner + disabled' }, { name: 'block', type: 'boolean', description: 'Full width' }],
  states: ['default', 'hover', 'active', 'disabled', 'loading'],
  usages: [{ title: 'Variants', render: () => h('div', { className: 'row wrap' }, h(Button, null, 'Open your demo'), h(Button, { variant: 'accent', iconRight: 'arrow-right' }, 'Open your demo'), h(Button, { variant: 'secondary' }, 'Book a call'), h(Button, { variant: 'outline', icon: 'filter' }, 'Filters'), h(Button, { variant: 'ghost', icon: 'plus' }, 'Add prospect'), h(Button, { variant: 'danger', icon: 'trash' }, 'Delete'), h(Button, { variant: 'link' }, 'Skip')) },
    { title: 'Sizes and states', render: () => h('div', { className: 'row wrap' }, h(Button, { size: 'sm' }, 'Small 44'), h(Button, null, 'Medium 48'), h(Button, { size: 'lg' }, 'Large 56'), h(Button, { loading: true }, 'Saving'), h(Button, { disabled: true }, 'Disabled')) }],
  a11y: ['Native <button>; type defaults to "button".', 'aria-busy while loading.', 'Never under 44 px tall.'], usedBy: ['HUB-01', 'D-07'] });
