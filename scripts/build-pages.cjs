#!/usr/bin/env node
/*
 * Сборка для GitHub Pages.
 *
 * base НЕ захардкожен: он берётся из репозитория, в котором выполняется сборка.
 * История показала, почему (см. AUDIT.md, v5): при смене владельца/имени
 * репозитория захардкоженный base ломал все пути к ассетам на опубликованном
 * сайте, а `build:pages` в package.json расходился с тем, что делал workflow.
 * Теперь источник истины один.
 *
 * Порядок:
 *   1. SITE_BASE из окружения (если задали явно — например, base=/ для своего домена)
 *   2. GITHUB_REPOSITORY в Actions («owner/name»)
 *   3. git remote origin
 *   4. fallback: /s/ (боевой адрес сайта — https://voinsveta-ru.github.io/s/),
 *      чтобы сборка не падала в окружении без git и без CI
 */
const { execFileSync, spawnSync } = require("node:child_process");
const path = require("node:path");
const { existsSync } = require("node:fs");

const ROOT = path.resolve(__dirname, "..");

/** Имя репозитория из git remote (без .git) */
function baseFromGit() {
  try {
    const url = execFileSync("git", ["remote", "get-url", "origin"], {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    if (!url) return null;
    // https://github.com/owner/name.git | git@github.com:owner/name.git
    const m = url.match(/\/([^/]+?)(?:\.git)?$/) || url.match(/:([^/]+?)(?:\.git)?$/);
    return m ? m[1] : null;
  } catch {
    return null;
  }
}

function resolveBase() {
  const explicit = process.env.SITE_BASE?.trim();
  if (explicit) {
    /* vite ждёт base с завершающим слешем («/» или «/s/») */
    return explicit === "/" ? "/" : `${explicit.replace(/\/$/, "")}/`;
  }

  const repo = process.env.GITHUB_REPOSITORY?.split("/")[1] || baseFromGit();
  if (repo) return `/${repo}/`;

  return "/s/";
}

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
