/**
 * Voice / typed-phrase matcher over the actions vocabulary (T46, P-04 / P-05). Pure: no DOM, no React, so
 * scripts/test-voice.mjs can unit-check it under Node. The vocabulary is `window.__leadmagnet.vocabulary`
 * (= docs/reference/voice-vocabulary.json): one `{ phrase, action, slots, pages, permission }` per action, straight
 * from `ActionDef.intent` / `params`. English intents are the source of truth; Spanish (and English synonyms) are
 * folded onto them by a canonicalisation layer, so "cambia a modo oscuro" and "switch to dark mode" score the same.
 *
 * Pipeline: normalise (lowercase, strip accents and punctuation) -> multi-word rewrites ("modo oscuro" -> "dark mode")
 * -> per-token canon (ES -> EN, EN synonyms, light stem) -> align the intent template against the phrase in order
 * (literal tokens must appear in order, stopwords are free, the tokens between two literals fill the slot between them)
 * -> typed slot extraction (number words, enum values, ids, quoted strings, ids from the current route) -> score.
 */
export type VoiceLang = 'en' | 'es';
export interface VoiceVocabularyEntry { phrase: string; action: string; slots: Record<string, string>; pages: string[]; permission?: string | null }
export interface MatchOptions {
  /** UI language: adds that language's stopwords; the ES -> EN dictionary is always applied (bilingual speakers mix). */
  lang?: VoiceLang;
  /** Code of the page on screen (HUB-01, S-02, ...): its actions get a bonus. */
  page?: string;
  /** Current hash route (`/studio/prospects/pro_maya`): ids in it fill id-typed slots when the speaker says "this" / "esta" or gives none. */
  route?: string;
  /** Live-handler check for a second, smaller bonus. */
  live?: (action: string) => boolean;
  /** Max results (default 8). */
  limit?: number;
  /** Minimum score to keep (default 0.45). */
  threshold?: number;
}
export type SlotValue = string | number;
export interface Match {
  entry: VoiceVocabularyEntry; action: string;
  /** 0..1+, higher is better; bonuses can push above 1. */
  score: number;
  /** Extracted slot values (only the ones found). */
  params: Record<string, SlotValue>;
  /** Slots the phrase did not fill (the palette shows a field for each). */
  missing: string[];
  /** Where each param came from. */
  sources: Record<string, 'phrase' | 'quoted' | 'route'>;
  /** The entry's phrase with the found slots substituted. */
  phraseFilled: string;
  onPage: boolean; live: boolean;
  /** Literal-token coverage 0..1 (debugging / tests). */
  coverage: number;
}

