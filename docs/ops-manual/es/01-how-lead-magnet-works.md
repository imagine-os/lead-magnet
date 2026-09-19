---
title: Cómo funciona Lead Magnet
role: todos
part: I
version: 0.4.0
updated: 2026-09-19
summary: El embudo de principio a fin, quién hace qué, y una lista honesta de qué es real hoy frente a qué sigue siendo simulado.
---

# Cómo funciona Lead Magnet

Casi todas las agencias mandan una presentación. Nosotros mandamos un **sistema operativo funcionando con el nombre del prospecto encima**. Antes de la primera llamada, el prospecto puede abrir una página con su marca, entrar a una demo en vivo de su propio espacio de trabajo, ver cuánto le cuesta al año su conjunto actual de herramientas y agendar una llamada de quince minutos, todo sin llenar ningún formulario.

El imán no es un PDF. El imán es el producto, ya construido para una sola persona.

## El embudo, en orden

1. **Investigación** — un estratega crea el prospecto con lo que tenga (un nombre, un negocio, una ciudad). La entrevista pregunta primero lo más pesado que no sabemos y sube la confianza respuesta a respuesta.
2. **Adivinar el stack** — el motor nombra el software que el negocio casi seguro paga, con un precio mensual por herramienta, y qué módulo nuestro lo reemplaza.
3. **Componer** — el motor ordena cuatro arquetipos de página para ese prospecto y compone la página en inglés y español a la vez. El estratega elige, previsualiza a ancho de teléfono y de portátil, y publica.
4. **Publicar por 14 días** — la página sale en vivo con una URL que nunca se mueve y una fecha de caducidad honesta impresa en la página.
5. **Contactar** — un mensaje por el canal que corresponda, apuntando a esa página. Las aperturas y los clics vuelven al embudo.
6. **La abren** — portada con su nombre, el número de ahorro, una vista para cada rol de su negocio *y de su vida*, y una sola llamada a la acción principal: abrir la demo.
7. **Juegan con la demo** — nunca bloqueada. Cambio de rol, departamentos, dinero, comunicaciones, su vista de vida.
8. **Agendan** — el calendario está dentro de la página, no es un enlace a la herramienta de reservas de otro.
9. **La llamada guiada** — quince minutos, su pantalla, sus datos, terminando en la propuesta.
10. **Adaptar** — cada sección vista, profundidad de scroll, clic en CTA y cambio de rol se registra, y el motor lo convierte en una recomendación: cambiar de arquetipo, acortar la página, preguntar más.

Los capítulos II a V son ese embudo en detalle. El capítulo II cubre los pasos 1 y 2, el III cubre 3 y 4, el IV cubre 5, 6 y 10, y el V cubre 8 y 9.

[screenshot: HUB-01 — El hub: cada superficie del producto desde una sola pantalla]

## Quién hace qué

El producto trae cinco roles. Los permisos son cadenas de texto, y cada página pide un permiso en lugar de comparar nombres de rol, así que agregar un rol nunca obliga a reescribir una página.

{{roles}}

En la práctica: el **estratega** vive en el Studio (investigar, componer, publicar, contactar). El **analista** vive en Analítica (el embudo, los eventos, las reservas) y puede leer pero no publicar. El **super admin** somos nosotros, con el modo desarrollador encendido. El **prospecto** solo ve su página, su demo, el formulario de reserva y la propuesta. **Invitado** es el sitio público.

Hasta que exista autenticación real, puedes ser cualquiera de ellos: el selector de rol en el hub y el interruptor de modo desarrollador para el super admin.

## Todas las superficies del producto

Estas son rutas vivas leídas de la aplicación en ejecución, no una lista que alguien escribió:

{{stats}}

El manual de operaciones que estás leyendo es su propia superficie:

{{routes:manual}}

Las superficies del estratega:

{{routes:studio}}

## Los tres prospectos de los datos demo

Todo lo de este manual se puede practicar con prospectos ficticios ya cargados. Son distintos entre sí a propósito: temperatura, idioma, tamaño de equipo y, por lo tanto, arquetipo.

{{prospects}}

Maya es tibia, habla inglés y tiene un equipo pequeño. Daniel es frío, habla español primero y tiene dos sedes. Priya es caliente, llegó por referencia y tiene más de sesenta empleados en tres conceptos. Si un cambio funciona para los tres, funciona.

## Qué es real y qué es simulado

Ser honestos con esto es una regla, no una cortesía. Todo lo que todavía no funciona va envuelto en un marcador que lo dice al pasar el cursor, al enfocar con el teclado y al hacer clic; nunca un botón mudo.

**Real hoy:** el motor de personalización (adivinar el stack, los ahorros, las vistas por rol, la puntuación de arquetipos, la composición de la página en dos idiomas), los cuatro arquetipos de página, la demo del OS, las reservas con una rejilla de horarios real, el studio completo, la analítica sobre eventos reales (incluida la lectura A/B en A-01), el plan, la propuesta, la documentación, este manual, el bus de acciones con paleta de comandos y control por voz sobre cada acción, la navegación con flechas y d-pad de mando en cada shell, inglés y español en todas partes, y el sistema de diseño.

**Simulado hoy:** la identidad (los usuarios son filas demo, no cuentas), el almacén de datos (un proveedor simulado en el navegador, así que tus cambios viven solo en tu navegador), la generación de imágenes y video, el enriquecimiento con IA desde su sitio web, el envío real por cualquier canal, el proveedor de calendario detrás de las reservas, y los pagos.

**Qué cambia cuando llegue el backend:** el proveedor de datos se cambia detrás de la misma interfaz, así que las páginas no cambian. Cada escritura ya pasa por `update(tabla, id, cambio)` por id, y cada fila ya lleva `id` y `updated_at`, que es lo que hará posible el tiempo real y la edición concurrente después.

> DECISION NEEDED: ¿Qué proveedor de calendario respalda los horarios de reserva cuando dejemos de simularlos? La rejilla de horarios, las zonas horarias y la confirmación ya están construidas; solo falta el proveedor.

## Las reglas que no se doblan

- La demo **nunca** está detrás de un formulario.
- Una sola llamada a la acción principal, repetida; una secundaria con el calendario dentro de la página.
- La fecha de caducidad es real. Nunca mostramos una cuenta regresiva falsa.
- Un número que el sistema conoce nunca se escribe a mano en un capítulo de este manual. Se trae en vivo. Por eso las tablas de arriba no pueden quedar desactualizadas.
- Cada botón del producto es una acción con nombre y una frase de intención, para que el mismo vocabulario sirva con ratón, teclado, pantalla táctil o lápiz, el d-pad de un control remoto y comandos de voz, todo por el mismo bus de acciones.

## Bandas de precio

Nuestro propio precio se deriva del tamaño del equipo y del número de sedes, nunca se cotiza de memoria:

{{pricebands}}

## El embudo de un vistazo

{{kpi:funnel}}
