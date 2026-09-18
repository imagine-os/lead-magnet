import type { ReactNode } from 'react';
import type { RouteDef } from '../specs/types';
import { DesktopShell } from '../components/template/DesktopShell/DesktopShell';
import { getRoutes } from './registry';
/** Picks the shell by surface. Public / demo pages own their chrome (landing pages are the product). */
export function withShell(route: RouteDef, children: ReactNode): ReactNode {
  const all = getRoutes();
  switch (route.surface) {
    case 'studio': return <DesktopShell surfaces={['studio', 'admin', 'plan']} routes={all} title="Studio">{children}</DesktopShell>;
    case 'admin': return <DesktopShell surfaces={['admin', 'studio', 'plan']} routes={all} title="Analytics">{children}</DesktopShell>;
    case 'plan': return <DesktopShell surfaces={['plan', 'studio', 'admin']} routes={all} title="Plan">{children}</DesktopShell>;
    case 'dev': return <DesktopShell surfaces={['dev', 'docs']} routes={all} title="Developer">{children}</DesktopShell>;
    case 'docs': return <DesktopShell surfaces={['docs', 'dev']} routes={all} title="Docs" feedback={false}>{children}</DesktopShell>;
    case 'manual': return <DesktopShell surfaces={['manual', 'studio']} routes={all} title="Ops manual" feedback={false}>{children}</DesktopShell>;
    default: return children;
  }
}
