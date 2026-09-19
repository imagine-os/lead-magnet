import { createElement as h } from 'react';
import { defineMeta } from '../../../design/meta';
import { Button } from '../../atom/Button/Button';
import { openPalette } from '../../../actions/palette';
export default defineMeta({
  tier: 'organism', name: 'CommandPalette',
  description: 'Every declared action by typed or spoken phrase: Ctrl/Cmd+K, the TopBar / hub "Commands" button or hub.openCommands open the one instance ControlBridge mounts on every shell. matchPhrase (src/a11y/voice.ts) ranks window.__leadmagnet.vocabulary, can(permission) gates the list, runAction runs the choice, the result is read back as a toast. Microphone through useVoice: feature-detected, starts only on a user gesture, Placeholder when unsupported.',
  props: [],
  states: ['closed', 'open (live actions of the page listed)', 'typing (ranked matches)', 'match with slots (params form)', 'listening', 'voice unsupported (Placeholder mic)', 'microphone denied', 'result: failed'],
  usages: [{ title: 'Open it', render: () => h(Button, { variant: 'outline', icon: 'search', onClick: () => openPalette() }, 'Open the command palette (Ctrl/Cmd+K)') }, { title: 'Open with a phrase', render: () => h(Button, { variant: 'ghost', onClick: () => openPalette({ query: 'switch to dark mode' }) }, '"switch to dark mode"') }],
  a11y: ['Native <dialog> (Modal): Esc closes, focus trapped inside.', 'Input is a combobox (aria-activedescendant follows the arrow keys); options are real 44 px buttons with role=option, so Tab and a screen reader reach them too.', 'Status line is aria-live: matches count, what was heard, microphone denied / not supported.', 'Mic never auto-starts; unsupported browsers get a Placeholder with tooltip + toast (P-09).', 'data-spatial="skip": arrow keys inside belong to the list, not to the shell d-pad hook.'],
  usedBy: ['HUB-01', 'every DesktopShell page (TopBar)'],
});
