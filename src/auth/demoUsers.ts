import type { Role } from './roles';
export interface DemoUser { id: string; role: Role; name: string; initials: string; email: string; blurb: string }
/** One fictional person per role. Identity is mocked; guards stay real (P-12). */
export const demoUsers: DemoUser[] = [
  { id: 'usr_super', role: 'super_admin', name: 'Justin (super admin)', initials: 'JM', email: 'justin@imagine.demo', blurb: 'Owns the platform. Dev mode and view-as live here.' },
  { id: 'usr_strategist', role: 'strategist', name: 'Nora Vale', initials: 'NV', email: 'nora@imagine.demo', blurb: 'Builds prospect pages in the studio, runs intake and outreach.' },
  { id: 'usr_analyst', role: 'analyst', name: 'Theo Marsh', initials: 'TM', email: 'theo@imagine.demo', blurb: 'Reads the funnel, events and bookings. No writes.' },
  { id: 'usr_prospect', role: 'prospect', name: 'Maya Castillo (prospect)', initials: 'MC', email: 'maya@pawsandplay.demo', blurb: 'The lead viewing her own landing page and OS demo.' },
  { id: 'usr_guest', role: 'guest', name: 'Guest', initials: 'G', email: '', blurb: 'Anyone hitting a public URL.' },
];
export const demoUserById = (id: string) => demoUsers.find((u) => u.id === id);
export const demoUserByRole = (role: Role) => demoUsers.find((u) => u.role === role)!;
