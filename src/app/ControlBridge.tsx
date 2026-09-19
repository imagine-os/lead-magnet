import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSession } from '../auth/SessionProvider';
import { useData } from '../data/DataContext';
import { onActionsChange } from '../actions';
import { installControlBridge, syncTools } from '../actions/webmcp';
import type { ToolHost } from '../actions/schema';
import type { BaseRow } from '../data/schema/types';
import type { PageRow, ProspectRow, TaskRow } from '../data/schema/core';
import { buildManifest } from './manifest';
import { getRoutes } from './registry';
import { CommandPalette } from '../components/organism/CommandPalette/CommandPalette';

/**
 * Lends the actions bus what only the React tree knows (session `can`, router `navigate`, seeded defaults) and keeps the
 * WebMCP tool set in sync with the manifest and the live handlers. Renders the one CommandPalette (T46: Ctrl/Cmd+K and the
 * Commands / Speak buttons on every shell open it). Mounted once inside the router.
 */
export function ControlBridge() {
  const { can, role, hasRole } = useSession();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const data = useData();
  useEffect(() => {
    const first = <T extends BaseRow>(table: string): T | undefined => data.peek?.<T>(table)?.[0];
    const idParam = (params: Record<string, unknown>) => { const v = params.id ?? params.prospectId ?? params.prospect ?? params.task ?? params.page; return v == null ? undefined : String(v); };
    installControlBridge({
      can, role,
      navigate: (path) => navigate(path),
      currentPath: () => window.location.hash.replace(/^#/, '') || '/',
      canOpen: (host: ToolHost) => { const r = getRoutes().find((x) => x.path === host.path); return !r || hasRole(r.roles); },
      resolveParam: (name, hostPath, params) => {
        const given = params[name];
        if (given != null && given !== '') return String(given);
        switch (name) {
          case 'slug': return first<PageRow>('pages')?.slug;
          case 'prospectId': return idParam(params) ?? first<ProspectRow>('prospects')?.id;
          case 'id': return idParam(params) ?? (hostPath.startsWith('/plan') ? first<TaskRow>('tasks')?.id : first<ProspectRow>('prospects')?.id);
          case 'role': return 'owner';
          case 'table': return 'prospects';
          case 'code': return 'HUB-01';
          case '*': return '';
          default: return undefined;
        }
      },
    });
    return () => installControlBridge(null);
  }, [can, role, hasRole, navigate, data, pathname]);
  useEffect(() => {
    const sync = () => syncTools(buildManifest(getRoutes()));
    sync();
    return onActionsChange(sync);
  }, []);
  return <CommandPalette />;
}
