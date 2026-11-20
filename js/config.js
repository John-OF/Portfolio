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
  email: "john.orellanafer@gmail.com",
  github: "https://github.com/John-OF",
  linkedin: "https://www.linkedin.com/in/john-orellana-fern%C3%A1ndez-304727230/",
  cv: "assets/cv/CV_John_Orellana.pdf",
  projects: {
    predisana: { demo: "https://predisana.vercel.app/", code: "https://github.com/John-OF/predisana" },
    // Gondofy: código privado (negocio propio). El caso no muestra enlaces.
    saas:      { demo: "", code: "" },
    mediora:   { demo: "", code: "" },
    unity:     { demo: "", code: "" },
    poemario:  { demo: "https://poemario.pages.dev/", code: "https://github.com/John-OF/poemario" },
    bitacora:  { demo: "https://bitacora-inventario.vercel.app/login", code: "https://github.com/John-OF/bitacora-inventario" },
    // Un repositorio por servidor MCP.
    mcp:       { codeTrends: "https://github.com/John-OF/google-trends-mcp", codeImg: "https://github.com/John-OF/img-license-mcp" },
    bot:       { demo: "", code: "https://github.com/John-OF/whatsapp-funnel-bot" },
  },
};

/* ---- 2. CAPTURAS DE PANTALLA ---------------------------------
   Cada proyecto lista sus imágenes en orden. Cada entrada puede ser:

     "ruta.webp"                      -> la misma imagen en ambos temas
     { light: "...", dark: "..." }    -> una captura por tema

   Si falta uno de los dos temas (o queda como ""), se usa el que haya:
   nunca se rompe la imagen. Así puedes ir agregando las capturas
   oscuras de a poco, proyecto por proyecto.

   Formato: WebP siempre (assets/shots/<proyecto>/). Para convertir:
     ffmpeg -i entrada.png -c:v libwebp -q:v 82 salida.webp

   Nombra los pares <n>-light.webp / <n>-dark.webp y captura ambos en
   la misma pantalla, mismo scroll y mismos datos: un par desalineado
   se nota al cambiar de tema.
--------------------------------------------------------------- */
const SHOTS = {
  // Generadas con tools/capturas (node capturar.mjs predisana)
  predisana: [
    { light: "assets/shots/predisana/01-light.webp", dark: "assets/shots/predisana/01-dark.webp" },
    { light: "assets/shots/predisana/02-light.webp", dark: "assets/shots/predisana/02-dark.webp" },
    { light: "assets/shots/predisana/03-light.webp", dark: "assets/shots/predisana/03-dark.webp" },
    { light: "assets/shots/predisana/04-light.webp", dark: "assets/shots/predisana/04-dark.webp" },
  ],
  // Generadas con tools/capturas (node capturar.mjs saas). Créditos de las fotos: assets/shots/saas/CREDITOS.md
  saas: [
    { light: "assets/shots/saas/01-light.webp", dark: "assets/shots/saas/01-dark.webp" },
    { light: "assets/shots/saas/02-light.webp", dark: "assets/shots/saas/02-dark.webp" },
    { light: "assets/shots/saas/03-light.webp", dark: "assets/shots/saas/03-dark.webp" },
    { light: "assets/shots/saas/04-light.webp", dark: "assets/shots/saas/04-dark.webp" },
  ],
  // Generadas con tools/capturas (node capturar.mjs mediora), con un video de la NASA de dominio público.
  mediora: [
    { light: "assets/shots/mediora/01-light.webp", dark: "assets/shots/mediora/01-dark.webp" },
    { light: "assets/shots/mediora/02-light.webp", dark: "assets/shots/mediora/02-dark.webp" },
    { light: "assets/shots/mediora/03-light.webp", dark: "assets/shots/mediora/03-dark.webp" },
    { light: "assets/shots/mediora/04-light.webp", dark: "assets/shots/mediora/04-dark.webp" },
    { light: "assets/shots/mediora/05-light.webp", dark: "assets/shots/mediora/05-dark.webp" },
  ],
  unity: [
    "assets/shots/unity/01.svg",
    "assets/shots/unity/02.svg",
    "assets/shots/unity/03.svg",
    "assets/shots/unity/04.svg",
  ],
  // Generadas con tools/capturas (node capturar.mjs poemario). Las 03 y 04 (panel) esperan la
  // contraseña de autor en tools/capturas/credenciales.local.json.
  poemario: [
    { light: "assets/shots/poemario/01-light.webp", dark: "assets/shots/poemario/01-dark.webp" },
    { light: "assets/shots/poemario/02-light.webp", dark: "assets/shots/poemario/02-dark.webp" },
    "assets/shots/poemario/03.svg",
    "assets/shots/poemario/04.svg",
  ],
  // Generadas con tools/capturas (node capturar.mjs bitacora) sobre la versión Neon, con la cuenta demo.
  bitacora: [
    { light: "assets/shots/bitacora/01-light.webp", dark: "assets/shots/bitacora/01-dark.webp" },
    { light: "assets/shots/bitacora/02-light.webp", dark: "assets/shots/bitacora/02-dark.webp" },
    { light: "assets/shots/bitacora/03-light.webp", dark: "assets/shots/bitacora/03-dark.webp" },
    { light: "assets/shots/bitacora/04-light.webp", dark: "assets/shots/bitacora/04-dark.webp" },
    { light: "assets/shots/bitacora/05-light.webp", dark: "assets/shots/bitacora/05-dark.webp" },
  ],
};

/* ---- 3. STACK (carrusel de íconos) ---------------------------
   inv:   logo negro que se invierte a blanco en modo oscuro
   boost: color oscuro que se aclara un poco en modo oscuro
   slug:  "" = herramienta sin logo; se muestra solo el nombre
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
  ai: [
    { slug: "claude",               name: "Claude Code" },
    { slug: "openai",               name: "Codex", inv: true },
    { slug: "modelcontextprotocol", name: "MCP", inv: true },
    { slug: "",                     name: "FastMCP" },
    { slug: "scikitlearn",          name: "scikit-learn" },
    { slug: "",                     name: "LightGBM" },
    { slug: "",                     name: "SHAP" },
    { slug: "pandas",               name: "pandas", boost: true },
    { slug: "pytorch",              name: "PyTorch" },
    { slug: "",                     name: "Playwright" },
  ],
  data: [
    { slug: "postgresql",  name: "PostgreSQL" },
    { slug: "mysql",       name: "MySQL" },
    { slug: "sqlite",      name: "SQLite" },
    { slug: "supabase",    name: "Supabase" },
    { slug: "unity",       name: "Unity", inv: true },
    { slug: "csharp",      name: "C#" },
    { slug: "git",         name: "Git" },
    { slug: "github",      name: "GitHub", inv: true },
    { slug: "ffmpeg",      name: "FFmpeg", boost: true },
    { slug: "cloudflare",  name: "Cloudflare" },
  ],
};
