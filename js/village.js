// Aldea: hábitats, cuidado de dragones, granja y tienda.
(function (AA) {
  const esc = AA.esc;

  function needIcons(d) {
    let s = '';
    if (d.hunger < 35) s += '<i class="need">🍖</i>';
    if (d.clean < 35) s += '<i class="need">🧽</i>';
    return s;
  }

  function dragonChip(d) {
    return `<button class="dchip" data-act="dragon" data-id="${d.id}">${AA.dragonSVG(d.species, d.level, { shiny: d.shiny })}<span>${esc(d.name)} · Nv ${d.level}</span>${needIcons(d)}</button>`;
  }

  function habitatCard(h) {
    const el = AA.ELEMENTS[h.type], H = AA.HABITATS[h.type];
    const ds = AA.habitatDragons(h.id);
    const free = AA.habitatCapacity(h.level) - ds.length;
    const stars = '★'.repeat(h.level) + '☆'.repeat(AA.HABITAT_MAX_LEVEL - h.level);
    return `<div class="habitat el-${h.type}">
      <div class="hab-head"><span class="hab-name">${el.icon} ${H.name}</span><span class="stars">${stars}</span></div>
      <div class="hab-dragons">${ds.map(dragonChip).join('')}${'<button class="dchip empty" data-act="place" data-id="' + h.id + '">＋</button>'.repeat(Math.max(0, free))}</div>
      <div class="hab-foot">
        <button class="btn btn-gold sm" data-act="collect" data-id="${h.id}">🪙 <b data-hgold="${h.id}">${AA.fmt(h.gold)}</b><small>/${AA.fmt(AA.habitatGoldCap(h.level))}</small></button>
        ${h.level < AA.HABITAT_MAX_LEVEL
          ? `<button class="btn sm" data-act="upgrade" data-id="${h.id}">⬆️ ${AA.costLabel({ gold: AA.habitatUpgradeCost(H.price, h.level) })}</button>`
          : '<span class="muted small">Nivel máximo</span>'}
      </div>
    </div>`;
  }

  function plotCard(p, i) {
    if (!p.crop) return `<button class="plot" data-act="plant" data-i="${i}"><span class="plot-ico">🟫</span><span>Plantar</span></button>`;
    const crop = AA.CROPS.find(c => c.id === p.crop);
    const end = p.start + crop.time * 1000;
    if (Date.now() < end) return `<div class="plot growing"><span class="plot-ico">🌱</span><span>${crop.name}</span><small data-until="${end}">${AA.fmtTime((end - Date.now()) / 1000)}</small></div>`;
    return `<button class="plot ready" data-act="harvest" data-i="${i}"><span class="plot-ico">${crop.icon}</span><span>Cosechar</span><small>+${crop.food} 🍖</small></button>`;
  }

  function render(root) {
    const S = AA.state;
    const nest = S.dragons.filter(d => !d.habitatId);
    const canPlot = S.plots.length < AA.MAX_PLOTS;
    root.innerHTML = `
      <div class="village-head">
        <div class="vh-avatar">${AA.avatarSVG(S.avatar, { head: true })}</div>
        <div class="grow"><h1>Aldea de ${esc(S.name)}</h1>
        <p class="muted small">${S.dragons.length} dragones · ${S.habitats.length} hábitats · ${S.dex.length}/${AA.SPECIES_COUNT} especies descubiertas</p></div>
        <button class="btn btn-primary" data-act="shop" data-tab="huevos">🛒 Mercado</button>
      </div>
      <section class="map-wrap" id="vmap"></section>
      ${nest.length ? `<section class="card warn"><h2>🪺 En el nido (${nest.length})</h2>
        <p>Estos dragones no tienen hábitat y no producen oro. Compra o mejora un hábitat de su elemento.</p>
        <div class="dragon-row">${nest.map(dragonChip).join('')}</div></section>` : ''}
      <details class="card manage" ${AA.map.manageOpen ? 'open' : ''}>
        <summary><h2>📋 Gestión de hábitats</h2></summary>
        <div class="habitat-grid">${S.habitats.map(habitatCard).join('')}
          <button class="habitat add" data-act="shop" data-tab="habitats"><span class="big">＋</span><span>Nuevo hábitat</span></button>
        </div>
      </details>
      <h2 class="sec-title" id="farm">🌾 Granja</h2>
      <p class="muted small">Planta cultivos para conseguir comida y alimentar a tus dragones.</p>
      <div class="farm-grid">${S.plots.map(plotCard).join('')}
        ${canPlot ? `<button class="plot add" data-act="buyPlot"><span class="plot-ico">＋</span><span>Parcela</span><small>${AA.costLabel({ gold: AA.plotPrice(S.plots.length) })}</small></button>` : ''}
      </div>`;
    AA.renderVillageMap(root.querySelector('#vmap'));
    root.querySelector('details.manage').addEventListener('toggle', e => (AA.map.manageOpen = e.target.open));
    AA.bind(root, handlers);
  }

  AA.collectAll = function () {
    let total = 0;
    AA.state.habitats.forEach(h => { total += Math.floor(h.gold); h.gold -= Math.floor(h.gold); });
    if (!total) return AA.toast('Todavía no hay oro para recolectar');
    AA.gain({ gold: total });
    AA.addXP(Math.max(1, Math.floor(total / 50)));
    AA.toast(`+${total} 🪙`);
    AA.commit();
  };

  AA.collectHabitat = function (id) {
    const h = AA.habitatById(id);
    const g = Math.floor(h.gold);
    if (!g) return AA.toast('Todavía no hay oro aquí');
    h.gold -= g;
    AA.gain({ gold: g });
    AA.addXP(Math.max(1, Math.floor(g / 50)));
    AA.toast(`+${g} 🪙`);
    AA.commit();
  };

  // Ventana de un hábitat (al tocarlo en el mapa).
  AA.habitatModal = function (id) {
    const h = AA.habitatById(id);
    if (!h) return;
    const m = AA.modal(`<h2>${AA.ELEMENTS[h.type].icon} ${AA.HABITATS[h.type].name}</h2>${habitatCard(h)}
      <p class="muted small">Capacidad: ${AA.habitatCapacity(h.level)} dragones · Guarda hasta ${AA.fmt(AA.habitatGoldCap(h.level))} 🪙</p>`, { cls: 'wide' });
    AA.bind(m, Object.assign({}, handlers, {
      collect(ds) { AA.collectHabitat(ds.id); AA.habitatModal(id); },
    }));
  };

  AA.plotAction = function (i) {
    const p = AA.state.plots[i];
    if (!p.crop) return handlers.plant({ i });
    const crop = AA.CROPS.find(c => c.id === p.crop);
    const end = p.start + crop.time * 1000;
    if (Date.now() >= end) return handlers.harvest({ i });
    AA.toast(`🌱 ${crop.name}: faltan ${AA.fmtTime((end - Date.now()) / 1000)}`);
  };

  const handlers = {
    shop: ds => AA.openShop(ds.tab || 'huevos'),
    collectAll: () => AA.collectAll(),
    collect: ds => AA.collectHabitat(ds.id),
    upgrade(ds) {
      const h = AA.habitatById(ds.id);
      const cost = AA.habitatUpgradeCost(AA.HABITATS[h.type].price, h.level);
      AA.confirm('Mejorar hábitat', `¿Mejorar ${AA.HABITATS[h.type].name} a nivel ${h.level + 1}? Tendrá sitio para ${AA.habitatCapacity(h.level + 1)} dragones y guardará más oro.`, `Mejorar (${AA.costLabel({ gold: cost })})`, () => {
        if (!AA.spend({ gold: cost })) return;
        h.level++;
        AA.addXP(10);
        settleNest();
        AA.toast('¡Hábitat mejorado!');
        AA.commit();
      });
    },
    dragon: ds => AA.dragonModal(ds.id),
    place(ds) {
      const h = AA.habitatById(ds.id);
      const cands = AA.state.dragons.filter(d => d.habitatId !== h.id && AA.canLiveIn(d, h));
      if (!cands.length) return AA.toast(`No tienes otros dragones de ${AA.ELEMENTS[h.type].name} para este hábitat`);
      const m = AA.modal(`<h2>Llevar un dragón a ${AA.HABITATS[h.type].name}</h2><div class="pick-grid">${cands.map(d =>
        `<button class="dchip" data-act="pick" data-id="${d.id}">${AA.dragonSVG(d.species, d.level, { shiny: d.shiny })}<span>${esc(d.name)} · Nv ${d.level}</span><small>${d.habitatId ? 'Mover' : 'En el nido'}</small></button>`).join('')}</div>`);
      AA.bind(m, {
        pick(p) {
          AA.dragonById(p.id).habitatId = h.id;
          AA.closeModal();
          AA.commit();
        },
      });
    },
    plant(ds) {
      const i = +ds.i;
      const m = AA.modal(`<h2>¿Qué plantamos?</h2><div class="list">${AA.CROPS.map(c => {
        const locked = AA.state.level < c.unlock;
        return `<button class="list-row" data-act="crop" data-id="${c.id}" ${locked ? 'disabled' : ''}>
          <span class="big-emoji sm">${c.icon}</span><span class="grow"><b>${c.name}</b><br><small>${AA.fmtTime(c.time)} → +${c.food} 🍖</small></span>
          <span>${locked ? `🔒 Nv ${c.unlock}` : AA.costLabel({ gold: c.cost })}</span></button>`;
      }).join('')}</div>`);
      AA.bind(m, {
        crop(p) {
          const c = AA.CROPS.find(x => x.id === p.id);
          if (!AA.spend({ gold: c.cost })) return;
          AA.state.plots[i] = { crop: c.id, start: Date.now() };
          AA.closeModal();
          AA.commit();
        },
      });
    },
    harvest(ds) {
      const p = AA.state.plots[+ds.i];
      const c = AA.CROPS.find(x => x.id === p.crop);
      AA.gain({ food: c.food });
      AA.addXP(2);
      AA.state.plots[+ds.i] = { crop: null, start: 0 };
      AA.toast(`+${c.food} 🍖`);
      AA.commit();
    },
    buyPlot() {
      const cost = AA.plotPrice(AA.state.plots.length);
      AA.confirm('Nueva parcela', 'Más parcelas = más comida a la vez.', `Comprar (${AA.costLabel({ gold: cost })})`, () => {
        if (!AA.spend({ gold: cost })) return;
        AA.state.plots.push({ crop: null, start: 0 });
        AA.addXP(5);
        AA.commit();
      });
    },
  };

  // Coloca dragones del nido en hábitats con sitio libre.
  function settleNest() {
    AA.state.dragons.filter(d => !d.habitatId).forEach(d => {
      const h = AA.findHome(d);
      if (h) d.habitatId = h.id;
    });
  }
  AA.settleNest = settleNest;

  // ---------- Ficha del dragón ----------
  AA.dragonModal = function (id) {
    const d = AA.dragonById(id);
    if (!d) return;
    const sp = AA.SPECIES[d.species];
    const st = AA.dragonStats(d.species, d.level);
    const abil = AA.abilitiesFor(d.species, d.level);
    const max = d.level >= AA.DRAGON_MAX_LEVEL;
    const cost = AA.feedCost(d.level);
    const pips = Array.from({ length: AA.FEEDS_PER_LEVEL }, (_, i) => `<i class="${i < d.feeds ? 'on' : ''}"></i>`).join('');
    const home = d.habitatId ? AA.HABITATS[AA.habitatById(d.habitatId).type].name : 'En el nido';
    const m = AA.modal(`
      <div class="dm-top el-${sp.elements[0]}">
        <div class="dm-art">${AA.dragonSVG(d.species, d.level, { shiny: d.shiny })}</div>
        <div>
          <h2>${esc(d.name)}</h2>
          <p>${sp.name} ${AA.rarBadge(sp.rarity)}${d.shiny ? ' <span class="rar rar-mitico">🌈 Iridiscente</span>' : ''}</p>
          <p>${AA.elBadges(sp.elements)}</p>
          <p>Nivel <b>${d.level}</b> · ${AA.STAGES[AA.stageOf(d.level)]} · ${home}</p>
          ${max ? '<p class="muted">Nivel máximo</p>' : `<div class="pips" title="Comidas para subir de nivel">${pips}</div>`}
        </div>
      </div>
      ${AA.bar('Saciedad', d.hunger, 'b-food')}
      ${AA.bar('Limpieza', d.clean, 'b-clean')}
      ${AA.bar('Felicidad', AA.happiness(d), 'b-happy')}
      <div class="stats-grid">
        <div>❤️ <b>${st.hp}</b><small>Vida</small></div><div>⚔️ <b>${st.atk}</b><small>Ataque</small></div>
        <div>🛡️ <b>${st.def}</b><small>Defensa</small></div><div>💨 <b>${st.spd}</b><small>Velocidad</small></div>
        <div>🪙 <b>${AA.goldRate(d).toFixed(1)}</b><small>Oro/min</small></div>
      </div>
      <h3>Habilidades</h3>
      <ul class="abil-list">${abil.map(a => `<li class="${a.locked ? 'locked' : ''}">${a.element ? AA.ELEMENTS[a.element].icon : a.heal ? '💚' : '🐾'} <b>${a.name}</b>
        <small>${a.heal ? 'Cura 25%' : 'Poder ' + a.power}${a.cd ? ' · espera ' + a.cd : ''}${a.locked ? ' · 🔒 Nv ' + a.unlock : ''}</small></li>`).join('')}</ul>
      <div class="row wrap center-row">
        ${max ? '' : `<button class="btn btn-primary" data-act="feed">🍖 Alimentar (${cost})</button>`}
        <button class="btn" data-act="clean">🧽 Limpiar</button>
        <button class="btn" data-act="move">🏠 Mover</button>
        <button class="btn" data-act="rename">✏️ Nombre</button>
        <button class="btn btn-danger" data-act="sell">Vender</button>
      </div>`, { cls: 'wide' });

    AA.bind(m, {
      feed() {
        if (!AA.spend({ food: cost })) return;
        d.hunger = 100;
        AA.dragonProgress(d, 1);
        AA.addXP(2);
        AA.commit();
        AA.dragonModal(id);
      },
      clean() {
        if (d.clean > 90) return AA.toast(`${d.name} ya está limpio`);
        d.clean = 100;
        AA.addXP(1);
        AA.toast('¡Brillante! ✨');
        AA.commit();
        AA.dragonModal(id);
      },
      move() {
        const opts = AA.state.habitats.filter(h => h.id !== d.habitatId && AA.canLiveIn(d, h) && AA.habitatFree(h) > 0);
        if (!opts.length) return AA.toast('No hay otro hábitat compatible con sitio libre');
        const mm = AA.modal(`<h2>Mover a ${esc(d.name)}</h2><div class="list">${opts.map(h =>
          `<button class="list-row" data-act="to" data-id="${h.id}"><span class="grow">${AA.ELEMENTS[h.type].icon} ${AA.HABITATS[h.type].name} ${'★'.repeat(h.level)}</span><span>${AA.habitatFree(h)} libres</span></button>`).join('')}</div>`);
        AA.bind(mm, { to(p) { d.habitatId = p.id; AA.commit(); AA.dragonModal(id); } });
      },
      rename() {
        const mm = AA.modal(`<h2>Nuevo nombre</h2><input class="input" maxlength="16" value="${esc(d.name)}"><div class="row end"><button class="btn" data-close>Cancelar</button><button class="btn btn-primary" data-act="ok">Guardar</button></div>`);
        const inp = mm.querySelector('input');
        inp.focus();
        inp.select();
        AA.bind(mm, { ok() { const v = inp.value.trim(); if (v) d.name = v; AA.commit(); AA.dragonModal(id); } });
      },
      sell() {
        if (AA.state.dragons.length <= 1) return AA.toast('No puedes vender a tu único dragón');
        const value = Math.round(AA.speciesValue(sp) / 4 + d.level * 10);
        AA.confirm('Vender dragón', `¿Seguro que quieres vender a ${esc(d.name)} por ${value} 🪙? No se puede deshacer.`, 'Vender', () => {
          AA.state.dragons = AA.state.dragons.filter(x => x.id !== d.id);
          AA.state.arena.deck = AA.state.arena.deck.filter(x => x !== d.id);
          AA.gain({ gold: value });
          AA.commit();
        });
      },
    });
  };

  AA.screens = AA.screens || {};
  AA.screens.aldea = { label: 'Aldea', icon: '🏡', render };
})(window.AA);
