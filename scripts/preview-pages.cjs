#!/usr/bin/env node
/*
 * Локальный просмотр Pages-сборки с правильным base.
 *
 * Ловушка: `npm run build:pages && npm run preview` открывает сайт с base «/»
 * из vite.config.ts — preview не знает, с каким base собирался dist. В итоге
 * любой запрос по /s/... отдаёт index.html (SPA-fallback), и кажется, будто
 * сборка сломана. Этот скрипт запускает vite preview с тем же base,
 * которым собирал build:pages (scripts/resolve-base.cjs).
 *
 * Использование: npm run build:pages && npm run preview:pages
 */
const { spawnSync } = require("node:child_process");
const path = require("node:path");
const { existsSync } = require("node:fs");
const { resolveBase } = require("./resolve-base.cjs");

const ROOT = path.resolve(__dirname, "..");
const base = resolveBase();
console.log(
  `Превью Pages-сборки (base=${base}): http://localhost:4173${base}`,
);

const viteBin = path.join(ROOT, "node_modules", "vite", "bin", "vite.js");
if (!existsSync(viteBin)) {
  console.error(`✗ Не найден ${viteBin} — выполните npm install`);
  process.exit(1);
}

const res = spawnSync(
  process.execPath,
  [viteBin, "preview", "--port", "4173", "--base", base],
  { cwd: ROOT, stdio: "inherit" },
);
process.exit(res.status ?? 1);
