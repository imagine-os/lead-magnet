import type { ReactNode } from 'react';
export type Tier = 'atom' | 'molecule' | 'organism' | 'template';
export interface PropDoc { name: string; type: string; required?: boolean; default?: string; description: string }
export interface UsageExample { title: string; render: () => ReactNode; code?: string }
/** D-02 contract. One per component, next to it, named <Name>.meta.ts. No component without a meta, no meta without a usage. */
export interface ComponentMeta { tier: Tier; name: string; description: string; props: PropDoc[]; states: string[]; usages: UsageExample[]; a11y: string[]; usedBy?: string[] }
export function defineMeta(meta: ComponentMeta): ComponentMeta { return meta; }
