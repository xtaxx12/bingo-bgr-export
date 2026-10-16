# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- Operador del bingo de BGR Export: canta con «Cantar siguiente bola» (sorteo aleatorio integrado) o carga el número que sale de un bombo físico, en vivo y con rapidez (teclado + clic).
- Jugadores en la sala: miran la proyección en TV/pantalla grande a distancia; no interactúan con el tablero.

## Product Purpose

Dashboard de bingo corporativo de BGR Export: sacar o registrar cada bola, mostrarla en grande y con voz, llevar historial con hora y la tabla 1–75 legible a distancia, y celebrar al ganador cuando el operador lo confirma. Éxito = el operador canta sin fricción y la sala lee cada número sin esfuerzo desde lejos.

## Positioning

Dos rituales en una herramienta: sorteo aleatorio sin repeticiones (azar criptográfico) o presentador del canto de un bingo físico. Nunca declara ganadores por sí solo. Un solo archivo y sin backend.

## Operating Context

- Ritual en vivo: el operador pulsa «Cantar siguiente bola» (o Espacio), o saca la bola física y la registra aquí (input + Enter o clic en celda).
- Proyección en TV con ventana aparte sin controles (`?vista=proyeccion`), sincronizada por BroadcastChannel + evento storage; también «Proyectar en esta ventana» (P / Esc).
- Interfaz en español; cámara 3D sin órbita automática, con vistas General / Bombo / Tabla 3D.
- Correcciones frecuentes: Deshacer (última bola exacta), quitar desde el tablero o el historial con confirmación.

## Capabilities and Constraints

- Un solo archivo `index.html`, ejecutable con doble clic, sin instalar nada ni backend. El logo va incrustado como data URI (necesario para usarlo como textura WebGL desde file://).
- Three.js + OrbitControls desde CDN (unpkg); Montserrat desde Google Fonts; Web Audio API y SpeechSynthesis en español.
- Lógica pura del sorteo en `<script id="bingo-logic">`, probada con `npm test` (tests/logica.test.mjs).
- Funciones: sorteo aleatorio sin duplicados, marcado manual 1–75, deshacer/quitar, reinicio con confirmación, historial con hora, ganador solo con confirmación (sincronizado a TV), tabla completa informativa, configuración (voz, efectos, volumen, intensidad, reducir animaciones, gráficos bajos, tema, logo en TV, vista del tablero).
- Restricción del usuario: conservar el 3D (bombo, tabla 3D, bandeja, vuelo de la bola); se añadió la vitrina de la última bola. En TV la tabla 3D se oculta porque el tablero HTML va al lado.
- Dolor principal a resolver: legibilidad en TV.

## Brand Commitments

Nombre en pantalla: BINGO BGR EXPORT. Identidad BGR Export: fondo azul marino profundo (#080E2B), paneles índigo (#111B42), bordes azul acero, naranja corporativo (#FF702F) como color de acción y de números cantados. Logo real de BGR Export (versión a color en el cartel 3D, versión negativa con «BGR» en blanco sobre fondo oscuro); nunca redibujarlo. Colores por letra confirmados: B azul, I rojo, N verde, G amarillo, O morado. Referencia visual: boceto de dashboard aportado por el usuario (modo operador, TV, ganador, historial y configuración).

## Evidence on Hand

- Implementación vigente: `index.html`. Legado 2D: `bingo.html`.
- Logo fuente: `logoBGR.jpg` (PNG transparente 1500×598) del proyecto shrimp-plant-monorepo.
- Sin testimonios, métricas ni resultados reales; no fabricarlos.

## Product Principles

1. La sala primero: cada número debe leerse a 5+ metros sin esfuerzo.
2. Carga sin fricción: marcar un número toma segundos, corregir un error menos.
3. El 3D acompaña, no estorba: espectáculo al cantar, calma el resto del tiempo.
4. Un archivo, cero instalación: sigue abriéndose con doble clic.

## Accessibility & Inclusion

Lectura a distancia en TV (tipografía grande, alto contraste); voz en español como refuerzo sonoro con interruptor para silenciarla.
