import { useSession } from '../../../auth/SessionProvider';
import { demoUsers } from '../../../auth/demoUsers';
import { ROLES, ROLE_LABEL, type Role } from '../../../auth/roles';
import { Select } from '../../atom/Select/Select';
import { Field } from '../Field/Field';
import { Avatar } from '../../atom/Avatar/Avatar';
import './RoleSwitcher.css';
/** Demo user select + (super admin) "View as" select. Until real auth, view as any role (P-12). */
export function RoleSwitcher({ compact }: { compact?: boolean }) {
  const { user, isSuperAdmin, viewAs, switchUser, setViewAs } = useSession();
  return (<div data-component="RoleSwitcher" className={`roleswitch ${compact ? 'is-compact' : ''}`}>
    {!compact && <Avatar name={user.name} />}
    <Field label="Signed in as" inline={compact}><Select options={demoUsers.map((u) => ({ value: u.id, label: `${u.name} · ${ROLE_LABEL[u.role]}` }))} value={user.id} onChange={(e) => switchUser(e.target.value)} /></Field>
    {isSuperAdmin && <Field label="View as" inline={compact}><Select options={[{ value: '', label: 'Myself (super admin)' }, ...ROLES.filter((r) => r !== 'super_admin').map((r) => ({ value: r, label: ROLE_LABEL[r] }))]} value={viewAs ?? ''} onChange={(e) => setViewAs((e.target.value || null) as Role | null)} /></Field>}
  </div>);
}
