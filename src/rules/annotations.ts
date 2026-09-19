import type { Rule } from './index';

/** Author weight (R-F02): whose annotation is an instruction, whose is a request, whose is a signal. */
export type AuthorWeight = 'binding' | 'request' | 'signal';
/** Owner / super admin is binding; staff (strategist, analyst) is a request; a prospect or guest is a signal. */
export function authorWeight(role: string): AuthorWeight {
  if (role === 'super_admin') return 'binding';
  if (role === 'strategist' || role === 'analyst') return 'request';
  return 'signal';
}
/** What an agent should do with a row before touching code, given who wrote it and what kind it is. */
export function suggestedTriage(role: string, kind: string): { triage: 'fix' | 'ask' | 'later'; why: string } {
  const w = authorWeight(role);
  if (kind === 'bug') return { triage: 'fix', why: 'a bug is reproducible or it is not a bug; fix it or downgrade it to a question' };
  if (w === 'binding') return { triage: 'fix', why: 'the owner asked for it, so it is the work' };
  if (w === 'request') return { triage: kind === 'request' ? 'ask' : 'later', why: 'staff testers propose; Justin decides scope' };
  return { triage: 'later', why: 'a prospect or guest annotation is a signal: count it, do not act on one' };
}

export const rules: Rule[] = [
  {
    id: 'R-F01', title: 'Record the triage before changing anything',
    description: 'An agent reading feedback writes `triage` (fix / ask / later / wontfix), `triage_note` and `decision_ref` on the row BEFORE editing any code or doc. A row cannot be marked done without a triage, and the inbox refuses the move and says why. When Justin has to decide, the row goes to status `waiting` and the question is added to the open decisions, never resolved silently.',
    category: 'annotations', status: 'implemented', pages: ['D-09'],
    source: 'P-08 + house pattern agent triage workflow', implementedIn: 'src/modules/dev/FeedbackPage.tsx guardStatus() + docs/reference/annotations-triage.md',
  },
  {
    id: 'R-F02', title: 'Author weight decides fix versus ask',
    description: 'Justin / super admin is binding: what he annotates is the work. Staff testers (strategist, analyst) are a request: they propose, and scope is Justin\'s. Prospects and guests are a signal: one annotation is data, three of the same annotation are a finding. Kind cuts across it - a reproducible bug is fixed whoever files it, and a question is answered rather than triaged.',
    category: 'annotations', status: 'implemented', pages: ['D-09'],
    source: 'house pattern: owner binding, staff = request, customer tester = signal', implementedIn: 'src/rules/annotations.ts authorWeight() / suggestedTriage()',
  },
  {
    id: 'R-F03', title: 'Pins never block the page',
    description: 'The annotation layer is pointer-transparent; only the pins and the toggle take a click. Annotate mode is opt-in, is announced, exits on Escape, and is the only state in which the layer intercepts a click. A pin whose element no longer exists is hidden from the page and listed in the drawer instead of floating at a stale position - a stale anchor is never allowed to cover a control.',
    category: 'annotations', status: 'implemented', pages: ['D-09'],
    source: 'P-03 inputs, P-09 nothing silent', implementedIn: 'src/components/organism/AnnotationLayer/AnnotationLayer.tsx + AnnotationLayer.css',
  },
];
