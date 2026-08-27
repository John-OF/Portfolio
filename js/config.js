/* ============================================================
   CONFIGURACIÓN EDITABLE
   Este es el ÚNICO archivo que necesitas tocar para:
   1) Rellenar tus enlaces (correo, GitHub, LinkedIn, CV, demos, repos)
   2) Reemplazar las capturas placeholder por capturas reales
   ============================================================ */

/* ---- 1. ENLACES ----------------------------------------------
   Déjalos como "" mientras no existan: el botón se mostrará
   marcado como pendiente. Al rellenar, el enlace cobra vida.
   - email:    solo la dirección (ej. "correo@dominio.com")
   - cv:       ruta o URL al PDF (ej. "assets/cv/CV_John_Orellana.pdf")
                > Sugerencia: sube una versión del CV SIN teléfono ni C.I.
   - demo/code de cada proyecto: URLs completas (https://...)
--------------------------------------------------------------- */
const LINKS = {
  email: "jhon.orellanafer@gmail.com",
  github: "https://github.com/John-OF",
  linkedin: "https://www.linkedin.com/in/john-orellana-fern%C3%A1ndez-304727230/",
  cv: "assets/cv/CV_John_Orellana.pdf",
  projects: {
    predisana: { demo: "", code: "" },
    saas:      { demo: "", code: "" },
    mediora:   { demo: "", code: "" },
    unity:     { demo: "", code: "" },
    poemario:  { demo: "https://poemario.pages.dev/", code: "https://github.com/John-OF/poemario" },
    bitacora:  { demo: "https://bitacora-inventario.pages.dev/login", code: "https://github.com/John-OF/bitacora-inventario" },
  },
};

/* ---- 2. CAPTURAS DE PANTALLA ---------------------------------
   Cada proyecto lista sus imágenes en orden. Para usar capturas
   reales: guarda tus PNG/JPG/WebP en assets/shots/<proyecto>/ y
   actualiza las rutas aquí (puedes añadir o quitar entradas).
   Relación de aspecto recomendada: 16:10 (p. ej. 1600x1000).
--------------------------------------------------------------- */
const SHOTS = {
  predisana: [
    "assets/shots/predisana/01.svg",
    "assets/shots/predisana/02.svg",
    "assets/shots/predisana/03.svg",
    "assets/shots/predisana/04.svg",
  ],
  saas: [
    "assets/shots/saas/01.svg",
    "assets/shots/saas/02.svg",
    "assets/shots/saas/03.svg",
    "assets/shots/saas/04.svg",
  ],
  mediora: [
    "assets/shots/mediora/01.svg",
    "assets/shots/mediora/02.svg",
    "assets/shots/mediora/03.svg",
    "assets/shots/mediora/04.svg",
  ],
  unity: [
    "assets/shots/unity/01.svg",
    "assets/shots/unity/02.svg",
    "assets/shots/unity/03.svg",
    "assets/shots/unity/04.svg",
  ],
  poemario: [
    "assets/shots/poemario/01.svg",
    "assets/shots/poemario/02.svg",
    "assets/shots/poemario/03.svg",
    "assets/shots/poemario/04.svg",
  ],
  bitacora: [
    "assets/shots/bitacora/01.jpeg",
    "assets/shots/bitacora/02.jpeg",
    "assets/shots/bitacora/03.jpeg",
    "assets/shots/bitacora/04.jpeg",
    "assets/shots/bitacora/05.jpeg",
  ],
};

/* ---- 3. STACK (carrusel de íconos) ---------------------------
   inv:   logo negro que se invierte a blanco en modo oscuro
   boost: color oscuro que se aclara un poco en modo oscuro
--------------------------------------------------------------- */
const STACK = {
  front: [
    { slug: "react",        name: "React" },
    { slug: "typescript",   name: "TypeScript" },
    { slug: "javascript",   name: "JavaScript" },
    { slug: "html5",        name: "HTML5" },
    { slug: "css3",         name: "CSS" },
    { slug: "tailwindcss",  name: "Tailwind CSS" },
    { slug: "vite",         name: "Vite" },
    { slug: "bootstrap",    name: "Bootstrap" },
    { slug: "reactrouter",  name: "React Router" },
    { slug: "reactquery",   name: "TanStack Query" },
    { slug: "axios",        name: "Axios" },
  ],
  server: [
    { slug: "nodedotjs",     name: "Node.js" },
    { slug: "express",       name: "Express", inv: true },
    { slug: "fastify",       name: "Fastify", inv: true },
    { slug: "flask",         name: "Flask", inv: true },
    { slug: "fastapi",       name: "FastAPI" },
    { slug: "python",        name: "Python" },
    { slug: "php",           name: "PHP" },
    { slug: "laravel",       name: "Laravel" },
    { slug: "prisma",        name: "Prisma", inv: true },
    { slug: "jsonwebtokens", name: "JWT", inv: true },
    { slug: "zod",           name: "Zod" },
  ],
  data: [
    { slug: "postgresql",  name: "PostgreSQL" },
    { slug: "mysql",       name: "MySQL" },
    { slug: "sqlite",      name: "SQLite" },
    { slug: "supabase",    name: "Supabase" },
    { slug: "scikitlearn", name: "scikit-learn" },
    { slug: "pytorch",     name: "PyTorch" },
    { slug: "unity",       name: "Unity", inv: true },
    { slug: "csharp",      name: "C#" },
    { slug: "git",         name: "Git" },
    { slug: "github",      name: "GitHub", inv: true },
    { slug: "ffmpeg",      name: "FFmpeg", boost: true },
    { slug: "cloudflare",  name: "Cloudflare" },
  ],
};
