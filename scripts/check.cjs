/**
 * Проверка целостности сборки (запускается после `vite build`).
 *
 * Ловит класс ошибок, которые не видны ни tsc, ни глазу в dev-режиме:
 * битые пути к фото после деплоя на GitHub Pages (base=/имя-репо/),
 * несуществующие якоря, рассинхрон FAQ в JSON-LD и в `src/content.ts`,
 * неверные размеры og:image и «поехавшие» телефоны/почту.
 *
 * Использование: node scripts/check.cjs [--dist=dist] [--base=/s/]
 * Код возврата 1 — значит публиковать такую сборку нельзя.
 * Предупреждения (⚠) сборку не блокируют: это то, что стоит поправить руками
 * (например, адрес сайта сменился, а canonical/остались старыми).
 */
const { existsSync, readFileSync, readdirSync, statSync } = require("node:fs");
const path = require("node:path");

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, "").split("=");
    return [k, v ?? true];
  }),
);
const DIST = path.resolve(args.dist || "dist");
const problems = [];
const warnings = [];
const notes = [];
const fail = (msg) => problems.push(msg);
/* Предупреждение не блокирует публикацию, но и молчать о нём нельзя */
const warn = (msg) => warnings.push(msg);

/* ------------------------------- утилиты ------------------------------- */

const read = (file) => readFileSync(file, "utf8");
const isFile = (p) => existsSync(p) && statSync(p).isFile();

/**
 * HTML-сущности → символы. JSON-LD в index.html пишется руками, и `&nbsp;`
 * там — обычное дело, а в бандле тот же текст лежит настоящим неразрывным
 * пробелом. Без декодирования сверка FAQ давала бы ложный «рассинхрон».
 */
function decodeEntities(text) {
  const named = { nbsp: "\u00a0", mdash: "\u2014", ndash: "\u2013", laquo: "\u00ab", raquo: "\u00bb", quot: '"', amp: "&", lt: "<", gt: ">", apos: "'" };
  return String(text).replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (all, body) => {
    if (body[0] === "#") {
      const code = body[1] === "x" || body[1] === "X" ? parseInt(body.slice(2), 16) : Number(body.slice(1));
      return Number.isFinite(code) && code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : all;
    }
    const key = body.toLowerCase();
    return key in named ? named[key] : all;
  });
}

/** Все строковые литералы свойства (`id:"x"`, `href:`#x``, `src='x'`) */function props(source, prop) {
  const out = [];
  const re = new RegExp(`${prop}\\s*[:=]\\s*(['"\`])((?:\\\\.|(?!\\1)[^\\\\])*)\\1`, "g");
  let m;
  while ((m = re.exec(source))) out.push(m[2]);
  return out;
}

/** Размеры JPEG по маркерам SOF (без внешних библиотек) */
function jpegSize(file) {
  const buf = readFileSync(file);
  if (buf[0] !== 0xff || buf[1] !== 0xd8) return null;
  let i = 2;
  while (i + 9 < buf.length) {
    if (buf[i] !== 0xff) {
      i += 1;
      continue;
    }
    const marker = buf[i + 1];
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
      return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
    }
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      i += 2;
      continue;
    }
    i += 2 + buf.readUInt16BE(i + 2);
  }
  return null;
}

function walk(dir, base = dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full, base));
    else out.push(path.relative(base, full).split(path.sep).join("/"));
  }
  return out;
}

/* ------------------------------ 0. состав dist ------------------------------ */

if (!isFile(path.join(DIST, "index.html"))) {
  console.error(`✖ ${DIST}/index.html не найден — сначала соберите проект`);
  process.exit(1);
}

const html = read(path.join(DIST, "index.html"));
const files = new Set(walk(DIST));
const assets = [...files].filter((f) => f.startsWith("assets/"));
const bundle = assets
  .filter((f) => f.endsWith(".js") || f.endsWith(".css"))
  .map((f) => read(path.join(DIST, f)))
  .join("\n");

