import type { Industry, StackItem, SubIndustry, Kpi } from '../types';
/** `SubIndustry` moved to `../types` in 0.5.0 (the D-063 changelog asked for the augmentation to be folded in once a pass touched the foundation file); re-exported so `import { SubIndustry } from './catalog/industries'` keeps working. */
export type { SubIndustry } from '../types';

/** One catalog entry before its key is injected; the key is the property name, so a module worker adds an industry by adding a property here and nowhere else. */
type IndustryDef = Omit<Industry, 'key'>;

/** Catalog pass reviewed every list price below on this date (D-063); see docs/reference/catalog.md. */
const PRICE_REVIEWED = '2026-09-19';
/** The reference-systems pass (2026-09-20) added the tools the Hoy / CTL / Petrock repos name; their prices are Lead Magnet estimates until the next catalog pass reviews them (`price_source_note` says so on each). */
const REF_REVIEWED = '2026-09-20';
const s = (tool: string, category: string, monthly_cost: number, replaced_by: string, prevalence = 0.7, extra: Partial<StackItem> = {}): StackItem => ({ tool, category, monthly_cost, replaced_by, prevalence, price_reviewed: PRICE_REVIEWED, ...extra });
/** A tool named by one of the reference repos: dated 2026-09-20, price marked as an estimate. */
const ref = (tool: string, category: string, monthly_cost: number, replaced_by: string, prevalence: number, note: string, extra: Partial<StackItem> = {}): StackItem => s(tool, category, monthly_cost, replaced_by, prevalence, { price_reviewed: REF_REVIEWED, price_source_note: `Estimate (reference-systems pass, 2026-09-20): ${note}`, ...extra });
const bi = (en: string, es: string) => ({ en, es });
const kpi = (en: string, es: string, sample: string): Kpi => ({ label: bi(en, es), sample });
const sub = (key: string, en: string, es: string, extra: Partial<SubIndustry> = {}): SubIndustry => ({ key, name: { en, es }, ...extra });
/** Shared tools most small businesses pay for. Prices are plausible list prices (USD / month) in 2026. */
const COMMON: StackItem[] = [
  s('Google Workspace', 'Email & files', 14, 'Mail & Docs', 0.85, { per_seat: true }),
  s('QuickBooks Online', 'Accounting', 90, 'Money', 0.8),
  s('Calendly', 'Scheduling', 12, 'Calendar', 0.5, { per_seat: true }),
  s('DocuSign', 'E-sign', 45, 'Sign', 0.45),
  s('Mailchimp', 'Email marketing', 60, 'Campaigns', 0.6),
  s('Canva Pro', 'Design', 15, 'Studio', 0.55),
  s('Slack', 'Team chat', 8.75, 'Chat', 0.4, { per_seat: true }),
  s('Zoom', 'Video calls', 16, 'Calls & video', 0.5),
  s('RingCentral', 'Phone system', 30, 'Calls', 0.4, { per_seat: true }),
  s('Dropbox', 'File storage', 20, 'Files', 0.3),
];

/** Pains and motifs shared by an industry and its reference-depth sub (the sub extends, never re-types, so the two cannot drift). */
const PET_PAINS = [bi('Vaccine records chased by hand', 'Certificados de vacunas a mano'), bi('Double bookings on busy weekends', 'Reservas dobles los fines de semana'), bi('Report cards texted from personal phones', 'Reportes desde celulares personales')];
const PET_MOTIFS = ['happy dogs mid-play', 'sunlit play yard', 'grooming table', 'report card on a phone'];
const LAW_PAINS = [bi('Intake calls not logged', 'Llamadas de admisión sin registro'), bi('Unbilled hours', 'Horas sin facturar'), bi('Documents drafted from old templates', 'Documentos de plantillas viejas')];
const LAW_MOTIFS = ['quiet office library', 'partner reviewing on a tablet', 'matter timeline', 'signature ceremony'];
const GYM_PAINS = [bi('Members churn silently', 'Los miembros se van en silencio'), bi('Waitlists managed by text', 'Listas de espera por mensaje'), bi('Coaches on a separate app', 'Los coaches en otra app')];
const GYM_MOTIFS = ['sunrise class', 'coach with tablet', 'member check-in screen', 'community wall'];

