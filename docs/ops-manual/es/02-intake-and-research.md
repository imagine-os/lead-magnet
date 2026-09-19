---
title: Entrevista e investigación
role: estratega
part: II
version: 0.4.0
updated: 2026-09-19
summary: Crear un prospecto, correr la entrevista adaptativa, subir la confianza y confirmar el stack antes de componer nada.
---

# Entrevista e investigación

La página se escribe sola a partir del perfil. Así que el perfil es el trabajo.

Un perfil débil produce una página que podría ser de cualquiera, y una página que podría ser de cualquiera convierte como la de cualquiera. Veinte minutos de investigación son la diferencia entre "ya construimos tu sistema operativo" y una plantilla con un logo encima.

## Crear el prospecto

El inicio del Studio lista cada prospecto con su temperatura, su confianza, su página en vivo, su último evento y el estado de la reserva. "Nuevo prospecto" pide casi nada: un nombre, un negocio, una ciudad y una industria. Al guardar, el sistema hace tres cosas de inmediato:

1. Saca los **roles** de esa industria del catálogo (una clínica dental recibe dentista dueño, gerente de consultorio, recepción, higienista, facturación; un grupo de restaurantes recibe gerente general, chef, líder de turno, anfitrión, eventos).
2. Ejecuta **`guessStack()`** y escribe una fila de herramienta adivinada por categoría con su precio mensual.
3. Te deja en el perfil, donde la entrevista ya está haciendo su primera pregunta.

Elige la industria con cuidado. Es el campo más pesado de todos, y siembra los roles, los dolores, los indicadores y los motivos visuales que leerán todas las secciones siguientes.

[screenshot: S-02 — El perfil del prospecto: medidor de confianza, entrevista, stack, roles, estilo]

## La entrevista adaptativa

La entrevista no es un formulario. Es un ciclo que pregunta primero **el campo desconocido más pesado** y recalcula la confianza después de cada respuesta. Puedes responder en cualquier orden, salir y volver, y responder el mismo campo otra vez con algo mejor.

Pesos de los campos, de mayor a menor: industria, nombre del negocio, nombre de pila, sub-industria (cuando el catálogo tiene una para esa industria), tamaño del equipo, herramientas conocidas, sedes, roles del negocio, roles de vida, estilo, temperatura. La confianza es la proporción ponderada de lo que sabemos, de 0 a 1. La sub-industria solo se pregunta cuando la industria realmente se ramifica (un consultorio dental, no un lavado de autos), y para los prospectos donde no aplica queda fuera del denominador por completo, así que su barra de confianza nunca se queda corta por una pregunta que nunca fue suya.

Tres hábitos aceleran esto:

- **Responde con evidencia, no con suposiciones.** La página de empleos de su sitio nombra su software mucho más seguido que la página principal. Un anuncio que pide "experiencia en Dentrix" vale más que una corazonada.
- **Los roles de vida son la sorpresa.** Los roles del negocio son obvios. La frase que hace que un dueño se enderece es una vista para su pareja, sus hijos, su contador, su coach. Pregunta quién más toca este negocio y anótalo.
- **El estilo es investigación, no gusto.** Toma la paleta de su rótulo real, de su camioneta, de su cuadrícula de Instagram. Cinco colores: primario, acento, fondo, superficie, texto. Si aciertas el primario, la página se ve como ellos a primera vista.

### La puerta de confianza

Publicar está bloqueado por debajo del **30 % de confianza** salvo que actives explícitamente la anulación, y activarla queda registrado. No es burocracia: una página compuesta con tres campos conocidos es peor que ninguna página, porque quema la única oportunidad que tienes con ese prospecto.

Dónde sueles estar:

- **Menos de 30 %** — tienes un nombre y una ciudad. Sigue investigando.
- **30–60 %** — publicable como página de auditoría en frío, donde el prospecto corrige tus estimaciones y la página funciona aunque algunas estén mal.
- **Más de 60 %** — publicable con cualquier arquetipo, incluidos el reveal y la carta personal.

La entrevista también es el lugar honesto para decir lo que no sabemos. "Enriquecer con IA" —leer su sitio y sus redes para sacar paleta, tono, herramientas y personas— está diseñado y visible pero **no conectado**. Es un marcador que lo dice. El enriquecedor por reglas que llena los roles desde el catálogo de industrias sí es real y funciona hoy.

## Confirmar el stack

Debajo de la entrevista, el stack adivinado es una lista de herramientas con precios mensuales y una confianza por fila. Cada fila tiene tres estados:

- **adivinada** — nuestra estimación, calculada por asientos y sedes.
- **confirmada** — tienes evidencia de que la pagan. La fila se fija y el precio pasa a ser de ellos, no nuestro.
- **rechazada** — no la usan. La fila sale por completo del cálculo de ahorros.

Los totales de ahorro se actualizan en vivo mientras confirmas y rechazas. Esto importa por una razón: en el arquetipo de auditoría el prospecto ve estos números y puede corregirlos, y **un número que pueden corregir vale más que un número que deben creer**. Una estimación equivocada que se queda en la lista hace que toda la página se sienta como una factura de un desconocido. Una estimación que corrigen hace que la página se sienta como una conversación.

Confirma lo que puedas probar, rechaza lo que te dijeron, y deja las estimaciones honestas como estimaciones.

## A qué apuntas antes de componer

- Industria, nombre del negocio, nombre de pila, ciudad: seguros.
- Tamaño del equipo y sedes: correctos con una o dos personas de margen, porque determinan la banda de precio y las vistas por rol.
- Al menos dos herramientas confirmadas o rechazadas.
- Roles del negocio y de vida escritos con las palabras que ellos usarían.
- Una paleta tomada de algo real.
- Temperatura puesta con honestidad: fría si nadie ha hablado con ellos, tibia si nos conocen, caliente si ya hubo una conversación humana.

La temperatura decide el arquetipo más que ninguna otra cosa, así que no la infles por optimismo.

{{kpi:intake}}

> DECISION NEEDED: ¿Cuánto del enriquecimiento con IA debe correr automáticamente al crear el prospecto y cuánto solo cuando el estratega lo pida? Automático es más rápido; bajo demanda mantiene la investigación honesta y los costos predecibles.
