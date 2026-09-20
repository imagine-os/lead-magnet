import type { Archetype, Bi, PageModel, Prospect, Section, StackGuess } from './types';
import { industryFor } from './catalog/industries';
import { guessStack, savings } from './stack';
import { deriveRoleViews } from './roles';

const bi = (en: string, es: string): Bi => ({ en, es });
const usd = (n: number) => `$${Math.round(n).toLocaleString('en-US')}`;
export const slugify = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export interface ComposeOpts { pageId?: string; slug?: string; guesses?: StackGuess[]; expiresAt?: string | null; demoPath?: string; bookPath?: string; from?: string }

/** Composes a full PageModel with every copy field resolved in EN and ES with the prospect's tokens. Pure. */
export function composePage(p: Prospect, archetype: Archetype, opts: ComposeOpts = {}): PageModel {
  const ind = industryFor(p);
  const guesses = opts.guesses ?? guessStack(p);
  const sav = savings(p, guesses);
  const views = deriveRoleViews(p);
  const B = p.business_name, F = p.first_name, C = p.city;
  const slug = opts.slug ?? slugify(`${B}-${C}`);
  const demo = opts.demoPath ?? `/demo/${p.id}`;
  const book = opts.bookPath ?? `/book/${p.id}`;
  const pageId = opts.pageId ?? `pg_${slug}`;

  const hero: Section = { kind: 'hero_reveal', id: 'hero', businessName: B, city: C, devices: ['phone', 'laptop', 'tv'],
    eyebrow: bi(`Built for ${F} · ${C}`, `Hecho para ${F} · ${C}`),
    headline: bi(`We already built ${B}'s operating system.`, `Ya construimos el sistema operativo de ${B}.`),
    sub: bi(`Every role, every device, in your colours. It replaces ${sav.tools_cut} tools you pay for today and saves about ${usd(sav.net_annual)} a year.`, `Cada rol, cada dispositivo, en tus colores. Reemplaza ${sav.tools_cut} herramientas que pagas hoy y ahorra cerca de ${usd(sav.net_annual)} al año.`) };
  const savingsSec: Section = { kind: 'savings_stack', id: 'savings', savings: sav, editable: archetype === 'audit',
    headline: bi(`What ${B} pays today: about ${usd(sav.monthly_current)} a month`, `Lo que ${B} paga hoy: cerca de ${usd(sav.monthly_current)} al mes`),
    sub: bi(`Our best guess from ${ind.label.en.toLowerCase()} businesses your size. Cross out what is wrong; the number updates.`, `Nuestra mejor estimación para negocios de ${ind.label.es.toLowerCase()} de tu tamaño. Tacha lo que no aplique; el número se actualiza.`) };
  const rolesSec: Section = { kind: 'role_views', id: 'roles', views,
    headline: bi(`A view for everyone around ${F}`, `Una vista para cada persona alrededor de ${F}`),
    sub: bi(`${views.filter((v) => v.kind === 'business').length} business roles and ${views.filter((v) => v.kind === 'life').length} people in your life each get their own screen. Same data, their view.`, `${views.filter((v) => v.kind === 'business').length} roles del negocio y ${views.filter((v) => v.kind === 'life').length} personas de tu vida tienen su propia pantalla. Mismos datos, su vista.`) };
  const proof: Section = { kind: 'proof', id: 'proof', headline: bi('Why it is already yours', 'Por qué ya es tuyo'), items: [
    { title: bi('Your palette and tone', 'Tu paleta y tono'), body: bi(`${p.style.tone} · ${p.style.palette.primary} · ${p.style.font} type. Pulled from what ${B} already shows the world.`, `${p.style.tone} · ${p.style.palette.primary} · tipografía ${p.style.font}. Tomado de lo que ${B} ya muestra al mundo.`) },
    { title: bi('Your departments', 'Tus departamentos'), body: bi(ind.departments.map((d) => d.en).join(' · '), ind.departments.map((d) => d.es).join(' · ')) },
    { title: bi('Your pains, handled', 'Tus dolores, resueltos'), body: bi(ind.pains.map((x) => x.en).join('. ') + '.', ind.pains.map((x) => x.es).join('. ') + '.') },
    { title: bi('Multi-platform', 'Multiplataforma'), body: bi('Phone, laptop and the TV in the back office, one login, English and Spanish.', 'Teléfono, laptop y la TV de la oficina, un solo acceso, inglés y español.') },
  ] };
  const audit: Section = { kind: 'stack_audit', id: 'audit', guesses, confirmLabel: bi('Yes, we pay for this', 'Sí, pagamos esto'), rejectLabel: bi('No, not us', 'No, nosotros no'),
    headline: bi(`${F}, correct our guess in 20 seconds`, `${F}, corrige nuestra estimación en 20 segundos`),
    sub: bi('Each tool you confirm sharpens your OS and the savings number. Nothing to sign up for.', 'Cada herramienta que confirmes afina tu OS y el número de ahorro. Sin registrarte.') };
  const steps: Section = { kind: 'walkthrough_steps', id: 'story', headline: bi(`A Tuesday at ${B}, next week`, `Un martes en ${B}, la próxima semana`), steps: views.slice(0, 5).map((v, i) => ({ time: ['7:10', '9:00', '12:30', '16:45', '21:00'][i] ?? '', role: v.role, title: bi(`${v.headline.en}`, `${v.headline.es}`), body: bi(`${v.widgets.map((w) => w.title.en).join(', ')}: already on their screen, no one re-typed anything.`, `${v.widgets.map((w) => w.title.es).join(', ')}: ya en su pantalla, nadie volvió a tipear nada.`) })) };
  const letter: Section = { kind: 'letter', id: 'letter', from: opts.from ?? 'Justin, Imagine', greeting: bi(`${F},`, `${F},`), signoff: bi('Talk soon,', 'Hablamos pronto,'), paragraphs: [
    bi(`I looked at how ${B} ${ind.verbs.en} in ${C} and built the operating system I would want if I were you: one place for ${ind.departments.slice(0, 3).map((d) => d.en.toLowerCase()).join(', ')} and everything else.`, `Vi cómo ${B} ${ind.verbs.es} en ${C} y construí el sistema operativo que querría si fuera tú: un solo lugar para ${ind.departments.slice(0, 3).map((d) => d.es.toLowerCase()).join(', ')} y todo lo demás.`),
    bi(`It is themed to you, it has a view for ${(p.life_roles ?? []).slice(0, 3).join(', ')}, and it replaces about ${usd(sav.monthly_current)} a month of software.`, `Está en tus colores, tiene una vista para ${(p.life_roles ?? []).slice(0, 3).join(', ')} y reemplaza cerca de ${usd(sav.monthly_current)} al mes en software.`),
    bi('It is live below. Open it, poke at it, and if it is worth fifteen minutes, pick a slot.', 'Está en vivo abajo. Ábrelo, pruébalo, y si vale quince minutos, elige un horario.'),
  ] };
  const faq: Section = { kind: 'faq', id: 'faq', headline: bi('Fair questions', 'Preguntas justas'), items: [
    { q: bi('Is this really built already?', '¿De verdad ya está construido?'), a: bi('Yes: the demo you open is the actual workspace, seeded with sample data in your industry. Your real data moves in during onboarding.', 'Sí: el demo que abres es el espacio real, con datos de muestra de tu industria. Tus datos reales entran en el onboarding.') },
    { q: bi('What does it cost?', '¿Cuánto cuesta?'), a: bi(`${usd(sav.our_price_monthly)} a month for a ${sav.price_band} plan, versus about ${usd(sav.monthly_current)} you pay today.`, `${usd(sav.our_price_monthly)} al mes en el plan ${sav.price_band}, frente a cerca de ${usd(sav.monthly_current)} que pagas hoy.`) },
    { q: bi('Do I have to migrate everything at once?', '¿Tengo que migrar todo de golpe?'), a: bi('No. Most teams switch one department a week and cancel tools as they go.', 'No. La mayoría cambia un departamento por semana y cancela herramientas sobre la marcha.') },
    // The switching objections (landing pass 3): all one objection in different clothes - cutting software we already depend on is risky.
    { q: bi('We are locked into annual contracts.', 'Tenemos contratos anuales.'), a: bi('Then the saving starts at renewal, not today. Cross out anything you cannot cancel this year in the audit and the number above recalculates on what is actually cancellable.', 'Entonces el ahorro empieza en la renovación, no hoy. Tacha en la auditoría lo que no puedas cancelar este año y el número de arriba se recalcula sobre lo que sí es cancelable.') },
    { q: bi('What happens to the data in a tool we drop?', '¿Qué pasa con los datos de una herramienta que dejamos?'), a: bi('You export it before anything is cancelled. Automatic import is not built yet - the honest answer today is that we list what has to move, with you, before you cancel a single subscription.', 'La exportas antes de cancelar nada. La importación automática todavía no existe: la respuesta honesta hoy es que listamos contigo lo que hay que mover antes de cancelar una sola suscripción.') },
    { q: bi('What if we switch and something breaks?', '¿Y si cambiamos y algo se rompe?'), a: bi('We never cancel anything - you do, one department at a time, and only once the same job is already running here. Until then both systems are live and the old one is your undo button.', 'Nosotros no cancelamos nada: lo haces tú, un departamento a la vez y solo cuando ese mismo trabajo ya funciona aquí. Mientras tanto ambos sistemas siguen activos y el viejo es tu botón de deshacer.') },
    { q: bi('My team will not learn another system.', 'Mi equipo no va a aprender otro sistema.'), a: bi('They learn one instead of six, and each person only sees their own view - the front desk screen has nothing on it but the front desk. Send them the link above and watch what they do with it before you decide.', 'Aprenden uno en vez de seis, y cada persona solo ve su vista: la pantalla de recepción no tiene nada más que recepción. Envíales el enlace de arriba y mira qué hacen con él antes de decidir.') },
  ] };
  const band: Section = { kind: 'cta_band', id: 'cta', headline: bi(`Open ${B}'s OS`, `Abre el OS de ${B}`), sub: bi('No form. Save your workspace when you want to keep it.', 'Sin formularios. Guarda tu espacio cuando quieras conservarlo.'), urgency: bi('Your workspace is live for 14 days.', 'Tu espacio está activo por 14 días.') };
  const booking: Section = { kind: 'booking_inline', id: 'book', durationMin: 15, headline: bi('Or walk through it with us', 'O recórrelo con nosotros'), sub: bi('15 minutes, your screen, your questions.', '15 minutos, tu pantalla, tus preguntas.') };

  const order: Record<Archetype, Section[]> = {
    reveal: [hero, savingsSec, rolesSec, proof, faq, band, booking],
    audit: [{ ...hero, headline: bi(`${B} is paying about ${usd(sav.monthly_current)} a month for tools that do not talk to each other.`, `${B} paga cerca de ${usd(sav.monthly_current)} al mes por herramientas que no se hablan.`) }, audit, savingsSec, rolesSec, proof, faq, band, booking],
    walkthrough: [{ ...hero, headline: bi(`This is Tuesday at ${B}, next week.`, `Así es un martes en ${B}, la próxima semana.`) }, steps, rolesSec, savingsSec, faq, { ...band, headline: bi('Make it next Tuesday', 'Que sea el próximo martes') }, booking],
    letter: [letter, hero, faq, band, booking],
  };
  return { archetype, prospectId: p.id, slug, palette: p.style.palette, tone: p.style.tone, font: p.style.font, sections: order[archetype], tracking: { pageId }, expiresAt: opts.expiresAt ?? null,
    cta: { primary: { label: bi('Open your demo', 'Abre tu demo'), to: demo }, secondary: { label: bi('Book a 15-min walkthrough', 'Agenda un recorrido de 15 min'), to: book } } };
}
