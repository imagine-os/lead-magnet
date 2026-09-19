import { createElement as h } from 'react';
import type { RouteDef } from '../../specs/types';
import { EVERYONE } from '../../auth/roles';
import { HubPage } from './HubPage';
import { NoAccessPage } from './NoAccessPage';
import { hubSpec, noAccessSpec } from './specs';
export const routes: RouteDef[] = [
  { path: '/', element: h(HubPage), spec: hubSpec, roles: EVERYONE, surface: 'public' },
  { path: '/no-access', element: h(NoAccessPage), spec: noAccessSpec, roles: EVERYONE, surface: 'public' },
];
export const strings = {
  'hub.tagline': { en: 'Lead magnets that are already built', es: 'Lead magnets ya construidos' },
  'hub.light': { en: 'Switch to light', es: 'Modo claro' }, 'hub.dark': { en: 'Switch to dark', es: 'Modo oscuro' }, 'hub.devmode': { en: 'Dev mode', es: 'Modo dev' },
  'hub.h1': { en: 'Every prospect gets an operating system that is already theirs.', es: 'Cada prospecto recibe un sistema operativo que ya es suyo.' },
  'hub.h1_body': { en: 'Testing hub. Pick a role, open a prospect page, its OS demo, the studio that builds them, the analytics that track them, and the plan.', es: 'Hub de pruebas. Elige un rol, abre la página de un prospecto, su demo, el estudio que las construye, la analítica y el plan.' },
  'hub.phone_cap': { en: 'OS demo, live', es: 'Demo del OS, en vivo' },
  'hub.prospects': { en: 'Prospects and their pages', es: 'Prospectos y sus páginas' }, 'hub.prospects_body': { en: 'Seeded fictional prospects; four archetypes each', es: 'Prospectos ficticios; cuatro arquetipos cada uno' },
  'hub.savings_yr': { en: 'net savings / year', es: 'ahorro neto / año' }, 'hub.open_demo': { en: 'Open demo', es: 'Abrir demo' },
  'hub.surfaces': { en: 'Surfaces', es: 'Superficies' }, 'hub.needs_role': { en: 'needs role', es: 'requiere rol' },
  'hub.studio': { en: 'Studio', es: 'Estudio' }, 'hub.studio_body': { en: 'Prospects, AI intake, composer, assets, outreach', es: 'Prospectos, intake IA, compositor, assets, outreach' },
  'hub.admin': { en: 'Analytics', es: 'Analítica' }, 'hub.admin_body': { en: 'Funnel, events, outreach board, bookings', es: 'Embudo, eventos, outreach, reservas' },
  'hub.plan': { en: 'Plan', es: 'Plan' }, 'hub.plan_body': { en: 'Kanban, list, timeline with dependencies', es: 'Kanban, lista, línea de tiempo con dependencias' },
  'hub.proposal': { en: 'Client proposal', es: 'Propuesta al cliente' }, 'hub.proposal_body': { en: 'The full stack for one prospect', es: 'El stack completo para un prospecto' },
  'hub.site': { en: 'Our website', es: 'Nuestro sitio' }, 'hub.site_body': { en: 'Home, how it works, pricing + purchase', es: 'Inicio, cómo funciona, precios + compra' },
  'hub.docs': { en: 'Docs', es: 'Documentación' }, 'hub.docs_body': { en: 'Kanban, changelog, prompts, decisions, pages', es: 'Kanban, changelog, prompts, decisiones, páginas' },
  'hub.manual': { en: 'Ops manual', es: 'Manual de operaciones' }, 'hub.manual_body': { en: 'How we run it, EN/ES', es: 'Cómo lo operamos, EN/ES' },
  'hub.dev': { en: 'Dev tools', es: 'Herramientas dev' }, 'hub.dev_body': { en: 'Routes, components, tables, actions, rules, docs, canvas, QA, feedback', es: 'Rutas, componentes, tablas, acciones, reglas, docs, canvas, QA, feedback' },
  'hub.reset': { en: 'Reset demo data', es: 'Reiniciar datos demo' }, 'hub.reset_done': { en: 'Demo data reseeded', es: 'Datos demo reiniciados' },
  'hub.routes': { en: 'Routes', es: 'Rutas' }, 'hub.built': { en: 'built', es: 'construidas' }, 'hub.stubs': { en: 'stubs', es: 'pendientes' }, 'hub.tables': { en: 'Tables', es: 'Tablas' }, 'hub.rules': { en: 'rules', es: 'reglas' }, 'hub.components': { en: 'Components', es: 'Componentes' }, 'hub.plan_progress': { en: 'Plan', es: 'Plan' }, 'hub.tasks_done': { en: 'tasks done', es: 'tareas hechas' },
  'hub.noaccess_title': { en: 'That page is for another role', es: 'Esa página es para otro rol' }, 'hub.noaccess_body': { en: 'You are viewing as {role}. Until real auth lands, pick a role that can open it.', es: 'Estás viendo como {role}. Hasta que haya auth real, elige un rol que pueda abrirla.' },
  'hub.signin_as': { en: 'Sign in as {role}', es: 'Entrar como {role}' }, 'hub.back': { en: 'Back to the hub', es: 'Volver al hub' },
  'hub.tv_hint': { en: 'TV mode: arrow keys or a remote d-pad move the focus, Enter opens, Backspace goes back.', es: 'Modo TV: las flechas o el d-pad del control mueven el foco, Enter abre, Retroceso vuelve.' },
  // control.* : the CommandPalette (src/components/organism/CommandPalette) is mounted on every shell by ControlBridge; its
  // strings live here because the hub declares its actions (hub.openCommands, hub.voiceListen) and D-092 keeps every string in a module table.
  'control.title': { en: 'Commands', es: 'Comandos' }, 'control.open': { en: 'Commands', es: 'Comandos' }, 'control.shortcut': { en: 'Ctrl/Cmd + K', es: 'Ctrl/Cmd + K' },
  'control.placeholder': { en: 'Type or say what to do, e.g. "switch to dark mode"', es: 'Escribe o di qué hacer, p. ej. "cambia a modo oscuro"' },
  'control.speak': { en: 'Speak', es: 'Hablar' }, 'control.listening': { en: 'Listening…', es: 'Escuchando…' }, 'control.stop': { en: 'Stop', es: 'Detener' },
  'control.heard': { en: 'Heard: "{text}"', es: 'Escuché: "{text}"' },
  'control.unsupported': { en: 'voice not supported in this browser', es: 'voz no compatible con este navegador' },
  'control.denied': { en: 'Microphone access was denied. Allow it in the browser and try again.', es: 'Se denegó el micrófono. Permítelo en el navegador y vuelve a intentar.' },
  'control.gesture': { en: 'Press Speak to use the microphone.', es: 'Pulsa Hablar para usar el micrófono.' },
  'control.on_page': { en: 'On this page', es: 'En esta página' }, 'control.matches': { en: '{n} matches', es: '{n} coincidencias' },
  'control.no_match': { en: 'No action matches. Try the words of a button on screen.', es: 'Ninguna acción coincide. Prueba con las palabras de un botón en pantalla.' },
  'control.needs': { en: 'needs {permission}', es: 'requiere {permission}' }, 'control.any_role': { en: 'any role', es: 'cualquier rol' },
  'control.live': { en: 'live', es: 'activa' }, 'control.opens': { en: 'opens {page}', es: 'abre {page}' },
  'control.params': { en: 'Fill the blanks', es: 'Completa los datos' }, 'control.optional': { en: 'optional', es: 'opcional' },
  'control.run': { en: 'Run', es: 'Ejecutar' }, 'control.running': { en: 'Running…', es: 'Ejecutando…' },
  'control.result_ok': { en: 'Done', es: 'Hecho' }, 'control.result_fail': { en: 'Did not run', es: 'No se ejecutó' },
  'control.hint_keys': { en: 'Up / Down choose · Enter runs · Esc closes', es: 'Arriba / Abajo eligen · Enter ejecuta · Esc cierra' },
  'control.hidden_for_role': { en: '{n} more need another role', es: '{n} más requieren otro rol' },
};