const DEFS = {
  pet_care: {
    label: bi('Pet care (daycare, boarding, grooming)', 'Cuidado de mascotas (guardería, hotel, peluquería)'),
    departments: [bi('Front desk', 'Recepción'), bi('Daycare floor', 'Guardería'), bi('Grooming', 'Peluquería'), bi('Boarding', 'Hospedaje'), bi('Marketing', 'Marketing'), bi('Money', 'Finanzas')],
    business_roles: ['owner', 'manager', 'front desk', 'handler', 'groomer'], life_roles: ['owner', 'spouse/partner', 'kids', 'accountant', 'vet partner'],
    stack: [s('Gingr', 'Pet software', 165, 'Bookings & pets', 0.7, { per_location: true }), s('PetExec', 'Pet software', 129, 'Bookings & pets', 0.3, { per_location: true }), s('Homebase', 'Scheduling & payroll', 24.95, 'Team', 0.6, { per_location: true }), s('Square', 'Payments', 60, 'Payments', 0.7),
      // Reference-systems pass (Petrock): the vendors the repo names. Industry-wide they are second choices (under RARE_PREVALENCE, so a 9-person daycare is asked, not billed); the dog_hotel_spa sub raises them.
      ref('Squarespace', 'Website', 23, 'Website', 0.25, 'Squarespace Business plan, billed annually; the reference repo names the vendor.'),
      ref('PetLinx', 'Pet software', 69, 'Bookings & pets', 0.15, 'desktop licence sold per site plus a support plan; $69 / location approximates the plan, the licence itself is one-time.', { per_location: true }),
      ref('Time To Pet', 'Pet software', 45, 'Bookings & pets', 0.1, 'Time To Pet Solo / Team plans; second-choice product for hotels that also walk or sit.'),
      ref('Yelp Ads', 'Reviews & ads', 150, 'Reviews', 0.25, 'ad budget, not a subscription; $150 is a typical small-business monthly floor.'),
      ...COMMON],
    pains: PET_PAINS,
    kpis: [kpi('Dogs in today', 'Perros hoy', '42'), kpi('Occupancy', 'Ocupación', '86%'), kpi('Vaccines expiring', 'Vacunas por vencer', '7')],
    motifs: [...PET_MOTIFS, 'music-themed suite with a bed and a TV', 'nightly photo update', 'front desk with two location chips'], verbs: bi('runs the daycare', 'lleva la guardería'),
    sub: [sub('grooming', 'Grooming', 'Peluquería', { extra_tools: ['Vagaro'], roles: ['groomer', 'front desk'] }), sub('boarding', 'Boarding & daycare', 'Hospedaje y guardería', { extra_tools: ['Gingr'], roles: ['handler', 'manager'] }), sub('pet_transport_vet_partner', 'Vet-adjacent (transport, wellness add-ons)', 'Servicios afines a veterinaria (transporte, bienestar)', { extra_tools: ['PetDesk'] }),
      // Petrock depth (reference-systems.md §3, §5.2): a dog hotel is pet care with a hotel's operations - rooms, nights, day buckets, vaccines, approvals.
      sub('dog_hotel_spa', 'Dog hotel & spa (boarding, grooming, daycare)', 'Hotel y spa para perros (hospedaje, peluquería, guardería)', {
        extra_tools: ['PetLinx', 'Gingr', 'Squarespace', 'Yelp Ads'], extra_prevalence: { PetLinx: 0.75, Gingr: 0.6, Squarespace: 0.8, 'Yelp Ads': 0.5 },
        roles: ['owner', 'manager', 'front desk', 'groomer', 'handler', 'walker'],
        departments: [bi('Front desk', 'Recepción'), bi('Hotel (rooms & stays)', 'Hotel (habitaciones y estancias)'), bi('Grooming & Spa', 'Peluquería y spa'), bi('Daycare', 'Guardería'), bi('People & pets (vaccines)', 'Personas y mascotas (vacunas)'), bi('Payments & invoices', 'Pagos y facturas'), bi('Messages & reviews', 'Mensajes y reseñas'), bi('Marketing', 'Marketing')],
        kpis: [kpi('Dogs in house', 'Perros hospedados', '38'), kpi('Arriving / departing today', 'Llegan / salen hoy', '9 / 6'), kpi('Occupancy tonight', 'Ocupación esta noche', '86%'), kpi('Grooms today', 'Baños y cortes hoy', '11'), kpi('Pending vaccines', 'Vacunas pendientes', '7'), kpi('Balance due', 'Saldo por cobrar', '$2,140'), kpi('Revenue today', 'Ingresos de hoy', '$3,480'), kpi('Average stay (nights)', 'Estancia promedio (noches)', '3.4')],
        pains: [...PET_PAINS, bi('Manager approvals by phone call', 'Aprobaciones del gerente por llamada'), bi('Two locations, two spreadsheets', 'Dos sedes, dos hojas de cálculo'), bi('Photos and nightly updates sent by hand', 'Fotos y reportes nocturnos enviados a mano')],
        motifs: ['music-themed suite with a bed and a TV', 'nightly photo update', 'front desk with two location chips', ...PET_MOTIFS],
        meter: { label: bi('Rooms occupied tonight', 'Habitaciones ocupadas esta noche'), value: 50, max: 58, unit: bi('rooms', 'habitaciones') },
      })],
  },
  dental: {
    label: bi('Dental practice', 'Clínica dental'),
    departments: [bi('Front office', 'Recepción'), bi('Hygiene', 'Higiene'), bi('Clinical', 'Clínica'), bi('Billing & insurance', 'Facturación y seguros'), bi('Marketing', 'Marketing')],
    business_roles: ['owner dentist', 'office manager', 'front office', 'hygienist', 'associate dentist', 'billing'], life_roles: ['owner', 'spouse/partner', 'kids', 'accountant', 'practice consultant'],
    stack: [s('Dentrix', 'Practice management', 450, 'Patients & charts', 0.55, { per_location: true }), s('Open Dental', 'Practice management', 179, 'Patients & charts', 0.35, { per_location: true }), s('Weave', 'Patient comms', 399, 'Comms', 0.5, { per_location: true }), s('Solutionreach', 'Reminders', 329, 'Comms', 0.3, { per_location: true }), s('CareCredit portal', 'Financing', 19, 'Money', 0.4, { price_source_note: 'CareCredit itself charges the practice per-transaction merchant fees, not a flat subscription; $19 approximates the typical bundled patient-financing portal/admin fee so the stack math has a comparable monthly line.' }), ...COMMON],
    pains: [bi('No-shows eat 12% of chair time', 'Las inasistencias comen 12% del tiempo de sillón'), bi('Insurance verification by phone', 'Verificación de seguros por teléfono'), bi('Recall lists in spreadsheets', 'Listas de recall en hojas de cálculo')],
    kpis: [{ label: bi('Chairs booked today', 'Sillones ocupados hoy'), sample: '9 / 10' }, { label: bi('Recall due', 'Recall pendiente'), sample: '134' }, { label: bi('Claims outstanding', 'Reclamos pendientes'), sample: '$48,200' }],
    motifs: ['bright modern operatory', 'smiling patient', 'tablet at reception', 'two clinic storefronts'], verbs: bi('runs the practice', 'dirige la clínica'),
    sub: [sub('general', 'General dentistry', 'Odontología general', { extra_tools: ['Dentrix'], roles: ['owner dentist', 'hygienist'] }), sub('ortho', 'Orthodontics', 'Ortodoncia', { extra_tools: ['Weave'], roles: ['associate dentist'] })],
  },
  restaurant: {
    label: bi('Restaurant / restaurant group', 'Restaurante / grupo de restaurantes'),
    departments: [bi('Front of house', 'Sala'), bi('Kitchen', 'Cocina'), bi('Bar', 'Bar'), bi('Events & catering', 'Eventos y catering'), bi('Marketing', 'Marketing'), bi('Money', 'Finanzas')],
    business_roles: ['owner', 'general manager', 'chef', 'shift lead', 'host', 'events manager'], life_roles: ['owner', 'spouse/partner', 'kids', 'accountant', 'investor'],
    stack: [s('Toast POS', 'POS', 165, 'Orders & POS', 0.7, { per_location: true }), s('7shifts', 'Scheduling', 34.99, 'Team', 0.6, { per_location: true }), s('Homebase', 'Scheduling & payroll', 24.95, 'Team', 0.3, { per_location: true }), s('OpenTable', 'Reservations', 249, 'Reservations', 0.5, { per_location: true }), s('Resy', 'Reservations', 249, 'Reservations', 0.3, { per_location: true }), s('MarketMan', 'Inventory', 239, 'Inventory', 0.35, { per_location: true }), s('Tripleseat', 'Events', 250, 'Events', 0.3), ...COMMON],
    pains: [bi('Three logins to see one night', 'Tres logins para ver una noche'), bi('Schedules re-typed into payroll', 'Horarios re-tipeados en la nómina'), bi('Guest data trapped in the reservation app', 'Datos de clientes atrapados en la app de reservas')],
    kpis: [{ label: bi('Covers tonight', 'Cubiertos esta noche'), sample: '212' }, { label: bi('Labor %', '% Laboral'), sample: '27.4%' }, { label: bi('Food cost', 'Costo de alimentos'), sample: '31%' }],
    motifs: ['warm dining room at golden hour', 'chef plating', 'reservation book on a tablet', 'three storefronts on one map'], verbs: bi('runs the restaurants', 'lleva los restaurantes'),
    sub: [sub('quick_service', 'Quick service / fast casual', 'Servicio rápido', { extra_tools: ['ChowNow'], roles: ['shift lead', 'host'] }), sub('full_service', 'Full service / fine dining', 'Servicio completo', { extra_tools: ['OpenTable', 'Resy'], roles: ['general manager', 'host'] }), sub('food_truck', 'Food truck', 'Camión de comida', { extra_tools: ['Square for Restaurants'], roles: ['owner', 'chef'] })],
  },
  gym_wellness: {
    label: bi('Gym / wellness studio', 'Gimnasio / estudio de bienestar'),
    departments: [bi('Front desk', 'Recepción'), bi('Coaching', 'Coaching'), bi('Memberships', 'Membresías'), bi('Classes', 'Clases'), bi('Marketing', 'Marketing')],
    business_roles: ['owner', 'studio manager', 'coach', 'front desk', 'sales'], life_roles: ['owner', 'spouse/partner', 'kids', 'accountant', 'nutritionist'],
    stack: [s('Mindbody', 'Studio software', 279, 'Members & classes', 0.6, { per_location: true }), s('Mariana Tek', 'Studio software', 350, 'Members & classes', 0.2, { per_location: true }), s('Trainerize', 'Coaching app', 90, 'Coaching', 0.4), s('Gympass listing', 'Aggregator', 49, 'Members', 0.3, { price_source_note: 'Gympass/Wellhub pays the gym per visit rather than charging a subscription; $49 stands in for the minimal fixed participation/kiosk cost so the line is not zero.' }),
      // Reference-systems pass (Hoy): what a membership club pays for around the studio software.
      ref('WhatsApp Business (manual)', 'Messaging', 5, 'Chat', 0.7, 'the app is free; $5 stands in for the share of the phone plan it lives on, so the line is not zero (D-063 precedent).'),
      ref('Glofox', 'Studio software', 110, 'Members & classes', 0.2, 'Glofox Starter tier; second choice behind Mindbody.'),
      ref('Momence', 'Studio software', 99, 'Members & classes', 0.15, 'Momence Basic tier; second choice behind Mindbody.'),
      ref('Squarespace', 'Website', 23, 'Website', 0.4, 'Squarespace Business plan, billed annually.'),
      ref('Gusto', 'Payroll', 80, 'Payroll', 0.35, 'Gusto Simple is $40 base + $6 / person; $80 flat matches the price the catalog already uses for cleaning and accounting.'),
      ...COMMON],
    pains: GYM_PAINS,
    kpis: [kpi('Active members', 'Miembros activos', '512'), kpi('Class fill', 'Ocupación de clases', '78%'), kpi('At-risk this week', 'En riesgo esta semana', '19')],
    motifs: [...GYM_MOTIFS, 'cream and deep-blue studio at 6 am', "teacher's payroll statement on a phone", 'WhatsApp inbox on the front-desk screen'], verbs: bi('runs the studio', 'dirige el estudio'),
    sub: [sub('gym', 'Gym / fitness center', 'Gimnasio', { extra_tools: ['Mindbody'], roles: ['front desk', 'coach'] }), sub('yoga_studio', 'Yoga studio', 'Estudio de yoga', { extra_tools: ['Mariana Tek'], roles: ['coach'] }), sub('personal_training', 'Personal training', 'Entrenamiento personal', { extra_tools: ['Trainerize'], roles: ['coach', 'sales'] }),
      // Hoy depth (reference-systems.md §1, §5.2): a multi-modality club with memberships, credits, a coordinator, a finance role and payroll per class.
      sub('wellness_club', 'Wellness club (yoga, pilates, breath, memberships)', 'Club de bienestar (yoga, pilates, respiración, membresías)', {
        extra_tools: ['Mindbody', 'Glofox', 'WhatsApp Business (manual)', 'Squarespace', 'Gusto'], extra_prevalence: { Mindbody: 0.8, Glofox: 0.3, 'WhatsApp Business (manual)': 0.9, Squarespace: 0.6, Gusto: 0.5 },
        roles: ['owner', 'coordinator', 'front desk', 'teacher', 'finance', 'maintenance'],
        departments: [bi('Front desk & check-in', 'Recepción y check-in'), bi('Classes & schedule', 'Clases y horario'), bi('Teachers & payroll', 'Profesores y nómina'), bi('Memberships & plans', 'Membresías y planes'), bi('CRM & WhatsApp', 'CRM y WhatsApp'), bi('Money (payments, invoices, expenses)', 'Dinero (pagos, facturas, gastos)'), bi('Content & brand', 'Contenido y marca'), bi('Room & maintenance', 'Sala y mantenimiento')],
        kpis: [kpi('Active members', 'Miembros activos', '312'), kpi('Occupancy 7 days', 'Ocupación 7 días', '78%'), kpi('Arrivals today', 'Llegadas hoy', '46'), kpi('On waitlist', 'En lista de espera', '9'), kpi('Unread messages', 'Mensajes sin leer', '6'), kpi('Revenue 30 days', 'Ingresos 30 días', '$41,200'), kpi('Estimated payroll', 'Nómina estimada', '$9,800'), kpi('Balance of the period', 'Balance del periodo', '$18,400')],
        pains: [...GYM_PAINS, bi('Teacher payroll computed in a spreadsheet', 'Nómina de profesores calculada en hoja de cálculo'), bi('WhatsApp threads live on one phone', 'Los chats de WhatsApp viven en un solo teléfono'), bi('Prices typed in three places', 'Precios escritos en tres lugares')],
        motifs: ['cream and deep-blue studio at 6 am', "teacher's payroll statement on a phone", 'WhatsApp inbox on the front-desk screen', ...GYM_MOTIFS],
        meter: { label: bi('Mats booked, next class', 'Tapetes reservados, próxima clase'), value: 12, max: 15, unit: bi('mats', 'tapetes') },
      })],
  },
  real_estate: {
    label: bi('Real estate brokerage', 'Inmobiliaria'),
    departments: [bi('Agents', 'Agentes'), bi('Transactions', 'Transacciones'), bi('Marketing', 'Marketing'), bi('Recruiting', 'Reclutamiento'), bi('Money', 'Finanzas')],
    business_roles: ['broker owner', 'team lead', 'agent', 'transaction coordinator', 'marketing'], life_roles: ['owner', 'spouse/partner', 'kids', 'accountant', 'lender partner'],
    stack: [s('Follow Up Boss', 'CRM', 69, 'CRM', 0.5, { per_seat: true }), s('kvCORE', 'CRM & sites', 499, 'CRM', 0.3), s('Dotloop', 'Transactions', 31.99, 'Deals', 0.5, { per_seat: true }), s('BombBomb', 'Video email', 39, 'Campaigns', 0.3, { per_seat: true }), ...COMMON],
    pains: [bi('Leads fall between agents', 'Los leads se pierden entre agentes'), bi('Deal docs in five places', 'Documentos en cinco lugares'), bi('Agents build their own brand tools', 'Cada agente arma su propia marca')],
    kpis: [{ label: bi('Active listings', 'Propiedades activas'), sample: '38' }, { label: bi('Under contract', 'Bajo contrato'), sample: '14' }, { label: bi('Leads this week', 'Leads esta semana'), sample: '61' }],
    motifs: ['sunlit living room', 'agent with client at door', 'deal pipeline board', 'city skyline'], verbs: bi('runs the brokerage', 'dirige la inmobiliaria'),
    sub: [sub('agent_team', 'Agent team', 'Equipo de agentes', { extra_tools: ['Follow Up Boss'], roles: ['team lead', 'agent'] }), sub('property_management_arm', 'Property management arm', 'Área de administración de propiedades', { extra_tools: ['AppFolio'], roles: ['transaction coordinator'] })],
  },
  law_firm: {
    label: bi('Law firm', 'Bufete de abogados'),
    departments: [bi('Intake', 'Admisión'), bi('Matters', 'Casos'), bi('Billing', 'Facturación'), bi('Documents', 'Documentos'), bi('Marketing', 'Marketing')],
    business_roles: ['managing partner', 'associate', 'paralegal', 'intake', 'billing'], life_roles: ['owner', 'spouse/partner', 'kids', 'accountant', 'of counsel'],
    stack: [s('Clio', 'Practice management', 129, 'Matters', 0.6, { per_seat: true }), s('MyCase', 'Practice management', 89, 'Matters', 0.25, { per_seat: true }), s('Lawmatics', 'Intake CRM', 199, 'Intake', 0.3), s('LawPay', 'Payments', 19, 'Payments', 0.5),
      // Reference-systems pass (CTL): the replacement map's "today" column. Industry-wide most are second choices; the tenant_law sub raises them.
      ref('WordPress hosting', 'Website', 30, 'Website', 0.5, 'managed WordPress hosting tier; the theme and plugins are extra.'),
      ref('Ecwid', 'Online store', 35, 'Store & payments', 0.1, 'Ecwid Venture tier for a fixed-price services store.'),
      ref('Microsoft Teams', 'Video calls', 4, 'Calls & video', 0.4, 'Teams Essentials per user; phone / video consultations.', { per_seat: true }),
      ref('VoiceStamps', 'Pay-per-call billing', 30, 'Calls', 0.05, 'per-call vendor (deposit per 10 minutes); $30 is a flat stand-in for the monthly fees.'),
      ref('Jotform', 'Forms', 39, 'Intake', 0.25, 'Jotform Bronze tier for the intake form.'),
      ref('WordPerfect', 'Word processor', 15, 'Documents', 0.05, 'one-time licence (~$250-500) amortised over three years; the real cost is the drafting hours, not the fee.'),
      ref('PayPal', 'Payments', 25, 'Payments', 0.4, 'per-transaction (~3.5 % + $0.49), no subscription; $25 stands in for the fees on a small monthly volume.'),
      ...COMMON],
    pains: LAW_PAINS,
    kpis: [kpi('Open matters', 'Casos abiertos', '73'), kpi('Unbilled hours', 'Horas sin facturar', '118'), kpi('Intake this week', 'Admisiones esta semana', '22')],
    motifs: [...LAW_MOTIFS, 'eviction game board on a wall screen', 'client on a phone reading what comes next', 'numbered pleading paper on a monitor'], verbs: bi('runs the firm', 'dirige el bufete'),
    sub: [sub('family', 'Family law', 'Derecho familiar', { extra_tools: ['Clio'], roles: ['associate', 'paralegal'] }), sub('immigration', 'Immigration law', 'Derecho migratorio', { extra_tools: ['Lawmatics'], roles: ['intake', 'paralegal'] }), sub('small_business', 'Small business & contracts', 'Negocios y contratos', { extra_tools: ['MyCase'], roles: ['associate'] }),
      // CTL depth (reference-systems.md §2, §5.2): stage-driven, fixed-price, phone / video first - its tools, roles and KPIs differ from a billable-hour practice.
      sub('tenant_law', 'Tenant / landlord-tenant law', 'Derecho de inquilinos', {
        extra_tools: ['Ecwid', 'Microsoft Teams', 'WordPerfect', 'VoiceStamps', 'WordPress hosting', 'PayPal', 'Jotform'], extra_prevalence: { Ecwid: 0.8, 'Microsoft Teams': 0.8, WordPerfect: 0.6, VoiceStamps: 0.5, 'WordPress hosting': 0.8, PayPal: 0.7, Jotform: 0.6 },
        roles: ['owner attorney', 'attorney', 'paralegal', 'front desk', 'marketing', 'billing'],
        departments: [bi('Front desk & intake', 'Recepción y admisión'), bi('Cases (by stage)', 'Casos (por etapa)'), bi('Deadlines & hearings', 'Plazos y audiencias'), bi('Discovery & the binder', 'Pruebas y expediente'), bi('Documents & pleadings', 'Documentos y escritos'), bi('Client learning', 'Formación del cliente'), bi('Owner & finance', 'Dirección y finanzas'), bi('Marketing', 'Marketing'), bi('Opposing counsel', 'Abogados de la contraparte')],
        kpis: [kpi('Open cases', 'Casos abiertos', '73'), kpi('Late items', 'Pendientes atrasados', '9'), kpi('Deadlines this week', 'Plazos esta semana', '14'), kpi('Consults today', 'Consultas hoy', '6'), kpi('Intake queue', 'Cola de admisión', '11'), kpi('Intake conversion this month', 'Conversión de admisión del mes', '41%'), kpi('Paid / due this month', 'Cobrado / por cobrar del mes', '$18,480 / $3,960'), kpi('Docs to review', 'Documentos por revisar', '5')],
        pains: [...LAW_PAINS, bi('Deadlines tracked in a spreadsheet', 'Plazos llevados en una hoja de cálculo'), bi('Five tools between the form and the consultation', 'Cinco herramientas entre el formulario y la consulta'), bi('Pleadings hand-drafted on numbered paper', 'Escritos redactados a mano en papel numerado'), bi('No idea what the client watched before the call', 'Sin saber qué vio el cliente antes de la llamada')],
        motifs: ['eviction game board on a wall screen', 'client on a phone reading what comes next', 'numbered pleading paper on a monitor', ...LAW_MOTIFS],
        meter: { label: bi('Caseload vs capacity', 'Carga de casos vs capacidad'), value: 73, max: 90, unit: bi('cases', 'casos') },
      })],
  },
  salon_spa: {
    label: bi('Salon / spa', 'Salón / spa'),
    departments: [bi('Front desk', 'Recepción'), bi('Stylists', 'Estilistas'), bi('Retail', 'Retail'), bi('Marketing', 'Marketing')],
    business_roles: ['owner', 'manager', 'stylist', 'front desk', 'esthetician'], life_roles: ['owner', 'spouse/partner', 'kids', 'accountant', 'educator'],
    stack: [s('Vagaro', 'Salon software', 45, 'Bookings', 0.45, { per_location: true }), s('Boulevard', 'Salon software', 175, 'Bookings', 0.3, { per_location: true }), s('Fresha', 'Salon software', 15, 'Bookings', 0.25, { price_source_note: 'Fresha’s core booking calendar is free (they monetize via payment processing); $15 approximates the optional Fresha Plus add-on tier so the line is not zero.' }), s('Square', 'Payments', 60, 'Payments', 0.6), ...COMMON],
    pains: [bi('Rebooking left to chance', 'Re-agendar queda al azar'), bi('Stylist schedules on paper', 'Horarios de estilistas en papel'), bi('Retail inventory guessed', 'Inventario a ojo')],
    kpis: [{ label: bi('Appointments today', 'Citas hoy'), sample: '58' }, { label: bi('Rebook rate', 'Tasa de re-agenda'), sample: '64%' }, { label: bi('Retail attach', 'Venta cruzada retail'), sample: '22%' }],
    motifs: ['soft-lit salon chair', 'stylist with client', 'product shelf', 'appointment grid'], verbs: bi('runs the salon', 'lleva el salón'),
    sub: [sub('hair', 'Hair salon', 'Salón de belleza', { extra_tools: ['Vagaro'], roles: ['stylist'] }), sub('nails', 'Nail salon', 'Salón de uñas', { extra_tools: ['Fresha'], roles: ['stylist'] }), sub('spa', 'Day spa', 'Spa', { extra_tools: ['Boulevard'], roles: ['esthetician'] })],
  },
  home_services: {
    label: bi('Home services contractor', 'Contratista de servicios para el hogar'),
    departments: [bi('Dispatch', 'Despacho'), bi('Field crews', 'Cuadrillas'), bi('Estimates', 'Presupuestos'), bi('Billing', 'Facturación'), bi('Marketing', 'Marketing')],
    business_roles: ['owner', 'office manager', 'dispatcher', 'technician', 'estimator'], life_roles: ['owner', 'spouse/partner', 'kids', 'accountant', 'supplier rep'],
    stack: [s('ServiceTitan', 'Field service', 398, 'Jobs & dispatch', 0.4, { per_seat: true }), s('Jobber', 'Field service', 169, 'Jobs & dispatch', 0.4), s('Housecall Pro', 'Field service', 189, 'Jobs & dispatch', 0.3), s('Angi Leads', 'Lead gen', 300, 'Leads', 0.4), ...COMMON],
    pains: [bi('Estimates lost in text threads', 'Presupuestos perdidos en mensajes'), bi('Crews called for every change', 'Llamar a la cuadrilla por cada cambio'), bi('Invoices weeks late', 'Facturas con semanas de retraso')],
    kpis: [{ label: bi('Jobs today', 'Trabajos hoy'), sample: '17' }, { label: bi('Estimates open', 'Presupuestos abiertos'), sample: '$86,400' }, { label: bi('Avg days to invoice', 'Días para facturar'), sample: '1.2' }],
    motifs: ['branded van at dawn', 'tech with tablet at a door', 'dispatch map', 'before/after job'], verbs: bi('runs the company', 'lleva la empresa'),
    sub: [sub('hvac', 'HVAC', 'Climatización', { extra_tools: ['ServiceTitan'], roles: ['technician'] }), sub('plumbing', 'Plumbing', 'Plomería', { extra_tools: ['Jobber'], roles: ['technician'] }), sub('electrical', 'Electrical', 'Electricidad', { extra_tools: ['Housecall Pro'], roles: ['technician', 'estimator'] })],
  },
  auto_shop: {
    label: bi('Auto repair shop', 'Taller mecánico'),
    departments: [bi('Service desk', 'Recepción de servicio'), bi('Bays', 'Bahías'), bi('Parts', 'Refacciones'), bi('Billing', 'Facturación')],
    business_roles: ['owner', 'service advisor', 'technician', 'parts', 'office'], life_roles: ['owner', 'spouse/partner', 'kids', 'accountant', 'parts supplier'],
    stack: [s('Tekmetric', 'Shop management', 299, 'Repair orders', 0.4, { per_location: true }), s('Shop-Ware', 'Shop management', 349, 'Repair orders', 0.3, { per_location: true }), s('Mitchell 1', 'Repair data', 189, 'Repair orders', 0.4), s('Kukui', 'Marketing', 299, 'Campaigns', 0.3), ...COMMON],
    pains: [bi('Approvals by phone tag', 'Aprobaciones a puro teléfono'), bi('Parts ordered twice', 'Refacciones pedidas dos veces'), bi('No reminders for next service', 'Sin recordatorios de servicio')],
    kpis: [{ label: bi('Cars in bays', 'Autos en bahías'), sample: '11' }, { label: bi('ARO', 'Ticket promedio'), sample: '$486' }, { label: bi('Approvals waiting', 'Aprobaciones pendientes'), sample: '6' }],
    motifs: ['clean shop floor', 'advisor showing tablet to customer', 'lift with car', 'digital inspection'], verbs: bi('runs the shop', 'lleva el taller'),
    sub: [sub('repair', 'General repair', 'Reparación general', { extra_tools: ['Tekmetric'], roles: ['technician', 'service advisor'] }), sub('detailing', 'Detailing', 'Detallado', { extra_tools: ['Square'], roles: ['technician'] })],
  },
  med_spa: {
    label: bi('Med spa / aesthetics', 'Med spa / estética'),
    departments: [bi('Front desk', 'Recepción'), bi('Providers', 'Proveedores'), bi('Memberships', 'Membresías'), bi('Marketing', 'Marketing'), bi('Compliance', 'Cumplimiento')],
    business_roles: ['owner', 'medical director', 'nurse injector', 'esthetician', 'front desk', 'patient coordinator'], life_roles: ['owner', 'spouse/partner', 'kids', 'accountant', 'medical director'],
    stack: [s('Zenoti', 'Spa software', 400, 'Patients & bookings', 0.35, { per_location: true }), s('Boulevard', 'Spa software', 175, 'Patients & bookings', 0.3, { per_location: true }), s('Aesthetic Record', 'EMR', 149, 'Charts', 0.4), s('Podium', 'Reviews & messaging', 399, 'Comms', 0.35), ...COMMON],
    pains: [bi('Consents on paper', 'Consentimientos en papel'), bi('Memberships tracked by hand', 'Membresías a mano'), bi('Before/after photos on phones', 'Fotos antes/después en celulares')],
    kpis: [{ label: bi('Treatments today', 'Tratamientos hoy'), sample: '31' }, { label: bi('Members', 'Miembros'), sample: '240' }, { label: bi('Rebook rate', 'Re-agenda'), sample: '71%' }],
    motifs: ['serene treatment room', 'provider consult on tablet', 'membership card', 'glowing storefront'], verbs: bi('runs the spa', 'dirige el spa'),
  },
  chiropractic: {
    label: bi('Chiropractic / physio clinic', 'Clínica quiropráctica / fisioterapia'),
    departments: [bi('Front desk', 'Recepción'), bi('Treatment rooms', 'Salas de tratamiento'), bi('Rehab & exercise', 'Rehabilitación y ejercicio'), bi('Billing & insurance', 'Facturación y seguros'), bi('Marketing', 'Marketing')],
    business_roles: ['owner chiropractor', 'office manager', 'front desk', 'associate doctor', 'rehab tech', 'billing'], life_roles: ['owner', 'spouse/partner', 'kids', 'accountant', 'referring physician'],
    stack: [s('ChiroTouch', 'Practice management', 159, 'Patients & charts', 0.45, { per_location: true }), s('Jane App', 'Practice management', 99, 'Patients & charts', 0.35, { per_location: true }), s('WebPT', 'Practice management', 99, 'Patients & charts', 0.2, { per_seat: true }), s('Weave', 'Patient comms', 399, 'Comms', 0.35, { per_location: true }), s('Office Ally', 'Claims', 45, 'Money', 0.4), s('Smartwaiver', 'Intake forms', 49, 'Forms', 0.3), ...COMMON],
    pains: [bi('Care plans re-explained at every visit', 'El plan de cuidado se re-explica en cada visita'), bi('Intake paperwork on a clipboard', 'Formularios de admisión en tabla de papel'), bi('Insurance denials found weeks later', 'Rechazos del seguro descubiertos semanas después')],
    kpis: [{ label: bi('Visits today', 'Visitas hoy'), sample: '48' }, { label: bi('Plan compliance', 'Cumplimiento del plan'), sample: '72%' }, { label: bi('Claims denied', 'Reclamos rechazados'), sample: '9' }],
    motifs: ['bright adjustment room', 'patient with a movement chart', 'rehab floor with bands', 'spine model on a desk'], verbs: bi('runs the clinic', 'dirige la clínica'),
  },
  veterinary: {
    label: bi('Veterinary clinic', 'Clínica veterinaria'),
    departments: [bi('Front desk', 'Recepción'), bi('Exam rooms', 'Consultorios'), bi('Surgery', 'Cirugía'), bi('Lab & imaging', 'Laboratorio e imagen'), bi('Pharmacy', 'Farmacia'), bi('Money', 'Finanzas')],
    business_roles: ['owner veterinarian', 'practice manager', 'front desk', 'vet tech', 'associate vet', 'kennel assistant'], life_roles: ['owner', 'spouse/partner', 'kids', 'accountant', 'relief vet'],
    stack: [s('ezyVet', 'Practice software', 200, 'Patients & charts', 0.35, { per_location: true }), s('AVImark', 'Practice software', 150, 'Patients & charts', 0.3, { per_location: true }), s('Covetrus Pulse', 'Practice software', 179, 'Patients & charts', 0.2, { per_location: true }), s('PetDesk', 'Client comms', 299, 'Comms', 0.4, { per_location: true }), s('Vetstoria', 'Online booking', 249, 'Bookings', 0.3), s('IDEXX VetConnect', 'Lab & imaging', 149, 'Records', 0.4), ...COMMON],
    pains: [bi('Reminders for shots go out by hand', 'Recordatorios de vacunas enviados a mano'), bi('Estimates approved verbally, disputed later', 'Presupuestos aprobados de palabra y luego disputados'), bi('Lab results printed and re-typed', 'Resultados de laboratorio impresos y re-tipeados')],
    kpis: [{ label: bi('Appointments today', 'Citas hoy'), sample: '36' }, { label: bi('Avg invoice', 'Factura promedio'), sample: '$214' }, { label: bi('Reminders overdue', 'Recordatorios vencidos'), sample: '88' }],
    motifs: ['exam room with a calm dog', 'vet tech with a tablet', 'surgery board', 'waiting room with pet owners'], verbs: bi('runs the clinic', 'dirige la clínica'),
  },
  coffee_shop: {
    label: bi('Coffee shop / bakery', 'Cafetería / panadería'),
    departments: [bi('Counter', 'Mostrador'), bi('Bakery & kitchen', 'Panadería y cocina'), bi('Wholesale', 'Mayoreo'), bi('Marketing', 'Marketing'), bi('Money', 'Finanzas')],
    business_roles: ['owner', 'store manager', 'head baker', 'barista', 'shift lead'], life_roles: ['owner', 'spouse/partner', 'kids', 'accountant', 'roaster partner'],
    stack: [s('Square for Restaurants', 'POS', 69, 'Orders & POS', 0.55, { per_location: true }), s('Toast POS', 'POS', 165, 'Orders & POS', 0.35, { per_location: true }), s('7shifts', 'Scheduling', 34.99, 'Team', 0.45, { per_location: true }), s('ChowNow', 'Online ordering', 149, 'Orders', 0.3), s('Loyalzoo', 'Loyalty', 27, 'Members', 0.3, { per_location: true }), s('Craftybase', 'Inventory & recipes', 39, 'Inventory', 0.25), ...COMMON],
    pains: [bi('Waste guessed from yesterday', 'El desperdicio se calcula de memoria'), bi('Wholesale orders arrive by text', 'Pedidos de mayoreo llegan por mensaje'), bi('Loyalty points live in the POS only', 'Los puntos de lealtad solo viven en el POS')],
    kpis: [{ label: bi('Tickets today', 'Tickets hoy'), sample: '386' }, { label: bi('Avg ticket', 'Ticket promedio'), sample: '$9.40' }, { label: bi('Waste %', '% Desperdicio'), sample: '4.1%' }],
    motifs: ['morning light on a pastry case', 'barista pulling a shot', 'bakers before dawn', 'chalkboard menu'], verbs: bi('runs the shop', 'lleva la cafetería'),
  },
  landscaping: {
    label: bi('Landscaping / lawn care', 'Jardinería / mantenimiento de áreas verdes'),
    departments: [bi('Estimating', 'Presupuestos'), bi('Crews', 'Cuadrillas'), bi('Routing', 'Rutas'), bi('Equipment', 'Equipo'), bi('Billing', 'Facturación')],
    business_roles: ['owner', 'operations manager', 'estimator', 'crew lead', 'foreman', 'office admin'], life_roles: ['owner', 'spouse/partner', 'kids', 'accountant', 'equipment dealer'],
    stack: [s('Jobber', 'Field service', 169, 'Jobs & dispatch', 0.45), s('LMN', 'Field service', 297, 'Jobs & dispatch', 0.25), s('Aspire', 'Field service', 400, 'Jobs & dispatch', 0.15), s('OptimoRoute', 'Routing', 35, 'Routes', 0.3, { per_seat: true }), s('Samsara', 'Fleet tracking', 33, 'Fleet', 0.35, { per_seat: true }), s('Angi Leads', 'Lead gen', 300, 'Leads', 0.3), ...COMMON],
    pains: [bi('Routes redrawn every rainy morning', 'Las rutas se rehacen cada mañana de lluvia'), bi('Crews text photos to prove the work', 'Las cuadrillas mandan fotos por mensaje como prueba'), bi('Seasonal contracts re-keyed every spring', 'Contratos de temporada re-capturados cada primavera')],
    kpis: [{ label: bi('Stops today', 'Paradas hoy'), sample: '54' }, { label: bi('Routes on time', 'Rutas a tiempo'), sample: '91%' }, { label: bi('Contracts renewing', 'Contratos por renovar'), sample: '37' }],
    motifs: ['crew truck at sunrise', 'freshly cut lawn stripes', 'route map on a phone', 'before and after a yard'], verbs: bi('runs the crews', 'dirige las cuadrillas'),
  },
  cleaning: {
    label: bi('Cleaning company', 'Empresa de limpieza'),
    departments: [bi('Scheduling', 'Programación'), bi('Field teams', 'Equipos de campo'), bi('Quality', 'Calidad'), bi('Hiring', 'Contratación'), bi('Billing', 'Facturación')],
    business_roles: ['owner', 'operations manager', 'scheduler', 'team lead', 'cleaner', 'quality inspector'], life_roles: ['owner', 'spouse/partner', 'kids', 'accountant', 'supply vendor'],
    stack: [s('Jobber', 'Field service', 169, 'Jobs & dispatch', 0.4), s('ZenMaid', 'Field service', 66, 'Jobs & dispatch', 0.35), s('Launch27', 'Field service', 79, 'Jobs & dispatch', 0.2), s('Homebase', 'Time tracking', 24.95, 'Team', 0.45, { per_location: true }), s('Gusto', 'Payroll', 80, 'Payroll', 0.5), s('Swept', 'Quality checklists', 60, 'Checklists', 0.25), s('Thumbtack', 'Lead gen', 250, 'Leads', 0.3), ...COMMON],
    pains: [bi('Last-minute call-outs rebuilt by phone', 'Ausencias de último minuto resueltas por teléfono'), bi('Checklists photographed, never filed', 'Listas de verificación fotografiadas y nunca archivadas'), bi('Turnover means retraining every month', 'La rotación obliga a capacitar cada mes')],
    kpis: [{ label: bi('Jobs today', 'Trabajos hoy'), sample: '29' }, { label: bi('On-time arrival', 'Llegada a tiempo'), sample: '94%' }, { label: bi('Recurring clients', 'Clientes recurrentes'), sample: '212' }],
    motifs: ['sunlit finished room', 'team in branded shirts', 'checklist on a phone', 'supply cart'], verbs: bi('runs the company', 'lleva la empresa'),
  },
  property_mgmt: {
    label: bi('Property management', 'Administración de propiedades'),
    departments: [bi('Leasing', 'Arrendamiento'), bi('Maintenance', 'Mantenimiento'), bi('Owners & reporting', 'Propietarios e informes'), bi('Accounting', 'Contabilidad'), bi('Compliance', 'Cumplimiento')],
    business_roles: ['owner broker', 'portfolio manager', 'leasing agent', 'maintenance coordinator', 'accountant', 'front desk'], life_roles: ['owner', 'spouse/partner', 'kids', 'accountant', 'investor partner'],
    stack: [s('AppFolio', 'Property management', 298, 'Properties & leases', 0.45, { per_location: true }), s('Buildium', 'Property management', 199, 'Properties & leases', 0.3, { per_location: true }), s('Rent Manager', 'Property management', 250, 'Properties & leases', 0.2, { per_location: true }), s('Property Meld', 'Maintenance', 120, 'Work orders', 0.3), s('Zillow Rental Manager', 'Listings', 59, 'Listings', 0.35), s('TenantCloud screening', 'Screening', 45, 'Applications', 0.25), ...COMMON],
    pains: [bi('Owners call for a statement nobody can find', 'Los propietarios piden un estado que nadie encuentra'), bi('Work orders lost between the app and the text thread', 'Órdenes de trabajo perdidas entre la app y los mensajes'), bi('Renewals slip past the notice window', 'Las renovaciones se pasan del plazo de aviso')],
    kpis: [{ label: bi('Units managed', 'Unidades administradas'), sample: '486' }, { label: bi('Occupancy', 'Ocupación'), sample: '95.4%' }, { label: bi('Open work orders', 'Órdenes abiertas'), sample: '62' }],
    motifs: ['keys on a leasing desk', 'apartment courtyard at dusk', 'maintenance app on a phone', 'owner statement on a laptop'], verbs: bi('runs the portfolio', 'administra el portafolio'),
    meter: { label: bi('Units occupied', 'Unidades ocupadas'), value: 464, max: 486, unit: bi('units', 'unidades') },
  },
  insurance: {
    label: bi('Insurance agency', 'Agencia de seguros'),
    departments: [bi('New business', 'Negocio nuevo'), bi('Service & claims', 'Servicio y siniestros'), bi('Renewals', 'Renovaciones'), bi('Marketing', 'Marketing'), bi('Money', 'Finanzas')],
    business_roles: ['agency owner', 'producer', 'account manager', 'service rep', 'claims assistant'], life_roles: ['owner', 'spouse/partner', 'kids', 'accountant', 'carrier rep'],
    stack: [s('EZLynx', 'Agency management', 180, 'Policies & clients', 0.35, { per_seat: true }), s('Applied Epic', 'Agency management', 300, 'Policies & clients', 0.25, { per_seat: true }), s('AgencyZoom', 'Sales pipeline', 199, 'Pipeline', 0.3), s('PL Rating', 'Comparative rater', 120, 'Quotes', 0.3), s('Certificate Hero', 'Certificates', 99, 'Documents', 0.2), s('Podium', 'Reviews & messaging', 399, 'Comms', 0.25), ...COMMON],
    pains: [bi('Renewals worked from a spreadsheet reminder', 'Renovaciones trabajadas desde un recordatorio en hoja de cálculo'), bi('Quotes re-keyed into three carrier portals', 'Cotizaciones re-capturadas en tres portales de aseguradoras'), bi('Certificates requested after hours', 'Certificados solicitados fuera de horario')],
    kpis: [{ label: bi('Policies in force', 'Pólizas vigentes'), sample: '2,140' }, { label: bi('Renewal rate', 'Tasa de renovación'), sample: '89%' }, { label: bi('Quotes this week', 'Cotizaciones esta semana'), sample: '47' }],
    motifs: ['agent at a family kitchen table', 'quiet office with two desks', 'policy review on a tablet', 'storefront on a main street'], verbs: bi('runs the agency', 'dirige la agencia'),
  },
  accounting: {
    label: bi('Accounting / bookkeeping firm', 'Despacho contable'),
    departments: [bi('Client work', 'Trabajo de clientes'), bi('Tax season', 'Temporada fiscal'), bi('Payroll services', 'Servicios de nómina'), bi('Advisory', 'Asesoría'), bi('Practice admin', 'Administración')],
    business_roles: ['managing partner', 'senior accountant', 'bookkeeper', 'tax preparer', 'client manager', 'admin'], life_roles: ['owner', 'spouse/partner', 'kids', 'personal accountant', 'of counsel'],
    stack: [s('Karbon', 'Practice management', 79, 'Work & clients', 0.35, { per_seat: true }), s('Canopy', 'Practice management', 89, 'Work & clients', 0.3, { per_seat: true }), s('Jetpack Workflow', 'Practice management', 56, 'Work & clients', 0.2, { per_seat: true }), s('Drake Tax', 'Tax software', 200, 'Filings', 0.4), s('SmartVault', 'Client portal', 40, 'Files', 0.35, { per_seat: true }), s('Ignition', 'Proposals & billing', 149, 'Proposals', 0.25), s('Gusto', 'Payroll', 80, 'Payroll', 0.4), ...COMMON],
    pains: [bi('Client documents chased by email for weeks', 'Documentos del cliente perseguidos por correo durante semanas'), bi('Work status lives in one partner’s head', 'El estado del trabajo vive en la cabeza de un socio'), bi('Every April the same fire drill', 'Cada abril el mismo caos')],
    kpis: [{ label: bi('Open engagements', 'Encargos abiertos'), sample: '128' }, { label: bi('Docs outstanding', 'Documentos pendientes'), sample: '41' }, { label: bi('Realization', 'Realización'), sample: '82%' }],
    motifs: ['tidy desk with two monitors', 'partner reviewing a return', 'client portal on a laptop', 'quiet office in tax season'], verbs: bi('runs the firm', 'dirige el despacho'),
  },
  event_planning: {
    label: bi('Wedding & event planning', 'Planeación de bodas y eventos'),
    departments: [bi('Sales & inquiries', 'Ventas y consultas'), bi('Design', 'Diseño'), bi('Vendors', 'Proveedores'), bi('Day-of production', 'Producción del día'), bi('Money', 'Finanzas')],
    business_roles: ['owner planner', 'lead planner', 'associate planner', 'designer', 'day-of coordinator'], life_roles: ['owner', 'spouse/partner', 'kids', 'accountant', 'venue partner'],
    stack: [s('HoneyBook', 'Client management', 39, 'Clients & contracts', 0.45, { per_seat: true }), s('Aisle Planner', 'Client management', 79, 'Clients & contracts', 0.35, { per_seat: true }), s('Dubsado', 'Client management', 40, 'Clients & contracts', 0.2, { per_seat: true }), s('Prismm', 'Floor plans', 99, 'Layouts', 0.3), s('The Knot Pro', 'Lead gen', 300, 'Leads', 0.35), s('RSVPify', 'Guest lists', 39, 'Guests', 0.2), ...COMMON],
    pains: [bi('Timelines rebuilt in a doc for every wedding', 'Cronogramas rehechos en un documento para cada boda'), bi('Vendor confirmations scattered across inboxes', 'Confirmaciones de proveedores dispersas en varios correos'), bi('Payment schedules tracked by memory', 'Calendarios de pago seguidos de memoria')],
    kpis: [{ label: bi('Events booked', 'Eventos reservados'), sample: '34' }, { label: bi('Inquiries this month', 'Consultas del mes'), sample: '61' }, { label: bi('Payments due', 'Pagos por cobrar'), sample: '$78,400' }],
    motifs: ['reception at golden hour', 'planner with a clipboard and earpiece', 'table design mood board', 'vendor timeline on a tablet'], verbs: bi('runs the studio', 'dirige el estudio'),
  },
  tattoo: {
    label: bi('Tattoo studio', 'Estudio de tatuajes'),
    departments: [bi('Front desk', 'Recepción'), bi('Artists', 'Artistas'), bi('Consults', 'Consultas'), bi('Aftercare', 'Cuidado posterior'), bi('Marketing', 'Marketing')],
    business_roles: ['owner artist', 'studio manager', 'resident artist', 'guest artist', 'apprentice', 'front desk'], life_roles: ['owner', 'spouse/partner', 'kids', 'accountant', 'supplier rep'],
    stack: [s('Square Appointments', 'Studio booking', 50, 'Bookings', 0.45, { per_location: true }), s('Vagaro', 'Studio booking', 45, 'Bookings', 0.25, { per_location: true }), s('Fresha', 'Studio booking', 15, 'Bookings', 0.2, { price_source_note: 'Fresha’s core booking calendar is free (they monetize via payment processing); $15 approximates the optional Fresha Plus add-on tier so the line is not zero.' }), s('Smartwaiver', 'Waivers & consent', 49, 'Forms', 0.35), s('Square', 'Payments', 60, 'Payments', 0.6), s('Later', 'Social scheduling', 25, 'Campaigns', 0.3), s('Sortly', 'Supplies inventory', 49, 'Inventory', 0.2), ...COMMON],
    pains: [bi('Deposits chased through DMs', 'Depósitos perseguidos por mensajes directos'), bi('Consent forms on paper in a drawer', 'Consentimientos en papel en un cajón'), bi('Each artist keeps their own books', 'Cada artista lleva su propia agenda')],
    kpis: [{ label: bi('Sessions this week', 'Sesiones esta semana'), sample: '41' }, { label: bi('Deposits held', 'Depósitos retenidos'), sample: '$6,300' }, { label: bi('Consult to booking', 'Consulta a reserva'), sample: '58%' }],
    motifs: ['artist at a station under warm light', 'flash sheets on a wall', 'consult sketch on a tablet', 'studio front with neon'], verbs: bi('runs the studio', 'lleva el estudio'),
  },
  childcare: {
    label: bi('Daycare / preschool', 'Guardería / preescolar'),
    departments: [bi('Front office', 'Oficina'), bi('Classrooms', 'Salones'), bi('Enrollment', 'Inscripciones'), bi('Compliance & safety', 'Cumplimiento y seguridad'), bi('Money', 'Finanzas')],
    business_roles: ['owner director', 'assistant director', 'lead teacher', 'teacher aide', 'front office', 'cook'], life_roles: ['owner', 'spouse/partner', 'kids', 'accountant', 'licensing consultant'],
    stack: [s('Brightwheel', 'Childcare software', 199, 'Children & classrooms', 0.5, { per_location: true }), s('Procare', 'Childcare software', 149, 'Children & classrooms', 0.3, { per_location: true }), s('Lillio', 'Childcare software', 139, 'Children & classrooms', 0.2, { per_location: true }), s('Tuition Express', 'Tuition billing', 65, 'Payments', 0.3), s('Homebase', 'Staff scheduling', 24.95, 'Team', 0.4, { per_location: true }), s('LineLeader', 'Enrollment CRM', 250, 'Enrollment', 0.2), s('Sterling', 'Background checks', 45, 'Compliance', 0.25), ...COMMON],
    pains: [bi('Ratios recounted on a whiteboard', 'Las proporciones se recuentan en un pizarrón'), bi('Daily reports typed twice', 'Reportes diarios escritos dos veces'), bi('Waitlist families forgotten', 'Familias en lista de espera olvidadas')],
    kpis: [{ label: bi('Children enrolled', 'Niños inscritos'), sample: '96' }, { label: bi('Ratio compliance', 'Cumplimiento de proporción'), sample: '100%' }, { label: bi('Waitlist', 'Lista de espera'), sample: '23' }],
    motifs: ['sunny classroom with low tables', 'teacher reading to a circle', 'sign-in tablet at the door', 'art wall in a hallway'], verbs: bi('runs the center', 'dirige el centro'),
    meter: { label: bi('Enrolled vs licensed capacity', 'Inscritos vs capacidad autorizada'), value: 96, max: 104, unit: bi('children', 'niños') },
  },
  photography: {
    label: bi('Photography studio', 'Estudio fotográfico'),
    departments: [bi('Bookings', 'Reservas'), bi('Shoots', 'Sesiones'), bi('Editing', 'Edición'), bi('Delivery & prints', 'Entrega e impresión'), bi('Marketing', 'Marketing')],
    business_roles: ['owner photographer', 'second shooter', 'editor', 'studio manager', 'sales'], life_roles: ['owner', 'spouse/partner', 'kids', 'accountant', 'lab partner'],
    stack: [s('Táve', 'Studio management', 30, 'Clients & shoots', 0.35), s('Studio Ninja', 'Studio management', 25, 'Clients & shoots', 0.3), s('HoneyBook', 'Studio management', 39, 'Clients & shoots', 0.25, { per_seat: true }), s('Pic-Time', 'Client galleries', 35, 'Galleries', 0.45), s('Pixieset', 'Client galleries', 40, 'Galleries', 0.25), s('Adobe Creative Cloud', 'Creative apps', 60, 'Studio', 0.8, { per_seat: true }), s('Backblaze', 'Backup', 9, 'Files', 0.4, { per_seat: true }), ...COMMON],
    pains: [bi('Galleries expire before the client downloads', 'Las galerías vencen antes de que el cliente descargue'), bi('Contracts and invoices in three different apps', 'Contratos y facturas en tres apps distintas'), bi('Editing backlog invisible until it is late', 'El atraso de edición se ve cuando ya es tarde')],
    kpis: [{ label: bi('Shoots this month', 'Sesiones del mes'), sample: '18' }, { label: bi('Galleries delivered', 'Galerías entregadas'), sample: '14' }, { label: bi('Print sales', 'Venta de impresiones'), sample: '$4,120' }],
    motifs: ['studio with a softbox and backdrop', 'photographer at golden hour', 'gallery proof on a laptop', 'print box on a table'], verbs: bi('runs the studio', 'dirige el estudio'),
  },
  other: {
    label: bi('Other small business', 'Otro negocio'),
    departments: [bi('Operations', 'Operaciones'), bi('Sales', 'Ventas'), bi('Marketing', 'Marketing'), bi('Money', 'Finanzas')],
    business_roles: ['owner', 'manager', 'staff'], life_roles: ['owner', 'spouse/partner', 'kids', 'accountant'],
    stack: [s('HubSpot Starter', 'CRM', 20, 'CRM', 0.4, { per_seat: true }), ...COMMON],
    pains: [bi('Too many tools', 'Demasiadas herramientas'), bi('Nothing talks to anything', 'Nada se conecta con nada')],
    kpis: [{ label: bi('Open tasks', 'Tareas abiertas'), sample: '24' }, { label: bi('Revenue MTD', 'Ingresos del mes'), sample: '$41,900' }],
    motifs: ['owner at a desk with morning light', 'team standup', 'dashboard on a TV'], verbs: bi('runs the business', 'lleva el negocio'),
  },
} satisfies Record<string, IndustryDef>;

