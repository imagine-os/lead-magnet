import { createElement as h } from 'react';
import type { RouteDef } from '../../specs/types';
import { EVERYONE } from '../../auth/roles';
import { DemoHomePage, RoleHomePage } from './RoleHomePage';
import { DepartmentsPage } from './DepartmentsPage';
import { CommsPage } from './CommsPage';
import { MoneyPage } from './MoneyPage';
import { LifePage } from './LifePage';
import { SettingsPage } from './SettingsPage';
import { c01, c02, c03, c04, c05, c06, c07 } from './specs';

export const routes: RouteDef[] = [
  { path: '/demo/:prospectId', element: h(DemoHomePage), spec: c01, roles: EVERYONE, surface: 'demo' },
  { path: '/demo/:prospectId/role/:role', element: h(RoleHomePage), spec: c02, roles: EVERYONE, surface: 'demo' },
  { path: '/demo/:prospectId/departments', element: h(DepartmentsPage), spec: c03, roles: EVERYONE, surface: 'demo' },
  { path: '/demo/:prospectId/comms', element: h(CommsPage), spec: c04, roles: EVERYONE, surface: 'demo' },
  { path: '/demo/:prospectId/money', element: h(MoneyPage), spec: c05, roles: EVERYONE, surface: 'demo' },
  { path: '/demo/:prospectId/life', element: h(LifePage), spec: c06, roles: EVERYONE, surface: 'demo' },
  { path: '/demo/:prospectId/settings', element: h(SettingsPage), spec: c07, roles: EVERYONE, surface: 'demo' },
];

