# AiryAldea — Documento de diseño técnico y funcional

> Nombre de trabajo: **AiryAldea** (alternativa: *Airy Mania*). Subtítulo: *Leyendas de dragones*. Idioma de la interfaz: español.
> Este repositorio contiene un **prototipo jugable** en HTML5 (móvil y web) con todos los módulos. Este documento describe el juego completo y señala qué falta para la versión de producción.

Las decisiones que debe tomar el equipo están marcadas con **🔶 DECISIÓN**.

---

## 1. Visión del juego

Un juego de crianza de dragones con una aldea **visible y editable en un mapa isométrico**, al estilo de Clash of Clans, Dragon Mania Legends y Cómo entrenar a tu dragón. El jugador es un **cuidador o cuidadora de dragones**: incuba huevos, cría más de **100 especies**, construye y coloca hábitats y edificios, cultiva comida y usa a sus dragones en varios modos:

| Modo | Inspiración | Dónde se entra |
|---|---|---|
| Campaña 1 contra 1 por turnos | Dragon Mania Legends | Batallas › Campaña |
| **Asaltos 3 contra 3 por turnos a aldeas rivales** | DML / Cómo entrenar a tu dragón | Edificio **Fuerte de asalto** de la aldea (o Batallas › Asaltos) |
| Duelo online 1 contra 1 | DML (PvP) | Batallas › Online |
| Arena de aldeas con cartas (minijuego) | Clash Royale / Castle Crush | Edificio **Portal de la arena** o Minijuegos |
| Saltos del dragón (minijuego) | Plataformas tipo Mario | Edificio **Cascada de saltos** o Minijuegos |

**Pilares:**
- Todo se desbloquea poco a poco: especies, elementos, hábitats, edificios y cultivos.
- Cuidar es gratificante: los dragones felices producen más.
- Cada modo alimenta la economía de los demás.
- Acabado de juego profesional, no infantil.

---

## 2. Flujo de pantallas

```
Portada (paisaje + logo + carga) ─► Aviso de cookies ─► [1.ª vez] Creador de cuidador ─► Aldea
Barra inferior: Aldea · Criadero · Batallas · Minijuegos · Mercado · Perfil
  Aldea: mapa isométrico (tocar edificio/hábitat/parcela · ✋ Mover · zoom · recolectar)
         └ Gestión de hábitats · Granja · Ficha del dragón
  Criadero: incubadoras ─► eclosión · montaña de cría · dragonario (por rarezas)
  Batallas: Campaña (18 rivales) | Asaltos (3 aldeas rivales, equipo de 3) | Online
  Minijuegos: Arena de aldeas (mazo de cartas) · Saltos del dragón (10 niveles)
  Mercado: Huevos (filtros por elemento) · Hábitats · Cambio de recursos · Gemas y oro (dinero real, desactivado)
  Perfil: editor de cuidador · cuenta de Google · estadísticas · logo · información legal
  Legal: aviso legal · privacidad · cookies · consentimiento y datos · compras y reembolsos · correo · IA · redes sociales
```

---

## 3. Módulos y reglas

### 3.1 Aldea (mapa isométrico) y granja
- **Mapa**: isla de 12 × 12 casillas con mar, acantilados y decoración.
  - Los **edificios** y los **hábitats** ocupan 2 × 2 casillas y las **parcelas**, 1 × 1.
  - En modo **✋ Mover** tocas un elemento y luego una casilla verde libre para recolocarlo. La posición se guarda en la partida (`layout`).
  - Los dragones aparecen paseando sobre su hábitat. Cuando hay oro acumulado sale una moneda que se recoge tocándola.
- **Edificios y nivel para usarlos**: Criadero (1), Mercado (1), Granero (1), Cascada de saltos (2), Fuerte de asalto (3) y Portal de la arena (4). Los bloqueados se ven en gris con un candado.
- **Hábitats**: uno por elemento (10 en total).

