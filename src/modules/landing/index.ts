import { createElement as h } from 'react';
import type { RouteDef } from '../../specs/types';
import { EVERYONE } from '../../auth/roles';
import { LandingPage } from './LandingPage';
import { ExpiredPage } from './ExpiredPage';
import { OgCard } from './OgCard';
import { revealSpec, auditSpec, walkthroughSpec, letterSpec, expiredSpec, ogSpec } from './specs';

/** L-01..L-06. Public surface: these pages own their chrome, there is no app shell around them. */
export const routes: RouteDef[] = [
  // The default path follows the published row's archetype (reveal unless the strategist published something else),
  // which is what lets variant B be a different archetype; the three explicit paths always force theirs.
  { path: '/p/:slug', element: h(LandingPage, { archetype: 'reveal', pageCode: 'L-01', followRow: true }), spec: revealSpec, roles: EVERYONE, surface: 'public' },
  { path: '/p/:slug/audit', element: h(LandingPage, { archetype: 'audit', pageCode: 'L-02' }), spec: auditSpec, roles: EVERYONE, surface: 'public' },
  { path: '/p/:slug/story', element: h(LandingPage, { archetype: 'walkthrough', pageCode: 'L-03' }), spec: walkthroughSpec, roles: EVERYONE, surface: 'public' },
  { path: '/p/:slug/letter', element: h(LandingPage, { archetype: 'letter', pageCode: 'L-04' }), spec: letterSpec, roles: EVERYONE, surface: 'public' },
  { path: '/p/:slug/expired', element: h(ExpiredPage), spec: expiredSpec, roles: EVERYONE, surface: 'public' },
  // L-06 is the source of public/og/<slug>.jpg, not a page we send anyone to: no nav entry, no link from the page.
  { path: '/og/:slug', element: h(OgCard), spec: ogSpec, roles: EVERYONE, surface: 'public' },
];

