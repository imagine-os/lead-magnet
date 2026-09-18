import { createElement as h } from 'react';
import { defineMeta } from '../../../design/meta';
import { ErrorBoundary } from './ErrorBoundary';
function Boom(): never { throw new Error('Demo error from the component library'); }
export default defineMeta({ tier: 'organism', name: 'ErrorBoundary', description: 'Per-route error catcher with retry and a link back to the hub.', props: [{ name: 'resetKey', type: 'string', description: 'Resets when it changes (route path)' }], states: ['ok', 'error'], usages: [{ title: 'Caught error', render: () => h(ErrorBoundary, null, h(Boom)) }], a11y: ['role=alert.'], usedBy: ['HUB-01'] });
