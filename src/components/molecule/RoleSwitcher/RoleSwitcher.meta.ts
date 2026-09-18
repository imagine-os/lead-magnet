import { createElement as h } from 'react';
import { defineMeta } from '../../../design/meta';
import { RoleSwitcher } from './RoleSwitcher';
export default defineMeta({ tier: 'molecule', name: 'RoleSwitcher', description: 'Pick a demo user per role; super admin can view as any role.', props: [{ name: 'compact', type: 'boolean', description: 'Inline labels' }], states: ['default', 'view-as'], usages: [{ title: 'Default', render: () => h(RoleSwitcher) }], a11y: ['Native selects with labels.'], usedBy: ['HUB-01'] });
