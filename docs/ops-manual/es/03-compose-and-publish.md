---
title: Componer y publicar
role: estratega
part: III
version: 0.4.0
updated: 2026-09-19
summary: Elegir arquetipo, previsualizar la página real, la regla de los 14 días, URLs que nunca se mueven y cómo correr variantes.
---

# Componer y publicar

Componer no es escribir. Cada campo de texto de cada sección ya viene resuelto en inglés y español a partir del perfil. Tu trabajo es elegir la **forma** de la página y verificar que lo que escribió el motor sea verdad.

## Los cuatro arquetipos

{{archetypes}}

Las puntuaciones de arriba se calculan en vivo para los prospectos cargados, con las razones que da el motor. Las formas en sí:

**El Reveal** (`/p/:slug`) — el predeterminado. Abre con "ya lo construimos", muestra su OS en teléfono, portátil y televisor, y luego el bloque de ahorros, las vistas por rol, las pruebas, las preguntas frecuentes, la banda de CTA y la reserva integrada. Bueno para casi todo el tráfico frío y tibio. Riesgo: es largo, así que necesita movimiento que lo sostenga.

**La Auditoría de ahorros** (`/p/:slug/audit`) — abre con dinero: lo que pagan hoy, herramienta por herramienta, tachado. El prospecto confirma o rechaza cada herramienta y el contador se mueve. Bueno para dueños fríos y sensibles al precio, y para perfiles de poca confianza, porque la página hace la investigación por ti. Riesgo: si tus estimaciones están mal y no se pueden corregir, se lee como una factura.

**El Recorrido** (`/p/:slug/story`) — "así es un martes en tu negocio, la semana que viene", una escena por rol de 7:10 a 21:00. Bueno para negocios de servicio tibios con muchos roles. Riesgo: se muere si la historia se alarga.

**La Carta** (`/p/:slug/letter`) — una nota personal corta sobre su aplicación con su marca, luego las cuatro objeciones de cambio respondidas de un tirón, y al CTA. Buena para caliente, referido y ticket alto. Riesgo: muy poca prueba para alguien frío. **Úsala solo cuando una persona ya haya hablado con ellos.**

El compositor ordena los cuatro y muestra las razones. Sigue el orden salvo que sepas algo que el motor no sabe; y si sabes algo que el motor no sabe, eso va en el perfil, no en tu cabeza.

[screenshot: S-03 — El compositor: orden de arquetipos, variante, vista previa en vivo, publicar]

## Previsualiza la página real

La vista previa del compositor no es un nuevo render de las secciones dentro del studio. Es **la ruta pública real dentro de un marco**, a 390 y a 1280. Hay exactamente un renderizador de páginas de aterrizaje, y es la página de aterrizaje.

Revisa tres cosas cada vez:

1. **Lo visible sin hacer scroll a 390 px.** Su nombre, su negocio, su paleta, su ciudad, visibles antes de cualquier desplazamiento. Si la portada podría ser de cualquiera, vuelve al perfil.
2. **El número de ahorro.** Léelo en voz alta como una oración. Si no es creíble para un negocio de ese tamaño, alguna estimación del stack está mal.
3. **Las vistas por rol.** Sobre todo los roles de vida. Si no están "contador" y "pareja", te perdiste la frase que sorprende.

Después cambia el idioma y lee el español. Todos los arquetipos son bilingües por construcción, y un prospecto que habla español abre su página en español automáticamente, pero el español compuesto igual merece un par de ojos humanos.

## Publicar, y la regla de los 14 días

Publicar marca `published_at = ahora` y `expires_at = ahora + 14 días`.

La caducidad es real. La página dice cuánto tiempo estará en vivo, la cuenta regresiva es honesta, y al vencer la página se reemplaza por un estado de caducidad que aún ofrece una llamada. No usamos escasez falsa, porque es lo único que, si te descubren, cuesta la relación entera. Catorce días también es una verdad sobre nosotros: construimos esto de a una persona a la vez y no podemos alojar el de todos para siempre.

La **URL queda congelada** en la primera publicación. Volver a publicar recompone el modelo y conserva la dirección, así que un enlace que mandaste por correo nunca se rompe. Si necesitas una página genuinamente distinta para el mismo prospecto, eso es una variante, no una URL nueva.

Caducar conserva la copia compuesta, así que la ficha de la página, la analítica y la propuesta siguen resolviendo después del vencimiento. No se borra nada.

## Copias, no recomposición en vivo

Una página publicada guarda el modelo compuesto como una copia fija. La página **renderiza esa copia**; nunca recalcula desde el perfil al momento de verse. Dos consecuencias que vale la pena recordar:

- Editar el perfil después de publicar **no** cambia la página en vivo. Vuelve a publicar para empujar tus cambios.
- Una página de la semana pasada se sigue viendo exactamente como la vio el prospecto, que es lo que hace honesta a la analítica.

## Variantes

El campo de variante es una letra, A por defecto. Publica A, publica B en su contra y compara en analítica. Vale la pena correr dos pruebas primero:

- **Reveal contra Auditoría en tráfico frío.** La hipótesis es que el dinero abre puertas más frías que el oficio.
- **Reveal contra Recorrido en negocios de servicio tibios.** La hipótesis es que un día en la vida gana sobre un recorrido de producto cuando ya nos conocen.

Las dos son hipótesis. Ninguna se ha medido todavía, y nadie debería presentarlas como resultados.

> DECISION NEEDED: ¿Las variantes A y B dividen el tráfico en la misma URL, o viven en enlaces distintos para segmentos distintos? Dividir en la misma URL requiere un servidor; enlaces separados se pueden entregar hoy.

## Antes de mandar el enlace

- Vista previa a 390 y 1280, en los dos idiomas.
- Número de ahorro creíble, estimaciones del stack defendibles.
- Roles de vida presentes.
- Fecha de caducidad correcta y visible en la página.
- La demo se abre desde la página con un clic y sin formulario de por medio.
- Agenda tú mismo un horario una vez, para comprobar que el calendario funciona en la zona horaria de ese prospecto.