// --- normalisation ---------------------------------------------------------------------------------------------
/** Lowercase, accents stripped, punctuation -> space (keeps `_`, `-`, `.` and `:` inside tokens so ids like pro_maya, T45, pg-1 survive). */
/** Same, but keeps the case so an extracted id (`T45`, `pro_Maya`) or name comes back the way it was said or typed. */
export function strip(s: string): string {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/gi, '').replace(/[^a-zA-Z0-9_\-.:{}"'«»\s]/gi, ' ').replace(/(^|\s)['"«»]+|['"«»]+(\s|$)/gi, ' ').replace(/\s+/gi, ' ').trim();
}
export function normalize(s: string): string { return strip(s).toLowerCase(); }
export const tokenize = (s: string): string[] => normalize(s).split(' ').filter(Boolean);
/** Case-kept tokens after the multi-word rewrites, with their canonical twins at the same index. */
function prepare(phrase: string): { raw: string[]; canon: string[] } {
  let s = strip(phrase.replace(/["'«»]/gi, ' '));
  for (const [re, to] of PHRASES) s = s.replace(re, to);
  const raw = s.split(' ').filter(Boolean);
  return { raw, canon: raw.map((t) => canon(t.toLowerCase())) };
}

/** Stopwords never count as literal evidence; they may sit anywhere between literals. */
const STOP_EN = new Set(['the', 'a', 'an', 'to', 'for', 'of', 'in', 'on', 'at', 'as', 'by', 'with', 'my', 'me', 'please', 'and', 'or', 'it', 'its', 'is', 'be', 'this', 'that', 'these', 'those', 'now', 'up', 'from', 'into', 'then']);
const STOP_ES = new Set(['el', 'la', 'los', 'las', 'de', 'del', 'al', 'a', 'un', 'una', 'unos', 'unas', 'por', 'para', 'con', 'en', 'y', 'o', 'lo', 'le', 'les', 'mi', 'mis', 'me', 'se', 'su', 'sus', 'que', 'es', 'esta', 'este', 'esto', 'estas', 'estos', 'esa', 'ese', 'eso', 'favor', 'ahora', 'ya', 'hacia', 'desde']);
const DEICTIC = new Set(['this', 'current', 'here', 'este', 'esta', 'esto', 'actual', 'aqui']);

/** Multi-word rewrites applied to the normalised string before tokenising (ES and EN idioms -> the intent's wording). */
const PHRASES: [RegExp, string][] = [
  [/\bmodo oscuro\b/gi, 'dark mode'], [/\bmodo claro\b/gi, 'light mode'], [/\bmodo dev\b|\bmodo desarrollador\b|\bdev mode\b|\bdeveloper mode\b/gi, 'devmode'],
  [/\bbase de datos\b/gi, 'database'], [/\biniciar sesion\b|\bentrar como\b|\bsign in\b|\blog in\b|\blogin\b/gi, 'signin'], [/\bcerrar sesion\b|\bsign out\b|\blog out\b/gi, 'signout'],
  [/\bgo to\b|\bnavigate to\b|\btake me to\b|\bllevame a\b|\bir a\b|\bvamos a\b|\bve a\b/gi, 'open'], [/\bturn on\b|\bswitch on\b|\bactivar\b|\bactiva\b|\bencender\b|\benciende\b|\bhabilitar\b|\bhabilita\b/gi, 'on'],
  [/\bturn off\b|\bswitch off\b|\bdesactivar\b|\bdesactiva\b|\bapagar\b|\bapaga\b|\bdeshabilitar\b/gi, 'off'], [/\blinea de tiempo\b|\bcronograma\b/gi, 'timeline'],
  [/\bcase study\b|\bcaso de exito\b|\bcaso de estudio\b/gi, 'casestudy'], [/\bpaleta de comandos\b|\bcommand palette\b|\bcommand bar\b|\bpaleta\b/gi, 'commands'],
  [/\bvista previa\b/gi, 'preview'], [/\bpagina de\b/gi, 'page of'], [/\bpor voz\b|\bcomando de voz\b|\bvoice command\b/gi, 'voice'], [/\bmi demo\b/gi, 'my demo'],
  [/\bhoja de ruta\b/gi, 'plan'], [/\bmodo tv\b|\btv mode\b/gi, 'tvmode'], [/\bponer en\b|\bpon en\b/gi, 'set to'],
];

/** ES -> EN and EN synonym -> canonical, one token at a time (after PHRASES). Values are the canonical EN token the intents use. */
const DICT: Record<string, string> = {
  // verbs (ES conjugations people actually say + EN synonyms)
  abre: 'open', abrir: 'open', abra: 'open', abrime: 'open', abreme: 'open', open: 'open', launch: 'open', load: 'open', display: 'open', goto: 'open',
  muestra: 'show', mostrar: 'show', muestrame: 'show', ensena: 'show', ensename: 'show', ver: 'show', veamos: 'show', show: 'show', view: 'show', see: 'show', list: 'show', lista: 'show', listar: 'show',
  cambia: 'switch', cambiar: 'switch', cambiame: 'switch', switch: 'switch', change: 'switch', toggle: 'switch', alterna: 'switch', alternar: 'switch',
  pon: 'set', poner: 'set', ponlo: 'set', establece: 'set', establecer: 'set', set: 'set', assign: 'set', asigna: 'set',
  marca: 'mark', marcar: 'mark', mark: 'mark', flag: 'mark',
  mueve: 'move', mover: 'move', move: 'move', pasa: 'move', pasar: 'move',
  reinicia: 'reset', reiniciar: 'reset', reset: 'reset', restablece: 'reset', restablecer: 'reset', resetea: 'reset', reseed: 'reset',
  ejecuta: 'run', ejecutar: 'run', corre: 'run', correr: 'run', run: 'run', execute: 'run', lanza: 'run', lanzar: 'run',
  cierra: 'close', cerrar: 'close', close: 'close', dismiss: 'dismiss', descarta: 'dismiss', descartar: 'dismiss', ignora: 'dismiss', ignorar: 'dismiss',
  reserva: 'book', reservar: 'book', agenda: 'book', agendar: 'book', book: 'book', schedule: 'book', programa: 'book', programar: 'book',
  filtra: 'filter', filtrar: 'filter', filter: 'filter', filtro: 'filter',
  borra: 'delete', borrar: 'delete', elimina: 'delete', eliminar: 'delete', delete: 'delete', remove: 'remove', quita: 'remove', quitar: 'remove',
  guarda: 'save', guardar: 'save', save: 'save', copia: 'copy', copiar: 'copy', copy: 'copy', imprime: 'print', imprimir: 'print', print: 'print',
  publica: 'publish', publicar: 'publish', publish: 'publish', edita: 'edit', editar: 'edit', edit: 'edit', crea: 'create', crear: 'create', create: 'create', new: 'create', nuevo: 'create', nueva: 'create',
  anade: 'add', anadir: 'add', agrega: 'add', agregar: 'add', add: 'add', busca: 'search', buscar: 'search', search: 'search', find: 'search', encuentra: 'search',
  aplica: 'apply', aplicar: 'apply', apply: 'apply', acepta: 'accept', aceptar: 'accept', accept: 'accept', confirma: 'confirm', confirmar: 'confirm', confirm: 'confirm',
  rechaza: 'reject', rechazar: 'reject', reject: 'reject', aprueba: 'approve', aprobar: 'approve', approve: 'approve', duplica: 'duplicate', duplicar: 'duplicate', duplicate: 'duplicate', clone: 'duplicate',
  genera: 'generate', generar: 'generate', generate: 'generate', enriquece: 'enrich', enriquecer: 'enrich', enrich: 'enrich', extrae: 'extract', extraer: 'extract', extract: 'extract',
  responde: 'reply', responder: 'reply', reply: 'reply', answer: 'answer', contesta: 'answer', contestar: 'answer', invita: 'invite', invitar: 'invite', invite: 'invite',
  escucha: 'listen', escuchar: 'listen', listen: 'listen', habla: 'listen', hablar: 'listen', speak: 'listen', dicta: 'listen', dictar: 'listen',
  llama: 'call', llamar: 'call', llamada: 'call', call: 'call', prueba: 'try', probar: 'try', try: 'try', juega: 'play', reproducir: 'play', reproduce: 'play', play: 'play',
  descarga: 'download', descargar: 'download', download: 'download', exporta: 'export', exportar: 'export', export: 'export', sincroniza: 'sync', sincronizar: 'sync', sync: 'sync',
  calcula: 'calculate', calcular: 'calculate', calculate: 'calculate', compra: 'buy', comprar: 'buy', buy: 'buy', purchase: 'buy', elige: 'choose', elegir: 'choose', choose: 'choose', pick: 'pick', escoge: 'pick', escoger: 'pick', select: 'pick', selecciona: 'pick', seleccionar: 'pick',
  salta: 'skip', saltar: 'skip', skip: 'skip', omite: 'skip', omitir: 'skip', expira: 'expire', expirar: 'expire', expire: 'expire', caduca: 'expire',
  ajusta: 'zoom', zoom: 'zoom', acerca: 'zoom', acercar: 'zoom', aleja: 'zoom', alejar: 'zoom', fit: 'fit', encaja: 'fit', encajar: 'fit', ajustar: 'fit',
  ordena: 'sort', ordenar: 'sort', sort: 'sort', enfoca: 'focus', enfocar: 'focus', focus: 'focus', lee: 'read', leer: 'read', read: 'read',
  // nouns / adjectives
  demo: 'demo', demostracion: 'demo', pagina: 'page', page: 'page', paginas: 'page', prospecto: 'prospect', prospect: 'prospect', prospectos: 'prospect', cliente: 'prospect', lead: 'prospect',
  idioma: 'language', lenguaje: 'language', language: 'language', ingles: 'en', english: 'en', espanol: 'es', spanish: 'es', castellano: 'es',
  oscuro: 'dark', dark: 'dark', noche: 'dark', night: 'dark', claro: 'light', light: 'light', dia: 'light', tema: 'theme', theme: 'theme', modo: 'mode', mode: 'mode',
  usuario: 'user', user: 'user', rol: 'role', role: 'role', roles: 'role', papel: 'role', tarea: 'task', task: 'task', tareas: 'task', ticket: 'task',
  estado: 'status', status: 'status', state: 'status', eventos: 'events', evento: 'events', events: 'events', event: 'events',
  estudio: 'studio', studio: 'studio', analitica: 'analytics', analytics: 'analytics', metricas: 'analytics', plan: 'plan', kanban: 'plan', tablero: 'board', board: 'board',
  propuesta: 'proposal', proposal: 'proposal', sitio: 'site', site: 'site', website: 'site', web: 'site', inicio: 'home', home: 'home', docs: 'docs', documentacion: 'docs', documentos: 'docs', documentation: 'docs',
  manual: 'manual', herramientas: 'tools', tools: 'tools', desarrollador: 'dev', dev: 'dev', developer: 'dev', ajustes: 'settings', settings: 'settings', configuracion: 'settings',
  hecho: 'done', hecha: 'done', terminado: 'done', terminada: 'done', completado: 'done', done: 'done', finished: 'done', complete: 'done',
  pendiente: 'backlog', backlog: 'backlog', haciendo: 'doing', doing: 'doing', progreso: 'doing', progress: 'doing', bloqueado: 'blocked', blocked: 'blocked', revision: 'review', review: 'review',
  todo: 'all', todos: 'all', todas: 'all', all: 'all', every: 'all', siguiente: 'next', proximo: 'next', proxima: 'next', next: 'next', anterior: 'prev', previo: 'prev', previa: 'prev', previous: 'prev', prev: 'prev', atras: 'back', volver: 'back', back: 'back', regresa: 'back',
  seccion: 'section', section: 'section', dinero: 'money', money: 'money', finanzas: 'money', equipo: 'team', team: 'team', calendario: 'calendar', calendar: 'calendar', cita: 'call', meeting: 'call', reunion: 'call',
  datos: 'data', data: 'data', base: 'database', database: 'database', db: 'database', recomendacion: 'recommendation', recommendation: 'recommendation', sugerencia: 'recommendation', suggestion: 'recommendation',
  comandos: 'commands', comando: 'commands', commands: 'commands', command: 'commands', voz: 'voice', voice: 'voice', microfono: 'voice', mic: 'voice', microphone: 'voice',
  precio: 'pricing', precios: 'pricing', pricing: 'pricing', price: 'pricing', plantilla: 'template', template: 'template', arquetipo: 'archetype', archetype: 'archetype',
  variante: 'variant', variant: 'variant', canal: 'channel', channel: 'channel', hilo: 'thread', thread: 'thread', departamento: 'department', department: 'department', widget: 'widget', pago: 'payment', payment: 'payment', pagos: 'payment',
  enlace: 'link', link: 'link', vinculo: 'link', notas: 'notes', notes: 'notes', nota: 'notes', capitulo: 'chapter', chapter: 'chapter', decisiones: 'decisions', decisions: 'decisions', decision: 'decisions',
  regla: 'rules', reglas: 'rules', rules: 'rules', rule: 'rules', ruta: 'routes', rutas: 'routes', routes: 'routes', route: 'routes', tabla: 'table', table: 'table', tablas: 'table', componentes: 'components', components: 'components', componente: 'components',
  comentario: 'feedback', comentarios: 'feedback', feedback: 'feedback', bug: 'feedback', hueco: 'gaps', huecos: 'gaps', gaps: 'gaps', gap: 'gaps', pregunta: 'question', question: 'question', preguntas: 'question',
  vivo: 'live', live: 'live', ejemplo: 'sample', sample: 'sample', negocio: 'business', business: 'business', empresa: 'business', company: 'business',
  contacto: 'touch', touch: 'touch', toque: 'touch', booking: 'booking', embudo: 'funnel', funnel: 'funnel', outreach: 'outreach', alcance: 'outreach', caliente: 'hot', hot: 'hot', tibio: 'warm', warm: 'warm', frio: 'cold', cold: 'cold',
  industria: 'industry', industry: 'industry', sector: 'industry', nombre: 'name', name: 'name', estilo: 'style', style: 'style', activo: 'asset', asset: 'asset', activos: 'asset', imagen: 'asset', imagenes: 'asset', image: 'asset',
  herramienta: 'tool', tool: 'tool', confianza: 'confidence', confidence: 'confidence', dato: 'fact', fact: 'fact', facts: 'fact', hechos: 'fact',
  paso: 'step', step: 'step', faq: 'faq', carta: 'letter', letter: 'letter', historia: 'story', story: 'story', auditoria: 'audit', audit: 'audit', revelacion: 'reveal', reveal: 'reveal',
  miniaturas: 'thumbnails', thumbnails: 'thumbnails', lienzo: 'canvas', canvas: 'canvas', justin: 'justin', jefe: 'justin',
};
/** Light English stem: plural / -ing / -ed on tokens long enough that it is safe. */
function stem(t: string): string {
  if (t.length > 5 && t.endsWith('ing')) return t.slice(0, -3);
  if (t.length > 4 && t.endsWith('ed')) return t.slice(0, -2);
  if (t.length > 3 && t.endsWith('es') && !t.endsWith('ses')) return t.slice(0, -2);
  if (t.length > 3 && t.endsWith('s') && !t.endsWith('ss')) return t.slice(0, -1);
  return t;
}
const NUMBER_WORDS: Record<string, number> = { zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, cero: 0, uno: 1, una: 1, un: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10, first: 1, second: 2, third: 3, primera: 1, primero: 1, segunda: 2, segundo: 2, tercera: 3, tercero: 3 };
const ID_RE = /^(?:[a-z]{2,4}_[a-z0-9_]+|[a-z]-\d{2}[a-z]?|t\d{2,3}|d-\d{3}|p-\d{2}|r-[a-z]\d{2})$/i;

/** One token -> its canonical form (dictionary first, then stem). Slot markers and ids pass through untouched. */
export function canon(token: string): string {
  if (token.startsWith('{') || ID_RE.test(token) || /^\d/.test(token)) return token;
  const d = DICT[token]; if (d) return d;
  const s = stem(token);
  return DICT[s] ?? s;
}
/** String -> canonical tokens (multi-word rewrites, then per-token canon). */
export const canonicalize = (s: string): string[] => prepare(s).canon;
/** English stopwords always; Spanish ones only when the UI language is Spanish (so `en` / `es` stay literal evidence in an English UI). */
const isStop = (t: string, lang: VoiceLang) => STOP_EN.has(t) || (lang === 'es' && STOP_ES.has(t));

// --- extraction ------------------------------------------------------------------------------------------------
/** Quoted spans in the ORIGINAL phrase ("Paws & Play", 'x', «x»), in order. */
export function quoted(phrase: string): string[] { return [...phrase.matchAll(/["«]([^"»]+)["»]|(?:^|[\s(])'([^']+)'(?=$|[\s).,!?])/g)].map((m) => (m[1] ?? m[2]).trim()).filter(Boolean); }
/** Known id prefixes -> the slot they fill (`pro_maya` -> prospect, `pg_maya` -> page, `T45` -> task); unknown prefixes only fill a slot whose name starts with them. */
const ID_KIND: Record<string, string> = { pro: 'prospect', pg: 'page', t: 'task', d: 'decision', sg: 'guess', ev: 'event', bk: 'booking', fb: 'feedback', rec: 'recommendation', tch: 'touch', as: 'asset', th: 'thread', pay: 'payment', usr: 'user' };
const idPrefix = (id: string) => id.split(/[_-]/)[0].replace(/\d+$/, '').toLowerCase();
/** The route id that fits an id-typed slot by name: a known prefix wins, then a slot name that starts with the prefix; `id` (generic) takes the last id; otherwise none. */
export function routeIdFor(slot: string, ids: string[]): string | null {
  const base = slot.replace(/Id$/, '').toLowerCase();
  if (!ids.length) return null;
  if (base === 'id') return ids[ids.length - 1];
  const known = ids.find((id) => ID_KIND[idPrefix(id)] === base); if (known) return known;
  const loose = ids.find((id) => { const p = idPrefix(id); return p.length >= 2 && !ID_KIND[p] && base.startsWith(p); }); if (loose) return loose;
  return null;
}
/** Ids present in a hash route: `/studio/prospects/pro_maya` -> ['pro_maya']; `/plan/tasks/T45` -> ['T45']. */
export function routeIds(route?: string): string[] { return (route ?? '').replace(/^#/, '').split('?')[0].split('/').filter((seg) => ID_RE.test(seg) || /^[a-z0-9]+(?:-[a-z0-9]+){2,}$/i.test(seg)); }
const enumValues = (type: string) => (type.startsWith('enum:') ? type.slice(5).split('|') : null);

interface Aligned { literals: number; matched: number; spans: Record<string, string[]>; unexplained: number }
/**
 * Aligns the intent template with the phrase: literal tokens must appear in order (stopwords and slot spans may sit
 * between them); the raw tokens between two matched literals fill the slot declared between them. A slot with no
 * following literal takes the tail. Returns coverage evidence and the raw span per slot.
 */
function align(template: string[], phrase: string[], raw: string[], lang: VoiceLang): Aligned {
  const spans: Record<string, string[]> = {};
  let pos = 0, literals = 0, matched = 0;
  let pendingSlot: string | null = null; let slotStart = 0;
  const explained = new Array<boolean>(phrase.length).fill(false);
  for (const tok of template) {
    if (tok.startsWith('{')) { pendingSlot = tok.slice(1, -1); slotStart = pos; continue; }
    if (isStop(tok, lang)) continue;
    literals++;
    const at = phrase.indexOf(tok, pos);
    if (at === -1) continue;
    matched++;
    if (pendingSlot) { spans[pendingSlot] = raw.slice(slotStart, at); for (let i = slotStart; i < at; i++) explained[i] = true; pendingSlot = null; }
    explained[at] = true; pos = at + 1;
  }
  if (pendingSlot) { spans[pendingSlot] = raw.slice(slotStart); for (let i = slotStart; i < phrase.length; i++) explained[i] = true; }
  let unexplained = 0;
  for (let i = 0; i < phrase.length; i++) if (!explained[i] && !isStop(phrase[i], lang) && !DEICTIC.has(phrase[i])) unexplained++; // phrase = canonical (lowercase) tokens
  return { literals, matched, spans, unexplained };
}

/** Bigram Dice coefficient over two token arrays joined (whole-phrase similarity, tolerant to word order). */
export function dice(a: string[], b: string[]): number {
  const grams = (t: string[]) => { const s = t.join(' '); const g = new Map<string, number>(); for (let i = 0; i < s.length - 1; i++) { const k = s.slice(i, i + 2); g.set(k, (g.get(k) ?? 0) + 1); } return g; };
  const ga = grams(a), gb = grams(b); let inter = 0, na = 0, nb = 0;
  for (const [k, v] of ga) { na += v; inter += Math.min(v, gb.get(k) ?? 0); }
  for (const v of gb.values()) nb += v;
  return na + nb === 0 ? 0 : (2 * inter) / (na + nb);
}

function extractSlot(name: string, type: string, span: string[] | undefined, rawAll: string[], canonAll: string[], phrase: string, route: string | undefined, usedQuotes: Set<number>, usedNumbers: Set<number>, lang: VoiceLang): { value: SlotValue; source: Match['sources'][string] } | null {
  const spanCanon = (span ?? []).map((t) => canon(t.toLowerCase()));
  const content = (span ?? []).filter((t) => !isStop(t.toLowerCase(), lang) && !DEICTIC.has(t.toLowerCase()));
  const enums = enumValues(type);
  if (enums) {
    const lower = rawAll.map((t) => t.toLowerCase());
    const hit = enums.find((v) => spanCanon.includes(canon(v)) || (span ?? []).some((t) => t.toLowerCase() === v)) ?? enums.find((v) => canonAll.includes(canon(v)) || lower.includes(v));
    return hit ? { value: hit, source: 'phrase' } : null;
  }
  if (type === 'number') {
    const pool = content.length ? content : rawAll;
    for (let i = 0; i < pool.length; i++) { const t = pool[i]; const n = /^\d+(\.\d+)?$/.test(t) ? Number(t) : NUMBER_WORDS[t.toLowerCase()]; if (n != null && !usedNumbers.has(n)) { usedNumbers.add(n); return { value: n, source: 'phrase' }; } }
    return null;
  }
  const quotes = quoted(phrase);
  if (type === 'id') {
    const fromSpan = content.find((t) => ID_RE.test(t));
    if (fromSpan) return { value: fromSpan, source: 'phrase' };
    const anywhere = rawAll.find((t) => ID_RE.test(t));
    if (anywhere) return { value: anywhere, source: 'phrase' };
    const ids = routeIds(route);
    const deictic = rawAll.some((t) => DEICTIC.has(t.toLowerCase()));
    if (ids.length && (deictic || content.length === 0)) { const pick = routeIdFor(name, ids); if (pick) return { value: pick, source: 'route' }; }
    const q = quotes.findIndex((_, i) => !usedQuotes.has(i)); if (q >= 0) { usedQuotes.add(q); return { value: quotes[q], source: 'quoted' }; }
    return null;
  }
  // string / date / anything else: a quoted string first, then the span's words
  const q = quotes.findIndex((_, i) => !usedQuotes.has(i));
  if (q >= 0) { usedQuotes.add(q); return { value: quotes[q], source: 'quoted' }; }
  if (content.length) return { value: content.join(' '), source: 'phrase' };
  return null;
}

/** `phrase` with `{slot}` markers replaced by the found params (unfound markers stay). */
export function fillPhrase(phrase: string, params: Record<string, SlotValue>): string { return phrase.replace(/\{(\w+)\}/g, (m, k: string) => (params[k] != null && params[k] !== '' ? String(params[k]) : m)); }

/**
 * Ranks the vocabulary against a spoken or typed phrase. Score = 0.55 literal coverage + 0.15 precision (phrase words the
 * template explains) + 0.15 whole-phrase similarity + 0.15 slot fill ratio, + 0.15 when the action is on the current page,
 * + 0.05 when its handler is live. Entries under `threshold` (0.45) are dropped; an empty phrase returns [].
 */
export function matchPhrase(phrase: string, vocabulary: VoiceVocabularyEntry[], opts: MatchOptions = {}): Match[] {
  const lang = opts.lang ?? 'en'; const limit = opts.limit ?? 8; const threshold = opts.threshold ?? 0.45;
  const { raw: rawAligned, canon: canonPhrase } = prepare(phrase);
  if (!rawAligned.length) return [];
  const out: Match[] = [];
  for (const entry of vocabulary) {
    const template = canonicalize(entry.phrase);
    const a = align(template, canonPhrase, rawAligned, lang);
    const coverage = a.literals ? a.matched / a.literals : 0;
    const sim = dice(canonPhrase.filter((t) => !isStop(t, lang)), template.filter((t) => !t.startsWith('{') && !isStop(t, lang)));
    if (coverage < 0.5 && sim < 0.5) continue;
    const params: Record<string, SlotValue> = {}; const sources: Match['sources'] = {}; const missing: string[] = [];
    const usedQuotes = new Set<number>(); const usedNumbers = new Set<number>();
    const slotNames = Object.keys(entry.slots ?? {});
    for (const name of slotNames) {
      const got = extractSlot(name, entry.slots[name], a.spans[name], rawAligned, canonPhrase, phrase, opts.route, usedQuotes, usedNumbers, lang);
      if (got) { params[name] = got.value; sources[name] = got.source; } else missing.push(name);
    }
    const precision = 1 - Math.min(1, a.unexplained / Math.max(1, rawAligned.filter((t) => !isStop(t.toLowerCase(), lang)).length));
    const fill = slotNames.length ? Object.keys(params).length / slotNames.length : coverage; // no slots: nothing to fill, so the slot weight follows coverage instead of being free
    const onPage = !!opts.page && entry.pages.includes(opts.page);
    const live = !!opts.live?.(entry.action);
    const score = 0.55 * coverage + 0.15 * precision + 0.15 * sim + 0.15 * fill + (onPage ? 0.15 : 0) + (live ? 0.05 : 0);
    if (score < threshold) continue;
    out.push({ entry, action: entry.action, score: Math.round(score * 1000) / 1000, params, missing, sources, phraseFilled: fillPhrase(entry.phrase, params), onPage, live, coverage });
  }
  out.sort((x, y) => y.score - x.score || x.entry.phrase.length - y.entry.phrase.length || x.action.localeCompare(y.action));
  return out.slice(0, limit);
}
