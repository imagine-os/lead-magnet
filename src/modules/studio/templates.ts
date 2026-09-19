import type { Bi } from '../../engine';
import type { CHANNELS } from '../../data/schema/core';

export type Channel = (typeof CHANNELS)[number];
export interface Template { id: string; channel: Channel; name: Bi; subject: Bi; body: Bi }

const T = (id: string, channel: Channel, name: Bi, subject: Bi, body: Bi): Template => ({ id, channel, name, subject, body });
const bi = (en: string, es: string): Bi => ({ en, es });

/**
 * Two to three templates per channel, EN + ES, written against the playbook: the workspace already exists, the money is
 * concrete, the demo is never gated, one primary ask. Tokens: {first_name} {business} {city} {industry} {savings_annual}
 * {tools_cut} {page_url}.
 */
export const TEMPLATES: Template[] = [
  T('cold_email_built', 'cold_email',
    bi('Already built', 'Ya construido'),
    bi("We already built {business}'s operating system", 'Ya construimos el sistema operativo de {business}'),
    bi(`{first_name},

We build one operating system per business and then show it, so here is yours: {page_url}

It is {business} - your colours, your roles, your {industry} workflow - and it replaces about {tools_cut} tools you pay for today, roughly {savings_annual} a year.

No form, no demo request. Click it and open the thing. If it is wrong, tell me what to fix and I will rebuild it.

- Imagine`,
      `{first_name}:

Construimos un sistema operativo por negocio y luego lo mostramos, así que aquí está el tuyo: {page_url}

Es {business} - tus colores, tus roles, tu flujo de {industry} - y reemplaza unas {tools_cut} herramientas que pagas hoy, cerca de {savings_annual} al año.

Sin formulario, sin pedir demo. Ábrelo. Si algo está mal, dime qué corregir y lo reconstruyo.

- Imagine`)),
  T('cold_email_money', 'cold_email',
    bi('The money first', 'El dinero primero'),
    bi('{business} is paying for {tools_cut} tools it can stop paying for', '{business} paga {tools_cut} herramientas que puede dejar de pagar'),
    bi(`{first_name},

Best guess from other {industry} businesses your size in {city}: {tools_cut} subscriptions, about {savings_annual} a year once they are one system.

I put the list on a page with your name on it so you can cross out what is wrong: {page_url}

The number updates as you correct it. If the list is right, the walkthrough is 15 minutes.

- Imagine`,
      `{first_name}:

Estimación a partir de otros negocios de {industry} de tu tamaño en {city}: {tools_cut} suscripciones, cerca de {savings_annual} al año una vez que son un solo sistema.

Puse la lista en una página con tu nombre para que taches lo que no aplique: {page_url}

El número se actualiza mientras corriges. Si la lista es correcta, el recorrido dura 15 minutos.

- Imagine`)),
  T('cold_email_tuesday', 'cold_email',
    bi('A day next week', 'Un día de la próxima semana'),
    bi('What Tuesday looks like at {business} with one system', 'Cómo sería el martes en {business} con un solo sistema'),
    bi(`{first_name},

I wrote out a Tuesday at {business} - front desk, floor, money, your phone at 7pm - inside a working system built for you: {page_url}

Every role has its own view. It is live for 14 days.

- Imagine`,
      `{first_name}:

Escribí cómo sería un martes en {business} - recepción, operación, finanzas, tu teléfono a las 7pm - dentro de un sistema real hecho para ti: {page_url}

Cada rol tiene su vista. Está disponible 14 días.

- Imagine`)),

  T('linkedin_short', 'linkedin_dm',
    bi('Short DM', 'DM corto'),
    bi('{business} operating system', 'Sistema operativo de {business}'),
    bi(`{first_name} - we built {business} an operating system before asking for anything: {page_url}

Your palette, your roles, replaces ~{tools_cut} tools (~{savings_annual}/yr). Open it, no form.`,
      `{first_name}: construimos un sistema operativo para {business} antes de pedir nada: {page_url}

Tus colores, tus roles, reemplaza ~{tools_cut} herramientas (~{savings_annual}/año). Ábrelo, sin formulario.`)),
  T('linkedin_proof', 'linkedin_dm',
    bi('With the number', 'Con el número'),
    bi('{savings_annual} a year at {business}', '{savings_annual} al año en {business}'),
    bi(`{first_name}, quick one: {tools_cut} tools most {industry} teams in {city} pay for add up to about {savings_annual} a year.

I built the replacement as {business} and left it here for 14 days: {page_url}`,
      `{first_name}, rápido: las {tools_cut} herramientas que paga la mayoría de equipos de {industry} en {city} suman cerca de {savings_annual} al año.

Construí el reemplazo como {business} y lo dejé aquí 14 días: {page_url}`)),

  T('whatsapp_hi', 'whatsapp',
    bi('Friendly', 'Cercano'),
    bi('{business} demo', 'Demo de {business}'),
    bi(`Hi {first_name} - Imagine here. We built {business} a working operating system (your colours and roles): {page_url}

Have a look on your phone, it is built for it. Happy to walk you through it for 15 minutes if it is useful.`,
      `Hola {first_name}, soy Imagine. Construimos para {business} un sistema operativo funcional (tus colores y roles): {page_url}

Míralo en el teléfono, está hecho para eso. Con gusto te lo muestro en 15 minutos si te sirve.`)),
  T('whatsapp_money', 'whatsapp',
    bi('The number', 'El número'),
    bi('{savings_annual}/yr', '{savings_annual}/año'),
    bi(`{first_name}: {tools_cut} tools, about {savings_annual} a year. Here is the one system that replaces them, already themed as {business}: {page_url}`,
      `{first_name}: {tools_cut} herramientas, cerca de {savings_annual} al año. Este es el sistema que las reemplaza, ya con la marca de {business}: {page_url}`)),

  T('sms_short', 'sms',
    bi('One line', 'Una línea'),
    bi('{business}', '{business}'),
    bi(`{first_name}, we built {business} an operating system - yours to open, no form: {page_url} (live 14 days)`,
      `{first_name}, construimos un sistema operativo para {business}, ábrelo sin formulario: {page_url} (14 días)`)),
  T('sms_followup', 'sms',
    bi('Follow-up', 'Seguimiento'),
    bi('{business} follow-up', 'Seguimiento {business}'),
    bi(`{first_name} - the {business} workspace expires soon. If the tool list is right it is about {savings_annual} a year: {page_url}`,
      `{first_name}: el espacio de {business} vence pronto. Si la lista de herramientas es correcta son cerca de {savings_annual} al año: {page_url}`)),

  T('call_opener', 'call',
    bi('Opener', 'Apertura'),
    bi('Call opener - {business}', 'Apertura de llamada - {business}'),
    bi(`"{first_name}? This is Imagine. Odd reason for the call: we already built {business} an operating system and it is sitting on a link. Your colours, your roles, the {industry} workflow. It replaces about {tools_cut} tools, roughly {savings_annual} a year. Can I send you the link while we talk? {page_url}"`,
      `"¿{first_name}? Habla Imagine. Motivo raro para llamar: ya construimos un sistema operativo para {business} y está en un enlace. Tus colores, tus roles, el flujo de {industry}. Reemplaza unas {tools_cut} herramientas, cerca de {savings_annual} al año. ¿Te mando el enlace mientras hablamos? {page_url}"`)),
  T('call_voicemail', 'call',
    bi('Voicemail', 'Buzón de voz'),
    bi('Voicemail - {business}', 'Buzón - {business}'),
    bi(`"{first_name}, Imagine. We built {business} a working system and left it at the link I am texting you now - {page_url}. It is live for 14 days, no form. Call back if it is close."`,
      `"{first_name}, soy Imagine. Construimos un sistema para {business} y lo dejé en el enlace que te mando por mensaje: {page_url}. Está activo 14 días, sin formulario. Llámame si se acerca."`)),

  T('warm_intro_ask', 'warm_intro',
    bi('Intro request', 'Pedido de presentación'),
    bi('Intro to {first_name} at {business}?', '¿Me presentas a {first_name} de {business}?'),
    bi(`Would you introduce me to {first_name} at {business}?

We already built their operating system - {page_url} - themed to them, replacing about {tools_cut} tools (~{savings_annual}/yr). Nothing to sign, they just open it.

Forwardable blurb below.`,
      `¿Me presentas a {first_name} de {business}?

Ya construimos su sistema operativo - {page_url} - con su marca, reemplazando unas {tools_cut} herramientas (~{savings_annual}/año). No hay nada que firmar, solo lo abre.

Abajo un texto para reenviar.`)),
  T('warm_intro_forward', 'warm_intro',
    bi('Forwardable', 'Para reenviar'),
    bi('For {first_name}', 'Para {first_name}'),
    bi(`{first_name} - Imagine built an operating system for {business} before asking for a meeting: {page_url}

It is your branding, your roles and the {industry} workflow, and it replaces about {tools_cut} tools (~{savings_annual} a year). Worth 3 minutes on your phone.`,
      `{first_name}: Imagine construyó un sistema operativo para {business} antes de pedir una reunión: {page_url}

Es tu marca, tus roles y el flujo de {industry}, y reemplaza unas {tools_cut} herramientas (~{savings_annual} al año). Vale 3 minutos en el teléfono.`)),
];

export const templatesFor = (channel: Channel) => TEMPLATES.filter((x) => x.channel === channel);
/** Fills {token} placeholders; unknown tokens are left visible so nobody sends a half-written message by accident. */
export const fillTokens = (text: string, tokens: Record<string, string>) => text.replace(/\{(\w+)\}/g, (m, k: string) => tokens[k] ?? m);
