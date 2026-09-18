import { createElement as h } from 'react';
import { defineMeta } from '../../../design/meta';
import { Tooltip } from './Tooltip';
import { IconButton } from '../../atom/IconButton/IconButton';
export default defineMeta({ tier: 'molecule', name: 'Tooltip', description: 'Hover + focus tooltip linked via aria-describedby.', props: [{ name: 'text', type: 'string', required: true, description: '' }, { name: 'side', type: "'top'|'bottom'", default: 'top', description: '' }], states: ['hidden', 'shown'], usages: [{ title: 'On an icon button', render: () => h(Tooltip, { text: 'Zoom to fit (0)' }, h(IconButton, { icon: 'maximize', label: 'Zoom to fit', variant: 'outline' })) }], a11y: ['role=tooltip; appears on focus too; never the only way to learn the action (label exists).'], usedBy: ['D-07'] });
