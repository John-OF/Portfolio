// Genera capturas placeholder (SVG) para los carruseles de proyectos.
// Uso: node tools/make-placeholders.mjs
// Reemplaza luego cada archivo por una captura real (PNG/JPG/WebP) y
// actualiza las rutas en js/config.js.

import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const W = 1200, H = 750;

// ---------- primitivas ----------
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const rect = (x, y, w, h, fill, r = 8, extra = '') =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" ${extra}/>`;
const line = (x1, y1, x2, y2, stroke, sw = 2) =>
  `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${sw}"/>`;
const txt = (x, y, s, size, fill, extra = '') =>
  `<text x="${x}" y="${y}" font-family="Consolas,Menlo,monospace" font-size="${size}" fill="${fill}" ${extra}>${esc(s)}</text>`;

// líneas de "texto" simulado
function lines(x, y, w, n, t, gap = 22, h = 9) {
  let out = '', widths = [1, .82, .93, .6, .88, .72, .97, .5];
  for (let i = 0; i < n; i++) out += rect(x, y + i * gap, w * widths[i % widths.length], h, t.soft, 4);
  return out;
}
// campos de formulario
function fields(x, y, w, n, t, gap = 58) {
  let out = '';
  for (let i = 0; i < n; i++) {
    out += rect(x, y + i * gap, w * .34, 9, t.soft, 4);
    out += rect(x, y + i * gap + 16, w, 30, t.panel, 6, `stroke="${t.line}"`);
  }
  return out;
}
// barras de gráfico
function bars(x, y, w, h, vals, color, t) {
  const bw = w / vals.length * .62, step = w / vals.length;
  let out = line(x, y + h, x + w, y + h, t.line, 2);
  vals.forEach((v, i) => { out += rect(x + i * step + (step - bw) / 2, y + h - h * v, bw, h * v, color, 3); });
  return out;
}
// barras horizontales (SHAP)
function hbars(x, y, w, vals, color, t, gap = 30) {
  let out = '';
  vals.forEach((v, i) => {
    out += rect(x, y + i * gap, 70, 9, t.soft, 4);
    out += rect(x + 84, y + i * gap, (w - 84) * v, 12, i === 0 ? color : t.soft2, 4);
  });
  return out;
}
// medidor semicircular
function gauge(cx, cy, r, frac, color, t) {
  const a = Math.PI * (1 - frac), x2 = cx + r * Math.cos(a), y2 = cy - r * Math.sin(a);
  const large = frac > .5 ? 1 : 0;
  return `<path d="M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}" fill="none" stroke="${t.line}" stroke-width="14" stroke-linecap="round"/>` +
    `<path d="M ${cx - r} ${cy} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}" fill="none" stroke="${color}" stroke-width="14" stroke-linecap="round"/>` +
    txt(cx, cy - 8, Math.round(frac * 100) + '%', 34, color, 'text-anchor="middle" font-weight="700"');
}
// filas de tabla
function tableRows(x, y, w, n, t, accent = null, gap = 40) {
  let out = rect(x, y, w, 30, t.soft2, 6);
  for (let i = 0; i < n; i++) {
    const ry = y + 42 + i * gap;
    out += line(x, ry + 28, x + w, ry + 28, t.line, 1);
    out += rect(x + 12, ry + 8, w * .2, 9, t.soft, 4);
    out += rect(x + w * .3, ry + 8, w * .16, 9, t.soft, 4);
    out += rect(x + w * .54, ry + 8, w * .1, 9, t.soft, 4);
    out += rect(x + w * .72, ry + 6, 54, 14, (accent && i === 1) ? accent + '33' : t.soft2, 7);
  }
  return out;
}
// tarjetas en grilla
function cardGrid(x, y, w, cols, rows, t, accent, ch = 150, gap = 18) {
  const cw = (w - gap * (cols - 1)) / cols;
  let out = '';
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const cx = x + c * (cw + gap), cy = y + r * (ch + gap);
    out += rect(cx, cy, cw, ch, t.panel, 8, `stroke="${t.line}"`);
    out += rect(cx + 12, cy + 12, cw - 24, ch * .45, t.soft2, 6);
    out += rect(cx + 12, cy + ch * .45 + 24, cw * .62, 9, t.soft, 4);
    out += rect(cx + 12, cy + ch * .45 + 42, cw * .34, 11, accent, 4);
  }
  return out;
}
// forma de onda
function waveform(x, y, w, h, color) {
  let out = '';
  const n = 64, bw = w / n * .55;
  for (let i = 0; i < n; i++) {
    const v = (Math.sin(i * .55) * .4 + Math.sin(i * .21 + 2) * .35 + .5) * .5 + .25;
    out += rect(x + i * (w / n), y + h / 2 - h * v / 2, bw, h * v, color, 2);
  }
  return out;
}
// mapa de calor
function heatmap(x, y, size, n, t, accent) {
  const c = size / n; let out = '';
  for (let r = 0; r < n; r++) for (let col = 0; col < n; col++) {
    const v = Math.abs(Math.sin(r * 1.7 + col * 2.3));
    const op = (0.12 + v * 0.8).toFixed(2);
    out += `<rect x="${x + col * c}" y="${y + r * c}" width="${c - 2}" height="${c - 2}" rx="2" fill="${accent}" opacity="${op}"/>`;
  }
  return out;
}
// marco navegador
function chrome(t, urlLabel) {
  return rect(0, 0, W, 54, t.chrome, 0) +
    `<circle cx="28" cy="27" r="6" fill="${t.soft}"/><circle cx="50" cy="27" r="6" fill="${t.soft}"/><circle cx="72" cy="27" r="6" fill="${t.soft}"/>` +
    rect(120, 14, 620, 26, t.panel, 13, `stroke="${t.line}"`) +
    txt(140, 32, urlLabel, 14, t.mut) + line(0, 54, W, 54, t.line, 1);
}
function note(t) {
  return txt(W - 24, H - 20, 'CAPTURA PENDIENTE - reemplaza este archivo', 13, t.mut, 'text-anchor="end" opacity="0.85"');
}
function wrap(t, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" font-family="sans-serif">` +
    rect(0, 0, W, H, t.bg, 0) + body + note(t) + `</svg>`;
}

