// Capturas del portafolio: misma medida, mismos datos y mismo scroll en claro y en oscuro.
//
// Uso:
//   node capturar.mjs <proyecto> [--solo 2] [--sin-oscuro] [--ver]
//
//   <proyecto>    clave de proyectos.mjs (saas, predisana, mediora, poemario, bitacora)
//   --solo N      solo la captura número N (1, 2…), para retocar una sin rehacer todas
//   --ver         abre el navegador visible, para depurar
//
// Cada captura se guarda como assets/shots/<proyecto>/<NN>-light.webp y <NN>-dark.webp,
// que es lo que espera js/config.js. Al final imprime el bloque para pegar en SHOTS.

import { chromium } from 'playwright';
import sharp from 'sharp';
import { mkdirSync, existsSync, readFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PROYECTOS } from './proyectos.mjs';

const AQUI = dirname(fileURLToPath(import.meta.url));
const PORTAFOLIO = join(AQUI, '..', '..');

// ---- Medidas ------------------------------------------------------------------------------
// El carrusel del portafolio es 16:10 con object-fit: cover; una captura 16:9 perdería los
// bordes. Ventana de laptop (1440×900), pintada a 2x y reducida a 1920×1200: nítida en
// pantallas retina y sin el espacio vacío a los lados de un monitor grande.
const PERFIL_ESCRITORIO = { ventana: { width: 1440, height: 900 }, salida: { width: 1920, height: 1200 } };
// Bitácora es una app de celular: pantalla de teléfono (390×844, la de un iPhone 14), a 2x. Su
// carrusel usa object-fit: contain, así que la imagen alta se ve entera.
const PERFIL_MOVIL = { ventana: { width: 390, height: 844 }, salida: { width: 780, height: 1688 }, movil: true };
const ESCALA = 2;
const CALIDAD_WEBP = 82;

// Quita lo que hace que dos tomas de la misma pantalla no coincidan.
const CSS_ESTABLE = `
  *, *::before, *::after {
    animation-duration: 0s !important; animation-delay: 0s !important;
    transition: none !important; caret-color: transparent !important;
  }
  html { scrollbar-width: none !important; }
  ::-webkit-scrollbar { display: none !important; }
`;

// ---- Argumentos ---------------------------------------------------------------------------
const args = process.argv.slice(2);
const clave = args[0];
const solo = args.includes('--solo') ? Number(args[args.indexOf('--solo') + 1]) : null;
const ver = args.includes('--ver');

if (!clave || !PROYECTOS[clave]) {
  console.error(`Uso: node capturar.mjs <${Object.keys(PROYECTOS).join('|')}> [--solo N] [--ver]`);
  process.exit(1);
}

const proyecto = PROYECTOS[clave];
const perfil = proyecto.movil ? PERFIL_MOVIL : PERFIL_ESCRITORIO;
const modos = proyecto.tema ? ['light', 'dark'] : ['light'];
const credenciales = leerCredenciales(clave);
const carpeta = join(PORTAFOLIO, 'assets', 'shots', clave);
mkdirSync(carpeta, { recursive: true });

// Las credenciales van en un archivo fuera de git (credenciales.local.json).
function leerCredenciales(proyectoClave) {
  const archivo = join(AQUI, 'credenciales.local.json');
  if (!existsSync(archivo)) return null;
  const c = JSON.parse(readFileSync(archivo, 'utf8'))[proyectoClave];
  // Un campo vacío cuenta como que faltan: así el archivo puede llevar la plantilla sin rellenar.
  return c && Object.values(c).every(v => v) ? c : null;
}

async function esperarQueAsiente(page) {
  // Algunas apps nunca quedan del todo quietas (sondeos, websockets): se espera un rato y se sigue.
  await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
  await page.evaluate(async () => {
    await document.fonts.ready;
    // Que las imágenes VISIBLES hayan terminado (cargadas o fallidas), no solo pedidas. Las de
    // fuera de pantalla con loading="lazy" no cargan nunca: esperarlas colgaría el script.
    const visibles = [...document.images].filter(img => {
      const r = img.getBoundingClientRect();
      return r.bottom > 0 && r.top < innerHeight && r.width > 0;
    });
    const tope = new Promise(r => setTimeout(r, 8000));
    await Promise.race([tope, Promise.all(visibles.map(img => img.complete ? null :
      new Promise(r => { img.addEventListener('load', r, { once: true }); img.addEventListener('error', r, { once: true }); })))]);
  });
  await page.waitForTimeout(400);
}

