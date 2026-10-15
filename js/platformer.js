// Minijuego de plataformas: salta, esquiva y recoge monedas.
(function (AA) {
  const W = 480, H = 270, T = 30, GY = 8;
  const GRAV = 1700, JUMP = 610, SPEED = 200;
  const P = { game: null };

  function rng(seed) {
    return function () {
      seed = (seed + 0x6D2B79F5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function genLevel(n) {
    const r = rng(n * 7919 + 13);
    const len = 50 + n * 14;
    const solids = [], spikes = [], enemies = [], coins = [];
    const ground = (x0, x1, row) => {
      row = row || GY;
      solids.push({ x: x0 * T, y: row * T, w: (x1 - x0) * T, h: H - row * T + 60, kind: 'ground' });
    };
    ground(0, 8);
    let x = 8;
    while (x < len - 12) {
      const roll = r();
      if (roll < 0.32) {
        const w = 5 + Math.floor(r() * 5);
        ground(x, x + w);
        if (n >= 2 && r() < 0.5) spikes.push({ x: (x + 2 + Math.floor(r() * (w - 3))) * T + 3, y: GY * T - 14, w: T - 6, h: 14 });
        else if (r() < 0.75) enemies.push({ x: (x + 1) * T, y: GY * T - 22, w: 24, h: 22, min: x * T, max: (x + w) * T - 24, vx: (35 + n * 6) * (r() < 0.5 ? 1 : -1), alive: true });
        for (let i = 0; i < 3; i++) coins.push({ x: (x + 1 + i) * T + 15, y: (GY - 2) * T, got: false });
        x += w;
      } else if (roll < 0.55) {
        const g = 2 + Math.floor(r() * Math.min(3, 1 + n / 3));
        for (let i = 0; i < g; i++) coins.push({ x: (x + i) * T + 15, y: (GY - 3) * T + 5, got: false });
        x += g;
        const w = 3 + Math.floor(r() * 3);
        ground(x, x + w);
        x += w;
      } else if (roll < 0.8) {
        const g = 4 + Math.floor(r() * 3);
        const row = GY - 2 - Math.floor(r() * 2);
        solids.push({ x: (x + 1) * T, y: row * T, w: (g - 2) * T, h: 14, kind: 'plat' });
        for (let i = 1; i < g - 1; i++) coins.push({ x: (x + i) * T + 15, y: (row - 1) * T + 10, got: false });
        x += g;
        const w = 3 + Math.floor(r() * 3);
        ground(x, x + w);
        x += w;
      } else {
        const h = 1 + Math.floor(r() * 2);
        ground(x, x + 2);
        ground(x + 2, x + 4, GY - h);
        coins.push({ x: (x + 3) * T, y: (GY - h - 2) * T, got: false });
        ground(x + 4, x + 6);
        x += 6;
      }
    }
    ground(x, x + 12);
    return { solids, spikes, enemies, coins, flag: { x: (x + 8) * T, y: (GY - 4) * T }, width: (x + 12) * T };
  }

  const overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

  // ---------- Pantalla ----------
  function render(root) {
    if (P.game) return;
    const S = AA.state;
    const tiles = [];
    for (let n = 1; n <= AA.PLATFORM_LEVELS; n++) {
      const locked = n > S.platform.cleared + 1;
      const stars = S.platform.stars[n] || 0;
      tiles.push(`<button class="lvl-tile ${locked ? 'locked' : ''} ${stars ? 'done' : ''}" data-act="play" data-n="${n}" ${locked ? 'disabled' : ''}>
        <b>${locked ? '🔒' : n}</b><small>${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}</small></button>`);
    }
    root.innerHTML = `
      <div class="cover">${AA.coverSVG('saltos', 'Saltos del dragón', 'Salta, esquiva y recoge monedas')}</div>
      <section class="card">
        <p>Guía a tu dragón bebé hasta la bandera. Salta sobre los bichos, esquiva los pinchos y no caigas a los huecos.</p>
        <p class="muted small">Controles: ← → o A D para moverte, espacio / ↑ / W para saltar. En el móvil, usa los botones de la pantalla.</p>
        <p class="small">Premios: oro y comida por monedas · 💎 la primera vez que superas un nivel · ★ por terminar, recoger el 60% de monedas y no recibir daño.</p>
      </section>
      <div class="lvl-grid">${tiles.join('')}</div>`;
    AA.bind(root, { play: ds => start(+ds.n) });
  }

  function start(n) {
    const root = document.getElementById('screen');
    const lvl = genLevel(n);
    const hero = AA.state.dragons.slice().sort((a, b) => b.level - a.level)[0];
    P.game = {
      n, lvl, t: 0, coins: 0, lives: 3, damaged: false, over: false,
      p: { x: 60, y: GY * T - 26, w: 24, h: 26, vx: 0, vy: 0, onGround: false, face: 1, inv: 0, coyote: 0, jumpBuf: 0 },
      safe: { x: 60, y: GY * T - 26 }, cam: 0,
      keys: { left: false, right: false, jump: false }, jumpHeld: false,
      img: AA.dragonImage(hero.species, 1, false), imgFlip: AA.dragonImage(hero.species, 1, true),
    };
    root.innerHTML = `
      <div class="game-wrap">
        <div class="game-top"><button class="btn sm" data-act="quit">✕ Salir</button><b>Nivel ${n}</b></div>
        <canvas id="pf" width="${W}" height="${H}"></canvas>
        <div class="touch-pad">
          <div><button class="pad" data-key="left">◀</button><button class="pad" data-key="right">▶</button></div>
          <button class="pad jump" data-key="jump">⤒</button>
        </div>
      </div>`;
    const cv = root.querySelector('#pf');
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = W * dpr;
    cv.height = H * dpr;
    P.ctx = cv.getContext('2d');
    P.ctx.scale(dpr, dpr);
    AA.bind(root, { quit: () => { stop(); AA.renderScreen(); } });
    root.querySelectorAll('.pad').forEach(b => {
      const k = b.dataset.key;
      const on = e => { e.preventDefault(); P.game && (P.game.keys[k] = true); b.classList.add('on'); };
      const off = e => { e.preventDefault(); P.game && (P.game.keys[k] = false); b.classList.remove('on'); };
      b.addEventListener('pointerdown', on);
      b.addEventListener('pointerup', off);
      b.addEventListener('pointerleave', off);
      b.addEventListener('pointercancel', off);
    });
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKey);
    P.last = performance.now();
    P.raf = requestAnimationFrame(loop);
  }

  const KEYMAP = { ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right', ArrowUp: 'jump', KeyW: 'jump', Space: 'jump' };
  function onKey(e) {
    const k = KEYMAP[e.code];
    if (!k || !P.game) return;
    e.preventDefault();
    P.game.keys[k] = e.type === 'keydown';
  }

  function stop() {
    cancelAnimationFrame(P.raf);
    window.removeEventListener('keydown', onKey);
    window.removeEventListener('keyup', onKey);
    P.game = null;
  }

  function loop(now) {
    const g = P.game;
    if (!g) return;
    const dt = Math.min(1 / 30, (now - P.last) / 1000);
    P.last = now;
    if (!g.over) update(g, dt);
    draw(g);
    P.raf = requestAnimationFrame(loop);
  }

  function hurt(g) {
    if (g.p.inv > 0) return;
    g.lives--;
    g.damaged = true;
    g.p.inv = 1.4;
    if (g.lives <= 0) finish(false);
  }

  function update(g, dt) {
    const p = g.p, L = g.lvl, k = g.keys;
    g.t += dt;
    p.inv = Math.max(0, p.inv - dt);

    const target = ((k.right ? 1 : 0) - (k.left ? 1 : 0)) * SPEED;
    if (target) p.face = Math.sign(target);
    const acc = (p.onGround ? 1500 : 900) * dt;
    p.vx = p.vx < target ? Math.min(target, p.vx + acc) : Math.max(target, p.vx - acc);

    p.coyote = p.onGround ? 0.1 : p.coyote - dt;
    if (k.jump && !g.jumpHeld) p.jumpBuf = 0.12;
    g.jumpHeld = k.jump;
    p.jumpBuf -= dt;
    if (p.jumpBuf > 0 && p.coyote > 0) { p.vy = -JUMP; p.jumpBuf = 0; p.coyote = 0; }
    p.vy += GRAV * dt * (!k.jump && p.vy < 0 ? 2.2 : 1);
    p.vy = Math.min(p.vy, 900);

    p.x = Math.max(0, p.x + p.vx * dt);
    for (const s of L.solids) {
      if (s.kind === 'plat' || !overlap(p, s)) continue;
      if (p.vx > 0) p.x = s.x - p.w; else if (p.vx < 0) p.x = s.x + s.w;
      p.vx = 0;
    }
    const prevBottom = p.y + p.h;
    p.y += p.vy * dt;
    p.onGround = false;
    for (const s of L.solids) {
      if (!overlap(p, s)) continue;
      if (s.kind === 'plat' && (p.vy < 0 || prevBottom > s.y + 1)) continue;
      if (p.vy > 0) { p.y = s.y - p.h; p.vy = 0; p.onGround = true; if (s.kind === 'ground') g.safe = { x: p.x, y: p.y }; }
      else if (p.vy < 0) { p.y = s.y + s.h; p.vy = 0; }
    }

    if (p.y > H + 40) {
      hurt(g);
      if (!g.over) { p.x = g.safe.x; p.y = g.safe.y - 4; p.vx = 0; p.vy = 0; p.inv = 1.4; }
      return;
    }

    for (const e of L.enemies) {
      if (!e.alive) continue;
      e.x += e.vx * dt;
      if (e.x < e.min || e.x > e.max) { e.vx = -e.vx; e.x = Math.max(e.min, Math.min(e.max, e.x)); }
      if (!overlap(p, e)) continue;
      if (p.vy > 0 && prevBottom <= e.y + 10) { e.alive = false; p.vy = -380; }
      else hurt(g);
    }
    for (const s of L.spikes) {
      if (overlap(p, s)) { hurt(g); p.vy = -360; }
    }
    for (const c of L.coins) {
      if (!c.got && Math.abs(p.x + p.w / 2 - c.x) < 18 && Math.abs(p.y + p.h / 2 - c.y) < 20) { c.got = true; g.coins++; }
    }
    if (p.x + p.w > L.flag.x) finish(true);
    g.cam = Math.max(0, Math.min(L.width - W, p.x - 170));
  }

  function draw(g) {
    const c = P.ctx, L = g.lvl, cam = g.cam;
    const sky = c.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#8fd3f4');
    sky.addColorStop(1, '#fff1c9');
    c.fillStyle = sky;
    c.fillRect(0, 0, W, H);
    // colinas con paralaje
    c.fillStyle = '#b5d99c';
    for (let i = -1; i < 6; i++) {
      const x = i * 160 - (cam * 0.3) % 160;
      c.beginPath(); c.arc(x + 80, 250, 90, Math.PI, 0); c.fill();
    }
    c.fillStyle = '#fff';
    for (let i = -1; i < 5; i++) {
      const x = i * 200 - (cam * 0.15) % 200 + 40;
      c.beginPath(); c.arc(x, 50, 14, 0, 7); c.arc(x + 16, 44, 18, 0, 7); c.arc(x + 34, 52, 12, 0, 7); c.fill();
    }
    c.save();
    c.translate(-Math.round(cam), 0);
    for (const s of L.solids) {
      if (s.x > cam + W || s.x + s.w < cam) continue;
      if (s.kind === 'plat') {
        c.fillStyle = '#a0703c'; c.fillRect(s.x, s.y, s.w, s.h);
        c.fillStyle = '#6b4226'; for (let x = s.x; x < s.x + s.w; x += 15) c.fillRect(x, s.y, 2, s.h);
      } else {
        c.fillStyle = '#8b5a2b'; c.fillRect(s.x, s.y, s.w, s.h);
        c.fillStyle = '#5fa04e'; c.fillRect(s.x, s.y, s.w, 8);
        c.fillStyle = '#4f7942'; for (let x = s.x; x < s.x + s.w; x += 10) c.fillRect(x, s.y + 6, 5, 3);
      }
    }
    c.fillStyle = '#7d868e';
    for (const s of L.spikes) {
      c.beginPath();
      for (let i = 0; i < 3; i++) { const x = s.x + i * s.w / 3; c.moveTo(x, s.y + s.h); c.lineTo(x + s.w / 6, s.y); c.lineTo(x + s.w / 3, s.y + s.h); }
      c.fill();
    }
    for (const e of L.enemies) {
      if (!e.alive) continue;
      c.fillStyle = '#7b4f9d';
      c.beginPath(); c.ellipse(e.x + e.w / 2, e.y + e.h * 0.6, e.w / 2, e.h * 0.55, 0, Math.PI, 0); c.fill();
      c.fillRect(e.x, e.y + e.h * 0.6, e.w, e.h * 0.4);
      c.fillStyle = '#fff';
      c.beginPath(); c.arc(e.x + 8, e.y + 10, 4, 0, 7); c.arc(e.x + 16, e.y + 10, 4, 0, 7); c.fill();
      c.fillStyle = '#000';
      const look = e.vx > 0 ? 1 : -1;
      c.beginPath(); c.arc(e.x + 8 + look, e.y + 10, 2, 0, 7); c.arc(e.x + 16 + look, e.y + 10, 2, 0, 7); c.fill();
    }
    const spin = Math.abs(Math.sin(g.t * 5));
    for (const co of L.coins) {
      if (co.got) continue;
      c.fillStyle = '#f2b705';
      c.beginPath(); c.ellipse(co.x, co.y, 7 * spin + 1, 8, 0, 0, 7); c.fill();
      c.strokeStyle = '#b38600'; c.lineWidth = 1.5; c.stroke();
    }
    c.fillStyle = '#6b4226'; c.fillRect(L.flag.x, L.flag.y, 4, 4 * T);
    c.fillStyle = '#c0392b';
    c.beginPath(); c.moveTo(L.flag.x + 4, L.flag.y); c.lineTo(L.flag.x + 40, L.flag.y + 12); c.lineTo(L.flag.x + 4, L.flag.y + 24); c.fill();
    const p = g.p;
    if (!(p.inv > 0 && Math.floor(g.t * 12) % 2)) {
      const img = p.face < 0 ? g.imgFlip : g.img;
      if (img.complete) c.drawImage(img, p.x - 9, p.y - 14, 42, 42);
      else { c.fillStyle = '#e8553b'; c.fillRect(p.x, p.y, p.w, p.h); }
    }
    c.restore();
    c.fillStyle = 'rgba(59,42,26,.75)';
    c.fillRect(6, 6, 190, 26);
    c.fillStyle = '#fff';
    c.font = '600 15px Fredoka, sans-serif';
    c.fillText('❤️'.repeat(g.lives) + '  🪙 ' + g.coins + '  ⏱️ ' + Math.floor(g.t) + 's', 12, 24);
  }

  function finish(won) {
    const g = P.game;
    g.over = true;
    const S = AA.state;
    const total = g.lvl.coins.length;
    let html;
    if (won) {
      const stars = 1 + (g.coins >= total * 0.6 ? 1 : 0) + (g.damaged ? 0 : 1);
      const first = g.n > S.platform.cleared;
      const reward = { gold: 15 * g.n + g.coins * 3, food: g.coins * 2 };
      if (first) { reward.gems = g.n % 5 === 0 ? 3 : 1; S.platform.cleared = g.n; }
      S.platform.stars[g.n] = Math.max(S.platform.stars[g.n] || 0, stars);
      AA.gain(reward);
      AA.addXP(8 + 2 * g.n);
      html = `<div class="center"><div class="big-emoji">🏁</div><h2>¡Nivel ${g.n} superado!</h2><p class="stars-big">${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}</p>
        <p>Monedas: ${g.coins}/${total} · Tiempo: ${Math.floor(g.t)}s</p><p>${AA.rewardLabel(reward)}</p>
        <div class="row center-row"><button class="btn" data-act="menu">Niveles</button>${g.n < AA.PLATFORM_LEVELS ? '<button class="btn btn-primary" data-act="next">Siguiente ▶</button>' : ''}</div></div>`;
    } else {
      html = `<div class="center"><div class="big-emoji">💥</div><h2>¡Oh no!</h2><p>Te quedaste sin vidas en el nivel ${g.n}.</p>
        <div class="row center-row"><button class="btn" data-act="menu">Niveles</button><button class="btn btn-primary" data-act="retry">Reintentar</button></div></div>`;
    }
    AA.save();
    const n = g.n;
    setTimeout(() => {
      const m = AA.modal(html, { locked: true });
      const go = next => { AA.closeModal(); stop(); if (next) start(next); else AA.renderScreen(); AA.emit('change'); };
      AA.bind(m, { menu: () => go(0), next: () => go(n + 1), retry: () => go(n) });
    }, 500);
  }

  AA.screens.saltos = { label: 'Saltos', icon: '🍄', render, busy: () => !!P.game, leave: stop, parent: 'minijuegos' };
})(window.AA);
