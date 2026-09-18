/** Sidebar menu categories. Modules reference a key in `nav.group`; unknown keys become ad-hoc groups. */
export interface NavGroup { key: string; label: string; icon: string; order: number }
export const NAV_GROUPS: NavGroup[] = [
  { key: 'studio', label: 'Studio', icon: 'sparkles', order: 10 }, { key: 'admin', label: 'Analytics', icon: 'chart', order: 20 }, { key: 'plan', label: 'Plan', icon: 'kanban', order: 30 },
  { key: 'website', label: 'Website', icon: 'globe', order: 40 }, { key: 'manual', label: 'Ops manual', icon: 'book', order: 50 }, { key: 'docs', label: 'Docs', icon: 'doc', order: 60 }, { key: 'dev', label: 'Developer', icon: 'code', order: 90 },
];
export const navGroup = (key: string): NavGroup => NAV_GROUPS.find((g) => g.key === key) ?? { key, label: key, icon: 'folder', order: 80 };
