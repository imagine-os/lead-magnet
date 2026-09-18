import { createElement as h, useState } from 'react';
import { defineMeta } from '../../../design/meta';
import { Modal } from './Modal';
import { Button } from '../../atom/Button/Button';
function Demo() { const [o, set] = useState(false); return h('div', null, h(Button, { variant: 'outline', onClick: () => set(true) }, 'Open modal'), h(Modal, { open: o, onClose: () => set(false), title: 'Publish page?', footer: h(Button, { onClick: () => set(false) }, 'Publish') }, 'The page goes live at /p/paws-and-play-austin for 14 days.')); }
export default defineMeta({ tier: 'organism', name: 'Modal', description: 'Native <dialog> modal; sheet on phones.', props: [{ name: 'open', type: 'boolean', required: true, description: '' }, { name: 'onClose', type: '() => void', required: true, description: '' }, { name: 'title', type: 'string', required: true, description: '' }, { name: 'footer', type: 'ReactNode', description: '' }], states: ['closed', 'open'], usages: [{ title: 'Confirm', render: () => h(Demo) }], a11y: ['showModal() traps focus; Esc closes; aria-labelledby.'], usedBy: ['D-09'] });