export const strings = {
  'landing.loading': { en: 'Opening your workspace...', es: 'Abriendo tu espacio...' },
  'landing.skip': { en: 'Skip to the page', es: 'Saltar al contenido' },
  'landing.hero_meta': { en: 'Built for {business} in {city}. Sample data in your industry, your real data moves in during onboarding.', es: 'Hecho para {business} en {city}. Datos de muestra de tu industria; tus datos reales entran en el onboarding.' },

  // The two strongest facts, above the fold: where they are, and the thing their industry loses weeks to.
  'landing.facts_label': { en: 'What we already know about you', es: 'Lo que ya sabemos de ti' },
  'landing.fact_place': { en: '{city} · a team of {team}', es: '{city} · un equipo de {team}' },
  'landing.fact_place_multi': { en: '{city} · {locations} locations · a team of {team}', es: '{city} · {locations} sucursales · un equipo de {team}' },
  'landing.fact_pain': { en: 'Still true this week: {pain}', es: 'Todavía cierto esta semana: {pain}' },
  'landing.frames_alt': { en: '{business}\u2019s workspace, frame {n} of {total}: {label}', es: 'El espacio de {business}, cuadro {n} de {total}: {label}' },

  'landing.replaced_by': { en: 'replaced by {module}', es: 'reemplazado por {module}' },
  'landing.cancelled': { en: 'cancelled', es: 'cancelado' },
  'landing.confirmed': { en: 'Confirmed', es: 'Confirmado' },
  'landing.not_us': { en: 'Not us', es: 'No somos' },
  'landing.per_month': { en: '/mo', es: '/mes' },
  'landing.net_year': { en: 'Net savings a year', es: 'Ahorro neto al año' },
  'landing.vs_today': { en: '{now} a month today, {ours} with us', es: '{now} al mes hoy, {ours} con nosotros' },
  'landing.tools_cut': { en: 'Tools you can cancel', es: 'Herramientas que puedes cancelar' },
  'landing.tools_cut_hint': { en: 'One system replaces all of them', es: 'Un solo sistema las reemplaza' },
  'landing.cut_running': { en: 'Cancelled so far: {money} a month', es: 'Cancelado hasta aquí: {money} al mes' },
  'landing.cut_progress': { en: '{done} of {total} tools crossed off', es: '{done} de {total} herramientas tachadas' },
  'landing.savings_note': { en: 'Our guess from businesses your size. Correct it on the audit page and this number follows.', es: 'Nuestra estimación para negocios de tu tamaño. Corrígela en la página de auditoría y este número la sigue.' },
  'landing.see_it_instead': { en: 'See it instead of reading it', es: 'Míralo en vez de leerlo' },
  'landing.answered': { en: 'Answered', es: 'Respondidas' },
  'landing.answered_hint': { en: 'Every answer sharpens your OS', es: 'Cada respuesta afina tu OS' },
  'landing.audit_note': { en: 'Nothing to sign up for. Your answers only change your own workspace.', es: 'Sin registro. Tus respuestas solo cambian tu propio espacio.' },

  'landing.role_business': { en: 'Business', es: 'Negocio' },
  'landing.role_life': { en: 'Life', es: 'Vida' },
  'landing.try_as_role': { en: 'Try it as {role}', es: 'Pruébalo como {role}' },
  'landing.try_as_role_hint': { en: 'Opens the demo already switched to this view', es: 'Abre el demo ya cambiado a esta vista' },
  'landing.prev_role': { en: 'Previous role', es: 'Rol anterior' },
  'landing.next_role': { en: 'Next role', es: 'Rol siguiente' },
  'landing.prev': { en: 'Back', es: 'Atrás' },
  'landing.next': { en: 'Next', es: 'Siguiente' },
  'landing.story_end': { en: 'That is next Tuesday if we talk this week.', es: 'Eso es el próximo martes si hablamos esta semana.' },

  'landing.sample_badge': { en: 'Sample', es: 'Muestra' },
  'landing.sample_note': { en: 'We do not publish customer quotes yet, so this one is illustrative, not real.', es: 'Todavía no publicamos testimonios de clientes, así que este es ilustrativo, no real.' },
  'landing.sample_quote': { en: '"We cancelled six subscriptions in the first month and stopped re-typing the same booking three times."', es: '"Cancelamos seis suscripciones el primer mes y dejamos de re-escribir la misma reserva tres veces."' },
  'landing.sample_author': { en: 'Illustrative, a {industry} business of about your size', es: 'Ilustrativo, un negocio de {industry} de tu tamaño' },
  'landing.sample_head': { en: 'Sample, not a customer', es: 'Muestra, no un cliente' },
  'landing.see_case': { en: 'See the case study', es: 'Ver el caso' },
  'landing.play_note': { en: 'Play the 40-second note', es: 'Escuchar la nota de 40 s' },

  // Pass 3: per-role share links (playbook 5 - the prospect is rarely the only decision-maker)
  'landing.share_intro': { en: 'Each view has its own link. Send the manager theirs and they land in it, no login, no tour.', es: 'Cada vista tiene su propio enlace. Envía al encargado el suyo y entra directo, sin registro ni recorrido.' },
  'landing.share_role': { en: 'Send the {role} view', es: 'Enviar la vista de {role}' },
  'landing.share_role_hint': { en: 'Copies a link that opens the demo already in this view', es: 'Copia un enlace que abre el demo ya en esta vista' },
  'landing.share_copied': { en: 'Copied. Paste it to your {role} - the link opens straight into their view.', es: 'Copiado. Pégalo a tu {role}: el enlace abre directo en su vista.' },
  'landing.share_manual': { en: 'Your browser did not allow the copy. The link is selected - press Ctrl / Cmd + C.', es: 'Tu navegador no permitió copiar. El enlace está seleccionado: presiona Ctrl / Cmd + C.' },

  // Pass 3: honest expiry next to every CTA, never a countdown
  'landing.live_until': { en: 'Live until {date} - {days} days left. No countdown, no pressure: that is just when we take it down.', es: 'Activo hasta el {date}: quedan {days} días. Sin cuenta regresiva ni presión: simplemente es cuando lo retiramos.' },
  'landing.sticky_days': { en: 'live {days} more days', es: 'activo {days} días más' },
  'landing.close': { en: 'Close', es: 'Cerrar' },

  // Pass 3: the savings number is correctable from every archetype
  'landing.correct_stack': { en: 'These numbers wrong? Fix them', es: '¿Los números están mal? Corrígelos' },

  // Pass 3: the audit answer is reversible, and it says what each answer does
  'landing.audit_how': { en: 'Tap No and the tool leaves your stack and the savings number drops. Tap the same answer again to undo it. Nothing is saved to us.', es: 'Toca No y la herramienta sale de tu stack y el ahorro baja. Toca la misma respuesta otra vez para deshacer. No nos guardamos nada.' },
  'landing.audit_undo': { en: 'Tap again to undo this answer', es: 'Toca otra vez para deshacer' },
  'landing.audit_guess': { en: 'Our guess', es: 'Estimación' },
  'landing.audit_rejected_note': { en: '{n} lines you told us were wrong are already out of the number above.', es: '{n} líneas que marcaste como incorrectas ya salieron del número de arriba.' },

  // Pass 3: proof you can check in two minutes, in place of five invented logo marks
  'landing.check_head': { en: 'Three things you can check in the next two minutes', es: 'Tres cosas que puedes comprobar en dos minutos' },
  'landing.check_demo': { en: 'Open the demo and click anything. It is the running product, not a video or a slide.', es: 'Abre el demo y toca lo que quieras. Es el producto funcionando, no un video ni una diapositiva.' },
  'landing.check_stack': { en: 'Cross out any of the {tools} tools we guessed. The savings number follows you, not us.', es: 'Tacha cualquiera de las {tools} herramientas que adivinamos. El ahorro te sigue a ti, no a nosotros.' },
  'landing.check_expiry': { en: 'This page really comes down on {date}. Come back after and you get a plain explanation, not a 404.', es: 'Esta página realmente se retira el {date}. Si vuelves después verás una explicación, no un error 404.' },
  'landing.check_expiry_none': { en: 'This page has no expiry date, and we say so rather than inventing a deadline.', es: 'Esta página no tiene fecha de expiración, y lo decimos en vez de inventar un plazo.' },

  // Pass 3: the objection nobody says out loud - cutting software we already depend on is risky

  'landing.urgency_badge': { en: 'Honest urgency', es: 'Urgencia honesta' },
  'landing.urgency_real': { en: 'Your workspace stays live for {days} more days, until {date}. After that this link shows a request form, not a 404.', es: 'Tu espacio sigue activo {days} días más, hasta el {date}. Después este enlace muestra un formulario, no un error 404.' },
  'landing.duration': { en: '{min} minutes', es: '{min} minutos' },
  'landing.book_tz': { en: 'times in {tz}', es: 'horas en {tz}' },
  'landing.closed_day': { en: 'closed', es: 'cerrado' },
  'landing.slots_free': { en: '{n} free', es: '{n} libres' },
  'landing.no_slots': { en: 'ask us for a time', es: 'pídenos una hora' },
  'landing.book_note': { en: 'Picking a time opens the booking page with that slot ready; nothing is booked until you confirm there.', es: 'Elegir una hora abre la página de reserva con ese horario listo; nada se reserva hasta que confirmes ahí.' },

  'landing.foot_built': { en: 'Built for {business} by Imagine.', es: 'Hecho para {business} por Imagine.' },
  'landing.foot_expiry': { en: 'This workspace is live for {days} more days', es: 'Este espacio está activo {days} días más' },
  'landing.foot_no_expiry': { en: 'This workspace has no expiry date', es: 'Este espacio no tiene fecha de expiración' },
  'landing.save_cta': { en: 'Save your workspace', es: 'Guarda tu espacio' },

  'landing.exit_title': { en: 'One thing before you go, {first}', es: 'Una cosa antes de irte, {first}' },
  'landing.exit_body': { en: 'Fifteen minutes on a call and we will walk through {business}\'s workspace together, on your screen, with your questions. No deck.', es: 'Quince minutos en una llamada y recorremos juntos el espacio de {business}, en tu pantalla, con tus preguntas. Sin presentación.' },
  'landing.exit_stay': { en: 'Keep looking', es: 'Seguir viendo' },
  'landing.exit_pick': { en: 'Pick a time and we will be there', es: 'Elige una hora y ahí estaremos' },
  'landing.exit_none': { en: 'No free times this week - book a call and we will find one.', es: 'Sin horas libres esta semana: agenda y buscamos una.' },
  'landing.sticky_savings': { en: 'Save {money} a year', es: 'Ahorra {money} al año' },

  'landing.save_title': { en: 'Save your workspace', es: 'Guarda tu espacio' },
  'landing.save_body': { en: 'Name and email only, so we can send you the link before it expires in {days} days. The demo stays open either way.', es: 'Solo nombre y correo, para enviarte el enlace antes de que expire en {days} días. El demo sigue abierto de cualquier forma.' },
  'landing.save_name': { en: 'Your name', es: 'Tu nombre' },
  'landing.save_email': { en: 'Email', es: 'Correo' },
  'landing.save_email_err': { en: 'That does not look like an email address.', es: 'Eso no parece un correo electrónico.' },
  'landing.save_submit': { en: 'Save it', es: 'Guardar' },
  'landing.save_later': { en: 'Later', es: 'Después' },
  'landing.save_done': { en: 'Saved', es: 'Guardado' },
  'landing.save_done_body': { en: 'We will send the link before the {days} days are up.', es: 'Te enviaremos el enlace antes de que pasen los {days} días.' },

  'landing.expired_eyebrow': { en: 'This link has expired', es: 'Este enlace expiró' },
  'landing.expired_h1': { en: '{business}\'s workspace has been taken down.', es: 'El espacio de {business} ya no está activo.' },
  'landing.expired_h1_unknown': { en: 'We do not recognise this workspace link.', es: 'No reconocemos este enlace de espacio.' },
  'landing.expired_body': { en: 'We build every workspace for one business and keep it live for 14 days. Yours is past that, so it is gone rather than sitting there going stale. Ask and we will rebuild it today.', es: 'Construimos cada espacio para un solo negocio y lo mantenemos activo 14 días. El tuyo ya pasó ese plazo, así que lo retiramos en vez de dejarlo envejecer. Pídelo y lo reconstruimos hoy.' },
  'landing.expired_form_title': { en: 'Request a fresh workspace', es: 'Pide un espacio nuevo' },
  'landing.expired_note': { en: 'Anything you want changed?', es: '¿Algo que quieras cambiar?' },
  'landing.expired_note_hint': { en: 'Optional. Tools we got wrong, roles we missed, colours.', es: 'Opcional. Herramientas mal adivinadas, roles que faltan, colores.' },
  'landing.expired_request': { en: 'Request a fresh workspace', es: 'Pedir un espacio nuevo' },
  'landing.expired_book': { en: 'Book a call', es: 'Agendar una llamada' },
  'landing.expired_sent': { en: 'Request received', es: 'Solicitud recibida' },
  'landing.expired_sent_body': { en: 'A strategist sees this in the studio inbox and rebuilds the workspace, usually the same day.', es: 'Un estratega lo ve en la bandeja del estudio y reconstruye el espacio, normalmente el mismo día.' },
  'landing.expired_on': { en: 'It came down on {date}, exactly when the page said it would.', es: 'Se retiró el {date}, exactamente cuando la página dijo que lo haría.' },
  'landing.expired_second': { en: 'The faster way back in', es: 'La forma más rápida de volver a entrar' },
  'landing.expired_second_note': { en: 'Fifteen minutes on a call and we rebuild it live with you, with the tools and roles we got wrong already fixed.', es: 'Quince minutos en una llamada y lo reconstruimos en vivo contigo, ya con las herramientas y los roles que adivinamos mal corregidos.' },
  'landing.expired_foot': { en: 'Not sure what this is?', es: '¿No sabes qué es esto?' },
  'landing.expired_site': { en: 'See what we build', es: 'Mira lo que construimos' },

  // L-06, the social card
  'landing.og_sub': { en: 'Already built. Open it, no form.', es: 'Ya construido. Ábrelo, sin formularios.' },
  'landing.og_fallback_h': { en: 'We already built {business}\u2019s operating system.', es: 'Ya construimos el sistema operativo de {business}.' },
  'landing.og_unknown': { en: 'Imagine builds the system before the call.', es: 'Imagine construye el sistema antes de la llamada.' },
  'landing.og_unknown_body': { en: 'No workspace matches "{slug}", so this is the generic card.', es: 'Ningún espacio coincide con "{slug}", así que esta es la tarjeta genérica.' },
  'landing.og_cap': { en: 'This card is the source of public/og/<slug>.jpg (npm run og). The landing page points og:image at that file.', es: 'Esta tarjeta es el origen de public/og/<slug>.jpg (npm run og). La página apunta og:image a ese archivo.' },
  'landing.og_open': { en: 'Open the page', es: 'Abrir la página' },
};
