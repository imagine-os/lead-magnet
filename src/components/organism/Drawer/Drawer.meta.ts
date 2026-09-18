import { createElement as h, useState } from 'react';
import { defineMeta } from '../../../design/meta';
import { Drawer } from './Drawer';
import { Button } from '../../atom/Button/Button';
function Demo() { const [o, set] = useState(false); return h('div', null, h(Button, { variant: 'outline', onClick: () => set(true) }, 'Open drawer'), h(Drawer, { open: o, onClose: () => set(false), title: 'Filters' }, 'Drawer content')); }
export default defineMeta({ tier: 'organism', name: 'Drawer', description: 'Side panel over the page with scrim.', props: [{ name: 'open', type: 'boolean', required: true, description: '' }, { name: 'side', type: "'right'|'left'", default: 'right', description: '' }], states: ['closed', 'open'], usages: [{ title: 'Right', render: () => h(Demo) }], a11y: ['role=dialog aria-modal; Esc closes.'], usedBy: ['D-07'] });
