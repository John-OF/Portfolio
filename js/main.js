/* ============================================================
   RUNTIME: idioma, tema, marquesinas, carruseles, enlaces
   ============================================================ */
(function () {
  "use strict";

  const doc = document.documentElement;
  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
  const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- i18n ---------- */
  let lang = doc.lang === "en" ? "en" : "es";

  function t(path) {
    let node = I18N[lang];
    for (const k of path.split(".")) {
      if (node == null) return "";
      node = node[k];
    }
    return node == null ? "" : node;
  }
  window.joT = t; // usado por vignettes.js

  function pad2(n) { return String(n).padStart(2, "0"); }

  /* ---------- reloj: hora de Quito + hora del visitante ---------- */
  const QUITO_TZ = "America/Guayaquil";
  let VISITOR_TZ = "UTC";
  try { VISITOR_TZ = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"; } catch (e) { /* sin soporte Intl */ }

  function fmtTime(tz) {
    try {
      return new Intl.DateTimeFormat(lang === "en" ? "en-US" : "es-EC", {
        hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: tz,
      }).format(new Date());
    } catch (e) { return "--:--"; }
  }

  function updateClocks() {
    const el = $("#clockRow");
    if (!el) return;
    el.textContent =
      t("hero.clockQuito") + " " + fmtTime(QUITO_TZ) +
      " · " + t("hero.clockLocal") + " " + fmtTime(VISITOR_TZ);
  }

  function applyLang(next) {
    lang = next;
    doc.lang = lang;
    try { localStorage.setItem("jo-lang", lang); } catch (e) { /* modo privado */ }

    document.title = t("meta.title");
    const md = $('meta[name="description"]');
    if (md) md.setAttribute("content", t("meta.description"));

    $$("[data-i18n]").forEach(el => { el.textContent = t(el.dataset.i18n); });
    $$("[data-i18n-html]").forEach(el => { el.innerHTML = t(el.dataset.i18nHtml); });
    $$("[data-i18n-list]").forEach(el => {
      const arr = t(el.dataset.i18nList);
      if (!Array.isArray(arr)) return;
      el.innerHTML = "";
      arr.forEach(item => {
        const li = document.createElement("li");
        li.textContent = item;
        el.appendChild(li);
      });
    });
    $$("[data-a11y]").forEach(el => { el.setAttribute("aria-label", t(el.dataset.a11y)); });
    updateClocks();

    $$("[data-lang-btn]").forEach(b => {
      const on = b.dataset.langBtn === lang;
      b.classList.toggle("on", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });

    // Notas de origen: ocultar párrafo vacío
    $$(".case-origin").forEach(el => {
      el.hidden = !el.textContent.trim();
    });

    refreshCarouselsLang();
    refreshPendingLinks();
    window.dispatchEvent(new CustomEvent("jo:lang", { detail: { lang } }));
  }

  /* ---------- tema ---------- */
  function applyTheme(mode) {
    doc.dataset.theme = mode;
    try { localStorage.setItem("jo-theme", mode); } catch (e) { /* ignore */ }
    const btn = $("#themeBtn");
    if (btn) btn.setAttribute("aria-pressed", mode === "dark" ? "true" : "false");
    window.dispatchEvent(new CustomEvent("jo:theme", { detail: { mode } }));
  }

  /* ---------- enlaces configurables ---------- */
  function resolveLink(path) {
    const parts = path.split(".");
    let v = parts.length === 2 ? (LINKS.projects[parts[0]] || {})[parts[1]] : LINKS[path];
    return (v || "").trim();
  }

  function refreshPendingLinks() {
    $$("[data-link]").forEach(a => {
      const raw = resolveLink(a.dataset.link);
      if (raw) {
        let href = raw;
        if (a.dataset.link === "email" && !/^mailto:/i.test(raw)) {
          const subject = encodeURIComponent(t("contact.emailSubject"));
          const body = encodeURIComponent(t("contact.emailBody"));
          href = "mailto:" + raw + "?subject=" + subject + "&body=" + body;
        }
        a.href = href;
        if (/^https?:/i.test(href) || a.dataset.link === "cv") { a.target = "_blank"; a.rel = "noopener"; }
        a.classList.remove("is-pending");
        a.removeAttribute("aria-disabled");
        a.removeAttribute("title");
      } else {
        a.href = "#";
        a.classList.add("is-pending");
        a.setAttribute("aria-disabled", "true");
        a.title = t("a11y.pending");
      }
    });
  }
  document.addEventListener("click", e => {
    const a = e.target.closest && e.target.closest("a.is-pending");
    if (a) e.preventDefault();
  });

  /* ---------- marquesinas del stack (carrusel arrastrable) ---------- */
  const marquees = [];

  function wrapPos(m, p) {
    let r = p % m.half;
    if (r > 0) r -= m.half;
    return r; // rango (-half, 0]
  }

  function setTransform(m) { m.track.style.transform = "translateX(" + m.pos + "px)"; }

  function nudgeMarquee(m, dir) {
    m.transitioning = true;
    m.track.style.transition = "transform 420ms cubic-bezier(.22,1,.36,1)";
    m.pos = wrapPos(m, m.pos + dir * m.step);
    setTransform(m);
    clearTimeout(m.transTimer);
    m.transTimer = setTimeout(() => {
      m.track.style.transition = "";
      m.transitioning = false;
    }, 430);
  }

  function tickMarquees(ts) {
    if (!tickMarquees.last) tickMarquees.last = ts;
    const dt = ts - tickMarquees.last;
    tickMarquees.last = ts;
    marquees.forEach(m => {
      if (m.dragging || m.paused || m.transitioning) return;
      m.pos = wrapPos(m, m.pos + m.dir * m.speed * dt);
      setTransform(m);
    });
    requestAnimationFrame(tickMarquees);
  }

  function buildMarquees() {
    $$("[data-marquee]").forEach(row => {
      const key = row.dataset.marquee;
      const items = (STACK[key] || []);
      const shell = row.closest(".marquee-shell");
      const prevBtn = shell && $(".marquee-prev", shell);
      const nextBtn = shell && $(".marquee-next", shell);

      const track = document.createElement("div");
      track.className = "marquee-track";

      const half = document.createElement("div");
      half.className = "marquee-half";
      items.forEach(it => {
        const tile = document.createElement("span");
        tile.className = "tile";
        const img = document.createElement("img");
        img.src = "assets/icons/" + it.slug + ".svg";
        img.alt = "";
        img.width = 22; img.height = 22;
        img.loading = "lazy";
        if (it.inv) img.classList.add("ico-inv");
        if (it.boost) img.classList.add("ico-boost");
        const name = document.createElement("span");
        name.className = "tile-name";
        name.textContent = it.name;
        tile.append(img, name);
        half.appendChild(tile);
      });
      track.appendChild(half);
      if (!REDUCED) track.appendChild(half.cloneNode(true));
      row.appendChild(track);

      if (REDUCED) {
        row.classList.add("static");
        if (prevBtn) prevBtn.style.display = "none";
        if (nextBtn) nextBtn.style.display = "none";
        return;
      }

      const halfWidth = half.scrollWidth;
      const durMs = items.length * 3200;
      const m = {
        row, track, half: halfWidth,
        dir: row.hasAttribute("data-rev") ? 1 : -1,
        speed: halfWidth / durMs, // px/ms
        step: Math.max(200, (halfWidth / items.length) * 2.2),
        pos: 0, dragging: false, paused: false, transitioning: false,
        dragStartX: 0, dragStartPos: 0, transTimer: null,
      };
      marquees.push(m);

      row.addEventListener("pointerdown", e => {
        m.dragging = true;
        m.dragStartX = e.clientX;
        m.dragStartPos = m.pos;
        row.classList.add("dragging");
        track.style.transition = "";
        row.setPointerCapture(e.pointerId);
      });
      row.addEventListener("pointermove", e => {
        if (!m.dragging) return;
        m.pos = wrapPos(m, m.dragStartPos + (e.clientX - m.dragStartX));
        setTransform(m);
      });
      const endDrag = () => {
        if (!m.dragging) return;
        m.dragging = false;
        row.classList.remove("dragging");
      };
      row.addEventListener("pointerup", endDrag);
      row.addEventListener("pointercancel", endDrag);

      row.addEventListener("pointerenter", e => { if (e.pointerType === "mouse") m.paused = true; });
      row.addEventListener("pointerleave", e => { if (e.pointerType === "mouse") m.paused = false; });
      row.addEventListener("focusin", () => { m.paused = true; });
      row.addEventListener("focusout", () => { m.paused = false; });
      row.addEventListener("keydown", e => {
        if (e.key === "ArrowLeft") { e.preventDefault(); nudgeMarquee(m, -m.dir); }
        if (e.key === "ArrowRight") { e.preventDefault(); nudgeMarquee(m, m.dir); }
      });

      if (prevBtn) prevBtn.addEventListener("click", () => nudgeMarquee(m, -m.dir));
      if (nextBtn) nextBtn.addEventListener("click", () => nudgeMarquee(m, m.dir));
    });

    if (marquees.length) requestAnimationFrame(tickMarquees);
  }

  /* ---------- carruseles ---------- */
  const carousels = [];

  function buildCarousels() {
    $$("[data-carousel]").forEach(root => {
      const key = root.dataset.carousel;
      const srcs = SHOTS[key] || [];
      if (!srcs.length) { root.hidden = true; return; }

      root.innerHTML =
        '<div class="car-top mono">' +
        '  <span class="car-label"></span>' +
        '  <span class="car-count" aria-hidden="true"></span>' +
        '  <span class="car-btns">' +
        '    <button type="button" class="car-btn car-prev">&#8592;</button>' +
        '    <button type="button" class="car-btn car-next">&#8594;</button>' +
        "  </span>" +
        "</div>" +
        '<div class="car-track" tabindex="0"></div>' +
        '<div class="car-bottom mono"><span class="car-cap"></span><span class="car-dots" role="tablist"></span></div>';

      const track = $(".car-track", root);
      const dotsBox = $(".car-dots", root);

      srcs.forEach((src, i) => {
        const fig = document.createElement("figure");
        fig.className = "car-slide";
        const img = document.createElement("img");
        img.src = src;
        img.loading = "lazy";
        img.decoding = "async";
        fig.appendChild(img);
        track.appendChild(fig);

        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = "car-dot";
        dot.addEventListener("click", () => goTo(i));
        dotsBox.appendChild(dot);
      });

      const state = { root, key, track, index: 0, n: srcs.length };
      carousels.push(state);

      function clamp(i) { return Math.max(0, Math.min(state.n - 1, i)); }
      function wrap(i) { return ((i % state.n) + state.n) % state.n; }
      function goTo(i) {
        i = clamp(i);
        track.scrollTo({ left: i * track.clientWidth, behavior: REDUCED ? "auto" : "smooth" });
      }
      $(".car-prev", root).addEventListener("click", () => goTo(wrap(state.index - 1)));
      $(".car-next", root).addEventListener("click", () => goTo(wrap(state.index + 1)));

      let raf = 0;
      track.addEventListener("scroll", () => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          const i = clamp(Math.round(track.scrollLeft / Math.max(1, track.clientWidth)));
          if (i !== state.index) { state.index = i; paintCarousel(state); }
        });
      }, { passive: true });

      track.addEventListener("keydown", e => {
        if (e.key === "ArrowLeft") { e.preventDefault(); goTo(wrap(state.index - 1)); }
        if (e.key === "ArrowRight") { e.preventDefault(); goTo(wrap(state.index + 1)); }
      });

      // arrastre con mouse
      let down = null;
      track.addEventListener("pointerdown", e => {
        if (e.pointerType !== "mouse") return;
        down = { x: e.clientX, left: track.scrollLeft, moved: false };
        track.classList.add("dragging");
      });
      track.addEventListener("pointermove", e => {
        if (!down) return;
        const dx = e.clientX - down.x;
        if (Math.abs(dx) > 4) { down.moved = true; track.setPointerCapture(e.pointerId); }
        if (down.moved) track.scrollLeft = down.left - dx;
      });
      const endDrag = () => {
        if (!down) return;
        track.classList.remove("dragging");
        if (down.moved) goTo(Math.round(track.scrollLeft / Math.max(1, track.clientWidth)));
        down = null;
      };
      track.addEventListener("pointerup", endDrag);
      track.addEventListener("pointercancel", endDrag);

      paintCarousel(state);
    });
  }

  function paintCarousel(st) {
    const caps = t("cases." + st.key + ".shots") || [];
    $(".car-label", st.root).textContent = t("carousel.label").toUpperCase();
    $(".car-count", st.root).textContent =
      pad2(st.index + 1) + " / " + pad2(st.n);
    $(".car-cap", st.root).textContent = caps[st.index] || "";
    $(".car-prev", st.root).setAttribute("aria-label", t("a11y.prev"));
    $(".car-next", st.root).setAttribute("aria-label", t("a11y.next"));
    $$(".car-dot", st.root).forEach((d, i) => {
      d.classList.toggle("on", i === st.index);
      d.setAttribute("aria-label", t("a11y.goto") + " " + (i + 1));
    });
    $$(".car-slide img", st.root).forEach((img, i) => {
      img.alt = (caps[i] || t("carousel.label")) + " — " + t("cases." + st.key + ".name");
    });
  }

  function refreshCarouselsLang() { carousels.forEach(paintCarousel); }

  /* ---------- aparición al hacer scroll ---------- */
  function initReveal() {
    const els = $$(".rv");
    if (REDUCED || !("IntersectionObserver" in window)) {
      els.forEach(el => el.classList.add("on"));
      return;
    }
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) { en.target.classList.add("on"); io.unobserve(en.target); }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -8% 0px" });
    els.forEach(el => io.observe(el));
  }

  /* ---------- init ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    buildMarquees();
    buildCarousels();
    initReveal();

    // red de seguridad: nada queda oculto si el observer no dispara
    setTimeout(() => $$(".rv:not(.on)").forEach(el => el.classList.add("on")), 3000);

    // utilidades por URL: ?scroll=N (capturas / debug)
    const qp = new URLSearchParams(location.search);
    const sc = parseInt(qp.get("scroll") || "", 10);
    if (!isNaN(sc)) setTimeout(() => window.scrollTo(0, sc), 80);

    $$("[data-lang-btn]").forEach(b =>
      b.addEventListener("click", () => applyLang(b.dataset.langBtn)));

    const themeBtn = $("#themeBtn");
    if (themeBtn) themeBtn.addEventListener("click", () =>
      applyTheme(doc.dataset.theme === "dark" ? "light" : "dark"));

    const yearEl = $("#year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    applyLang(lang); // pinta todo el texto en el idioma activo
    setInterval(updateClocks, 15000);
  });
})();
