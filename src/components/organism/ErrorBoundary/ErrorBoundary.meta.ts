import { createElement as h } from 'react';
import { defineMeta } from '../../../design/meta';
import { ErrorBoundary } from './ErrorBoundary';
export default defineMeta({ tier: 'organism', name: 'ErrorBoundary', description: 'Per-route error catcher with retry and a link back to the hub.', props: [{ name: 'resetKey', type: 'string', description: 'Resets when it changes (route path)' }, { name: 'demoError', type: 'Error', description: 'Render the caught state without throwing (demo usage)' }], states: ['ok', 'error'], usages: [{ title: 'Caught error', render: () => h(ErrorBoundary, { demoError: new Error('Demo error from the component library'), children: null }) }], a11y: ['role=alert.'], usedBy: ['HUB-01'] });