| Hábitat | Elemento | Nivel |
|---|---|---|
| Volcán | Fuego | 1 |
| Laguna | Agua | 1 |
| Bosque | Planta | 2 |
| Cantera | Tierra | 3 |
| Nubes | Aire | 4 |
| Torre de tormenta | Rayo | 5 |
| Glaciar | Hielo | 8 |
| Forja | Metal | 10 |
| Santuario solar | Luz | 13 |
| Cripta lunar | Oscuridad | 16 |

  - Cada hábitat tiene 3 niveles de mejora. Capacidad = nivel + 1 dragones (2, 3 y 4) y tope de oro = 150 × nivel².
  - Un dragón puede vivir en cualquier hábitat de uno de sus elementos. Si no hay sitio, espera en el nido sin producir.
- **Cuidado**:
  - La saciedad baja del 100% al 0% en 4 h y la limpieza en 3 h. Felicidad = media de las dos.
  - Oro/min = base de la especie × (1 + 0,15 × (nivel − 1)) × (0,4 + 0,6 × felicidad).
- **Crecimiento**: con 4 comidas el dragón sube un nivel (máximo 30). Cada comida cuesta 5 × nivel^1,5 de comida. Etapas visuales: bebé (1–4), joven (5–9) y adulto (10+).
- **Granja**: trigo, calabaza, bayas de dragón y manzanas doradas (esta desde nivel 10). Hasta 8 parcelas.

### 3.2 Especies, elementos e incubación
- **10 elementos**: fuego, agua, planta, tierra, aire, rayo, hielo (nivel 8), metal (10), luz (13) y oscuridad (16).
- **102 especies** en 5 rarezas:

| Rareza | Cuántas | Qué son | Incubación | Precio |
|---|---|---|---|---|
| Común | 20 | 2 por elemento | 30 s | Oro |
| Rara | 45 | Un híbrido por cada pareja de elementos | 5 min | Oro |
| Épica | 20 | 10 ancestrales de un elemento + 10 de tres elementos | 30 min | Gemas |
| Legendaria | 12 | Mitología nórdica: Fénix Airy, Yggdrasil, Fáfnir, Jörmungandr… | 1 h | Gemas |
| Mítica | 5 | Airy la Primera, Ragnarök, Bifröst… | 2 h | **Solo criando** |

- **Desbloqueo por nivel**: las comunes al desbloquear su elemento; las raras a partir del nivel 6; las épicas desde el 15; las legendarias desde el 24; y las míticas desde el 36.
- **Cría**: dos dragones de nivel 5 o más y 200 🪙.
  - La cría puede ser de cualquier especie cuyos elementos estén todos entre los de los padres y cuyo nivel de desbloqueo sea como mucho el del jugador + 3.
  - La probabilidad depende de la rareza (pesos 60 / 30 / 9 / 1 / 0,3).
- **Aspecto**: cada especie se dibuja con sus colores y unos rasgos fijos calculados a partir de su nombre: 4 tipos de cuernos, marcas (rayas o manchas), corpulencia y tamaño de las púas.
  - Cada elemento añade sus efectos: llamas, aletas, hojas, cristales, plumas, rayos, escarcha, placas de metal, halo o niebla.
  - Las épicas tienen aura, las legendarias cuernos dorados y las míticas un anillo místico.
- **Estadísticas**: dependen del perfil de cada elemento (por ejemplo, el metal es defensivo y la oscuridad ofensiva), con una pequeña variación fija por especie.

### 3.3 Combate por turnos
- Habilidades por dragón:

| Habilidad | Poder | Espera | Se aprende a nivel |
|---|---|---|---|
| Zarpazo | 20 | — | 1 |
| Ataque de su elemento | 32 | 2 turnos | 3 |
| Rugido curativo | Cura el 25% | 4 turnos | 5 |
| Ataque definitivo | 52 | 4 turnos | 8 |

- **Daño** = poder × ataque / (defensa + 20) × aleatorio entre 0,9 y 1,1 × elemento (×1,5 con ventaja, ×0,67 con desventaja) × crítico (10%, ×1,5).
- **Tabla de elementos**:

| Elemento | Gana a |
|---|---|
| Fuego | Planta, hielo, metal |
| Agua | Fuego, tierra |
| Planta | Agua, tierra |
| Tierra | Rayo, fuego, metal |
| Aire | Planta, tierra |
| Rayo | Agua, aire, metal |
| Hielo | Planta, aire, tierra |
| Metal | Hielo, luz |
| Luz | Oscuridad, hielo |
| Oscuridad | Luz, aire |

