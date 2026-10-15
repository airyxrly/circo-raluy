// Mapa isométrico de la aldea: se ve la isla con edificios, hábitats y
// parcelas, y se pueden recolocar a mano en modo edición.
(function (AA) {
  const N = 12, TW = 96, TH = 48, OY = 130;
  const OX = (N * TW) / 2 + 20;
  const W = N * TW + 40, H = N * TH + OY + 70;
  const M = AA.map = { edit: false, sel: null, zoom: window.innerWidth < 640 ? 0.6 : 0.8, scrolled: false };

  const DEFAULT_POS = {
    'b:criadero': [5, 0], 'b:tienda': [8, 1], 'b:granja': [1, 4], 'b:saltos': [10, 5],
    'b:fuerte': [1, 9], 'b:arena': [9, 9],
  };

  const top = (c, r) => [(c - r) * TW / 2 + OX, (c + r) * TH / 2 + OY];

  function items() {
    const S = AA.state;
    const list = Object.keys(AA.BUILDINGS).map(id => ({ key: 'b:' + id, kind: 'b', id, size: 2 }));
    S.habitats.forEach(h => list.push({ key: 'h:' + h.id, kind: 'h', id: h.id, size: 2 }));
    S.plots.forEach((p, i) => list.push({ key: 'p:' + i, kind: 'p', id: i, size: 1 }));
    return list;
  }

  function occupied(ignore) {
    const grid = {};
    items().forEach(it => {
      if (it.key === ignore) return;
      const pos = AA.state.layout[it.key];
      if (!pos) return;
      for (let dc = 0; dc < it.size; dc++) for (let dr = 0; dr < it.size; dr++) grid[(pos[0] + dc) + ',' + (pos[1] + dr)] = it.key;
    });
    return grid;
  }

  function fits(c, r, size, ignore, grid) {
    grid = grid || occupied(ignore);
    if (c < 0 || r < 0 || c + size > N || r + size > N) return false;
    for (let dc = 0; dc < size; dc++) for (let dr = 0; dr < size; dr++) if (grid[(c + dc) + ',' + (r + dr)]) return false;
    return true;
  }

  // Da posición a todo lo que aún no la tiene, buscando en espiral desde el centro.
  AA.ensureLayout = function () {
    const S = AA.state;
    S.layout = S.layout || {};
    const valid = new Set(items().map(i => i.key));
    Object.keys(S.layout).forEach(k => { if (!valid.has(k)) delete S.layout[k]; });
    items().forEach(it => {
      if (S.layout[it.key]) return;
      const def = DEFAULT_POS[it.key];
      if (def && fits(def[0], def[1], it.size)) { S.layout[it.key] = def.slice(); return; }
      const start = it.kind === 'p' ? [3, 4] : [5, 5];
      for (let rad = 0; rad < N; rad++) {
        for (let dc = -rad; dc <= rad; dc++) {
          for (let dr = -rad; dr <= rad; dr++) {
            const c = start[0] + dc, r = start[1] + dr;
            if (fits(c, r, it.size)) { S.layout[it.key] = [c, r]; return; }
          }
        }
      }
    });
  };

  function footprint(c, r, s) {
    const t = top(c, r);
    const rt = top(c + s, r);
    const bt = top(c + s, r + s);
    const lt = top(c, r + s);
    return { top: t, right: rt, bottom: bt, left: lt, cx: (t[0] + bt[0]) / 2, cy: (t[1] + bt[1]) / 2 };
  }
  const poly = pts => pts.map(p => p.join(',')).join(' ');

  // ---------- Dioramas de los hábitats ----------
  const HAB_LOOK = {
    fuego: { top: '#4a2e28', side: '#2e1c18' }, agua: { top: '#d9c08f', side: '#9c7a52' },
    planta: { top: '#5fa04e', side: '#3f6f34' }, tierra: { top: '#c9a46a', side: '#8b6a3e' },
    aire: { top: '#e9f6fb', side: '#a9cad6' }, rayo: { top: '#4a4f8a', side: '#2e3160' },
    hielo: { top: '#e3f6ff', side: '#9ccbe0' }, metal: { top: '#7d868e', side: '#4f565c' },
    luz: { top: '#fff1c9', side: '#d4b06a' }, oscuridad: { top: '#3b2a4f', side: '#22172f' },
  };

  function habitatFeature(type, cx, cy) {
    switch (type) {
      case 'fuego':
        return `<path d="M${cx - 34},${cy + 4} L${cx - 6},${cy - 56} L${cx + 10},${cy - 56} L${cx + 36},${cy + 4}Z" fill="#5a3a32" stroke="#2e1c18" stroke-width="2"/>` +
          `<path d="M${cx - 6},${cy - 56} L${cx + 10},${cy - 56} L${cx + 6},${cy - 40} L${cx + 12},${cy - 24} L${cx - 2},${cy - 38}Z" fill="#ff7a1a"/>` +
          `<ellipse cx="${cx + 2}" cy="${cy - 58}" rx="10" ry="4" fill="#ffd23f"/><path d="M${cx - 40},${cy + 18} q20,-6 30,4 q16,8 34,-2" stroke="#ff7a1a" stroke-width="3" fill="none"/>` +
          `<circle cx="${cx + 4}" cy="${cy - 74}" r="7" fill="#7a6a66" opacity=".5"/><circle cx="${cx + 12}" cy="${cy - 86}" r="9" fill="#7a6a66" opacity=".35"/>`;
      case 'agua':
        return `<ellipse cx="${cx}" cy="${cy + 2}" rx="62" ry="28" fill="#2f8fd8"/><ellipse cx="${cx - 6}" cy="${cy - 2}" rx="46" ry="18" fill="#5fb4e8"/>` +
          `<path d="M${cx - 30},${cy} q10,-4 20,0 M${cx + 6},${cy + 8} q10,-4 20,0" stroke="#bfe6ff" stroke-width="2" fill="none"/>` +
          `<ellipse cx="${cx + 30}" cy="${cy - 6}" rx="8" ry="4" fill="#5fa04e"/><circle cx="${cx + 32}" cy="${cy - 8}" r="2.4" fill="#ff8fab"/>` +
          `<path d="M${cx - 56},${cy - 4} l6,-14 l8,10Z" fill="#8a7a66"/>`;
      case 'planta':
        return [[-44, -8], [-16, -22], [26, -16], [46, 2]].map(([dx, dy], i) =>
          `<rect x="${cx + dx - 3}" y="${cy + dy - 6}" width="6" height="18" fill="#6b4226"/><circle cx="${cx + dx}" cy="${cy + dy - 18}" r="${14 + (i % 2) * 4}" fill="${i % 2 ? '#3f8a3a' : '#4fa046'}" stroke="#2e6b22" stroke-width="1.5"/>`).join('');
      case 'tierra':
        return `<path d="M${cx - 50},${cy + 4} L${cx - 44},${cy - 34} L${cx - 30},${cy - 40} L${cx - 24},${cy + 4}Z" fill="#a0703c" stroke="#5e4020" stroke-width="2"/>` +
          `<path d="M${cx + 20},${cy} L${cx + 26},${cy - 50} L${cx + 42},${cy - 54} L${cx + 50},${cy}Z" fill="#8b5a2b" stroke="#5e4020" stroke-width="2"/><path d="M${cx + 30},${cy - 30} l10,-4" stroke="#e8cfa0" stroke-width="2"/>`;
      case 'aire':
        return [[-40, -10, 16], [-20, -18, 20], [6, -12, 18], [34, -4, 14]].map(([dx, dy, r]) => `<circle cx="${cx + dx}" cy="${cy + dy}" r="${r}" fill="#ffffff" stroke="#bcd9e4" stroke-width="1.5"/>`).join('') +
          `<path d="M${cx - 50},${cy - 40} q20,-10 40,0 q14,8 30,0" stroke="#ffffff" stroke-width="3" fill="none" opacity=".8"/>`;
      case 'rayo':
        return `<path d="M${cx + 20},${cy + 6} L${cx + 26},${cy - 70} L${cx + 34},${cy - 70} L${cx + 40},${cy + 6}Z" fill="#3a3d6e" stroke="#1d1f40" stroke-width="2"/>` +
          `<path d="M${cx + 32},${cy - 92} L${cx + 24},${cy - 76} L${cx + 30},${cy - 76} L${cx + 26},${cy - 64} L${cx + 38},${cy - 82} L${cx + 32},${cy - 82} L${cx + 36},${cy - 92}Z" fill="#fff35c" stroke="#b38f00" stroke-width="1"/>`;
      case 'hielo':
        return [[-40, 10, 40], [-24, 0, 56], [22, -6, 48], [40, 6, 30]].map(([dx, dy, hgt]) =>
          `<path d="M${cx + dx - 9},${cy + dy} L${cx + dx},${cy + dy - hgt} L${cx + dx + 9},${cy + dy}Z" fill="#cdf3ff" stroke="#5aa9c9" stroke-width="1.5"/><path d="M${cx + dx},${cy + dy - hgt} L${cx + dx - 2},${cy + dy}" stroke="#ffffff" stroke-width="1.5"/>`).join('');
      case 'metal':
        return `<rect x="${cx + 20}" y="${cy - 60}" width="16" height="62" fill="#5a3820" stroke="#2c1a0e" stroke-width="2"/><circle cx="${cx + 30}" cy="${cy - 72}" r="8" fill="#8a8a8a" opacity=".45"/>` +
          `<path d="M${cx - 44},${cy - 10} h40 l-6,8 h-8 v10 h10 v6 h-32 v-6 h10 v-10 h-8Z" fill="#4f565c" stroke="#23272a" stroke-width="1.5"/><path d="M${cx - 40},${cy - 10} h32" stroke="#c9d1d8" stroke-width="2"/>`;
      case 'luz':
        return `<ellipse cx="${cx}" cy="${cy - 30}" rx="34" ry="40" fill="#fff6c4" opacity=".35"/><path d="M${cx - 12},${cy + 4} L${cx},${cy - 66} L${cx + 12},${cy + 4}Z" fill="#fff6c4" stroke="#d4a017" stroke-width="2"/><path d="M${cx},${cy - 66} L${cx - 4},${cy + 4}" stroke="#ffffff" stroke-width="2"/>`;
      case 'oscuridad':
        return `<path d="M${cx - 34},${cy + 4} V${cy - 30} Q${cx},${cy - 66} ${cx + 34},${cy - 30} V${cy + 4}Z" fill="#2a1d3a" stroke="#120c1a" stroke-width="2"/><path d="M${cx - 14},${cy + 4} V${cy - 18} Q${cx},${cy - 34} ${cx + 14},${cy - 18} V${cy + 4}Z" fill="#7b3fbf" opacity=".85"/>` +
          `<circle cx="${cx + 40}" cy="${cy - 62}" r="10" fill="#e9e3ff"/><circle cx="${cx + 44}" cy="${cy - 64}" r="9" fill="${HAB_LOOK.oscuridad.top}"/>`;
    }
    return '';
  }

  function drawHabitat(h, f) {
    const look = HAB_LOOK[h.type];
    const sh = 0.86;
    const sc = p => [f.cx + (p[0] - f.cx) * sh, f.cy + (p[1] - f.cy) * sh];
    const T = sc(f.top), R = sc(f.right), B = sc(f.bottom), L = sc(f.left);
    const d = 14;
    let s = `<polygon points="${poly([L, B, [B[0], B[1] + d], [L[0], L[1] + d]])}" fill="${AA.shade(look.side, -0.1)}"/>`;
    s += `<polygon points="${poly([B, R, [R[0], R[1] + d], [B[0], B[1] + d]])}" fill="${look.side}"/>`;
    s += `<polygon points="${poly([T, R, B, L])}" fill="${look.top}" stroke="${look.side}" stroke-width="2"/>`;
    s += habitatFeature(h.type, f.cx, f.cy);
    const ds = AA.habitatDragons(h.id);
    const spots = [[-38, 6], [30, 12], [-6, 22], [44, -8]];
    ds.forEach((dr, i) => {
      const [dx, dy] = spots[i % spots.length];
      const w = 74;
      s += `<g class="map-dragon" style="animation-delay:-${(i * 1.3).toFixed(1)}s">${AA.dragonSVG(dr.species, dr.level, { x: f.cx + dx - w / 2, y: f.cy + dy - w * 0.78, w, h: w * 0.875, flip: i % 2 === 1 })}</g>`;
    });
    const g = Math.floor(h.gold);
    if (g >= 10) s += `<g class="coin-bubble" data-collect="${h.id}"><circle cx="${f.cx}" cy="${f.cy - 92}" r="17" fill="#fffaf0" stroke="#c79400" stroke-width="3"/><text x="${f.cx}" y="${f.cy - 86}" text-anchor="middle" font-size="16">🪙</text></g>`;
    s += `<text x="${f.cx}" y="${f.bottom[1] + 10}" text-anchor="middle" class="map-label">${AA.ELEMENTS[h.type].icon} ${AA.HABITATS[h.type].name} ${'★'.repeat(h.level)}</text>`;
    return s;
  }

  function drawBuilding(id, f) {
    const b = AA.BUILDINGS[id];
    const locked = AA.state.level < b.unlock;
    const w = TW * 1.75, hgt = w * 100 / 120;
    let s = `<polygon points="${poly([f.top, f.right, f.bottom, f.left])}" fill="#c9b48a" stroke="#9c8460" stroke-width="2" opacity=".75"/>`;
    s += `<g${locked ? ' class="locked-b"' : ''}>${AA.buildingSVG(b.art).replace('<svg ', `<svg x="${f.cx - w / 2}" y="${f.bottom[1] - hgt - 6}" width="${w}" height="${hgt}" `)}</g>`;
    if (locked) s += `<g><rect x="${f.cx - 34}" y="${f.cy - 60}" width="68" height="24" rx="12" fill="#3b2a1a" opacity=".85"/><text x="${f.cx}" y="${f.cy - 43}" text-anchor="middle" class="map-lock">🔒 Nivel ${b.unlock}</text></g>`;
    s += `<text x="${f.cx}" y="${f.bottom[1] + 10}" text-anchor="middle" class="map-label">${b.name}</text>`;
    return s;
  }

  function drawPlot(i, f) {
    const p = AA.state.plots[i];
    let s = `<polygon points="${poly([f.top, f.right, f.bottom, f.left])}" fill="#8b5a2b" stroke="#5a3820" stroke-width="2"/>`;
    s += `<path d="M${f.left[0] + 16},${f.left[1]} L${f.top[0]},${f.top[1] + 8} M${f.left[0] + 30},${f.left[1] + 6} L${f.top[0] + 14},${f.top[1] + 14} M${f.left[0] + 44},${f.left[1] + 12} L${f.top[0] + 28},${f.top[1] + 20}" stroke="#6b4226" stroke-width="3"/>`;
    if (p.crop) {
      const crop = AA.CROPS.find(c => c.id === p.crop);
      const ready = Date.now() >= p.start + crop.time * 1000;
      s += `<text x="${f.cx}" y="${f.cy + 8}" text-anchor="middle" font-size="${ready ? 30 : 20}">${ready ? crop.icon : '🌱'}</text>`;
      if (ready) s += `<circle cx="${f.cx + 18}" cy="${f.cy - 16}" r="6" fill="#ffe58a" class="sparkle"/>`;
    }
    return s;
  }

  function decorations(grid) {
    let s = '';
    const r = AA.hash('aldea-deco');
    for (let i = 0; i < 36; i++) {
      const c = (r >>> (i % 24)) % N, rr = (i * 7 + (r % 11)) % N;
      if (grid[c + ',' + rr]) continue;
      const t = top(c, rr);
      const x = t[0], y = t[1] + TH / 2;
      if (i % 3 === 0) s += `<g><rect x="${x - 3}" y="${y - 10}" width="6" height="14" fill="#6b4226"/><path d="M${x - 16},${y - 6} L${x},${y - 44} L${x + 16},${y - 6}Z" fill="#2f6b3a" stroke="#1f4a28" stroke-width="1.5"/><path d="M${x - 12},${y - 22} L${x},${y - 52} L${x + 12},${y - 22}Z" fill="#3f8a4a" stroke="#1f4a28" stroke-width="1.5"/></g>`;
      else if (i % 3 === 1) s += `<ellipse cx="${x}" cy="${y}" rx="10" ry="6" fill="#9b8a76" stroke="#5e5040" stroke-width="1.5"/>`;
      else s += `<g fill="#ff8fab"><circle cx="${x - 6}" cy="${y}" r="2.4"/><circle cx="${x + 4}" cy="${y + 3}" r="2.4" fill="#ffd166"/><circle cx="${x + 1}" cy="${y - 4}" r="2.4" fill="#ffffff"/></g>`;
    }
    return s;
  }

  AA.renderVillageMap = function (wrap) {
    AA.ensureLayout();
    const S = AA.state;
    const grid = occupied();
    const selItem = M.sel && items().find(i => i.key === M.sel);
    let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${Math.round(W * M.zoom)}" height="${Math.round(H * M.zoom)}" class="vmap ${M.edit ? 'editing' : ''}">`;
    s += '<defs><linearGradient id="vm-sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5fb4d9"/><stop offset="1" stop-color="#2a6f97"/></linearGradient>' +
      '<linearGradient id="vm-cliff" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8b5a2b"/><stop offset="1" stop-color="#4a2c17"/></linearGradient></defs>';
    s += `<rect width="${W}" height="${H}" fill="url(#vm-sea)"/>`;
    for (let i = 0; i < 26; i++) s += `<path d="M${(i * 173) % W},${(i * 97) % H} q8,-5 16,0 q8,-5 16,0" stroke="#bfe6ff" stroke-width="2" fill="none" opacity=".5"/>`;
    const T = top(0, 0), R = top(N, 0), B = top(N, N), L = top(0, N);
    s += `<polygon points="${poly([L, B, [B[0], B[1] + 40], [L[0], L[1] + 40]])}" fill="url(#vm-cliff)"/>`;
    s += `<polygon points="${poly([B, R, [R[0], R[1] + 40], [B[0], B[1] + 40]])}" fill="#5a3820"/>`;
    s += `<polygon points="${poly([T, R, B, L])}" fill="#78b85a" stroke="#4f7942" stroke-width="4"/>`;
    for (let c = 0; c < N; c++) {
      for (let r = 0; r < N; r++) {
        const t = top(c, r);
        const pts = poly([t, [t[0] + TW / 2, t[1] + TH / 2], [t[0], t[1] + TH], [t[0] - TW / 2, t[1] + TH / 2]]);
        let cls = 'tile';
        if (M.edit && selItem && fits(c, r, selItem.size, selItem.key)) cls += ' free';
        s += `<polygon points="${pts}" class="${cls}" fill="${(c + r) % 2 ? '#7fbf60' : '#74b257'}" data-tile="${c},${r}"/>`;
      }
    }
    s += decorations(grid);
    const sorted = items().map(it => ({ it, pos: S.layout[it.key] })).filter(x => x.pos).sort((a, b) => (a.pos[0] + a.pos[1] + a.it.size) - (b.pos[0] + b.pos[1] + b.it.size));
    sorted.forEach(({ it, pos }) => {
      const f = footprint(pos[0], pos[1], it.size);
      const sel = M.sel === it.key ? ' selected' : '';
      s += `<g class="map-item${sel}" data-key="${it.key}">`;
      if (it.kind === 'h') s += drawHabitat(AA.habitatById(it.id), f);
      else if (it.kind === 'b') s += drawBuilding(it.id, f);
      else s += drawPlot(it.id, f);
      if (sel) s += `<polygon points="${poly([f.top, f.right, f.bottom, f.left])}" fill="none" stroke="#ffe066" stroke-width="4" stroke-dasharray="10 6"/>`;
      s += '</g>';
    });
    s += '</svg>';

    const old = wrap.querySelector('.map-scroll');
    const keep = old ? [old.scrollLeft, old.scrollTop] : null;
    wrap.innerHTML = `<div class="map-tools">
        <button class="btn sm ${M.edit ? 'btn-gold' : ''}" data-m="edit">${M.edit ? '✔ Listo' : '✋ Mover'}</button>
        <button class="btn sm" data-m="zin" aria-label="Acercar">＋</button><button class="btn sm" data-m="zout" aria-label="Alejar">－</button>
        <button class="btn sm btn-gold" data-m="collect">🪙 Recolectar</button>
        <span class="muted small">${M.edit ? (M.sel ? 'Toca una casilla verde para colocarlo' : 'Toca un edificio para moverlo') : 'Toca un edificio o hábitat'}</span>
      </div><div class="map-scroll">${s}</div>`;
    const sc = wrap.querySelector('.map-scroll');
    if (keep) { sc.scrollLeft = keep[0]; sc.scrollTop = keep[1]; }
    else if (!M.scrolled) {
      setTimeout(() => { sc.scrollLeft = (sc.scrollWidth - sc.clientWidth) / 2; sc.scrollTop = (sc.scrollHeight - sc.clientHeight) / 2.4; }, 60);
      M.scrolled = true;
    }
    wrap.querySelectorAll('[data-m]').forEach(b => b.addEventListener('click', () => tool(b.dataset.m, wrap)));
    sc.querySelector('svg').addEventListener('click', e => onClick(e, wrap));
  };

  function tool(t, wrap) {
    if (t === 'edit') { M.edit = !M.edit; M.sel = null; }
    if (t === 'zin') M.zoom = Math.min(1.4, M.zoom + 0.15);
    if (t === 'zout') M.zoom = Math.max(0.45, M.zoom - 0.15);
    if (t === 'collect') return AA.collectAll();
    AA.renderVillageMap(wrap);
  }

  function onClick(e, wrap) {
    const coin = e.target.closest('[data-collect]');
    if (coin && !M.edit) return AA.collectHabitat(coin.dataset.collect);
    const item = e.target.closest('[data-key]');
    const tile = e.target.closest('[data-tile]');
    if (M.edit) {
      if (item && item.dataset.key !== M.sel) { M.sel = item.dataset.key; return AA.renderVillageMap(wrap); }
      if (M.sel && (tile || item)) {
        let c, r;
        if (tile) [c, r] = tile.dataset.tile.split(',').map(Number);
        else return;
        const it = items().find(i => i.key === M.sel);
        if (fits(c, r, it.size, it.key)) {
          AA.state.layout[it.key] = [c, r];
          M.sel = null;
          AA.save();
        } else AA.toast('No cabe ahí');
        return AA.renderVillageMap(wrap);
      }
      return;
    }
    if (!item) return;
    const [kind, id] = item.dataset.key.split(':');
    if (kind === 'h') AA.habitatModal(id);
    else if (kind === 'p') AA.plotAction(+id);
    else {
      const b = AA.BUILDINGS[id];
      if (AA.state.level < b.unlock) return AA.toast(`🔒 ${b.name} se desbloquea a nivel ${b.unlock}`);
      AA.openBuilding(id);
    }
  }

  AA.openBuilding = function (id) {
    if (id === 'criadero') AA.go('criadero');
    else if (id === 'tienda') AA.go('tienda');
    else if (id === 'granja') { const el = document.getElementById('farm'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }
    else if (id === 'saltos') AA.go('saltos');
    else if (id === 'fuerte') AA.go('lucha', { tab: 'asaltos' });
    else if (id === 'arena') AA.go('arena');
  };
})(window.AA);
