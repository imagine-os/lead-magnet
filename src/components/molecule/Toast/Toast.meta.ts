import { createElement as h } from 'react';
import { defineMeta } from '../../../design/meta';
import { Toast, useToast } from './Toast';
import { Button } from '../../atom/Button/Button';
function Fire() { const t = useToast(); return h(Button, { variant: 'outline', onClick: () => t.push({ tone: 'success', title: 'Page published', body: 'paws-and-play-austin is live for 14 days' }) }, 'Push a toast'); }
export default defineMeta({ tier: 'molecule', name: 'Toast', description: 'Bottom-centre notifications via useToast().push(); 5 s auto dismiss. ToastProvider wraps the app.', props: [{ name: 'tone', type: "'info'|'success'|'warn'|'danger'", default: 'info', description: '' }, { name: 'title', type: 'string', required: true, description: '' }, { name: 'body', type: 'string', description: '' }], states: ['info', 'success', 'warn', 'danger'],
  usages: [{ title: 'Static + live', render: () => h('div', { className: 'stack-sm', style: { maxWidth: 420 } }, h(Toast, { tone: 'info', title: 'Not wired yet', body: 'generate hero image · T40' }), h(Fire)) }], a11y: ['Container is role=status aria-live=polite.', 'Dismiss button labelled.'], usedBy: ['HUB-01'] });