const browser = await chromium.launch({ channel: 'chrome', headless: !ver });
const resultado = [];

try {
  for (const modo of modos) {
    const context = await browser.newContext({
      viewport: perfil.ventana,
      deviceScaleFactor: ESCALA,
      isMobile: !!perfil.movil,
      hasTouch: !!perfil.movil,
      colorScheme: modo,
      reducedMotion: 'reduce',
      locale: 'es-EC',
      timezoneId: 'America/Guayaquil',
    });
    const page = await context.newPage();
    if (proyecto.fecha) await page.clock.setFixedTime(new Date(proyecto.fecha));
    if (proyecto.alIniciar) await page.addInitScript(proyecto.alIniciar, modo);
    // Para fijar respuestas de la API que cambian en cada llamada (un caso aleatorio, por ejemplo).
    if (proyecto.alAbrir) await proyecto.alAbrir(page);

    // La sesión se abre una vez, antes de la primera toma que la pida. Con `sesionDesdeElInicio`
    // se abre antes de todas (cuando la app entera está detrás del login). Sin credenciales, las
    // tomas que la necesitan se saltan con un aviso en vez de tumbar las demás.
    let conSesion = false;
    const abrirSesion = async () => {
      if (conSesion) return true;
      // `sinCredenciales`: la app entra sola (p. ej. el botón de la cuenta demo de Bitácora).
      if (!credenciales && !proyecto.sinCredenciales) return false;
      await proyecto.login(page, proyecto.base, credenciales ?? {});
      conSesion = true;
      return true;
    };

    for (const [i, toma] of proyecto.tomas.entries()) {
      const n = i + 1;
      if (solo && solo !== n) continue;
      if (toma.sesion || proyecto.sesionDesdeElInicio) {
        if (!(await abrirSesion())) {
          console.log(`  ⚠ ${clave} ${n}: se salta, faltan sus credenciales en credenciales.local.json`);
          continue;
        }
      }

      await page.goto(proyecto.base + toma.ruta, { waitUntil: 'domcontentloaded' });
      await page.addStyleTag({ content: CSS_ESTABLE });
      // Holgado: una API en un plan gratuito (Render) tarda en despertar.
      if (toma.esperar) await page.locator(toma.esperar).first().waitFor({ timeout: 60000 });
      await esperarQueAsiente(page);
      if (toma.antes) await toma.antes(page);
      if (proyecto.forzarTema) await proyecto.forzarTema(page, modo);
      if (toma.scroll) {
        await page.locator(toma.scroll).first().scrollIntoViewIfNeeded();
        await page.evaluate(() => window.scrollBy(0, -24));
      }
      // El ratón se queda donde hizo el último clic (el login): un :hover encendería una tarjeta.
      await page.mouse.move(0, 0);
      await esperarQueAsiente(page);

      const nombre = `${String(n).padStart(2, '0')}-${modo}.webp`;
      const crudo = await page.screenshot({ type: 'png' });
      await sharp(crudo)
        .resize(perfil.salida.width, perfil.salida.height, { fit: 'cover', position: 'top' })
        .webp({ quality: CALIDAD_WEBP })
        .toFile(join(carpeta, nombre));
      console.log(`  ✓ ${clave}/${nombre}  ${toma.titulo ?? toma.ruta}`);
      resultado[i] = { ...(resultado[i] ?? {}), [modo]: relative(PORTAFOLIO, join(carpeta, nombre)).replaceAll('\\', '/') };
    }
    await context.close();
  }
} finally {
  await browser.close();
}

// Bloque para js/config.js
if (!solo) {
  console.log(`\n  ${clave}: [`);
  for (const r of resultado) {
    console.log(proyecto.tema ? `    { light: "${r.light}", dark: "${r.dark}" },` : `    "${r.light}",`);
  }
  console.log('  ],');
}
