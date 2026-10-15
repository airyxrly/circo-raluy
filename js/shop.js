// Mercado: huevos, hábitats, cambio de recursos y packs de dinero real
// (desactivados hasta integrar un proveedor de pagos).
(function (AA) {
  const T = { tab: 'huevos', el: 'todos', onlyAvail: false };

  const EXCHANGE = [
    { give: { gems: 10 }, get: { gold: 1000 } },
    { give: { gems: 50 }, get: { gold: 6000 } },
    { give: { gems: 200 }, get: { gold: 30000 } },
    { give: { gold: 100 }, get: { food: 120 } },
    { give: { gold: 1000 }, get: { food: 1400 } },
  ];

  // Precios orientativos; no se cobra nada mientras los pagos estén desactivados.
  const PACKS = [
    { name: 'Puñado de gemas', get: { gems: 80 }, price: '0,99 €' },
    { name: 'Bolsa de gemas', get: { gems: 500 }, price: '4,99 €', tag: 'Popular' },
    { name: 'Cofre de gemas', get: { gems: 1200 }, price: '9,99 €' },
    { name: 'Tesoro del Jarl', get: { gems: 2600 }, price: '19,99 €', tag: 'Mejor valor' },
    { name: 'Saco de oro', get: { gold: 25000 }, price: '1,99 €' },
    { name: 'Pack de inicio', get: { gems: 300, gold: 20000, food: 5000 }, price: '2,99 €', tag: 'Una vez' },
  ];

  AA.openShop = function (tab) {
    if (tab) T.tab = tab;
    AA.go('tienda');
  };

  function eggsTab() {
    const S = AA.state;
    const freeInc = S.incubatorSlots - S.eggs.length;
    let ids = Object.keys(AA.SPECIES);
    if (T.el !== 'todos') ids = ids.filter(id => AA.SPECIES[id].elements.includes(T.el));
    if (T.onlyAvail) ids = ids.filter(id => AA.SPECIES[id].unlock <= S.level && AA.SPECIES[id].price);
    const chips = ['todos'].concat(Object.keys(AA.ELEMENTS)).map(e =>
      `<button class="chip ${T.el === e ? 'on' : ''}" data-act="el" data-id="${e}">${e === 'todos' ? 'Todos' : AA.ELEMENTS[e].icon + ' ' + AA.ELEMENTS[e].name}</button>`).join('');
    return `<p class="muted small">Incubadoras libres: <b>${freeInc}</b> de ${S.incubatorSlots}. El huevo empieza a incubarse al comprarlo. Hay ${AA.SPECIES_COUNT} especies: las demás se desbloquean subiendo de nivel o criando.</p>
      <div class="chips">${chips}</div>
      <label class="check"><input type="checkbox" data-act="avail" ${T.onlyAvail ? 'checked' : ''}> Solo las que puedo comprar</label>
      <div class="shop-grid">${ids.map(id => {
        const sp = AA.SPECIES[id];
        const locked = S.level < sp.unlock;
        const known = S.dex.includes(id);
        let btn;
        if (!sp.price) btn = '<button class="btn sm" disabled>Solo criando</button>';
        else if (locked) btn = `<button class="btn sm" disabled>🔒 Nivel ${sp.unlock}</button>`;
        else btn = `<button class="btn btn-primary sm" data-act="egg" data-id="${id}">${AA.costLabel(sp.price)}</button>`;
        return `<div class="shop-item rar-b-${sp.rarity} ${locked ? 'locked' : ''}">
          ${AA.eggSVG(id)}<b>${known || !locked ? sp.name : '???'}</b>${AA.rarBadge(sp.rarity)}<div>${AA.elBadges(sp.elements)}</div>
          <small>⏱️ ${AA.fmtTime(AA.RARITIES[sp.rarity].hatch)} · 🪙 ${sp.gold}/min</small>${btn}</div>`;
      }).join('')}</div>`;
  }

  function habitatsTab() {
    const S = AA.state;
    return '<div class="shop-grid">' + Object.keys(AA.HABITATS).map(t => {
      const H = AA.HABITATS[t];
      const locked = S.level < H.unlock;
      const price = AA.habitatPrice(t);
      return `<div class="shop-item hab-item el-${t} ${locked ? 'locked' : ''}">
        <div class="big-emoji">${AA.ELEMENTS[t].icon}</div><b>${H.name}</b><small>Para dragones de ${AA.ELEMENTS[t].name}</small>
        <small>${AA.habitatCapacity(1)} plazas · guarda ${AA.habitatGoldCap(1)} 🪙</small>
        ${locked ? `<button class="btn sm" disabled>🔒 Nivel ${H.unlock}</button>` : `<button class="btn btn-primary sm" data-act="hab" data-id="${t}">${AA.costLabel({ gold: price })}</button>`}
      </div>`;
    }).join('') + '</div>';
  }

  function decorTab() {
    const S = AA.state;
    return `<p class="muted small">Decora tu aldea: cada decoración da <b>+1% de oro</b> a todos tus hábitats (máximo +20%; ahora +${Math.round((AA.decorBonus() - 1) * 100)}%). Aparecen en el mapa y puedes moverlas con ✋ Mover.</p>
      <div class="shop-grid">${Object.keys(AA.DECORATIONS).map(k => {
        const D = AA.DECORATIONS[k];
        const locked = S.level < D.unlock;
        const owned = (S.decor || []).filter(x => x.type === k).length;
        return `<div class="shop-item ${locked ? 'locked' : ''}">${AA.decorSVG(k)}<b>${D.name}</b><small>${owned ? 'Tienes ' + owned : '&nbsp;'}</small>
          ${locked ? `<button class="btn sm" disabled>🔒 Nivel ${D.unlock}</button>` : `<button class="btn btn-primary sm" data-act="decor" data-id="${k}">${AA.costLabel(D.price)}</button>`}</div>`;
      }).join('')}</div>`;
  }

  function marketTab() {
    return `<p class="muted small">Cambia recursos que te sobran por los que necesitas.</p><div class="list">${EXCHANGE.map((x, i) =>
      `<div class="list-row"><span class="grow"><b>${AA.costLabel(x.give)}</b> → <b>${AA.rewardLabel(x.get)}</b></span><button class="btn btn-primary sm" data-act="swap" data-i="${i}">Cambiar</button></div>`).join('')}</div>`;
  }

  function premiumTab() {
    return `<div class="notice">
        <b>💳 Los pagos con dinero real no están activados en esta versión.</b>
        <p>Para activarlos hay que integrar un proveedor de pagos oficial (Google Play Billing, App Store o Stripe), validar las compras en el servidor y publicar unas condiciones de compra con datos reales del titular. Hasta entonces, las gemas se ganan jugando: subiendo de nivel, venciendo en la campaña, en la arena y en los saltos.</p>
        <p class="small">Lee las <a href="#" data-act="legal" data-id="compras">condiciones de compra, cancelaciones y reembolsos</a>.</p>
      </div>
      <div class="pack-grid">${PACKS.map(p => `<div class="pack">${p.tag ? `<span class="pack-tag">${p.tag}</span>` : ''}
        <div class="pack-ico">${p.get.gems ? '💎' : '🪙'}</div><b>${p.name}</b><span>${AA.rewardLabel(p.get)}</span>
        <button class="btn sm" disabled title="Pagos no activados">${p.price}</button></div>`).join('')}</div>`;
  }

  function render(root) {
    const tabs = [['huevos', '🥚 Huevos'], ['habitats', '🏠 Hábitats'], ['decoracion', '🏮 Decoración'], ['mercado', '⚖️ Cambio'], ['premium', '💎 Gemas y oro']];
    const body = { huevos: eggsTab, habitats: habitatsTab, decoracion: decorTab, mercado: marketTab, premium: premiumTab }[T.tab]();
    root.innerHTML = `<div class="cover">${AA.coverSVG('tienda', 'Mercado', 'Huevos, hábitats y tesoros')}</div>
      <div class="tabs">${tabs.map(([k, l]) => `<button class="tab ${k === T.tab ? 'on' : ''}" data-act="tab" data-id="${k}">${l}</button>`).join('')}</div>${body}`;
    const S = AA.state;
    AA.bind(root, {
      tab(p) { T.tab = p.id; AA.renderScreen(); },
      el(p) { T.el = p.id; AA.renderScreen(); },
      avail(p, el) { T.onlyAvail = el.checked; AA.renderScreen(); },
      legal(p, el, e) { e.preventDefault(); AA.go('legal', { page: p.id }); },
      egg(p) {
        if (S.eggs.length >= S.incubatorSlots) return AA.toast('Tus incubadoras están llenas. Eclosiona un huevo o compra otra incubadora en el Criadero.');
        const sp = AA.SPECIES[p.id];
        if (!AA.spend(sp.price)) return;
        S.eggs.push({ id: AA.uid('e'), species: p.id, start: Date.now(), duration: AA.RARITIES[sp.rarity].hatch });
        AA.addXP(5);
        AA.toast(`🥚 Huevo de ${sp.name} en la incubadora`);
        AA.commit();
      },
      hab(p) {
        const price = AA.habitatPrice(p.id);
        if (!AA.spend({ gold: price })) return;
        S.habitats.push({ id: AA.uid('h'), type: p.id, level: 1, gold: 0 });
        AA.settleNest();
        AA.ensureLayout();
        AA.addXP(15);
        AA.toast(`🏠 ¡${AA.HABITATS[p.id].name} construido! Ya está en tu aldea.`);
        AA.commit();
      },
      decor(p) {
        const D = AA.DECORATIONS[p.id];
        if (!AA.spend(D.price)) return;
        S.decor = S.decor || [];
        S.decor.push({ id: AA.uid('x'), type: p.id });
        AA.ensureLayout();
        AA.addXP(4);
        AA.toast(`🏮 ${D.name} colocada en tu aldea`);
        AA.commit();
      },
      swap(p) {
        const x = EXCHANGE[+p.i];
        if (!AA.spend(x.give)) return;
        AA.gain(x.get);
        AA.toast(AA.rewardLabel(x.get));
        AA.commit();
      },
    });
  }

  AA.screens.tienda = { label: 'Mercado', icon: '🛒', render };
})(window.AA);
