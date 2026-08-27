# Portafolio — John Orellana

Sitio estático hecho a mano: HTML + CSS + JavaScript, **sin frameworks, sin build, sin dependencias**.
Dirección de arte de "plano de ingeniería": retícula de papel milimetrado de fondo, tipografía técnica,
fichas por proyecto, carruseles de capturas y una demo animada dibujada a mano para cada caso.

- Bilingüe **ES / EN** (conmutador en la cabecera; recuerda la elección).
- Modo **claro / oscuro** — papel técnico de día, cianotipo azul marino de noche
  (respeta la preferencia del sistema; recuerda la elección).
- Reloj en vivo en la cabecera: tu hora de Quito y la hora local del visitante.
- Tipografías auto-hospedadas (Archivo Variable, Atkinson Hyperlegible, IBM Plex Mono) — sin llamadas a Google.
- Accesible: navegación por teclado, `aria-label` bilingües, `prefers-reduced-motion` respetado.

## Ver en local

Doble clic en `index.html` funciona. Para probarlo como se servirá en producción:

```powershell
# cualquiera de los dos
npx serve .
python -m http.server 8080
```

Atajos útiles para probar: `?lang=en`, `?theme=dark` (p. ej. `index.html?lang=en&theme=dark`).

## 1. Enlaces

Todo se edita en **`js/config.js`**, objeto `LINKS`:

| Campo | Qué poner |
|---|---|
| `email` | Solo la dirección (`correo@dominio.com`) — el `mailto:` se añade solo |
| `github`, `linkedin` | URLs completas |
| `cv` | Ruta al PDF (vive en `assets/cv/`). **Sugerencia:** usa una versión sin teléfono ni C.I. |
| `projects.<caso>.demo / .code` | URLs de demo y repositorio de cada proyecto |

Mientras un enlace esté vacío (`""`), su botón aparece **punteado y deshabilitado** ("pendiente").
Al rellenarlo, cobra vida automáticamente. No hay que tocar el HTML.

**Proyectos privados.** Mediora y el juego en Unity no exponen demo ni código (el de Unity pertenece al
cliente), así que sus botones se eliminaron del HTML. Rellenar sus campos en `LINKS.projects` no mostrará
nada: para reactivarlos hay que devolver el bloque `.case-links` a su `<article>` en `index.html`.

**Correo con plantilla.** Los botones de correo ("Escríbeme" y "Correo") no hacen scroll: abren el cliente
de correo con destinatario, asunto y cuerpo prellenados. Ese texto se edita en `js/i18n.js` →
`contact.emailSubject` y `contact.emailBody` (ES y EN).

**CV.** Se abre en pestaña nueva, incluso siendo una ruta local.

## 2. Capturas

Bitácora de Inventario ya usa capturas reales (`assets/shots/bitacora/*.jpeg`, verticales de móvil).
El resto siguen siendo mockups SVG generados (marcados "CAPTURA PENDIENTE"). Para poner capturas reales:

1. Guarda tus PNG/JPG/WebP en `assets/shots/<proyecto>/` (ideal 16:10, p. ej. 1600×1000).
2. Actualiza las rutas en `js/config.js`, objeto `SHOTS` (puedes añadir o quitar imágenes).
3. Los pies de foto se editan en `js/i18n.js` → `cases.<proyecto>.shots` (ES y EN).

Las capturas verticales (móvil) se recortarían con el 16:10 por defecto. Hay una regla en `css/styles.css`
que las muestra completas por carrusel — busca `[data-carousel="bitacora"] .car-slide img` y duplícala
para el proyecto que lo necesite.

Los placeholders se regeneran con `node tools/make-placeholders.mjs` si alguna vez los necesitas.

## 3. Editar textos

Todo el texto visible vive en **`js/i18n.js`**, duplicado en `es` y `en`.
Si cambias algo en un idioma, recuerda su gemelo en el otro.

## Secciones

| # | Sección | `id` |
|---|---|---|
| 01 | Perfil | `#sobre-mi` |
| 02 | Proyectos (6 casos) | `#proyectos` |
| 03 | Stack | `#stack` |
| 04 | Trayectoria | `#experiencia` |
| 05 | Contacto | `#contacto` |

Los números de sección viven en tres sitios del HTML: `.sec-no`, el `.folio` del pie y el comentario del
bloque. Si reordenas secciones, actualiza los tres.

## Interacciones

- **Carruseles de capturas** — flechas, puntos, teclado (← →) y arrastre con el mouse. Las flechas dan la
  vuelta: desde la última captura, "siguiente" regresa a la primera.
- **Stack** — cada fila avanza sola en bucle; se pausa al pasar el cursor, se puede arrastrar y tiene
  botones ← →. Al soltar retoma su movimiento. Con `prefers-reduced-motion` queda estática y sin botones.
- **Reloj** — `Intl.DateTimeFormat` con `America/Guayaquil` fijo para Quito, y la zona horaria que reporta
  el navegador para el visitante. Sin geolocalización ni permisos.

## Estructura

```
index.html            Estructura (una sola página)
css/styles.css        Sistema de diseño completo (tokens claro/oscuro al inicio)
js/config.js          ← ENLACES y capturas (lo que tú editas)
js/i18n.js            ← Textos ES/EN
js/main.js            Idioma, tema, reloj, carruseles, stack, enlaces
js/vignettes.js       Las 7 animaciones (SVG/canvas, sin librerías)
assets/fonts/         Tipografías auto-hospedadas (woff2)
assets/icons/         Íconos del stack (simple-icons, coloreados)
assets/shots/         Capturas por proyecto
assets/cv/            CV en PDF
tools/                Generador de placeholders
```

## Publicar

Es un sitio 100 % estático: sirve cualquier hosting.

- **Cloudflare Pages**: conecta el repo → framework `None` → build command vacío → output `/`.
- **GitHub Pages**: Settings → Pages → deploy from branch.
- **Vercel / Netlify**: arrastrar la carpeta o conectar el repo, sin configuración.
