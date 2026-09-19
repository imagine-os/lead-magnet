/**
 * Rule-based "paste facts" extractor (R-S05): the strategist pastes website copy, a job post or call notes and we
 * PROPOSE answers - city, team size, locations, tools we recognise from the catalog, and the language of the text.
 * Nothing is ever applied automatically: every proposal is confirmed or dismissed by a person on S-02.
 * No network, no LLM. The LLM path is T43 and stays a Placeholder.
 */
import { CATALOG_TOOLS, type Bi } from '../../engine';
import type { ProspectRow } from '../../data/schema/core';

export interface FactProposal {
  /** Stable within one extraction, so React keys and the action bus can address a proposal. */
  id: string;
  field: 'city' | 'team_size' | 'locations' | 'known_tools' | 'lang' | 'website';
  /** The raw value the intake would save (a comma list for array fields). */
  value: string;
  /** How it reads in the proposal card. */
  display: string;
  /** The words in the pasted text that produced it - so a person can judge it in one glance. */
  evidence: string;
  why: Bi;
}

const US_STATES = 'AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY|DC';
const WORD_NUMBERS: Record<string, number> = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, un: 1, una: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10, doce: 12 };
const ES_MARKERS = /\b(el|la|los|las|de|del|para|con|nuestro|nuestra|equipo|clientes|citas|somos|tenemos|servicio|horario|ubicaciones|sedes)\b/gi;
const EN_MARKERS = /\b(the|and|our|we|your|team|clients|appointments|hours|locations|book|service|since)\b/gi;

const snippet = (text: string, index: number, len: number): string => {
  const start = Math.max(0, index - 32), end = Math.min(text.length, index + len + 32);
  return `${start > 0 ? '…' : ''}${text.slice(start, end).replace(/\s+/g, ' ').trim()}${end < text.length ? '…' : ''}`;
};
const count = (text: string, re: RegExp) => (text.match(re) ?? []).length;
const toNumber = (raw: string): number | null => {
  const n = Number(raw);
  if (Number.isFinite(n) && n > 0) return Math.round(n);
  return WORD_NUMBERS[raw.toLowerCase()] ?? null;
};

