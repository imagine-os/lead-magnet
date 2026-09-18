import { createElement as h } from 'react';
import { defineMeta } from '../../../design/meta';
import { PageStub } from './PageStub';
import { defineSpec } from '../../../specs/types';
const spec = defineSpec({ code: 'L-05', name: 'Expired page', purpose: 'Demo stub for the library.', layout: ['message', 'book a call'], data: ['pages'], roles: ['guest'], logic: [], integrations: [], components: ['Card'], actions: [{ id: 'landing.bookCall', label: 'Book a call', intent: 'book a call' }], notes: ['Built by module landing (T12)'] });
export default defineMeta({ tier: 'template', name: 'PageStub', description: 'Placeholder page for a specified-but-unbuilt code: spec card, planned layout, tables, rules, Placeholder actions.', props: [{ name: 'spec', type: 'PageSpec', required: true, description: '' }], states: ['default', 'dev mode'], usages: [{ title: 'Stub', render: () => h(PageStub, { spec }) }], a11y: ['Heading order h1; links are real links.'], usedBy: ['L-01'] });
