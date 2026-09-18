/** Every role in Lead Magnet. Order matters for display. */
export const ROLES = ['super_admin', 'strategist', 'analyst', 'prospect', 'guest'] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_LABEL: Record<Role, string> = { super_admin: 'Super admin', strategist: 'Strategist', analyst: 'Analyst', prospect: 'Prospect', guest: 'Guest' };
export const STAFF_ROLES: Role[] = ['super_admin', 'strategist', 'analyst'];
export const EVERYONE: Role[] = [...ROLES];
/** Which home a role lands on after choosing it. */
export const ROLE_HOME: Record<Role, string> = { super_admin: '/admin', strategist: '/studio', analyst: '/admin', prospect: '/p/paws-and-play-austin', guest: '/site' };
