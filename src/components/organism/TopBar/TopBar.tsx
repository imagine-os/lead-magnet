import { Link } from 'react-router-dom';
import { useSession } from '../../../auth/SessionProvider';
import { useTheme } from '../../../design/ThemeProvider';
import { IconButton } from '../../atom/IconButton/IconButton';
import { LangToggle } from '../../molecule/LangToggle/LangToggle';
import { Avatar } from '../../atom/Avatar/Avatar';
import { Badge } from '../../atom/Badge/Badge';
import { ROLE_LABEL } from '../../../auth/roles';
import './TopBar.css';
export interface TopBarProps { title?: string; onMenu?: () => void }
/** Staff top bar: menu (narrow), title, language, theme, user. */
export function TopBar({ title, onMenu }: TopBarProps) {
  const { user, role, viewAs, devMode } = useSession(); const { theme, toggleTheme } = useTheme();
  return (<header data-component="TopBar" className="topbar">
    {onMenu && <IconButton icon="menu" label="Open menu" onClick={onMenu} />}
    {title && <h1 className="topbar-title">{title}</h1>}
    <div className="grow" />
    {devMode && <Badge tone="warn" size="sm">dev</Badge>}
    {viewAs && <Badge tone="info" size="sm">viewing as {ROLE_LABEL[viewAs]}</Badge>}
    <LangToggle size="sm" />
    <IconButton icon={theme === 'dark' ? 'sun' : 'moon'} label={theme === 'dark' ? 'Switch to light' : 'Switch to dark'} onClick={toggleTheme} />
    <Link to="/" className="topbar-user" title="Hub: switch user"><Avatar name={user.name} size="sm" /><span className="topbar-username">{user.name.split(' ')[0]} · {ROLE_LABEL[role]}</span></Link>
  </header>);
}
