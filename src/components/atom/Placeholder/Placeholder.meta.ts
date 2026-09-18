import { createElement as h } from 'react';
import { defineMeta } from '../../../design/meta';
import { Placeholder } from './Placeholder';
import { Button } from '../Button/Button';
export default defineMeta({ tier: 'atom', name: 'Placeholder', description: 'P-09: any control that does not work yet. Tooltip on hover and focus, toast on activation, dashed outline + badge in dev mode, data-placeholder attribute.',
  props: [{ name: 'will', type: 'string', required: true, description: 'What it will do' }, { name: 'by', type: 'string', description: 'Module / task that ships it' }, { name: 'children', type: 'ReactElement', description: 'Element to wrap (its onClick is replaced)' }, { name: 'button', type: 'ButtonProps & { label }', description: 'Render a Button when no children' }], states: ['default', 'hover/focus tooltip', 'dev mode badge'],
  usages: [{ title: 'Wrapping a button', render: () => h('div', { className: 'row wrap' }, h(Placeholder, { will: 'generate hero image with the image provider', by: 'T40' }, h(Button, { variant: 'accent', icon: 'image' }, 'Generate images')), h(Placeholder, { will: 'send this outreach email', by: 'studio', button: { label: 'Send', variant: 'outline' } })) }], a11y: ['Tooltip is role=tooltip and linked via aria-describedby; shows on focus as well as hover.', 'Activation gives feedback (toast), never silence.'], usedBy: ['HUB-01', 'D-01'] });
