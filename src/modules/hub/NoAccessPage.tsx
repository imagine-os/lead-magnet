import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { getRoutes } from '../../app/registry';
import { useSession } from '../../auth/SessionProvider';
import { ROLE_LABEL } from '../../auth/roles';
import { useT } from '../../i18n/I18nProvider';
import { Card } from '../../components/molecule/Card/Card';
import { Button } from '../../components/atom/Button/Button';
import { Badge } from '../../components/atom/Badge/Badge';
export function NoAccessPage() {
  const [q] = useSearchParams(); const from = q.get('from') ?? '/'; const { switchUser, role } = useSession(); const nav = useNavigate(); const t = useT();
  const route = getRoutes().find((r) => r.path === from);
  return (<div className="container page" style={{ maxWidth: 640 }}><Card padding="lg" className="stack">
    <div className="row wrap"><Badge tone="warn">HUB-02</Badge><code>{from}</code></div>
    <h1>{t('hub.noaccess_title')}</h1>
    <p className="muted">{t('hub.noaccess_body', { role: ROLE_LABEL[role] })}</p>
    {route && <div className="row wrap">{route.roles.map((r) => <Button key={r} size="sm" variant="outline" onClick={() => { switchUser(r); nav(from); }}>{t('hub.signin_as', { role: ROLE_LABEL[r] })}</Button>)}</div>}
    <Link to="/"><Button variant="ghost" icon="arrow-left">{t('hub.back')}</Button></Link>
  </Card></div>);
}
