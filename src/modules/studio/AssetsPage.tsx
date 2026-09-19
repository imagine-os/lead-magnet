import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useData, useRow, useTable } from '../../data/DataContext';
import { ASSET_KINDS, type AssetRow, type ProspectRow } from '../../data/schema/core';
import { imagePrompts } from '../../engine';
import { useI18n } from '../../i18n/I18nProvider';
import { useSession } from '../../auth/SessionProvider';
import { useActions } from '../../actions';
import { Card } from '../../components/molecule/Card/Card';
import { Field } from '../../components/molecule/Field/Field';
import { Stat } from '../../components/molecule/Stat/Stat';
import { EmptyState } from '../../components/molecule/EmptyState/EmptyState';
import { Badge } from '../../components/atom/Badge/Badge';
import { Button } from '../../components/atom/Button/Button';
import { Chip } from '../../components/atom/Chip/Chip';
import { Placeholder } from '../../components/atom/Placeholder/Placeholder';
import { Textarea } from '../../components/atom/Textarea/Textarea';
import { useToast } from '../../components/molecule/Toast/Toast';
import { ProspectNav } from './ProspectNav';
import './studio.css';

export function AssetsPage() {
  const { id } = useParams();
  const { t } = useI18n();
  const { can } = useSession();
  const data = useData();
  const toast = useToast();
  const nav = useNavigate();
  const p = useRow<ProspectRow>('prospects', id);
  const { rows: assets } = useTable<AssetRow>('assets', { where: { prospect_id: id ?? '' } });
  const [draft, setDraft] = useState<Record<string, string>>({});
  const seeded = useRef<string | null>(null);
  const writable = can('prospects.write');

  const prompts = useMemo(() => (p ? imagePrompts(p) : []), [p]);
  /** First visit for a prospect with no assets: materialise the engine's prompts as queued rows. */
  useEffect(() => {
    if (!p || seeded.current === p.id || assets.length) return;
    seeded.current = p.id;
    void (async () => { for (const ip of imagePrompts(p)) await data.insert<AssetRow>('assets', { prospect_id: p.id, kind: ip.kind, prompt: ip.prompt, status: 'queued', url: null, provider: null }); })();
  }, [p, assets.length, data]);

  const meta = useMemo(() => Object.fromEntries(prompts.map((ip) => [ip.prompt, ip])), [prompts]);
  const byKind = useMemo(() => ASSET_KINDS.map((k) => ({ kind: k, rows: assets.filter((a) => a.kind === k) })).filter((g) => g.rows.length), [assets]);

  const setStatus = async (aid: string, status: AssetRow['status']) => { await data.update<AssetRow>('assets', aid, { status }); };
  const savePrompt = async (a: AssetRow) => {
    const next = draft[a.id];
    if (next == null || next === a.prompt) return;
    await data.update<AssetRow>('assets', a.id, { prompt: next });
    toast.push({ tone: 'success', title: t('studio.prompt_saved'), body: t(`studio.asset_${a.kind}`) });
  };

  const latest = useRef({ assets, setStatus, savePrompt });
  latest.current = { assets, setStatus, savePrompt };
  useActions('S-04', {
    'studio.generateAsset': (a) => { toast.push({ tone: 'info', title: t('studio.not_wired'), body: t('studio.generate_will', { kind: String(a?.kind ?? '') }) }); },
    'studio.savePrompt': (a) => { const row = latest.current.assets.find((x) => x.id === a?.asset); return row ? latest.current.savePrompt(row) : undefined; },
    'studio.approveAsset': (a) => { const row = latest.current.assets.find((x) => x.id === a?.asset); return row ? latest.current.setStatus(row.id, 'approved') : undefined; },
    'studio.rejectAsset': (a) => { const row = latest.current.assets.find((x) => x.id === a?.asset); return row ? latest.current.setStatus(row.id, 'rejected') : undefined; },
  });

  if (!p) return <div className="container page"><EmptyState icon="user" title={t('studio.not_found')} body={t('studio.not_found_body')} action={<Button variant="outline" icon="arrow-left" onClick={() => nav('/studio')}>{t('studio.all_prospects')}</Button>} /></div>;

  const count = (s: AssetRow['status']) => assets.filter((a) => a.status === s).length;

  return (
    <div className="container container-wide page stack st-page">
      <ProspectNav p={p} />
      <Card className="stack-sm">
        <div className="row wrap"><h1 className="grow">{t('studio.s04_title')}</h1><Badge tone="warn">{t('studio.provider_not_wired')}</Badge></div>
        <p className="muted small">{t('studio.s04_sub')}</p>
        <div className="grid grid-4">
          <Stat label={t('studio.asset_total')} value={assets.length} />
          <Stat label={t('studio.status_queued')} value={count('queued')} tone="warn" />
          <Stat label={t('studio.status_approved')} value={count('approved')} tone="success" />
          <Stat label={t('studio.status_rejected')} value={count('rejected')} tone="danger" />
        </div>
      </Card>

      {byKind.length === 0 ? <EmptyState icon="image" title={t('studio.no_assets')} body={t('studio.no_assets_body')} /> : byKind.map((g) => (
        <section key={g.kind} className="stack-sm">
          <div className="row wrap"><h2 className="grow">{t(`studio.asset_${g.kind}`)}</h2><Chip>{g.rows.length}</Chip></div>
          <div className="grid grid-2">
            {g.rows.map((a) => {
              const m = meta[a.prompt];
              const value = draft[a.id] ?? a.prompt;
              return (
                <Card key={a.id} className="stack-sm">
                  <div className="row wrap">
                    <Badge size="sm" tone={a.status === 'approved' ? 'success' : a.status === 'rejected' ? 'danger' : a.status === 'generated' ? 'primary' : 'neutral'}>{t(`studio.status_${a.status}`)}</Badge>
                    {m && <Chip>{m.aspect}</Chip>}
                    {a.provider && <Chip>{a.provider}</Chip>}
                  </div>
                  <Field label={t('studio.prompt')} hint={m?.notes}>
                    <Textarea value={value} rows={5} disabled={!writable} onChange={(e) => setDraft((d) => ({ ...d, [a.id]: e.target.value }))} onBlur={() => void savePrompt(a)} />
                  </Field>
                  <div className="row wrap">
                    <Placeholder will={t('studio.generate_will', { kind: t(`studio.asset_${a.kind}`) })} by="T40"><Button size="sm" variant="accent" icon="image">{t('studio.generate')}</Button></Placeholder>
                    <Button size="sm" variant={a.status === 'approved' ? 'primary' : 'outline'} icon="check" disabled={!writable} onClick={() => void setStatus(a.id, 'approved')}>{t('studio.approve')}</Button>
                    <Button size="sm" variant={a.status === 'rejected' ? 'danger' : 'ghost'} icon="close" disabled={!writable} onClick={() => void setStatus(a.id, 'rejected')}>{t('studio.reject')}</Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