- **Campaña**: 18 rivales. La primera victoria contra cada uno da +2 💎.
- **Asaltos (Fuerte de asalto)**:
  - Eliges un equipo de hasta 3 dragones contra los 3 de una aldea rival. Cuando un dragón cae, entra el siguiente.
  - Siempre hay 3 aldeas para elegir (fácil, normal y difícil), con el nivel ajustado a tu equipo y un botín de oro, comida y gemas en las difíciles.
  - Al ganar, la aldea se sustituye por otra. También puedes buscar otras 3 aldeas por 50 🪙.
- **Online**: duelo 1 contra 1 con emparejamiento, puntuación Elo, presencia, reconexión y reclamación de victoria si el rival está inactivo (Firebase Realtime Database).

### 3.4 Saltos del dragón (minijuego)
- 10 niveles generados con semilla (cada nivel es siempre igual), con huecos, pinchos, bichos, plataformas y monedas.
- 3 vidas, *coyote time* y salto variable. Se consiguen hasta 3 estrellas por nivel.
- Premios en oro, comida y XP, y gemas la primera vez que se supera cada nivel.

### 3.5 Arena de aldeas (minijuego estilo Clash Royale / Castle Crush)
- **Cartas**: marco del color de la rareza, gota de maná, nivel, nombre y retrato del dragón sobre el fondo de su elemento.
- **Mazo y mano**: mazo de hasta 6 dragones y mano de 4 cartas que van rotando.
- **Maná**: llega hasta 10 y se recarga 1 cada 1,4 s. Coste por rareza: 3, 4, 5, 6 y 7.
- **Campo**: 2 torres y un castillo por bando. La partida dura 150 s; destruir el castillo da la victoria al instante.
- **Trofeos**: +30 por victoria y −20 por derrota. Ligas: Madera, Bronce, Plata, Oro y Dragón.
- **Rival**: una aldea controlada por la IA. La versión contra personas en tiempo real es la fase 4.

### 3.6 Cuenta e identidad
- **Inicio de sesión**: con Google mediante Firebase Authentication. Solo se carga si el jugador acepta los servicios externos en el aviso de cookies.
- **Partida en la nube**: se guarda en Firestore (`players/{uid}`) y, al entrar, se usa la más reciente.
- **Cierre de sesión seguro**: se sube la partida y después se pregunta si borrar la copia del dispositivo.
- **Sin conexión**: el juego funciona igual y guarda en `localStorage`.

### 3.7 Creador de cuidador
- **Estilo anime**: ojos con degradado y brillos, y pelo con degradado y mechones.
- **Opciones**:
  - Género y 6 tonos de piel.
  - 8 peinados: suelto ondulado, trenzas, coleta, vikingo con cresta trenzada, corto, rizado, moño y rapado.
  - 10 colores de pelo y 7 colores de ojos.
  - Pecas y barba.
  - 7 conjuntos de ropa (túnica vikinga, capa de pieles, armadura de cuero, armadura, chaleco hippie, vestido floral y peto de granja) con 8 colores.
  - 7 accesorios (corona de flores, diadema, casco vikingo, pendientes, bandana, gafas o nada).
  - 4 marcas: ninguna, pintura de guerra, runas o cicatriz.
  - También hay un botón aleatorio.

### 3.10 Decoraciones y variantes
- **10 decoraciones** colocables en el mapa:

| Decoración | Desde nivel | Precio |
|---|---|---|
| Farol de aceite | 1 | Oro |
| Jardín de flores | 1 | Oro |
| Antorcha rúnica | 2 | Oro |
| Estandarte del clan | 3 | Oro |
| Hoguera vikinga | 4 | Oro |
| Pozo de piedra | 5 | Oro |
| Árbol sagrado | 6 | Gemas |
| Menhir de runas | 7 | Oro |
| Fuente del dragón | 9 | Oro |
| Estatua de dragón | 10 | Gemas |

  - Cada una da **+1% de oro** a todos los hábitats, hasta un máximo de +20%.
  - Se mueven con ✋ Mover y se venden por un tercio de su precio.
- **Variantes iridiscentes**: cada eclosión tiene un 3% de probabilidad de dar una variante de color alternativo, marcada con 🌈 en la ficha del dragón.