export const strings = {
  // chrome
  'demo.skip': { en: 'Skip to content', es: 'Saltar al contenido' },
  'demo.nav_label': { en: 'Workspace sections', es: 'Secciones del espacio' },
  'demo.nav_home': { en: 'Home', es: 'Inicio' }, 'demo.nav_depts': { en: 'Departments', es: 'Departamentos' }, 'demo.nav_comms': { en: 'Comms', es: 'Comunicación' },
  'demo.nav_money': { en: 'Money', es: 'Dinero' }, 'demo.nav_life': { en: 'Life', es: 'Vida' }, 'demo.nav_settings': { en: 'Settings', es: 'Ajustes' },
  'demo.viewing_as': { en: 'Viewing as', es: 'Viendo como' },
  'demo.group_biz': { en: 'Business', es: 'Negocio' }, 'demo.group_life': { en: 'Life', es: 'Vida' },
  'demo.book': { en: 'Book a walkthrough', es: 'Agendar recorrido' }, 'demo.save': { en: 'Save your workspace', es: 'Guardar tu espacio' }, 'demo.saved': { en: 'Workspace saved', es: 'Espacio guardado' },
  'demo.share': { en: 'Share this view', es: 'Compartir esta vista' },
  'demo.share_copied': { en: 'Link copied', es: 'Enlace copiado' },
  'demo.share_manual': { en: 'Copy this link', es: 'Copia este enlace' },
  'demo.share_manual_body': { en: 'Your browser did not let us copy it. Select the link and copy it by hand.', es: 'Tu navegador no nos dejó copiarlo. Selecciona el enlace y cópialo a mano.' },
  'demo.share_close': { en: 'Close', es: 'Cerrar' },
  'demo.side_foot': { en: '{business} runs on one system. Nothing here is a mockup you cannot click.', es: '{business} funciona en un solo sistema. Aquí nada es una maqueta que no puedas tocar.' },
  'demo.save_title': { en: 'Keep {business}’s workspace', es: 'Conserva el espacio de {business}' },
  'demo.save_body': { en: 'You have already seen it work. Leave a name and email and this exact workspace stays yours — no setup call needed first.', es: 'Ya lo viste funcionar. Deja tu nombre y correo y este espacio se queda contigo: sin llamada previa.' },
  'demo.save_submit': { en: 'Save it', es: 'Guardarlo' }, 'demo.cancel': { en: 'Not now', es: 'Ahora no' },
  'demo.name': { en: 'Your name', es: 'Tu nombre' }, 'demo.email': { en: 'Email', es: 'Correo' }, 'demo.email_hint': { en: 'Only used to send you the link back.', es: 'Solo para reenviarte el enlace.' },
  'demo.save_done': { en: 'We have it', es: 'Lo tenemos' }, 'demo.save_done_body': { en: 'The link in your address bar opens this exact workspace — share it with anyone. Real accounts land with sign-in.', es: 'El enlace de tu barra de direcciones abre este mismo espacio: compártelo con quien quieras. Las cuentas reales llegan con el inicio de sesión.' },
  'demo.save_note': { en: 'Nothing is stored yet: this tells us you want it and keeps your link. Accounts arrive with real sign-in.', es: 'Todavía no guardamos nada: esto nos dice que lo quieres y conserva tu enlace. Las cuentas llegan con el inicio de sesión real.' },
  'demo.unknown_title': { en: 'We do not have that workspace', es: 'No tenemos ese espacio' },
  'demo.unknown_body': { en: 'The link may be old or mistyped. Open the hub to pick a workspace.', es: 'El enlace puede estar viejo o mal escrito. Abre el hub para elegir un espacio.' },
  'demo.to_hub': { en: 'Back to the hub', es: 'Volver al hub' },
  // role home
  'demo.hero_sub': { en: 'Everything {business} does in {city}, in one place — already set up, already yours.', es: 'Todo lo que hace {business} en {city}, en un solo lugar: ya configurado, ya tuyo.' },
  'demo.other_roles': { en: 'Other people in this business', es: 'Otras personas del negocio' },
  'demo.today': { en: 'Today', es: 'Hoy' },
  'demo.quick': { en: 'Quick actions', es: 'Acciones rápidas' }, 'demo.quick_sub': { en: 'The four things this role does most.', es: 'Las cuatro cosas que más hace este rol.' },
  'demo.widgets': { en: 'Your view', es: 'Tu vista' }, 'demo.widgets_sub': { en: 'Built for {role} — every other person gets their own.', es: 'Hecha para {role}: cada persona tiene la suya.' },
  'demo.no_roles': { en: 'No roles yet', es: 'Aún no hay roles' }, 'demo.no_roles_body': { en: 'Add business or life roles to this prospect and the views appear.', es: 'Agrega roles de negocio o de vida y las vistas aparecen.' },
  // widgets
  'demo.open': { en: 'Open', es: 'Abrir' }, 'demo.item': { en: 'Item', es: 'Elemento' }, 'demo.value': { en: 'Value', es: 'Valor' },
  'demo.kind_kpi': { en: 'KPI', es: 'KPI' }, 'demo.kind_list': { en: 'List', es: 'Lista' }, 'demo.kind_calendar': { en: 'Calendar', es: 'Calendario' }, 'demo.kind_chat': { en: 'Chat', es: 'Chat' },
  'demo.kind_table': { en: 'Table', es: 'Tabla' }, 'demo.kind_chart': { en: 'Chart', es: 'Gráfica' }, 'demo.kind_doc': { en: 'Docs', es: 'Documentos' }, 'demo.kind_meter': { en: 'Meter', es: 'Medidor' },
  'demo.kpi_hint': { en: 'Live in your workspace', es: 'En vivo en tu espacio' },
  'demo.near_capacity': { en: 'near capacity', es: 'casi al tope' },
  'demo.now': { en: 'Now', es: 'Ahora' }, 'demo.queued': { en: 'Queued', es: 'En cola' }, 'demo.doc_edited': { en: 'edited today', es: 'editado hoy' }, 'demo.no_rows': { en: 'Nothing here yet', es: 'Aún no hay nada' },
  // departments
  'demo.depts': { en: 'Departments', es: 'Departamentos' }, 'demo.depts_sub': { en: 'How {business} is actually organised — people, work and one number each.', es: 'Cómo está organizado {business}: personas, trabajo y un número por área.' },
  'demo.open_items': { en: 'open', es: 'abiertos' }, 'demo.people': { en: 'People', es: 'Personas' },
  'demo.view_role': { en: 'View as {role}', es: 'Ver como {role}' }, 'demo.open_dept': { en: 'Open department', es: 'Abrir departamento' },
  'demo.depts_note': { en: 'Departments come from your industry, not from a template. Current role:', es: 'Los departamentos vienen de tu industria, no de una plantilla. Rol actual:' },
  // comms
  'demo.comms': { en: 'One inbox', es: 'Una sola bandeja' }, 'demo.comms_sub': { en: 'Calls, email, SMS and WhatsApp for {business} in one thread list.', es: 'Llamadas, correo, SMS y WhatsApp de {business} en una sola lista.' },
  'demo.ch_label': { en: 'Channel', es: 'Canal' }, 'demo.ch_all': { en: 'All', es: 'Todo' }, 'demo.ch_calls': { en: 'Calls', es: 'Llamadas' }, 'demo.ch_call': { en: 'Call', es: 'Llamada' },
  'demo.ch_email': { en: 'Email', es: 'Correo' }, 'demo.ch_sms': { en: 'SMS', es: 'SMS' }, 'demo.ch_whatsapp': { en: 'WhatsApp', es: 'WhatsApp' },
  'demo.threads': { en: 'Threads', es: 'Conversaciones' }, 'demo.new': { en: 'New', es: 'Nuevo' }, 'demo.one_inbox': { en: 'One inbox', es: 'Una bandeja' },
  'demo.composer': { en: 'Write a reply', es: 'Escribe una respuesta' }, 'demo.composer_ph': { en: 'Reply on the same channel they used…', es: 'Responde por el mismo canal que usaron…' },
  'demo.send': { en: 'Send', es: 'Enviar' }, 'demo.no_threads': { en: 'No messages on this channel', es: 'Sin mensajes en este canal' },
  // money
  'demo.money': { en: 'Money', es: 'Dinero' }, 'demo.money_sub': { en: 'What {business} pays for today, what it costs to replace it, and what came in.', es: 'Lo que paga {business} hoy, lo que cuesta reemplazarlo y lo que entró.' },
  'demo.cash_today': { en: 'Cash today', es: 'Efectivo hoy' }, 'demo.cash_hint': { en: 'Settled payments', es: 'Pagos liquidados' },
  'demo.stack_now': { en: 'Your stack today', es: 'Tu stack hoy' }, 'demo.tools_cut': { en: '{n} tools replaced', es: '{n} herramientas reemplazadas' },
  'demo.our_price': { en: 'This workspace', es: 'Este espacio' }, 'demo.band_starter': { en: 'Starter band', es: 'Plan starter' }, 'demo.band_team': { en: 'Team band', es: 'Plan equipo' }, 'demo.band_multi': { en: 'Multi-location band', es: 'Plan multi-sede' },
  'demo.net_year': { en: 'Net savings / year', es: 'Ahorro neto / año' }, 'demo.net_hint': { en: 'After paying for this', es: 'Después de pagar esto' },
  'demo.stack_title': { en: 'What you stop paying for', es: 'Lo que dejas de pagar' }, 'demo.stack_sub': { en: 'Crossed out, with what replaces it inside your workspace.', es: 'Tachado, con lo que lo reemplaza dentro de tu espacio.' },
  'demo.confirmed': { en: 'confirmed', es: 'confirmado' }, 'demo.guessed': { en: '{pct}% sure', es: '{pct}% de certeza' },
  'demo.savings_curve': { en: 'Savings, first six months', es: 'Ahorro, primeros seis meses' },
  'demo.payments': { en: 'Payments', es: 'Pagos' }, 'demo.payments_sub': { en: 'Today, on the same card reader and the same links.', es: 'Hoy, con la misma terminal y los mismos enlaces.' },
  'demo.customer': { en: 'Customer', es: 'Cliente' }, 'demo.kind': { en: 'Kind', es: 'Tipo' }, 'demo.method': { en: 'Method', es: 'Método' }, 'demo.amount': { en: 'Amount', es: 'Monto' }, 'demo.status': { en: 'Status', es: 'Estado' },
  'demo.pay_paid': { en: 'Paid', es: 'Pagado' }, 'demo.pay_pending': { en: 'Pending', es: 'Pendiente' }, 'demo.pay_failed': { en: 'Failed', es: 'Fallido' },
  'demo.payroll': { en: 'Payroll', es: 'Nómina' }, 'demo.payroll_sub': { en: 'Same system, same hours, no re-typing.', es: 'El mismo sistema, las mismas horas, sin re-capturar.' },
  'demo.payroll_run': { en: 'Run payroll for {n} people', es: 'Correr nómina para {n} personas' }, 'demo.payroll_note': { en: 'Hours come from the schedule already in this workspace.', es: 'Las horas vienen del horario que ya está en este espacio.' },
  'demo.run_payroll': { en: 'Run payroll', es: 'Correr nómina' },
  // life
  'demo.life': { en: 'Life', es: 'Vida' }, 'demo.life_sub': { en: 'The people around {first} get a view too — not a second app.', es: 'Las personas alrededor de {first} también tienen su vista, no otra app.' },
  'demo.life_people': { en: 'People in your life', es: 'Personas de tu vida' }, 'demo.widgets_n': { en: 'widgets', es: 'widgets' }, 'demo.open_view': { en: 'Open view', es: 'Abrir vista' },
  'demo.shared_cal': { en: 'Shared calendar', es: 'Calendario compartido' }, 'demo.shared_cal_sub': { en: 'Work and home on one week, so neither surprises the other.', es: 'Trabajo y casa en la misma semana, sin sorpresas.' },
  'demo.lists': { en: 'Shared lists', es: 'Listas compartidas' }, 'demo.lists_sub': { en: 'Everyone sees the same list, on any device.', es: 'Todos ven la misma lista, en cualquier dispositivo.' },
  'demo.shared': { en: 'shared', es: 'compartida' }, 'demo.add_item': { en: 'Add item', es: 'Agregar' },
  'demo.family_chat': { en: 'Family chat', es: 'Chat familiar' }, 'demo.family_chat_sub': { en: 'Same inbox, different circle.', es: 'La misma bandeja, otro círculo.' },
  'demo.no_life': { en: 'No life roles yet', es: 'Aún no hay roles de vida' }, 'demo.no_life_body': { en: 'Add a partner, kids or an accountant and each gets a view.', es: 'Agrega pareja, hijos o contador y cada uno tendrá su vista.' },
  // settings
  'demo.settings': { en: 'Settings', es: 'Ajustes' }, 'demo.settings_sub': { en: 'Roles, brand and language for {business}.', es: 'Roles, marca e idioma de {business}.' },
  'demo.roles_title': { en: 'Roles and permissions', es: 'Roles y permisos' }, 'demo.roles_sub': { en: '{n} people already have a view.', es: '{n} personas ya tienen su vista.' },
  'demo.role': { en: 'Role', es: 'Rol' }, 'demo.permissions': { en: 'Can do', es: 'Puede' }, 'demo.view': { en: 'View', es: 'Vista' }, 'demo.invite': { en: 'Invite', es: 'Invitar' },
  'demo.perm_all': { en: 'Everything, including money and roles', es: 'Todo, incluidos dinero y roles' },
  'demo.perm_staff': { en: 'Their own work, schedule and inbox', es: 'Su trabajo, horario y bandeja' },
  'demo.perm_life': { en: 'Shared calendar, lists and family chat', es: 'Calendario, listas y chat familiar' },
  'demo.perm_books': { en: 'Books, payroll and tax documents', es: 'Contabilidad, nómina y documentos fiscales' },
  'demo.brand': { en: 'Brand', es: 'Marca' }, 'demo.brand_sub': { en: 'Taken from your site and signage.', es: 'Tomada de tu sitio y tu señalización.' },
  'demo.font': { en: 'Typeface', es: 'Tipografía' }, 'demo.edit_brand': { en: 'Edit brand', es: 'Editar marca' },
  'demo.language': { en: 'Language', es: 'Idioma' }, 'demo.language_sub': { en: 'Every screen, both languages.', es: 'Todas las pantallas, en los dos idiomas.' },
  'demo.language_note': { en: 'Your team defaults to {lang}; anyone can switch their own.', es: 'Tu equipo usa {lang} por defecto; cada quien puede cambiar el suyo.' },
  'demo.data': { en: 'Your data', es: 'Tus datos' }, 'demo.data_sub': { en: 'It stays yours, exportable at any time.', es: 'Siguen siendo tuyos, exportables cuando quieras.' },
  'demo.export': { en: 'Export CSV', es: 'Exportar CSV' },
};
