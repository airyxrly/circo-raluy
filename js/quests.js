// Guía del cuidador: misiones encadenadas que enseñan el juego paso a paso.
// Se muestra en una barra fija con el objetivo actual, un botón para ir y la recompensa.
(function (AA) {
  const go = (screen, params) => () => AA.go(screen, params);

  AA.QUESTS = [
    { title: 'Crea a tu cuidador', desc: 'Elige su aspecto y nombre en Perfil.', check: S => S.onboarded, go: go('perfil'), reward: { gold: 50 } },
    { title: 'Eclosiona tu primer huevo', desc: 'En el Criadero, pulsa «Eclosionar» cuando el huevo esté listo.', check: S => S.stats.hatched >= 1, go: go('criadero'), reward: { gold: 100 } },
    { title: 'Construye una Laguna', desc: 'Los dragones de agua necesitan un hábitat de agua. Cómprala en el Mercado.', check: S => S.habitats.some(h => h.type === 'agua'), go: () => AA.openShop('habitats'), reward: { gold: 150 } },
    { title: 'Planta un cultivo', desc: 'Toca una parcela de la granja y elige qué plantar.', check: S => S.flags.planted, go: () => { AA.go('aldea'); setTimeout(() => AA.openBuilding('granja'), 100); }, reward: { food: 40 } },
    { title: 'Alimenta a un dragón', desc: 'Toca un dragón y pulsa «Alimentar». Con 4 comidas sube de nivel.', check: S => S.flags.fed, go: go('aldea'), reward: { gold: 100 } },
    { title: 'Recolecta oro', desc: 'Toca la moneda que aparece sobre un hábitat o pulsa «Recolectar».', check: S => S.flags.collected, go: go('aldea'), reward: { gems: 2 } },
    { title: 'Gana tu primer combate', desc: 'En Batallas › Campaña, vence al Granjero novato.', check: S => S.campaign >= 1, go: go('lucha', { tab: 'campana' }), reward: { gold: 200 } },
    { title: 'Alcanza el nivel 2', desc: 'Casi todo da experiencia: cuidar, construir, luchar…', check: S => S.level >= 2, go: go('aldea'), reward: { gold: 150 } },
    { title: 'Supera el nivel 1 de Saltos', desc: 'Minijuegos › Saltos del dragón. Llega a la bandera.', check: S => S.platform.cleared >= 1, go: go('saltos'), reward: { gems: 2 } },
    { title: 'Decora tu aldea', desc: 'Compra una decoración: cada una da +1% de oro.', check: S => (S.decor || []).length >= 1, go: () => AA.openShop('decoracion'), reward: { gems: 3 } },
    { title: 'Alcanza el nivel 3', desc: 'Desbloquea el Fuerte de asalto.', check: S => S.level >= 3, go: go('aldea'), reward: { gold: 300 } },
    { title: 'Conquista una aldea rival', desc: 'En el Fuerte de asalto, elige equipo y gana un asalto 3 contra 3.', check: S => S.raid.wins >= 1, go: go('lucha', { tab: 'asaltos' }), reward: { gems: 5 } },
    { title: 'Juega en la Arena', desc: 'Nivel 4: despliega tus cartas y derriba torres como en Clash Royale.', check: S => S.arena.wins + S.arena.losses >= 1, go: go('arena'), reward: { gems: 5 } },
    { title: 'Cría un dragón nuevo', desc: 'En la Montaña de cría, junta dos dragones de nivel 5 o más.', check: S => S.flags.bred, go: go('criadero'), reward: { gems: 10 } },
  ];

  AA.flag = function (k) {
    const S = AA.state;
    S.flags = S.flags || {};
    if (!S.flags[k]) { S.flags[k] = true; AA.save(); }
  };

  let lastHtml = '';
  AA.renderQuestBar = function () {
    const bar = document.getElementById('questbar');
    if (!bar) return;
    const S = AA.state;
    const sc = AA.screens[AA.current];
    const playing = sc && sc.busy && sc.busy() && AA.current !== 'aldea';
    const step = S.quests.step;
    let html = '';
    if (!playing && S.onboarded && step < AA.QUESTS.length && !S.quests.hidden) {
      const q = AA.QUESTS[step];
      const done = q.check(S);
      html = `<div class="qb ${done ? 'done' : ''}">
        <span class="qb-num">${step + 1}/${AA.QUESTS.length}</span>
        <div class="qb-text"><b>${done ? '✅ ' : '🎯 '}${q.title}</b><small>${q.desc}</small></div>
        ${done ? `<button class="btn btn-gold sm" data-q="claim">Recoger ${AA.rewardLabel(q.reward)}</button>` : `<button class="btn btn-primary sm" data-q="go">Ir</button>`}
        <button class="qb-x" data-q="hide" aria-label="Ocultar guía">✕</button>
      </div>`;
    }
    if (html === lastHtml) return;
    lastHtml = html;
    bar.innerHTML = html;
    bar.hidden = !html;
    bar.querySelectorAll('[data-q]').forEach(b => b.addEventListener('click', () => {
      const q = AA.QUESTS[S.quests.step];
      if (b.dataset.q === 'go') q.go();
      if (b.dataset.q === 'hide') { S.quests.hidden = true; AA.save(); AA.toast('Guía oculta. Puedes volver a mostrarla en Perfil.'); }
      if (b.dataset.q === 'claim' && q.check(S)) {
        AA.gain(q.reward);
        S.quests.step++;
        AA.toast(`🎉 Misión completada: ${AA.rewardLabel(q.reward)}`);
        if (S.quests.step >= AA.QUESTS.length) AA.toast('🏆 ¡Has completado la Guía del cuidador!');
        AA.commit();
      }
      AA.renderQuestBar();
    }));
  };
})(window.AA);
