// Criadero: incubadoras, eclosión, montaña de cría y dragonario.
(function (AA) {
  const esc = AA.esc;
  const MAX_INCUBATORS = 4;
  const incubatorPrice = n => 15 * (n - 1);
  const speedCost = left => Math.max(1, Math.ceil(left / 120));
  const sel = { a: null, b: null };

  function eggCard(e) {
    const sp = AA.SPECIES[e.species];
    const end = e.start + e.duration * 1000;
    const left = (end - Date.now()) / 1000;
    if (left > 0) {
      return `<div class="incubator"><div class="egg-wrap wobble">${AA.eggSVG(e.species)}</div><b>${sp.name}</b>
        <small>⏱️ <span data-until="${end}">${AA.fmtTime(left)}</span></small>
        <button class="btn sm" data-act="speed" data-id="${e.id}">⚡ Acelerar ${speedCost(left)} 💎</button></div>`;
    }
    return `<div class="incubator ready"><div class="egg-wrap shake">${AA.eggSVG(e.species, { crack: true })}</div><b>${sp.name}</b>
      <small>¡Está a punto de nacer!</small><button class="btn btn-primary sm" data-act="hatch" data-id="${e.id}">🐣 Eclosionar</button></div>`;
  }

  function breedingSection() {
    const S = AA.state;
    if (S.breeding) {
      const b = S.breeding;
      const end = b.start + b.duration * 1000;
      const ready = Date.now() >= end;
      return `<div class="breed-box">
        <div class="breed-pair">${AA.dragonSVG(b.speciesA, 10)}<span class="heart">❤️</span>${AA.dragonSVG(b.speciesB, 10)}</div>
        ${ready
          ? `<p>¡La cría ha puesto un huevo!</p><button class="btn btn-primary" data-act="collectEgg">🥚 Llevar a la incubadora</button>`
          : `<p>Criando… <b data-until="${end}">${AA.fmtTime((end - Date.now()) / 1000)}</b></p>`}
      </div>`;
    }
    const elig = S.dragons.filter(d => d.level >= AA.BREED_MIN_LEVEL);
    if (elig.length < 2) {
      return `<p class="muted">Necesitas dos dragones de nivel ${AA.BREED_MIN_LEVEL} o más (jóvenes). Aliméntalos o gana combates para que crezcan.</p>`;
    }
    if (!elig.find(d => d.id === sel.a)) sel.a = elig[0].id;
    if (!elig.find(d => d.id === sel.b) || sel.b === sel.a) sel.b = (elig.find(d => d.id !== sel.a) || {}).id;
    const pick = (slot, cur) => `<div class="breed-pick"><b>${slot === 'a' ? 'Padre 1' : 'Padre 2'}</b><div class="dragon-row">${elig.map(d =>
      `<button class="dchip ${d.id === cur ? 'on' : ''}" data-act="sel" data-slot="${slot}" data-id="${d.id}" ${(slot === 'a' ? sel.b : sel.a) === d.id ? 'disabled' : ''}>${AA.dragonSVG(d.species, d.level, { shiny: d.shiny })}<span>${esc(d.name)} · Nv ${d.level}</span></button>`).join('')}</div></div>`;
    const A = AA.dragonById(sel.a), B = AA.dragonById(sel.b);
    const odds = AA.breedOptions(A.species, B.species, S.level).sort((x, y) => y.chance - x.chance);
    return `${pick('a', sel.a)}${pick('b', sel.b)}
      <p><b>Posibles crías:</b></p>
      <div class="odds">${odds.map(o => `<span class="odd">${AA.SPECIES[o.species].name} <b>${Math.round(o.chance * 100)}%</b></span>`).join('')}</div>
      <button class="btn btn-primary" data-act="breed">❤️ Criar (${AA.costLabel({ gold: AA.BREED_COST })})</button>`;
  }

  function render(root) {
    const S = AA.state;
    const slots = [];
    for (let i = 0; i < S.incubatorSlots; i++) {
      slots.push(S.eggs[i] ? eggCard(S.eggs[i]) : '<button class="incubator empty" data-act="shop"><span class="big">＋</span><small>Comprar huevo</small></button>');
    }
    if (S.incubatorSlots < MAX_INCUBATORS) {
      slots.push(`<button class="incubator empty" data-act="buyInc"><span class="big">🔥</span><small>Nueva incubadora</small><small>${incubatorPrice(S.incubatorSlots)} 💎</small></button>`);
    }
    root.innerHTML = `
      <div class="cover">${AA.coverSVG('criadero', 'Criadero', 'Incuba huevos y cría nuevas especies')}</div>
      <h2 class="sec-title">Incubadoras</h2>
      <div class="incubator-grid">${slots.join('')}</div>
      <h2 class="sec-title">Montaña de cría</h2>
      <section class="card">${breedingSection()}</section>
      <h2 class="sec-title">Dragonario <small class="muted">${S.dex.length}/${AA.SPECIES_COUNT}</small></h2>
      <div class="chips">${Object.keys(AA.RARITIES).map(r => `<button class="chip ${dexRarity === r ? 'on' : ''}" data-act="dexr" data-id="${r}">${AA.RARITIES[r].name}</button>`).join('')}</div>
      <div class="dex-grid">${Object.keys(AA.SPECIES).filter(id => AA.SPECIES[id].rarity === dexRarity).map(id => {
        const sp = AA.SPECIES[id];
        const has = S.dex.includes(id);
        return `<div class="dex-item rar-b-${sp.rarity} ${has ? '' : 'unknown'}">${AA.dragonSVG(id, 12, { silhouette: !has })}<b>${has ? sp.name : '???'}</b>
          <small>${AA.elBadges(sp.elements)}</small><small>${has ? AA.RARITIES[sp.rarity].name : sp.price ? 'Nivel ' + sp.unlock : 'Solo criando'}</small></div>`;
      }).join('')}</div>`;
    AA.bind(root, handlers);
  }

  let dexRarity = 'comun';

  const handlers = {
    dexr(ds) { dexRarity = ds.id; AA.renderScreen(); },
    shop: () => AA.openShop('huevos'),
    buyInc() {
      const cost = incubatorPrice(AA.state.incubatorSlots);
      AA.confirm('Nueva incubadora', 'Podrás incubar un huevo más a la vez.', `Comprar (${cost} 💎)`, () => {
        if (!AA.spend({ gems: cost })) return;
        AA.state.incubatorSlots++;
        AA.commit();
      });
    },
    speed(ds) {
      const e = AA.state.eggs.find(x => x.id === ds.id);
      const left = (e.start + e.duration * 1000 - Date.now()) / 1000;
      const cost = speedCost(left);
      AA.confirm('Acelerar incubación', `Quedan ${AA.fmtTime(left)}. ¿Terminar ya por ${cost} 💎?`, `Acelerar (${cost} 💎)`, () => {
        if (!AA.spend({ gems: cost })) return;
        e.duration = 0;
        e.start = Date.now() - 1000;
        AA.commit();
      });
    },
    hatch: ds => hatch(ds.id),
    sel(ds) {
      sel[ds.slot] = ds.id;
      AA.renderScreen();
    },
    breed() {
      const S = AA.state;
      const A = AA.dragonById(sel.a), B = AA.dragonById(sel.b);
      if (!A || !B || A.id === B.id) return;
      if (!AA.spend({ gold: AA.BREED_COST })) return;
      const odds = AA.breedOptions(A.species, B.species, S.level);
      let r = Math.random(), result = odds[odds.length - 1].species;
      for (const o of odds) { if ((r -= o.chance) <= 0) { result = o.species; break; } }
      AA.flag('bred');
      S.breeding = { speciesA: A.species, speciesB: B.species, result, start: Date.now(), duration: AA.RARITIES[AA.SPECIES[result].rarity].hatch * 2 };
      AA.addXP(8);
      AA.commit();
    },
    collectEgg() {
      const S = AA.state;
      if (S.eggs.length >= S.incubatorSlots) return AA.toast('Libera una incubadora primero');
      const sp = AA.SPECIES[S.breeding.result];
      S.eggs.push({ id: AA.uid('e'), species: S.breeding.result, start: Date.now(), duration: AA.RARITIES[sp.rarity].hatch });
      S.breeding = null;
      AA.toast(`🥚 ¡Es un huevo de ${sp.name}!`);
      AA.commit();
    },
  };

  function hatch(eggId) {
    const S = AA.state;
    const e = S.eggs.find(x => x.id === eggId);
    if (!e) return;
    S.eggs = S.eggs.filter(x => x.id !== eggId);
    const isNew = !S.dex.includes(e.species);
    const d = AA.newDragon(e.species);
    S.stats.hatched++;
    AA.addXP(isNew ? 25 : 10);
    AA.commit();

    const sp = AA.SPECIES[e.species];
    const m = AA.modal(`<div class="center hatch-box"><div class="hatch-stage">${AA.eggSVG(e.species, { crack: true, cls: 'egg-svg shake-hard' })}</div><h2>¡Algo se mueve!</h2></div>`, { locked: true });
    setTimeout(() => {
      const home = d.habitatId ? `Vivirá en: <b>${AA.HABITATS[AA.habitatById(d.habitatId).type].name}</b>` : `<span class="warn-text">No hay hábitat de ${AA.ELEMENTS[sp.elements[0]].name} con sitio: se queda en el nido.</span>`;
      m.innerHTML = `<div class="center hatch-box"><div class="hatch-stage pop">${AA.dragonSVG(d.species, 1, { shiny: d.shiny })}</div>
        <h2>¡Ha nacido ${sp.name}!</h2>${d.shiny ? '<p class="new-tag shiny-tag">🌈 ¡Variante iridiscente! (3%)</p>' : ''}${isNew ? '<p class="new-tag">✨ ¡Nueva especie en tu dragonario!</p>' : ''}
        <p>${AA.rarBadge(sp.rarity)} ${AA.elBadges(sp.elements)}</p><p>${home}</p>
        <label class="lbl">Ponle nombre</label><input class="input" maxlength="16" value="${esc(d.name)}">
        <button class="btn btn-primary" data-act="ok">¡Bienvenido!</button></div>`;
      const inp = m.querySelector('input');
      AA.bind(m, {
        ok() {
          const v = inp.value.trim();
          if (v) d.name = v;
          AA.closeModal();
          AA.commit();
        },
      });
    }, 1600);
  }

  AA.screens.criadero = { label: 'Criadero', icon: '🥚', render };
})(window.AA);
