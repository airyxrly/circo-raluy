// Estado de la partida, guardado, economía y utilidades de interfaz.
(function (AA) {
  const KEY = 'airyaldea_save_v1';

  const listeners = {};
  AA.on = (ev, fn) => (listeners[ev] = listeners[ev] || []).push(fn);
  AA.emit = (ev, data) => (listeners[ev] || []).forEach(fn => fn(data));

  AA.RES = {
    gold: { name: 'oro', icon: '🪙' },
    gems: { name: 'gemas', icon: '💎' },
    food: { name: 'comida', icon: '🍖' },
  };

  AA.newState = function () {
    const now = Date.now();
    return {
      version: 1, createdAt: now, updatedAt: 0, ownerUid: null, onboarded: false,
      name: 'Cuidador', level: 1, xp: 0, gold: 300, gems: 10, food: 50,
      avatar: Object.assign({}, AA.DEFAULT_AVATAR),
      habitats: [{ id: 'h1', type: 'fuego', level: 1, gold: 0 }],
      dragons: [{ id: 'd1', species: 'chispa', name: 'Chispa', level: 1, feeds: 0, hunger: 100, clean: 100, habitatId: 'h1', born: now }],
      eggs: [{ id: 'e1', species: 'burbuja', start: now, duration: AA.RARITIES.comun.hatch }],
      incubatorSlots: 2,
      breeding: null,
      plots: [{ crop: null, start: 0 }, { crop: null, start: 0 }],
      dex: ['chispa'],
      campaign: 0,
      pvp: { rating: 1000, wins: 0, losses: 0, activeMatch: null },
      arena: { trophies: 0, wins: 0, losses: 0, deck: [] },
      platform: { cleared: 0, stars: {} },
      raid: { targets: [], wins: 0 },
      layout: {},
      stats: { hatched: 0 },
      lastTick: now, nextId: 100,
    };
  };

  AA.migrate = function (s) {
    const base = AA.newState();
    for (const k in base) if (s[k] === undefined) s[k] = base[k];
    s.avatar = Object.assign({}, AA.DEFAULT_AVATAR, s.avatar);
    ['pvp', 'arena', 'platform', 'stats', 'raid'].forEach(k => (s[k] = Object.assign({}, base[k], s[k])));
    // Quita especies que ya no existan en el catálogo.
    s.dragons = s.dragons.filter(d => AA.SPECIES[d.species]);
    s.eggs = s.eggs.filter(e => AA.SPECIES[e.species]);
    s.dex = s.dex.filter(id => AA.SPECIES[id]);
    if (!s.dragons.length) s.dragons = base.dragons;
    return s;
  };

  AA.load = function () {
    let s = null;
    try { s = JSON.parse(localStorage.getItem(KEY)); } catch (e) { /* partida dañada o sin acceso */ }
    AA.state = s ? AA.migrate(s) : AA.newState();
  };

  // Guardado sin marcar cambios (para el autoguardado del reloj).
  AA.saveQuiet = function () {
    try { localStorage.setItem(KEY, JSON.stringify(AA.state)); } catch (e) { /* sin almacenamiento */ }
  };

  // Guardado tras una acción del jugador: marca la hora y lo sube a la nube.
  AA.save = function () {
    AA.state.updatedAt = Date.now();
    AA.saveQuiet();
    if (AA.cloud) AA.cloud.schedulePush();
  };

  AA.commit = function () {
    AA.save();
    AA.emit('change');
  };

  AA.resetGame = function () {
    const owner = AA.state.ownerUid;
    AA.state = AA.newState();
    AA.state.ownerUid = owner;
    AA.state.onboarded = true;
    AA.commit();
  };

  AA.uid = p => p + (AA.state.nextId++);

  // Avanza el tiempo: hambre, suciedad y oro acumulado (también sin conexión).
  AA.tick = function () {
    const S = AA.state, now = Date.now();
    const dt = Math.max(0, (now - S.lastTick) / 1000);
    S.lastTick = now;
    if (!dt) return;
    S.dragons.forEach(d => {
      if (!d.habitatId) return;
      d.hunger = Math.max(0, d.hunger - dt * 100 / (4 * 3600));
      d.clean = Math.max(0, d.clean - dt * 100 / (3 * 3600));
    });
    S.habitats.forEach(h => {
      const rate = AA.habitatDragons(h.id).reduce((t, d) => t + AA.goldRate(d), 0);
      h.gold = Math.min(AA.habitatGoldCap(h.level), h.gold + rate * dt / 60);
    });
  };

  // ---------- Economía ----------
  AA.canAfford = c => Object.keys(c).every(k => !c[k] || AA.state[k] >= c[k]);

  AA.spend = function (c) {
    for (const k of Object.keys(c)) {
      if (c[k] && AA.state[k] < c[k]) {
        AA.toast(`No tienes suficiente ${AA.RES[k].name}`);
        return false;
      }
    }
    Object.keys(c).forEach(k => (AA.state[k] -= c[k] || 0));
    return true;
  };

  AA.gain = function (r) {
    Object.keys(r).forEach(k => (AA.state[k] += Math.round(r[k] || 0)));
  };

  AA.costLabel = c => Object.keys(c).filter(k => c[k]).map(k => `${AA.RES[k].icon} ${AA.fmt(c[k])}`).join(' ');
  AA.rewardLabel = r => Object.keys(r).filter(k => r[k]).map(k => `+${AA.fmt(r[k])} ${AA.RES[k].icon}`).join('  ');

  AA.addXP = function (n) {
    const S = AA.state;
    S.xp += n;
    let up = false;
    while (S.xp >= AA.xpForLevel(S.level)) {
      S.xp -= AA.xpForLevel(S.level);
      S.level++;
      S.gems += 3;
      up = true;
    }
    if (up) setTimeout(() => AA.levelUpModal(S.level), 400);
  };

  AA.levelUpModal = function (lvl) {
    const news = [];
    Object.keys(AA.SPECIES).forEach(id => AA.SPECIES[id].unlock === lvl && news.push(`🥚 Huevo de ${AA.SPECIES[id].name}`));
    Object.keys(AA.HABITATS).forEach(t => AA.HABITATS[t].unlock === lvl && news.push(`🏠 Hábitat ${AA.HABITATS[t].name}`));
    AA.CROPS.forEach(c => c.unlock === lvl && news.push(`${c.icon} Cultivo: ${c.name}`));
    AA.modal(`<div class="center"><div class="big-emoji">🎉</div><h2>¡Nivel ${lvl}!</h2><p>Has ganado <b>3 💎</b>.</p>
      ${news.length ? `<p>Desbloqueado:</p><ul class="plain">${news.map(n => `<li>${n}</li>`).join('')}</ul>` : ''}
      <button class="btn btn-primary" data-close>¡Genial!</button></div>`);
  };

  // ---------- Dragones y hábitats ----------
  AA.dragonById = id => AA.state.dragons.find(d => d.id === id);
  AA.habitatById = id => AA.state.habitats.find(h => h.id === id);
  AA.habitatDragons = hid => AA.state.dragons.filter(d => d.habitatId === hid);
  AA.habitatFree = h => AA.habitatCapacity(h.level) - AA.habitatDragons(h.id).length;
  AA.canLiveIn = (d, h) => AA.SPECIES[d.species].elements.includes(h.type);
  AA.findHome = d => AA.state.habitats.find(h => AA.canLiveIn(d, h) && AA.habitatFree(h) > 0);

  AA.addDex = id => { if (!AA.state.dex.includes(id)) AA.state.dex.push(id); };

  // Suma progreso de alimentación; cada FEEDS_PER_LEVEL sube un nivel.
  AA.dragonProgress = function (d, n) {
    if (d.level >= AA.DRAGON_MAX_LEVEL) return false;
    d.feeds += n;
    let up = false;
    while (d.feeds >= AA.FEEDS_PER_LEVEL && d.level < AA.DRAGON_MAX_LEVEL) {
      d.feeds -= AA.FEEDS_PER_LEVEL;
      const before = AA.abilitiesFor(d.species, d.level).filter(a => !a.locked).length;
      d.level++;
      up = true;
      const after = AA.abilitiesFor(d.species, d.level).filter(a => !a.locked);
      if (after.length > before) AA.toast(`✨ ${d.name} aprendió ${after[after.length - 1].name}`);
    }
    if (d.level >= AA.DRAGON_MAX_LEVEL) d.feeds = 0;
    if (up) AA.toast(`⬆️ ¡${d.name} sube a nivel ${d.level}!`);
    return up;
  };

  AA.newDragon = function (species) {
    const d = { id: AA.uid('d'), species, name: AA.SPECIES[species].name, level: 1, feeds: 0, hunger: 100, clean: 100, habitatId: null, born: Date.now() };
    const home = AA.findHome(d);
    if (home) d.habitatId = home.id;
    AA.state.dragons.push(d);
    AA.addDex(species);
    return d;
  };

  // ---------- Utilidades de interfaz ----------
  AA.esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  AA.fmt = n => (n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : n >= 1e4 ? (n / 1e3).toFixed(1) + 'k' : String(Math.floor(n)));
  AA.fmtTime = function (sec) {
    sec = Math.max(0, Math.ceil(sec));
    const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    if (h) return `${h}h ${String(m).padStart(2, '0')}m`;
    if (m) return `${m}m ${String(s).padStart(2, '0')}s`;
    return `${s}s`;
  };

  AA.toast = function (msg) {
    const box = document.getElementById('toasts');
    if (!box) return;
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    box.appendChild(t);
    setTimeout(() => t.classList.add('out'), 2400);
    setTimeout(() => t.remove(), 2900);
  };

  AA.modal = function (html, opts) {
    opts = opts || {};
    AA.closeModal();
    const back = document.createElement('div');
    back.className = 'modal-back';
    back.innerHTML = `<div class="modal ${opts.cls || ''}">${opts.locked ? '' : '<button class="modal-x" aria-label="Cerrar">✕</button>'}${html}</div>`;
    back.addEventListener('click', e => {
      if (opts.locked) return;
      if (e.target === back || e.target.closest('.modal-x') || e.target.closest('[data-close]')) AA.closeModal();
    });
    document.body.appendChild(back);
    AA._modal = back;
    AA._modalOnClose = opts.onClose || null;
    return back.querySelector('.modal');
  };

  AA.closeModal = function () {
    if (!AA._modal) return;
    AA._modal.remove();
    AA._modal = null;
    const f = AA._modalOnClose;
    AA._modalOnClose = null;
    if (f) f();
  };

  AA.confirm = function (title, text, okLabel, onOk) {
    const m = AA.modal(`<h2>${title}</h2><p>${text}</p><div class="row end"><button class="btn" data-close>Cancelar</button><button class="btn btn-primary" data-ok>${okLabel}</button></div>`);
    m.querySelector('[data-ok]').onclick = () => { AA.closeModal(); onOk(); };
  };

  // Enlaza los botones con data-act="nombre" a sus manejadores.
  AA.bind = function (root, handlers) {
    root.querySelectorAll('[data-act]').forEach(el => {
      el.addEventListener('click', e => {
        e.stopPropagation();
        const h = handlers[el.dataset.act];
        if (h) h(el.dataset, el, e);
      });
    });
  };

  AA.bar = (label, value, cls) =>
    `<div class="stat-bar ${cls || ''}"><span>${label}</span><div class="bar"><i style="width:${Math.round(value)}%"></i></div><b>${Math.round(value)}%</b></div>`;

  AA.elBadges = els => els.map(e => `<span class="el-badge el-${e}">${AA.ELEMENTS[e].icon} ${AA.ELEMENTS[e].name}</span>`).join(' ');
  AA.rarBadge = r => `<span class="rar rar-${r}">${AA.RARITIES[r].name}</span>`;
})(window.AA);