/** Reads pasted text and returns what a person should confirm. Pure: the same text always proposes the same facts. */
export function extractFacts(text: string, p: Pick<ProspectRow, 'city' | 'team_size' | 'locations' | 'known_tools' | 'lang' | 'website' | 'fields_known'>): FactProposal[] {
  const out: FactProposal[] = [];
  const clean = text.replace(/ /g, ' ');
  if (clean.trim().length < 12) return out;
  const known = new Set(p.fields_known ?? []);
  const push = (f: FactProposal) => { if (!out.some((x) => x.field === f.field)) out.push(f); };

  // --- city: "Austin, TX" or "based in Austin" / "en Austin"
  const cityState = /\b([A-Z][\p{L}.'-]+(?: [A-Z][\p{L}.'-]+)?),\s*(?:(US_STATES))\b/u.source.replace('US_STATES', US_STATES);
  const m1 = new RegExp(cityState, 'u').exec(clean);
  const m2 = /\b(?:based in|located in|serving|proudly serving|en el area de|en)\s+([A-Z][\p{L}.'-]+(?: [A-Z][\p{L}.'-]+)?)/u.exec(clean);
  const cityHit = m1 ?? m2;
  if (cityHit && cityHit[1] && cityHit[1].toLowerCase() !== (p.city ?? '').toLowerCase()) {
    push({ id: 'city', field: 'city', value: cityHit[1], display: cityHit[1], evidence: snippet(clean, cityHit.index, cityHit[0].length), why: { en: 'The city drives the hero line, the timezone for booking and the local proof.', es: 'La ciudad define el titular, la zona horaria de la reserva y la prueba local.' } });
  }

  // --- team size: "12 employees", "team of 8", "equipo de 8", "somos 8"
  const teamRe = /\b(?:team of\s+(\d{1,3}|[a-zá-ú]+)|equipo de\s+(\d{1,3}|[a-zá-ú]+)|somos\s+(\d{1,3}|[a-zá-ú]+)|(\d{1,3})\s*(?:\+\s*)?(?:full-?time\s+)?(?:employees|people|staff|team members|empleados|personas|colaboradores))/i;
  const tm = teamRe.exec(clean);
  const team = tm ? toNumber(tm[1] ?? tm[2] ?? tm[3] ?? tm[4] ?? '') : null;
  if (team && team !== p.team_size) {
    push({ id: 'team_size', field: 'team_size', value: String(team), display: `${team}`, evidence: snippet(clean, tm!.index, tm![0].length), why: { en: 'Team size scales every per-seat price in the savings stack and the price band.', es: 'El tamaño del equipo escala cada precio por usuario del ahorro y la banda de precio.' } });
  }

  // --- locations: "3 locations", "dos sucursales"
  const locRe = /\b(\d{1,2}|[a-zá-ú]+)\s+(?:locations|offices|shops|stores|clinics|studios|branches|sedes|sucursales|ubicaciones|locales)\b/i;
  const lm = locRe.exec(clean);
  const loc = lm ? toNumber(lm[1]) : null;
  if (loc && loc <= 40 && loc !== p.locations) {
    push({ id: 'locations', field: 'locations', value: String(loc), display: `${loc}`, evidence: snippet(clean, lm!.index, lm![0].length), why: { en: 'Locations scale every per-site price and push the price band to multi.', es: 'Las sedes escalan cada precio por sitio y llevan la banda a multi-sede.' } });
  }

  // --- tools we recognise (longest name first so "Square for Restaurants" beats "Square")
  const lower = clean.toLowerCase();
  const found: string[] = [];
  let masked = lower;
  for (const t of CATALOG_TOOLS) {
    const idx = masked.indexOf(t.tool.toLowerCase());
    if (idx === -1) continue;
    found.push(t.tool);
    masked = masked.slice(0, idx) + '\u0000'.repeat(t.tool.length) + masked.slice(idx + t.tool.length);
  }
  const already = new Set((p.known_tools ?? []).map((x) => x.toLowerCase()));
  const newTools = found.filter((t) => !already.has(t.toLowerCase()));
  if (newTools.length) {
    const all = [...(p.known_tools ?? []), ...newTools];
    const first = lower.indexOf(newTools[0].toLowerCase());
    push({ id: 'known_tools', field: 'known_tools', value: all.join(', '), display: newTools.join(', '), evidence: snippet(clean, Math.max(0, first), newTools[0].length), why: { en: 'A tool we can name is a confirmed line in the savings stack, not a guess.', es: 'Una herramienta con nombre es una línea confirmada del ahorro, no una estimación.' } });
  }

  // --- language of the pasted copy
  const es = count(clean, ES_MARKERS), en = count(clean, EN_MARKERS);
  const lang = es > en * 1.5 ? 'es' : en > es * 1.5 ? 'en' : null;
  if (lang && lang !== p.lang && (es + en) >= 4) {
    push({ id: 'lang', field: 'lang', value: lang, display: lang === 'es' ? 'Español' : 'English', evidence: `${es} ES / ${en} EN`, why: { en: 'Their page opens in the language their own copy is written in.', es: 'Su página abre en el idioma en que está escrita su propia copia.' } });
  }

  // --- website
  const wm = /\bhttps?:\/\/[^\s<>"')]+/i.exec(clean) ?? /\b(?:www\.)[^\s<>"')]+/i.exec(clean);
  if (wm && !known.has('website')) {
    const url = wm[0].startsWith('http') ? wm[0] : `https://${wm[0]}`;
    if (url !== p.website) push({ id: 'website', field: 'website', value: url, display: url, evidence: snippet(clean, wm.index, wm[0].length), why: { en: 'The site is where the next pass pulls logo, palette and photos from.', es: 'El sitio es de donde el siguiente pase toma logo, paleta y fotos.' } });
  }
  return out;
}
