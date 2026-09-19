import { createElement as h } from 'react';
import type { RouteDef } from '../../specs/types';
import { EVERYONE } from '../../auth/roles';
import { BookPage } from './BookPage';
import { ConfirmedPage } from './ConfirmedPage';
import { bookSpec, confirmedSpec } from './specs';

export const routes: RouteDef[] = [
  { path: '/book/:prospectId', element: h(BookPage), spec: bookSpec, roles: EVERYONE, surface: 'public' },
  { path: '/book/:prospectId/confirmed', element: h(ConfirmedPage), spec: confirmedSpec, roles: EVERYONE, surface: 'public' },
];

export const strings = {
  'booking.minutes': { en: '{n} minutes', es: '{n} minutos' },
  'booking.h1': { en: 'Pick a time, {first} - we walk you through it live.', es: 'Elige una hora, {first}: te lo mostramos en vivo.' },
  'booking.sub': { en: 'Fifteen minutes on screen share: your own system for {business}, role by role, and what it replaces. No slides, no pressure - you keep the workspace either way.', es: 'Quince minutos compartiendo pantalla: tu propio sistema para {business}, rol por rol, y qué reemplaza. Sin diapositivas ni presión: el workspace es tuyo de todos modos.' },
  'booking.step1': { en: '1 · Choose a time', es: '1 · Elige una hora' },
  'booking.step2': { en: '2 · Where do we send the link?', es: '2 · ¿A dónde enviamos el enlace?' },
  'booking.tz_note': { en: 'Times shown in {tz} ({city})', es: 'Horas en {tz} ({city})' },
  'booking.choose_day': { en: 'Choose a day', es: 'Elige un día' },
  'booking.requested_slot': { en: 'requested', es: 'solicitada' },
  'booking.closed': { en: 'closed', es: 'cerrado' },
  'booking.pick_first': { en: 'Pick a time above and this opens up.', es: 'Elige una hora arriba y esto se activa.' },
  'booking.change': { en: 'Change', es: 'Cambiar' },
  'booking.name': { en: 'Your name', es: 'Tu nombre' },
  'booking.email': { en: 'Email', es: 'Correo' },
  'booking.email_hint': { en: 'The call link and your workspace link go here.', es: 'Aquí llega el enlace de la llamada y de tu workspace.' },
  'booking.phone': { en: 'Phone', es: 'Teléfono' },
  'booking.optional': { en: 'Optional', es: 'Opcional' },
  'booking.note': { en: 'Anything we should see first?', es: '¿Algo que debamos ver primero?' },
  'booking.note_hint': { en: 'Who else joins, which role matters most, the tool you want gone.', es: 'Quién más entra, qué rol importa más, la herramienta que quieres eliminar.' },
  'booking.err_name': { en: 'We need a name for the invite.', es: 'Necesitamos un nombre para la invitación.' },
  'booking.err_email': { en: 'That email does not look right.', es: 'Ese correo no parece válido.' },
  'booking.confirm_cta': { en: 'Confirm my 15 minutes', es: 'Confirmar mis 15 minutos' },
  'booking.confirm_hint': { en: 'You are booking {slot}. We hold it as soon as you confirm.', es: 'Estás reservando {slot}. Lo apartamos al confirmar.' },
  'booking.open_demo': { en: 'Open your demo', es: 'Abrir tu demo' },
  'booking.save_failed': { en: 'We could not save that booking', es: 'No pudimos guardar la reserva' },
  'booking.dev_title': { en: 'Dev note: mock calendar', es: 'Nota dev: calendario simulado' },
  'booking.dev_body': { en: 'Availability is a deterministic hash of the prospect id, day and time - identical on every machine. The real provider (Cal.com / Calendly) lands in T42 behind the same shape; the bookings table and the booking_started / booking_confirmed events are already real.', es: 'La disponibilidad es un hash determinista del id del prospecto, el día y la hora: idéntica en cualquier equipo. El proveedor real (Cal.com / Calendly) llega en T42 con la misma forma; la tabla bookings y los eventos booking_started / booking_confirmed ya son reales.' },
  'booking.unknown_title': { en: 'We could not find that workspace', es: 'No encontramos ese workspace' },
  'booking.unknown_body': { en: 'The link may have expired. Open the hub and pick a prospect, or ask us for a fresh one.', es: 'El enlace puede haber caducado. Abre el hub y elige un prospecto, o pídenos uno nuevo.' },
  'booking.to_hub': { en: 'Go to the hub', es: 'Ir al hub' },
  'booking.none_title': { en: 'No booking on file yet', es: 'Aún no hay reserva' },
  'booking.none_body': { en: 'Nothing has been confirmed for this workspace. Pick a time and we will hold it.', es: 'No hay nada confirmado para este workspace. Elige una hora y la apartamos.' },
  'booking.pick_time': { en: 'Pick a time', es: 'Elegir una hora' },
  'booking.confirmed_h1': { en: 'You are on the calendar, {first}.', es: 'Ya estás en el calendario, {first}.' },
  'booking.confirmed_sub': { en: '{minutes} minutes, screen share, walking through {business}\'s own system. We send the link to the email you gave us.', es: '{minutes} minutos, pantalla compartida, recorriendo el sistema de {business}. Enviamos el enlace al correo que nos diste.' },
  'booking.next_1': { en: 'You get a confirmation with the call link.', es: 'Recibes una confirmación con el enlace de la llamada.' },
  'booking.next_2': { en: 'We keep building on {business}\'s workspace before we meet.', es: 'Seguimos construyendo el workspace de {business} antes de vernos.' },
  'booking.next_3': { en: 'On the call you drive: we switch roles and devices while you watch.', es: 'En la llamada tú mandas: cambiamos de rol y dispositivo mientras miras.' },
  'booking.add_calendar': { en: 'Add to calendar', es: 'Añadir al calendario' },
  'booking.ics_will': { en: 'download an .ics file and offer the provider link for this slot', es: 'descargar un archivo .ics y ofrecer el enlace del proveedor para esta hora' },
  'booking.back_page': { en: 'Back to your page', es: 'Volver a tu página' },
  'booking.ref': { en: 'Reference {id}', es: 'Referencia {id}' },
  'booking.status_requested': { en: 'Requested', es: 'Solicitada' },
  'booking.status_confirmed': { en: 'Confirmed', es: 'Confirmada' },
  'booking.status_cancelled': { en: 'Cancelled', es: 'Cancelada' },
  'booking.status_completed': { en: 'Completed', es: 'Completada' },
};
