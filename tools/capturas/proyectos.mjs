// Qué se captura de cada proyecto. Agregar una captura = agregar una entrada en `tomas`.
//
// Campos de un proyecto:
//   base        URL donde está levantado (se puede cambiar con una variable de entorno)
//   tema        true si la app tiene claro y oscuro (si no, una sola imagen por toma)
//   movil       true para la vista 4:5 de móvil (Bitácora)
//   fecha       fija el reloj del navegador, para que "hace 3 días" no cambie entre tomas
//   alAbrir     función (page) => … al crear la página: respuestas fijas con page.route, etc.
//   alIniciar   función que corre en la página ANTES de que cargue la app (recibe el modo):
//               es donde se escribe la preferencia de tema que lee cada app
//   forzarTema  función que corre justo antes de cada captura (para temas que no se guardan)
//   login       función que inicia sesión una vez por modo (credenciales de credenciales.local.json)
//   tomas       [{ titulo, ruta, esperar?, scroll?, antes? }]
//                 esperar  selector que tiene que aparecer antes de capturar
//                 scroll   selector al que se desplaza la página
//                 antes    función (page) => … para abrir algo, pasar el ratón, etc.

// La tienda vitrina «Núcleo PC», hecha solo para estas capturas (fotos de Wikimedia Commons:
// créditos en assets/shots/saas/CREDITOS.md).
//
// Para capturarla, Gondofy se levanta en puertos propios (no choca con el 8000/5173 de siempre):
//   API:      APP_URL=http://127.0.0.1:8010 CORS_ALLOWED_ORIGINS=http://localhost:5174 \
//             MAIL_MAILER=log QUEUE_CONNECTION=sync php artisan serve --port=8010 --no-reload
//   Frontend: VITE_API_URL=http://127.0.0.1:8010/api npx vite --port 5174 --strictPort
const SLUG = 'nucleo-pc';

// Un armado AM5 completo y compatible, para que el armador salga lleno y en verde.
const ARMADO = new URLSearchParams({
  cpu: '01a1f48b-d709-7370-84e8-28c9a3c2f276',          // Ryzen 7 7800X3D
  motherboard: '01a1f48b-d70a-71e6-8ddf-f141e4a79514',  // Gigabyte B650 AORUS Elite AX
  ram: '01a1f48b-d70b-71d5-861e-9427f1cd9d7f',          // Corsair Vengeance DDR5 32GB
  gpu: '01a1f48b-d70d-7157-98b6-bcb8205d2134',          // Radeon RX 7800 XT
  ssd: '01a1f48b-d70e-7266-9ac6-c5728d0f25bf',          // Samsung 990 PRO 2TB
  power: '01a1f48b-d70f-70b9-87f2-456bbff5a070',        // Seasonic FOCUS GX-850
  cooling: '01a1f48b-d710-70f9-a8cb-14d8049fa727',      // DeepCool LT720
  case: '01a1f48b-d711-7175-a5f8-93b192a01272',         // NZXT H5 Flow
}).toString();

import { readFileSync } from 'node:fs';

const fijo = nombre => readFileSync(new URL(`./fijos/${nombre}`, import.meta.url), 'utf8');

// Mediora: el backend sirve el frontend compilado, en un puerto propio:
//   cd frontend && npm run build      (el build viejo no trae lo último)
//   cd backend && PORT=4010 node index.js
// El material es un video de la NASA (dominio público): la URL de la biblioteca de la NASA para
// la descarga, y fijos/tierra-de-noche.mp4 para lo que pide un archivo local (ver .gitignore).
const VIDEO_NASA = 'https://images-assets.nasa.gov/video/GSFC_20170412_Lights_m12573_EarthAtNight/GSFC_20170412_Lights_m12573_EarthAtNight~medium.mp4';
const VIDEO_LOCAL = new URL('./fijos/tierra-de-noche.mp4', import.meta.url);

async function pegarEnlace(page, tipo) {
  // La duración la pide al servidor (yt-dlp): sin ella el recorte no tiene fin.
  // El tipo se elige DESPUÉS de que llegue: cambiarlo mientras se pide deja el recorte sin pintar.
  const duracion = page.waitForResponse(r => r.url().includes('/api/duration'), { timeout: 60000 });
  await page.fill('input[placeholder*="URL"]', VIDEO_NASA);
  await page.getByText('Opciones avanzadas').click();
  await duracion;
  const recorte = page.locator('.lbl', { hasText: 'Inicio' }).first();
  await recorte.waitFor({ timeout: 60000 });
  await page.getByRole('button', { name: tipo, exact: true }).click();
  await recorte.waitFor({ timeout: 60000 });
  await page.waitForTimeout(500);
}