### 3.8 Mercado
- **Huevos**: las 102 especies, con filtro por elemento y la opción "solo las que puedo comprar". Las bloqueadas muestran su nivel.
- **Hábitats**.
- **Cambio de recursos**: gemas → oro y oro → comida.
- **Gemas y oro con dinero real**: packs con precios orientativos, **desactivados**. Para activarlos hay que integrar un proveedor de pagos y validar las compras en el servidor (ver la sección 6).

### 3.9 Legal, privacidad y consentimiento
- **Aviso de cookies** la primera vez, con "Solo necesarias", "Configurar" y "Aceptar todo" al mismo nivel. Las tipografías de Google y Firebase **no se cargan** sin consentimiento.
- **Páginas**: aviso legal, política de privacidad, política de cookies, consentimiento y datos, condiciones de compra (cancelaciones y reembolsos), correo electrónico, política de IA y privacidad en redes sociales.
- **Derechos del jugador**: descargar sus datos (JSON) y borrarlos del dispositivo y de la nube.
- 🔶 **DECISIÓN — datos legales:** los textos son **plantillas** con los datos del titular entre corchetes (nombre, NIF/CUIT, domicilio, correo, país, plazos). Hay que completarlos y que los revise un profesional, sobre todo por tratarse de un juego que pueden usar menores.

---

## 4. Modelo de datos

```ts
Jugador {
  name, level, xp, gold, gems, food, avatar: Personaje,
  habitats: Habitat[], dragons: Dragon[], eggs: Huevo[], incubatorSlots,
  breeding: { speciesA, speciesB, result, start, duration } | null,
  plots: { crop, start }[], dex: string[], campaign,
  layout: { "b:fuerte" | "h:<id>" | "p:<n>": [columna, fila] },
  raid: { targets: AldeaRival[3], wins },
  pvp: { rating, wins, losses, activeMatch },
  arena: { trophies, wins, losses, deck: dragonId[] },
  platform: { cleared, stars }, decor: { id, type }[], stats, ownerUid, updatedAt, lastTick, onboarded
}
Dragon     { id, species, name, level (1-30), feeds (0-3), hunger, clean, habitatId | null, born, shiny }
Habitat    { id, type: elemento, level (1-3), gold }
Huevo      { id, species, start, duration }
AldeaRival { id, diff (0-2), name, avatar: Personaje, team: { species, level, name }[3], loot }
Personaje  { genero, piel, pelo, colorPelo, ojos, ropa, colorRopa, accesorio, marcas, pecas, barba }
Especie    { name, elements[], rarity, unlock, price | null, colors[2], stats, gold, look{horns, marks, bulk, spikes} }
Consentimiento (localStorage "airyaldea_consent") { v, date, external, analytics }
```

---

## 5. Economía y progresión

| Recurso | Cómo se gana | En qué se gasta |
|---|---|---|
| 🪙 Oro | Hábitats, campaña, asaltos, arena, saltos, ventas, cambio | Huevos, hábitats, mejoras, cultivos, parcelas, cría, buscar aldeas |
| 🍖 Comida | Granja, asaltos, saltos, cambio | Subir de nivel a los dragones |
| 💎 Gemas | Subir de nivel (+3), primeras victorias, asaltos difíciles, saltos, arena | Especies épicas y legendarias, incubadoras, acelerar, cambio |

🔶 **DECISIÓN — monetización:** el mercado ya tiene la sección de packs, desactivada.
- Opciones: compras de gemas, pase de temporada, anuncios con recompensa o juego sin pagos.
- Requisitos si se activan: validar en el servidor, mostrar el precio final, pedir el consentimiento expreso para el desistimiento en contenido digital, ofrecer un "botón de arrepentimiento" donde la ley lo exija y aplicar controles parentales.

---

## 6. Arquitectura técnica

### Prototipo actual
HTML, CSS y JavaScript sin dependencias ni compilación. Se publica con cualquier servidor estático, como GitHub Pages.

