import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { useActions } from '../../actions';
import { Tabs } from '../../components/molecule/Tabs/Tabs';
import { Card } from '../../components/molecule/Card/Card';
import './dev.css';
// Every markdown file under docs/ as raw text; bodies ship in the bundle (small repo).
const files = import.meta.glob<string>('../../../docs/**/*.md', { query: '?raw', import: 'default', eager: true });
const entries = Object.entries(files).map(([p, body]) => ({ path: p.replace('../../../docs/', ''), body })).sort((a, b) => a.path.localeCompare(b.path));
type Tab = 'start' | 'kanban' | 'changelog' | 'prompts' | 'decisions' | 'pages' | 'reference' | 'all';
const TABS: { id: Tab; label: string; match: (p: string) => boolean }[] = [
  { id: 'start', label: 'Start here', match: (p) => ['README.md', 'platform-principles.md', 'project-brief.md', 'build-plan.md', 'data-model.md'].includes(p) },
  { id: 'kanban', label: 'Kanban', match: (p) => p === 'kanban.md' }, { id: 'changelog', label: 'Changelog', match: (p) => p.startsWith('changelog/') }, { id: 'prompts', label: 'Prompts', match: (p) => p.startsWith('prompts/') },
  { id: 'decisions', label: 'Decisions', match: (p) => p === 'decisions.md' }, { id: 'pages', label: 'Pages', match: (p) => p.startsWith('pages/') }, { id: 'reference', label: 'Reference', match: (p) => p.startsWith('reference/') || p.startsWith('qa/') }, { id: 'all', label: 'All', match: () => true },
];
export function DocsPage() {
  const { code } = useParams();
  const [tab, setTab] = useState<Tab>(code ? 'pages' : 'start');
  const [sel, setSel] = useState<string>(code ? `pages/${code}.md` : 'README.md');
  const list = useMemo(() => entries.filter((e) => TABS.find((t) => t.id === tab)!.match(e.path)), [tab]);
  const current = entries.find((e) => e.path === sel) ?? list[0];
  useActions('D-06', { 'dev.openDoc': (p) => setSel(String(p?.doc ?? 'README.md')) });
  // rewrite relative links so ../screenshots and other .md links resolve inside the viewer
  const fixHref = (href?: string) => { if (!href) return href; if (/^https?:/.test(href)) return href; if (href.endsWith('.md')) { const base = current?.path.split('/').slice(0, -1).join('/') ?? ''; const parts = `${base}/${href}`.split('/').filter((x) => x && x !== '.'); const out: string[] = []; for (const p of parts) p === '..' ? out.pop() : out.push(p); return `#/docs/file/${out.join('/')}`; } return href; };
  return (<div className="container container-wide page stack">
    <div className="page-head"><h1>D-06 · Docs</h1><span className="xs muted">{entries.length} files · docs/**/*.md</span></div>
    <Tabs label="Doc groups" value={tab} onChange={(t) => { setTab(t); const first = entries.find((e) => TABS.find((x) => x.id === t)!.match(e.path)); if (first) setSel(first.path); }} tabs={TABS.map((t) => ({ id: t.id, label: t.label, count: entries.filter((e) => t.match(e.path)).length }))} />
    <div className="docs-layout" role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
      <nav className="docs-list" aria-label="Documents">{list.map((e) => <button key={e.path} type="button" className={`docs-item ${e.path === current?.path ? 'is-active' : ''}`} onClick={() => setSel(e.path)}>{e.path}</button>)}</nav>
      <Card className="docs-body">{current ? <><div className="xs muted mono docs-path">docs/{current.path} · <Link to="/dev/canvas">canvas</Link></div><div className="prose"><ReactMarkdown components={{ a: ({ href, children }) => <a href={fixHref(href)}>{children}</a>, img: ({ src, alt }) => <img src={src?.startsWith('../') ? `./docs/${src.replace(/^(\.\.\/)+/, '')}` : src} alt={alt ?? ''} loading="lazy" /> }}>{current.body}</ReactMarkdown></div></> : <p className="muted">No document.</p>}</Card>
    </div>
  </div>);
}
