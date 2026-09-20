/**
 * Bilingual sample content for the demo. Everything is derived from the prospect + industry catalog so the demo reads as
 * theirs (their business name, their departments, their KPIs) without inventing facts about a real company.
 */
import type { Bi, Prospect } from '../../engine/types';
import type { Industry } from '../../engine/types';
import { bizRoles, hash, personFor, titleCase, type Person } from './people';

/** Roles that read the whole business, so their "Today" strip leads with the capacity meter (same set as the engine's `deriveRoleViews`). */
const LEADS = /owner|partner|director|manager/;

export const bi = (en: string, es: string): Bi => ({ en, es });
export const DAYS: Record<'en' | 'es', string[]> = { en: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], es: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'] };

export interface CalEvent { id: string; day: number; time: string; title: Bi; who: string; tone: 'primary' | 'accent' | 'quiet' }

const SLOTS = ['8:00', '9:00', '10:30', '12:00', '13:00', '15:30', '17:00', '18:30'];
const GENERIC: Bi[] = [
  bi('Morning huddle', 'Reunión matutina'), bi('Team standup', 'Standup del equipo'), bi('Owner review', 'Revisión del dueño'),
  bi('Walk-in block', 'Bloque sin cita'), bi('Deep work', 'Trabajo enfocado'), bi('Follow-ups', 'Seguimientos'),
  bi('Training', 'Capacitación'), bi('Vendor call', 'Llamada con proveedor'), bi('Close-out', 'Cierre del día'),
];

/** A themed week for a role: the industry's departments and KPIs become the events, seeded per role so it is stable. */
export function weekFor(p: Prospect, ind: Industry, roleKey: string, times: string[] = SLOTS): CalEvent[] {
  const out: CalEvent[] = [];
  const pool: Bi[] = [...ind.departments.map((d) => bi(`${d.en} block`, `Bloque de ${d.es.toLowerCase()}`)), ...GENERIC, bi(`${ind.kpis[0]?.label.en ?? 'Numbers'} review`, `Revisión de ${(ind.kpis[0]?.label.es ?? 'números').toLowerCase()}`)];
  for (let day = 0; day < 7; day++) {
    const n = day > 4 ? 1 : 2 + (hash(`${roleKey}${day}`) % 2);
    for (let i = 0; i < n; i++) {
      const seed = hash(`${p.id}${roleKey}${day}${i}`);
      out.push({ id: `ev-${day}-${i}`, day, time: times[(seed + i * 3) % times.length] ?? SLOTS[i % SLOTS.length], title: pool[(seed + i) % pool.length], who: personFor(p, roleKey, seed % 4).name, tone: i === 0 ? 'primary' : seed % 3 === 0 ? 'accent' : 'quiet' });
    }
  }
  return out.sort((a, b) => a.day - b.day || a.time.localeCompare(b.time));
}

export type Channel = 'call' | 'email' | 'sms' | 'whatsapp';
export interface Msg { id: string; from: string; mine: boolean; at: string; text: Bi }
export interface Thread { id: string; channel: Channel; who: string; subject: Bi; preview: Bi; at: string; unread: boolean; messages: Msg[] }

