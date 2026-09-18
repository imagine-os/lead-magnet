import { createElement as h } from 'react';
import { defineMeta } from '../../../design/meta';
import { Avatar } from './Avatar';
export default defineMeta({ tier: 'atom', name: 'Avatar', description: 'Initials disc or image for people and prospects.', props: [{ name: 'name', type: 'string', required: true, description: '' }, { name: 'src', type: 'string', description: 'Image URL' }, { name: 'color', type: 'string', description: 'Background (prospect primary)' }], states: ['initials', 'image'],
  usages: [{ title: 'Sizes', render: () => h('div', { className: 'row' }, h(Avatar, { name: 'Maya Castillo', size: 'sm' }), h(Avatar, { name: 'Daniel Ortiz' }), h(Avatar, { name: 'Priya Raman', size: 'lg', color: '#1F1B2E' })) }], a11y: ['role=img with the full name.'], usedBy: ['HUB-01'] });
