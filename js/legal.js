// Textos legales, aviso de cookies y gestión del consentimiento.
// Son plantillas: los datos entre [CORCHETES] los tiene que completar el titular
// del juego, y conviene que un profesional los revise antes de publicarlo.
(function (AA) {
  const KEY = 'airyaldea_consent';
  const UPDATED = '15 de octubre de 2026';
  const TITULAR = '[NOMBRE DEL TITULAR]';
  const NIF = '[NIF / CIF / CUIT]';
  const DOMICILIO = '[DOMICILIO]';
  const CORREO = '[CORREO DE CONTACTO]';
  const draft = '<p class="draft">📝 Plantilla: completa los datos entre corchetes y haz que la revise un profesional antes de publicar el juego.</p>';

  // ---------- Consentimiento ----------
  const C = AA.consent = {
    get() {
      try { return JSON.parse(localStorage.getItem(KEY)); } catch (e) { return null; }
    },
    set(prefs) {
      const v = { v: 1, date: new Date().toISOString(), external: !!prefs.external, analytics: false };
      try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) { /* sin almacenamiento */ }
      C.apply();
      AA.emit('change');
    },
    allowsExternal() { const c = C.get(); return !!(c && c.external); },
    // Carga los servicios externos solo si se han aceptado.
    apply() {
      if (!C.allowsExternal()) return;
      if (!document.getElementById('gfonts')) {
        const l = document.createElement('link');
        l.id = 'gfonts';
        l.rel = 'stylesheet';
        l.href = 'https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Nunito:wght@400;600;800&display=swap';
        document.head.appendChild(l);
      }
      if (AA.cloud.enabled && !C._cloudStarted) { C._cloudStarted = true; AA.cloud.init(); }
    },
    maybeAsk() {
      if (C.get() || document.querySelector('.consent-bar')) return;
      const bar = document.createElement('div');
      bar.className = 'consent-bar';
      bar.innerHTML = `<div><b>🍪 Tu privacidad</b><p>Guardamos tu partida en este dispositivo (necesario). Con tu permiso también usamos servicios externos: tipografías de Google y, si está activado, el inicio de sesión con Google y la nube. No usamos publicidad ni analítica.
        <a href="#" data-l="cookies">Política de cookies</a> · <a href="#" data-l="privacidad">Privacidad</a></p></div>
        <div class="consent-actions"><button class="btn" data-c="reject">Solo necesarias</button><button class="btn" data-c="config">Configurar</button><button class="btn btn-primary" data-c="accept">Aceptar todo</button></div>`;
      document.body.appendChild(bar);
      bar.addEventListener('click', e => {
        const l = e.target.closest('[data-l]');
        if (l) { e.preventDefault(); AA.go('legal', { page: l.dataset.l }); return; }
        const b = e.target.closest('[data-c]');
        if (!b) return;
        if (b.dataset.c === 'config') { AA.go('legal', { page: 'consentimiento' }); bar.remove(); return; }
        C.set({ external: b.dataset.c === 'accept' });
        bar.remove();
      });
    },
    // Para acciones que necesitan servicios externos (por ejemplo, entrar con Google).
    require(onOk) {
      if (C.allowsExternal()) return onOk();
      const m = AA.modal(`<h2>Permiso necesario</h2><p>Para iniciar sesión con Google hay que cargar servicios de Google (Firebase). Ahora mismo solo tienes aceptadas las cookies necesarias.</p>
        <div class="row end"><button class="btn" data-close>Ahora no</button><button class="btn btn-primary" data-ok>Aceptar servicios externos</button></div>`);
      m.querySelector('[data-ok]').onclick = () => { AA.closeModal(); C.set({ external: true }); setTimeout(onOk, 1500); };
    },
  };

  // ---------- Páginas ----------
  const PAGES = {
    aviso: {
      title: 'Aviso legal',
      html: () => `${draft}
        <h3>1. Titular</h3>
        <p>En cumplimiento de la normativa de servicios de la sociedad de la información, se informa de que el juego <b>AiryAldea</b> (en adelante, «el Juego») es titularidad de ${TITULAR}, con ${NIF} y domicilio en ${DOMICILIO}. Contacto: ${CORREO}.</p>
        <h3>2. Objeto</h3>
        <p>Este aviso regula el acceso y el uso del Juego, disponible en la web y en dispositivos móviles. Al usarlo aceptas estas condiciones; si no estás de acuerdo, no lo utilices.</p>
        <h3>3. Uso del Juego</h3>
        <p>Te comprometes a usar el Juego de forma lícita y respetuosa. Está prohibido manipular el Juego o sus servidores, usar trampas, bots o programas no autorizados, explotar errores, suplantar a otras personas o acosar a otros jugadores. El titular puede suspender las cuentas que incumplan estas normas.</p>
        <h3>4. Propiedad intelectual</h3>
        <p>El código, los gráficos, los nombres, los logotipos y el resto de los contenidos del Juego pertenecen al titular o se usan con licencia. No está permitido copiarlos, distribuirlos ni modificarlos sin autorización. Los objetos y monedas virtuales no son propiedad del jugador: son una licencia de uso dentro del Juego, no tienen valor fuera de él y no pueden canjearse por dinero.</p>
        <h3>5. Responsabilidad</h3>
        <p>El titular trabaja para que el Juego funcione correctamente, pero no garantiza que esté libre de errores ni disponible en todo momento. No se responsabiliza de los daños causados por un uso indebido, por fallos de conexión o por servicios de terceros.</p>
        <h3>6. Menores</h3>
        <p>Si eres menor de edad, debes usar el Juego con el permiso y la supervisión de tu padre, madre o tutor, sobre todo para iniciar sesión o hacer compras.</p>
        <h3>7. Ley aplicable</h3>
        <p>Estas condiciones se rigen por la ley de [PAÍS]. Para cualquier conflicto serán competentes los juzgados que correspondan según la normativa de protección de los consumidores.</p>
        <p class="muted small">Última actualización: ${UPDATED}.</p>`,
    },
    privacidad: {
      title: 'Política de privacidad',
      html: () => `${draft}
        <h3>1. Responsable del tratamiento</h3>
        <p>${TITULAR} (${NIF}), ${DOMICILIO}. Contacto para temas de privacidad: ${CORREO}.</p>
        <h3>2. Qué datos tratamos</h3>
        <ul class="plain">
          <li><b>Datos de la partida</b>: progreso, dragones, aldea, personaje, nombre de cuidador y estadísticas. Se guardan en tu dispositivo y, si inicias sesión, también en la nube.</li>
          <li><b>Datos de tu cuenta de Google</b> (solo si inicias sesión): identificador de usuario, correo electrónico y nombre público que Google comparte con el Juego. Nunca recibimos tu contraseña.</li>
          <li><b>Datos de juego online</b>: nombre de cuidador, puntuación y dragón usado en cada combate, visibles para tu rival.</li>
          <li><b>Datos técnicos</b> que los proveedores necesitan para dar el servicio (por ejemplo, la dirección IP al cargar tipografías o al conectar con la nube).</li>
        </ul>
        <p>No pedimos datos sensibles, no hacemos perfiles con fines publicitarios y no vendemos tus datos.</p>
        <h3>3. Para qué y con qué base legal</h3>
        <ul class="plain">
          <li>Prestar el Juego y guardar tu progreso: es necesario para darte el servicio que pides.</li>
          <li>Sincronizar la partida entre dispositivos y jugar online: tu consentimiento, al iniciar sesión.</li>
          <li>Cargar servicios externos (tipografías y nube): tu consentimiento, que puedes retirar en cualquier momento.</li>
          <li>Seguridad y prevención de trampas: interés legítimo en mantener un juego justo.</li>
        </ul>
        <h3>4. Con quién se comparten</h3>
        <p>Con proveedores que actúan como encargados del tratamiento: <b>Google (Firebase Authentication, Firestore y Realtime Database)</b> para la cuenta, la nube y el modo online, y <b>Google Fonts</b> para las tipografías. Estos proveedores pueden tratar datos fuera de tu país con las garantías previstas por la ley (por ejemplo, cláusulas contractuales tipo).</p>
        <h3>5. Cuánto tiempo</h3>
        <p>Los datos de la partida en tu dispositivo se guardan hasta que los borres. Los de la nube se conservan mientras tengas la cuenta y se eliminan cuando lo pidas o tras [PLAZO] de inactividad.</p>
        <h3>6. Tus derechos</h3>
        <p>Puedes pedir acceso, rectificación, eliminación, oposición, limitación y portabilidad de tus datos, y retirar tu consentimiento. Desde <a href="#" data-page="consentimiento">Consentimiento y datos</a> puedes descargar o borrar tu partida directamente; para lo demás, escribe a ${CORREO}. También puedes reclamar ante la autoridad de protección de datos de tu país (por ejemplo, la AEPD en España o la Agencia de Acceso a la Información Pública en Argentina).</p>
        <h3>7. Menores</h3>
        <p>Si tienes menos de 14 años (o la edad que fije la ley de tu país), necesitas el permiso de tu padre, madre o tutor para iniciar sesión con Google y jugar online.</p>
        <p class="muted small">Última actualización: ${UPDATED}.</p>`,
    },
    cookies: {
      title: 'Política de cookies',
      html: () => `${draft}
        <p>El Juego no usa cookies publicitarias ni de analítica. Usa almacenamiento en tu navegador y algunos servicios externos, que te explicamos aquí.</p>
        <h3>Necesarias (siempre activas)</h3>
        <table class="ltable"><tr><th>Nombre</th><th>Para qué</th><th>Duración</th></tr>
          <tr><td><code>airyaldea_save_v1</code></td><td>Guardar tu partida en este dispositivo</td><td>Hasta que la borres</td></tr>
          <tr><td><code>airyaldea_consent</code></td><td>Recordar lo que has elegido en este aviso</td><td>Hasta que la borres</td></tr></table>
        <h3>Servicios externos (solo con tu permiso)</h3>
        <table class="ltable"><tr><th>Servicio</th><th>Para qué</th><th>Proveedor</th></tr>
          <tr><td>Google Fonts</td><td>Tipografías del Juego (recibe tu dirección IP)</td><td>Google</td></tr>
          <tr><td>Firebase Authentication</td><td>Iniciar sesión con Google; guarda datos de sesión en tu navegador</td><td>Google</td></tr>
          <tr><td>Firestore y Realtime Database</td><td>Partida en la nube y combates online</td><td>Google</td></tr></table>
        <p>Si no los aceptas, el Juego funciona igual con una tipografía del sistema y la partida guardada solo en este dispositivo.</p>
        <p>Puedes cambiar tu elección en cualquier momento en <a href="#" data-page="consentimiento">Consentimiento y datos</a>, y borrar el almacenamiento desde la configuración de tu navegador.</p>
        <p class="muted small">Última actualización: ${UPDATED}.</p>`,
    },
    consentimiento: {
      title: 'Consentimiento y datos',
      html: () => {
        const c = C.get();
        return `<p>Aquí decides qué se activa y puedes ejercer tus derechos sobre los datos de tu partida.</p>
          <div class="consent-opt"><div><b>Necesarias</b><p class="small">Guardar la partida y tus preferencias en este dispositivo.</p></div><span class="pill on">Siempre activas</span></div>
          <div class="consent-opt"><div><b>Servicios externos</b><p class="small">Tipografías de Google, inicio de sesión con Google y nube (Firebase).</p></div>
            <button class="toggle ${c && c.external ? 'on' : ''}" data-act="ext">${c && c.external ? '✔ Activados' : '✕ Desactivados'}</button></div>
          <div class="consent-opt"><div><b>Analítica y publicidad</b><p class="small">El Juego no las usa.</p></div><span class="pill">No se usan</span></div>
          <p class="muted small">${c ? 'Última elección: ' + new Date(c.date).toLocaleString('es') : 'Todavía no has elegido.'}</p>
          <h3>Tus datos</h3>
          <div class="row wrap"><button class="btn" data-act="export">⬇️ Descargar mis datos (JSON)</button><button class="btn btn-danger" data-act="erase">🗑️ Borrar mis datos</button></div>
          <p class="muted small">«Borrar mis datos» elimina la partida de este dispositivo y, si has iniciado sesión, también de la nube. No se puede deshacer.</p>`;
      },
    },
    compras: {
      title: 'Condiciones de compra, cancelaciones y reembolsos',
      html: () => `${draft}
        <p class="notice">Ahora mismo el Juego <b>no permite pagos con dinero real</b>. Estas condiciones se aplicarán cuando se activen.</p>
        <h3>1. Qué se compra</h3>
        <p>Monedas virtuales (gemas y oro) y packs de contenido digital para usar dentro del Juego. Son una licencia de uso personal: no tienen valor monetario, no se pueden transferir a otras cuentas y no se pueden canjear por dinero.</p>
        <h3>2. Precio y pago</h3>
        <p>Los precios se muestran con impuestos incluidos antes de confirmar. El pago lo gestiona la tienda o pasarela correspondiente (Google Play, App Store o [PASARELA]); el Juego no guarda los datos de tu tarjeta.</p>
        <h3>3. Entrega</h3>
        <p>El contenido se entrega de inmediato en tu cuenta tras confirmarse el pago. Si no lo recibes, escríbenos a ${CORREO} con el justificante de compra.</p>
        <h3>4. Derecho de desistimiento y cancelaciones</h3>
        <p>Según la normativa de consumo, el contenido digital que se entrega al momento puede quedar excluido del derecho de desistimiento si, antes de comprar, das tu consentimiento expreso y aceptas que pierdes ese derecho al empezar la entrega. Te lo pediremos de forma clara en cada compra. Si la entrega no ha empezado, puedes cancelar la compra sin coste.</p>
        <p>En los países donde la ley lo exige (por ejemplo, el «botón de arrepentimiento» en Argentina), tendrás un acceso visible para revocar la compra dentro del plazo legal.</p>
        <h3>5. Reembolsos</h3>
        <ul class="plain">
          <li>Las compras hechas en Google Play o App Store se reembolsan según las políticas de esas tiendas; puedes pedirlo desde tu cuenta en la tienda.</li>
          <li>Reembolsaremos siempre las compras duplicadas por error técnico, los cargos sin entrega del contenido y los que la ley obligue a devolver.</li>
          <li>Si un menor ha hecho una compra sin permiso, su padre, madre o tutor puede escribirnos a ${CORREO} para revisar el caso.</li>
          <li>Si se reembolsa una compra, se retirará de la cuenta el contenido correspondiente.</li>
        </ul>
        <h3>6. Controles parentales</h3>
        <p>Recomendamos activar en el dispositivo la autorización de compras con contraseña. Los menores necesitan permiso de su padre, madre o tutor para comprar.</p>
        <p class="muted small">Última actualización: ${UPDATED}.</p>`,
    },
    correo: {
      title: 'Información sobre el correo electrónico',
      html: () => `${draft}
        <h3>Para qué usamos tu correo</h3>
        <p>Si inicias sesión con Google, recibimos el correo electrónico de tu cuenta. Lo usamos solo para identificar tu partida en la nube y, si nos escribes, para responderte.</p>
        <h3>Lo que no hacemos</h3>
        <ul class="plain"><li>No enviamos publicidad ni boletines sin tu consentimiento expreso y previo.</li><li>No compartimos ni vendemos tu correo.</li><li>Nunca te pediremos tu contraseña por correo. Si recibes un mensaje así en nombre del Juego, es un intento de engaño: no respondas.</li></ul>
        <h3>Comunicaciones del servicio</h3>
        <p>Podríamos escribirte por temas importantes de tu cuenta (seguridad, cambios en estas condiciones o compras). No son publicidad.</p>
        <h3>Contacto y baja</h3>
        <p>Escríbenos a ${CORREO}. Si algún día te suscribes a novedades, cada correo incluirá un enlace para darte de baja con un clic.</p>
        <p class="muted small">Última actualización: ${UPDATED}.</p>`,
    },
    ia: {
      title: 'Política de inteligencia artificial',
      html: () => `${draft}
        <h3>Cómo se ha usado la IA</h3>
        <p>Parte del código y del diseño del Juego se ha creado con ayuda de herramientas de inteligencia artificial (por ejemplo, Claude, de Anthropic), bajo la dirección y revisión de las personas responsables del Juego. Los dragones, personajes y escenarios se dibujan con gráficos vectoriales generados por el propio código del Juego.</p>
        <h3>La IA dentro del Juego</h3>
        <p>Los rivales de la campaña, los asaltos y la arena los controla un programa de reglas sencillas, no un modelo de IA generativa. El Juego no tiene chat con IA y no envía tus datos a servicios de IA.</p>
        <h3>Tus datos y la IA</h3>
        <p>No usamos tus datos de juego, tu correo ni tus conversaciones con nosotros para entrenar modelos de inteligencia artificial.</p>
        <h3>Cambios</h3>
        <p>Si en el futuro añadimos funciones con IA, te lo indicaremos claramente en el Juego y actualizaremos esta política antes de activarlas.</p>
        <p class="muted small">Última actualización: ${UPDATED}.</p>`,
    },
    redes: {
      title: 'Privacidad en redes sociales',
      html: () => `${draft}
        <h3>Perfiles oficiales</h3>
        <p>El Juego puede tener perfiles oficiales en redes sociales ([REDES Y ENLACES]). Si nos sigues, comentas o nos escribes por allí, el responsable de esos datos es también la propia red social, según sus políticas.</p>
        <h3>Qué hacemos con esos datos</h3>
        <p>Solo usamos la información de esos perfiles para responderte, publicar novedades del Juego y moderar la comunidad. No la cruzamos con tu partida ni la usamos para publicidad personalizada.</p>
        <h3>Inicio de sesión</h3>
        <p>El único inicio de sesión de terceros es el de Google. No conectamos tu partida con Facebook, Instagram, TikTok, X ni otras redes, ni publicamos nada en tu nombre.</p>
        <h3>Compartir capturas</h3>
        <p>Si compartes capturas del Juego, revisa que no muestren datos personales (tu correo, por ejemplo). Los menores deben tener cuidado y el permiso de su familia para usar redes sociales.</p>
        <h3>Tus derechos</h3>
        <p>Puedes ejercerlos ante nosotros (${CORREO}) y ante cada red social desde su configuración de privacidad.</p>
        <p class="muted small">Última actualización: ${UPDATED}.</p>`,
    },
  };
  AA.LEGAL_PAGES = PAGES;

  function render(root) {
    const page = AA.params && AA.params.page;
    if (!page || !PAGES[page]) {
      root.innerHTML = `<div class="cover">${AA.coverSVG('legal', 'Información legal', 'Privacidad, cookies y condiciones')}</div>
        <div class="list">${Object.keys(PAGES).map(k => `<button class="list-row" data-act="open" data-id="${k}"><span class="grow"><b>${PAGES[k].title}</b></span><span>›</span></button>`).join('')}</div>`;
    } else {
      root.innerHTML = `<button class="btn sm" data-act="back">‹ Información legal</button><article class="legal card"><h1>${PAGES[page].title}</h1>${PAGES[page].html()}</article>`;
    }
    root.querySelectorAll('[data-page]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); AA.go('legal', { page: a.dataset.page }); }));
    AA.bind(root, {
      open: ds => AA.go('legal', { page: ds.id }),
      back: () => AA.go('legal'),
      ext() { C.set({ external: !C.allowsExternal() }); if (!C.allowsExternal()) AA.toast('Desactivado. Se aplicará por completo al recargar la página.'); },
      export() {
        const blob = new Blob([JSON.stringify(AA.state, null, 2)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'airyaldea-mis-datos.json';
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      },
      erase() {
        AA.confirm('Borrar mis datos', 'Se eliminará tu partida de este dispositivo y, si has iniciado sesión, de la nube. No se puede deshacer.', 'Borrar todo', async () => {
          if (AA.cloud.user) {
            try { await AA.cloud.deleteData(); } catch (e) { AA.toast('No se pudo borrar de la nube'); return; }
          }
          try { localStorage.removeItem('airyaldea_save_v1'); } catch (e) { /* sin almacenamiento */ }
          AA.state = AA.newState();
          AA.saveQuiet();
          AA.toast('Datos borrados');
          AA.go('perfil');
        });
      },
    });
  }

  AA.screens.legal = { label: 'Legal', icon: '📜', render, parent: 'perfil' };
})(window.AA);