/** Every key of the catalog. `src/engine/types.ts` re-exports it, so the union grows with the catalog and no type file is edited. */
export type IndustryKey = keyof typeof DEFS;
export const INDUSTRIES: Record<IndustryKey, Industry> = Object.fromEntries((Object.keys(DEFS) as IndustryKey[]).map((key) => [key, { key, ...DEFS[key] }])) as Record<IndustryKey, Industry>;
export const industry = (key: string): Industry => INDUSTRIES[(key in INDUSTRIES ? key : 'other') as IndustryKey];
export const INDUSTRY_KEYS = Object.keys(INDUSTRIES) as IndustryKey[];

/** The sub-industry a prospect stores, or null when it has none or the catalog no longer lists it. */
export const subIndustryFor = (p: { industry: string; sub_industry?: string | null }): SubIndustry | null => (p.sub_industry ? industry(p.industry).sub?.find((x) => x.key === p.sub_industry) ?? null : null);

/**
 * The industry as this prospect experiences it (T55): the catalog entry with its sub-industry's `departments`, `kpis`, `pains`, `motifs`, `roles` (as `business_roles`) and `meter` in place of the industry's own, when the sub gives them.
 * `key`, `label`, `verbs`, `stack`, `sub` and `life_roles` stay the industry's. Without a sub (or with one that adds nothing) the very same `Industry` object comes back, so every existing prospect and page is byte-for-byte unchanged.
 */
