// Arena de estrategia (estilo Clash Royale / Castle Crush): despliega dragones
// y destruye el castillo de la aldea rival.
(function (AA) {
  const esc = AA.esc;
  const W = 360, H = 600, MID = 300;
  const MANA_RATE = 1 / 1.4, MAX_MANA = 10, TIME = 150, DECK_MAX = 6;
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
          <li>Destruye el castillo rival para ganar al instante. Si se acaba el tiempo (${TIME / 60 | 0}:${String(TIME % 60).padStart(2, '0')}), gana quien haya destruido más torres.</li>
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
  function makeBuildings() {
    const b = (team, kind, x, y) => {
      const castle = kind === 'castle';
      const hp = castle ? 2200 : 1200;
      return { team, kind, x, y, hp, max: hp, r: castle ? 30 : 22, range: castle ? 140 : 125, dmg: castle ? 60 : 48, rate: 0.8, cd: 0, dead: false };
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
    if (y < MID + 20) return g.fx.push({ text: 'Solo en tu lado', x, y, t: 1, color: '#c0392b' });
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

  function damage(target, amount, el, g) {
    const mult = target.els ? AA.elementMult(el, target.els) : 1;
    const dmg = Math.round(amount * mult);
    target.hp -= dmg;
    g.fx.push({ text: String(dmg), x: target.x + (Math.random() * 10 - 5), y: target.y - 18, t: 0.7, color: mult > 1 ? '#e8553b' : '#3b2a1a' });
    if (target.kind && target.hp <= 0 && !target.dead) {
      target.dead = true;
      g.fx.push({ text: '💥', x: target.x, y: target.y, t: 1.2, size: 34 });
      if (target.kind === 'castle') finish(target.team === 'foe' ? 'win' : 'lose');
    }
  }

  function aiTurn(g, dt) {
    g.emana = Math.min(MAX_MANA, g.emana + MANA_RATE * dt);
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
    g.mana = Math.min(MAX_MANA, g.mana + MANA_RATE * dt);
    aiTurn(g, dt);
    const alive = g.buildings.filter(b => !b.dead);
    for (const u of g.units) {
      const foes = g.units.filter(o => o.team !== u.team && o.hp > 0);
      let target = null, best = 110;
      for (const o of foes) { const d = dist(u, o); if (d < best) { best = d; target = o; } }
      if (!target) {
        best = Infinity;
        for (const b of alive) {
          if (b.team === u.team) continue;
          const d = dist(u, b);
          if (d < best) { best = d; target = b; }
        }
      }
      if (!target) continue;
      const d = dist(u, target);
      if (d > u.range + u.r + target.r) {
        u.x += (target.x - u.x) / d * u.speed * dt;
        u.y += (target.y - u.y) / d * u.speed * dt;
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
      b.cd -= dt;
      if (b.cd > 0) continue;
      let target = null, best = b.range;
      for (const u of g.units) {
        if (u.team === b.team || u.hp <= 0) continue;
        const d = dist(b, u);
        if (d < best) { best = d; target = u; }
      }
      if (target) {
        b.cd = b.rate;
        g.projs.push({ x: b.x, y: b.y - 10, target, dmg: b.dmg, el: null, color: b.team === 'me' ? '#2a6f97' : '#c0392b', speed: 320 });
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
    if (!g.over && g.t >= TIME) {
      const crowns = team => g.buildings.filter(b => b.team !== team && b.dead).length;
      const hpLeft = team => g.buildings.filter(b => b.team === team).reduce((t, b) => t + Math.max(0, b.hp) / b.max, 0);
      const me = crowns('me'), foe = crowns('foe');
      if (me !== foe) finish(me > foe ? 'win' : 'lose');
      else { const a = hpLeft('me'), b = hpLeft('foe'); finish(Math.abs(a - b) < 0.05 ? 'draw' : a > b ? 'win' : 'lose'); }
    }
  }

  function drawBuilding(c, b) {
    const col = b.team === 'me' ? '#2a6f97' : '#c0392b';
    const s = b.r;
    c.save();
    c.translate(b.x, b.y);
    if (b.dead) {
      c.fillStyle = '#7d6a55';
      c.beginPath(); c.ellipse(0, 6, s, s * 0.5, 0, 0, 7); c.fill();
      c.restore();
      return;
    }
    c.fillStyle = 'rgba(0,0,0,.2)';
    c.beginPath(); c.ellipse(0, s * 0.9, s * 1.1, s * 0.4, 0, 0, 7); c.fill();
    c.fillStyle = '#b9a98f'; c.fillRect(-s, -s * 0.6, s * 2, s * 1.5);
    c.fillStyle = '#9c8a70';
    for (let i = 0; i < 4; i++) c.fillRect(-s + i * s * 0.55, -s * 0.9, s * 0.35, s * 0.35);
    c.fillStyle = '#6b4226'; c.fillRect(-s * 0.25, s * 0.3, s * 0.5, s * 0.6);
    c.fillStyle = '#3b2a1a'; c.fillRect(-1, -s * 1.6, 2, s * 0.8);
    c.fillStyle = col;
    c.beginPath(); c.moveTo(1, -s * 1.6); c.lineTo(s * 0.7, -s * 1.35); c.lineTo(1, -s * 1.1); c.fill();
    c.restore();
    hpBar(c, b.x, b.y - s * 1.9, s * 2, b.hp / b.max, col);
  }

  function hpBar(c, x, y, w, pct, col) {
    c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(x - w / 2, y, w, 5);
    c.fillStyle = col; c.fillRect(x - w / 2, y, w * Math.max(0, pct), 5);
  }

  function draw(g) {
    const c = A.ctx;
    const grass = c.createLinearGradient(0, 0, 0, H);
    grass.addColorStop(0, '#8fbf6a'); grass.addColorStop(0.5, '#a6d17f'); grass.addColorStop(1, '#8fbf6a');
    c.fillStyle = grass; c.fillRect(0, 0, W, H);
    c.fillStyle = '#d9c08f';
    c.fillRect(64, 0, 32, H); c.fillRect(264, 0, 32, H);
    c.fillStyle = '#5fb4d9'; c.fillRect(0, MID - 14, W, 28);
    c.fillStyle = '#a0703c'; c.fillRect(58, MID - 18, 44, 36); c.fillRect(258, MID - 18, 44, 36);
    if (g.queue[g.sel] && g.mana >= g.queue[g.sel].cost) {
      c.fillStyle = 'rgba(42,111,151,.12)'; c.fillRect(0, MID + 20, W, H - MID - 20);
    }
    g.buildings.forEach(b => drawBuilding(c, b));
    for (const u of g.units) {
      const col = u.team === 'me' ? '#2a6f97' : '#c0392b';
      c.fillStyle = col; c.globalAlpha = 0.35;
      c.beginPath(); c.ellipse(u.x, u.y + 12, 16, 6, 0, 0, 7); c.fill();
      c.globalAlpha = 1;
      if (u.img.complete) c.drawImage(u.img, u.x - 22, u.y - 26, 44, 44);
      hpBar(c, u.x, u.y - 30, 30, u.hp / u.max, col);
    }
    for (const p of g.projs) {
      c.fillStyle = p.color;
      c.beginPath(); c.arc(p.x, p.y, 5, 0, 7); c.fill();
    }
    c.textAlign = 'center';
    for (const f of g.fx) {
      c.globalAlpha = Math.min(1, f.t * 2);
      c.font = `700 ${f.size || 14}px Fredoka, sans-serif`;
      c.fillStyle = f.color || '#3b2a1a';
      c.fillText(f.text, f.x, f.y);
    }
    c.globalAlpha = 1;
    const left = Math.max(0, TIME - g.t);
    c.fillStyle = 'rgba(59,42,26,.75)'; c.fillRect(W / 2 - 40, 4, 80, 24);
    c.fillStyle = left < 30 ? '#ffb38a' : '#fff'; c.font = '700 16px Fredoka, sans-serif';
    c.fillText(`${Math.floor(left / 60)}:${String(Math.floor(left % 60)).padStart(2, '0')}`, W / 2, 22);
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
