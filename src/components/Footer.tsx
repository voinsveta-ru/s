import {
  EMAIL,
  LOCATIONS,
  MAILTO,
  NAV_LINKS,
  PHONE_DISPLAY,
  PHONE_HREF,
  SCHOOL_NAME,
  asset,
} from "../content";
import { Icon } from "./Icons";
import { LogoMark } from "./ui";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-ink-900/60">
      <div className="container-x grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.3fr_0.7fr_1fr]">
        <div>
          <a href="#top" className="flex items-center gap-3">
            <LogoMark className="h-9 w-9" />
            <span className="font-display text-base font-bold tracking-wide">
              ВОИН <span className="text-gold-400">СВЕТА</span>
            </span>
          </a>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-paper-100/55">
            Развиваем силу, дисциплину и уверенность через традицию
            шаолиньского ушу.
          </p>
          <p className="mt-3 text-xs text-paper-100/60">
            Шаолиньское ушу и кунг-фу для детей и подростков 7–18 лет.
          </p>
        </div>

        <nav aria-label="Навигация в подвале">
          <h3 className="text-xs font-extrabold tracking-[0.22em] text-paper-100/60 uppercase">
            Разделы
          </h3>
          <ul className="mt-4 space-y-2.5">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="text-sm font-semibold text-paper-100/70 transition-colors hover:text-gold-300"
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li>
              <a
                href="#gallery"
                className="text-sm font-semibold text-paper-100/70 transition-colors hover:text-gold-300"
              >
                Галерея
              </a>
            </li>
            <li>
              <a
                href="#reviews"
                className="text-sm font-semibold text-paper-100/70 transition-colors hover:text-gold-300"
              >
                Отзывы
              </a>
            </li>
          </ul>
        </nav>

        <div>
          <h3 className="text-xs font-extrabold tracking-[0.22em] text-paper-100/60 uppercase">
            Контакты
          </h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <a
                href={PHONE_HREF}
                className="inline-flex items-center gap-2.5 font-bold text-paper-50 transition-colors hover:text-gold-300"
              >
                <Icon name="phone" className="h-4 w-4 text-gold-400" />
                {PHONE_DISPLAY}
              </a>
            </li>
            <li>
              <a
                href={MAILTO}
                className="inline-flex items-center gap-2.5 text-paper-100/70 transition-colors hover:text-gold-300"
              >
                <Icon name="mail" className="h-4 w-4 text-gold-400" />
                {EMAIL}
              </a>
            </li>
            {LOCATIONS.map((loc) => (
              <li key={loc.id} className="flex gap-2.5 text-paper-100/60">
                <Icon
                  name="pin"
                  className="mt-0.5 h-4 w-4 shrink-0 text-gold-400"
                />
                <span>
                  <b className="text-paper-100/85">{loc.city}</b> — {loc.address}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-5">
        <div className="container-x flex flex-col items-center justify-between gap-3 text-xs text-paper-100/60 sm:flex-row">
          <p>
            © {year} Школа шаолиньского ушу «{SCHOOL_NAME}». Все права
            защищены.
          </p>
          <div className="flex items-center gap-5">
            <a
              href={asset("privacy.html")}
              className="transition-colors hover:text-gold-300"
            >
              Политика конфиденциальности
            </a>
            <a
              href="#top"
              className="inline-flex items-center gap-1.5 font-bold text-paper-100/60 transition-colors hover:text-gold-300"
            >
              Наверх
              <Icon name="chevron" className="h-3.5 w-3.5 rotate-180" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