/** Unified inbox sample: every thread mentions the business by name, in EN + ES. */
export function threadsFor(p: Prospect, ind: Industry): Thread[] {
  const b = p.business_name;
  const pain = ind.pains[0] ?? bi('too many tools', 'demasiadas herramientas');
  const roles = bizRoles(p, ind); // the resolved industry's roles when the prospect has none (a hotel's handlers, a firm's paralegals)
  const staff = (i: number) => personFor(p, roles[i % Math.max(1, roles.length)] ?? 'staff', i + 1).name;
  const t = (id: string, channel: Channel, who: string, subject: Bi, at: string, unread: boolean, msgs: [string, boolean, string, Bi][]): Thread =>
    ({ id, channel, who, subject, at, unread, preview: msgs[msgs.length - 1][3], messages: msgs.map(([mid, mine, mat, text], i) => ({ id: `${id}-${mid}-${i}`, from: mine ? b : who, mine, at: mat, text })) });
  return [
    t('th-1', 'whatsapp', staff(0), bi('Saturday add-on', 'Agregar el sábado'), '09:42', true, [
      ['a', false, '09:30', bi(`Hi ${b}! Can I add Saturday morning for Cleo?`, `¡Hola ${b}! ¿Puedo agregar el sábado por la mañana para Cleo?`)],
      ['b', true, '09:34', bi('Of course — 9:00 is open. Want me to hold it?', 'Claro: las 9:00 están libres. ¿Te lo aparto?')],
      ['c', false, '09:42', bi('Yes please, and can you send the invoice here?', 'Sí por favor, ¿y me mandas la factura por aquí?')],
    ]),
    t('th-2', 'sms', staff(1), bi('Running late', 'Voy tarde'), '08:58', true, [
      ['a', false, '08:58', bi('Running 10 min late, traffic on the way to the shop.', 'Llego 10 min tarde, hay tráfico camino al local.')],
    ]),
    t('th-3', 'email', staff(2), bi('Invoice question', 'Duda de factura'), 'Yesterday', false, [
      ['a', false, '16:10', bi(`Quick question about last month's invoice from ${b}.`, `Una duda sobre la factura del mes pasado de ${b}.`)],
      ['b', true, '16:40', bi('Attached the itemised version — everything is in one place now.', 'Adjunto la versión detallada: ahora todo está en un solo lugar.')],
    ]),
    t('th-4', 'call', staff(3), bi('Missed call · voicemail', 'Llamada perdida · buzón'), 'Yesterday', false, [
      ['a', false, '14:02', bi(`Voicemail, 38s: "Calling about ${pain.en.toLowerCase()} — call me back."`, `Buzón, 38s: «Llamo por ${pain.es.toLowerCase()}, devuélveme la llamada».`)],
    ]),
    t('th-5', 'email', staff(4), bi('Supplier renewal', 'Renovación de proveedor'), 'Mon', false, [
      ['a', false, '11:20', bi(`Your annual renewal for ${b} is due in 30 days.`, `La renovación anual de ${b} vence en 30 días.`)],
      ['b', true, '11:55', bi('Noted — we are consolidating tools this quarter.', 'Anotado: este trimestre estamos consolidando herramientas.')],
    ]),
    t('th-6', 'whatsapp', staff(5), bi('Team group', 'Grupo del equipo'), 'Mon', false, [
      ['a', false, '07:05', bi('Opening shift covered ✅', 'Turno de apertura cubierto ✅')],
      ['b', true, '07:08', bi('Thanks — schedule is in the OS now, no more group-chat roulette.', 'Gracias: el horario ya está en el OS, se acabó la ruleta del grupo.')],
    ]),
  ];
}

export interface Payment { id: string; who: string; kind: Bi; method: Bi; amount: number; status: 'paid' | 'pending' | 'failed' }
export function paymentsFor(p: Prospect): Payment[] {
  const base = [420, 185, 1240, 96, 640, 310, 88];
  const kinds: Bi[] = [bi('Service', 'Servicio'), bi('Package', 'Paquete'), bi('Deposit', 'Depósito'), bi('Membership', 'Membresía'), bi('Retail', 'Retail')];
  const methods: Bi[] = [bi('Card · tap', 'Tarjeta · contactless'), bi('Card on file', 'Tarjeta guardada'), bi('Bank transfer', 'Transferencia'), bi('Cash', 'Efectivo')];
  return base.map((amt, i) => {
    const seed = hash(`${p.id}pay${i}`);
    return { id: `pay-${i}`, who: personFor(p, 'customer', seed % 9).name, kind: kinds[seed % kinds.length], method: methods[(seed >> 3) % methods.length], amount: amt + (seed % 40), status: (i === 3 ? 'pending' : i === 6 ? 'failed' : 'paid') as Payment['status'] };
  });
}

