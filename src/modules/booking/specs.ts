import { defineSpec } from '../../specs/types';
import { EVERYONE } from '../../auth/roles';

export const bookSpec = defineSpec({
  code: 'B-01', name: 'Book a call', purpose: 'The prospect picks a 15-minute walkthrough in their own timezone, then gives a name and email at the moment of value. Themed to their brand, own slim chrome, no form before the calendar.',
  layout: ['slim top bar (wordmark, EN/ES)', 'headline + what the call is', 'slot grid (next 7 days, 15-min slots)', 'details form (name, email, phone optional, note)', 'confirm', 'dev-mode provider note'],
  data: ['prospects', 'pages', 'bookings', 'events'], roles: EVERYONE,
  logic: ['timezone guessed from prospects.city (Intl, DST-correct), working hours 09:00-17:00, lunch 12:00 blocked, weekends closed', 'mock availability is a deterministic FNV hash of prospect id + day + time, so the grid never shifts between renders or machines', '?slot=<iso> preselects a slot when it is still free', 'booking_started tracked once per session when a slot is picked; booking_confirmed on confirm with the new booking id', 'confirm inserts bookings { status: requested, duration_min: 15 } and navigates to B-02'],
  integrations: ['Booking provider (Cal.com / Calendly) - not wired, T42'],
  components: ['Card', 'Field', 'Input', 'Textarea', 'Button', 'Badge', 'Chip', 'LangToggle', 'EmptyState', 'Icon'],
  actions: [
    { id: 'booking.pickSlot', label: 'Pick a slot', intent: 'book {slot}', params: { slot: 'date' }, permission: 'booking.create' },
    { id: 'booking.clearSlot', label: 'Change time', intent: 'change the time', permission: 'booking.create' },
    { id: 'booking.confirm', label: 'Confirm', intent: 'confirm my booking', permission: 'booking.create' },
    { id: 'booking.setLang', label: 'EN / ES', intent: 'switch language to {lang}', params: { lang: 'enum:en|es' } },
    { id: 'booking.openDemo', label: 'Open your demo', intent: 'open my demo', permission: 'demo.open' },
  ],
  rules: ['R-B01', 'R-B02', 'R-B03', 'R-C01', 'R-C06'], states: ['loading', 'default', 'slot picked', 'submitting', 'unknown prospect'], checkedAt: [360, 390, 768, 1280, 1920, 2560, 3840], tone: 'form',
});

export const confirmedSpec = defineSpec({
  code: 'B-02', name: 'Booking confirmed', purpose: 'Confirms the walkthrough in words the prospect can read back, then sends them straight into their demo or landing page. Calendar files wait for the real provider.',
  layout: ['slim top bar (wordmark, EN/ES)', 'confirmation card (slot in words, duration, what happens next)', 'add to calendar (Placeholder)', 'back to your demo', 'back to your page'],
  data: ['bookings', 'prospects', 'pages'], roles: EVERYONE,
  logic: ['reads ?booking=<id> when present, otherwise the prospect\'s newest bookings row', 'slot rendered with Intl in the prospect timezone and the current language', 'add to calendar is a Placeholder until T42 (.ics / provider link)'],
  integrations: ['Booking provider (Cal.com / Calendly) - not wired, T42'],
  components: ['Card', 'Placeholder', 'Button', 'Badge', 'LangToggle', 'EmptyState'],
  actions: [
    { id: 'booking.addToCalendar', label: 'Add to calendar', intent: 'add the call to my calendar' },
    { id: 'booking.openDemo', label: 'Open your demo', intent: 'open my demo', permission: 'demo.open' },
    { id: 'booking.openPage', label: 'Back to your page', intent: 'go back to my page' },
    { id: 'booking.setLang', label: 'EN / ES', intent: 'switch language to {lang}', params: { lang: 'enum:en|es' } },
  ],
  rules: ['R-B02', 'R-B03'], states: ['loading', 'default', 'no booking found'], checkedAt: [360, 390, 768, 1280, 1920, 2560, 3840],
});
