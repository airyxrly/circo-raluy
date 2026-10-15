// Prueba de experiencia de usuario: abre el juego en un navegador real,
// en móvil y en escritorio, y comprueba lo que notaría un jugador.
// Uso: node tests/experiencia.mjs   (necesita: npm i playwright && npx playwright install chromium)
// Deja capturas de cada pantalla en tests/capturas/.
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(process.argv[2] || '.');
const OUT = path.join(ROOT, 'tests', 'capturas');
const PORT = 8123;
const SCREENS = ['aldea', 'criadero', 'lucha', 'minijuegos', 'tienda', 'perfil', 'legal', 'arena', 'saltos'];
const VIEWPORTS = [
  { name: 'movil', viewport: { width: 375, height: 740 }, isMobile: true, hasTouch: true },
  { name: 'escritorio', viewport: { width: 1280, height: 800 } },
];
const MAX_CARGA_MS = 4000;   // tiempo máximo hasta poder pulsar "Jugar"
const MIN_CONTRASTE = 3;     // WCAG para texto grande/negrita de botones
const PELIGROSOS = /reset|borrar|delete|logout|google|login|signin/i;

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png' };
const server = http.createServer((req, res) => {
  let p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (p.endsWith(path.sep) || p.endsWith('/')) p = path.join(p, 'index.html');
  fs.readFile(p, (err, data) => {
    if (err) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'content-type': TYPES[path.extname(p)] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(PORT);

const fallos = [];
const fallo = (vp, msg) => { fallos.push(`[${vp}] ${msg}`); console.log(`  ✗ ${msg}`); };
const ok = msg => console.log(`  ✓ ${msg}`);

// Se ejecuta dentro de la página: busca problemas visibles en la pantalla actual.
function revisarPantalla(MIN) {
  const W = Math.min(innerWidth, screen.width); // en móvil el navegador ensancha innerWidth si algo se sale
  const lum = c => {
    const [r, g, b] = c.match(/[\d.]+/g).slice(0, 3).map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const fondo = el => {
    for (let e = el; e; e = e.parentElement) {
      const cs = getComputedStyle(e);
      if (cs.backgroundImage !== 'none') return null; // degradados o imágenes: no se puede medir
      const a = (cs.backgroundColor.match(/[\d.]+/g) || [])[3];
      if (cs.backgroundColor !== 'transparent' && (a === undefined || +a >= 0.9)) return cs.backgroundColor; // los fondos translúcidos se miran por debajo
    }
    return 'rgb(255,255,255)';
  };
  const visibles = [...document.querySelectorAll('button, a, [data-act]')].filter(b => {
    const r = b.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && getComputedStyle(b).visibility !== 'hidden' && getComputedStyle(b).opacity !== '0';
  });
  const ilegibles = [];
  for (const b of visibles) {
    if (b.disabled || b.closest('.locked')) continue;
    // Mide cada trozo de texto real del botón (no el texto dibujado dentro de SVG).
    const conTexto = [b, ...b.querySelectorAll('*')].filter(e => !e.closest('svg') &&
      [...e.childNodes].some(n => n.nodeType === 3 && /[A-Za-zÁÉÍÓÚáéíóúñÑ0-9]/.test(n.textContent)) && e.getBoundingClientRect().width > 0);
    for (const e of conTexto) {
      const bg = fondo(e);
      if (!bg) continue;
      const l1 = lum(getComputedStyle(e).color), l2 = lum(bg);
      const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
      if (ratio < MIN) ilegibles.push(`"${e.textContent.trim().slice(0, 30)}" (${ratio.toFixed(1)}:1)`);
    }
  }
  const anchos = document.documentElement.scrollWidth > W + 1;
  const sinNombre = visibles.filter(b => b.tagName === 'BUTTON' && !b.textContent.trim() && !b.querySelector('svg title') && !b.getAttribute('aria-label') && !b.title).length;
  const texto = document.getElementById('screen').innerText.trim().length;
  return { ilegibles: [...new Set(ilegibles)], anchos, ancho: document.documentElement.scrollWidth, sinNombre, texto };
}

const browser = await chromium.launch();
fs.mkdirSync(OUT, { recursive: true });

for (const vp of VIEWPORTS) {
  console.log(`\n▶ ${vp.name} (${vp.viewport.width}×${vp.viewport.height})`);
  const ctx = await browser.newContext(vp);
  const page = await ctx.newPage();
  page.setDefaultTimeout(5000);
  const errores = [];
  page.on('pageerror', e => errores.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errores.push(m.text()); });
  page.on('dialog', d => d.dismiss());

  // 1. Primera visita: carga rápida y botón de empezar.
  const t0 = Date.now();
  await page.goto(`http://localhost:${PORT}/`);
  const empezar = page.locator('.splash button');
  await empezar.waitFor({ state: 'visible' }).catch(() => {});
  const carga = Date.now() - t0;
  if (await empezar.isVisible()) {
    carga > MAX_CARGA_MS ? fallo(vp.name, `La portada tarda ${carga} ms (máx. ${MAX_CARGA_MS})`) : ok(`Portada lista en ${carga} ms`);
    await empezar.click();
    await page.waitForTimeout(500);
  } else fallo(vp.name, 'No aparece el botón para empezar a jugar');

  // 2. Aviso de privacidad: debe poder leerse y cerrarse.
  const aviso = page.locator('.consent-bar');
  if (await aviso.isVisible()) {
    const r = await page.evaluate(revisarPantalla, MIN_CONTRASTE);
    r.ilegibles.length ? fallo(vp.name, `Aviso de privacidad con botones ilegibles: ${r.ilegibles.join(', ')}`) : ok('Aviso de privacidad legible');
    await page.screenshot({ path: path.join(OUT, `${vp.name}-0-privacidad.png`) });
    await aviso.locator('[data-c="reject"]').click();
    (await aviso.isVisible()) ? fallo(vp.name, 'El aviso de privacidad no se cierra') : ok('El aviso de privacidad se cierra');
  }

  // 3. Cada pantalla: tiene contenido, no se sale del ancho y los botones se leen.
  for (const [i, id] of SCREENS.entries()) {
    await page.evaluate(s => { AA.state.level = Math.max(AA.state.level, 50); AA.go(s); }, id);
    await page.waitForTimeout(300);
    const r = await page.evaluate(revisarPantalla, MIN_CONTRASTE);
    const p = [];
    if (r.texto < 20) p.push('pantalla vacía');
    if (r.anchos) p.push(`se sale del ancho (${r.ancho}px en ${vp.viewport.width}px)`);
    if (r.ilegibles.length) p.push(`botones ilegibles: ${r.ilegibles.slice(0, 3).join(', ')}`);
    if (r.sinNombre) p.push(`${r.sinNombre} botón(es) sin nombre para lectores de pantalla`);
    p.length ? fallo(vp.name, `${id}: ${p.join('; ')}`) : ok(`${id}`);
    await page.screenshot({ path: path.join(OUT, `${vp.name}-${i + 1}-${id}.png`) });
  }

  // 4. Pulsar los botones de cada pantalla no debe romper nada.
  const antes = errores.length;
  let pulsados = 0;
  for (const id of ['aldea', 'criadero', 'lucha', 'tienda', 'perfil']) {
    await page.evaluate(s => AA.go(s), id);
    const n = await page.locator('#screen [data-act]').count();
    for (let k = 0; k < Math.min(n, 30); k++) {
      await page.evaluate(s => { AA.closeModal && AA.closeModal(); AA.go(s); }, id);
      const el = page.locator('#screen [data-act]').nth(k);
      const act = await el.getAttribute('data-act', { timeout: 500 }).catch(() => null);
      if (!act || PELIGROSOS.test(act)) continue;
      await el.click({ timeout: 800, force: true }).catch(() => {});
      pulsados++;
      await page.waitForTimeout(60);
    }
  }
  await page.evaluate(() => AA.closeModal && AA.closeModal());
  errores.length > antes ? fallo(vp.name, `Errores al pulsar botones: ${[...new Set(errores.slice(antes))].slice(0, 3).join(' | ')}`) : ok(`${pulsados} botones pulsados sin errores`);

  // 5. La partida se guarda al recargar.
  const oro = await page.evaluate(() => { AA.state.gold += 7; AA.save(); return AA.state.gold; });
  await page.reload();
  await page.waitForTimeout(800);
  (await page.evaluate(() => AA.state.gold)) === oro ? ok('La partida se conserva al recargar') : fallo(vp.name, 'La partida NO se conserva al recargar');

  if (errores.length) fallo(vp.name, `Errores de JavaScript: ${[...new Set(errores)].slice(0, 5).join(' | ')}`);
  else ok('Sin errores de JavaScript');
  await ctx.close();
}

await browser.close();
server.close();
console.log(`\n${fallos.length ? `✗ ${fallos.length} problema(s) de experiencia de usuario` : '✓ Experiencia de usuario correcta en móvil y escritorio'}`);
process.exit(fallos.length ? 1 : 0);
