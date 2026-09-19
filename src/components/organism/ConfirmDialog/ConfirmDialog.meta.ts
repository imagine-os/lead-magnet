import { createElement as h, useState } from 'react';
import { defineMeta } from '../../../design/meta';
import { ConfirmDialog, useConfirm } from './ConfirmDialog';
import { Button } from '../../atom/Button/Button';
function Demo() {
  const confirm = useConfirm();
  const [last, setLast] = useState<string>('');
  return h('div', { className: 'row wrap' },
    h(Button, { variant: 'danger', icon: 'trash', onClick: async () => setLast(String(await confirm({ title: 'Expire this page now?', body: 'Visitors see the expired view (L-05) immediately. The link can be re-published from S-03.', confirmLabel: 'Expire now', tone: 'danger' }))) }, 'Expire now'),
    h(Button, { variant: 'outline', onClick: async () => setLast(String(await confirm({ title: 'Publish page?', body: 'The page goes live for 14 days.', confirmLabel: 'Publish' }))) }, 'Publish'),
    last && h('code', { className: 'xs' }, `resolved ${last}`));
}
export default defineMeta({ tier: 'organism', name: 'ConfirmDialog', description: 'One question, two answers, promise-based: `const ok = await confirm({ title, body, confirmLabel, tone })` via useConfirm(); ConfirmProvider (App.tsx) hosts the single dialog. Built on Modal.',
  props: [{ name: 'title', type: 'string', required: true, description: '' }, { name: 'body', type: 'ReactNode', description: '' }, { name: 'confirmLabel', type: 'string', required: true, description: 'Module string for the confirming button' }, { name: 'cancelLabel', type: 'string', default: 'Cancel / Cancelar', description: 'By current language' }, { name: 'tone', type: "'default'|'danger'", default: 'default', description: 'danger = red confirm button, red title' }, { name: 'open', type: 'boolean', required: true, description: '(ConfirmDialog only; the provider drives it)' }, { name: 'onResolve', type: '(ok: boolean) => void', required: true, description: '(ConfirmDialog only)' }],
  states: ['closed', 'open', 'danger'],
  usages: [{ title: 'useConfirm() (needs ConfirmProvider, mounted in App)', render: () => h(Demo) }, { title: 'Static dialog props', render: () => h('p', { className: 'xs muted' }, 'ConfirmDialog({ open, onResolve, title, body, confirmLabel, cancelLabel?, tone? }) renders a size="sm" Modal; Esc, backdrop and Cancel resolve false.') }],
  a11y: ['Native <dialog> via Modal: focus trapped, Esc resolves false.', 'Focus lands on Cancel (the safe answer) when it opens.', 'Both buttons are 44 px and wrap to full width under 480 px (Modal footer).'], usedBy: ['D-02', 'S-03 (Expire now)'] });
// Keep the component referenced so the meta cannot drift from it.
void ConfirmDialog;
