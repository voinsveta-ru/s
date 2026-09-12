import { useEffect, useState } from "react";
import { NAV_LINKS, PHONE_DISPLAY, PHONE_HREF } from "../content";
import { Icon } from "./Icons";
import { LogoMark } from "./ui";

const MOBILE_NAV_ID = "mobile-navigation";

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* На десктопе мобильное меню скрыто — сбрасываем состояние,
     иначе шапка остаётся «залипшей» после поворота экрана/ресайза */
  useEffect(() => {
    if (!open) return;
    const desktop = window.matchMedia("(min-width: 64rem)");
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) setOpen(false);
    };
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    if (desktop.matches) setOpen(false);
    desktop.addEventListener("change", onChange);
    window.addEventListener("keydown", onKey);
    return () => {
      desktop.removeEventListener("change", onChange);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const solid = scrolled || open;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        solid
          ? "border-b border-white/10 bg-ink-950/90 backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      <div className="container-x flex h-[72px] items-center justify-between gap-4">
        <a
          href="#top"
          className="flex items-center gap-3"
          onClick={() => setOpen(false)}
        >
          <LogoMark />
          <span className="leading-none">
            <span className="font-display text-[15px] font-bold tracking-wide sm:text-base">
              ВОИН <span className="text-gold-400">СВЕТА</span>
            </span>
            <span className="mt-1 block text-[9px] font-bold tracking-[0.3em] text-paper-100/55 uppercase">
              шаолиньское ушу
            </span>
          </span>
        </a>

        <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Основная навигация">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-full px-2.5 py-2 text-[13px] font-semibold text-paper-100/75 transition-colors hover:bg-white/5 hover:text-gold-300 xl:px-3 xl:text-sm"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          <a
            href={PHONE_HREF}
            className="hidden items-center gap-2 text-sm font-bold text-paper-100/90 transition-colors hover:text-gold-300 xl:inline-flex"
          >
            <Icon name="phone" className="h-4 w-4 text-gold-400" />
            {PHONE_DISPLAY}
          </a>
          <a href="#contacts" className="btn btn-gold px-5 py-2.5 text-[13px]">
            Записаться
          </a>
        </div>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-paper-50 lg:hidden"
          aria-expanded={open}
          aria-controls={MOBILE_NAV_ID}
          aria-label={open ? "Закрыть меню" : "Открыть меню"}
          onClick={() => setOpen((v) => !v)}
        >
          <Icon name={open ? "close" : "menu"} className="h-5 w-5" />
        </button>
      </div>

      {open && (
        <nav
          id={MOBILE_NAV_ID}
          className="border-t border-white/10 bg-ink-950/95 backdrop-blur-md lg:hidden"
          aria-label="Мобильная навигация"
        >
          <div className="container-x flex flex-col gap-1 py-4">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-xl px-3 py-3 text-base font-semibold text-paper-100/85 transition-colors hover:bg-white/5 hover:text-gold-300"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="mt-3 flex flex-col gap-2.5 border-t border-white/10 pt-4">
              <a href={PHONE_HREF} className="btn btn-ghost w-full">
                <Icon name="phone" className="h-4 w-4 text-gold-400" />
                {PHONE_DISPLAY}
              </a>
              <a
                href="#contacts"
                className="btn btn-gold w-full"
                onClick={() => setOpen(false)}
              >
                Записаться на бесплатную тренировку
              </a>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