// ---------- temas por proyecto ----------
const light = { bg: '#f5f2ea', chrome: '#eae5d8', panel: '#fdfbf5', line: '#d9d2c2', soft: '#cfc7b4', soft2: '#e6e0d1', mut: '#8d8574' };
const dark = { bg: '#17151a', chrome: '#211e26', panel: '#211e26', line: '#37333f', soft: '#4a4556', soft2: '#2c2933', mut: '#7a7488' };
const T = {
  predisana: { ...light, a: '#1f8a80' },
  saas: { ...light, a: '#2456d6' },
  mediora: { ...dark, a: '#e0862c' },
  unity: { ...dark, a: '#c8503c' },
  poemario: { ...light, bg: '#f6efe1', a: '#8a6d3b' },
  bitacora: { ...light, a: '#4c7a3f' },
};

// ---------- capturas ----------
const shots = {
  predisana: [
    t => chrome(t, 'predisana.app') +
      txt(90, 150, 'PREDISANA', 16, t.a, 'letter-spacing="4"') +
      rect(90, 180, 560, 22, t.soft, 5) + rect(90, 216, 470, 22, t.soft, 5) +
      lines(90, 280, 420, 3, t) +
      rect(90, 380, 170, 44, t.a, 8) + rect(276, 380, 170, 44, t.panel, 8, `stroke="${t.line}"`) +
      [0, 1, 2].map(i => rect(700, 120 + i * 120, 400, 96, t.panel, 10, `stroke="${t.line}"`) +
        txt(724, 158 + i * 120, '0' + (i + 1), 26, t.a, 'font-weight="700"') +
        rect(770, 146 + i * 120, 260, 9, t.soft, 4) + rect(770, 166 + i * 120, 200, 9, t.soft, 4)).join('') +
      rect(90, 500, 1010, 180, t.panel, 12, `stroke="${t.line}"`) +
      txt(120, 545, 'DIABETES', 13, t.mut) + txt(320, 545, 'HIPERTENSION', 13, t.mut) + txt(560, 545, 'CARDIOVASCULAR', 13, t.mut) +
      bars(120, 570, 900, 90, [.5, .72, .38, .8, .55, .66, .42], t.a, t),
    t => chrome(t, 'predisana.app/simulacion') +
      txt(90, 120, 'SIMULADOR DE RIESGO', 14, t.mut, 'letter-spacing="3"') +
      fields(90, 160, 420, 6, t) +
      rect(90, 542, 190, 46, t.a, 8) +
      rect(600, 120, 510, 300, t.panel, 12, `stroke="${t.line}"`) +
      gauge(855, 330, 130, .72, t.a, t) + txt(855, 370, 'riesgo estimado', 14, t.mut, 'text-anchor="middle"') +
      rect(600, 450, 510, 240, t.panel, 12, `stroke="${t.line}"`) +
      txt(624, 488, 'IMPACTO POR VARIABLE (SHAP)', 13, t.mut) +
      hbars(624, 510, 460, [.9, .7, .55, .4, .28], t.a, t),
    t => chrome(t, 'predisana.app/metricas') +
      txt(90, 120, 'METRICAS EN VIVO', 14, t.mut, 'letter-spacing="3"') +
      tableRows(90, 150, 500, 4, t, t.a) +
      txt(90, 400, 'AUC 0.90', 42, t.a, 'font-weight="700"') + txt(90, 432, 'diabetes con glucosa - LightGBM', 14, t.mut) +
      rect(660, 120, 450, 340, t.panel, 12, `stroke="${t.line}"`) +
      txt(684, 158, 'CURVA DE CALIBRACION', 13, t.mut) +
      line(700, 420, 1070, 180, t.soft, 2) +
      `<path d="M 700 420 C 800 390 900 300 1070 190" fill="none" stroke="${t.a}" stroke-width="4"/>` +
      rect(90, 500, 1020, 180, t.panel, 12, `stroke="${t.line}"`) +
      bars(120, 530, 950, 110, [.3, .5, .45, .7, .62, .8, .74, .9], t.a, t),
    t => chrome(t, 'predisana.app/proyecto') +
      txt(90, 120, 'LABORATORIO DE DATOS SINTETICOS', 14, t.mut, 'letter-spacing="3"') +
      [0, 1, 2, 3].map(i => rect(90 + i * 150, 145, 138, 34, i === 1 ? t.a : t.panel, 17, `stroke="${t.line}"`)).join('') +
      rect(90, 210, 490, 460, t.panel, 12, `stroke="${t.line}"`) +
      txt(114, 248, 'REAL', 13, t.mut) + heatmap(114, 270, 360, 8, t, t.a) +
      rect(620, 210, 490, 460, t.panel, 12, `stroke="${t.line}"`) +
      txt(644, 248, 'SINTETICO (CTGAN)', 13, t.mut) + heatmap(644, 270, 360, 8, t, t.a),
  ],
  saas: [
    t => chrome(t, 'mitienda.catalogo.app') +
      rect(0, 55, W, 120, t.a, 0) + txt(90, 125, 'PC STORE', 26, '#ffffff', 'font-weight="700" letter-spacing="3"') +
      rect(850, 100, 130, 36, '#ffffff22', 18) + rect(90, 200, 380, 40, t.panel, 20, `stroke="${t.line}"`) +
      [0, 1, 2, 3].map(i => rect(500 + i * 130, 202, 116, 36, t.panel, 18, `stroke="${t.line}"`)).join('') +
      cardGrid(90, 270, 1020, 4, 2, t, t.a, 190),
    t => chrome(t, 'mitienda.catalogo.app/product') +
      rect(90, 110, 480, 380, t.soft2, 12) +
      [0, 1, 2, 3].map(i => rect(90 + i * 124, 510, 110, 84, t.panel, 8, `stroke="${t.line}"`)).join('') +
      rect(640, 120, 470, 24, t.soft, 5) + rect(640, 160, 340, 24, t.soft, 5) +
      txt(640, 240, '$ 589.99', 38, t.a, 'font-weight="700"') +
      lines(640, 280, 440, 4, t) +
      rect(640, 420, 220, 50, '#22a15b', 10) + txt(672, 452, 'Pedir por WhatsApp', 16, '#ffffff') +
      rect(640, 520, 470, 150, t.panel, 10, `stroke="${t.line}"`) + txt(664, 552, 'ESPECIFICACIONES', 13, t.mut) + lines(664, 575, 400, 3, t),
    t => chrome(t, 'mitienda.catalogo.app/dashboard') +
      rect(0, 55, 250, H - 55, t.chrome, 0) + lines(30, 110, 180, 8, t, 46, 11) +
      txt(290, 120, 'PRODUCTOS', 20, t.a, 'font-weight="700" letter-spacing="2"') +
      rect(940, 92, 170, 42, t.a, 8) +
      tableRows(290, 160, 820, 6, t, t.a, 48) +
      [0, 1, 2].map(i => rect(290 + i * 290, 560, 260, 110, t.panel, 12, `stroke="${t.line}"`) +
        txt(316 + i * 290, 615, ['128', '46', '9'][i], 34, t.a, 'font-weight="700"') +
        rect(316 + i * 290, 636, 150, 9, t.soft, 4)).join(''),
    t => chrome(t, 'mitienda.catalogo.app/builder') +
      txt(90, 120, 'ARMA TU PC', 20, t.a, 'font-weight="700" letter-spacing="2"') +
      [0, 1, 2, 3, 4].map(i => rect(90, 150 + i * 92, 640, 76, t.panel, 10, `stroke="${t.line}"`) +
        rect(110, 168 + i * 92, 40, 40, t.soft2, 8) +
        rect(170, 172 + i * 92, 220, 11, t.soft, 4) + rect(170, 194 + i * 92, 150, 9, t.soft, 4) +
        `<circle cx="690" cy="${188 + i * 92}" r="11" fill="${i === 3 ? '#c0392b' : '#22a15b'}"/>`).join('') +
      rect(770, 150, 340, 350, t.panel, 12, `stroke="${t.line}"`) +
      txt(794, 188, 'COMPATIBILIDAD', 13, t.mut) + lines(794, 215, 280, 5, t) +
      txt(794, 460, 'TOTAL  $ 1,240', 22, t.a, 'font-weight="700"'),
  ],
  mediora: [
    t => chrome(t, 'mediora.local/descargar') +
      txt(90, 140, 'MEDIORA', 18, t.a, 'letter-spacing="6" font-weight="700"') +
      rect(90, 180, 780, 52, t.panel, 26, `stroke="${t.line}"`) +
      txt(120, 212, 'https://www.youtube.com/watch?v=...', 16, t.mut) +
      rect(890, 180, 220, 52, t.a, 26) + txt(1000, 212, 'Analizar', 17, '#17151a', 'text-anchor="middle" font-weight="700"') +
      [0, 1, 2, 3].map(i => rect(90 + i * 200, 270, 184, 42, i === 0 ? t.a + '33' : t.panel, 21, `stroke="${i === 0 ? t.a : t.line}"`)).join('') +
      rect(90, 350, 1020, 320, t.panel, 12, `stroke="${t.line}"`) +
      rect(120, 380, 400, 260, t.soft2, 8) +
      `<path d="M 300 480 l 52 30 -52 30 z" fill="${t.a}"/>` +
      lines(560, 395, 480, 3, t) +
      [0, 1, 2].map(i => rect(560 + i * 165, 490, 150, 36, t.soft2, 18)).join('') +
      rect(560, 560, 520, 46, t.a, 8),
    t => chrome(t, 'mediora.local/descargar') +
      rect(90, 110, 1020, 130, t.panel, 12, `stroke="${t.line}"`) +
      txt(120, 155, 'DESCARGANDO - youtube', 13, t.mut) +
      rect(120, 175, 960, 14, t.soft2, 7) + rect(120, 175, 640, 14, t.a, 7) +
      txt(1080, 165, '67%', 22, t.a, 'text-anchor="end" font-weight="700"') +
      txt(120, 220, 'etapa: yt-dlp -> ffmpeg -> demucs', 14, t.mut) +
      rect(90, 280, 1020, 90, t.panel, 12, `stroke="${t.line}"`) +
      txt(120, 318, 'EN COLA (POSICION 2)', 13, t.mut) + rect(120, 335, 420, 10, t.soft2, 5) +
      rect(90, 410, 1020, 260, t.panel, 12, `stroke="${t.line}"`) +
      txt(120, 450, 'SEPARACION DE VOZ / INSTRUMENTAL (DEMUCS)', 13, t.mut) +
      waveform(120, 480, 960, 70, t.a) + waveform(120, 570, 960, 70, t.soft),
    t => chrome(t, 'mediora.local/convertir') +
      rect(90, 120, 1020, 300, t.panel, 12, `stroke="${t.line} " stroke-dasharray="10 8"`) +
      txt(600, 250, 'Arrastra tu archivo aqui', 22, t.mut, 'text-anchor="middle"') +
      txt(600, 290, 'mp3 - wav - flac - m4a - mp4 - webm - mkv', 15, t.mut, 'text-anchor="middle"') +
      [0, 1, 2, 3, 4].map(i => rect(220 + i * 160, 470, 144, 46, i === 2 ? t.a : t.panel, 23, `stroke="${i === 2 ? t.a : t.line}"`)).join('') +
      rect(470, 570, 260, 52, t.a, 26) + txt(600, 603, 'Convertir', 17, '#17151a', 'text-anchor="middle" font-weight="700"'),
    t => chrome(t, 'mediora.local') +
      rect(90, 120, 620, 420, t.soft2, 12) +
      `<path d="M 360 300 l 70 40 -70 40 z" fill="${t.a}"/>` +
      rect(120, 570, 560, 12, t.soft, 6) + rect(120, 570, 350, 12, t.a, 6) +
      rect(760, 120, 350, 550, t.panel, 12, `stroke="${t.line}"`) +
      txt(784, 158, 'METADATOS ID3', 13, t.mut) + fields(784, 185, 300, 3, t) +
      txt(784, 420, 'EFECTO ASMR', 13, t.mut) +
      rect(784, 440, 60, 30, t.a, 15) + `<circle cx="828" cy="455" r="11" fill="#17151a"/>` +
      waveform(784, 500, 300, 60, t.a),
  ],
  unity: [
    t => chrome(t, 'build/arena.exe') +
      rect(0, 55, W, H - 55, '#100f13', 0) +
      `<path d="M 0 600 L 1200 560 L 1200 750 L 0 750 Z" fill="#1c1a21"/>` +
      [0, 1, 2, 3, 4, 5].map(i => line(i * 240, 750, 500 + i * 60, 560, '#26232d', 1)).join('') +
      rect(300, 430, 46, 120, t.a, 6) + `<circle cx="323" cy="410" r="24" fill="${t.a}"/>` +
      rect(346, 470, 70, 14, '#e8e2d2', 4) +
      rect(820, 450, 46, 110, '#5a7fb8', 6) + `<circle cx="843" cy="430" r="24" fill="#5a7fb8"/>` +
      rect(60, 90, 300, 22, '#2c2933', 6) + rect(60, 90, 210, 22, '#3fae62', 6) +
      rect(840, 90, 300, 22, '#2c2933', 6) + rect(840, 90, 120, 22, '#c0392b', 6) +
      txt(60, 145, 'HP 70/100', 15, '#8d8574') + txt(1140, 145, 'HP 40/100', 15, '#8d8574', 'text-anchor="end"') +
      txt(600, 680, 'ARENA - PARTIDA 2/3', 14, '#7a7488', 'text-anchor="middle" letter-spacing="4"'),
    t => chrome(t, 'build/arena.exe - creacion de personaje') +
      rect(90, 110, 480, 560, '#100f13', 12) +
      rect(280, 300, 60, 170, t.a, 8) + `<circle cx="310" cy="270" r="34" fill="${t.a}"/>` +
      rect(240, 330, 40, 100, t.a + '99', 8) + rect(340, 330, 40, 100, t.a + '99', 8) +
      txt(310, 640, 'VISTA PREVIA', 13, '#7a7488', 'text-anchor="middle" letter-spacing="3"') +
      txt(640, 150, 'CREACION DE PERSONAJE', 16, t.a, 'letter-spacing="3" font-weight="700"') +
      [0, 1, 2, 3, 4].map(i => txt(640, 205 + i * 80, ['CUERPO', 'CABEZA', 'ARMA', 'COLOR', 'EMBLEMA'][i], 12, '#7a7488') +
        rect(640, 220 + i * 80, 380, 34, t.panel, 8, `stroke="${t.line}"`) +
        rect(1040, 220 + i * 80, 34, 34, t.soft2, 8) + rect(600, 220 + i * 80, 34, 34, t.soft2, 8)).join('') +
      rect(640, 610, 200, 48, t.a, 10),
    t => chrome(t, 'build/arena.exe - lobby') +
      rect(0, 55, W, H - 55, '#100f13', 0) +
      txt(600, 140, 'LOBBY MULTIJUGADOR', 24, t.a, 'text-anchor="middle" letter-spacing="6" font-weight="700"') +
      [0, 1, 2, 3].map(i => rect(180 + i * 230, 200, 210, 260, t.panel, 12, `stroke="${i === 0 ? t.a : t.line}"`) +
        `<circle cx="${285 + i * 230}" cy="280" r="30" fill="${['#c8503c', '#5a7fb8', '#3fae62', '#2c2933'][i]}"/>` +
        rect(205 + i * 230, 330, 160, 60, '#17151a', 8) +
        rect(230 + i * 230, 410, 110, 26, i < 3 ? '#3fae62' : t.soft2, 13)).join('') +
      rect(430, 530, 340, 60, t.a, 12) + txt(600, 568, 'INICIAR PARTIDA', 18, '#100f13', 'text-anchor="middle" font-weight="700"') +
      txt(600, 650, '3 / 4 JUGADORES LISTOS', 14, '#7a7488', 'text-anchor="middle" letter-spacing="3"'),
    t => chrome(t, 'build/arena.exe') +
      rect(0, 55, W, H - 55, '#100f13', 0) +
      txt(600, 300, 'HAS CAIDO', 40, t.a, 'text-anchor="middle" letter-spacing="10" font-weight="700"') +
      txt(600, 360, 'reapareciendo en 3...', 18, '#8d8574', 'text-anchor="middle"') +
      rect(450, 400, 300, 10, '#2c2933', 5) + rect(450, 400, 190, 10, t.a, 5) +
      rect(60, 520, 330, 150, '#17151acc', 10) +
      txt(84, 555, 'P2  elimino a  P1', 15, '#8d8574') +
      txt(84, 585, 'P3  bloqueo el ataque de  P4', 15, '#8d8574') +
      txt(84, 615, 'P1  reaparecio', 15, '#3fae62'),
  ],
  poemario: [
    t => chrome(t, 'poemario.local') +
      txt(600, 150, 'POEMARIO', 30, '#3b332a', 'text-anchor="middle" letter-spacing="12" font-weight="700"') +
      line(500, 175, 700, 175, t.a, 2) +
      rect(390, 210, 420, 40, t.panel, 20, `stroke="${t.line}"`) +
      [0, 1, 2].map(i => rect(120 + i * 340, 290, 300, 360, t.panel, 4, `stroke="${t.line}"`) +
        txt(140 + i * 340, 335, ['I', 'II', 'III'][i], 22, t.a, 'font-style="italic"') +
        rect(140 + i * 340, 360, 200, 13, t.soft, 4) +
        lines(140 + i * 340, 395, 250, 6, t, 26, 8) +
        line(140 + i * 340, 590, 400 + i * 340, 590, t.line, 1) +
        rect(140 + i * 340, 610, 90, 9, t.soft, 4)).join(''),
    t => chrome(t, 'poemario.local/poemas/vigilia') +
      rect(280, 100, 640, 570, t.panel, 4, `stroke="${t.line}"`) +
      txt(600, 170, 'VIGILIA', 26, '#3b332a', 'text-anchor="middle" letter-spacing="8" font-weight="700"') +
      txt(600, 200, 'no. XII', 15, t.a, 'text-anchor="middle" font-style="italic"') +
      lines(400, 240, 400, 9, t, 30, 8) +
      line(400, 530, 800, 530, t.line, 1) +
      txt(400, 570, 'COMENTARIOS (3)', 12, t.mut, 'letter-spacing="2"') +
      lines(400, 590, 400, 2, t, 24, 8),
    t => chrome(t, 'poemario.local/admin') +
      rect(0, 55, 230, H - 55, t.chrome, 0) + lines(28, 110, 170, 6, t, 48, 11) +
      txt(270, 125, 'TALLER DEL AUTOR', 16, '#3b332a', 'letter-spacing="3" font-weight="700"') +
      [0, 1, 2, 3].map(i => rect(270 + i * 215, 155, 195, 100, t.panel, 8, `stroke="${t.line}"`) +
        txt(292 + i * 215, 208, ['24', '6', '48', '5'][i], 30, t.a, 'font-weight="700"') +
        rect(292 + i * 215, 226, 120, 9, t.soft, 4)).join('') +
      tableRows(270, 290, 840, 6, t, t.a, 46) +
      rect(960, 155, 150, 40, t.a, 8),
    t => chrome(t, 'poemario.local/admin/poemas') +
      txt(90, 125, 'EDITOR', 16, '#3b332a', 'letter-spacing="3" font-weight="700"') +
      rect(90, 150, 620, 480, t.panel, 8, `stroke="${t.line}"`) +
      rect(114, 175, 300, 30, t.soft2, 6) +
      lines(114, 235, 540, 10, t, 32, 8) +
      rect(760, 150, 350, 220, t.panel, 8, `stroke="${t.line}"`) +
      txt(784, 188, 'PUBLICACION', 12, t.mut, 'letter-spacing="2"') +
      rect(784, 210, 60, 30, t.a, 15) + `<circle cx="828" cy="225" r="11" fill="${t.panel}"/>` +
      fields(784, 260, 300, 1, t) +
      rect(784, 330, 130, 9, t.soft, 4) +
      rect(760, 400, 350, 230, t.panel, 8, `stroke="${t.line}"`) +
      txt(784, 438, 'ETIQUETAS', 12, t.mut, 'letter-spacing="2"') +
      [0, 1, 2].map(i => rect(784 + i * 105, 455, 92, 30, t.soft2, 15)).join(''),
  ],
  bitacora: [
    t => phone(t, 'REGISTRO DIARIO',
      fields(0, 0, 300, 4, t, 64) +
      rect(0, 260, 300, 58, t.panel, 10, `stroke="${t.a}" stroke-width="2"`) +
      txt(16, 296, 'QUEDAN: 128', 20, t.a, 'font-weight="700"') +
      rect(0, 340, 300, 52, t.a, 10) + txt(150, 372, 'Guardar', 17, '#ffffff', 'text-anchor="middle" font-weight="700"')),
    t => phone(t, 'HISTORIAL',
      [0, 1, 2, 3, 4].map(i => rect(0, i * 78, 300, 64, t.panel, 10, `stroke="${t.line}"`) +
        rect(14, i * 78 + 14, 140, 10, t.soft, 4) + rect(14, i * 78 + 36, 90, 9, t.soft, 4) +
        txt(286, i * 78 + 40, ['+40', '-15', '+120', '-8', '+22'][i], 16, i % 2 ? '#b3402a' : '#3f7a46', 'text-anchor="end" font-weight="700"')).join('')),
    t => phone(t, 'PRODUCTOS',
      [0, 1, 2, 3].map(i => rect(0, i * 92, 300, 76, t.panel, 10, `stroke="${t.line}"`) +
        rect(14, i * 92 + 16, 160, 11, t.soft, 4) +
        rect(14, i * 92 + 42, 80, 20, t.a + '26', 10) +
        txt(24, i * 92 + 56, 'lote A' + (i + 2), 11, t.a)).join('') +
      rect(240, 320, 60, 60, t.a, 30) + txt(270, 358, '+', 30, '#ffffff', 'text-anchor="middle"')),
    t => chrome(t, 'bitacora.pages.dev/historial') +
      txt(90, 125, 'EXPORTAR RESPALDO', 16, t.a, 'letter-spacing="3" font-weight="700"') +
      tableRows(90, 155, 700, 6, t, t.a, 46) +
      rect(850, 155, 260, 170, t.panel, 10, `stroke="${t.line}"`) +
      txt(874, 195, 'CSV', 30, '#3f7a46', 'font-weight="700"') +
      rect(874, 220, 180, 9, t.soft, 4) + rect(874, 240, 140, 9, t.soft, 4) +
      rect(874, 272, 200, 40, t.a, 8) +
      txt(90, 480, 'EXISTENCIA ACTUAL', 13, t.mut, 'letter-spacing="2"') +
      bars(90, 500, 1020, 160, [.6, .35, .8, .5, .28, .7, .44, .9, .61], t.a, t),
  ],
};

// marco de teléfono para bitácora
function phone(t, title, inner) {
  const px = (W - 380) / 2, py = 40;
  return rect(0, 0, W, H, t.bg, 0) +
    rect(px, py, 380, H - 80, '#2b2823', 34) +
    rect(px + 14, py + 14, 352, H - 108, t.panel, 24) +
    rect(px + 150, py + 26, 80, 10, '#2b2823', 5) +
    txt(px + 40, py + 84, title, 15, t.a, 'letter-spacing="3" font-weight="700"') +
    `<g transform="translate(${px + 40},${py + 110})">` + inner + `</g>`;
}

// ---------- generación ----------
let count = 0;
for (const [proj, list] of Object.entries(shots)) {
  const dir = join(ROOT, 'assets', 'shots', proj);
  mkdirSync(dir, { recursive: true });
  list.forEach((fn, i) => {
    const t = T[proj];
    writeFileSync(join(dir, `0${i + 1}.svg`), wrap(t, fn(t)));
    count++;
  });
}
console.log(`Generadas ${count} capturas placeholder en assets/shots/`);
