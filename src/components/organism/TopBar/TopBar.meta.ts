import { createElement as h } from 'react';
import { defineMeta } from '../../../design/meta';
import { TopBar } from './TopBar';
export default defineMeta({ tier: 'organism', name: 'TopBar', description: 'Staff shell header: menu (narrow), title, Commands (opens the CommandPalette; Ctrl/Cmd+K does the same), EN/ES, theme, current user.', props: [{ name: 'title', type: 'string', description: '' }, { name: 'onMenu', type: '() => void', description: 'Shows the menu button' }], states: ['default', 'narrow'], usages: [{ title: 'Default', render: () => h(TopBar, { title: 'Studio', onMenu: () => {} }) }], a11y: ['<header>; every icon button labelled.', 'Commands is a visible 44 px button, so the palette is never keyboard-only (P-04).'], usedBy: ['D-01'] });