/* Base берём из собранного index.html: <script src="/voinsveta/assets/..."> */
let base = args.base;
if (!base) {
  const scriptSrc = props(html, "src").find((s) => s.includes("/assets/"));
  base = scriptSrc ? scriptSrc.slice(0, scriptSrc.indexOf("/assets/") + 1) : "/";
}
notes.push(`dist=${DIST} base=${base} файлов=${files.size}`);

/* --------------------- 1. обязательные файлы Pages --------------------- */

for (const required of ["index.html", "privacy.html", "robots.txt", "sitemap.xml", "favicon.svg"]) {
  if (!files.has(required)) fail(`в dist нет ${required}`);
}
/* 404.html и .nojekyll появляются после scripts/postbuild.cjs (сборка для Pages) */
if (files.has("404.html")) {
  if (read(path.join(DIST, "404.html")) !== html) {
    fail("404.html отличается от index.html — SPA-fallback для Pages сломан");
  }
  if (!files.has(".nojekyll")) fail("в dist нет .nojekyll — Pages соберут сайт Jekyll'ом");
} else {
  notes.push("404.html нет — сборка без scripts/postbuild.cjs (не Pages-вариант)");
}

/* ------------------- 2. локальные ссылки из index.html ------------------- */

const localUrl = (value) => {
  if (!value || /^(https?:|mailto:|tel:|sms:|data:|javascript:|#)/.test(value)) return null;
  if (!value.startsWith("/")) return value.split("?")[0].split("#")[0] || null; // относительный путь
  return value.slice(base.length - 1).replace(/^\//, "");
};

for (const value of [...props(html, "href"), ...props(html, "src")]) {
  const rel = localUrl(value);
  if (rel === null) continue;
  if (!files.has(rel)) fail(`index.html ссылается на несуществующий ${value}`);
  /* Относительный путь на Pages ломается на любом вложенном URL (404-fallback
     отдаёт index.html по адресу /любой/путь) — нужен путь с base. */
  else if (!value.startsWith("/")) {
    warn(
      `index.html: относительный путь «${value}» — на вложенном адресе Pages ` +
        `(404-fallback) он уедет в несуществующий каталог; используйте путь с base`,
    );
  }
}

/* --------------- 3. пути к ассетам внутри JS/CSS-бандла --------------- */

const assetRefs = new Set();
for (const m of bundle.matchAll(/(?:images|fonts|img)\/[A-Za-z0-9._\-/]+\.(?:jpg|jpeg|png|svg|webp|avif|woff2?)/g)) {
  assetRefs.add(m[0]);
}
for (const ref of assetRefs) {
  if (!files.has(ref)) fail(`бандл ссылается на несуществующий ассет /${ref}`);
}
notes.push(`ассетов в бандле: ${assetRefs.size}`);

/* ------------------------- 4. якоря навигации ------------------------- */

const declaredIds = new Set([
  ...props(html, "id"),
  ...props(bundle, "id").filter((v) => !v.includes("${")),
  "root",
]);
const anchors = new Set([
  ...props(html, "href").filter((h) => h.startsWith("#")),
  ...props(bundle, "href").filter((h) => h.startsWith("#") && !h.includes("${")),
]);
for (const anchor of anchors) {
  const id = anchor.slice(1);
  if (!declaredIds.has(id)) fail(`якорь ${anchor} не ведёт ни на один id`);
}
notes.push(`якорей проверено: ${anchors.size}, id в разметке: ${declaredIds.size}`);

/* --------------------------- 5. JSON-LD и FAQ --------------------------- */

const jsonLd = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => {
  try {
    return JSON.parse(m[1]);
  } catch (e) {
    fail(`JSON-LD не парсится: ${e.message}`);
    return null;
  }
});
const organization = jsonLd.find((d) => d && String(d["@type"]).includes("Organization"));
const faqPage = jsonLd.find((d) => d && d["@type"] === "FAQPage");

if (!organization) fail("в index.html нет JSON-LD организации");
if (!faqPage) fail("в index.html нет JSON-LD FAQPage");

/* Видимый FAQ собирается из src/content.ts — его строки обязаны быть в бандле.
   JSON-LD пишется руками, поэтому сверяем его с бандлом дословно. */
if (faqPage) {
  const questions = faqPage.mainEntity ?? [];
  if (questions.length < 5) fail(`в JSON-LD всего ${questions.length} вопросов — похоже на обрезанный FAQ`);
  for (const q of questions) {
    if (q["@type"] !== "Question" || !q.name || !q.acceptedAnswer?.text) {
      fail(`некорректный элемент FAQ: ${JSON.stringify(q).slice(0, 80)}`);
      continue;
    }
    const question = decodeEntities(q.name);
    const answer = decodeEntities(q.acceptedAnswer.text);
    if (!bundle.includes(question)) {
      fail(`вопрос FAQ «${question}» не найден на странице (рассинхрон JSON-LD и content.ts)`);
    }
    if (!bundle.includes(answer)) {
      fail(`ответ FAQ на «${question}» расходится с текстом на странице`);
    }
  }
  notes.push(`FAQ в JSON-LD: ${questions.length} вопросов, сверено с бандлом`);
}

/* --------------------- 6. контакты: телефон и почта --------------------- */

const contentTs = read(path.join(__dirname, "..", "src", "content.ts"));
const allowedTels = new Set(props(contentTs, "PHONE_HREF").concat(props(contentTs, "CAMP_PHONE_HREF")));
const contentPhones = [...contentTs.matchAll(/tel:\+?\d[\d\s()-]{8,}/g)].map((m) => m[0].replace(/[^\d+]/g, ""));
contentPhones.forEach((p) => allowedTels.add(p));

const usedTels = new Set([
  ...props(html, "href").filter((h) => h.startsWith("tel:")),
  ...props(bundle, "href").filter((h) => h.startsWith("tel:")),
]);
for (const tel of usedTels) {
  if (!allowedTels.has(tel)) fail(`${tel} не совпадает с телефонами из src/content.ts`);
}
notes.push(`tel-ссылок: ${usedTels.size}`);

const emails = new Set(
  [...contentTs.matchAll(/[\w.+-]+@[\w-]+\.[\w.]+/g)].map((m) => m[0].toLowerCase()),
);
for (const mail of [...props(html, "href"), ...props(bundle, "href")].filter((h) => h.startsWith("mailto:"))) {
  const address = mail.replace("mailto:", "").split("?")[0].toLowerCase();
  if (!emails.has(address)) fail(`mailto:${address} не совпадает с почтой из src/content.ts`);
}
for (const mail of html.matchAll(/content="([\w.+-]+@[\w-]+\.[\w.]+)"/g)) {
  if (!emails.has(mail[1].toLowerCase())) fail(`почта ${mail[1]} в meta не совпадает с src/content.ts`);
}
if (organization?.email && !emails.has(String(organization.email).toLowerCase())) {
  fail(`email в JSON-LD (${organization.email}) не совпадает с src/content.ts`);
}
if (organization?.telephone) {
  const digits = String(organization.telephone).replace(/\D/g, "");
  if (![...allowedTels].some((tel) => tel.replace(/\D/g, "").endsWith(digits))) {
    fail(`telephone в JSON-LD (${organization.telephone}) не совпадает с src/content.ts`);
  }
}

/* ------------------------------ 7. Open Graph ------------------------------ */

const meta = (property) => {
  const m = html.match(new RegExp(`<meta[^>]+(?:property|name)="${property}"[^>]+content="([^"]*)"`)) ||
    html.match(new RegExp(`<meta[^>]+content="([^"]*)"[^>]+(?:property|name)="${property}"`));
  return m ? m[1] : null;
};

const canonical = meta("canonical") ?? html.match(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/)?.[1];
if (!canonical) fail("нет canonical");
if (!meta("description")) fail("нет meta description");
if (!meta("og:title") || !meta("og:url") || !meta("og:image")) fail("неполный Open Graph");

const ogImage = meta("og:image");
if (ogImage) {
  if (!ogImage.startsWith(canonical ?? "___")) {
    fail(`og:image (${ogImage}) лежит вне canonical-домена (${canonical})`);
  }
  const rel = ogImage.replace(new RegExp(`^${canonical}`), "");
  if (!files.has(rel)) fail(`og:image указывает на несуществующий файл ${rel}`);
  else {
    const size = jpegSize(path.join(DIST, rel));
    const width = meta("og:image:width");
    const height = meta("og:image:height");
    if (size && width && height && (String(size.width) !== width || String(size.height) !== height)) {
      fail(`og:image:width/height = ${width}×${height}, а файл ${rel} — ${size.width}×${size.height}`);
    }
    if (size) notes.push(`og:image ${rel}: ${size.width}×${size.height}`);
  }
}

/* --------------------------- 8. sitemap и robots --------------------------- */

const sitemap = isFile(path.join(DIST, "sitemap.xml")) ? read(path.join(DIST, "sitemap.xml")) : "";
const robots = isFile(path.join(DIST, "robots.txt")) ? read(path.join(DIST, "robots.txt")) : "";
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
if (sitemapUrls.length === 0) fail("в sitemap.xml нет ни одного <loc>");
for (const url of sitemapUrls) {
  if (canonical && !url.startsWith(canonical.replace(/\/$/, ""))) {
    fail(`sitemap.xml: ${url} не соответствует canonical ${canonical}`);
  }
}
const sitemapInRobots = robots.match(/^Sitemap:\s*(\S+)$/m)?.[1];
if (!sitemapInRobots) fail("в robots.txt нет строки Sitemap:");
else if (!sitemapUrls.includes(sitemapInRobots) && !sitemapInRobots.endsWith("sitemap.xml")) {
  fail(`robots.txt: Sitemap ${sitemapInRobots} не согласован с sitemap.xml`);
}
if (canonical && !html.includes(`href="${canonical}"`)) fail("canonical в index.html не совпадает с og:url");

/*
 * Адрес сайта должен совпадать с тем путём, по которому сборка реально
 * публикуется (base). Иначе rel=canonical и sitemap ведут поисковика не туда,
 * где лежит сайт, — а это тихо сжигает весь SEO-эффект.
 *
 * Это предупреждение, а не ошибка: адрес мог смениться намеренно (репозиторий
 * переименовали, подключили свой домен), и тогда чинить нужно четыре файла
 * сразу — index.html (canonical + og:url), public/sitemap.xml,
 * public/robots.txt.
 */
if (canonical) {
  const canonicalPath = new URL(canonical).pathname.replace(/\/$/, "") + "/";
  if (canonicalPath !== base) {
    warn(
      `canonical ${canonical} не совпадает с base сборки ${base}: ` +
        `поисковики будут индексировать другой адрес. Обновите canonical и og:url ` +
        `в index.html, public/sitemap.xml и public/robots.txt — либо соберите с SITE_BASE=${canonicalPath}`,
    );
  }
  notes.push(`canonical ${canonical} (base сборки ${base})`);
}

/* ------------------------------- итог ------------------------------- */

console.log("Проверка сборки «Воин Света»");
notes.forEach((n) => console.log(`  · ${n}`));
if (warnings.length > 0) {
  console.warn(`\n⚠ Предупреждений: ${warnings.length}`);
  warnings.forEach((w, i) => console.warn(`  ${i + 1}. ${w}`));
}
if (problems.length === 0) {
  console.log(`\n✔ Ошибок не найдено (${notes.length} проверок)`);
  process.exit(0);
}
console.error(`\n✖ Найдено проблем: ${problems.length}`);
problems.forEach((p, i) => console.error(`  ${i + 1}. ${p}`));
process.exit(1);
