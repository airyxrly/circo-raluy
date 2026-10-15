// Combates por turnos: campaña 1 contra 1, asaltos 3 contra 3 a aldeas
// rivales (Fuerte de asalto) y duelos online.
(function (AA) {
  const esc = AA.esc;
  const B = AA.battle = { fight: null, selected: null, team: null, tab: 'campana', online: null };
  const RIVALS = ['Sigrid', 'Bjorn', 'Freya', 'Leif', 'Astrid', 'Ragnar', 'Ingrid', 'Ulf', 'Saga', 'Erik', 'Gunnar', 'Thyra', 'Halvar', 'Runa', 'Torvald', 'Eira'];
  const DIFF = [
    { name: 'Fácil', icon: '🟢', lvl: -2, loot: 1 },
    { name: 'Normal', icon: '🟡', lvl: 0, loot: 1.6 },
    { name: 'Difícil', icon: '🔴', lvl: 2, loot: 2.4 },
  ];

  AA.makeFighter = function (d) {
    const st = AA.dragonStats(d.species, d.level);
    return {
      name: d.name, species: d.species, level: d.level, dragonId: d.id,
      hp: st.hp, maxhp: st.hp, atk: st.atk, def: st.def, spd: st.spd,
      els: AA.SPECIES[d.species].elements, cds: {},
      abil: AA.abilitiesFor(d.species, d.level).filter(a => !a.locked),
    };
  };

  // Aplica una habilidad. Cada acción reduce en 1 la espera de las demás.
  AA.resolveMove = function (att, def, ab, rnd) {
    rnd = rnd || Math.random;
    const out = { text: '', dmg: 0, heal: 0, crit: false, eff: 1 };
    if (ab.heal) {
      const h = Math.round(att.maxhp * ab.heal);
      att.hp = Math.min(att.maxhp, att.hp + h);
      out.heal = h;
      out.text = `${att.name} usa ${ab.name} y recupera ${h} PV.`;
    } else {
      const eff = AA.elementMult(ab.element, def.els);
      const crit = rnd() < 0.1;
      const dmg = Math.max(1, Math.round(ab.power * att.atk / (def.def + 20) * (0.9 + rnd() * 0.2) * eff * (crit ? 1.5 : 1)));
      def.hp = Math.max(0, def.hp - dmg);
      Object.assign(out, { dmg, crit, eff });
      out.text = `${att.name} usa ${ab.name}: ${dmg} de daño.${crit ? ' ¡Crítico!' : ''}${eff > 1 ? ' ¡Es muy eficaz!' : eff < 1 ? ' No es muy eficaz…' : ''}`;
    }
    Object.keys(att.cds).forEach(k => { if (k !== ab.id && att.cds[k] > 0) att.cds[k]--; });
    att.cds[ab.id] = ab.cd;
    return out;
  };

  const available = (f, ab) => !(f.cds[ab.id] > 0);

  function aiChoose(me, foe) {
    const opts = me.abil.filter(a => available(me, a));
    const heal = opts.find(a => a.heal);
    if (heal && me.hp / me.maxhp < 0.35 && Math.random() < 0.7) return heal;
    const attacks = opts.filter(a => !a.heal);
    if (Math.random() < 0.2) return attacks[Math.floor(Math.random() * attacks.length)];
    return attacks.sort((a, b) => b.power * AA.elementMult(b.element, foe.els) - a.power * AA.elementMult(a.element, foe.els))[0];
  }

  // ---------- Aldeas rivales para asaltar ----------
  function rand(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }

  function genRaid(diff) {
    const S = AA.state;
    const mine = S.dragons.slice().sort((a, b) => b.level - a.level).slice(0, 3);
    const avg = mine.reduce((t, d) => t + d.level, 0) / mine.length;
    const D = DIFF[diff];
    const lvl = Math.max(1, Math.round(avg + D.lvl));
    const pool = Object.keys(AA.SPECIES).filter(id => AA.SPECIES[id].unlock <= S.level + 2 + diff * 2 && AA.SPECIES[id].rarity !== 'mitico');
    const O = AA.AVATAR_OPTIONS;
    const pick = arr => arr[Math.floor(Math.random() * arr.length)];
    return {
      id: 'r' + Date.now().toString(36) + rand(100, 999), diff,
      name: 'Aldea de ' + pick(RIVALS),
      avatar: { genero: pick(O.genero)[0], piel: pick(O.piel), pelo: pick(O.pelo)[0], colorPelo: pick(O.colorPelo), ojos: pick(O.ojos), ropa: pick(O.ropa)[0], colorRopa: pick(O.colorRopa), accesorio: pick(O.accesorio)[0], pecas: Math.random() < 0.4, barba: Math.random() < 0.25 },
      team: [0, 1, 2].map(() => {
        const sp = pick(pool);
        return { species: sp, level: Math.max(1, Math.min(AA.DRAGON_MAX_LEVEL, lvl + rand(-1, 1))), name: AA.SPECIES[sp].name };
      }),
      loot: { gold: Math.round((150 + lvl * 60) * D.loot), food: Math.round((60 + lvl * 25) * D.loot), gems: diff === 2 ? 2 : 0 },
    };
  }

  function ensureRaids() {
    const R = AA.state.raid;
    if (!R.targets || R.targets.length !== 3) R.targets = [0, 1, 2].map(genRaid);
  }

  function teamDragons() {
    const S = AA.state;
    let t = (B.team || []).map(AA.dragonById).filter(Boolean);
    if (!t.length) t = S.dragons.slice().sort((a, b) => b.level - a.level).slice(0, 3);
    B.team = t.map(d => d.id);
    return t;
  }

  // ---------- Pantalla ----------
  function render(root) {
    if (B.fight) return renderFight(root);
    if (AA.params && AA.params.tab) { B.tab = AA.params.tab; AA.params.tab = null; }
    const S = AA.state;
    const fortLocked = S.level < AA.BUILDINGS.fuerte.unlock;
    const tabs = [['campana', '📜 Campaña'], ['asaltos', '🏰 Asaltos'], ['online', '🌍 Online']];
    let body;
    if (B.tab === 'asaltos') body = fortLocked ? `<div class="notice">🔒 El Fuerte de asalto se desbloquea a nivel ${AA.BUILDINGS.fuerte.unlock}.</div>` : raidsBody();
    else if (B.tab === 'online') body = championPicker() + onlineSection();
    else body = championPicker() + campaignBody();
    root.innerHTML = `<div class="cover">${AA.coverSVG('batallas', 'Batallas', B.tab === 'asaltos' ? 'Fuerte de asalto: conquista aldeas rivales' : 'Combates por turnos')}</div>
      <div class="tabs">${tabs.map(([k, l]) => `<button class="tab ${k === B.tab ? 'on' : ''}" data-act="tab" data-id="${k}">${l}</button>`).join('')}</div>
      ${body}
      <details class="card"><summary><b>Tabla de elementos</b></summary><div class="el-table">${Object.keys(AA.STRONG).map(e =>
        `<div>${AA.ELEMENTS[e].icon} <b>${AA.ELEMENTS[e].name}</b> gana a ${AA.STRONG[e].map(x => AA.ELEMENTS[x].icon).join(' ')}</div>`).join('')}</div></details>`;
    AA.bind(root, {
      tab(ds) { B.tab = ds.id; AA.renderScreen(); },
      pick(ds) { B.selected = ds.id; AA.renderScreen(); },
      fight(ds) {
        const c = AA.CAMPAIGN[+ds.i];
        const champ = AA.dragonById(B.selected);
        startLocal([champ], [{ name: c.name, species: c.species, level: c.level }], { kind: 'campaign', stageIdx: +ds.i });
      },
      toggleTeam(ds) {
        let t = teamDragons().map(d => d.id);
        if (t.includes(ds.id)) { if (t.length <= 1) return AA.toast('El equipo necesita al menos un dragón'); t = t.filter(x => x !== ds.id); }
        else { if (t.length >= 3) return AA.toast('Máximo 3 dragones por asalto'); t.push(ds.id); }
        B.team = t;
        AA.renderScreen();
      },
      raid(ds) {
        const r = S.raid.targets.find(x => x.id === ds.id);
        startLocal(teamDragons(), r.team.map(t => Object.assign({}, t, { name: t.name + ' · ' + r.name.replace('Aldea de ', '') })), { kind: 'raid', raidId: r.id });
      },
      reroll() {
        if (!AA.spend({ gold: 50 })) return;
        S.raid.targets = [0, 1, 2].map(genRaid);
        AA.commit();
      },
      online: () => B.searchOnline(AA.dragonById(B.selected)),
      reconnect: () => B.joinOnline(S.pvp.activeMatch),
      login: () => AA.go('perfil'),
    });
  }

  function championPicker() {
    const S = AA.state;
    if (!AA.dragonById(B.selected)) B.selected = S.dragons.slice().sort((a, b) => b.level - a.level)[0].id;
    return `<section class="card"><h2>Tu campeón</h2>
      <div class="dragon-row">${S.dragons.map(d => `<button class="dchip ${d.id === B.selected ? 'on' : ''}" data-act="pick" data-id="${d.id}">${AA.dragonSVG(d.species, d.level)}<span>${esc(d.name)} · Nv ${d.level}</span></button>`).join('')}</div></section>`;
  }

  function campaignBody() {
    const S = AA.state;
    return `<div class="list">${AA.CAMPAIGN.map((c, i) => {
      const done = i < S.campaign, locked = i > S.campaign;
      return `<div class="list-row stage ${locked ? 'locked' : ''}">
        <div class="stage-art">${AA.dragonSVG(c.species, c.level)}</div>
        <div class="grow"><b>${i + 1}. ${c.name}</b><br><small>${AA.SPECIES[c.species].name} · Nv ${c.level} · ${AA.elBadges(AA.SPECIES[c.species].elements)}</small><br>
        <small>Premio: ${AA.rewardLabel({ gold: 40 * (i + 1) })}${done ? '' : ' + 2 💎 la primera vez'}</small></div>
        ${locked ? '<span>🔒</span>' : `<button class="btn ${done ? '' : 'btn-primary'} sm" data-act="fight" data-i="${i}">${done ? '↻ Repetir' : '¡Luchar!'}</button>`}
      </div>`;
    }).join('')}</div>`;
  }

  function raidsBody() {
    const S = AA.state;
    ensureRaids();
    const team = teamDragons().map(d => d.id);
    return `<section class="card"><h2>Equipo de asalto <small class="muted">${team.length}/3</small></h2>
        <p class="muted small">Tus dragones luchan uno tras otro: cuando uno cae, entra el siguiente. Gana quien deje sin dragones al rival.</p>
        <div class="dragon-row">${S.dragons.map(d => `<button class="dchip ${team.includes(d.id) ? 'on' : ''}" data-act="toggleTeam" data-id="${d.id}">${AA.dragonSVG(d.species, d.level)}<span>${esc(d.name)} · Nv ${d.level}</span></button>`).join('')}</div>
      </section>
      <div class="raid-grid">${S.raid.targets.map(r => {
        const D = DIFF[r.diff];
        return `<div class="raid-card">
          <div class="raid-head">${AA.avatarSVG(r.avatar, { head: true, cls: 'raid-av' })}<div><b>${esc(r.name)}</b><br><small>${D.icon} ${D.name}</small></div></div>
          <div class="raid-team">${r.team.map(t => `<div class="raid-dr">${AA.dragonSVG(t.species, t.level, { flip: true })}<small>${AA.SPECIES[t.species].name} · Nv ${t.level}</small></div>`).join('')}</div>
          <p class="small">Botín: ${AA.rewardLabel(r.loot)}</p>
          <button class="btn btn-primary" data-act="raid" data-id="${r.id}">⚔️ Asaltar</button>
        </div>`;
      }).join('')}</div>
      <p class="center"><button class="btn sm" data-act="reroll">🔄 Buscar otras aldeas (🪙 50)</button> <span class="muted small">Asaltos ganados: ${S.raid.wins}</span></p>`;
  }

  function onlineSection() {
    const S = AA.state, C = AA.cloud;
    let body;
    if (!C.enabled) {
      body = '<p class="muted">El combate online contra otras personas necesita activar Firebase (lo explica el README). Mientras tanto, entrena en la campaña y los asaltos.</p>';
    } else if (!C.user) {
      body = '<p>Inicia sesión con Google para luchar online.</p><button class="btn" data-act="login">Ir a Perfil</button>';
    } else if (S.pvp.activeMatch) {
      body = '<p>Tienes un combate online sin terminar.</p><button class="btn btn-primary" data-act="reconnect">🔌 Reconectar</button>';
    } else {
      body = '<button class="btn btn-primary" data-act="online">🌍 Buscar rival online</button>';
    }
    return `<section class="card online-card"><h2>🌍 Duelo online</h2>
      <p>Puntuación: <b>${Math.round(S.pvp.rating)}</b> · ${S.pvp.wins} victorias · ${S.pvp.losses} derrotas</p>${body}</section>`;
  }

  function teamPips(team, idx) {
    if (!team || team.length < 2) return '';
    return `<div class="pips-team">${team.map((t, i) => `<span class="tp ${t.hp <= 0 ? 'ko' : ''} ${i === idx ? 'cur' : ''}" title="${esc(t.name)}">${AA.dragonSVG(t.species, t.level)}</span>`).join('')}</div>`;
  }

  function fighterBox(f, side, team, idx) {
    const pct = Math.max(0, f.hp / f.maxhp * 100);
    return `<div class="fighter ${side}" id="f-${side}">
      <div class="f-info"><b>${esc(f.name)}</b> <small>Nv ${f.level}</small> ${f.els.map(e => AA.ELEMENTS[e].icon).join('')}
        <div class="hp"><i style="width:${pct}%" class="${pct < 30 ? 'low' : ''}"></i></div><small>${f.hp}/${f.maxhp} PV</small>${teamPips(team, idx)}</div>
      <div class="f-art">${AA.dragonSVG(f.species, f.level, { flip: side === 'foe' })}</div>
    </div>`;
  }

  function renderFight(root) {
    const f = B.fight;
    const myTurn = f.turn === 'me' && !f.over && !f.busy;
    let extra = '';
    if (f.mode === 'online' && !f.over) {
      const inactive = Date.now() - (f.updated || Date.now()) > 60000;
      extra = `<p class="muted small center">${f.turn === 'me' ? 'Tu turno' : 'Turno del rival…'}${f.oppAway ? ' · ⚠️ El rival se ha desconectado' : ''}</p>` +
        (f.turn === 'foe' && (inactive || f.oppAway) ? '<button class="btn btn-gold sm" data-act="claim">🏆 Reclamar victoria (rival inactivo)</button>' : '');
    }
    root.innerHTML = `
      <div class="battle-field bf-${f.kind || 'online'}">${fighterBox(f.foe, 'foe', f.foeTeam, f.fi)}${fighterBox(f.me, 'me', f.meTeam, f.mi)}</div>
      <div class="battle-log">${(f.log.slice(-2).map(esc).join('<br>')) || '¡Comienza el combate!'}</div>
      ${extra}
      <div class="moves">${AA.abilitiesFor(f.me.species, f.me.level).map(a => {
        if (a.locked) return `<button class="move neutral" disabled><b>🔒 ${a.name}</b><small>Se aprende a nivel ${a.unlock}</small></button>`;
        const cd = f.me.cds[a.id] || 0;
        const eff = a.element ? AA.elementMult(a.element, f.foe.els) : 1;
        return `<button class="move ${a.element ? 'el-' + a.element : 'neutral'}" data-act="move" data-id="${a.id}" ${myTurn && !cd ? '' : 'disabled'}>
          <b>${a.element ? AA.ELEMENTS[a.element].icon : a.heal ? '💚' : '🐾'} ${a.name}</b>
          <small>${a.heal ? 'Cura 25%' : 'Poder ' + a.power}${eff > 1 ? ' · ¡eficaz!' : eff < 1 ? ' · poco eficaz' : ''}${cd ? ` · espera ${cd}` : ''}</small></button>`;
      }).join('')}</div>
      <div class="center"><button class="btn sm btn-danger" data-act="flee">${f.mode === 'online' ? '🏳️ Rendirse' : '🏃 Retirarse'}</button></div>`;
    AA.bind(root, {
      move(ds) {
        const ab = f.me.abil.find(a => a.id === ds.id);
        if (f.mode === 'online') B.onlineMove(ab);
        else playerMove(ab);
      },
      flee() {
        if (f.mode === 'online') return AA.confirm('Rendirse', 'Perderás puntuación.', 'Rendirse', () => B.onlineEnd('surrender'));
        B.fight = null;
        AA.renderScreen();
      },
      claim: () => B.onlineEnd('claim'),
    });
  }

  function animate(side, res) {
    const target = document.getElementById('f-' + (res.heal ? side : side === 'me' ? 'foe' : 'me'));
    const attacker = document.getElementById('f-' + side);
    if (attacker) attacker.classList.add('attacking');
    if (!target) return;
    if (!res.heal) target.classList.add('hit');
    const n = document.createElement('div');
    n.className = 'float-num' + (res.heal ? ' heal' : '') + (res.crit ? ' crit' : '');
    n.textContent = res.heal ? '+' + res.heal : '-' + res.dmg;
    target.appendChild(n);
  }

  // ---------- Combate local (campaña y asaltos) ----------
  function startLocal(myDragons, enemies, meta) {
    const meTeam = myDragons.map(AA.makeFighter);
    const foeTeam = enemies.map(AA.makeFighter);
    B.fight = Object.assign({ mode: 'local', meTeam, foeTeam, mi: 0, fi: 0, me: meTeam[0], foe: foeTeam[0], log: [], over: false, busy: false }, meta);
    const f = B.fight;
    f.turn = f.me.spd >= f.foe.spd ? 'me' : 'foe';
    AA.renderScreen();
    if (f.turn === 'foe') setTimeout(foeMove, 900);
  }

  // Devuelve true si el bando que recibe el golpe se queda sin dragones.
  function step(side, ab) {
    const f = B.fight;
    const att = side === 'me' ? f.me : f.foe, def = side === 'me' ? f.foe : f.me;
    const res = AA.resolveMove(att, def, ab);
    f.log.push(res.text);
    f.turn = side === 'me' ? 'foe' : 'me';
    f.busy = true;
    AA.renderScreen();
    animate(side, res);
    if (def.hp > 0) return false;
    if (side === 'me' && f.fi + 1 < f.foeTeam.length) {
      f.fi++; f.foe = f.foeTeam[f.fi];
      f.log.push(`¡${def.name} cae! Entra ${f.foe.name}.`);
      return false;
    }
    if (side === 'foe' && f.mi + 1 < f.meTeam.length) {
      f.mi++; f.me = f.meTeam[f.mi];
      f.log.push(`¡${def.name} cae! Sale ${f.me.name}.`);
      return false;
    }
    return true;
  }

  function playerMove(ab) {
    const f = B.fight;
    if (!f || f.turn !== 'me' || f.busy || f.over) return;
    const ko = step('me', ab);
    setTimeout(() => {
      if (B.fight !== f) return;
      f.busy = false;
      if (ko) return endLocal(true);
      foeMove();
    }, 900);
  }

  function foeMove() {
    const f = B.fight;
    if (!f || f.over) return;
    const ko = step('foe', aiChoose(f.foe, f.me));
    setTimeout(() => {
      if (B.fight !== f) return;
      f.busy = false;
      if (ko) return endLocal(false);
      AA.renderScreen();
    }, 900);
  }

  function endLocal(won) {
    const f = B.fight;
    f.over = true;
    const S = AA.state;
    let html;
    const used = f.meTeam.map(t => AA.dragonById(t.dragonId)).filter(Boolean);
    if (f.kind === 'raid') {
      const r = S.raid.targets.find(x => x.id === f.raidId);
      if (won && r) {
        const reward = Object.assign({}, r.loot);
        AA.gain(reward);
        AA.addXP(20 + r.diff * 10);
        used.forEach(d => AA.dragonProgress(d, 1));
        S.raid.wins++;
        S.raid.targets = S.raid.targets.map(x => (x.id === r.id ? genRaid(r.diff) : x));
        html = `<div class="center"><div class="big-emoji">🏰</div><h2>¡${esc(r.name)} conquistada!</h2><p>Botín: ${AA.rewardLabel(reward)}</p>
          <p class="muted">Tus dragones ganan experiencia.</p><button class="btn btn-primary" data-close>Continuar</button></div>`;
      } else {
        html = '<div class="center"><div class="big-emoji">💫</div><h2>Asalto fallido</h2><p>La aldea rival ha resistido. Sube de nivel a tus dragones o aprovecha la tabla de elementos.</p><button class="btn btn-primary" data-close>Volver</button></div>';
      }
    } else {
      const i = f.stageIdx;
      if (won) {
        const reward = { gold: 40 * (i + 1) };
        if (i === S.campaign) { reward.gems = 2; S.campaign++; }
        AA.gain(reward);
        AA.addXP(10 + 5 * i);
        used.forEach(d => AA.dragonProgress(d, 1));
        html = `<div class="center"><div class="big-emoji">🏆</div><h2>¡Victoria!</h2><p>${AA.rewardLabel(reward)}</p>
          <p class="muted">Tu dragón gana experiencia (como una comida).</p><button class="btn btn-primary" data-close>Continuar</button></div>`;
      } else {
        AA.gain({ gold: 10 });
        html = '<div class="center"><div class="big-emoji">💫</div><h2>Derrota</h2><p>+10 🪙 de consuelo. Alimenta a tu dragón para hacerlo más fuerte o aprovecha la ventaja de elementos.</p><button class="btn btn-primary" data-close>Volver</button></div>';
      }
    }
    AA.save();
    AA.modal(html, { onClose: () => { B.fight = null; AA.emit('change'); } });
  }

  // ---------- Combate online (Firebase Realtime Database) ----------
  B.searchOnline = function (dragon) {
    const S = AA.state, C = AA.cloud;
    const me = { uid: C.user.uid, name: S.name, rating: Math.round(S.pvp.rating), dragon: { species: dragon.species, level: dragon.level, name: dragon.name } };
    AA.modal('<div class="center"><div class="big-emoji spin">🌍</div><h2>Buscando rival…</h2><p class="muted">Esperando a otro cuidador conectado.</p><button class="btn" data-act="cancel">Cancelar</button></div>', { locked: true });
    AA.bind(AA._modal, { cancel() { C.cancelSearch(); AA.closeModal(); } });
    C.findMatch(me).then(id => { AA.closeModal(); B.joinOnline(id); }).catch(e => {
      if (e && e.message === 'cancel') return;
      console.error(e);
      AA.closeModal();
      AA.toast('No se pudo buscar rival. Revisa la conexión.');
    });
  };

  B.joinOnline = function (matchId) {
    const C = AA.cloud;
    if (!C.user || !matchId) return;
    AA.state.pvp.activeMatch = matchId;
    AA.save();
    B.online = C.watchMatch(matchId, m => {
      if (!m) { B.leaveOnline(); AA.state.pvp.activeMatch = null; AA.commit(); return AA.toast('El combate ya no existe'); }
      const side = m.p1.uid === C.user.uid ? 'p1' : 'p2', other = side === 'p1' ? 'p2' : 'p1';
      const prev = B.fight && B.fight.mode === 'online' ? B.fight : null;
      const build = (p, s) => {
        const f = AA.makeFighter(m[p].dragon);
        f.name = m[p].dragon.name + ' · ' + m[p].name;
        f.hp = m.hp[p];
        f.cds = (m.cds && m.cds[p]) || {};
        return f;
      };
      B.fight = {
        mode: 'online', matchId, side, other, me: build(side), foe: build(other),
        turn: m.turn === side ? 'me' : 'foe', log: m.log || [], over: !!m.winner,
        updated: m.updated, oppAway: m.presence && m.presence[other] === false, oppRating: m[other].rating,
      };
      AA.renderScreen();
      if (m.last && (!prev || prev.log.length !== B.fight.log.length || m.last.at !== (prev.lastAt || 0))) {
        animate(m.last.by === side ? 'me' : 'foe', m.last);
      }
      B.fight.lastAt = m.last ? m.last.at : 0;
      if (m.winner) finishOnline(m.winner === side, m.reason);
    });
    if (!B.onlineTimer) B.onlineTimer = setInterval(() => { if (B.fight && B.fight.mode === 'online' && AA.current === 'lucha') AA.renderScreen(); }, 5000);
  };

  B.onlineMove = function (ab) {
    const f = B.fight;
    if (!f || f.turn !== 'me' || f.over) return;
    f.turn = 'foe';
    AA.cloud.matchMove(f.matchId, f.side, ab).catch(e => { console.error(e); AA.toast('No se pudo enviar el movimiento'); });
  };

  B.onlineEnd = function (kind) {
    const f = B.fight;
    if (!f) return;
    AA.cloud.matchEnd(f.matchId, kind === 'surrender' ? f.other : f.side, kind === 'surrender' ? 'rendición' : 'abandono', kind === 'claim' ? f.other : null);
  };

  function finishOnline(won, reason) {
    const S = AA.state, f = B.fight;
    if (S.pvp.activeMatch !== f.matchId) return;
    const exp = 1 / (1 + Math.pow(10, ((f.oppRating || 1000) - S.pvp.rating) / 400));
    const delta = Math.round(32 * ((won ? 1 : 0) - exp));
    S.pvp.rating = Math.max(0, S.pvp.rating + delta);
    if (won) { S.pvp.wins++; AA.gain({ gold: 120 }); AA.addXP(20); } else S.pvp.losses++;
    S.pvp.activeMatch = null;
    AA.save();
    B.leaveOnline(true);
    const why = reason && reason !== 'ko' ? ` (${reason})` : '';
    AA.modal(`<div class="center"><div class="big-emoji">${won ? '🏆' : '💫'}</div><h2>${won ? '¡Victoria online!' : 'Derrota'}${why}</h2>
      <p>Puntuación ${delta >= 0 ? '+' : ''}${delta} → <b>${Math.round(S.pvp.rating)}</b></p>${won ? '<p>+120 🪙</p>' : ''}
      <button class="btn btn-primary" data-close>Continuar</button></div>`, { onClose: () => { B.fight = null; AA.emit('change'); } });
  }

  B.leaveOnline = function (keepFight) {
    if (B.online) { B.online(); B.online = null; }
    if (!keepFight) B.fight = null;
  };

  AA.screens.lucha = {
    label: 'Batallas', icon: '⚔️', render,
    busy: () => !!(B.fight && B.fight.mode === 'local'),
    leave() {
      if (B.fight && B.fight.mode === 'local') B.fight = null;
      if (B.fight && B.fight.mode === 'online') B.leaveOnline();
    },
  };
})(window.AA);
