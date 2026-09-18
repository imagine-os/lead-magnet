import { createElement as h } from 'react';
import { defineMeta } from '../../../design/meta';
import { LangToggle } from './LangToggle';
export default defineMeta({ tier: 'molecule', name: 'LangToggle', description: 'EN / ES switch bound to I18nProvider.', props: [{ name: 'size', type: "'sm'|'md'", default: 'md', description: '' }], states: ['en', 'es'], usages: [{ title: 'Default', render: () => h(LangToggle) }], a11y: ['role=group; aria-pressed on each option; lang attribute on labels.'], usedBy: ['HUB-01'] });
