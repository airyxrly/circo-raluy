// Arte vectorial generado por código: dragones, huevos, cuidadores, logo,
// portadas y edificios de la aldea.
(function (AA) {
  let uidCounter = 0;
  const nextId = p => p + (++uidCounter);

  AA.shade = function (hex, p) {
    const n = parseInt(hex.slice(1), 16);
    let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    const t = p < 0 ? 0 : 255, a = Math.abs(p);
    r = Math.round((t - r) * a + r);
    g = Math.round((t - g) * a + g);
    b = Math.round((t - b) * a + b);
    return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
  };
  const shade = AA.shade;

  const GLOW = { fuego: '#ffd23f', agua: '#7df9ff', planta: '#c6ff7a', tierra: '#ffb347', aire: '#f2fdff', rayo: '#fff35c', hielo: '#c9f6ff', metal: '#e6edf2', luz: '#fff2a8', oscuridad: '#d08cff' };
  AA.GLOW = GLOW;

  const lin = (id, stops, x2, y2) => `<linearGradient id="${id}" x1="0" y1="0" x2="${x2 === undefined ? 0 : x2}" y2="${y2 === undefined ? 1 : y2}">${stops.map(([o, c, op]) => `<stop offset="${o}" stop-color="${c}"${op !== undefined ? ` stop-opacity="${op}"` : ''}/>`).join('')}</linearGradient>`;
  const rad = (id, stops, cx, cy, r) => `<radialGradient id="${id}" cx="${cx || '50%'}" cy="${cy || '50%'}" r="${r || '50%'}">${stops.map(([o, c, op]) => `<stop offset="${o}" stop-color="${c}"${op !== undefined ? ` stop-opacity="${op}"` : ''}/>`).join('')}</radialGradient>`;
  const glowFilter = (id, dev) => `<filter id="${id}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${dev || 1.6}" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`;

  // ---------- Dragones ----------
  // Punta de la cola (dibujada alrededor de 0,0 apuntando hacia arriba).
  function tailTip(el, id, c2) {
    switch (el) {
      case 'fuego':
        return `<g filter="url(#${id}g)"><path d="M0,2 C-8,-6 -6,-16 1,-24 C1,-16 6,-14 8,-19 C13,-9 9,-1 0,2Z" fill="url(#${id}fl)"/><path d="M0,0 C-3,-5 -2,-10 1,-13 C2,-9 4,-8 5,-10 C6,-5 4,-1 0,0Z" fill="#fff4b0"/></g>`;
      case 'agua':
        return `<path d="M0,2 C-10,-4 -12,-16 -5,-24 C-1,-15 6,-13 12,-15 C9,-5 5,-1 0,2Z" fill="${c2}" opacity=".85" stroke="${shade(c2, -0.35)}" stroke-width=".8"/><path d="M0,0 L-4,-18 M0,0 L3,-14 M0,0 L8,-12" stroke="${shade(c2, -0.3)}" stroke-width=".6"/>`;
      case 'planta':
        return '<path d="M0,2 C-12,-6 -9,-20 2,-26 C10,-16 9,-6 0,2Z" fill="#5fbf3f" stroke="#2e6b22" stroke-width=".9"/><path d="M0,1 Q-1,-12 2,-23 M0,-8 l-4,-3 M1,-14 l4,-3" stroke="#2e6b22" stroke-width=".7" fill="none"/>';
      case 'tierra':
        return '<path d="M-1,2 L-7,-9 L-2,-21 L3,-9Z" fill="#e3a04b" stroke="#8a5a20" stroke-width=".8"/><path d="M1,2 L6,-14 L10,-4Z" fill="#c98432" stroke="#8a5a20" stroke-width=".8"/><path d="M-2,-19 L-1,-10" stroke="#fff3c4" stroke-width=".8"/>';
      case 'aire':
        return '<g fill="#ffffff" stroke="#9cc3d2" stroke-width=".7"><path d="M0,2 C-8,-6 -10,-14 -8,-22 C-4,-14 -2,-8 0,2Z"/><path d="M0,2 C-2,-8 0,-18 4,-25 C5,-15 3,-7 0,2Z"/><path d="M0,2 C4,-6 9,-12 13,-16 C10,-8 6,-3 0,2Z"/></g>';
      case 'rayo':
        return `<g filter="url(#${id}g)"><path d="M3,-25 L-6,-10 L0,-10 L-4,3 L8,-14 L2,-14 L7,-25Z" fill="#ffe14d" stroke="#b38f00" stroke-width=".8"/></g>`;
      case 'hielo':
        return `<g filter="url(#${id}g)"><path d="M0,2 L-6,-10 L-2,-26 L2,-10Z" fill="#e6fbff" stroke="#5aa9c9" stroke-width=".8"/><path d="M1,2 L8,-14 L10,-3Z" fill="#c4efff" stroke="#5aa9c9" stroke-width=".8"/><path d="M-1,2 L-10,-8 L-8,0Z" fill="#c4efff" stroke="#5aa9c9" stroke-width=".8"/></g>`;
      case 'metal':
        return '<path d="M0,3 L-8,-10 L0,-28 L8,-10Z" fill="#cfd6dc" stroke="#3f474e" stroke-width="1"/><path d="M0,-26 L0,1" stroke="#ffffff" stroke-width="1" opacity=".7"/><path d="M-8,-10 L8,-10" stroke="#3f474e" stroke-width=".8"/>';
      case 'luz':
        return `<g filter="url(#${id}g)"><path d="M0,-26 L3,-16 L13,-14 L5,-8 L8,2 L0,-4 L-8,2 L-5,-8 L-13,-14 L-3,-16Z" fill="#fff6c4" stroke="#d4a017" stroke-width=".8"/></g>`;
      case 'oscuridad':
        return `<g filter="url(#${id}g)"><path d="M0,2 C-8,-6 -6,-16 1,-24 C1,-16 6,-14 8,-19 C13,-9 9,-1 0,2Z" fill="#7b3fbf"/><path d="M0,0 C-3,-5 -2,-10 1,-13 C2,-9 4,-8 5,-10 C6,-5 4,-1 0,0Z" fill="#e3b8ff"/></g>`;
    }
    return '';
  }

  // Cuernos según el aspecto de la especie (coordenadas de la cabeza adulta).
  function horns(style, h, dk, id, gold) {
    const fill = gold ? '#f2c94c' : `url(#${id}h)`;
    switch (style) {
      case 1:
        return `<g transform="translate(110,28) scale(${0.6 + 0.5 * h}) translate(-110,-28)"><path d="M112,29 C104,16 88,20 90,32 C92,42 106,40 104,32 C103,27 97,28 98,33" stroke="${dk}" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M112,29 C104,16 88,20 90,32 C92,42 106,40 104,32 C103,27 97,28 98,33" stroke="${gold ? '#f2c94c' : '#e3d3b0'}" stroke-width="4" fill="none" stroke-linecap="round"/></g>`;
      case 2:
        return `<path d="M118,28 L${120 - 20 * h},${8 - 14 * h} L123,26Z" fill="${fill}" stroke="${dk}" stroke-width=".9"/><path d="M111,31 L${110 - 30 * h},${16 - 12 * h} L116,28Z" fill="${fill}" stroke="${dk}" stroke-width=".9"/>`;
      case 3: {
        let s = '';
        [[108, 32], [114, 27], [120, 24], [127, 24], [133, 26]].forEach(([x, y], i) => {
          const len = (6 + 6 * h) * (i === 2 ? 1.4 : 1);
          s += `<path d="M${x - 2.5},${y + 1} L${x - 3 - len * 0.4},${y - len} L${x + 2.5},${y}Z" fill="${fill}" stroke="${dk}" stroke-width=".7"/>`;
        });
        return s;
      }
    }
    return `<path d="M111,30 Q${108 - 8 * h},${22 - 8 * h} ${118 - 22 * h},${25 - 21 * h} Q${114 - 6 * h},${22 - 3 * h} 120,26Z" fill="${shade('#b39a6e', -0.15)}" stroke="${dk}" stroke-width=".8"/>` +
      `<path d="M108,32 Q${104 - 8 * h},${24 - 6 * h} ${112 - 26 * h},${28 - 19 * h} Q${108 - 8 * h},${26 - 2 * h} 116,29Z" fill="${fill}" stroke="${dk}" stroke-width=".9"/>`;
  }

  // Detalles de cabeza (coordenadas de la cabeza adulta, unión del cuello en 112,40).
  function headFx(el, c2) {
    switch (el) {
      case 'agua':
        return `<path d="M104,34 Q102,20 110,14 Q110,22 116,22 Q114,16 122,14 Q120,22 126,24 L116,30Z" fill="${c2}" opacity=".85" stroke="${shade(c2, -0.35)}" stroke-width=".7"/>`;
      case 'planta':
        return '<path d="M114,24 C110,18 112,12 118,10 C120,16 118,20 114,24Z" fill="#6fcf4f" stroke="#2e6b22" stroke-width=".6"/><path d="M118,24 C120,18 126,16 130,18 C128,22 124,24 118,24Z" fill="#8ad65f" stroke="#2e6b22" stroke-width=".6"/>';
      case 'tierra':
        return '<path d="M108,30 L112,22 L120,22 L124,28 L116,31Z" fill="#9b8a76" stroke="#5e5040" stroke-width=".8"/><path d="M126,26 L130,21 L136,24 L134,29Z" fill="#8a7a66" stroke="#5e5040" stroke-width=".8"/>';
      case 'aire':
        return '<path d="M150,40 Q160,44 164,54 M148,43 Q154,50 154,58" stroke="#ffffff" stroke-width="1.4" fill="none" opacity=".9" stroke-linecap="round"/>';
      case 'rayo':
        return '<path d="M108,34 L116,30 L114,34 L124,30" stroke="#fff35c" stroke-width="1.6" fill="none" stroke-linejoin="round"/>';
      case 'fuego':
        return '<circle cx="154" cy="34" r="1.6" fill="#ff9a3c" opacity=".8"/><circle cx="158" cy="30" r="1.1" fill="#ffd23f" opacity=".7"/><circle cx="161" cy="26" r=".8" fill="#ffd23f" opacity=".5"/>';
      case 'hielo':
        return '<path d="M106,32 L104,22 L110,29 L111,18 L115,27 L118,17 L120,26" fill="#e6fbff" stroke="#5aa9c9" stroke-width=".8" stroke-linejoin="round"/>';
      case 'metal':
        return '<path d="M106,31 Q116,20 134,24 L130,28 Q116,26 110,34Z" fill="#b8c0c8" stroke="#3f474e" stroke-width=".9"/><circle cx="116" cy="26" r=".9" fill="#3f474e"/><circle cx="124" cy="24.6" r=".9" fill="#3f474e"/>';
      case 'luz':
        return '<ellipse cx="116" cy="12" rx="13" ry="3.6" fill="none" stroke="#ffe680" stroke-width="2" opacity=".95"/>';
      case 'oscuridad':
        return '<path d="M119,36 q5,4 12,1 M121,39 q4,3 9,1" stroke="#d08cff" stroke-width="1.1" fill="none" opacity=".9"/>';
    }
    return '';
  }

  // Efectos de ambiente sobre el cuerpo.
  function bodyFx(el, id, c2) {
    switch (el) {
      case 'fuego':
        return `<g fill="#ffb347" filter="url(#${id}g)"><circle cx="24" cy="58" r="1.4"/><circle cx="36" cy="44" r="1"/><circle cx="140" cy="70" r="1.2"/><circle cx="130" cy="88" r=".9"/><circle cx="16" cy="88" r="1"/></g>`;
      case 'agua':
        return '<g fill="none" stroke="#bff3ff" stroke-width=".9"><circle cx="26" cy="56" r="2.4"/><circle cx="34" cy="46" r="1.4"/><circle cx="140" cy="76" r="2"/><circle cx="146" cy="66" r="1.2"/></g>';
      case 'planta':
        return '<path d="M60,112 C66,106 72,110 76,104 C80,100 86,104 90,100" stroke="#2e7d32" stroke-width="1.6" fill="none"/><path d="M68,108 c-3,-4 0,-7 3,-6 c0,3 -1,5 -3,6Z M84,102 c-3,-4 0,-7 3,-6 c0,3 -1,5 -3,6Z" fill="#6fcf4f"/>';
      case 'tierra':
        return '<g fill="#8f8170" stroke="#5e5040" stroke-width=".8"><path d="M58,68 L64,58 L72,62 L70,70Z"/><path d="M72,64 L80,54 L88,60 L84,68Z"/></g>';
      case 'aire':
        return '<g stroke="#ffffff" stroke-width="1.2" fill="none" opacity=".85" stroke-linecap="round"><path d="M6,40 Q20,34 34,40 Q42,44 50,40"/><path d="M118,96 Q132,92 146,98"/><path d="M10,60 Q18,56 26,60"/></g>';
      case 'rayo':
        return `<g stroke="#fff35c" stroke-width="1.3" fill="none" filter="url(#${id}g)" stroke-linejoin="round"><path d="M14,40 L20,34 L18,42 L26,36"/><path d="M136,84 L142,78 L141,86 L148,80"/></g>`;
      case 'hielo':
        return '<g stroke="#e6fbff" stroke-width="1" opacity=".9"><path d="M22,50 l6,0 M25,47 l0,6 M23,48 l4,4 M27,48 l-4,4"/><path d="M140,72 l5,0 M142.5,69.5 l0,5"/></g>';
      case 'metal':
        return '<g fill="#aeb6be" stroke="#3f474e" stroke-width=".8"><path d="M60,70 L70,64 L76,72 L66,78Z"/><path d="M76,66 L86,62 L90,70 L80,74Z"/></g><g fill="#3f474e"><circle cx="66" cy="71" r=".8"/><circle cx="83" cy="67" r=".8"/></g>';
      case 'luz':
        return `<g fill="#fff6c4" filter="url(#${id}g)"><path d="M24,48 l1.2,3 l3,1.2 l-3,1.2 l-1.2,3 l-1.2,-3 l-3,-1.2 l3,-1.2Z"/><path d="M142,70 l1,2.4 l2.4,1 l-2.4,1 l-1,2.4 l-1,-2.4 l-2.4,-1 l2.4,-1Z"/></g>`;
      case 'oscuridad':
        return '<g fill="#7b3fbf" opacity=".35"><ellipse cx="40" cy="120" rx="24" ry="5"/><ellipse cx="110" cy="122" rx="20" ry="4"/></g><g fill="none" stroke="#b77dff" stroke-width="1" opacity=".7"><path d="M14,56 q8,-6 4,-14"/><path d="M146,90 q6,-8 0,-14"/></g>';
    }
    return '';
  }

  // Marcas del cuerpo (rayas o manchas) recortadas a la silueta.
  function bodyMarks(style, id, dk) {
    if (style === 1) return `<g clip-path="url(#${id}bc)" fill="none" stroke="${dk}" stroke-width="3.4" opacity=".32"><path d="M62,62 Q58,88 64,116"/><path d="M74,60 Q70,90 76,118"/><path d="M86,62 Q84,84 90,108"/></g>`;
    if (style === 2) return `<g clip-path="url(#${id}bc)" fill="${dk}" opacity=".28"><circle cx="60" cy="80" r="3.2"/><circle cx="70" cy="74" r="2.2"/><circle cx="66" cy="94" r="2.6"/><circle cx="80" cy="70" r="2"/><circle cx="56" cy="100" r="2"/></g>`;
    return '';
  }

  // Marcas sobre la membrana del ala cercana.
  function wingMarks(el) {
    if (el === 'rayo') return '<path d="M44,24 L36,34 L42,36 L30,50" stroke="#fff35c" stroke-width="1.6" fill="none" opacity=".9"/>';
    if (el === 'fuego') return '<path d="M30,40 Q40,36 46,44 Q38,46 30,40Z M36,54 Q44,50 50,56 Q44,58 36,54Z" fill="#ffb347" opacity=".55"/>';
    if (el === 'aire') return '<path d="M14,22 l6,4 M16,46 l6,2 M30,62 l4,-4" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" opacity=".8"/>';
    if (el === 'hielo') return '<path d="M40,22 L30,30 L36,32 L26,42 M44,40 L36,50" stroke="#ffffff" stroke-width="1.2" fill="none" opacity=".8"/>';
    if (el === 'luz') return '<path d="M48,16 Q34,30 30,58 M48,16 Q30,26 18,40" stroke="#ffe680" stroke-width="1" fill="none" opacity=".8"/>';
    if (el === 'oscuridad') return '<path d="M14,22 L18,28 L16,34 L22,40 L18,46" stroke="#2a1840" stroke-width="2" fill="none" opacity=".6"/><circle cx="36" cy="42" r="3" fill="none" stroke="#d08cff" stroke-width=".9" opacity=".8"/>';
    if (el === 'metal') return '<path d="M48,16 L20,24 M48,16 L22,44" stroke="#ffffff" stroke-width=".8" opacity=".6"/>';
    return '';
  }

  AA.dragonSVG = function (speciesId, level, opts) {
    opts = opts || {};
    const sp = AA.SPECIES[speciesId];
    const c1 = sp.colors[0], c2 = sp.colors[1];
    const els = sp.elements, e1 = els[0], e2 = els[els.length - 1];
    const id = nextId('dr');
    const stage = AA.stageOf(level || 1);
    const P = {
      bebe: { head: 1.34, wing: 0.55, horn: 0.45, nx: 104, ny: 54 },
      joven: { head: 1.12, wing: 0.8, horn: 0.8, nx: 109, ny: 46 },
      adulto: { head: 1, wing: 1, horn: 1, nx: 112, ny: 40 },
    }[stage];
    const dk = shade(c1, -0.5), mid = shade(c1, -0.2), lt = shade(c1, 0.3);
    const glow = GLOW[e2];
    const { nx, ny } = P;
    const h = P.horn;
    const look = sp.look || { horns: 0, marks: 0, bulk: 1, spikes: 1 };
    const sf = [0.8, 1.15, 1.6][look.spikes];
    const rIdx = ['comun', 'raro', 'epico', 'legendario', 'mitico'].indexOf(sp.rarity);
    const body = 'M48,94 C46,76 60,64 80,63 C98,62 110,74 108,92 C106,108 92,116 76,116 C60,116 50,108 48,94Z';

    const box = opts.w ? ` x="${opts.x || 0}" y="${opts.y || 0}" width="${opts.w}" height="${opts.h || opts.w}"` : '';
    const style = opts.silhouette ? ' style="filter:brightness(0) opacity(.28)"' : '';
    let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 140"${box} class="${opts.cls || 'dragon-svg'}"${style}>`;
    s += '<defs>' +
      lin(`${id}b`, [[0, lt], [0.55, c1], [1, dk]]) +
      lin(`${id}be`, [[0, shade(c2, 0.35)], [1, shade(c2, -0.15)]]) +
      lin(`${id}w`, [[0, shade(c2, 0.2), 0.95], [1, shade(c1, -0.05), 0.92]], 1, 1) +
      lin(`${id}fw`, [[0, shade(c2, -0.25)], [1, shade(c1, -0.4)]], 1, 1) +
      lin(`${id}h`, [[0, '#fbf3df'], [1, '#b39a6e']], 1, 0) +
      lin(`${id}fl`, [[0, '#fff1a1'], [0.5, '#ff9a2a'], [1, '#e8401b']]) +
      rad(`${id}e`, [[0, '#ffffff'], [0.35, glow], [1, shade(glow, -0.45)]]) +
      `<pattern id="${id}s" width="7" height="5" patternUnits="userSpaceOnUse"><path d="M0,5 Q3.5,0 7,5" fill="none" stroke="${dk}" stroke-width=".6" opacity=".35"/></pattern>` +
      glowFilter(`${id}g`) +
      `<clipPath id="${id}bc"><path d="${body}"/></clipPath>` +
      `<filter id="${id}bl" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="9"/></filter>` +
      '</defs>';
    s += `<g${opts.flip ? ' transform="translate(160,0) scale(-1,1)"' : ''}>`;
    if (rIdx >= 2) s += `<ellipse cx="80" cy="72" rx="${54 + rIdx * 6}" ry="${44 + rIdx * 5}" fill="${glow}" opacity="${0.12 + rIdx * 0.05}" filter="url(#${id}bl)"/>`;
    if (rIdx === 4) s += `<ellipse cx="80" cy="72" rx="66" ry="56" fill="none" stroke="${glow}" stroke-width="2" opacity=".55" stroke-dasharray="3 5"/>`;
    s += '<ellipse cx="78" cy="128" rx="48" ry="6" fill="rgba(0,0,0,.2)"/>';

    // ala lejana
    s += `<g transform="translate(90,64) scale(${P.wing}) translate(-90,-64)">` +
      `<path d="M90,64 L100,24 L116,8 L146,14 Q136,24 144,34 Q130,36 128,46 Q112,48 100,66Z" fill="url(#${id}fw)" stroke="${dk}" stroke-width="1.2" stroke-linejoin="round"/>` +
      `<path d="M90,64 L100,24 L116,8 M116,8 L144,34 M116,8 L128,46" stroke="${dk}" stroke-width="1.4" fill="none" stroke-linecap="round"/></g>`;

    // cola
    const tail = 'M56,98 C40,102 26,112 16,104 C7,97 13,85 6,74 C16,80 24,90 23,97 C29,103 41,99 54,90Z';
    s += `<path d="${tail}" fill="url(#${id}b)" stroke="${dk}" stroke-width="1.4"/><path d="${tail}" fill="url(#${id}s)"/>`;
    [[44, 99], [33, 104], [23, 100]].forEach(([x, y]) => (s += `<path d="M${x - 3},${y} L${x},${y - 6 * sf} L${x + 3},${y}Z" fill="${shade(c2, -0.1)}" stroke="${dk}" stroke-width=".7"/>`));
    s += `<g transform="translate(7,75) rotate(-35)">${tailTip(e1, id, c2)}</g>`;

    // patas lejanas
    s += `<path d="M64,104 C60,112 61,119 66,124 L74,125 L71,119 C72,112 75,108 75,103Z" fill="${mid}" stroke="${dk}" stroke-width="1.1"/>`;
    s += `<path d="M99,100 C102,108 102,116 99,122 L107,123 L105,117 C108,110 108,104 105,98Z" fill="${mid}" stroke="${dk}" stroke-width="1.1"/>`;

    // cuello
    const neck = `M86,70 Q${nx - 8},${(ny + 70) / 2} ${nx - 4},${ny - 2} L${nx + 9},${ny + 6} Q${nx + 4},${(ny + 86) / 2 + 4} 104,86Z`;
    s += `<path d="${neck}" fill="url(#${id}b)" stroke="${dk}" stroke-width="1.4"/><path d="${neck}" fill="url(#${id}s)"/>`;
    s += `<path d="M${nx + 7},${ny + 8} Q${nx + 2},${(ny + 86) / 2 + 4} 101,85 L95,80 Q${nx - 2},${(ny + 80) / 2} ${nx + 1},${ny + 7}Z" fill="url(#${id}be)"/>`;
    // púas del lomo en el cuello
    [0.2, 0.45, 0.7].forEach(t => {
      const x = (1 - t) * (1 - t) * 86 + 2 * (1 - t) * t * (nx - 8) + t * t * (nx - 4);
      const y = (1 - t) * (1 - t) * 70 + 2 * (1 - t) * t * ((ny + 70) / 2) + t * t * (ny - 2);
      s += `<path d="M${x + 1},${y + 3} L${x - 6 * sf},${y - 3 * sf} L${x + 2},${y - 3}Z" fill="${shade(c2, -0.1)}" stroke="${dk}" stroke-width=".7"/>`;
    });

    // cuerpo
    s += `<g transform="translate(78,92) scale(${look.bulk}) translate(-78,-92)">`;
    s += `<path d="${body}" fill="url(#${id}b)" stroke="${dk}" stroke-width="1.5"/><path d="${body}" fill="url(#${id}s)"/>`;
    s += bodyMarks(look.marks, id, dk);
    s += `<path d="M90,78 C101,85 105,97 99,108 C93,114 81,116 70,114 C83,108 93,96 90,78Z" fill="url(#${id}be)"/>`;
    s += `<path d="M93,88 q6,2 10,0 M92,96 q6,2 10,-1 M88,104 q5,2 9,-1" stroke="${shade(c2, -0.3)}" stroke-width=".8" fill="none"/>`;
    [[62, 66], [72, 63], [82, 63]].forEach(([x, y]) => (s += `<path d="M${x - 4},${y + 2} L${x},${y - 6 * sf} L${x + 4},${y + 2}Z" fill="${shade(c2, -0.1)}" stroke="${dk}" stroke-width=".7"/>`));
    s += '<path d="M56,74 C64,67 76,64 88,65" stroke="#ffffff" stroke-width="1.6" fill="none" opacity=".35" stroke-linecap="round"/>';
    s += '</g>';

    // patas cercanas
    s += `<path d="M54,92 C46,100 48,114 58,120 C56,124 58,126 62,126 L72,126 L68,121 C66,116 66,110 70,104 C72,98 66,90 54,92Z" fill="url(#${id}b)" stroke="${dk}" stroke-width="1.4"/>`;
    s += `<path d="M88,98 C92,106 92,114 88,122 L98,124 L95,118 C99,110 100,102 96,96Z" fill="url(#${id}b)" stroke="${dk}" stroke-width="1.4"/>`;
    s += '<path d="M60,126 l-2.5,2 l4,0Z M65,126 l-1.5,2.4 l3.5,-.4Z M90,123 l-2.5,2 l4,0Z M95,124 l-1.5,2.4 l3.5,-.4Z" fill="#f3ead7"/>';

    // cabeza
    s += `<g transform="translate(${nx},${ny}) scale(${P.head}) translate(-112,-40)">`;
    s += horns(look.horns, h, dk, id, rIdx >= 3);
    s += `<path d="M108,42 L97,47 L105,37Z M110,46 L101,53 L111,44Z" fill="${shade(c2, -0.1)}" stroke="${dk}" stroke-width=".7"/>`;
    const skull = stage === 'bebe'
      ? 'M104,38 C104,25 116,20 128,23 C137,25 144,30 148,36 C150,40 147,44 142,45 L128,48 C116,50 105,47 104,38Z'
      : 'M104,38 C104,26 116,20 128,23 C138,26 146,30 152,36 C154,40 151,44 146,45 L130,48 C118,50 106,48 104,38Z';
    s += `<path d="${skull}" fill="url(#${id}b)" stroke="${dk}" stroke-width="1.4"/>`;
    s += `<path d="M118,46 C126,47 136,46 ${stage === 'bebe' ? 142 : 146},45 L130,48 C124,49 120,48 118,46Z" fill="url(#${id}be)"/>`;
    s += `<path d="M132,45 Q142,45 ${stage === 'bebe' ? 145 : 149},41" stroke="${dk}" stroke-width="1.1" fill="none" stroke-linecap="round"/>`;
    if (stage === 'adulto') s += '<path d="M138,45 l1.4,2.6 l1.4,-2.6Z" fill="#fff"/>';
    s += `<path d="M${stage === 'bebe' ? 143 : 147},35.5 q2,-1 3,1" stroke="${dk}" stroke-width="1" fill="none"/>`;
    s += '<path d="M108,30 C112,24 122,21 130,23" stroke="#ffffff" stroke-width="1.4" fill="none" opacity=".35" stroke-linecap="round"/>';
    if (stage === 'bebe') {
      s += `<ellipse cx="124.5" cy="32" rx="4.6" ry="5.2" fill="url(#${id}e)" stroke="${dk}" stroke-width="1"/><ellipse cx="125.4" cy="32.6" rx="2" ry="3.2" fill="#1b0f08"/><circle cx="123.3" cy="30.2" r="1.5" fill="#fff"/><circle cx="126.6" cy="34.6" r=".7" fill="#fff"/>`;
    } else {
      s += `<path d="M117.5,32.5 Q124,27 131.5,31 Q125,36.2 117.5,32.5Z" fill="url(#${id}e)" stroke="${dk}" stroke-width="1" filter="url(#${id}g)"/><ellipse cx="125.6" cy="31.8" rx="1.1" ry="2.7" fill="#1b0f08"/><circle cx="123.4" cy="30.6" r="1" fill="#fff"/>`;
      s += `<path d="M115.5,29.5 Q124,24 134,28" stroke="${dk}" stroke-width="1.7" fill="none" stroke-linecap="round"/>`;
    }
    s += headFx(e2, c2);
    if (els.length > 1 && e1 !== e2) s += headFx(e1, c2);
    s += '</g>';

    // ala cercana
    s += `<g transform="translate(82,68) scale(${P.wing}) translate(-82,-68)">` +
      `<path d="M82,68 L66,30 L48,16 L14,22 Q26,32 16,46 Q30,50 30,62 Q48,60 64,74Z" fill="url(#${id}w)" stroke="${dk}" stroke-width="1.2" stroke-linejoin="round"/>` +
      wingMarks(e2) +
      `<path d="M48,16 L14,22 M48,16 L16,46 M48,16 L30,62" stroke="${dk}" stroke-width="1.3" fill="none" stroke-linecap="round"/>` +
      `<path d="M82,68 L66,30 L48,16" stroke="${dk}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>` +
      `<path d="M82,68 L66,30 L48,16" stroke="${lt}" stroke-width="1.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>` +
      '<path d="M48,16 l-3,-4 l5,1Z" fill="#f3ead7"/></g>';

    s += bodyFx(e1, id, c2);
    if (e2 !== e1) s += bodyFx(e2, id, c2);
    s += '</g></svg>';
    return s;
  };

  AA.eggSVG = function (speciesId, opts) {
    opts = opts || {};
    const sp = AA.SPECIES[speciesId];
    const myst = opts.mystery || !sp;
    const c1 = myst ? '#9c7c55' : sp.colors[0];
    const c2 = myst ? '#f3e6cf' : sp.colors[1];
    const glow = myst ? '#ffe9a8' : GLOW[sp.elements[sp.elements.length - 1]];
    const id = nextId('egg');
    const egg = 'M60,12 C88,12 98,60 98,78 C98,100 82,112 60,112 C38,112 22,100 22,78 C22,60 32,12 60,12Z';
    let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" class="${opts.cls || 'egg-svg'}">`;
    s += `<defs><clipPath id="${id}c"><path d="${egg}"/></clipPath>` +
      rad(`${id}b`, [[0, shade(c2, 0.4)], [0.55, c2], [1, shade(c1, -0.1)]], '38%', '30%', '80%') +
      `<pattern id="${id}p" width="12" height="9" patternUnits="userSpaceOnUse"><path d="M0,9 Q6,0 12,9" fill="none" stroke="${shade(c1, -0.2)}" stroke-width="1.2" opacity=".45"/></pattern>` +
      glowFilter(`${id}g`, 2.2) + '</defs>';
    s += `<ellipse cx="60" cy="113" rx="30" ry="5" fill="rgba(0,0,0,.2)"/>`;
    s += `<ellipse cx="60" cy="70" rx="46" ry="52" fill="${glow}" opacity=".18"/>`;
    s += `<path d="${egg}" fill="url(#${id}b)"/>`;
    s += `<g clip-path="url(#${id}c)"><rect x="0" y="58" width="120" height="60" fill="url(#${id}p)"/>` +
      `<path d="M10,64 Q60,50 110,64 L110,74 Q60,60 10,74Z" fill="${c1}" opacity=".8"/>` +
      `<path d="M10,92 Q60,80 110,92 L110,98 Q60,86 10,98Z" fill="${c1}" opacity=".55"/>` +
      `<circle cx="44" cy="40" r="5" fill="${c1}" opacity=".6"/><circle cx="74" cy="32" r="3.5" fill="${c1}" opacity=".6"/><circle cx="80" cy="48" r="2.5" fill="${c1}" opacity=".6"/></g>`;
    if (myst) s += '<text x="60" y="84" text-anchor="middle" font-size="30" font-family="Fredoka, sans-serif" font-weight="700" fill="#6b4226" opacity=".8">?</text>';
    else s += `<g filter="url(#${id}g)" opacity=".9"><path d="M60,74 L54,84 L60,94 L66,84Z" fill="none" stroke="${glow}" stroke-width="2"/><circle cx="60" cy="84" r="2" fill="${glow}"/></g>`;
    s += `<path d="${egg}" fill="none" stroke="${shade(c1, -0.45)}" stroke-width="2.6"/>`;
    s += '<path d="M40,26 C34,36 32,48 33,58" stroke="#ffffff" stroke-width="5" fill="none" opacity=".45" stroke-linecap="round"/>';
    if (opts.crack) {
      s += `<path d="M26,62 L38,56 L44,66 L56,54 L64,66 L74,56 L84,64 L94,60" fill="none" stroke="${glow}" stroke-width="4" filter="url(#${id}g)" stroke-linejoin="round"/>`;
      s += '<path d="M26,62 L38,56 L44,66 L56,54 L64,66 L74,56 L84,64 L94,60" fill="none" stroke="#3b2a1a" stroke-width="1.6" stroke-linejoin="round"/>';
    }
    s += '</svg>';
    return s;
  };

  // ---------- Cuidador (estilo anime) ----------
  function hairBack(a, hair, hairD) {
    switch (a.pelo) {
      case 'largo':
        return `<path d="M50,100 Q44,34 100,32 Q156,34 150,100 Q156,140 162,178 Q166,204 152,216 Q144,206 136,218 Q126,208 118,216 L82,216 Q74,208 64,218 Q56,206 48,216 Q34,204 38,178 Q44,140 50,100Z" fill="${hair}"/>` +
          `<path d="M60,140 Q54,176 62,206 M140,140 Q146,176 138,206" stroke="${hairD}" stroke-width="1.6" fill="none" opacity=".5"/>`;
      case 'rizado': {
        let s = '';
        for (let i = 0; i < 9; i++) {
          const y = 80 + i * 11;
          s += `<circle cx="${55 - (i % 2) * 4}" cy="${y}" r="13" fill="${hair}" stroke="${hairD}" stroke-width="1"/><circle cx="${145 + (i % 2) * 4}" cy="${y}" r="13" fill="${hair}" stroke="${hairD}" stroke-width="1"/>`;
        }
        return s;
      }
      case 'mono':
        return `<circle cx="100" cy="46" r="20" fill="${hair}" stroke="${hairD}" stroke-width="1.5"/><path d="M86,42 q14,-10 28,0" stroke="${hairD}" stroke-width="1.5" fill="none"/>`;
      case 'trenzas':
        return `<path d="M56,96 Q52,52 100,46 Q148,52 144,96 L144,130 L56,130Z" fill="${hairD}"/>`;
    }
    return '';
  }

  function hairFront(a, hair, hairD) {
    const strands = `<path d="M82,58 Q74,72 68,92 M100,52 L98,66 M118,58 Q126,72 132,92" stroke="${hairD}" stroke-width="1.4" fill="none" opacity=".55"/>`;
    switch (a.pelo) {
      case 'largo':
        return `<path d="M56,108 Q50,46 100,44 Q150,46 144,108 Q140,84 128,74 Q118,88 104,78 Q96,70 86,84 Q74,80 66,92 Q60,98 56,108Z" fill="${hair}"/>` +
          `<path d="M58,98 Q44,136 52,174 Q58,196 46,212 Q64,206 68,184 Q72,150 67,104Z" fill="${hair}"/><path d="M142,98 Q156,136 148,174 Q142,196 154,212 Q136,206 132,184 Q128,150 133,104Z" fill="${hair}"/>` +
          `<path d="M84,50 Q70,66 64,96 M118,50 Q134,72 138,104 M60,120 Q54,150 58,180 M140,120 Q146,150 142,180" stroke="${hairD}" stroke-width="1.4" fill="none" opacity=".55"/>` +
          '<path d="M74,62 Q100,48 126,62" stroke="#ffffff" stroke-width="3" fill="none" opacity=".22" stroke-linecap="round"/>';
      case 'trenzas': {
        let s = `<path d="M55,114 Q48,44 100,42 Q152,44 145,114 Q142,84 106,80 L100,70 L94,80 Q58,84 55,114Z" fill="${hair}"/>` + strands;
        [62, 138].forEach(x => {
          for (let i = 0; i < 6; i++) {
            const cx = x + (i % 2 ? 2 : -2);
            const cy = 132 + i * 13;
            s += `<path d="M${cx - 9},${cy} Q${cx},${cy - 12} ${cx + 9},${cy} Q${cx},${cy + 12} ${cx - 9},${cy}Z" fill="${hair}" stroke="${hairD}" stroke-width="1.2"/>`;
            s += `<path d="M${cx - 5},${cy - 3} Q${cx},${cy - 7} ${cx + 5},${cy - 3}" stroke="#ffffff" stroke-width="1" fill="none" opacity=".35"/>`;
          }
          s += `<rect x="${x - 6}" y="204" width="12" height="5" rx="2" fill="#a0432b"/><circle cx="${x}" cy="206.5" r="2.2" fill="#e0b13e"/><path d="M${x - 6},209 L${x - 9},226 L${x},218 L${x + 9},226 L${x + 6},209Z" fill="${hair}"/>`;
        });
        return s;
      }
      case 'corto':
        return `<path d="M56,106 Q50,52 100,50 Q150,52 144,106 Q142,82 128,72 Q112,86 90,74 Q70,82 56,106Z" fill="${hair}"/>` + strands;
      case 'rizado': {
        let s = '';
        for (let i = 0; i <= 8; i++) {
          const ang = Math.PI + (i / 8) * Math.PI;
          s += `<circle cx="${100 + Math.cos(ang) * 44}" cy="${98 + Math.sin(ang) * 46}" r="14" fill="${hair}" stroke="${hairD}" stroke-width="1"/>`;
        }
        return s;
      }
      case 'mono':
        return `<path d="M56,104 Q54,52 100,50 Q146,52 144,104 Q132,80 100,78 Q68,80 56,104Z" fill="${hair}"/>` + strands;
      case 'rapado':
        return `<path d="M60,98 Q60,58 100,58 Q140,58 140,98 Q126,74 100,72 Q74,74 60,98Z" fill="${hair}" opacity=".6"/>`;
    }
    return '';
  }

  function clothes(a) {
    const c = a.colorRopa, cd = shade(c, -0.25);
    const base = d => `<path d="M30,240 Q32,186 86,172 L114,172 Q168,186 170,240Z" fill="${d}"/>`;
    switch (a.ropa) {
      case 'vikinga': {
        let s = base(c) + `<path d="M100,178 L100,240" stroke="${cd}" stroke-width="3"/><path d="M48,214 Q100,226 152,214" stroke="#e0b13e" stroke-width="2" fill="none" stroke-dasharray="6 4"/>`;
        for (let x = 60; x <= 140; x += 8) {
          const y = 186 - Math.pow((x - 100) / 40, 2) * 6;
          s += `<path d="M${x - 7},${y} Q${x},${y - 12} ${x + 7},${y} Q${x},${y + 8} ${x - 7},${y}Z" fill="#c9a77c" stroke="#9c7a52" stroke-width="1"/>`;
        }
        return s + '<circle cx="100" cy="204" r="7" fill="#e0b13e" stroke="#9c7a1e" stroke-width="2"/><path d="M96,204 h8 M100,200 v8" stroke="#9c7a1e" stroke-width="1.4"/><path d="M40,230 L160,230" stroke="#5a3820" stroke-width="7"/>';
      }
      case 'hippie': {
        let s = base('#f6e7c1');
        s += `<path d="M30,240 Q32,186 86,172 L92,240Z" fill="${c}"/><path d="M170,240 Q168,186 114,172 L108,240Z" fill="${c}"/>`;
        for (let x = 40; x <= 88; x += 6) s += `<path d="M${x},232 l0,8" stroke="${cd}" stroke-width="2"/>`;
        for (let x = 112; x <= 160; x += 6) s += `<path d="M${x},232 l0,8" stroke="${cd}" stroke-width="2"/>`;
        return s + '<path d="M86,174 Q100,196 114,174" stroke="#6b4226" stroke-width="1.5" fill="none"/><circle cx="100" cy="200" r="8" fill="none" stroke="#6b4226" stroke-width="2"/><path d="M100,192 L100,208 M100,200 L94,206 M100,200 L106,206" stroke="#6b4226" stroke-width="2"/>';
      }
      case 'armadura':
        return base('#9aa3ab') + '<path d="M44,206 Q100,190 156,206 M40,222 Q100,206 160,222" stroke="#6b737a" stroke-width="3" fill="none"/>' +
          `<path d="M52,186 L148,240 L124,240 L44,198Z" fill="${c}"/><circle cx="62" cy="194" r="4" fill="#e0b13e"/>`;
      case 'vestido': {
        let s = base(c) + `<path d="M86,172 Q100,194 114,172Z" fill="${a.piel}"/>`;
        [[60, 210], [90, 222], [126, 206], [146, 228], [110, 234], [70, 232]].forEach(([x, y]) => {
          s += `<circle cx="${x}" cy="${y}" r="4" fill="#fff6e5"/><circle cx="${x}" cy="${y}" r="1.6" fill="#f2b705"/>`;
        });
        return s;
      }
      case 'granjero':
        return base('#f2efe6') + `<path d="M70,202 L130,202 L136,240 L64,240Z" fill="${c}"/><path d="M76,204 L82,176 M124,204 L118,176" stroke="${c}" stroke-width="7" stroke-linecap="round"/><circle cx="76" cy="208" r="3" fill="#e0b13e"/><circle cx="124" cy="208" r="3" fill="#e0b13e"/>`;
    }
    return base(c);
  }

  function accessory(a) {
    switch (a.accesorio) {
      case 'flores': {
        const cols = ['#ff8fab', '#ffd166', '#cdb4db', '#ffffff', '#f4a261', '#ff8fab', '#ffd166'];
        let s = '<path d="M56,90 Q100,40 144,90" stroke="#4f7942" stroke-width="3" fill="none"/>';
        [62, 74, 87, 100, 113, 126, 138].forEach((x, i) => {
          const y = 108 - 58 * Math.sqrt(Math.max(0, 1 - Math.pow((x - 100) / 47, 2))) + 6;
          for (let k = 0; k < 5; k++) {
            const ang = (k / 5) * Math.PI * 2 + i;
            s += `<ellipse cx="${x + Math.cos(ang) * 4.4}" cy="${y + Math.sin(ang) * 4.4}" rx="3.8" ry="3" transform="rotate(${ang * 57} ${x + Math.cos(ang) * 4.4} ${y + Math.sin(ang) * 4.4})" fill="${cols[i]}" stroke="${shade(cols[i], -0.2)}" stroke-width=".5"/>`;
          }
          s += `<circle cx="${x}" cy="${y}" r="2.6" fill="#f2b705"/>`;
        });
        return s;
      }
      case 'casco':
        return '<path d="M60,74 Q34,64 36,34 Q46,58 66,62Z" fill="#f3ead7" stroke="#b9a984" stroke-width="2"/><path d="M140,74 Q166,64 164,34 Q154,58 134,62Z" fill="#f3ead7" stroke="#b9a984" stroke-width="2"/>' +
          '<path d="M56,92 Q56,46 100,46 Q144,46 144,92Z" fill="#9aa3ab" stroke="#6b737a" stroke-width="2"/><rect x="54" y="84" width="92" height="10" rx="4" fill="#7d868e"/><path d="M100,46 L100,84" stroke="#6b737a" stroke-width="4"/>' +
          '<circle cx="66" cy="89" r="2" fill="#e0e4e8"/><circle cx="134" cy="89" r="2" fill="#e0e4e8"/>';
      case 'bandana':
        return '<path d="M57,88 Q100,70 143,88 L143,98 Q100,80 57,98Z" fill="#e76f51"/><circle cx="80" cy="86" r="1.6" fill="#fff"/><circle cx="100" cy="81" r="1.6" fill="#fff"/><circle cx="120" cy="86" r="1.6" fill="#fff"/><path d="M141,92 l16,-6 l-3,13Z" fill="#e76f51"/>';
      case 'gafas':
        return '<g fill="rgba(255,255,255,.15)" stroke="#5a3e2b" stroke-width="2.5"><circle cx="82" cy="112" r="13"/><circle cx="118" cy="112" r="13"/></g><path d="M95,111 q5,-4 10,0" stroke="#5a3e2b" stroke-width="2.5" fill="none"/>';
    }
    return '';
  }

  AA.avatarInner = function (a) {
    const id = nextId('av');
    const skin = a.piel, skinD = shade(skin, -0.14), skinL = shade(skin, 0.25);
    const hair = `url(#${id}h)`, hairBase = a.colorPelo, hairD = shade(hairBase, -0.35);
    let s = '<defs>' +
      lin(`${id}h`, [[0, shade(hairBase, 0.18)], [1, shade(hairBase, -0.12)]]) +
      rad(`${id}f`, [[0, skinL], [1, skin]], '45%', '40%', '70%') +
      lin(`${id}i`, [[0, shade(a.ojos, -0.55)], [0.55, a.ojos], [1, shade(a.ojos, 0.45)]]) +
      '</defs>';
    s += hairBack(a, hair, hairD);
    s += clothes(a);
    s += `<path d="M86,144 L86,176 Q100,186 114,176 L114,144Z" fill="${skinD}"/><path d="M86,150 Q100,162 114,150 L114,144 L86,144Z" fill="${shade(skin, -0.25)}" opacity=".5"/>`;
    s += `<path d="M58,108 q-8,-2 -8,6 q0,10 10,10Z" fill="${skin}"/><path d="M142,108 q8,-2 8,6 q0,10 -10,10Z" fill="${skin}"/>`;
    const face = a.genero === 'chico'
      ? 'M58,100 C58,70 76,58 100,58 C124,58 142,70 142,100 C142,128 130,148 112,154 Q100,158 88,154 C70,148 58,128 58,100Z'
      : 'M59,100 C59,70 77,58 100,58 C123,58 141,70 141,100 C141,126 126,148 100,157 C74,148 59,126 59,100Z';
    s += `<path d="${face}" fill="url(#${id}f)"/>`;
    s += '<ellipse cx="74" cy="128" rx="9" ry="5" fill="#f2829a" opacity=".3"/><ellipse cx="126" cy="128" rx="9" ry="5" fill="#f2829a" opacity=".3"/>';
    if (a.pecas) {
      [[90, 121], [95, 124], [86, 125], [105, 124], [110, 121], [114, 125], [97, 119], [103, 119], [92, 128], [108, 128], [81, 122], [119, 122]].forEach(([x, y]) => {
        s += `<circle cx="${x}" cy="${y}" r="1.3" fill="#b5774b" opacity=".7"/>`;
      });
    }
    [82, 118].forEach((x, i) => {
      const dir = i === 0 ? -1 : 1;
      s += `<path d="M${x - 10},${111} Q${x},${99} ${x + 10},${111} Q${x},${122} ${x - 10},${111}Z" fill="#fff"/>`;
      s += `<ellipse cx="${x}" cy="112" rx="6.8" ry="8.6" fill="url(#${id}i)"/>`;
      s += `<ellipse cx="${x}" cy="113" rx="3.2" ry="4.4" fill="#1b1310"/>`;
      s += `<circle cx="${x - 2.4}" cy="108.6" r="2.4" fill="#fff"/><circle cx="${x + 2.6}" cy="116" r="1.1" fill="#fff" opacity=".9"/>`;
      s += `<path d="M${x - 11},${110} Q${x},${98} ${x + 11},${109}" stroke="#2a1a12" stroke-width="3" fill="none" stroke-linecap="round"/>`;
      if (a.genero === 'chica') s += `<path d="M${x + dir * 10},${109.5} l${dir * 4},-3.5 M${x + dir * 8},${105} l${dir * 3},-4" stroke="#2a1a12" stroke-width="1.6" stroke-linecap="round"/>`;
    });
    const bw = a.genero === 'chico' ? 3.4 : 2.4;
    s += `<path d="M72,96 Q82,91 92,95" stroke="${hairD}" stroke-width="${bw}" fill="none" stroke-linecap="round"/><path d="M108,95 Q118,91 128,96" stroke="${hairD}" stroke-width="${bw}" fill="none" stroke-linecap="round"/>`;
    s += `<path d="M100,118 Q98,125 101,127" stroke="${shade(skin, -0.28)}" stroke-width="1.8" fill="none" stroke-linecap="round"/>`;
    if (a.barba) s += `<path d="M60,116 Q62,158 100,162 Q138,158 140,116 Q132,140 118,142 Q100,150 82,142 Q68,140 60,116Z" fill="${hair}"/>`;
    s += '<path d="M93,137 Q100,142 107,137" stroke="#a0453a" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M96,139.5 Q100,141.5 104,139.5" stroke="#e98a8a" stroke-width="1.4" fill="none" stroke-linecap="round"/>';
    s += hairFront(a, hair, hairD);
    s += accessory(a);
    return s;
  };

  AA.avatarSVG = function (a, opts) {
    opts = opts || {};
    const vb = opts.head ? '40 30 120 140' : '0 0 200 240';
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" class="${opts.cls || 'avatar-svg'}">${AA.avatarInner(a)}</svg>`;
  };

  // ---------- Logo (estilo emblema de juego de dragones) ----------
  function bigWing(id) {
    return `<path d="M200,150 C170,120 140,90 120,50 C100,70 70,60 40,40 C50,70 40,90 18,104 C44,112 54,126 50,150 C74,146 92,156 100,176 C120,166 150,166 200,180Z" fill="url(#${id}wg)" stroke="#2c1a0e" stroke-width="3" stroke-linejoin="round"/>` +
      '<path d="M200,152 C170,124 140,92 120,50 M120,50 C110,90 70,100 18,104 M120,50 C112,96 80,130 50,150 M120,50 C118,110 108,150 100,176" stroke="#2c1a0e" stroke-width="2.6" fill="none" stroke-linecap="round"/>' +
      '<path d="M120,50 l-6,-10 l12,4Z" fill="#f3ead7" stroke="#2c1a0e" stroke-width="1.5"/>';
  }

  AA.logoSVG = function (opts) {
    opts = opts || {};
    const id = nextId('logo');
    const skin = AA.LOGO_AVATAR.piel;
    let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 ${opts.noTitle ? 240 : 334}" class="${opts.cls || 'logo-svg'}" role="img" aria-label="AiryAldea">`;
    s += '<defs>' +
      rad(`${id}sun`, [[0, '#fff4c9'], [0.45, '#ffc56b'], [0.8, '#f2742b'], [1, '#9c3b2a']], '50%', '42%', '60%') +
      lin(`${id}wg`, [[0, '#53d1c3'], [0.6, '#1f7f8a'], [1, '#14465a']], 1, 1) +
      lin(`${id}gold`, [[0, '#fffbe0'], [0.35, '#ffd95a'], [0.7, '#f0a000'], [1, '#a35a00']]) +
      lin(`${id}rib`, [[0, '#e04b3a'], [1, '#8f2418']]) +
      `<clipPath id="${id}c"><circle cx="200" cy="128" r="94"/></clipPath>` +
      `<filter id="${id}sh" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="4" stdDeviation="3" flood-color="#2c1a0e" flood-opacity=".55"/></filter>` +
      glowFilter(`${id}gl`, 3) +
      `<path id="${id}arc" d="M40,284 Q200,250 360,284"/>` +
      '</defs>';
    s += `<g filter="url(#${id}sh)">`;
    s += bigWing(id);
    s += `<g transform="translate(400,0) scale(-1,1)">${bigWing(id)}</g>`;
    s += `<circle cx="200" cy="128" r="100" fill="#2c1a0e"/><circle cx="200" cy="128" r="96" fill="#e0b13e"/>`;
    s += `<circle cx="200" cy="128" r="94" fill="url(#${id}sun)"/>`;
    s += `<g clip-path="url(#${id}c)">`;
    s += '<path d="M100,170 L140,120 L165,150 L200,104 L240,152 L262,128 L300,170Z" fill="#7a3a3a" opacity=".55"/>';
    s += '<path d="M100,190 Q150,160 200,178 Q250,160 300,186 L300,240 L100,240Z" fill="#3f6b4a"/>';
    s += '<g fill="#fff6e5" opacity=".9"><path d="M134,70 l3,7 l7,3 l-7,3 l-3,7 l-3,-7 l-7,-3 l7,-3Z"/><path d="M266,60 l2,5 l5,2 l-5,2 l-2,5 l-2,-5 l-5,-2 l5,-2Z"/><circle cx="250" cy="96" r="1.5"/><circle cx="150" cy="104" r="1.2"/></g>';
    s += '<path d="M246,72 q6,-5 12,0 q6,-5 12,0" stroke="#2c1a0e" stroke-width="2" fill="none" opacity=".6"/>';
    s += `<g transform="translate(130,22) scale(.7)">${AA.avatarInner(AA.LOGO_AVATAR)}</g>`;
    s += '<g transform="translate(0,-14)">';
    s += `<path d="M162,186 Q170,204 184,210" stroke="${AA.LOGO_AVATAR.colorRopa}" stroke-width="16" stroke-linecap="round" fill="none"/><path d="M238,186 Q230,204 216,210" stroke="${AA.LOGO_AVATAR.colorRopa}" stroke-width="16" stroke-linecap="round" fill="none"/>`;
    s += `<ellipse cx="200" cy="190" rx="34" ry="30" fill="#ffe9a8" opacity=".5" filter="url(#${id}gl)"/>`;
    s += AA.dragonSVG('aurora', 1, { x: 146, y: 136, w: 104, h: 91 });
    s += '<path d="M174,206 L182,198 L188,206 L196,196 L204,206 L212,198 L220,206 L228,200 Q232,214 226,226 Q214,238 200,238 Q186,238 174,226 Q168,214 174,206Z" fill="#fff6e5" stroke="#b39b7a" stroke-width="2"/>';
    s += '<g fill="#ffc56b"><circle cx="188" cy="222" r="4"/><circle cx="212" cy="228" r="5"/><circle cx="214" cy="212" r="3"/></g>';
    s += `<ellipse cx="178" cy="216" rx="9" ry="7" fill="${skin}" stroke="${shade(skin, -0.25)}" stroke-width="1.2"/><ellipse cx="222" cy="216" rx="9" ry="7" fill="${skin}" stroke="${shade(skin, -0.25)}" stroke-width="1.2"/>`;
    s += '</g></g>';
    s += '<circle cx="200" cy="128" r="94" fill="none" stroke="#fff6c9" stroke-width="2" opacity=".6"/>';
    s += '</g>';
    if (!opts.noTitle) {
      s += `<text font-family="Fredoka, Nunito, sans-serif" font-weight="700" font-size="64" text-anchor="middle" letter-spacing="1"><textPath href="#${id}arc" startOffset="50%" fill="#2c1a0e" stroke="#2c1a0e" stroke-width="16" stroke-linejoin="round">AiryAldea</textPath></text>`;
      s += `<text font-family="Fredoka, Nunito, sans-serif" font-weight="700" font-size="64" text-anchor="middle" letter-spacing="1"><textPath href="#${id}arc" startOffset="50%" fill="#7a3d0a" stroke="#7a3d0a" stroke-width="8" stroke-linejoin="round">AiryAldea</textPath></text>`;
      s += `<text font-family="Fredoka, Nunito, sans-serif" font-weight="700" font-size="64" text-anchor="middle" letter-spacing="1"><textPath href="#${id}arc" startOffset="50%" fill="url(#${id}gold)">AiryAldea</textPath></text>`;
      s += `<path d="M84,298 L316,298 L304,312 L316,326 L84,326 L96,312Z" fill="url(#${id}rib)" stroke="#2c1a0e" stroke-width="3" stroke-linejoin="round"/>`;
      s += '<text x="200" y="317.5" text-anchor="middle" font-family="Fredoka, Nunito, sans-serif" font-weight="600" font-size="14" fill="#fff6e5" letter-spacing="2">LEYENDAS DE DRAGONES</text>';
    }
    s += '</svg>';
    return s;
  };

  // ---------- Portadas ----------
  const SCENES = {
    batallas: { sky: ['#2b1a3d', '#a8433b', '#f28c28'], hills: ['#3d2233', '#24141f'], a: 'lava', b: 'tormenta' },
    arena: { sky: ['#1f4e79', '#5fa8d3', '#ffe3a3'], hills: ['#4f7942', '#2f4f2a'], a: 'chispa', b: 'voltio' },
    saltos: { sky: ['#2a9d8f', '#8fd3f4', '#fff1c9'], hills: ['#6fbf5a', '#3f8a3a'], a: 'brisa' },
    criadero: { sky: ['#3b1f12', '#8b4a22', '#f2b05a'], hills: ['#5a3420', '#2c1a0e'], egg: true },
    tienda: { sky: ['#6b2c5f', '#d9719a', '#ffd6a5'], hills: ['#8b5a2b', '#5a3820'] },
    aldea: { sky: ['#2a6f97', '#8fd3f4', '#fff1c9'], hills: ['#7a9e7e', '#4f7942'], a: 'aurora' },
    legal: { sky: ['#4a3426', '#8b6a4a', '#e8d6b5'], hills: ['#6b4226', '#4a2c17'] },
  };

  AA.coverSVG = function (kind, title, subtitle) {
    const sc = SCENES[kind] || SCENES.aldea;
    const id = nextId('cv');
    let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 240" preserveAspectRatio="xMinYMid slice" class="cover-svg">`;
    s += '<defs>' + lin(`${id}s`, [[0, sc.sky[0]], [0.6, sc.sky[1]], [1, sc.sky[2]]]) +
      rad(`${id}sun`, [[0, '#fffbe0', 1], [0.4, '#ffe08a', 0.8], [1, '#ffe08a', 0]]) +
      lin(`${id}fade`, [[0, '#000', 0], [1, '#000', 0.55]]) + '</defs>';
    s += `<rect width="800" height="240" fill="url(#${id}s)"/>`;
    s += `<circle cx="620" cy="150" r="140" fill="url(#${id}sun)"/>`;
    s += '<g fill="#fff" opacity=".5"><ellipse cx="140" cy="50" rx="50" ry="10"/><ellipse cx="520" cy="38" rx="70" ry="9"/><ellipse cx="700" cy="70" rx="40" ry="7"/></g>';
    s += `<path d="M0,170 L80,110 L150,150 L240,80 L330,150 L420,96 L520,160 L600,110 L700,150 L800,100 L800,240 L0,240Z" fill="${sc.hills[0]}" opacity=".75"/>`;
    s += '<g fill="#2c1a0e" opacity=".55"><path d="M600,60 q10,-8 20,0 q10,-8 20,0 q-10,-2 -20,6 q-10,-8 -20,-6Z"/><path d="M680,92 q6,-5 12,0 q6,-5 12,0 q-6,-1 -12,4 q-6,-5 -12,-4Z"/></g>';
    s += `<path d="M0,200 Q200,160 400,190 Q600,160 800,196 L800,240 L0,240Z" fill="${sc.hills[1]}"/>`;
    if (kind === 'arena') {
      s += '<g fill="#b9a98f" stroke="#5e5040" stroke-width="2"><rect x="560" y="120" width="46" height="70"/><rect x="700" y="130" width="40" height="60"/><rect x="610" y="100" width="80" height="90"/></g><g fill="#c0392b"><path d="M650,100 v-30 l22,8 l-22,8"/><path d="M583,120 v-22 l16,6 l-16,6"/></g>';
    }
    if (kind === 'saltos') {
      s += '<g fill="#a0703c" stroke="#6b4226" stroke-width="2"><rect x="520" y="140" width="80" height="14"/><rect x="640" y="110" width="70" height="14"/></g><g fill="#f2b705" stroke="#b38600" stroke-width="2"><circle cx="540" cy="124" r="7"/><circle cx="565" cy="124" r="7"/><circle cx="660" cy="94" r="7"/><circle cx="685" cy="94" r="7"/></g>';
    }
    if (kind === 'tienda') {
      s += '<g><rect x="560" y="130" width="180" height="60" fill="#8b5a2b"/><path d="M550,130 L750,130 L740,104 L560,104Z" fill="#c0392b"/><path d="M590,104 L585,130 M630,104 L628,130 M670,104 L672,130 M710,104 L715,130" stroke="#fff6e5" stroke-width="10"/></g><text x="650" y="172" text-anchor="middle" font-size="34">💎🪙🥚</text>';
    }
    if (sc.egg) {
      s += AA.eggSVG('fenix').replace('<svg ', '<svg x="560" y="70" width="120" height="120" ');
      s += AA.eggSVG('aurora').replace('<svg ', '<svg x="660" y="100" width="90" height="90" ');
    }
    if (sc.a && sc.b) {
      s += AA.dragonSVG(sc.a, 12, { x: 420, y: 56, w: 190, h: 166 });
      s += AA.dragonSVG(sc.b, 12, { x: 610, y: 56, w: 190, h: 166, flip: true });
    } else if (sc.a) {
      s += AA.dragonSVG(sc.a, 12, { x: 560, y: 40, w: 220, h: 190 });
    }
    s += `<rect width="800" height="240" fill="url(#${id}fade)"/>`;
    s += `<text x="32" y="150" font-family="Fredoka, sans-serif" font-weight="700" font-size="52" fill="#fff6e5" stroke="#2c1a0e" stroke-width="8" paint-order="stroke" stroke-linejoin="round">${AA.esc(title || '')}</text>`;
    if (subtitle) s += `<text x="34" y="186" font-family="Nunito, sans-serif" font-weight="800" font-size="20" fill="#fff6e5" stroke="#2c1a0e" stroke-width="5" paint-order="stroke">${AA.esc(subtitle)}</text>`;
    s += '</svg>';
    return s;
  };

  // Paisaje de la portada inicial (a pantalla completa).
  AA.splashSceneSVG = function () {
    const id = nextId('sp');
    let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" class="splash-scene">`;
    s += '<defs>' + lin(`${id}s`, [[0, '#1d2b53'], [0.45, '#7e4f8f'], [0.75, '#f28c28'], [1, '#ffd58a']]) +
      rad(`${id}sun`, [[0, '#fffbe0'], [0.3, '#ffe08a', 0.9], [1, '#ffb347', 0]]) + '</defs>';
    s += `<rect width="800" height="600" fill="url(#${id}s)"/>`;
    s += '<g fill="#fff" opacity=".8">' + Array.from({ length: 40 }, (_, i) => `<circle cx="${(i * 197) % 800}" cy="${(i * 73) % 220}" r="${(i % 3) * 0.5 + 0.6}"/>`).join('') + '</g>';
    s += `<circle cx="400" cy="380" r="260" fill="url(#${id}sun)"/>`;
    s += '<path d="M0,420 L90,330 L170,380 L260,280 L360,370 L440,300 L540,390 L640,300 L720,360 L800,320 L800,600 L0,600Z" fill="#5a2e4a" opacity=".8"/>';
    s += '<path d="M0,470 L120,400 L220,450 L330,390 L450,460 L560,400 L680,450 L800,410 L800,600 L0,600Z" fill="#3b2a3f"/>';
    s += '<g fill="#2c1a2a"><path d="M110,470 l20,-26 l20,26Z M150,476 l16,-20 l16,20Z M600,470 l22,-28 l22,28Z M640,476 l14,-18 l14,18Z"/><rect x="114" y="470" width="32" height="18"/><rect x="604" y="470" width="36" height="18"/></g>';
    s += '<path d="M0,520 Q200,480 400,510 Q600,480 800,515 L800,600 L0,600Z" fill="#24162a"/>';
    s += '<g fill="#24162a" opacity=".7"><path d="M120,140 q14,-12 28,0 q14,-12 28,0 q-14,-3 -28,9 q-14,-12 -28,-9Z"/><path d="M640,110 q10,-8 20,0 q10,-8 20,0 q-10,-2 -20,6 q-10,-8 -20,-6Z"/><path d="M560,180 q6,-5 12,0 q6,-5 12,0 q-6,-1 -12,4 q-6,-5 -12,-4Z"/></g>';
    s += '</svg>';
    return s;
  };

  // ---------- Edificios de la aldea ----------
  AA.buildingSVG = function (kind) {
    const id = nextId('bd');
    let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 100" class="building-svg"><defs>${lin(`${id}st`, [[0, '#d8ccb4'], [1, '#9c8a70']])}${lin(`${id}wd`, [[0, '#a0703c'], [1, '#6b4226']])}</defs>`;
    s += '<ellipse cx="60" cy="92" rx="52" ry="7" fill="rgba(0,0,0,.2)"/>';
    switch (kind) {
      case 'fuerte':
        s += `<rect x="20" y="40" width="80" height="50" fill="url(#${id}st)" stroke="#5e5040" stroke-width="2"/>`;
        s += `<rect x="12" y="26" width="24" height="64" fill="url(#${id}st)" stroke="#5e5040" stroke-width="2"/><rect x="84" y="26" width="24" height="64" fill="url(#${id}st)" stroke="#5e5040" stroke-width="2"/>`;
        s += '<path d="M12,26 h4 v-6 h4 v6 h4 v-6 h4 v6 h4 M84,26 h4 v-6 h4 v6 h4 v-6 h4 v6 h4" stroke="#5e5040" stroke-width="2" fill="#c9bba0"/>';
        s += `<path d="M46,90 V66 Q60,52 74,66 V90Z" fill="url(#${id}wd)" stroke="#3b2a1a" stroke-width="2"/><path d="M60,58 V90 M48,74 H72" stroke="#3b2a1a" stroke-width="1.5"/>`;
        s += '<path d="M24,20 V4 l14,5 l-14,5" fill="#c0392b" stroke="#6b1e14" stroke-width="1"/><path d="M96,20 V4 l14,5 l-14,5" fill="#c0392b" stroke="#6b1e14" stroke-width="1"/>';
        s += '<path d="M54,44 l6,-6 l6,6 l-6,10Z" fill="#e0b13e" stroke="#7a5a12" stroke-width="1.2"/>';
        break;
      case 'arena':
        s += `<ellipse cx="60" cy="70" rx="50" ry="22" fill="url(#${id}st)" stroke="#5e5040" stroke-width="2"/><path d="M10,70 V48 Q60,30 110,48 V70" fill="url(#${id}st)" stroke="#5e5040" stroke-width="2"/>`;
        s += '<g fill="#6b4226">' + [18, 32, 46, 60, 74, 88, 102].map(x => `<path d="M${x - 4},68 v-10 q4,-6 8,0 v10Z"/>`).join('') + '</g>';
        s += '<path d="M30,40 V18 l12,4 l-12,4 M90,40 V18 l12,4 l-12,4" stroke="#3b2a1a" stroke-width="1.5" fill="#2a6f97"/><path d="M60,36 V10 l14,5 l-14,5" stroke="#3b2a1a" stroke-width="1.5" fill="#c0392b"/>';
        break;
      case 'saltos':
        s += '<path d="M10,90 V36 Q24,20 44,30 L52,90Z" fill="#8a7a66" stroke="#5e5040" stroke-width="2"/><path d="M40,32 Q48,34 50,40 L58,90 L44,90Z" fill="#7cc8ff" opacity=".9"/><path d="M46,40 v40 M52,46 v40" stroke="#ffffff" stroke-width="2" opacity=".7"/>';
        s += `<rect x="64" y="56" width="26" height="8" fill="url(#${id}wd)" stroke="#3b2a1a" stroke-width="1.5"/><rect x="86" y="36" width="24" height="8" fill="url(#${id}wd)" stroke="#3b2a1a" stroke-width="1.5"/>`;
        s += '<circle cx="77" cy="46" r="5" fill="#f2b705" stroke="#b38600" stroke-width="1.5"/><circle cx="98" cy="26" r="5" fill="#f2b705" stroke="#b38600" stroke-width="1.5"/><path d="M8,90 Q60,80 112,90" stroke="#5fa04e" stroke-width="6" fill="none"/>';
        break;
      case 'criadero':
        s += '<path d="M14,90 Q14,30 60,26 Q106,30 106,90Z" fill="#c98a52" stroke="#6b4226" stroke-width="2"/><path d="M20,60 Q60,48 100,60 M16,76 Q60,64 104,76" stroke="#8b5a2b" stroke-width="2" fill="none"/>';
        s += '<path d="M40,90 V68 Q60,52 80,68 V90Z" fill="#3b1f12"/>';
        s += AA.eggSVG('fenix').replace('<svg ', '<svg x="44" y="56" width="32" height="32" ');
        s += '<path d="M60,26 V12" stroke="#6b4226" stroke-width="3"/><circle cx="60" cy="10" r="4" fill="#ffd23f"/>';
        break;
      case 'tienda':
        s += `<rect x="18" y="50" width="84" height="40" fill="url(#${id}wd)" stroke="#3b2a1a" stroke-width="2"/>`;
        s += '<path d="M10,50 L110,50 L102,26 L18,26Z" fill="#c0392b" stroke="#6b1e14" stroke-width="2"/><path d="M34,26 L30,50 M56,26 L55,50 M78,26 L80,50 M98,26 L102,50" stroke="#fff6e5" stroke-width="7"/>';
        s += '<text x="60" y="80" text-anchor="middle" font-size="20">💎🪙</text>';
        break;
      case 'granja':
        s += '<path d="M18,90 V50 L60,24 L102,50 V90Z" fill="#c0392b" stroke="#6b1e14" stroke-width="2"/><path d="M14,52 L60,20 L106,52" stroke="#fff6e5" stroke-width="5" fill="none"/>';
        s += '<rect x="44" y="60" width="32" height="30" fill="#fff6e5" stroke="#6b1e14" stroke-width="2"/><path d="M44,60 L76,90 M76,60 L44,90" stroke="#c0392b" stroke-width="3"/>';
        break;
    }
    s += '</svg>';
    return s;
  };

  // ---------- Cartas estilo arena ----------
  AA.cardHTML = function (speciesId, level, opts) {
    opts = opts || {};
    const sp = AA.SPECIES[speciesId];
    const cost = AA.RARITIES[sp.rarity].cost;
    return `<div class="ccard rar-c-${sp.rarity} ${opts.cls || ''}">
      <div class="cc-inner el-c-${sp.elements[0]}">${AA.dragonSVG(speciesId, Math.max(level, 5))}</div>
      <span class="cc-cost">${cost}</span>
      <span class="cc-lvl">Nv ${level}</span>
      <span class="cc-name">${AA.esc(opts.name || sp.name)}</span>
    </div>`;
  };

  // Imágenes para dibujar en canvas (arena y saltos).
  const imgCache = {};
  AA.svgImage = function (key, svg) {
    if (!imgCache[key]) {
      const img = new Image();
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
      imgCache[key] = img;
    }
    return imgCache[key];
  };
  AA.dragonImage = (speciesId, level, flip) =>
    AA.svgImage(`d-${speciesId}-${AA.stageOf(level)}-${flip ? 1 : 0}`, AA.dragonSVG(speciesId, level, { flip }));
})(window.AA);