```
js/data.js        catálogo (102 especies, 10 elementos, edificios, fórmulas)
js/art.js         arte vectorial: dragones, huevos, cuidador, logo, portadas, edificios, cartas
js/state.js       estado, guardado, economía, utilidades
js/cloud.js       Google, nube, emparejamiento online
js/villagemap.js  mapa isométrico editable
js/village.js     aldea, granja, ficha del dragón
js/hatchery.js    incubadoras, cría, dragonario
js/battle.js      campaña, asaltos 3v3, online
js/platformer.js  saltos (canvas)
js/arena.js       arena de cartas (canvas)
js/shop.js        mercado
js/profile.js     creador de cuidador y cuenta
js/legal.js       textos legales, cookies y consentimiento
js/main.js        navegación, minijuegos, portada, reloj
```

### Producción recomendada
🔶 **DECISIÓN — motor:**
- **Opción A (recomendada):** TypeScript + Phaser 3 o PixiJS, empaquetado con Capacitor para móvil. Se aprovecha este prototipo.
- **Opción B:** Unity, si se quiere arte 3D o muy animado.
- **Opción C:** Flutter + Flame.

🔶 **DECISIÓN — servidor:**
- **Firebase (recomendado):** Auth, Firestore, Realtime Database y Cloud Functions.
- **Alternativas:** Supabase, PlayFab, o Nakama / Colyseus para la arena en tiempo real.

🔶 **DECISIÓN — arte final:** el prototipo dibuja los dragones con vectores generados por código. Es ligero y permite 102 especies con variantes, pero **no puede ser fotorrealista**. Para dragones realistas o ilustrados hace falta un artista o un estudio que entregue imágenes por especie y etapa, y el juego ya está preparado para cambiar `AA.dragonSVG` por esas imágenes.
- Volumen orientativo: 102 especies × 3 etapas = 306 ilustraciones, más animaciones si se quieren.

### Seguridad y anticampañas
1. La economía debe validarse en el servidor con Cloud Functions y el reloj del servidor. *En el prototipo el cliente escribe su propia partida, así que es manipulable.*
2. Reglas de base de datos: cada jugador solo accede a `players/{uid}`, y cada combate solo lo pueden tocar sus dos jugadores (las reglas de ejemplo están en el README).
3. Combates online y asaltos con autoridad del servidor, tanto para el daño (con semilla de servidor) como para el Elo y el botín.
4. Firebase App Check, límites de oro por hora y registro de transacciones.
5. Los pagos solo se validan en el servidor, con recibos de las tiendas.

---

## 7. Guía de estilo

### Logo
- **Personaje**: chica **rubia oscura con el pelo suelto y ondulado**, **pecas sobre la nariz**, **ojos marrones** (estilo anime) y **piel clara**. Estilo hippie vikinga: corona de flores, túnica verde salvia con cuello de piel y broche dorado.
- **Composición**: sostiene un huevo del que sale un **bebé dragón** turquesa, dentro de un medallón de atardecer con montañas, enmarcado por **dos grandes alas de dragón**.
- **Título**: "AiryAldea" en letras doradas con contorno marrón oscuro, sobre un arco, y la cinta roja "LEYENDAS DE DRAGONES" debajo.

### Paleta
| Uso | Color |
|---|---|
| Fondo pergamino / tarjetas | `#fdf3e1` / `#fffaf0` |
| Madera oscura (barras, marcos) | `#2c1a0e` · `#3b2a1a` · `#8b5a2b` |
| Verde musgo (acción principal) | `#4f7942` |
| Oro | `#f2b705` |
| Rojo baya | `#c0392b` |
| Cielo de portada | `#1d2b53` → `#7e4f8f` → `#f28c28` |

Cada uno de los 10 elementos tiene su color y su brillo: fuego, agua, planta, tierra, aire, rayo, hielo, metal, luz y oscuridad.

### Dirección artística de los dragones y calidad visual
**Objetivo:** anime maduro. Dragones bonitos y creíbles, con presencia de criatura poderosa, nunca de peluche. La referencia es la ilustración de fantasía japonesa y coreana (gacha de calidad o portadas de novela ligera), no los dibujos infantiles.

