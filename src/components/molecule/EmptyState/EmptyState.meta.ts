import { createElement as h } from 'react';
import { defineMeta } from '../../../design/meta';
import { EmptyState } from './EmptyState';
import { Button } from '../../atom/Button/Button';
export default defineMeta({ tier: 'molecule', name: 'EmptyState', description: 'Friendly empty list / no results block with an optional action.', props: [{ name: 'title', type: 'string', required: true, description: '' }, { name: 'body', type: 'string', description: '' }, { name: 'action', type: 'ReactNode', description: '' }], states: ['default'], usages: [{ title: 'No feedback yet', render: () => h(EmptyState, { icon: 'message', title: 'No feedback yet', body: 'Testers comment from the button on every staff page.', action: h(Button, { variant: 'outline' }, 'Open the hub') }) }], a11y: ['Heading + text; action is a real button.'], usedBy: ['D-09', 'D-03'] });
