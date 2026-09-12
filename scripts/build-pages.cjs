#!/usr/bin/env node
/*
 * Сборка для GitHub Pages.
 *
 * base НЕ захардкожен: он берётся из репозитория, в котором выполняется сборка.
 * История показала, почему (см. AUDIT.md, v5): при смене владельца/имени
 * репозитория захардкоженный base ломал все пути к ассетам на опубликованном
 * сайте, а `build:pages` в package.json расходился с тем, что делал workflow.
 * Теперь источник истины один — scripts/resolve-base.cjs (он же используется
 * в scripts/preview-pages.cjs для локального просмотра Pages-сборки).
 */
const { spawnSync } = require("node:child_process");
const path = require("node:path");
const { existsSync } = require("node:fs");
const { resolveBase } = require("./resolve-base.cjs");

const ROOT = path.resolve(__dirname, "..");

function fail(message) {
  console.error(`✗ ${message}`);
  process.exit(1);
}

function run(command, args) {
  const res = spawnSync(command, args, { cwd: ROOT, stdio: "inherit" });
  if (res.status !== 0) process.exit(res.status ?? 1);
}

const base = resolveBase();
console.log(`Сборка для GitHub Pages: base=${base}`);

/* vite — локальный бинарник из node_modules, без npx (работает и на Windows) */
const viteBin = path.join(ROOT, "node_modules", "vite", "bin", "vite.js");
if (!existsSync(viteBin)) {
  fail(`Не найден ${viteBin} — выполните npm install`);
}
run(process.execPath, [viteBin, "build", `--base=${base}`]);
/* 404.html + .nojekyll */
run(process.execPath, [path.join(__dirname, "postbuild.cjs")]);
