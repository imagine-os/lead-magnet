import type { Lang } from '../../i18n';

/** The six mandatory front-matter keys of an ops-manual chapter (house pattern, Hoy). */
export interface ChapterMeta { title: string; role: string; part: string; version: string; updated: string; summary: string }
export const META_KEYS: (keyof ChapterMeta)[] = ['title', 'role', 'part', 'version', 'updated', 'summary'];

export interface Chapter { slug: string; num: string; lang: Lang; meta: ChapterMeta; missing: (keyof ChapterMeta)[]; body: string; heading: string }

/** A parsed piece of a chapter body: markdown prose, a live-data directive, a figure, or an open decision. */
export type Segment =
  | { kind: 'md'; key: string; text: string }
  | { kind: 'live'; key: string; name: string; arg: string | null; raw: string }
  | { kind: 'shot'; key: string; code: string; caption: string }
  | { kind: 'decision'; key: string; text: string };

/**
 * Chapter sources. Lazy on purpose: each chapter is its own chunk, so the manual never weighs on the first paint of
 * any other surface. `docs/ops-manual/README.md` is excluded - only `<lang>/NN-slug.md` files are chapters.
 */
const FILES = import.meta.glob<string>('../../../docs/ops-manual/**/*.md', { query: '?raw', import: 'default' });

interface FileRef { lang: Lang; slug: string; num: string; load: () => Promise<string> }
const REF: FileRef[] = Object.entries(FILES)
  .map(([path, load]) => {
    const parts = path.split('/');
    const file = parts[parts.length - 1];
    const lang = parts[parts.length - 2] as Lang;
    return { lang, file, load };
  })
  .filter((r) => (r.lang === 'en' || r.lang === 'es') && /^\d{2}-.+\.md$/.test(r.file))
  .map((r) => ({ lang: r.lang, slug: r.file.replace(/\.md$/, ''), num: r.file.slice(0, 2), load: r.load }))
  .sort((a, b) => a.num.localeCompare(b.num));

/** Chapter slugs in part order, from the filenames (the `en` set is the spine). */
export const CHAPTER_SLUGS: string[] = REF.filter((r) => r.lang === 'en').map((r) => r.slug);
/** Slugs that exist in `en` but not in `es`, or the other way round (R-M02). */
export function translationGaps(): string[] {
  const en = new Set(REF.filter((r) => r.lang === 'en').map((r) => r.slug));
  const es = new Set(REF.filter((r) => r.lang === 'es').map((r) => r.slug));
  return [...new Set([...en, ...es])].filter((s) => !en.has(s) || !es.has(s)).sort();
}

function parseFrontMatter(raw: string): { meta: ChapterMeta; missing: (keyof ChapterMeta)[]; body: string } {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw);
  const fields: Record<string, string> = {};
  if (m) for (const line of m[1].split(/\r?\n/)) { const i = line.indexOf(':'); if (i > 0) fields[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^["']|["']$/g, ''); }
  const missing = META_KEYS.filter((k) => !fields[k]);
  const meta = Object.fromEntries(META_KEYS.map((k) => [k, fields[k] ?? ''])) as unknown as ChapterMeta;
  return { meta, missing, body: m ? raw.slice(m[0].length) : raw };
}

const DIRECTIVE = /^\{\{\s*([a-z_]+)(?:\s*:\s*([A-Za-z0-9_-]+))?\s*\}\}$/;
const FIGURE = /^\[screenshot:\s*([A-Za-z]+-\d{2}[a-z]?)\s*[—–\-:]\s*(.+?)\s*\]$/;
const DECISION = /^>\s*(DECISION NEEDED|DECISIÓN PENDIENTE|DECISION PENDIENTE)\s*:\s*(.*)$/i;

/** Splits a chapter body into prose, live blocks, figures and open decisions. Pure; also used to collect decisions. */
export function parseSegments(body: string): Segment[] {
  const out: Segment[] = [];
  let buf: string[] = [];
  let n = 0;
  const flush = () => { const text = buf.join('\n').trim(); if (text) out.push({ kind: 'md', key: `md${n++}`, text }); buf = []; };
  const lines = body.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const d = DIRECTIVE.exec(line.trim());
    if (d) { flush(); out.push({ kind: 'live', key: `live${n++}`, name: d[1], arg: d[2] ?? null, raw: line.trim() }); continue; }
    const f = FIGURE.exec(line.trim());
    if (f) { flush(); out.push({ kind: 'shot', key: `shot${n++}`, code: f[1], caption: f[2] }); continue; }
    const dec = DECISION.exec(line);
    if (dec) {
      flush();
      const parts = [dec[2]];
      while (i + 1 < lines.length && /^>\s?/.test(lines[i + 1])) { parts.push(lines[++i].replace(/^>\s?/, '')); }
      out.push({ kind: 'decision', key: `dec${n++}`, text: parts.join(' ').trim() });
      continue;
    }
    buf.push(line);
  }
  flush();
  return out;
}

/** Pulls the leading `# Heading` out of the body so the page head owns the title. */
function splitHeading(body: string): { heading: string; rest: string } {
  const m = /^\s*#\s+(.+?)\s*\r?\n/.exec(body);
  return m ? { heading: m[1], rest: body.slice(m[0].length) } : { heading: '', rest: body };
}

const cache = new Map<string, Chapter>();
/** Loads one chapter, falling back to English when the Spanish mirror is missing (R-M02 flags the gap separately). */
export async function loadChapter(slug: string, lang: Lang): Promise<Chapter | null> {
  const key = `${lang}/${slug}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const ref = REF.find((r) => r.slug === slug && r.lang === lang) ?? REF.find((r) => r.slug === slug && r.lang === 'en');
  if (!ref) return null;
  const raw = await ref.load();
  const { meta, missing, body } = parseFrontMatter(raw);
  const { heading, rest } = splitHeading(body);
  const chapter: Chapter = { slug, num: ref.num, lang: ref.lang, meta, missing, body: rest, heading: heading || meta.title };
  cache.set(key, chapter);
  return chapter;
}
/** Every chapter of a language, in part order (used by M-01 for the index and the open-decision list). */
export async function loadAll(lang: Lang): Promise<Chapter[]> {
  const list = await Promise.all(CHAPTER_SLUGS.map((s) => loadChapter(s, lang)));
  return list.filter((c): c is Chapter => !!c);
}

/** Route <-> chapter binding. The stub codes M-01..M-05 keep their paths; a new chapter adds a row here and a route. */
export interface ChapterRoute { code: string; slug: string; to: string }
export const MANUAL_CHAPTERS: ChapterRoute[] = [
  { code: 'M-01', slug: '01-how-lead-magnet-works', to: '/manual' },
  { code: 'M-02', slug: '02-intake-and-research', to: '/manual/intake' },
  { code: 'M-03', slug: '03-compose-and-publish', to: '/manual/compose' },
  { code: 'M-04', slug: '04-outreach-and-follow-up', to: '/manual/outreach' },
  { code: 'M-05', slug: '05-walkthrough-calls-and-the-proposal', to: '/manual/calls' },
];
export const chapterRouteOf = (code: string): ChapterRoute | undefined => MANUAL_CHAPTERS.find((c) => c.code === code);
/** Chapter files with no M- code bound to them yet (a chapter was added without a route). */
export const unroutedSlugs = (): string[] => CHAPTER_SLUGS.filter((s) => !MANUAL_CHAPTERS.some((c) => c.slug === s));
