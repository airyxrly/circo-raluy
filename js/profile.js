// Perfil: creador de cuidador, cuenta de Google y estadísticas.
(function (AA) {
  const esc = AA.esc;
  const O = AA.AVATAR_OPTIONS;

  const seg = (k, opts, cur) => `<div class="seg">${opts.map(([v, l]) => `<button class="${v === cur ? 'on' : ''}" data-act="set" data-k="${k}" data-v="${v}">${l}</button>`).join('')}</div>`;
  const swatches = (k, cols, cur) => `<div class="swatches">${cols.map(c => `<button class="sw ${c === cur ? 'on' : ''}" style="background:${c}" data-act="set" data-k="${k}" data-v="${c}" aria-label="${c}"></button>`).join('')}</div>`;
  const toggle = (k, label, cur) => `<button class="toggle ${cur ? 'on' : ''}" data-act="flip" data-k="${k}">${cur ? '✔' : '✕'} ${label}</button>`;

  function accountSection() {
    const C = AA.cloud;
    if (!C.enabled) {
      return `<p>☁️ La partida se guarda en <b>este dispositivo</b>.</p>
        <p class="muted small">El inicio de sesión con Gmail (para no perder nunca la partida y seguir en otro móvil u ordenador) está programado, pero hay que activarlo creando un proyecto de Firebase. Los pasos están en el README.</p>`;
    }
    if (!AA.consent.allowsExternal()) {
      return `<p>Inicia sesión con tu cuenta de Google para guardar la partida en la nube y recuperarla en cualquier dispositivo.</p>
        <button class="btn google" data-act="login"><span class="g">G</span> Iniciar sesión con Google</button>`;
    }
    if (!C.ready) return '<p class="muted">Conectando con la nube…</p>';
    if (!C.user) {
      return `<p>Inicia sesión con tu cuenta de Google para guardar la partida en la nube y recuperarla en cualquier dispositivo.</p>
        <button class="btn google" data-act="login"><span class="g">G</span> Iniciar sesión con Google</button>`;
    }
    return `<p>Conectado como <b>${esc(C.user.email || C.user.displayName || 'Google')}</b>. Tu partida se guarda en la nube automáticamente.</p>
      <div class="row wrap"><button class="btn" data-act="sync">☁️ Guardar ahora</button><button class="btn btn-danger" data-act="logout">Cerrar sesión</button></div>`;
  }

  function render(root) {
    const S = AA.state, a = S.avatar;
    root.innerHTML = `
      ${S.onboarded ? '<h1>🧑‍🌾 Tu cuidador</h1>' : `<section class="welcome">${AA.logoSVG({ cls: 'logo-svg welcome-logo' })}<div><h1>¡Bienvenido/a a AiryAldea!</h1><p>Antes de empezar, crea a tu cuidador o cuidadora de dragones.</p></div></section>`}
      <div class="editor">
        <div class="editor-preview">${AA.avatarSVG(a)}<button class="btn sm" data-act="random">🎲 Aleatorio</button></div>
        <div class="editor-controls">
          <label class="lbl">Nombre</label><input class="input" id="pname" maxlength="16" value="${esc(S.name)}">
          <label class="lbl">Género</label>${seg('genero', O.genero, a.genero)}
          <label class="lbl">Tono de piel</label>${swatches('piel', O.piel, a.piel)}
          <label class="lbl">Peinado</label>${seg('pelo', O.pelo, a.pelo)}
          <label class="lbl">Color de pelo</label>${swatches('colorPelo', O.colorPelo, a.colorPelo)}
          <label class="lbl">Color de ojos</label>${swatches('ojos', O.ojos, a.ojos)}
          <label class="lbl">Rasgos</label><div class="row wrap">${toggle('pecas', 'Pecas', a.pecas)}${toggle('barba', 'Barba', a.barba)}</div>
          <label class="lbl">Ropa</label>${seg('ropa', O.ropa, a.ropa)}
          <label class="lbl">Color de ropa</label>${swatches('colorRopa', O.colorRopa, a.colorRopa)}
          <label class="lbl">Accesorio</label>${seg('accesorio', O.accesorio, a.accesorio)}
        </div>
      </div>
      ${S.onboarded ? '' : '<div class="center"><button class="btn btn-primary btn-big" data-act="start">¡Ir a mi aldea! 🏡</button></div>'}
      <section class="card"><h2>Cuenta</h2>${accountSection()}</section>
      <section class="card"><h2>Estadísticas</h2>
        <div class="stats-grid">
          <div>⭐ <b>${S.level}</b><small>Nivel</small></div><div>🐉 <b>${S.dragons.length}</b><small>Dragones</small></div>
          <div>📖 <b>${S.dex.length}/${AA.SPECIES_COUNT}</b><small>Especies</small></div><div>🐣 <b>${S.stats.hatched}</b><small>Eclosiones</small></div>
          <div>⚔️ <b>${S.campaign}/${AA.CAMPAIGN.length}</b><small>Campaña</small></div><div>🌍 <b>${Math.round(S.pvp.rating)}</b><small>Online</small></div>
          <div>🏆 <b>${S.arena.trophies}</b><small>Trofeos</small></div><div>🍄 <b>${S.platform.cleared}/${AA.PLATFORM_LEVELS}</b><small>Saltos</small></div>
        </div>
      </section>
      <section class="card"><h2>Logo del juego</h2><div class="logo-show">${AA.logoSVG()}</div></section>
      <section class="card"><h2>Información legal</h2>
        <div class="legal-links">${Object.keys(AA.LEGAL_PAGES).map(k => `<a href="#" data-act="legal" data-id="${k}">${AA.LEGAL_PAGES[k].title}</a>`).join('')}</div>
      </section>
      <div class="center"><button class="btn btn-danger sm" data-act="reset">Reiniciar partida</button></div>`;

    root.querySelector('#pname').addEventListener('change', e => {
      const v = e.target.value.trim();
      if (v) { S.name = v; AA.commit(); }
    });
    AA.bind(root, {
      set(ds) { a[ds.k] = ds.v; AA.commit(); },
      flip(ds) { a[ds.k] = !a[ds.k]; AA.commit(); },
      random() {
        const pick = arr => arr[Math.floor(Math.random() * arr.length)];
        ['genero', 'pelo', 'ropa', 'accesorio'].forEach(k => (a[k] = pick(O[k])[0]));
        ['piel', 'colorPelo', 'ojos', 'colorRopa'].forEach(k => (a[k] = pick(O[k])));
        a.pecas = Math.random() < 0.5;
        a.barba = a.genero !== 'chica' && Math.random() < 0.3;
        AA.commit();
      },
      start() {
        const v = root.querySelector('#pname').value.trim();
        if (v) S.name = v;
        S.onboarded = true;
        AA.commit();
        AA.go('aldea');
      },
      login: () => AA.consent.require(() => AA.cloud.login()),
      legal(ds, el, e) { e.preventDefault(); AA.go('legal', { page: ds.id }); },
      sync() { AA.cloud.push().then(() => AA.toast('☁️ Guardado en la nube')).catch(() => AA.toast('No se pudo guardar en la nube')); },
      logout() {
        const m = AA.modal(`<h2>Cerrar sesión</h2><p>Tu partida queda guardada en tu cuenta de Google. ¿Quieres borrar también la copia de este dispositivo? (Recomendado si el dispositivo no es tuyo.)</p>
          <div class="row wrap end"><button class="btn" data-act="keep">Mantenerla aquí</button><button class="btn btn-danger" data-act="wipe">Borrar de este dispositivo</button></div>`);
        AA.bind(m, {
          keep() { AA.closeModal(); AA.cloud.logout(false); },
          wipe() { AA.closeModal(); AA.cloud.logout(true).then(() => AA.go('perfil')); },
        });
      },
      reset() {
        AA.confirm('Reiniciar partida', 'Se borrará todo tu progreso (dragones, aldea, trofeos…). No se puede deshacer.', 'Borrar y empezar', () => {
          AA.resetGame();
          AA.go('aldea');
        });
      },
    });
  }

  AA.screens.perfil = { label: 'Perfil', icon: '🧑‍🌾', render };
})(window.AA);
