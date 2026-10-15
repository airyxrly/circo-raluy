// Arranque, barra superior, navegación, portada y reloj del juego.
(function (AA) {
  const ORDER = ['aldea', 'criadero', 'lucha', 'minijuegos', 'tienda', 'perfil'];
  let ticks = 0;
  AA.params = {};

  AA.go = function (id, params) {
    const prev = AA.screens[AA.current];
    if (prev && prev.leave && AA.current !== id) prev.leave();
    AA.current = id;
    AA.params = params || {};
    AA.closeModal();
    renderNav();
    AA.renderScreen();
    AA.renderQuestBar();
    window.scrollTo(0, 0);
  };

  AA.renderScreen = function () {
    const root = document.getElementById('screen');
    const sc = AA.screens[AA.current];
    if (!sc) return;
    root.className = 'screen screen-' + AA.current;
    sc.render(root);
  };

  function renderNav() {
    const cur = AA.screens[AA.current];
    const active = (cur && cur.parent) || AA.current;
    document.getElementById('nav').innerHTML = ORDER.map(id => {
      const sc = AA.screens[id];
      return `<button class="${id === active ? 'on' : ''}" data-go="${id}"><span>${sc.icon}</span><small>${sc.label}</small></button>`;
    }).join('');
    document.querySelectorAll('#nav [data-go]').forEach(b => b.addEventListener('click', () => AA.go(b.dataset.go)));
  }

  function renderTop() {
    const S = AA.state;
    const need = AA.xpForLevel(S.level);
    document.getElementById('topbar').innerHTML = `
      <div class="brand" data-go="perfil">${AA.avatarSVG(S.avatar, { head: true, cls: 'top-avatar' })}<div><b>AiryAldea</b><small>${AA.esc(S.name)}</small></div></div>
      <div class="lvl" title="${Math.floor(S.xp)}/${need} XP"><span>Nv ${S.level}</span><div class="bar"><i style="width:${Math.min(100, S.xp / need * 100)}%"></i></div></div>
      <div class="res"><span title="Oro">🪙 ${AA.fmt(S.gold)}</span><span title="Gemas">💎 ${AA.fmt(S.gems)}</span><span title="Comida">🍖 ${AA.fmt(S.food)}</span>${AA.cloud.user ? '<span title="Sincronizado con Google">☁️</span>' : ''}</div>`;
    document.querySelector('#topbar .brand').onclick = () => AA.go('perfil');
    AA.renderQuestBar();
  }

  function updateTimers() {
    let expired = false;
    document.querySelectorAll('[data-until]').forEach(el => {
      const left = (+el.dataset.until - Date.now()) / 1000;
      if (left <= 0) {
        if (!el.dataset.done) { el.dataset.done = '1'; expired = true; }
        el.textContent = '¡Listo!';
      } else {
        el.textContent = AA.fmtTime(left);
      }
    });
    document.querySelectorAll('[data-hgold]').forEach(el => {
      const h = AA.habitatById(el.dataset.hgold);
      if (h) el.textContent = AA.fmt(h.gold);
    });
    if (expired) AA.emit('change');
  }

  AA.on('change', () => {
    renderTop();
    const sc = AA.screens[AA.current];
    if (sc && !(sc.busy && sc.busy())) AA.renderScreen();
  });

  // Centro de minijuegos: la arena de cartas y los saltos.
  AA.screens.minijuegos = {
    label: 'Minijuegos', icon: '🎮',
    render(root) {
      const S = AA.state;
      const games = [
        { id: 'arena', b: AA.BUILDINGS.arena, cover: AA.coverSVG('arena', 'Arena de aldeas', 'Cartas, maná y torres en tiempo real'), extra: `${AA.leagueOf(S.arena.trophies).icon} ${S.arena.trophies} trofeos` },
        { id: 'saltos', b: AA.BUILDINGS.saltos, cover: AA.coverSVG('saltos', 'Saltos del dragón', 'Plataformas: salta, esquiva y recoge'), extra: `${S.platform.cleared}/${AA.PLATFORM_LEVELS} niveles` },
      ];
      root.innerHTML = `<h1>🎮 Minijuegos</h1><div class="games">${games.map(g => {
        const locked = S.level < g.b.unlock;
        return `<button class="game-card ${locked ? 'locked' : ''}" data-act="play" data-id="${g.id}">${g.cover}
          <span class="game-meta">${locked ? `🔒 Se desbloquea a nivel ${g.b.unlock}` : g.extra}</span></button>`;
      }).join('')}</div>`;
      AA.bind(root, {
        play(ds) {
          const b = AA.BUILDINGS[ds.id];
          if (S.level < b.unlock) return AA.toast(`🔒 ${b.name} se desbloquea a nivel ${b.unlock}`);
          AA.go(ds.id);
        },
      });
    },
  };

  function splash() {
    const el = document.createElement('div');
    el.className = 'splash';
    el.innerHTML = `${AA.splashSceneSVG()}<div class="splash-inner">${AA.logoSVG({ cls: 'logo-svg splash-logo' })}
      <p>Cría dragones · construye tu aldea · conquista otras aldeas</p>
      <div class="loadbar"><i></i></div>
      <button class="btn btn-primary btn-big" hidden>${AA.state.onboarded ? '¡Jugar!' : '¡Empezar aventura!'}</button></div>`;
    document.body.appendChild(el);
    const btn = el.querySelector('button');
    setTimeout(() => { el.querySelector('.loadbar').hidden = true; btn.hidden = false; }, 1200);
    btn.onclick = () => {
      el.classList.add('out');
      setTimeout(() => el.remove(), 400);
      if (AA.consent) AA.consent.maybeAsk();
    };
  }

  document.addEventListener('DOMContentLoaded', () => {
    AA.load();
    AA.tick();
    AA.ensureLayout();
    if (AA.consent) AA.consent.apply();
    const icon = document.createElement('link');
    icon.rel = 'icon';
    icon.href = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(AA.logoSVG({ noTitle: true }));
    document.head.appendChild(icon);
    renderTop();
    AA.go(AA.state.onboarded ? 'aldea' : 'perfil');
    splash();
    setInterval(() => {
      AA.tick();
      updateTimers();
      renderTop();
      if (++ticks % 10 === 0) AA.saveQuiet();
    }, 1000);
    window.addEventListener('beforeunload', AA.saveQuiet);
    document.addEventListener('visibilitychange', () => { if (document.hidden) AA.saveQuiet(); });
  });
})(window.AA);