async function rellenarMetadatos(page, prefijo) {
  await page.fill(`#${prefijo}Title`, 'Lights of Human Activity');
  await page.fill(`#${prefijo}Artist`, 'NASA Goddard');
  await page.fill(`#${prefijo}Album`, 'Earth at Night');
  // Sin foco: si no, el último campo sale resaltado.
  await page.evaluate(() => document.activeElement?.blur());
}

// El reproductor enseña su ruedita mientras carga: se espera a tener datos de sobra.
async function videoListo(page) {
  await page.waitForFunction(() => document.querySelector('video')?.readyState >= 4, null, { timeout: 60000 });
  await page.waitForTimeout(1500);
}

async function deslizarA(page, texto, margen = 24) {
  await page.evaluate(([t, m]) => {
    // El elemento más pequeño que contiene ese texto (puede llevar un ícono o un «▾» al lado).
    const el = [...document.querySelectorAll('body *')].filter(x => x.textContent.includes(t))
      .sort((a, b) => a.textContent.length - b.textContent.length)[0];
    window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - m, behavior: 'instant' });
  }, [texto, margen]);
}

export const PROYECTOS = {
  mediora: {
    base: process.env.MEDIORA_URL ?? 'http://localhost:4010',
    tema: true,
    alIniciar: modo => { localStorage.setItem('mediora-theme', modo); },
    // El progreso es un canal SSE: se sirve uno fijo (Demucs al 62 %) y la descarga se queda
    // esperando, así claro y oscuro enseñan el mismo instante y no se descarga nada de verdad.
    alAbrir: async page => {
      await page.route('**/api/progress/**', route => route.fulfill({
        status: 200,
        headers: { 'Content-Type': 'text/event-stream' },
        body: 'retry: 600000\n\ndata: {"stage":"Separando la voz con Demucs","percent":62}\n\n',
      }));
      await page.route('**/api/download', () => {});
      // yt-dlp no saca la duración de un MP4 suelto (da «NA» y la app pone 0, sin recorte); con
      // YouTube sí. Se sirve la real del video: 1:23.
      await page.route('**/api/duration', route =>
        route.fulfill({ contentType: 'application/json', body: '{"duration":83}' }));
    },
    tomas: [
      {
        titulo: 'Descarga con opciones de preparación',
        ruta: '/',
        antes: async page => {
          await pegarEnlace(page, 'Audio');
          // Los formatos son radios escondidos dentro de un <label class="chip">.
          await page.check('input[name="format"][value="mp3"]', { force: true });
          await rellenarMetadatos(page, 'm');
          await deslizarA(page, 'Opciones avanzadas', 120);
        },
      },
      {
        titulo: 'Progreso por SSE y separación Demucs',
        ruta: '/',
        antes: async page => {
          await pegarEnlace(page, 'Audio');
          await rellenarMetadatos(page, 'm');
          await page.getByText('Solo voz (A Capela)').click();
          await page.getByRole('button', { name: /^Descargar$/ }).last().click();
          await page.getByText(/Separando la voz con Demucs/).waitFor({ timeout: 15000 });
          await deslizarA(page, 'Metadatos', 40);
        },
      },
      {
        titulo: 'Convertidor de archivos locales',
        ruta: '/converter',
        antes: async page => {
          await page.locator('input[type="file"]').first().setInputFiles(VIDEO_LOCAL.pathname.replace(/^\/([A-Z]:)/, '$1'));
          await rellenarMetadatos(page, 'c');
        },
      },
      {
        titulo: 'Previsualización integrada antes de descargar',
        ruta: '/',
        antes: async page => {
          await pegarEnlace(page, 'Video');
          await page.getByRole('button', { name: /Mostrar previsualizaci/ }).click();
          await videoListo(page);
          await deslizarA(page, 'Opciones avanzadas', 120);
        },
      },
      {
        titulo: 'Editor de video: cortes, encuadre, velocidad y más',
        ruta: '/editor',
        antes: async page => {
          await page.getByRole('button', { name: 'Subir archivo' }).click();
          await page.locator('input[type="file"]').first().setInputFiles(VIDEO_LOCAL.pathname.replace(/^\/([A-Z]:)/, '$1'));
          await videoListo(page);
          await deslizarA(page, 'Recorte y cortes', 40);
        },
      },
    ],
  },

  // Bitácora (versión Neon, repo C:\Dev\Personal\Bitacora): se captura la app local con la
  // cuenta demo, que entra con un botón y no necesita credenciales.
  //   cd Bitacora && npm run db:demo          (con la API parada: devuelve la demo a su estado)
  //   API_PORT=3010 npx tsx server/dev.ts
  //   API_PORT=3010 npx vite --port 5177 --strictPort
  // Ninguna toma guarda nada: «Registrar» solo rellena el formulario para enseñar el cálculo.
  bitacora: {
    base: process.env.BITACORA_URL ?? 'http://localhost:5177',
    tema: true,
    movil: true,
    // tema-inicial.js lee localStorage['tema'] ('claro' | 'oscuro') antes de pintar.
    alIniciar: modo => { localStorage.setItem('tema', modo === 'dark' ? 'oscuro' : 'claro'); },
    sinCredenciales: true,
    login: async (page, base) => {
      await page.goto(base + '/login');
      await page.getByRole('button', { name: /cuenta demo/ }).click();
      await page.waitForURL('**/inicio', { timeout: 30000 });
    },
    sesionDesdeElInicio: true,
    tomas: [
      { titulo: 'Inicio: lo que necesita reposición y lo último que se movió', ruta: '/inicio', esperar: 'text=Necesitan reposición' },
      { titulo: 'Productos: búsqueda, categorías y existencias', ruta: '/productos', esperar: 'text=Arroz' },
      {
        titulo: 'Registrar: entrada, salida o ajuste, con el resultado en vivo',
        ruta: '/registrar?tipo=salida',
        esperar: 'select',
        antes: async page => {
          // Los id cambian con cada reinicio de la demo: se elige el producto por su nombre.
          const valor = await page.locator('select option', { hasText: /^Arroz \(/ }).getAttribute('value');
          await page.locator('select').selectOption(valor);
          await page.getByLabel(/¿Cuánto sale\?/).fill('12,5');
          await page.evaluate(() => document.activeElement?.blur());
        },
      },
      { titulo: 'Historial por día, con filtros y exportación a CSV', ruta: '/historial', esperar: 'text=Hoy' },
      {
        titulo: 'Detalle del producto con su propio historial',
        ruta: '/productos',
        esperar: 'text=Arroz',
        antes: async page => {
          await page.getByText('Arroz', { exact: true }).click();
          await page.waitForURL('**/productos/*');
          await page.getByText('Existencia', { exact: true }).waitFor();
        },
      },
    ],
  },

  // Poemario: no tiene base local (PostgreSQL); se captura del sitio publicado, solo leyendo.
  // El panel pide la contraseña de autor: va en credenciales.local.json como { "password": "…" }.
  poemario: {
    base: process.env.POEMARIO_URL ?? 'https://poemario.pages.dev',
    tema: true,
    // El tema oscuro de Poemario se llama «night».
    alIniciar: modo => { localStorage.setItem('poemario_theme', modo === 'dark' ? 'night' : 'light'); },
    login: async (page, base, { password }) => {
      await page.goto(base + '/admin');
      await page.fill('input[type="password"]', password);
      await page.click('button[type="submit"]');
      await page.waitForURL(url => /\/admin\/?$/.test(url.pathname), { timeout: 60000 });
      await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    },
    tomas: [
      { titulo: 'Portada: listado con búsqueda', ruta: '/', esperar: 'a[href*="/poemas/"]' },
      // El único poema con comentarios publicados.
      { titulo: 'Detalle de poema y comentarios', ruta: '/poemas/nocturno-del-faro', esperar: 'h1' },
      { titulo: 'Dashboard del taller', ruta: '/admin', sesion: true },
      {
        titulo: 'Editor con control de publicación',
        ruta: '/admin/poemas',
        sesion: true,
        // Solo abre el editor: no se guarda nada.
        antes: async page => {
          await page.getByRole('button', { name: /Editar/ }).first().click();
          await page.waitForTimeout(1000);
        },
      },
    ],
  },

  // Predisana: API Flask y frontend Vite, en puertos propios:
  //   API:      venv/Scripts/python -m flask --app app run --port 8020
  //   Frontend: VITE_API_URL=http://127.0.0.1:8020 npx vite --port 5175 --strictPort
  predisana: {
    base: process.env.PREDISANA_URL ?? 'http://localhost:5175',
    tema: true,
    fecha: '2026-11-19T15:00:00-05:00',
    alIniciar: modo => { localStorage.setItem('predisana_theme_v1', modo); },
    // El «Caso virtual» es aleatorio: se sirve siempre el mismo, para que claro y oscuro coincidan.
    alAbrir: async page => {
      await page.route('**/synthetic/diabetes', route =>
        route.fulfill({ contentType: 'application/json', body: fijo('predisana-caso-diabetes.json') }));
    },
    tomas: [
      { titulo: 'Portada: propuesta y metodología', ruta: '/' },
      {
        titulo: 'Simulador: formulario, riesgo y SHAP',
        ruta: '/simulacion',
        antes: async page => {
          await page.getByRole('button', { name: /Caso virtual/ }).click();
          await page.waitForTimeout(800);
          await page.getByRole('button', { name: /Calcular riesgo/ }).click();
          await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
          // El aviso flotante de SweetAlert dura 3 s.
          await page.locator('.swal2-container').waitFor({ state: 'detached', timeout: 8000 }).catch(() => {});
          // La app desliza hasta el resultado con scroll suave; se deja terminar y se fija la posición.
          await page.waitForTimeout(1000);
          await page.evaluate(() => {
            const r = document.querySelector('.ps-card[style*="scroll-margin-top"]');
            window.scrollTo({ top: r.getBoundingClientRect().top + scrollY - 96, behavior: 'instant' });
          });
        },
      },
      { titulo: 'Métricas en vivo: leaderboard y calibración', ruta: '/metricas' },
      {
        titulo: 'Laboratorio de datos sintéticos',
        ruta: '/laboratorio',
        antes: async page => {
          await page.getByRole('button', { name: /Generar Paciente Sintético/ }).click();
          const evaluar = page.getByRole('button', { name: /Evaluar este paciente/ });
          await evaluar.waitFor({ timeout: 15000 });
          await evaluar.click();
          await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
          await page.locator('.swal2-container').waitFor({ state: 'detached', timeout: 8000 }).catch(() => {});
          await page.waitForTimeout(1000);
          // Encuadre: el final de la ficha del paciente y, debajo, su evaluación con SHAP.
          await page.evaluate(() => {
            const b = [...document.querySelectorAll('button')].find(x => /Evaluar este paciente/.test(x.textContent));
            window.scrollTo({ top: b.getBoundingClientRect().top + scrollY - 200, behavior: 'instant' });
          });
        },
      },
    ],
  },

  saas: {
    base: process.env.GONDOFY_URL ?? 'http://localhost:5174',
    tema: true,
    fecha: '2026-11-19T15:00:00-05:00',
    // El panel lee su tema de localStorage['admin-theme'].
    alIniciar: modo => { localStorage.setItem('admin-theme', modo); },
    // El catálogo usa el modo que eligió la tienda (body.light-mode), así que se fuerza al final.
    forzarTema: async (page, modo) => {
      await page.evaluate(m => {
        if (!location.pathname.startsWith('/dashboard')) document.body.classList.toggle('light-mode', m === 'light');
      }, modo);
    },
    login: async (page, base, { email, password }) => {
      await page.goto(base + '/login');
      await page.fill('#email', email);
      await page.fill('#password', password);
      await page.click('button[type="submit"]');
      await page.waitForURL('**/dashboard**', { timeout: 20000 });
    },
    tomas: [
      { titulo: 'Catálogo público con filtros y carrito', ruta: `/${SLUG}`, esperar: '.product-card, [class*="product"]' },
      { titulo: 'Ficha de producto: pedido por WhatsApp', ruta: `/${SLUG}/product/01a1f48b-d709-7370-84e8-28c9a3c2f276` },
      { titulo: 'Panel de administración', ruta: '/dashboard', sesion: true },
      { titulo: 'Armador de PC con compatibilidad', ruta: `/${SLUG}/builder?${ARMADO}` },
    ],
  },
};
