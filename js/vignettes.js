/* ============================================================
   VIÑETAS ANIMADAS
   Pequeñas demos dibujadas a mano (SVG + canvas, sin librerías):
   - hero:      esquema interfaz → api → datos
   - predisana: cerebro → formulario → probabilidad
   - mediora:   URL → pipeline → archivo de audio
   - unity:     personaje que dispara: daño, K.O. y respawn
   - saas:      catálogo → carrito → pedido por WhatsApp
   - poemario:  un verso que se escribe entre el día y la noche
   - bitacora:  entradas, salidas y una alerta de stock

   Nota: los colores con var(--token) se asignan vía style.*
   (los atributos de presentación SVG no resuelven var()).
   ============================================================ */
(function () {
  "use strict";

  const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clamp01 = x => Math.max(0, Math.min(1, x));
  const seg = (t, a, b) => clamp01((t - a) / (b - a));
  const eo = x => 1 - Math.pow(1 - x, 3);              // ease-out
  const eio = x => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  const lerp = (a, b, x) => a + (b - a) * x;

  const INK = "var(--ink)", MUT = "var(--mut)", LINE = "var(--line)",
        BG = "var(--bg)", SOFT = "var(--soft)";

  const st = (el, props) => { for (const k in props) el.style[k] = props[k]; };
  const cssVar = name =>
    getComputedStyle(document.documentElement).getPropertyValue(name).trim();

  function hex2rgb(h) {
    h = h.replace("#", "");
    if (h.length === 3) h = h.split("").map(c => c + c).join("");
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }
  function mix(c1, c2, x) {
    const a = hex2rgb(c1), b = hex2rgb(c2);
    return "rgb(" + Math.round(lerp(a[0], b[0], x)) + "," +
      Math.round(lerp(a[1], b[1], x)) + "," + Math.round(lerp(a[2], b[2], x)) + ")";
  }
  const T = path => (window.joT ? window.joT("vig." + path) : "");
  const typed = (full, p) => full.slice(0, Math.round(full.length * clamp01(p)));

  /* ============ 1. HERO: interfaz → api → datos ============ */
  function vigHero(stage, accent) {
    stage.innerHTML =
      '<svg class="vg" viewBox="0 0 380 190" aria-hidden="true">' +
      '<line class="wire" x1="118" y1="86" x2="148" y2="86"/>' +
      '<line class="wire" x1="266" y1="86" x2="296" y2="86"/>' +
      '<g class="nd" data-n="0"><rect x="28" y="58" width="90" height="56" rx="3"/><text class="vg-mono nd-t" x="73" y="90"></text></g>' +
      '<g class="nd" data-n="1"><rect x="148" y="58" width="118" height="56" rx="3"/><text class="vg-mono nd-t" x="207" y="90"></text></g>' +
      '<g class="nd" data-n="2"><path d="M296 66 v40 a28 8 0 0 0 56 0 v-40"/><ellipse cx="324" cy="66" rx="28" ry="8"/><text class="vg-mono nd-t" x="324" y="94"></text></g>' +
      '<text class="vg-mono anno" x="133" y="50" text-anchor="middle"></text>' +
      '<text class="vg-mono anno anno2" x="207" y="158" text-anchor="middle"></text>' +
      '<path class="ret" d="M324 122 v22 H73 v-24" fill="none"/>' +
      '<rect class="pkt" x="-8" y="82" width="7" height="7"/>' +
      '<circle class="pkt2" r="4" cx="-8" cy="144"/>' +
      "</svg>";

    const svg = stage.firstChild;
    svg.querySelectorAll(".nd rect, .nd path, .nd ellipse").forEach(el =>
      st(el, { fill: BG, stroke: INK, strokeWidth: "1.4" }));
    svg.querySelectorAll(".wire").forEach(el =>
      st(el, { stroke: MUT, strokeDasharray: "4 4" }));
    st(svg.querySelector(".ret"), { stroke: MUT, strokeDasharray: "4 4" });
    svg.querySelectorAll(".nd-t").forEach(el => {
      st(el, { fill: INK, fontSize: "11px", letterSpacing: "2px" });
      el.setAttribute("text-anchor", "middle");
    });
    svg.querySelectorAll(".anno").forEach(el => st(el, { fill: MUT, fontSize: "9px" }));
    const pkt = svg.querySelector(".pkt"), pkt2 = svg.querySelector(".pkt2");
    st(pkt, { fill: accent }); st(pkt2, { fill: accent });
    const nodes = svg.querySelectorAll(".nd");
    const labels = svg.querySelectorAll(".nd-t");

    const L = T("hero");
    labels[0].textContent = L.ui; labels[1].textContent = L.api; labels[2].textContent = L.db;
    svg.querySelector(".anno").textContent = L.req + " →";
    svg.querySelector(".anno2").textContent = "← " + L.res;

    const D = 7000;
    function frame(tm) {
      const t = (tm % D) / 1000;
      let x = -20, on = 0;
      if (t < 1.2) { x = lerp(73, 207, eio(seg(t, 0, 1.2))); on = 1; }
      else if (t < 2.4) { x = lerp(207, 324, eio(seg(t, 1.2, 2.4))); on = 1; }
      pkt.setAttribute("x", x - 3.5); pkt.setAttribute("y", 82);
      pkt.setAttribute("opacity", on);

      let o2 = 0, px = 324, py = 144;
      if (t >= 3.0 && t < 4.6) {
        const p = eio(seg(t, 3.0, 4.6));
        o2 = 1;
        if (p < 0.18) { px = 324; py = lerp(122, 144, p / 0.18); }
        else if (p < 0.86) { px = lerp(324, 73, (p - 0.18) / 0.68); py = 144; }
        else { px = 73; py = lerp(144, 120, (p - 0.86) / 0.14); }
      }
      pkt2.setAttribute("cx", px); pkt2.setAttribute("cy", py);
      pkt2.setAttribute("opacity", o2);

      const pulses = [seg(t, 4.5, 4.9), seg(t, 1.1, 1.5), seg(t, 2.3, 2.7)];
      nodes.forEach((nd, i) => {
        const p = pulses[i];
        const glow = p > 0 && p < 1 ? Math.sin(p * Math.PI) : 0;
        nd.querySelectorAll("rect, path, ellipse").forEach(sh =>
          st(sh, {
            stroke: glow > 0.05 ? accent : INK,
            strokeWidth: (1.4 + glow * 1.2).toFixed(2),
          }));
      });
    }
    return { frame, static() { frame(1800); } };
  }

  /* ============ 2. PREDISANA: cerebro → formulario → riesgo ============ */
  const BRAIN =
    "M210 46 c-8 -10 -24 -12 -33 -5 c-10 -8 -26 -5 -31 5 c-11 2 -18 12 -16 22 " +
    "c-8 6 -9 19 -2 26 c-1 10 7 19 17 20 c3 9 14 14 23 11 c6 7 18 8 25 2 " +
    "c10 4 21 0 25 -9 c10 -2 16 -11 14 -20 c7 -8 6 -20 -2 -26 c1 -11 -7 -21 -20 -26 z";
  const FOLDS = [
    "M158 60 c8 6 20 6 28 -1", "M150 84 c10 8 26 8 36 -2",
    "M166 106 c8 6 20 5 28 -2", "M196 52 c-2 12 4 24 2 38 c-2 10 2 18 8 24",
  ];

  function vigPredisana(stage, accent) {
    stage.innerHTML =
      '<svg class="vg" viewBox="0 0 420 180" aria-hidden="true">' +
      '<g class="ph phA">' +
      '<path class="brain" d="' + BRAIN + '"/>' +
      FOLDS.map(d => '<path class="fold" d="' + d + '"/>').join("") +
      "</g>" +
      '<g class="ph phB">' +
      '<rect class="card" x="140" y="34" width="150" height="104" rx="4"/>' +
      [0, 1, 2].map(i =>
        '<g class="frow" data-i="' + i + '">' +
        '<text class="vg-mono flab" x="154" y="' + (60 + i * 30) + '"></text>' +
        '<line class="fline" x1="154" y1="' + (66 + i * 30) + '" x2="252" y2="' + (66 + i * 30) + '"/>' +
        '<text class="vg-mono fval" x="252" y="' + (62 + i * 30) + '" text-anchor="end"></text>' +
        '<path class="ftick" d="M262 ' + (58 + i * 30) + ' l4 5 l8 -9" fill="none"/>' +
        "</g>").join("") +
      "</g>" +
      '<g class="ph phC">' +
      '<path class="garc-bg" d="M150 120 A 60 60 0 0 1 270 120" fill="none"/>' +
      '<path class="garc" d="M150 120 A 60 60 0 0 1 270 120" fill="none"/>' +
      '<text class="vg-serif gnum" x="210" y="112" text-anchor="middle"></text>' +
      '<text class="vg-mono glab" x="210" y="132" text-anchor="middle"></text>' +
      '<g class="shap">' +
      [0, 1, 2].map(i =>
        '<text class="vg-mono slab" x="300" y="' + (66 + i * 26) + '"></text>' +
        '<rect class="sbar" x="300" y="' + (72 + i * 26) + '" height="7" rx="1.5" width="0"/>').join("") +
      "</g></g>" +
      '<g class="steps">' +
      [0, 1, 2].map(i =>
        '<circle class="sdot" cx="' + (150 + i * 60) + '" cy="160" r="3"/>' +
        '<text class="vg-mono stext" x="' + (150 + i * 60) + '" y="174" text-anchor="middle"></text>').join("") +
      '<line class="sline" x1="153" y1="160" x2="267" y2="160"/>' +
      "</svg>";

    const svg = stage.firstChild;
    const q = s => svg.querySelector(s), qq = s => svg.querySelectorAll(s);

    const brain = q(".brain");
    st(brain, { fill: "none", stroke: accent, strokeWidth: "2" });
    const BL = 420; brain.setAttribute("stroke-dasharray", BL);
    qq(".fold").forEach(f => {
      st(f, { fill: "none", stroke: INK, strokeWidth: "1.4" });
      f.setAttribute("stroke-dasharray", "60");
    });
    st(q(".card"), { fill: BG, stroke: INK, strokeWidth: "1.4" });
    qq(".flab").forEach(el => st(el, { fill: MUT, fontSize: "8px" }));
    qq(".fval").forEach(el => st(el, { fill: INK, fontSize: "9px" }));
    qq(".fline").forEach(el => st(el, { stroke: LINE, strokeWidth: "1" }));
    qq(".ftick").forEach(el => {
      st(el, { stroke: accent, strokeWidth: "2" });
      el.setAttribute("stroke-dasharray", "20");
    });
    st(q(".garc-bg"), { stroke: LINE, strokeWidth: "9" });
    const arc = q(".garc");
    st(arc, { stroke: accent, strokeWidth: "9" });
    arc.setAttribute("stroke-linecap", "round");
    const ARCL = 189; arc.setAttribute("stroke-dasharray", ARCL);
    const gnum = q(".gnum"); st(gnum, { fill: INK, fontSize: "30px" });
    const glab = q(".glab"); st(glab, { fill: MUT, fontSize: "8px" });
    qq(".slab").forEach(el => st(el, { fill: MUT, fontSize: "7.5px" }));
    qq(".sbar").forEach(el => st(el, { fill: accent }));
    qq(".sdot").forEach(el => st(el, { fill: "none", stroke: MUT, strokeWidth: "1.4" }));
    qq(".stext").forEach(el => st(el, { fill: MUT, fontSize: "7.5px", letterSpacing: "1px" }));
    st(q(".sline"), { stroke: LINE });

    const L = T("predisana");
    qq(".stext").forEach((el, i) => { el.textContent = L.steps[i]; });
    qq(".flab").forEach((el, i) => { el.textContent = L.fields[i]; });
    glab.textContent = L.risk;
    const VALS = ["54", "132/86", "108 mg/dL"];
    const SH = [[L.fields[2], 0.92], ["imc", 0.58], [L.fields[0], 0.38]];
    qq(".slab").forEach((el, i) => { el.textContent = SH[i][0]; });

    const phA = q(".phA"), phB = q(".phB"), phC = q(".phC");
    const D = 12500;

    function frame(tm) {
      const t = (tm % D) / 1000;
      const aIn = seg(t, 0, 0.4), aDraw = seg(t, 0.2, 2.4), aOut = seg(t, 3.4, 4.1);
      phA.setAttribute("opacity", (aIn * (1 - aOut)).toFixed(2));
      brain.setAttribute("stroke-dashoffset", (BL * (1 - eo(aDraw))).toFixed(1));
      qq(".fold").forEach((f, i) => {
        f.setAttribute("stroke-dashoffset", (60 * (1 - eo(seg(t, 1.2 + i * 0.25, 2.2 + i * 0.25)))).toFixed(1));
      });
      const drift = Math.sin(t * 1.8) * 2;
      phA.setAttribute("transform", "translate(0 " + drift.toFixed(1) + ")");

      const bIn = seg(t, 3.9, 4.5), bOut = seg(t, 7.0, 7.7);
      phB.setAttribute("opacity", (bIn * (1 - bOut)).toFixed(2));
      phB.setAttribute("transform", "translate(0 " + lerp(10, 0, eo(bIn)).toFixed(1) + ")");
      qq(".frow").forEach((row, i) => {
        const p = seg(t, 4.5 + i * 0.55, 5.1 + i * 0.55);
        row.setAttribute("opacity", p > 0 ? 1 : 0);
        row.querySelector(".fval").textContent = typed(VALS[i], p);
        row.querySelector(".ftick").setAttribute("stroke-dashoffset",
          (20 * (1 - eo(seg(t, 5.0 + i * 0.55, 5.4 + i * 0.55)))).toFixed(1));
      });

      const cIn = seg(t, 7.4, 8.0), cOut = seg(t, 11.7, 12.4);
      phC.setAttribute("opacity", (cIn * (1 - cOut)).toFixed(2));
      const sweep = eo(seg(t, 7.8, 9.4)) * 0.72;
      arc.setAttribute("stroke-dashoffset", (ARCL * (1 - sweep)).toFixed(1));
      gnum.textContent = Math.round(sweep * 100) + "%";
      qq(".sbar").forEach((b, i) => {
        b.setAttribute("width", (78 * SH[i][1] * eo(seg(t, 8.6 + i * 0.3, 9.5 + i * 0.3))).toFixed(1));
      });

      const active = t < 4 ? 0 : t < 7.5 ? 1 : 2;
      qq(".sdot").forEach((d, i) => st(d, {
        fill: i <= active ? accent : "none",
        stroke: i <= active ? accent : MUT,
      }));
      qq(".stext").forEach((s, i) => st(s, { fill: i === active ? accent : MUT }));
    }
    return { frame, static() { frame(9800); } };
  }

  /* ============ 3. MEDIORA: URL → pipeline → archivo ============ */
  function vigMediora(stage, accent) {
    const L = T("mediora");
    stage.innerHTML =
      '<svg class="vg" viewBox="0 0 420 180" aria-hidden="true">' +
      '<g class="urlg">' +
      '<rect class="pill" x="30" y="18" width="250" height="26" rx="13"/>' +
      '<text class="vg-mono utext" x="46" y="35"></text>' +
      '<rect class="caret" x="46" y="24" width="5" height="13"/>' +
      "</g>" +
      '<g class="pipe">' +
      [0, 1, 2].map(i =>
        '<rect class="pbox" data-i="' + i + '" x="' + (60 + i * 110) + '" y="70" width="86" height="26" rx="3"/>' +
        '<text class="vg-mono ptext" x="' + (103 + i * 110) + '" y="87" text-anchor="middle"></text>' +
        '<rect class="pbar" data-i="' + i + '" x="' + (60 + i * 110) + '" y="96" width="0" height="3"/>').join("") +
      '<line class="plink" x1="146" y1="83" x2="170" y2="83"/>' +
      '<line class="plink" x1="256" y1="83" x2="280" y2="83"/>' +
      '<circle class="pdot" r="4" cx="-10" cy="83"/>' +
      "</g>" +
      '<g class="fileg">' +
      '<rect class="fcard" x="90" y="116" width="240" height="52" rx="5"/>' +
      '<path class="fplay" d="M112 130 l 16 10 l -16 10 z"/>' +
      '<g class="wave"></g>' +
      '<text class="vg-mono fname" x="140" y="132"></text>' +
      '<rect class="ftag" x="140" y="140" width="130" height="15" rx="2"/>' +
      '<text class="vg-mono ftagt" x="146" y="151"></text>' +
      "</g></svg>";

    const svg = stage.firstChild;
    const q = s => svg.querySelector(s), qq = s => svg.querySelectorAll(s);

    st(q(".pill"), { fill: BG, stroke: INK, strokeWidth: "1.4" });
    st(q(".utext"), { fill: INK, fontSize: "10px" });
    st(q(".caret"), { fill: accent });
    qq(".pbox").forEach(el => st(el, { fill: BG, stroke: MUT, strokeWidth: "1.2" }));
    qq(".ptext").forEach((el, i) => { st(el, { fill: MUT, fontSize: "9px" }); el.textContent = L.stages[i]; });
    qq(".pbar").forEach(el => st(el, { fill: accent }));
    qq(".plink").forEach(el => st(el, { stroke: MUT, strokeDasharray: "4 4" }));
    st(q(".pdot"), { fill: accent });
    st(q(".fcard"), { fill: BG, stroke: INK, strokeWidth: "1.4" });
    st(q(".fplay"), { fill: accent });
    st(q(".fname"), { fill: INK, fontSize: "10px" });
    st(q(".ftag"), { fill: "none", stroke: accent, strokeWidth: "1" });
    st(q(".ftagt"), { fill: accent, fontSize: "7.5px" });
    q(".ftagt").textContent = L.tag;
    q(".fname").textContent = L.file;

    const wave = q(".wave");
    const NB = 26;
    for (let i = 0; i < NB; i++) {
      const r = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      r.setAttribute("width", 3.2);
      r.setAttribute("rx", 1);
      st(r, { fill: accent });
      wave.appendChild(r);
    }
    const wbars = Array.from(wave.children);

    const urlg = q(".urlg"), fileg = q(".fileg"), pdot = q(".pdot");
    const ut = q(".utext"), caret = q(".caret");
    const D = 11500;

    function frame(tm) {
      const t = (tm % D) / 1000;
      const gIn = seg(t, 0, 0.4);
      urlg.setAttribute("opacity", (gIn * (1 - seg(t, 10.6, 11.2))).toFixed(2));

      const typing = seg(t, 0.3, 2.6);
      const txt = typed(L.url, typing);
      ut.textContent = txt;
      const w = 46 + txt.length * 5.9;
      caret.setAttribute("x", Math.min(w, 268));
      caret.setAttribute("opacity", t < 3 ? (Math.sin(t * 12) > 0 ? 1 : 0.15) : 0);

      const pipeIn = seg(t, 2.8, 3.3);
      q(".pipe").setAttribute("opacity", (pipeIn * (1 - seg(t, 10.6, 11.2))).toFixed(2));

      const flights = [[3.3, 4.4, 103], [4.4, 5.5, 213], [5.5, 6.6, 323]];
      let dx = -10, on = 0;
      flights.forEach((f, i) => {
        const p = seg(t, f[0], f[1]);
        if (p > 0 && p < 1) { on = 1; dx = lerp(i === 0 ? 40 : flights[i - 1][2], f[2], eio(p)); }
        svg.querySelector('.pbar[data-i="' + i + '"]')
          .setAttribute("width", (86 * seg(t, f[0], f[1])).toFixed(1));
        const box = svg.querySelector('.pbox[data-i="' + i + '"]');
        st(box, { stroke: (t >= f[0] && t < f[1] + 0.15) ? accent : MUT });
      });
      pdot.setAttribute("cx", dx); pdot.setAttribute("opacity", on);

      const fIn = seg(t, 6.7, 7.3);
      fileg.setAttribute("opacity", (fIn * (1 - seg(t, 10.8, 11.4))).toFixed(2));
      fileg.setAttribute("transform", "translate(0 " + lerp(12, 0, eo(fIn)).toFixed(1) + ")");
      wbars.forEach((r, i) => {
        const grow = eo(seg(t, 7.0 + i * 0.02, 7.5 + i * 0.02));
        const dance = t > 7.6 ? (Math.sin(t * 7 + i * 0.9) * 0.5 + 0.5) : 1;
        const H = Math.max(3, 4 + 18 * grow * (0.35 + 0.65 * dance) * (0.55 + 0.45 * Math.sin(i * 0.7 + 1)));
        r.setAttribute("x", 285 + i * 4.6);
        r.setAttribute("y", 142 - H / 2);
        r.setAttribute("height", H.toFixed(1));
      });
    }
    return { frame, static() { frame(8200); } };
  }

  /* ============ 4. UNITY: disparo, daño, K.O., respawn ============ */
  function vigUnity(stage, accent) {
    const L = T("unity");
    stage.innerHTML = '<canvas class="vg-canvas" aria-hidden="true"></canvas>';
    const cv = stage.firstChild;
    const ctx = cv.getContext("2d");
    const CW = 420, CH = 180;

    function size() {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = stage.clientWidth || CW;
      const h = Math.round(w * CH / CW);
      cv.width = w * dpr; cv.height = h * dpr;
      cv.style.height = h + "px";
      ctx.setTransform(cv.width / CW, 0, 0, cv.height / CH, 0, 0);
    }
    size();
    window.addEventListener("resize", size);

    const COL = {
      bg: "#14131a", floor: "#1b1a23", grid: "#26242f",
      ink: "#e8e2d2", mut: "#8b8496", enemy: "#5b7fb8", hpBg: "#2b2933",
      hpOk: "#3fae62", hpLow: "#c0392b", flash: "#fff3d6",
    };
    const P = { x: 84, y: 138 }, E = { x: 330, y: 138 };
    const D = 9500;
    const SHOTS = [0.9, 1.7, 2.5, 3.3];
    const FLIGHT = 0.16;

    function soldier(x, y, dir, color, opts) {
      const o = opts || {};
      const bob = o.bob || 0, recoil = o.recoil || 0, fall = o.fall || 0;
      ctx.save();
      ctx.translate(x, y + bob);
      if (fall > 0) { ctx.rotate(dir * fall * -Math.PI / 2); ctx.globalAlpha = 1 - fall * 0.55; }
      ctx.scale(dir, 1);
      ctx.fillStyle = color;
      ctx.fillRect(-7, -14, 5, 14);
      ctx.fillRect(2, -14, 5, 14);
      ctx.fillRect(-9, -34, 18, 21);
      ctx.beginPath(); ctx.arc(0, -41, 7.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = COL.bg;
      ctx.fillRect(1, -44, 7, 4);
      ctx.fillStyle = color;
      ctx.fillRect(2 - recoil * 3, -30, 15, 5);
      ctx.fillStyle = COL.ink;
      ctx.fillRect(13 - recoil * 3, -32, 12, 4);
      ctx.restore();
    }

    function shadow(x, y, w, alpha) {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = "#000";
      ctx.beginPath(); ctx.ellipse(x, y + 2, w, 4, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }

    function hpBar(x, y, w, frac, alignRight) {
      ctx.fillStyle = COL.hpBg;
      ctx.fillRect(x, y, w, 7);
      ctx.fillStyle = frac > 0.35 ? COL.hpOk : COL.hpLow;
      const fw = w * clamp01(frac);
      ctx.fillRect(alignRight ? x + w - fw : x, y, fw, 7);
      ctx.strokeStyle = COL.grid; ctx.lineWidth = 1;
      ctx.strokeRect(x + 0.5, y + 0.5, w - 1, 6);
    }

    function frame(tm) {
      const t = (tm % D) / 1000;
      ctx.clearRect(0, 0, CW, CH);
      ctx.fillStyle = COL.bg; ctx.fillRect(0, 0, CW, CH);
      ctx.fillStyle = COL.floor;
      ctx.beginPath(); ctx.moveTo(0, 112); ctx.lineTo(CW, 106); ctx.lineTo(CW, CH); ctx.lineTo(0, CH); ctx.fill();
      ctx.strokeStyle = COL.grid; ctx.lineWidth = 1;
      for (let i = 0; i <= 8; i++) {
        ctx.beginPath();
        ctx.moveTo(i * 60 - 60, CH);
        ctx.lineTo(150 + i * 22, 108);
        ctx.stroke();
      }
      for (let i = 0; i < 3; i++) {
        ctx.beginPath(); ctx.moveTo(0, 122 + i * 20); ctx.lineTo(CW, 118 + i * 20); ctx.stroke();
      }

      let hp = 1, dead = 0, respawn = 0;
      SHOTS.forEach((s, i) => { if (t > s + FLIGHT) hp = 1 - (i + 1) * 0.25; });
      hp = Math.max(0, hp);
      const koT = SHOTS[3] + FLIGHT;
      if (t > koT) dead = seg(t, koT, koT + 0.7);
      const reT = koT + 2.3;
      if (t > reT) { respawn = seg(t, reT, reT + 0.5); dead = 1 - respawn; hp = respawn; }
      if (t > reT + 0.6) { dead = 0; hp = 1; }

      ctx.font = "9px 'JetBrains Mono', monospace";
      ctx.fillStyle = COL.mut;
      ctx.textAlign = "left";
      ctx.fillText("P1 · " + L.hp + " 100", 22, 22);
      hpBar(22, 27, 110, 1, false);
      ctx.textAlign = "right";
      ctx.fillText(L.hp + " " + Math.round(hp * 100) + " · P2", CW - 22, 22);
      hpBar(CW - 132, 27, 110, hp, true);

      shadow(P.x, P.y, 14, 0.35);
      soldier(P.x, P.y, 1, accent, {
        bob: Math.sin(t * 4.2) * 1.4,
        recoil: SHOTS.reduce((m, s) => Math.max(m, (t > s && t < s + 0.2) ? 1 - (t - s) / 0.2 : 0), 0),
      });

      let ex = E.x;
      if (t > reT + 0.6) ex = E.x + Math.sin((t - reT) * 2.4) * 16;
      const hitFlash = SHOTS.reduce((m, s) => {
        const p = seg(t, s + FLIGHT, s + FLIGHT + 0.14);
        return Math.max(m, p > 0 && p < 1 ? 1 - p : 0);
      }, 0);
      if (dead < 1 || respawn > 0) {
        shadow(ex, E.y, 14, 0.35 * (1 - dead));
        soldier(ex, E.y, -1, hitFlash > 0.1 ? COL.flash : COL.enemy, {
          bob: Math.sin(t * 3.1 + 2) * 1.2,
          fall: dead,
        });
      }
      if (respawn > 0 && respawn < 1) {
        ctx.strokeStyle = COL.hpOk; ctx.lineWidth = 2;
        ctx.globalAlpha = 1 - respawn;
        ctx.beginPath(); ctx.arc(ex, E.y - 20, 8 + respawn * 26, 0, Math.PI * 2); ctx.stroke();
        ctx.globalAlpha = 1;
      }

      SHOTS.forEach(s => {
        const p = seg(t, s, s + FLIGHT);
        if (p > 0 && p < 1) {
          const bx = lerp(P.x + 28, E.x - 16, p);
          ctx.fillStyle = COL.flash;
          ctx.fillRect(bx, P.y - 31, 7, 2.5);
        }
        const mz = seg(t, s, s + 0.09);
        if (mz > 0 && mz < 1) {
          ctx.fillStyle = COL.flash;
          ctx.beginPath();
          ctx.moveTo(P.x + 26, P.y - 30);
          ctx.lineTo(P.x + 38, P.y - 34 + Math.sin(s * 9) * 2);
          ctx.lineTo(P.x + 38, P.y - 26);
          ctx.fill();
        }
      });

      SHOTS.forEach((s, i) => {
        const p = seg(t, s + FLIGHT, s + FLIGHT + 0.8);
        if (p > 0 && p < 1) {
          ctx.globalAlpha = 1 - p;
          ctx.fillStyle = i === 3 ? COL.hpLow : COL.ink;
          ctx.font = "10px 'JetBrains Mono', monospace";
          ctx.textAlign = "center";
          ctx.fillText("-25", E.x + 14, E.y - 52 - p * 18);
          ctx.globalAlpha = 1;
        }
      });

      if (dead > 0 && dead < 1 && t < reT) {
        ctx.fillStyle = COL.enemy;
        for (let i = 0; i < 9; i++) {
          const a = i * 0.7, r = dead * 34;
          ctx.globalAlpha = 1 - dead;
          ctx.fillRect(E.x + Math.cos(a) * r, E.y - 24 + Math.sin(a) * r * 0.6 - dead * 8, 3.4, 3.4);
        }
        ctx.globalAlpha = 1;
      }
      if (t > koT + 0.15 && t < reT) {
        ctx.fillStyle = accent;
        ctx.font = "700 15px 'JetBrains Mono', monospace";
        ctx.textAlign = "center";
        ctx.fillText(L.ko, E.x, 74);
        const left = Math.max(0, reT - t);
        ctx.fillStyle = COL.mut;
        ctx.font = "9px 'JetBrains Mono', monospace";
        ctx.fillText(L.respawn + " " + left.toFixed(1) + "s", E.x, 90);
      }
    }
    return { frame, static() { frame(3400); } };
  }

  /* ============ 5. SAAS: catálogo → carrito → WhatsApp ============ */
  function vigSaas(stage, accent) {
    const L = T("saas");
    const wa = "#22a15b";
    stage.innerHTML =
      '<svg class="vg" viewBox="0 0 420 180" aria-hidden="true">' +
      '<g class="cartg">' +
      '<path class="cart" d="M322 34 h9 l8 24 h40 l7 -18 h-50" fill="none"/>' +
      '<circle class="cw" cx="345" cy="66" r="3.6"/><circle class="cw" cx="370" cy="66" r="3.6"/>' +
      '<circle class="badge" cx="386" cy="30" r="9"/>' +
      '<text class="vg-mono badget" x="386" y="33.5" text-anchor="middle"></text>' +
      '<text class="vg-mono cartlab" x="360" y="86" text-anchor="middle"></text>' +
      "</g>" +
      '<g class="prod">' +
      '<rect class="pcard" x="60" y="36" width="120" height="108" rx="5"/>' +
      '<rect class="pimg" x="72" y="48" width="96" height="48" rx="3"/>' +
      '<rect class="pname" x="72" y="106" width="70" height="7" rx="2"/>' +
      '<text class="vg-mono pprice" x="72" y="132"></text>' +
      '<rect class="padd" x="118" y="120" width="50" height="16" rx="2"/>' +
      '<text class="vg-mono paddt" x="143" y="131" text-anchor="middle"></text>' +
      "</g>" +
      '<circle class="fly" r="5"/>' +
      '<g class="msg">' +
      '<path class="bubble" d="M232 52 h150 a6 6 0 0 1 6 6 v86 a6 6 0 0 1 -6 6 h-138 a6 6 0 0 1 -6 -6 v-74 z"/>' +
      [0, 1, 2].map(i =>
        '<text class="vg-mono mitem" x="248" y="' + (78 + i * 17) + '"></text>' +
        '<text class="vg-mono mqty" x="372" y="' + (78 + i * 17) + '" text-anchor="end"></text>').join("") +
      '<line class="mline" x1="248" y1="126" x2="372" y2="126"/>' +
      '<text class="vg-mono mtot" x="248" y="141"></text>' +
      '<text class="vg-mono mtotv" x="372" y="141" text-anchor="end"></text>' +
      "</g>" +
      '<g class="sentg">' +
      '<circle class="scirc" cx="80" cy="98" r="17" fill="none"/>' +
      '<path class="scheck" d="M71 98 l7 8 l13 -15" fill="none"/>' +
      '<text class="vg-mono sentt" x="80" y="132" text-anchor="middle"></text>' +
      "</g></svg>";

    const svg = stage.firstChild;
    const q = s => svg.querySelector(s), qq = s => svg.querySelectorAll(s);

    st(q(".cart"), { stroke: INK, strokeWidth: "2" });
    qq(".cw").forEach(el => st(el, { fill: INK }));
    st(q(".badge"), { fill: accent });
    st(q(".badget"), { fill: BG, fontSize: "9px" });
    st(q(".cartlab"), { fill: MUT, fontSize: "8px" });
    q(".cartlab").textContent = L.cart;
    st(q(".pcard"), { fill: BG, stroke: INK, strokeWidth: "1.4" });
    st(q(".pimg"), { fill: SOFT });
    st(q(".pname"), { fill: SOFT });
    st(q(".pprice"), { fill: INK, fontSize: "10px" });
    st(q(".padd"), { fill: "none", stroke: accent, strokeWidth: "1.2" });
    st(q(".paddt"), { fill: accent, fontSize: "7.5px" });
    q(".paddt").textContent = L.add;
    st(q(".fly"), { fill: accent });
    st(q(".bubble"), { fill: BG, stroke: wa, strokeWidth: "1.6" });
    qq(".mitem").forEach(el => st(el, { fill: INK, fontSize: "8.5px" }));
    qq(".mqty").forEach(el => st(el, { fill: MUT, fontSize: "8.5px" }));
    st(q(".mline"), { stroke: LINE });
    st(q(".mtot"), { fill: MUT, fontSize: "8.5px" });
    q(".mtot").textContent = L.total;
    st(q(".mtotv"), { fill: INK, fontSize: "10px" });
    q(".mtotv").textContent = "$ 1 496";
    st(q(".scirc"), { stroke: wa, strokeWidth: "2" });
    q(".scirc").setAttribute("stroke-dasharray", "107");
    st(q(".scheck"), { stroke: wa, strokeWidth: "2.4" });
    q(".scheck").setAttribute("stroke-dasharray", "32");
    st(q(".sentt"), { fill: MUT, fontSize: "7.5px" });
    q(".sentt").textContent = L.sent;

    const PRICES = ["$ 589", "$ 419", "$ 488"];
    const prod = q(".prod"), fly = q(".fly"), msg = q(".msg"), sentg = q(".sentg");
    const badge = q(".badget");
    const D = 12000;
    const SLOTS = [0.4, 2.4, 4.4];

    function frame(tm) {
      const t = (tm % D) / 1000;
      let count = 0, visible = 0, px = 0, priceIdx = 0;
      SLOTS.forEach((s, i) => {
        if (t > s + 1.7) count = i + 1;
        const enter = seg(t, s, s + 0.5);
        const flyP = seg(t, s + 1.2, s + 1.7);
        if (t >= s && t < s + 1.7 && flyP < 1) {
          visible = 1 - flyP;
          px = lerp(-160, 0, eo(enter));
          priceIdx = i;
        }
        if (flyP > 0 && flyP < 1) {
          const e = eio(flyP);
          fly.setAttribute("cx", lerp(120, 358, e));
          fly.setAttribute("cy", lerp(90, 44, e) - Math.sin(e * Math.PI) * 34);
          fly.setAttribute("opacity", 1);
        }
      });
      if (!SLOTS.some(s => t > s + 1.2 && t < s + 1.7)) fly.setAttribute("opacity", 0);
      prod.setAttribute("opacity", visible.toFixed(2));
      prod.setAttribute("transform", "translate(" + px.toFixed(1) + " 0)");
      q(".pprice").textContent = PRICES[priceIdx];
      st(q(".padd"), { strokeWidth: SLOTS.some(s => t > s + 0.8 && t < s + 1.2) ? "1.8" : "1.2" });

      badge.textContent = count;
      const bump = SLOTS.reduce((m, s) =>
        Math.max(m, (t > s + 1.65 && t < s + 1.9) ? Math.sin(seg(t, s + 1.65, s + 1.9) * Math.PI) : 0), 0);
      const cartFade = seg(t, 6.6, 7.1);
      q(".cartg").setAttribute("transform", "translate(0 " + (-bump * 4).toFixed(1) + ")");
      q(".cartg").setAttribute("opacity", (1 - cartFade).toFixed(2));

      const mIn = seg(t, 6.8, 7.4), mOut = seg(t, 11.4, 12.0);
      msg.setAttribute("opacity", (mIn * (1 - mOut)).toFixed(2));
      msg.setAttribute("transform", "translate(0 " + lerp(14, 0, eo(mIn)).toFixed(1) + ")");
      qq(".mitem").forEach((el, i) => {
        el.textContent = typed(L.items[i], seg(t, 7.3 + i * 0.4, 7.9 + i * 0.4));
      });
      qq(".mqty").forEach((el, i) => {
        el.textContent = seg(t, 7.8 + i * 0.4, 7.9 + i * 0.4) >= 1 ? "× 1" : "";
      });

      const sIn = seg(t, 9.3, 9.7);
      sentg.setAttribute("opacity", (sIn * (1 - mOut)).toFixed(2));
      q(".scirc").setAttribute("stroke-dashoffset", (107 * (1 - eo(seg(t, 9.3, 10.0)))).toFixed(1));
      q(".scheck").setAttribute("stroke-dashoffset", (32 * (1 - eo(seg(t, 9.8, 10.3)))).toFixed(1));
    }
    return { frame, static() { frame(8600); } };
  }

  /* ============ 6. POEMARIO: verso entre día y noche ============ */
  function vigPoemario(stage, accent) {
    const L = T("poemario");
    stage.innerHTML =
      '<svg class="vg" viewBox="0 0 420 180" aria-hidden="true">' +
      '<rect class="paper" x="92" y="14" width="236" height="140" rx="3"/>' +
      '<path class="corner" d="M328 14 l0 18 l-18 0 z"/>' +
      '<text class="vg-serif ptitle" x="210" y="46" text-anchor="middle"></text>' +
      '<line class="prule" x1="176" y1="56" x2="244" y2="56"/>' +
      '<text class="vg-serif verse v1" x="210" y="84" text-anchor="middle"></text>' +
      '<text class="vg-serif verse v2" x="210" y="104" text-anchor="middle"></text>' +
      '<rect class="vcaret" width="5" height="11"/>' +
      '<g class="skyg">' +
      '<circle class="sun" cx="366" cy="40" r="10"/>' +
      '<path class="moon" d="M366 30 a10 10 0 1 0 0 20 a12.5 8.5 0 0 1 0 -20 z"/>' +
      "</g>" +
      '<text class="vg-mono modet" x="366" y="66" text-anchor="middle"></text>' +
      '<g class="cmt">' +
      '<rect class="ccard" x="110" y="120" width="200" height="24" rx="3"/>' +
      '<circle class="cdot" cx="124" cy="132" r="3.4"/>' +
      '<text class="vg-mono ctext" x="136" y="135.5"></text>' +
      "</g></svg>";

    const svg = stage.firstChild;
    const q = s => svg.querySelector(s);
    const isDark = () => document.documentElement.dataset.theme === "dark";
    const DAY = { bg: isDark() ? "#efe8d6" : "#fdfaf1", ink: "#2c2620", mut: "#8d8062" };
    const NIGHT = { bg: "#221f26", ink: "#e9e2d2", mut: "#7a7488" };

    st(q(".paper"), { strokeWidth: "1.4" });
    st(q(".prule"), { strokeWidth: "1" });
    st(q(".ptitle"), { fontSize: "15px" });
    svg.querySelectorAll(".verse").forEach(el => st(el, { fontSize: "11.5px" }));
    st(q(".vcaret"), { fill: accent });
    st(q(".sun"), { fill: accent });
    st(q(".moon"), { fill: "#cfc7e2" });
    st(q(".modet"), { fontSize: "7.5px", fill: MUT });
    st(q(".ccard"), { strokeWidth: "1.2" });
    st(q(".ctext"), { fontSize: "8px" });
    st(q(".cdot"), { fill: accent });
    q(".ptitle").textContent = L.title;

    const D = 13000;
    function frame(tm) {
      const t = (tm % D) / 1000;
      const flip = eio(seg(t, 6.2, 7.4));
      const bg = mix(DAY.bg, NIGHT.bg, flip);
      const ink = mix(DAY.ink, NIGHT.ink, flip);
      const mut = mix(DAY.mut, NIGHT.mut, flip);
      const gIn = seg(t, 0, 0.5), gOut = seg(t, 12.2, 12.9);
      svg.setAttribute("opacity", (gIn * (1 - gOut)).toFixed(2));

      st(q(".paper"), { fill: bg, stroke: ink });
      st(q(".corner"), { fill: mut });
      st(q(".ptitle"), { fill: ink });
      st(q(".prule"), { stroke: mut });

      const v1 = typed(L.verse[0], seg(t, 1.0, 3.0));
      const v2 = typed(L.verse[1], seg(t, 3.2, 5.2));
      const e1 = q(".v1"), e2 = q(".v2");
      e1.textContent = v1; e2.textContent = v2;
      st(e1, { fill: ink }); st(e2, { fill: ink });

      const caret = q(".vcaret");
      if (t < 5.6) {
        const on2 = t >= 3.1;
        const txt = on2 ? v2 : v1;
        caret.setAttribute("x", 210 + txt.length * 2.9 + 4);
        caret.setAttribute("y", on2 ? 94 : 74);
        caret.setAttribute("opacity", Math.sin(t * 10) > 0 ? 0.9 : 0.15);
      } else caret.setAttribute("opacity", 0);

      q(".sun").setAttribute("transform", "translate(0 " + (flip * 34) + ")");
      q(".sun").setAttribute("opacity", (1 - flip).toFixed(2));
      q(".moon").setAttribute("transform", "translate(0 " + ((1 - flip) * -34) + ")");
      q(".moon").setAttribute("opacity", flip.toFixed(2));
      q(".modet").textContent = flip > 0.5 ? L.night : L.day;

      const cIn = seg(t, 8.6, 9.2);
      const cmt = q(".cmt");
      cmt.setAttribute("opacity", cIn.toFixed(2));
      cmt.setAttribute("transform", "translate(0 " + lerp(10, 0, eo(cIn)).toFixed(1) + ")");
      st(q(".ccard"), { fill: bg, stroke: mut });
      st(q(".ctext"), { fill: ink });
      q(".ctext").textContent = L.comment + " — " + '"' + typed(L.verse[0], seg(t, 9.4, 10.6)) + '"';
      const pulse = 0.6 + 0.4 * Math.sin(t * 5);
      q(".cdot").setAttribute("opacity", cIn > 0 ? pulse.toFixed(2) : 0);
    }
    return { frame, static() { frame(5600); } };
  }

  /* ============ 7. BITÁCORA: entradas, salidas, alerta ============ */
  function vigBitacora(stage, accent) {
    const L = T("bitacora");
    const red = "#b3402a", green = "#3f7a46";
    stage.innerHTML =
      '<svg class="vg" viewBox="0 0 420 180" aria-hidden="true">' +
      '<rect class="ledgerc" x="70" y="16" width="230" height="148" rx="4"/>' +
      '<line class="lhr" x1="70" y1="46" x2="300" y2="46"/>' +
      '<text class="vg-mono llab" x="84" y="35"></text>' +
      '<text class="vg-mono lcount" x="286" y="36" text-anchor="end"></text>' +
      [0, 1, 2].map(i =>
        '<g class="lrow" data-i="' + i + '">' +
        '<text class="vg-mono rlab" x="84" y="' + (70 + i * 26) + '"></text>' +
        '<text class="vg-mono rval" x="286" y="' + (70 + i * 26) + '" text-anchor="end"></text>' +
        '<line class="rline" x1="84" y1="' + (78 + i * 26) + '" x2="286" y2="' + (78 + i * 26) + '"/>' +
        "</g>").join("") +
      '<g class="alert">' +
      '<path class="atri" d="M100 148 l7 -12 l7 12 z" fill="none"/>' +
      '<text class="vg-mono atext" x="120" y="147"></text>' +
      "</g>" +
      '<g class="csvg">' +
      '<rect class="sheet" x="330" y="52" width="58" height="72" rx="3"/>' +
      [0, 1, 2, 3].map(i =>
        '<line class="srow" x1="338" y1="' + (66 + i * 14) + '" x2="380" y2="' + (66 + i * 14) + '"/>').join("") +
      '<text class="vg-mono stag" x="359" y="142" text-anchor="middle"></text>' +
      '<path class="scheck2" d="M350 100 l6 7 l12 -13" fill="none"/>' +
      "</g></svg>";

    const svg = stage.firstChild;
    const q = s => svg.querySelector(s), qq = s => svg.querySelectorAll(s);

    st(q(".ledgerc"), { fill: BG, stroke: INK, strokeWidth: "1.4" });
    st(q(".lhr"), { stroke: INK });
    st(q(".llab"), { fill: MUT, fontSize: "8px", letterSpacing: "1.5px" });
    st(q(".lcount"), { fontSize: "13px" });
    qq(".rlab").forEach(el => st(el, { fill: MUT, fontSize: "8.5px" }));
    qq(".rval").forEach(el => st(el, { fontSize: "10px" }));
    qq(".rline").forEach(el => st(el, { stroke: LINE }));
    st(q(".atri"), { stroke: red, strokeWidth: "1.6" });
    st(q(".atext"), { fill: red, fontSize: "8px" });
    st(q(".sheet"), { fill: BG, stroke: INK, strokeWidth: "1.4" });
    qq(".srow").forEach(el => st(el, { stroke: LINE }));
    st(q(".stag"), { fill: MUT, fontSize: "7.5px" });
    st(q(".scheck2"), { stroke: green, strokeWidth: "2.2" });
    q(".scheck2").setAttribute("stroke-dasharray", "30");

    q(".llab").textContent = L.left;
    q(".atext").textContent = L.alert;
    q(".stag").textContent = L.csv;

    const ROWS = L.rows;
    const DELTAS = [40, -15, -130];
    const BASE = 103;
    const TIMES = [1.0, 3.0, 5.0];
    const D = 11500;

    function frame(tm) {
      const t = (tm % D) / 1000;
      const gIn = seg(t, 0, 0.4), gOut = seg(t, 10.8, 11.4);
      svg.setAttribute("opacity", (gIn * (1 - gOut)).toFixed(2));

      let value = BASE;
      TIMES.forEach((s, i) => {
        const row = svg.querySelector('.lrow[data-i="' + i + '"]');
        const p = seg(t, s, s + 0.4);
        row.setAttribute("opacity", p.toFixed(2));
        row.setAttribute("transform", "translate(" + lerp(-8, 0, eo(p)).toFixed(1) + " 0)");
        row.querySelector(".rlab").textContent = ROWS[i][0];
        const rv = row.querySelector(".rval");
        rv.textContent = ROWS[i][1];
        st(rv, { fill: DELTAS[i] > 0 ? green : red });
        const roll = seg(t, s + 0.3, s + 1.0);
        if (roll > 0) value = BASE + DELTAS.slice(0, i).reduce((a, b) => a + b, 0) + DELTAS[i] * eo(roll);
      });
      const shown = Math.round(value);
      const lcount = q(".lcount");
      lcount.textContent = String(shown);
      st(lcount, { fill: shown < 0 ? red : INK });
      const negP = seg(t, 5.4, 5.9);
      const shake = shown < 0 && negP < 1 ? Math.sin(t * 60) * 1.6 * (1 - negP) : 0;
      lcount.setAttribute("transform", "translate(" + shake.toFixed(1) + " 0)");

      const aIn = seg(t, 6.0, 6.4);
      const alert = q(".alert");
      const blink = 0.55 + 0.45 * Math.sin(t * 6);
      alert.setAttribute("opacity", aIn >= 1 ? blink.toFixed(2) : aIn.toFixed(2));

      const cIn = seg(t, 7.6, 8.2);
      const csv = q(".csvg");
      csv.setAttribute("opacity", cIn.toFixed(2));
      csv.setAttribute("transform", "translate(" + lerp(-16, 0, eo(cIn)).toFixed(1) + " 0)");
      q(".scheck2").setAttribute("stroke-dashoffset", (30 * (1 - eo(seg(t, 8.4, 8.9)))).toFixed(1));
    }
    return { frame, static() { frame(6200); } };
  }

  /* ============ motor común ============ */
  const FACTORIES = {
    hero: vigHero,
    predisana: vigPredisana,
    mediora: vigMediora,
    unity: vigUnity,
    saas: vigSaas,
    poemario: vigPoemario,
    bitacora: vigBitacora,
  };

  const items = [];
  let io = null;

  function accentFor(el) {
    const scope = el.closest(".case");
    if (scope) {
      const v = getComputedStyle(scope).getPropertyValue("--case").trim();
      if (v) return v;
    }
    return cssVar("--accent") || "#b3402a";
  }

  function buildAll() {
    items.length = 0;
    if (io) io.disconnect();
    io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        const it = items.find(i => i.stage === en.target);
        if (!it) return;
        if (en.isIntersecting && !it.visible) {
          it.visible = true;
          it.since = performance.now();
        } else if (!en.isIntersecting && it.visible) {
          it.visible = false;
          it.acc += performance.now() - it.since;
        }
      });
    }, { threshold: 0.15 });

    document.querySelectorAll("[data-vignette]").forEach(stage => {
      const factory = FACTORIES[stage.dataset.vignette];
      if (!factory) return;
      const api = factory(stage, accentFor(stage));
      if (REDUCED) { api.static(); return; }
      items.push({ stage, api, visible: false, acc: 0, since: 0 });
      io.observe(stage);
    });
  }

  function loop(now) {
    items.forEach(it => {
      if (!it.visible) return;
      try { it.api.frame(it.acc + (now - it.since)); }
      catch (e) { it.visible = false; }
    });
    requestAnimationFrame(loop);
  }

  document.addEventListener("DOMContentLoaded", () => {
    buildAll();
    if (!REDUCED) requestAnimationFrame(loop);
    window.addEventListener("jo:lang", buildAll);
    window.addEventListener("jo:theme", buildAll);
  });
})();