export function industryFor(p: { industry: string; sub_industry?: string | null }): Industry {
  const ind = industry(p.industry);
  const sub = subIndustryFor(p);
  if (!sub) return ind;
  const patch: Partial<Industry> = {};
  if (sub.departments?.length) patch.departments = sub.departments;
  if (sub.kpis?.length) patch.kpis = sub.kpis;
  if (sub.pains?.length) patch.pains = sub.pains;
  if (sub.motifs?.length) patch.motifs = sub.motifs;
  if (sub.roles?.length) patch.business_roles = sub.roles;
  if (sub.meter) patch.meter = sub.meter;
  return Object.keys(patch).length ? { ...ind, ...patch } : ind;
}

/** Every tool name the catalog knows, longest first so "Square for Restaurants" matches before "Square" (used by the S-02 paste-facts extractor). */
export const CATALOG_TOOLS: { tool: string; category: string; replaced_by: string; industries: IndustryKey[] }[] = (() => {
  const m = new Map<string, { tool: string; category: string; replaced_by: string; industries: IndustryKey[] }>();
  for (const key of Object.keys(INDUSTRIES) as IndustryKey[]) for (const item of INDUSTRIES[key].stack) {
    const hit = m.get(item.tool);
    if (hit) { if (!hit.industries.includes(key)) hit.industries.push(key); continue; }
    m.set(item.tool, { tool: item.tool, category: item.category, replaced_by: item.replaced_by, industries: [key] });
  }
  return [...m.values()].sort((a, b) => b.tool.length - a.tool.length || a.tool.localeCompare(b.tool));
})();
export const CATALOG_TOOL_NAMES = CATALOG_TOOLS.map((t) => t.tool);

/** The first priced catalog item for a tool name across every industry (so a sub-industry's `extra_tools` can pull e.g. `Vagaro` into pet care with its salon price), or undefined when the catalog does not know the tool. */
export function catalogItem(tool: string): StackItem | undefined {
  for (const key of INDUSTRY_KEYS) { const hit = INDUSTRIES[key].stack.find((x) => x.tool === tool); if (hit) return hit; }
  return undefined;
}