| Aspecto | Regla |
|---|---|
| Proporciones | Bebé: cabeza grande y ojos redondos, aunque ya con cuernos y garras. Joven: estilizado. Adulto: cuello largo, hocico alargado, ojos almendrados con pupila de reptil y mandíbula con púas. |
| Silueta | Que se reconozca en negro: perfil de 3/4, alas abiertas y cola en S. La variedad sale de los cuernos (4 tipos), las alas (4 tipos), las púas, la corpulencia y las marcas. |
| Alas | Membrana con venas (fuego, agua, planta, tierra, rayo, metal), plumas (aire, luz), rasgadas con agujeros (oscuridad) o cristal facetado (hielo). |
| Sombreado | Estilo *cel-shading* anime: luz base con degradado, sombra dura en la parte inferior del cuerpo, cola y mandíbula, luz de contorno blanca en lomo y cráneo y brillo en los ojos. |
| Color | Dos tonos por especie, el del elemento principal y el secundario. Saturación media-alta y sombras frías. Nada de colores pastel planos en los adultos. |
| Efectos de elemento | Brasas, burbujas, hojas, rocas, viento, chispas, escarcha, placas de metal, destellos o niebla. Siempre secundarios a la silueta. |
| Rareza | Común: limpio. Raro: más detalle. Épico: aura del color del elemento. Legendario: cuernos dorados y aura fuerte. Mítico: anillo místico. |
| Detalle | Escamas con textura, garras de hueso, dientes en los adultos y crestas por elemento. |

🔶 **DECISIÓN — realismo**: el prototipo genera los dragones con vectores por código (102 especies × 3 etapas, más las variantes, sin pesar nada). El siguiente salto de calidad necesita ilustración profesional:
- **Opción A:** arte 2D pintado por especie y etapa (unas 306 ilustraciones), en el estilo descrito arriba.
- **Opción B:** modelos 3D con *shader* anime (*toon shading*) y animaciones esqueléticas, usando Unity o Godot.
- **Opción C:** sprites 2D animados por huesos con Spine o DragonBones. Es el punto medio en coste y calidad.

En cualquier caso, cada especie debe tener una hoja de personaje: vistas, paleta, etapas y efectos.

**Calidad visual general**: portadas ilustradas en cada sección, mapa isométrico con mar y acantilados, cartas con marco por rareza y animaciones suaves (paseo de los dragones, golpes y eclosión). La interfaz tiene marcos de madera oscura y pergamino, y se respeta la preferencia de "reducir movimiento".

### Tipografía e interfaz
- **Fredoka** (títulos) y **Nunito** (texto). Si no se aceptan los servicios externos, se usan las del sistema.
- **Barras**: barras de madera oscura arriba y abajo.
- **Portadas y tarjetas**: portadas ilustradas en cada sección y tarjetas de pergamino con esquinas redondeadas.
- **Cartas**: estilo Clash Royale.
- **Accesibilidad**: se respeta la preferencia de "reducir movimiento".

---

## 8. Plan de implementación por fases

| Fase | Contenido | Prioridad | Estado |
|---|---|---|---|
| 0 · Prototipo | Mapa isométrico, 102 especies, campaña, asaltos, arena, saltos, mercado, legal | Alta | ✅ Hecho |
| 1 · Nube | Proyecto Firebase, Google, sincronización, reglas, GitHub Pages | Alta | 🟡 Código listo, falta configurar |
| 2 · Autoridad | Cloud Functions para la economía, los asaltos y los combates; App Check | Alta | ⬜ |
| 3 · Arte y sonido | Ilustraciones profesionales por especie y etapa, animaciones, música, efectos, tutorial | Alta | ⬜ |
| 4 · Online en tiempo real | Arena contra personas (Colyseus/Nakama), asaltos a aldeas reales de otros jugadores | Media | ⬜ |
| 5 · Pagos y móvil | Proveedor de pagos, condiciones definitivas, Capacitor, notificaciones, tiendas | Media | ⬜ |
| 6 · Contenido vivo | Eventos, decoraciones, clanes, misiones diarias, más especies | Baja | ⬜ |

### Decisiones pendientes
1. 🔶 Motor de producción.
2. 🔶 Proveedor de servidor.
3. 🔶 Monetización y proveedor de pagos.
4. 🔶 Datos del titular, país y revisión legal de las plantillas.
5. 🔶 Estilo y presupuesto del arte final (vectorial o ilustrado/realista).
6. 🔶 Nombre definitivo y comprobación de la marca.
