import type { Role } from './roles';

/** String permissions. Pages ask `can('prospects.write')`, never `role === ...`. */
export type Permission =
  | 'prospects.read' | 'prospects.write' | 'pages.publish' | 'events.read' | 'plan.edit'
  | 'feedback.read' | 'feedback.write' | 'dev.tools' | 'proposal.read' | 'tables.read' | 'docs.read' | 'demo.open' | 'booking.create';

export const ALL_PERMISSIONS: Permission[] = ['prospects.read', 'prospects.write', 'pages.publish', 'events.read', 'plan.edit', 'feedback.read', 'feedback.write', 'dev.tools', 'proposal.read', 'tables.read', 'docs.read', 'demo.open', 'booking.create'];

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  super_admin: ALL_PERMISSIONS,
  strategist: ['prospects.read', 'prospects.write', 'pages.publish', 'events.read', 'plan.edit', 'feedback.read', 'feedback.write', 'proposal.read', 'tables.read', 'docs.read', 'demo.open', 'booking.create'],
  analyst: ['prospects.read', 'events.read', 'feedback.write', 'proposal.read', 'tables.read', 'docs.read', 'demo.open'],
  prospect: ['demo.open', 'booking.create', 'proposal.read', 'feedback.write'],
  guest: ['demo.open', 'booking.create', 'docs.read'],
};
export function roleCan(role: Role, permission: Permission): boolean { return ROLE_PERMISSIONS[role].includes(permission); }