export interface ListDef { id: string; title: Bi; items: Bi[] }
export function sharedLists(p: Prospect): ListDef[] {
  return [
    { id: 'l-1', title: bi('Groceries', 'Despensa'), items: [bi('Coffee', 'Café'), bi('Dog food', 'Comida para perro'), bi('Birthday candles', 'Velas de cumpleaños')] },
    { id: 'l-2', title: bi('House projects', 'Proyectos de casa'), items: [bi('Fix the porch light', 'Arreglar la luz del porche'), bi('Book the plumber', 'Llamar al plomero')] },
    { id: 'l-3', title: bi(`${p.city} weekend`, `Fin de semana en ${p.city}`), items: [bi('Park with the kids', 'Parque con los niños'), bi('Dinner reservation', 'Reservar cena')] },
  ];
}
export function familyChat(p: Prospect): Msg[] {
  const partner = personFor(p, 'spouse/partner', 2).name.split(' ')[0];
  return [
    { id: 'f1', from: partner, mine: false, at: '16:02', text: bi('Can you grab the kids at 5?', '¿Puedes recoger a los niños a las 5?') },
    { id: 'f2', from: p.first_name, mine: true, at: '16:04', text: bi('Yes — the shop closes itself now 😄', 'Sí: el negocio ya se cierra solo 😄') },
    { id: 'f3', from: partner, mine: false, at: '16:06', text: bi('Dinner at 7:30 then.', 'Cena a las 7:30 entonces.') },
  ];
}

/** A quick action either navigates (`to`) or is honest about not being wired (`will` + `by`) - never both, never neither. */
export interface QuickAction { id: string; label: Bi; icon: 'plus' | 'message' | 'calendar' | 'dollar' | 'doc'; to?: string; will?: string; by?: string }
/** Quick actions for a role home: two navigate, two are honest Placeholders. */
export function quickActionsFor(role: string, base: string): QuickAction[] {
  const r = role.toLowerCase();
  const inbox: QuickAction = { id: 'qa-inbox', label: bi('Open inbox', 'Abrir bandeja'), icon: 'message', to: `${base}/comms` };
  const money: QuickAction = { id: 'qa-money', label: bi('Today’s money', 'Dinero de hoy'), icon: 'dollar', to: `${base}/money` };
  const add: QuickAction = { id: 'qa-add', label: /front|host|desk|intake|coordinator|advisor/.test(r) ? bi('New booking', 'Nueva reserva') : bi('New item', 'Nuevo elemento'), icon: 'plus', will: 'create a real booking or work item in this workspace', by: 'os-demo, a later pass' };
  const doc: QuickAction = { id: 'qa-doc', label: bi('Start a document', 'Empezar un documento'), icon: 'doc', will: 'open the document editor from the template library', by: 'os-demo, a later pass' };
  return [inbox, money, add, doc];
}

/**
 * "Today" strip items: three live-looking numbers from the resolved industry's KPIs plus one person. An owner or a
 * manager of a business with a capacity resource leads with it (rooms tonight, caseload, mats), the way Petrock's owner
 * dashboard and Hoy's admin home do - the gauge is the number they open the day on (reference-systems.md §1, §3).
 */
export function todayFor(p: Prospect, ind: Industry, role: string): { id: string; label: Bi; value: string }[] {
  const k = ind.kpis;
  const person = personFor(p, role, 3).name.split(' ')[0];
  const m = LEADS.test(role) ? ind.meter : undefined;
  const head = m
    ? [{ id: 'td-meter', label: m.label, value: `${m.value} / ${m.max}` }, { id: 'td-1', label: k[0]?.label ?? bi('Today', 'Hoy'), value: k[0]?.sample ?? '—' }]
    : [{ id: 'td-1', label: k[0]?.label ?? bi('Today', 'Hoy'), value: k[0]?.sample ?? '—' }, { id: 'td-2', label: k[1]?.label ?? bi('Open items', 'Pendientes'), value: k[1]?.sample ?? '12' }];
  return [
    ...head,
    { id: 'td-3', label: bi('Unread messages', 'Mensajes sin leer'), value: String(2 + (hash(`${p.id}${role}`) % 6)) },
    { id: 'td-4', label: bi('On shift', 'En turno'), value: `${person} +${2 + (hash(role) % 4)}` },
  ];
}
export const cap = titleCase;
export type { Person };
