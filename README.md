# AiryAldea — Leyendas de dragones

Juego de crianza de dragones para navegador y móvil. Puedes:

- construir tu aldea en un mapa isométrico;
- incubar y criar **102 especies**;
- asaltar aldeas rivales por turnos;
- jugar a dos minijuegos: una arena de cartas al estilo Clash Royale y un juego de plataformas.

El diseño completo y las decisiones pendientes están en [DISENO.md](DISENO.md).

## Cómo jugar

No hace falta instalar nada: son archivos HTML, CSS y JavaScript.

- **Más fácil:** publica la carpeta en GitHub Pages (ver más abajo) y abre el enlace en el móvil o el ordenador.
- **En tu ordenador:** abre la carpeta con cualquier servidor estático, por ejemplo la extensión *Live Server* de VS Code. Abrir `index.html` con doble clic puede no funcionar en algunos navegadores.

La partida se guarda sola en el dispositivo.

## Publicar en GitHub Pages

1. Sube el proyecto a tu repositorio (`git push`).
2. En GitHub ve a **Settings → Pages**, elige la rama `main` y la carpeta `/ (root)` y guarda.
3. En un par de minutos el juego estará en `https://airyxrly.github.io/circo-raluy/`.

## Activar el inicio con Gmail, la nube y el modo online

Todo está programado, pero necesita un proyecto de Firebase (gratis para empezar):

1. Entra en <https://console.firebase.google.com> y crea un proyecto.
2. **Authentication → Sign-in method**: activa **Google**. En *Settings → Authorized domains* añade tu dominio (por ejemplo `airyxrly.github.io`).
3. **Firestore Database**: créala en modo producción.
4. **Realtime Database**: créala. Es la que se usa para los combates online.
5. **Project settings → Your apps**: añade una app **web** y copia su configuración en `js/firebase-config.js`, en lugar de `null`.
6. Pon estas reglas de seguridad.

Firestore:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{db}/documents {
    match /players/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

Realtime Database:

```json
{
  "rules": {
    "lobby": { ".read": "auth != null", ".write": "auth != null" },
    "lobbyResults": { "$uid": { ".read": "auth != null && auth.uid === $uid", ".write": "auth != null" } },
    "matches": {
      "$id": {
        ".read": "auth != null && (data.child('p1/uid').val() === auth.uid || data.child('p2/uid').val() === auth.uid)",
        ".write": "auth != null && (!data.exists() || data.child('p1/uid').val() === auth.uid || data.child('p2/uid').val() === auth.uid)"
      }
    }
  }
}
```

El juego solo carga Firebase si el jugador acepta los "servicios externos" en el aviso de cookies.

## Antes de publicarlo de verdad

- **Textos legales:** en `js/legal.js` hay que completar los datos entre corchetes (titular, NIF/CUIT, domicilio, correo, país, plazos) y que los revise un profesional.
- **Pagos con dinero real:** están **desactivados**. Activarlos requiere un proveedor de pagos (Google Play Billing, App Store o Stripe) y validar las compras en un servidor.
- **Trampas:** la economía se calcula en el dispositivo, así que es manipulable. Para un juego público hay que validarla en el servidor (Cloud Functions). Ver DISENO.md, sección 6.
- **Arte:** los dragones están dibujados con vectores generados por código. Para un acabado realista hacen falta ilustraciones profesionales.

## Estructura

```
index.html          página del juego
css/styles.css      estilos
js/data.js          especies, elementos, edificios y fórmulas
js/art.js           dibujos (dragones, huevos, cuidador, logo, portadas, cartas)
js/villagemap.js    mapa isométrico de la aldea
js/*.js             una pantalla o sistema por archivo (ver DISENO.md)
```
