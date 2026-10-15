// Arena de estrategia (estilo Clash Royale / Castle Crush): despliega dragones
// y destruye el castillo de la aldea rival.
(function (AA) {
  const esc = AA.esc;
  const W = 360, H = 600, MID = 300;
  const MANA_RATE = 1 / 2.8, MAX_MANA = 10, TIME = 180, DOUBLE_AT = 120, OVERTIME = 60, DECK_MAX = 6;
  const RIVALS = ['Sigrid', 'Bjorn', 'Freya', 'Leif', 'Astrid', 'Ragnar', 'Ingrid', 'Ulf', 'Saga', 'Erik'];
  const A = { game: null };

  function deckDragons() {
    const S = AA.state;
    let deck = S.arena.deck.map(AA.dragonById).filter(Boolean);
    if (!deck.length) deck = S.dragons.slice().sort((a, b) => b.level - a.level).slice(0, DECK_MAX);
    return deck;
  }

  function card(species, level, name, did) {
    return { species, level, name, did, cost: AA.RARITIES[AA.SPECIES[species].rarity].cost };
  }

  // ---------- Menú ----------
  function render(root) {
    if (A.game) return;
    const S = AA.state;
    const lg = AA.leagueOf(S.arena.trophies);
    const next = AA.LEAGUES.find(l => l.min > S.arena.trophies);
    const deckIds = deckDragons().map(d => d.id);
    root.innerHTML = `
      <div class="cover">${AA.coverSVG('arena', 'Arena de aldeas', 'Despliega dragones y derriba el castillo')}</div>
      <section class="card league">
        <div class="big-emoji">${lg.icon}</div>
        <div class="grow"><h2>Liga ${lg.name}</h2><p>🏆 <b>${S.arena.trophies}</b> trofeos · ${S.arena.wins}V / ${S.arena.losses}D</p>
        ${next ? `<div class="bar"><i style="width:${Math.round((S.arena.trophies - lg.min) / (next.min - lg.min) * 100)}%"></i></div><small>${next.min - S.arena.trophies} trofeos para ${next.icon} ${next.name}</small>` : '<small>¡Liga máxima!</small>'}</div>
      </section>
      <section class="card">
        <h2>Tu mazo <small class="muted">${deckIds.length}/${DECK_MAX}</small></h2>
        <p class="muted small">Toca tus dragones para meterlos o sacarlos del mazo. El nivel del dragón es el de la carta. Los de 🔥💧⚡🌪️ atacan a distancia; los de 🌿🪨 cuerpo a cuerpo y aguantan más.</p>
        <div class="deck-row">${S.dragons.map(d =>
          `<button class="deck-pick ${deckIds.includes(d.id) ? 'on' : ''}" data-act="toggle" data-id="${d.id}">${AA.cardHTML(d.species, d.level, { name: d.name })}</button>`).join('')}</div>
      </section>
      <div class="center"><button class="btn btn-primary btn-big" data-act="start">⚔️ ¡A la batalla!</button></div>
      <section class="card">
        <h3>Cómo se juega</h3>
        <ul class="plain small">
          <li>Elige una carta y toca tu mitad del campo (abajo) para soltar al dragón.</li>
          <li>Cada carta cuesta maná 💧, que se recarga solo (máximo ${MAX_MANA}).</li>
          <li>Como en Clash Royale: cada torre de princesa vale 👑 1 y la torre del rey 👑 3 (victoria al instante). La torre del rey duerme hasta que la golpean o cae una de sus princesas.</li>
          <li>Las torres fijan un objetivo y no lo sueltan hasta que muere o sale de su alcance. Los dragones cruzan el río por los puentes.</li>
          <li>Los dragones de 🪨 tierra y ⚙️ metal son rompetorres: solo atacan edificios.</li>
          <li>Partida de 3:00 con elixir doble en el último minuto. Si hay empate de coronas, prórroga de 1:00 a muerte súbita.</li>
          <li>Si derribas una torre de princesa, puedes soltar dragones en ese carril del campo rival.</li>
          <li>Victoria: +30 🏆 y oro. Derrota: −20 🏆.</li>
        </ul>
        <p class="muted small">Ahora mismo te enfrentas a aldeas rivales controladas por la IA. Las batallas en tiempo real contra otras personas están previstas para la fase 2 (ver DISENO.md).</p>
      </section>`;
    AA.bind(root, {
      toggle(ds) {
        let deck = deckDragons().map(d => d.id);
        if (deck.includes(ds.id)) {
          if (deck.length <= 1) return AA.toast('El mazo necesita al menos un dragón');
          deck = deck.filter(x => x !== ds.id);
        } else {
          if (deck.length >= DECK_MAX) return AA.toast(`Máximo ${DECK_MAX} dragones en el mazo`);
          deck.push(ds.id);
        }
        S.arena.deck = deck;
        AA.commit();
      },
      start,
    });
  }

  // ---------- Partida ----------
  // Como en Clash Royale: dos torres de princesa que disparan flechas rápidas y una
  // torre del rey que dispara cañonazos y solo despierta si la golpean o cae una princesa.
  function makeBuildings() {
    const b = (team, kind, x, y) => {
      const king = kind === 'castle';
      const hp = king ? 2400 : 1400;
      return {
        team, kind, x, y, hp, max: hp, r: king ? 30 : 22, range: king ? 118 : 125, dmg: king ? 85 : 44,
        rate: king ? 1.0 : 0.8, cd: 0, dead: false, active: !king, target: null,
      };
    };
    return [
      b('foe', 'tower', 80, 125), b('foe', 'tower', 280, 125), b('foe', 'castle', 180, 55),
      b('me', 'tower', 80, 475), b('me', 'tower', 280, 475), b('me', 'castle', 180, 545),
    ];
  }

  function makeUnit(team, c, x, y) {
    const st = AA.dragonStats(c.species, c.level);
    const els = AA.SPECIES[c.species].elements;
    const ranged = ['fuego', 'agua', 'rayo', 'aire'].includes(els[0]);
    const hp = Math.round(st.hp * (ranged ? 3 : 4.4));
    return {
      team, species: c.species, level: c.level, els, x, y, r: 16,
      hp, max: hp, dmg: st.atk * (ranged ? 1.7 : 2.2), rate: 1, cd: 0.4,
      speed: 22 + st.spd * 1.4, range: ranged ? 85 : 6, ranged,
      // Los de tierra y metal son "rompetorres": ignoran a las tropas, como el Gigante.
      buildingsOnly: ['tierra', 'metal'].includes(els[0]), target: null,
      img: AA.dragonImage(c.species, Math.max(5, c.level), team === 'foe'),
    };
  }

  function start() {
    const S = AA.state;
    const deck = deckDragons();
    const avg = deck.reduce((t, d) => t + d.level, 0) / deck.length;
    const elvl = Math.max(1, Math.min(AA.DRAGON_MAX_LEVEL, Math.round(avg + S.arena.trophies / 300 - 0.5)));
    const pool = Object.keys(AA.SPECIES).filter(id => AA.SPECIES[id].unlock <= S.level + 1);
    const eDeck = [];
    for (let i = 0; i < 6; i++) {
      const sp = pool[Math.floor(Math.random() * pool.length)];
      eDeck.push(card(sp, Math.max(1, elvl + Math.floor(Math.random() * 3) - 1)));
    }
    A.game = {
      t: 0, mana: 5, emana: 5, units: [], projs: [], fx: [], buildings: makeBuildings(),
      queue: deck.map(d => card(d.species, d.level, d.name, d.id)), equeue: eDeck, sel: 0, aiCd: 3,
      rival: 'Aldea de ' + RIVALS[Math.floor(Math.random() * RIVALS.length)], over: false,
    };
    const root = document.getElementById('screen');
    root.innerHTML = `
      <div class="game-wrap arena-wrap">
        <div class="game-top"><button class="btn sm" data-act="quit">🏳️ Rendirse</button><b>${esc(A.game.rival)}</b></div>
        <canvas id="ar"></canvas>
        <div class="mana"><div class="mana-bar"><i id="manaFill"></i></div><b id="manaTxt">5</b>💧</div>
        <div class="hand" id="hand"></div>
      </div>`;
    const cv = root.querySelector('#ar');
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = W * dpr;
    cv.height = H * dpr;
    A.ctx = cv.getContext('2d');
    A.ctx.scale(dpr, dpr);
    A.cv = cv;
    cv.addEventListener('pointerdown', onTap);
    AA.bind(root, { quit: () => AA.confirm('Rendirse', 'Contará como derrota.', 'Rendirse', () => finish('lose')) });
    renderHand();
    A.last = performance.now();
    A.raf = requestAnimationFrame(loop);
  }

  function renderHand() {
    const g = A.game;
    const hand = document.getElementById('hand');
    if (!g || !hand) return;
    hand.innerHTML = g.queue.slice(0, 4).map((c, i) =>
      `<button class="acard ${i === g.sel ? 'on' : ''}" data-i="${i}">${AA.cardHTML(c.species, c.level, { name: c.name })}</button>`).join('');
    hand.querySelectorAll('.acard').forEach(b => b.addEventListener('click', () => { g.sel = +b.dataset.i; renderHand(); }));
  }

  function onTap(e) {
    const g = A.game;
    if (!g || g.over) return;
    const rect = A.cv.getBoundingClientRect();
    const x = (e.clientX - rect.left) * W / rect.width;
    const y = (e.clientY - rect.top) * H / rect.height;
    if (!canDeploy(g, x, y)) return g.fx.push({ text: 'Aquí no puedes soltarlo', x, y, t: 1, color: '#c0392b' });
    const c = g.queue[g.sel];
    if (!c) return;
    if (g.mana < c.cost) return g.fx.push({ text: 'Falta maná', x, y, t: 1, color: '#2f8fd8' });
    g.mana -= c.cost;
    g.units.push(makeUnit('me', c, Math.max(20, Math.min(W - 20, x)), Math.min(H - 20, y)));
    g.queue.push(g.queue.splice(g.sel, 1)[0]);
    g.sel = Math.min(g.sel, Math.min(4, g.queue.length) - 1);
    renderHand();
  }

  function stop() {
    cancelAnimationFrame(A.raf);
    A.game = null;
  }

  function loop(now) {
    const g = A.game;
    if (!g) return;
    const dt = Math.min(1 / 30, (now - A.last) / 1000);
    A.last = now;
    if (!g.over) update(g, dt);
    draw(g);
    const fill = document.getElementById('manaFill');
    if (fill) {
      fill.style.width = (g.mana / MAX_MANA * 100) + '%';
      document.getElementById('manaTxt').textContent = Math.floor(g.mana);
      document.querySelectorAll('.acard').forEach((b, i) => b.classList.toggle('poor', g.queue[i] && g.queue[i].cost > g.mana));
    }
    A.raf = requestAnimationFrame(loop);
  }

  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

  // Tu mitad del campo; si cae una torre de princesa rival, también su carril hasta cerca de su rey.
  function canDeploy(g, x, y) {
    if (y > MID + 20 && y < H - 8) return true;
    if (y < 150 || y > MID - 20) return false;
    const left = x < W / 2;
    return g.buildings.some(b => b.team === 'foe' && b.kind === 'tower' && b.dead && (b.x < W / 2) === left);
  }

  // Punto al que caminar: si el objetivo está al otro lado del río, primero el puente.
  function waypoint(u, target) {
    const mySide = u.y > MID, tgSide = target.y > MID;
    if (mySide === tgSide || Math.abs(u.y - MID) < 6) return target;
    const bx = u.x < W / 2 ? 80 : 280;
    const entry = mySide ? MID + 20 : MID - 20, exit = mySide ? MID - 22 : MID + 22;
    if (Math.abs(u.x - bx) > 8) return { x: bx, y: entry };
    return { x: bx, y: exit };
  }

  function crownsOf(g, team) {
    return g.buildings.filter(b => b.team !== team && b.dead).reduce((t, b) => t + (b.kind === 'castle' ? 3 : 1), 0);
  }

  function damage(target, amount, el, g) {
    const mult = target.els ? AA.elementMult(el, target.els) : 1;
    const dmg = Math.round(amount * mult);
    target.hp -= dmg;
    g.fx.push({ text: String(dmg), x: target.x + (Math.random() * 10 - 5), y: target.y - 18, t: 0.7, color: mult > 1 ? '#e8553b' : '#3b2a1a' });
    if (target.kind && !target.active) wakeKing(target, g);
    if (target.kind && target.hp <= 0 && !target.dead) {
      target.dead = true;
      g.fx.push({ text: '💥', x: target.x, y: target.y, t: 1.2, size: 34 });
      g.fx.push({ text: target.team === 'foe' ? '👑 +' + (target.kind === 'castle' ? 3 : 1) : '👑 −', x: W / 2, y: H / 2, t: 1.6, size: 26, color: target.team === 'foe' ? '#2a6f97' : '#c0392b' });
      if (target.kind === 'castle') finish(target.team === 'foe' ? 'win' : 'lose');
      else {
        const king = g.buildings.find(b => b.team === target.team && b.kind === 'castle');
        wakeKing(king, g);
        // Muerte súbita: en la prórroga gana la primera torre derribada.
        if (g.overtime) finish(target.team === 'foe' ? 'win' : 'lose');
      }
    }
  }

  function wakeKing(king, g) {
    if (!king || king.active || king.dead) return;
    king.active = true;
    g.fx.push({ text: '¡El rey despierta!', x: king.x, y: king.y + (king.team === 'foe' ? 46 : -46), t: 1.6, size: 15, color: '#e0a100' });
  }

  const manaRate = g => MANA_RATE * (g.t >= DOUBLE_AT ? 2 : 1);

  function aiTurn(g, dt) {
    g.emana = Math.min(MAX_MANA, g.emana + manaRate(g) * dt);
    g.aiCd -= dt;
    const c = g.equeue[0];
    if (g.aiCd > 0 || g.emana < c.cost) return;
    const threat = g.units.filter(u => u.team === 'me' && u.y < MID + 60).sort((a, b) => a.y - b.y)[0];
    const x = threat ? Math.max(30, Math.min(W - 30, threat.x + (Math.random() * 40 - 20))) : (Math.random() < 0.5 ? 80 : 280) + (Math.random() * 40 - 20);
    const y = threat ? Math.max(80, Math.min(MID - 30, threat.y - 70)) : 150 + Math.random() * 100;
    g.emana -= c.cost;
    g.units.push(makeUnit('foe', c, x, y));
    g.equeue.push(g.equeue.shift());
    g.aiCd = 1.2 + Math.random() * 2.5;
  }

  function update(g, dt) {
    g.t += dt;
    if (!g.doubleShown && g.t >= DOUBLE_AT) { g.doubleShown = true; g.fx.push({ text: '¡Elixir x2!', x: W / 2, y: MID - 40, t: 2, size: 24, color: '#9b4dca' }); }
    g.mana = Math.min(MAX_MANA, g.mana + manaRate(g) * dt);
    aiTurn(g, dt);
    const alive = g.buildings.filter(b => !b.dead);
    for (const u of g.units) {
      const isAlive = t => t && (t.kind ? !t.dead : t.hp > 0);
      // Fija objetivo como en Clash Royale: lo mantiene hasta que muere, salvo que
      // persiga un edificio y una tropa enemiga se le acerque.
      if (!isAlive(u.target)) u.target = null;
      if (!u.buildingsOnly && (!u.target || u.target.kind)) {
        let best = u.target ? 70 : 105;
        for (const o of g.units) {
          if (o.team === u.team || o.hp <= 0) continue;
          const d = dist(u, o);
          if (d < best) { best = d; u.target = o; }
        }
      }
      if (!u.target) {
        let best = Infinity;
        for (const b of alive) {
          if (b.team === u.team) continue;
          const d = dist(u, b);
          if (d < best) { best = d; u.target = b; }
        }
      }
      const target = u.target;
      if (!target) continue;
      const d = dist(u, target);
      if (d > u.range + u.r + target.r) {
        const wp = waypoint(u, target);
        const dw = dist(u, wp) || 1;
        u.x += (wp.x - u.x) / dw * u.speed * dt;
        u.y += (wp.y - u.y) / dw * u.speed * dt;
      } else {
        u.cd -= dt;
        if (u.cd <= 0) {
          u.cd = u.rate;
          if (u.ranged) g.projs.push({ x: u.x, y: u.y, target, dmg: u.dmg, el: u.els[0], color: AA.ELEMENTS[u.els[0]].color, speed: 280 });
          else damage(target, u.dmg, u.els[0], g);
        }
      }
    }
    for (const b of alive) {
      if (!b.active) continue;
      b.cd -= dt;
      // La torre sigue al mismo objetivo hasta que muere o sale de su alcance.
      if (b.target && (b.target.hp <= 0 || dist(b, b.target) > b.range)) b.target = null;
      if (!b.target) {
        let best = b.range;
        for (const u of g.units) {
          if (u.team === b.team || u.hp <= 0) continue;
          const d = dist(b, u);
          if (d < best) { best = d; b.target = u; }
        }
      }
      if (b.target && b.cd <= 0) {
        b.cd = b.rate;
        const king = b.kind === 'castle';
        g.projs.push({ x: b.x, y: b.y - (king ? 18 : 24), target: b.target, dmg: b.dmg, el: null, kind: king ? 'bala' : 'flecha', color: king ? '#2c2c34' : '#5a3820', speed: king ? 260 : 420 });
      }
    }
    for (const p of g.projs) {
      const t = p.target;
      if (t.hp <= 0 || t.dead) { p.done = true; continue; }
      const d = dist(p, t);
      if (d < 8) { damage(t, p.dmg, p.el, g); p.done = true; continue; }
      p.x += (t.x - p.x) / d * p.speed * dt;
      p.y += (t.y - p.y) / d * p.speed * dt;
    }
    g.projs = g.projs.filter(p => !p.done);
    // separación para que no se amontonen
    for (let i = 0; i < g.units.length; i++) {
      for (let j = i + 1; j < g.units.length; j++) {
        const a = g.units[i], b = g.units[j];
        const d = dist(a, b) || 0.01;
        if (d < 26) {
          const push = (26 - d) / 2;
          a.x -= (b.x - a.x) / d * push; a.y -= (b.y - a.y) / d * push;
          b.x += (b.x - a.x) / d * push; b.y += (b.y - a.y) / d * push;
        }
      }
    }
    g.units.forEach(u => { u.x = Math.max(12, Math.min(W - 12, u.x)); });
    g.units.filter(u => u.hp <= 0).forEach(u => g.fx.push({ text: '💨', x: u.x, y: u.y, t: 0.8, size: 24 }));
    g.units = g.units.filter(u => u.hp > 0);
    g.fx.forEach(f => { f.t -= dt; f.y -= 20 * dt; });
    g.fx = g.fx.filter(f => f.t > 0);
    if (!g.over && g.t >= TIME && !g.overtime) {
      const me = crownsOf(g, 'me'), foe = crownsOf(g, 'foe');
      if (me !== foe) finish(me > foe ? 'win' : 'lose');
      else { g.overtime = true; g.fx.push({ text: '¡Prórroga! Muerte súbita', x: W / 2, y: MID - 40, t: 2.4, size: 20, color: '#c0392b' }); }
    }
    if (!g.over && g.t >= TIME + OVERTIME) {
      const hpLeft = team => g.buildings.filter(b => b.team === team && !b.dead).reduce((t, b) => Math.min(t, b.hp / b.max), 1);
      const a = hpLeft('me'), b = hpLeft('foe');
      finish(Math.abs(a - b) < 0.02 ? 'draw' : a > b ? 'win' : 'lose');
    }
  }

  function drawBuilding(c, b, t) {
    const col = b.team === 'me' ? '#2a6f97' : '#c0392b';
    const roof = b.team === 'me' ? '#1f5a80' : '#9c2a1e';
    const king = b.kind === 'castle';
    const s = b.r;
    c.save();
    c.translate(b.x, b.y);
    if (b.dead) {
      c.fillStyle = '#6b5a46';
      c.beginPath(); c.ellipse(0, 6, s * 1.1, s * 0.55, 0, 0, 7); c.fill();
      c.fillStyle = '#9b8a76';
      [[-10, 0, 7], [6, 4, 6], [-2, -4, 5], [12, -2, 4]].forEach(([x, y, r]) => { c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); });
      c.restore();
      return;
    }
    // sombra y base de piedra
    c.fillStyle = 'rgba(0,0,0,.28)';
    c.beginPath(); c.ellipse(0, s * 0.95, s * 1.25, s * 0.45, 0, 0, 7); c.fill();
    const stone = c.createLinearGradient(-s, 0, s, 0);
    stone.addColorStop(0, '#9c8f7c'); stone.addColorStop(0.5, '#d2c6b0'); stone.addColorStop(1, '#8a7d6a');
    c.fillStyle = stone;
    c.fillRect(-s, -s * 0.7, s * 2, s * 1.6);
    c.strokeStyle = 'rgba(60,45,30,.45)'; c.lineWidth = 1;
    for (let y = -s * 0.4; y < s * 0.9; y += 7) { c.beginPath(); c.moveTo(-s, y); c.lineTo(s, y); c.stroke(); }
    c.fillStyle = '#b9ac96';
    for (let i = 0; i < 5; i++) c.fillRect(-s + i * s * 0.45, -s * 1.0, s * 0.3, s * 0.34);
    c.fillStyle = col; c.fillRect(-s, -s * 0.72, s * 2, 4);
    if (king) {
      // torre del rey: cañón y corona; dormida hasta que se activa
      c.fillStyle = roof;
      c.beginPath(); c.moveTo(-s * 0.7, -s * 1.0); c.lineTo(0, -s * 1.75); c.lineTo(s * 0.7, -s * 1.0); c.fill();
      c.fillStyle = '#f2c94c';
      c.beginPath(); c.moveTo(-9, -s * 1.8); c.lineTo(-9, -s * 2.1); c.lineTo(-4, -s * 1.95); c.lineTo(0, -s * 2.2); c.lineTo(4, -s * 1.95); c.lineTo(9, -s * 2.1); c.lineTo(9, -s * 1.8); c.fill();
      c.fillStyle = '#2c2c34';
      const dir = b.team === 'me' ? -1 : 1;
      c.fillRect(-4, dir > 0 ? s * 0.2 : -s * 0.45, 8, 12);
      if (!b.active) {
        c.fillStyle = '#ffffff'; c.font = '700 13px Fredoka, sans-serif'; c.textAlign = 'center';
        c.globalAlpha = 0.6 + 0.4 * Math.sin(t * 3);
        c.fillText('Zz', s * 0.9, -s * 1.6);
        c.globalAlpha = 1;
      }
    } else {
      // torre de princesa con arquera
      c.fillStyle = roof;
      c.beginPath(); c.moveTo(-s * 0.85, -s * 1.0); c.lineTo(0, -s * 1.6); c.lineTo(s * 0.85, -s * 1.0); c.fill();
      c.fillStyle = '#f5cfae'; c.beginPath(); c.arc(0, -s * 1.15, 4.5, 0, 7); c.fill();
      c.strokeStyle = '#6b4226'; c.lineWidth = 2;
      c.beginPath(); c.arc(5, -s * 1.1, 6, -1.2, 1.2); c.stroke();
    }
    c.fillStyle = '#4a3220'; c.fillRect(-s * 0.22, s * 0.35, s * 0.44, s * 0.55);
    c.restore();
    hpBar(c, b.x, b.y - s * (king ? 2.45 : 1.95), s * 2.2, b.hp / b.max, col, Math.ceil(Math.max(0, b.hp)));
  }

  function hpBar(c, x, y, w, pct, col, label) {
    c.fillStyle = 'rgba(0,0,0,.45)'; c.fillRect(x - w / 2 - 1, y - 1, w + 2, label ? 9 : 6);
    c.fillStyle = col; c.fillRect(x - w / 2, y, w * Math.max(0, pct), label ? 7 : 4);
    if (label) {
      c.fillStyle = '#fff'; c.font = '700 8px Nunito, sans-serif'; c.textAlign = 'center';
      c.fillText(label, x, y + 6.5);
    }
  }

  function drawField(c, g) {
    const grass = c.createLinearGradient(0, 0, 0, H);
    grass.addColorStop(0, '#6f9e4f'); grass.addColorStop(0.5, '#8cbc63'); grass.addColorStop(1, '#6f9e4f');
    c.fillStyle = grass; c.fillRect(0, 0, W, H);
    c.fillStyle = 'rgba(255,255,255,.05)';
    for (let y = 0; y < H; y += 24) for (let x = (y / 24) % 2 ? 0 : 24; x < W; x += 48) c.fillRect(x, y, 24, 24);
    // caminos de los carriles con borde de piedra
    [80, 280].forEach(x => {
      c.fillStyle = '#c9ad7d'; c.fillRect(x - 17, 40, 34, H - 80);
      c.fillStyle = 'rgba(90,60,30,.35)'; c.fillRect(x - 17, 40, 3, H - 80); c.fillRect(x + 14, 40, 3, H - 80);
    });
    c.fillStyle = '#c9ad7d'; c.fillRect(80, 52, 200, 18); c.fillRect(80, H - 70, 200, 18);
    // río con olas
    const water = c.createLinearGradient(0, MID - 16, 0, MID + 16);
    water.addColorStop(0, '#3f8fc0'); water.addColorStop(0.5, '#6ec3ea'); water.addColorStop(1, '#3f8fc0');
    c.fillStyle = '#5a7d3a'; c.fillRect(0, MID - 19, W, 38);
    c.fillStyle = water; c.fillRect(0, MID - 15, W, 30);
    c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 1.5;
    for (let x = ((g.t * 18) % 40) - 40; x < W; x += 40) { c.beginPath(); c.moveTo(x, MID); c.quadraticCurveTo(x + 8, MID - 4, x + 16, MID); c.stroke(); }
    // puentes de madera
    [80, 280].forEach(x => {
      c.fillStyle = '#7a4f2a'; c.fillRect(x - 22, MID - 22, 44, 44);
      c.fillStyle = '#a0703c';
      for (let y = MID - 20; y < MID + 20; y += 7) c.fillRect(x - 20, y, 40, 5);
      c.fillStyle = '#4a3220'; c.fillRect(x - 24, MID - 22, 4, 44); c.fillRect(x + 20, MID - 22, 4, 44);
    });
  }

  function draw(g) {
    const c = A.ctx;
    drawField(c, g);
    const sel = g.queue[g.sel];
    if (sel && g.mana >= sel.cost) {
      c.fillStyle = 'rgba(80,170,255,.13)';
      c.fillRect(0, MID + 20, W, H - MID - 28);
      g.buildings.filter(b => b.team === 'foe' && b.kind === 'tower' && b.dead).forEach(b => {
        c.fillRect(b.x < W / 2 ? 0 : W / 2, 150, W / 2, MID - 170);
      });
    } else {
      c.fillStyle = 'rgba(192,57,43,.08)'; c.fillRect(0, 0, W, MID - 20);
    }
    // de arriba abajo para que se solapen bien
    const things = g.buildings.map(b => ({ y: b.y, b })).concat(g.units.map(u => ({ y: u.y, u }))).sort((a, b) => a.y - b.y);
    for (const it of things) {
      if (it.b) { drawBuilding(c, it.b, g.t); continue; }
      const u = it.u;
      const col = u.team === 'me' ? '#2a6f97' : '#c0392b';
      c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.ellipse(u.x, u.y + 13, 15, 5, 0, 0, 7); c.fill();
      c.strokeStyle = col; c.lineWidth = 2.5; c.beginPath(); c.ellipse(u.x, u.y + 13, 15, 5, 0, 0, 7); c.stroke();
      const bob = Math.sin(g.t * 8 + u.x) * 1.5;
      if (u.img.complete) c.drawImage(u.img, u.x - 23, u.y - 28 + bob, 46, 40);
      hpBar(c, u.x, u.y - 31, 30, u.hp / u.max, col);
    }
    for (const p of g.projs) {
      if (p.kind === 'flecha') {
        const t = p.target, a = Math.atan2(t.y - p.y, t.x - p.x);
        c.save(); c.translate(p.x, p.y); c.rotate(a);
        c.strokeStyle = '#5a3820'; c.lineWidth = 2; c.beginPath(); c.moveTo(-9, 0); c.lineTo(5, 0); c.stroke();
        c.fillStyle = '#c9d1d8'; c.beginPath(); c.moveTo(8, 0); c.lineTo(3, -3); c.lineTo(3, 3); c.fill();
        c.fillStyle = '#ffffff'; c.fillRect(-10, -2, 3, 4);
        c.restore();
      } else if (p.kind === 'bala') {
        c.fillStyle = '#2c2c34'; c.beginPath(); c.arc(p.x, p.y, 5.5, 0, 7); c.fill();
        c.fillStyle = 'rgba(255,255,255,.4)'; c.beginPath(); c.arc(p.x - 1.5, p.y - 1.5, 1.8, 0, 7); c.fill();
      } else {
        c.fillStyle = p.color; c.globalAlpha = 0.35; c.beginPath(); c.arc(p.x, p.y, 8, 0, 7); c.fill();
        c.globalAlpha = 1; c.beginPath(); c.arc(p.x, p.y, 4.5, 0, 7); c.fill();
      }
    }
    c.textAlign = 'center';
    for (const f of g.fx) {
      c.globalAlpha = Math.min(1, f.t * 2);
      c.font = `700 ${f.size || 14}px Fredoka, sans-serif`;
      c.lineWidth = 3; c.strokeStyle = 'rgba(255,255,255,.85)';
      c.strokeText(f.text, f.x, f.y);
      c.fillStyle = f.color || '#3b2a1a';
      c.fillText(f.text, f.x, f.y);
    }
    c.globalAlpha = 1;
    // marcador: tiempo, elixir x2 y coronas
    const left = g.overtime ? Math.max(0, TIME + OVERTIME - g.t) : Math.max(0, TIME - g.t);
    c.fillStyle = 'rgba(30,20,12,.8)'; c.fillRect(W / 2 - 46, 4, 92, 26);
    c.fillStyle = g.overtime ? '#ff8a7a' : left < 30 ? '#ffb38a' : '#fff'; c.font = '700 16px Fredoka, sans-serif';
    c.fillText(`${g.overtime ? '⏱ ' : ''}${Math.floor(left / 60)}:${String(Math.floor(left % 60)).padStart(2, '0')}`, W / 2, 23);
    if (g.t >= DOUBLE_AT) { c.fillStyle = '#d08cff'; c.font = '700 11px Fredoka, sans-serif'; c.fillText('ELIXIR x2', W / 2, 42); }
    c.font = '700 15px Fredoka, sans-serif';
    c.fillStyle = 'rgba(30,20,12,.75)'; c.fillRect(6, MID - 52, 40, 22); c.fillRect(6, MID + 30, 40, 22);
    c.fillStyle = '#ff8a7a'; c.fillText('👑' + crownsOf(g, 'foe'), 26, MID - 36);
    c.fillStyle = '#8fd3ff'; c.fillText('👑' + crownsOf(g, 'me'), 26, MID + 46);
    c.textAlign = 'left';
  }

  function finish(result, silent) {
    const g = A.game;
    if (!g || g.over) return;
    g.over = true;
    const S = AA.state;
    let reward = {}, troph = 0;
    if (result === 'win') {
      troph = 30;
      reward = { gold: 100 + Math.floor(S.arena.trophies / 10) };
      if (Math.random() < 0.4) reward.gems = 1;
      S.arena.wins++;
      AA.addXP(15);
      AA.gain(reward);
    } else if (result === 'lose') {
      troph = -Math.min(20, S.arena.trophies);
      S.arena.losses++;
    }
    const before = AA.leagueOf(S.arena.trophies);
    S.arena.trophies += troph;
    const after = AA.leagueOf(S.arena.trophies);
    AA.save();
    if (silent) return;
    const title = { win: '¡Aldea conquistada!', lose: 'Tu castillo ha caído', draw: 'Empate' }[result];
    const icon = { win: '🏆', lose: '💫', draw: '🤝' }[result];
    setTimeout(() => {
      const m = AA.modal(`<div class="center"><div class="big-emoji">${icon}</div><h2>${title}</h2>
        <p>${troph >= 0 ? '+' : ''}${troph} 🏆 → <b>${S.arena.trophies}</b></p>${Object.keys(reward).length ? `<p>${AA.rewardLabel(reward)}</p>` : ''}
        ${after !== before ? `<p class="new-tag">${after.icon} ¡Liga ${after.name}!</p>` : ''}
        <button class="btn btn-primary" data-act="ok">Continuar</button></div>`, { locked: true });
      AA.bind(m, { ok() { AA.closeModal(); stop(); AA.renderScreen(); AA.emit('change'); } });
    }, 700);
  }

  AA.screens.arena = {
    label: 'Arena', icon: '🏰', render, parent: 'minijuegos',
    busy: () => !!A.game,
    leave() {
      if (A.game && !A.game.over) finish('lose', true);
      stop();
    },
  };
})(window.AA);
