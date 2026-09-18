import { createElement as h } from 'react';
import { defineMeta } from '../../../design/meta';
import { ProgressBar } from './ProgressBar';
export default defineMeta({ tier: 'atom', name: 'ProgressBar', description: 'Labelled progress bar (spec completeness, confidence, plan progress).', props: [{ name: 'value', type: 'number', required: true, description: '' }, { name: 'label', type: 'string', required: true, description: '' }, { name: 'tone', type: "'primary'|'success'|'warn'|'accent'", default: 'primary', description: '' }], states: ['default'],
  usages: [{ title: 'Tones', render: () => h('div', { className: 'stack-sm', style: { maxWidth: 360 } }, h(ProgressBar, { value: 72, label: 'Confidence' }), h(ProgressBar, { value: 7, max: 33, label: 'Plan done', tone: 'success' }), h(ProgressBar, { value: 40, label: 'Spec', tone: 'warn', size: 'sm' })) }], a11y: ['role=progressbar with aria-valuenow / min / max and a label.'], usedBy: ['HUB-01', 'D-01'] });
