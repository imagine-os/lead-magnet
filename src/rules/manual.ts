import type { Rule } from './index';

/** Ops manual rules (module `manual`, task T33). The manual is written once and stays true by reading the app. */
export const rules: Rule[] = [
  {
    id: 'R-M01', title: 'A number the system owns is never typed into a chapter',
    description: 'Counts, prices, routes, roles, scores and KPIs appear in a chapter only as a live-data directive on its own line ({{stats}}, {{routes:<surface>}}, {{roles}}, {{prospects}}, {{archetypes}}, {{pricebands}}, {{channels}}, {{kpi:<name>}}), rendered from the running app at read time. Prose may explain a number, never state it. A chapter therefore cannot go stale when a route, a table, a price band or a seed changes, and an unknown directive renders as a visible warning rather than silently disappearing.',
    category: 'manual', status: 'implemented', pages: ['M-01', 'M-02', 'M-03', 'M-04', 'M-05'],
    source: 'house pattern: Hoy LiveBlock directives; P-11 memory always current', implementedIn: 'src/modules/manual/LiveBlock.tsx + chapters.ts parseSegments()',
  },
  {
    id: 'R-M02', title: 'Every chapter has a Spanish mirror with the same filename',
    description: 'docs/ops-manual/en/NN-slug.md and docs/ops-manual/es/NN-slug.md are a pair. Spanish is a faithful translation of the same chapter, not a stub or a summary. The reader follows the app language; when a mirror is missing it falls back to English and says so in the chapter header, and M-01 lists the gap in Manual health. Adding a chapter in one language only is a visible defect, never a silent one.',
    category: 'manual', status: 'implemented', pages: ['M-01', 'M-02', 'M-03', 'M-04', 'M-05'],
    source: 'P-13 English and Spanish from the start', implementedIn: 'src/modules/manual/chapters.ts translationGaps() + loadChapter() fallback',
  },
];
