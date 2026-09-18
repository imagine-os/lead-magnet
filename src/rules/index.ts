/** Business rules registry. Each src/rules/<module>.ts exports `rules: Rule[]`; shown at /#/dev/rules (D-05). */
export type RuleStatus = 'requested' | 'in_dev' | 'implemented' | 'deprecated';
export interface Rule { id: string; title: string; description: string; category: string; status: RuleStatus; pages: string[]; source: string; implementedIn?: string }
const found = import.meta.glob<{ rules?: Rule[] }>('./*.ts', { eager: true });
export const rules: Rule[] = Object.entries(found).filter(([p]) => !/\/index\.ts$/.test(p)).flatMap(([, m]) => m.rules ?? []).sort((a, b) => a.id.localeCompare(b.id));
export const rulesForPage = (code: string) => rules.filter((r) => r.pages.includes(code));
export const ruleById = (id: string) => rules.find((r) => r.id === id);
