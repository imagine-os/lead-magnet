import type { RouteDef } from '../../specs/types';

/**
 * Module `annotations` (T49). No routes of its own: the feature is the AnnotationLayer organism (mounted globally by
 * DevTools) and the D-09 inbox. It exists as a module so its strings join the app string table the same way every
 * other module's do - a globally mounted component has no module of its own to hang `useT()` keys on.
 */
export const routes: RouteDef[] = [];

export const strings = {
  // --- the layer ---
  'annot.tools': { en: 'Annotation tools', es: 'Herramientas de anotación' },
  'annot.annotate': { en: 'Annotate', es: 'Anotar' },
  'annot.annotating': { en: 'Pick an element', es: 'Elige un elemento' },
  'annot.toggle_hint': { en: 'Annotate mode: click or focus any element and press Enter to comment on it. Escape leaves.', es: 'Modo anotación: haz clic o enfoca cualquier elemento y pulsa Enter para comentarlo. Escape sale.' },
  'annot.hint': { en: 'Annotate mode: click an element, or Tab to it and press Enter. Escape leaves.', es: 'Modo anotación: haz clic en un elemento, o tabula hasta él y pulsa Enter. Escape sale.' },
  'annot.pins': { en: 'pins', es: 'marcas' },
  'annot.open_list': { en: 'Open the list of {n} annotations on this page', es: 'Abrir la lista de {n} anotaciones de esta página' },
  'annot.pin_label': { en: 'Annotation {n}: {kind} from {who}', es: 'Anotación {n}: {kind} de {who}' },
  'annot.thread': { en: 'Annotation {n}', es: 'Anotación {n}' },
  'annot.all_on_page': { en: 'Annotations on {page}', es: 'Anotaciones en {page}' },
  'annot.list_hint': { en: '{placed} pinned on the page, {orphans} whose element is gone (listed here only).', es: '{placed} marcadas en la página, {orphans} cuyo elemento ya no existe (solo aquí).' },
  'annot.none': { en: 'Nothing has been annotated on this page yet.', es: 'Todavía no se ha anotado nada en esta página.' },
  'annot.orphan': { en: 'element gone', es: 'elemento ausente' },
  'annot.no_element': { en: 'no element recorded', es: 'sin elemento registrado' },
  'annot.open_thread': { en: 'Open thread', es: 'Abrir hilo' },
  'annot.close': { en: 'Close', es: 'Cerrar' }, 'annot.cancel': { en: 'Cancel', es: 'Cancelar' },
  'annot.new_on': { en: 'Annotate {component}', es: 'Anotar {component}' },
  'annot.kind': { en: 'Kind', es: 'Tipo' },
  'annot.what': { en: 'What did you see, or what do you want?', es: '¿Qué viste, o qué quieres?' },
  'annot.what_placeholder': { en: 'Be concrete: what happened, what you expected, on which element.', es: 'Sé concreto: qué pasó, qué esperabas, en qué elemento.' },
  'annot.file': { en: 'File it', es: 'Enviar' },
  'annot.recorded': { en: 'Recorded with: {route} · {width} px · {theme} · {who} ({role})', es: 'Se registra con: {route} · {width} px · {theme} · {who} ({role})' },
  'annot.saved': { en: 'Noted', es: 'Anotado' },
  'annot.saved_body': { en: '{component} on {page} is in the inbox (D-09).', es: '{component} en {page} está en la bandeja (D-09).' },
  'annot.readonly': { en: 'Triage needs the feedback.read permission.', es: 'La clasificación requiere el permiso feedback.read.' },
  // --- kinds, statuses, triage ---
  'annot.kind_comment': { en: 'comment', es: 'comentario' }, 'annot.kind_request': { en: 'request', es: 'solicitud' },
  'annot.kind_bug': { en: 'bug', es: 'error' }, 'annot.kind_idea': { en: 'idea', es: 'idea' },
  'annot.kind_question': { en: 'question', es: 'pregunta' }, 'annot.kind_praise': { en: 'praise', es: 'elogio' },
  'annot.status_new': { en: 'new', es: 'nueva' }, 'annot.status_seen': { en: 'seen', es: 'vista' },
  'annot.status_waiting': { en: 'waiting on Justin', es: 'esperando a Justin' }, 'annot.status_done': { en: 'done', es: 'hecha' },
  'annot.triage_fix': { en: 'fix', es: 'arreglar' }, 'annot.triage_ask': { en: 'ask Justin', es: 'preguntar a Justin' },
  'annot.triage_later': { en: 'later', es: 'después' }, 'annot.triage_wontfix': { en: "won't fix", es: 'no se hará' },
  'annot.weight_binding': { en: 'binding', es: 'vinculante' }, 'annot.weight_request': { en: 'request', es: 'solicitud' }, 'annot.weight_signal': { en: 'signal', es: 'señal' },
  // --- triage panel (D-09) ---
  'annot.triage': { en: 'Triage', es: 'Clasificación' },
  'annot.triage_hint': { en: 'R-F01: write this before changing anything', es: 'R-F01: escribe esto antes de cambiar nada' },
  'annot.triage_note': { en: 'Triage note', es: 'Nota de clasificación' },
  'annot.decision_ref': { en: 'Decision ref', es: 'Referencia de decisión' },
  'annot.decision_ref_hint': { en: 'D-nnn or a changelog number; required before done (R-F01)', es: 'D-nnn o un número de changelog; obligatorio antes de hecha (R-F01)' },
  'annot.status': { en: 'Status', es: 'Estado' },
  'annot.reply': { en: 'Reply to the author', es: 'Respuesta al autor' },
  'annot.pick': { en: 'Pick one', es: 'Elige' },
  'annot.inbox': { en: 'Feedback inbox', es: 'Bandeja de comentarios' },
  'annot.inbox_hint': { en: 'Record triage, note and decision_ref before changing anything (P-08, R-F01).', es: 'Registra clasificación, nota y decision_ref antes de cambiar nada (P-08, R-F01).' },
  'annot.filter_kind': { en: 'Kind', es: 'Tipo' }, 'annot.filter_page': { en: 'Page', es: 'Página' }, 'annot.filter_all': { en: 'all', es: 'todas' },
  'annot.col_kind': { en: 'Kind', es: 'Tipo' }, 'annot.col_text': { en: 'Text', es: 'Texto' }, 'annot.col_page': { en: 'Page', es: 'Página' },
  'annot.col_component': { en: 'Component', es: 'Componente' }, 'annot.col_element': { en: 'Element', es: 'Elemento' },
  'annot.col_viewport': { en: 'Viewport', es: 'Ancho' }, 'annot.col_from': { en: 'From', es: 'De' },
  'annot.col_weight': { en: 'Weight', es: 'Peso' }, 'annot.col_triage': { en: 'Triage', es: 'Clasificación' }, 'annot.col_status': { en: 'Status', es: 'Estado' },
  'annot.empty': { en: 'Nothing here', es: 'Nada aquí' },
  'annot.empty_body': { en: 'Testers annotate from the product: turn on Annotate, bottom right, and click an element.', es: 'Los testers anotan desde el producto: activa Anotar, abajo a la derecha, y haz clic en un elemento.' },
  'annot.suggested': { en: 'Suggested: {triage} — {why}', es: 'Sugerido: {triage} — {why}' },
  'annot.guard_triage': { en: 'Triage first (R-F01)', es: 'Clasifica primero (R-F01)' },
  'annot.guard_triage_body': { en: 'Write triage and a decision_ref before marking {id} done. That is the rule that keeps the change traceable.', es: 'Escribe la clasificación y un decision_ref antes de marcar {id} como hecha. Esa es la regla que mantiene el cambio rastreable.' },
  'annot.to_justin': { en: 'Needs Justin', es: 'Necesita a Justin' },
  'annot.to_justin_hint': { en: 'sets triage = ask and status = waiting', es: 'pone clasificación = preguntar y estado = esperando' },
  'annot.open_page': { en: 'Open the page', es: 'Abrir la página' },
  'annot.triaged': { en: 'Triaged', es: 'Clasificada' },
  'annot.of_total': { en: '{n} of {total}', es: '{n} de {total}' },
};
