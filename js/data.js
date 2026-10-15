// Datos fijos del juego: elementos, especies, hábitats, cultivos y fórmulas.
window.AA = window.AA || {};
(function (AA) {
  AA.ELEMENTS = {
    fuego:     { name: 'Fuego',     icon: '🔥', color: '#e8553b', unlock: 1 },
    agua:      { name: 'Agua',      icon: '💧', color: '#2f8fd8', unlock: 1 },
    planta:    { name: 'Planta',    icon: '🌿', color: '#4caf50', unlock: 2 },
    tierra:    { name: 'Tierra',    icon: '🪨', color: '#a0703c', unlock: 3 },
    aire:      { name: 'Aire',      icon: '🌪️', color: '#7fb3c8', unlock: 4 },
    rayo:      { name: 'Rayo',      icon: '⚡', color: '#e6b800', unlock: 5 },
    hielo:     { name: 'Hielo',     icon: '❄️', color: '#7fd1ec', unlock: 8 },
    metal:     { name: 'Metal',     icon: '⚙️', color: '#8a949e', unlock: 10 },
    luz:       { name: 'Luz',       icon: '☀️', color: '#f0c454', unlock: 13 },
    oscuridad: { name: 'Oscuridad', icon: '🌑', color: '#5b4689', unlock: 16 },
  };
  const EL_KEYS = Object.keys(AA.ELEMENTS);

  // Ventajas: cada elemento es fuerte contra los de su lista (x1,5) y débil al revés (x0,67).
  AA.STRONG = {
    fuego: ['planta', 'hielo', 'metal'],
    agua: ['fuego', 'tierra'],
    planta: ['agua', 'tierra'],
    tierra: ['rayo', 'fuego', 'metal'],
    aire: ['planta', 'tierra'],
    rayo: ['agua', 'aire', 'metal'],
    hielo: ['planta', 'aire', 'tierra'],
    metal: ['hielo', 'luz'],
    luz: ['oscuridad', 'hielo'],
    oscuridad: ['luz', 'aire'],
  };

  AA.elementMult = function (att, defEls) {
    if (!att) return 1;
    let m = 1;
    defEls.forEach(d => {
      if (AA.STRONG[att].includes(d)) m *= 1.5;
      else if (AA.STRONG[d].includes(att)) m *= 0.67;
    });
    return m;
  };

  // hatch = segundos de incubación; cost = maná en la arena.
  AA.RARITIES = {
    comun:      { name: 'Común',      mult: 1.0,  cost: 3, hatch: 30,   weight: 60,  gold: 3 },
    raro:       { name: 'Raro',       mult: 1.2,  cost: 4, hatch: 300,  weight: 30,  gold: 8 },
    epico:      { name: 'Épico',      mult: 1.45, cost: 5, hatch: 1800, weight: 9,   gold: 16 },
    legendario: { name: 'Legendario', mult: 1.75, cost: 6, hatch: 3600, weight: 1,   gold: 28 },
    mitico:     { name: 'Mítico',     mult: 2.0,  cost: 7, hatch: 7200, weight: 0.3, gold: 42 },
  };

  // Tendencia de estadísticas por elemento.
  const PROFILE = {
    fuego: { hp: 100, atk: 24, def: 12, spd: 12 },
    agua: { hp: 118, atk: 18, def: 15, spd: 11 },
    planta: { hp: 124, atk: 17, def: 16, spd: 9 },
    tierra: { hp: 132, atk: 18, def: 21, spd: 6 },
    aire: { hp: 96, atk: 20, def: 11, spd: 17 },
    rayo: { hp: 94, atk: 25, def: 10, spd: 16 },
    hielo: { hp: 110, atk: 21, def: 17, spd: 10 },
    metal: { hp: 120, atk: 19, def: 24, spd: 7 },
    luz: { hp: 116, atk: 21, def: 15, spd: 13 },
    oscuridad: { hp: 104, atk: 27, def: 12, spd: 14 },
  };

  function hash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  AA.hash = hash;

  // Paletas de las especies originales; el resto se calcula a partir de sus elementos.
  const COLORS = {
    chispa: ['#e8553b', '#ffcf6b'], burbuja: ['#2f8fd8', '#bfe6ff'], musgo: ['#4caf50', '#d9f2a6'],
    roca: ['#a0703c', '#e8cfa0'], brisa: ['#7fb3c8', '#f0fbff'], voltio: ['#e6b800', '#fff6b0'],
    vapor: ['#d77fa1', '#ffe0ec'], lava: ['#b8321f', '#ff9a3c'], tormenta: ['#5b5fc7', '#c9cbff'],
    floresta: ['#2e7d32', '#c5a46d'], aurora: ['#46c2c2', '#f2c6ff'], fenix: ['#ff7a00', '#ffe066'],
  };

  const DEFS = [];
  const add = (id, name, elements, rarity, extra) => DEFS.push(Object.assign({ id, name, elements, rarity }, extra || {}));

  // Comunes: dos formas por elemento.
  [
    ['chispa', 'Chispa', 'fuego'], ['brasa', 'Brasa', 'fuego'],
    ['burbuja', 'Burbuja', 'agua'], ['coral', 'Coral', 'agua'],
    ['musgo', 'Musgo', 'planta'], ['helecho', 'Helecho', 'planta'],
    ['roca', 'Roca', 'tierra'], ['arcilla', 'Arcilla', 'tierra'],
    ['brisa', 'Brisa', 'aire'], ['pluma', 'Pluma', 'aire'],
    ['voltio', 'Voltio', 'rayo'], ['destello', 'Destello', 'rayo'],
    ['escarcha', 'Escarcha', 'hielo'], ['nevisca', 'Nevisca', 'hielo'],
    ['ferrita', 'Ferrita', 'metal'], ['cobre', 'Cobre', 'metal'],
    ['lumen', 'Lumen', 'luz'], ['alba', 'Alba', 'luz'],
    ['sombra', 'Sombra', 'oscuridad'], ['noctis', 'Noctis', 'oscuridad'],
  ].forEach(([id, name, el], i) => add(id, name, [el], 'comun', { form: i % 2 }));

  // Raros: un híbrido por cada pareja de elementos (45).
  const PAIRS = {
    'fuego-agua': ['vapor', 'Vapor'], 'fuego-planta': ['ceniza', 'Ceniza'], 'fuego-tierra': ['lava', 'Lava'],
    'fuego-aire': ['siroco', 'Siroco'], 'fuego-rayo': ['plasma', 'Plasma'], 'fuego-hielo': ['fumarola', 'Fumarola'],
    'fuego-metal': ['forjador', 'Forjador'], 'fuego-luz': ['solar', 'Solar'], 'fuego-oscuridad': ['infernal', 'Infernal'],
    'agua-planta': ['loto', 'Loto'], 'agua-tierra': ['cienaga', 'Ciénaga'], 'agua-aire': ['monzon', 'Monzón'],
    'agua-rayo': ['tempestad', 'Tempestad'], 'agua-hielo': ['iceberg', 'Iceberg'], 'agua-metal': ['mercurio', 'Mercurio'],
    'agua-luz': ['perla', 'Perla'], 'agua-oscuridad': ['abisal', 'Abisal'], 'planta-tierra': ['floresta', 'Floresta'],
    'planta-aire': ['polen', 'Polen'], 'planta-rayo': ['ortiga', 'Ortiga'], 'planta-hielo': ['abeto', 'Abeto'],
    'planta-metal': ['herrumbre', 'Herrumbre'], 'planta-luz': ['girasol', 'Girasol'], 'planta-oscuridad': ['mandragora', 'Mandrágora'],
    'tierra-aire': ['duna', 'Duna'], 'tierra-rayo': ['magnetita', 'Magnetita'], 'tierra-hielo': ['permafrost', 'Permafrost'],
    'tierra-metal': ['golem', 'Gólem'], 'tierra-luz': ['ambar', 'Ámbar'], 'tierra-oscuridad': ['fosil', 'Fósil'],
    'aire-rayo': ['tormenta', 'Tormenta'], 'aire-hielo': ['ventisca', 'Ventisca'], 'aire-metal': ['veleta', 'Veleta'],
    'aire-luz': ['cefiro', 'Céfiro'], 'aire-oscuridad': ['espectro', 'Espectro'], 'rayo-hielo': ['granizo', 'Granizo'],
    'rayo-metal': ['dinamo', 'Dínamo'], 'rayo-luz': ['relampago', 'Relámpago'], 'rayo-oscuridad': ['nubarron', 'Nubarrón'],
    'hielo-metal': ['cromo', 'Cromo'], 'hielo-luz': ['diamante', 'Diamante'], 'hielo-oscuridad': ['gelido', 'Gélido'],
    'metal-luz': ['oricalco', 'Oricalco'], 'metal-oscuridad': ['obsidiana', 'Obsidiana'], 'luz-oscuridad': ['eclipse', 'Eclipse'],
  };
  for (let i = 0; i < EL_KEYS.length; i++) {
    for (let j = i + 1; j < EL_KEYS.length; j++) {
      const [id, name] = PAIRS[EL_KEYS[i] + '-' + EL_KEYS[j]];
      add(id, name, [EL_KEYS[i], EL_KEYS[j]], 'raro');
    }
  }

  // Épicos: formas ancestrales y tríadas.
  [
    ['pirodraco', 'Pirodraco', ['fuego']], ['leviatan', 'Leviatán', ['agua']], ['silvano', 'Silvano', ['planta']],
    ['coloso', 'Coloso', ['tierra']], ['ciclon', 'Ciclón', ['aire']], ['fulgor', 'Fulgor', ['rayo']],
    ['glaciaris', 'Glaciaris', ['hielo']], ['paladin', 'Paladín', ['metal']], ['serafico', 'Seráfico', ['luz']],
    ['umbral', 'Umbral', ['oscuridad']],
    ['aurora', 'Aurora', ['agua', 'aire', 'luz']], ['magmatico', 'Magmático', ['fuego', 'tierra', 'metal']],
    ['tifon', 'Tifón', ['agua', 'aire', 'rayo']], ['pantano', 'Pantano', ['planta', 'tierra', 'agua']],
    ['druida', 'Druida', ['planta', 'tierra', 'luz']], ['nebula', 'Nébula', ['aire', 'luz', 'oscuridad']],
    ['boreal', 'Boreal', ['hielo', 'agua', 'metal']], ['tesla', 'Tesla', ['fuego', 'metal', 'rayo']],
    ['ceniciento', 'Ceniciento', ['fuego', 'oscuridad', 'tierra']], ['prisma', 'Prisma', ['luz', 'hielo', 'rayo']],
  ].forEach(([id, name, els]) => add(id, name, els, 'epico'));

  // Legendarios inspirados en la mitología nórdica.
  [
    ['fenix', 'Fénix Airy', ['fuego', 'aire']], ['kraken', 'Kraken Real', ['agua', 'oscuridad']],
    ['yggdrasil', 'Yggdrasil', ['planta', 'tierra', 'luz']], ['atlas', 'Atlas', ['tierra', 'metal']],
    ['valkiria', 'Valkiria', ['aire', 'luz', 'metal']], ['mjolnir', 'Mjölnir', ['rayo', 'metal']],
    ['ymir', 'Ymir', ['hielo', 'tierra']], ['fafnir', 'Fáfnir', ['fuego', 'metal', 'oscuridad']],
    ['nidhogg', 'Nidhogg', ['oscuridad', 'planta']], ['solinvicto', 'Sol Invicto', ['luz', 'fuego']],
    ['jormungand', 'Jörmungandr', ['agua', 'tierra']], ['hati', 'Hati', ['oscuridad', 'hielo']],
  ].forEach(([id, name, els]) => add(id, name, els, 'legendario'));

  // Míticos: solo se consiguen criando.
  [
    ['airy', 'Airy la Primera', ['luz', 'aire', 'planta']], ['ragnarok', 'Ragnarök', ['fuego', 'oscuridad', 'rayo']],
    ['bifrost', 'Bifröst', ['luz', 'agua', 'aire']], ['midgard', 'Midgard', ['tierra', 'planta', 'agua']],
    ['ginnunga', 'Ginnunga', ['hielo', 'fuego', 'oscuridad']],
  ].forEach(([id, name, els]) => add(id, name, els, 'mitico'));

  // Construye el catálogo con estadísticas, precios, colores y aspecto.
  AA.SPECIES = {};
  let legIdx = 0, mitIdx = 0;
  DEFS.forEach(d => {
    const h = hash(d.id);
    const els = d.elements;
    const eu = els.map(e => AA.ELEMENTS[e].unlock);
    let unlock;
    if (d.rarity === 'comun') unlock = eu[0] + d.form * 3;
    else if (d.rarity === 'raro') unlock = Math.max(6, Math.max(...eu) + 3);
    else if (d.rarity === 'epico') unlock = Math.max(15, Math.max(...eu) + (els.length === 1 ? 12 : 10));
    else if (d.rarity === 'legendario') unlock = Math.max(24 + legIdx++, Math.max(...eu) + 12);
    else unlock = 36 + 2 * mitIdx++;
    if (d.id === 'chispa' || d.id === 'burbuja') unlock = 1;

    const base = { hp: 0, atk: 0, def: 0, spd: 0 };
    els.forEach(e => Object.keys(base).forEach(k => (base[k] += PROFILE[e][k] / els.length)));
    Object.keys(base).forEach((k, i) => (base[k] = Math.round(base[k] * (0.94 + ((h >> (i * 4)) & 15) / 125))));

    let price;
    if (d.rarity === 'comun') price = { gold: 60 + 40 * unlock };
    else if (d.rarity === 'raro') price = { gold: 500 + 120 * unlock };
    else if (d.rarity === 'epico') price = { gems: 25 + unlock };
    else if (d.rarity === 'legendario') price = { gems: 90 + 2 * unlock };
    else price = null;

    let colors = COLORS[d.id];
    if (!colors) {
      const a = AA.ELEMENTS[els[0]].color, b = AA.ELEMENTS[els[els.length - 1]].color;
      const tweak = ((h & 255) / 255 - 0.5) * 0.3;
      colors = d.form
        ? [shadeHex(a, -0.25 + tweak), shadeHex(b, 0.55)]
        : els.length === 1 ? [shadeHex(a, tweak), shadeHex(a, 0.6)] : [shadeHex(a, tweak), shadeHex(b, 0.35)];
    }

    AA.SPECIES[d.id] = {
      name: d.name, elements: els, rarity: d.rarity, unlock, price, colors,
      stats: base, gold: Math.round(AA.RARITIES[d.rarity].gold * (0.85 + (h % 30) / 100)),
      look: { horns: h % 4, marks: (h >>> 3) % 3, bulk: 0.92 + ((h >>> 6) % 17) / 100, spikes: (h >>> 9) % 3 },
    };
  });
  AA.SPECIES_COUNT = Object.keys(AA.SPECIES).length;

  function shadeHex(hex, p) {
    const n = parseInt(hex.slice(1), 16);
    let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    const t = p < 0 ? 0 : 255, a = Math.abs(p);
    r = Math.round((t - r) * a + r); g = Math.round((t - g) * a + g); b = Math.round((t - b) * a + b);
    return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
  }

  AA.speciesValue = sp => (sp.price ? (sp.price.gold || sp.price.gems * 50) : 8000);

  AA.HABITATS = {
    fuego:     { name: 'Volcán',            price: 150,  unlock: 1 },
    agua:      { name: 'Laguna',            price: 200,  unlock: 1 },
    planta:    { name: 'Bosque',            price: 300,  unlock: 2 },
    tierra:    { name: 'Cantera',           price: 400,  unlock: 3 },
    aire:      { name: 'Nubes',             price: 500,  unlock: 4 },
    rayo:      { name: 'Torre de tormenta', price: 600,  unlock: 5 },
    hielo:     { name: 'Glaciar',           price: 800,  unlock: 8 },
    metal:     { name: 'Forja',             price: 1000, unlock: 10 },
    luz:       { name: 'Santuario solar',   price: 1300, unlock: 13 },
    oscuridad: { name: 'Cripta lunar',      price: 1600, unlock: 16 },
  };
  AA.HABITAT_MAX_LEVEL = 3;
  AA.habitatCapacity = lvl => 1 + lvl;
  AA.habitatGoldCap = lvl => 150 * lvl * lvl;
  AA.habitatUpgradeCost = (price, lvl) => price * 2 * lvl;
  AA.habitatPrice = type => AA.HABITATS[type].price * (1 + AA.state.habitats.filter(h => h.type === type).length);

  // Edificios del mapa y nivel necesario para usarlos.
  AA.BUILDINGS = {
    criadero: { name: 'Criadero',           art: 'criadero', unlock: 1, desc: 'Incuba huevos y cría dragones' },
    tienda:   { name: 'Mercado',            art: 'tienda',   unlock: 1, desc: 'Huevos, hábitats, oro y gemas' },
    granja:   { name: 'Granero',            art: 'granja',   unlock: 1, desc: 'Cultivos y comida' },
    saltos:   { name: 'Cascada de saltos',  art: 'saltos',   unlock: 2, desc: 'Minijuego de plataformas' },
    fuerte:   { name: 'Fuerte de asalto',   art: 'fuerte',   unlock: 3, desc: 'Ataca aldeas rivales por turnos' },
    arena:    { name: 'Portal de la arena', art: 'arena',    unlock: 4, desc: 'Minijuego de cartas y torres' },
  };

  // Decoraciones de la aldea: cada una da +1% de oro a todos los hábitats (máximo +20%).
  AA.DECORATIONS = {
    farol:      { name: 'Farol de aceite',     price: { gold: 150 },  unlock: 1 },
    jardin:     { name: 'Jardín de flores',    price: { gold: 200 },  unlock: 1 },
    antorcha:   { name: 'Antorcha rúnica',     price: { gold: 250 },  unlock: 2 },
    estandarte: { name: 'Estandarte del clan', price: { gold: 400 },  unlock: 3 },
    hoguera:    { name: 'Hoguera vikinga',     price: { gold: 500 },  unlock: 4 },
    pozo:       { name: 'Pozo de piedra',      price: { gold: 700 },  unlock: 5 },
    menhir:     { name: 'Menhir de runas',     price: { gold: 1200 }, unlock: 7 },
    fuente:     { name: 'Fuente del dragón',   price: { gold: 2000 }, unlock: 9 },
    arbol:      { name: 'Árbol sagrado',       price: { gems: 15 },   unlock: 6 },
    estatua:    { name: 'Estatua de dragón',   price: { gems: 30 },   unlock: 10 },
  };
  AA.decorBonus = () => 1 + Math.min(0.2, ((AA.state && AA.state.decor) || []).length * 0.01);

  AA.CROPS = [
    { id: 'trigo',    name: 'Trigo',           icon: '🌾', cost: 10,  food: 25,   time: 30,   unlock: 1 },
    { id: 'calabaza', name: 'Calabaza',        icon: '🎃', cost: 60,  food: 160,  time: 300,  unlock: 2 },
    { id: 'bayas',    name: 'Bayas de dragón', icon: '🫐', cost: 250, food: 800,  time: 1800, unlock: 4 },
    { id: 'manzana',  name: 'Manzanas doradas', icon: '🍎', cost: 900, food: 3200, time: 7200, unlock: 10 },
  ];
  AA.MAX_PLOTS = 8;
  AA.plotPrice = n => 80 * n * n;

  AA.xpForLevel = lvl => Math.round(60 * Math.pow(lvl, 1.6));

  AA.DRAGON_MAX_LEVEL = 30;
  AA.FEEDS_PER_LEVEL = 4;
  AA.feedCost = lvl => Math.round(5 * Math.pow(lvl, 1.5));
  AA.stageOf = lvl => (lvl >= 10 ? 'adulto' : lvl >= 5 ? 'joven' : 'bebe');
  AA.STAGES = { bebe: 'Bebé', joven: 'Joven', adulto: 'Adulto' };
  AA.SHINY_CHANCE = 0.03; // probabilidad de variante iridiscente al eclosionar
  AA.BREED_MIN_LEVEL = 5;
  AA.BREED_COST = 200;

  AA.dragonStats = function (speciesId, lvl) {
    const s = AA.SPECIES[speciesId];
    const m = AA.RARITIES[s.rarity].mult * (1 + 0.12 * (lvl - 1));
    return {
      hp: Math.round(s.stats.hp * m),
      atk: Math.round(s.stats.atk * m),
      def: Math.round(s.stats.def * m),
      spd: Math.round(s.stats.spd * (1 + 0.03 * (lvl - 1))),
    };
  };

  AA.happiness = d => (d.hunger + d.clean) / 2;
  AA.goldRate = d => AA.SPECIES[d.species].gold * (1 + 0.15 * (d.level - 1)) * (0.4 + 0.6 * AA.happiness(d) / 100) * AA.decorBonus();

  AA.MOVES = {
    fuego:     [{ name: 'Llamarada', power: 32, cd: 2 },          { name: 'Infierno', power: 52, cd: 4 }],
    agua:      [{ name: 'Chorro', power: 32, cd: 2 },             { name: 'Maremoto', power: 52, cd: 4 }],
    planta:    [{ name: 'Látigo de lianas', power: 32, cd: 2 },   { name: 'Tormenta de esporas', power: 52, cd: 4 }],
    tierra:    [{ name: 'Pedrada', power: 32, cd: 2 },            { name: 'Terremoto', power: 52, cd: 4 }],
    aire:      [{ name: 'Ráfaga', power: 32, cd: 2 },             { name: 'Tornado', power: 52, cd: 4 }],
    rayo:      [{ name: 'Chispazo', power: 32, cd: 2 },           { name: 'Tormenta eléctrica', power: 52, cd: 4 }],
    hielo:     [{ name: 'Aliento helado', power: 32, cd: 2 },     { name: 'Invierno eterno', power: 52, cd: 4 }],
    metal:     [{ name: 'Garra de acero', power: 32, cd: 2 },     { name: 'Lluvia de cuchillas', power: 52, cd: 4 }],
    luz:       [{ name: 'Rayo sagrado', power: 32, cd: 2 },       { name: 'Juicio solar', power: 52, cd: 4 }],
    oscuridad: [{ name: 'Mordisco umbrío', power: 32, cd: 2 },    { name: 'Eclipse total', power: 52, cd: 4 }],
  };

  AA.abilitiesFor = function (speciesId, level) {
    const els = AA.SPECIES[speciesId].elements;
    const strong = AA.MOVES[els[0]][0];
    const lastEl = els[els.length - 1];
    const ulti = AA.MOVES[lastEl][1];
    return [
      { id: 'zarpazo', name: 'Zarpazo', element: null, power: 20, cd: 0, unlock: 1 },
      { id: 'fuerte', name: strong.name, element: els[0], power: strong.power, cd: strong.cd, unlock: 3 },
      { id: 'curar', name: 'Rugido curativo', element: null, heal: 0.25, cd: 4, unlock: 5 },
      { id: 'ulti', name: ulti.name, element: lastEl, power: ulti.power, cd: ulti.cd, unlock: 8 },
    ].map(a => Object.assign(a, { locked: level < a.unlock }));
  };

  // Posibles crías: especies cuyos elementos estén todos entre los de los padres.
  AA.breedOptions = function (spA, spB, playerLevel) {
    const pool = new Set(AA.SPECIES[spA].elements.concat(AA.SPECIES[spB].elements));
    const list = Object.keys(AA.SPECIES).filter(id => {
      const s = AA.SPECIES[id];
      return s.elements.every(e => pool.has(e)) && s.unlock <= playerLevel + 3;
    });
    const total = list.reduce((t, id) => t + AA.RARITIES[AA.SPECIES[id].rarity].weight, 0);
    return list.map(id => ({ species: id, chance: AA.RARITIES[AA.SPECIES[id].rarity].weight / total }));
  };

  AA.CAMPAIGN = [
    { name: 'Granjero novato',        species: 'musgo',      level: 1 },
    { name: 'Pescadora del lago',     species: 'burbuja',    level: 2 },
    { name: 'Herrero de la aldea',    species: 'chispa',     level: 3 },
    { name: 'Cantero gruñón',         species: 'roca',       level: 4 },
    { name: 'Pastora del viento',     species: 'brisa',      level: 5 },
    { name: 'Inventor chiflado',      species: 'voltio',     level: 6 },
    { name: 'Bruja del vapor',        species: 'vapor',      level: 7 },
    { name: 'Guardián del volcán',    species: 'lava',       level: 9 },
    { name: 'Druida del bosque',      species: 'floresta',   level: 10 },
    { name: 'Señor de las tormentas', species: 'tormenta',   level: 12 },
    { name: 'Cazadora del glaciar',   species: 'ventisca',   level: 13 },
    { name: 'Maestro forjador',       species: 'golem',      level: 14 },
    { name: 'Hechicera de la aurora', species: 'aurora',     level: 16 },
    { name: 'Sacerdote solar',        species: 'serafico',   level: 18 },
    { name: 'Nigromante lunar',       species: 'umbral',     level: 20 },
    { name: 'Jarl Dragón',            species: 'fenix',      level: 22 },
    { name: 'Guardiana de Yggdrasil', species: 'yggdrasil',  level: 25 },
    { name: 'El Devorador',           species: 'nidhogg',    level: 28 },
  ];

  AA.LEAGUES = [
    { name: 'Madera', min: 0,    icon: '🪵' },
    { name: 'Bronce', min: 100,  icon: '🥉' },
    { name: 'Plata',  min: 300,  icon: '🥈' },
    { name: 'Oro',    min: 600,  icon: '🥇' },
    { name: 'Dragón', min: 1000, icon: '🐉' },
  ];
  AA.leagueOf = t => AA.LEAGUES.filter(l => t >= l.min).pop();

  AA.PLATFORM_LEVELS = 10;

  AA.AVATAR_OPTIONS = {
    genero: [['chica', 'Chica'], ['chico', 'Chico'], ['nb', 'No binario']],
    piel: ['#fde3cf', '#f5cfae', '#e0ac83', '#c68a5e', '#8d5a3b', '#5c3a24'],
    pelo: [['largo', 'Suelto'], ['trenzas', 'Trenzas'], ['coleta', 'Coleta'], ['vikingo', 'Vikingo'], ['corto', 'Corto'], ['rizado', 'Rizado'], ['mono', 'Moño'], ['rapado', 'Rapado']],
    colorPelo: ['#b8925a', '#e9cf8a', '#5a3a22', '#1f1a17', '#a8432b', '#d9d9d9', '#b9c4cc', '#e58fb0', '#7b5ec7', '#3fa7a0'],
    ojos: ['#6b4423', '#3a7bd5', '#3f8f4f', '#8a7f3a', '#5f6a72', '#c98a2b', '#7b5ec7'],
    ropa: [['vikinga', 'Túnica vikinga'], ['capa', 'Capa de pieles'], ['cuero', 'Armadura de cuero'], ['armadura', 'Armadura'], ['hippie', 'Chaleco hippie'], ['vestido', 'Vestido floral'], ['granjero', 'Peto de granja']],
    colorRopa: ['#7a9e7e', '#c0392b', '#2a6f97', '#d9a441', '#7b4f9d', '#6b4226', '#2c2c34', '#e8e2d4'],
    accesorio: [['flores', 'Corona de flores'], ['diadema', 'Diadema'], ['casco', 'Casco vikingo'], ['pendientes', 'Pendientes'], ['bandana', 'Bandana'], ['gafas', 'Gafas redondas'], ['ninguno', 'Nada']],
    marcas: [['ninguna', 'Ninguna'], ['pintura', 'Pintura de guerra'], ['runas', 'Runas'], ['cicatriz', 'Cicatriz']],
  };
  AA.DEFAULT_AVATAR = {
    genero: 'chica', piel: '#fde3cf', pelo: 'largo', colorPelo: '#b8925a', ojos: '#6b4423',
    ropa: 'vikinga', colorRopa: '#7a9e7e', accesorio: 'flores', marcas: 'ninguna', pecas: true, barba: false,
  };
  // La chica del logo: rubia oscura con el pelo suelto, pecas, ojos marrones, piel clara, hippie vikinga.
  AA.LOGO_AVATAR = Object.assign({}, AA.DEFAULT_AVATAR);
})(window.AA);
