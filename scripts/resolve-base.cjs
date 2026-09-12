/**
 * Резолвинг base-пути деплоя GitHub Pages.
 * Общий для сборки (scripts/build-pages.cjs) и локального превью
 * (scripts/preview-pages.cjs) — источник истины один.
 *
 * Порядок:
 *   1. SITE_BASE из окружения (если задали явно — например, base=/ для своего домена)
 *   2. GITHUB_REPOSITORY в Actions («owner/name»)
 *   3. git remote origin
 *   4. fallback: /s/ (боевой адрес сайта — https://voinsveta-ru.github.io/s/),
 *      чтобы скрипты не падали в окружении без git и без CI
 */
const { execFileSync } = require("node:child_process");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");

/** Имя репозитория из git remote (без .git) */
function repoFromGit() {
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

/** base со завершающим слешем («/» или «/s/») — так его ждёт Vite */
function resolveBase() {
  const explicit = process.env.SITE_BASE?.trim();
  if (explicit) {
    return explicit === "/" ? "/" : `${explicit.replace(/\/$/, "")}/`;
  }

  const repo = process.env.GITHUB_REPOSITORY?.split("/")[1] || repoFromGit();
  if (repo) return `/${repo}/`;

  return "/s/";
}

module.exports = { resolveBase };
