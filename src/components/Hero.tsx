import { asset } from "../content";
import { Icon } from "./Icons";
import { Reveal } from "./ui";

const BADGES = [
  "7–18 лет",
  "Мальчики и девочки",
  "Новичкам можно",
  "Солнечногорск / Зеленоград",
] as const;

const STATS = [
  { value: "6", label: "ступеней обучения — с экзаменами и аттестатами" },
  { value: "2", label: "локации: Солнечногорск и Зеленоград / Голубое" },
  { value: "7–18", label: "лет — возраст учеников, мальчики и девочки" },
  { value: "0 ₽", label: "стоит первая пробная тренировка" },
] as const;

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      {/* Фоновые акценты */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 right-[-12%] h-[560px] w-[560px] rounded-full bg-gold-500/10 blur-[120px]" />
        <div className="absolute bottom-[-35%] left-[-10%] h-[480px] w-[480px] rounded-full bg-cinnabar-600/10 blur-[120px]" />
        <div className="absolute inset-0 bg-[radial-gradient(rgba(248,243,234,0.045)_1px,transparent_1px)] [background-size:24px_24px]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-500/30 to-transparent" />
      </div>

      {/* pt-[92px] больше высоты фиксированной шапки (72px): иначе на мобильных
          шапка наезжает на первый блок hero */}
      <div className="container-x relative grid items-center gap-12 pt-[92px] pb-16 sm:pt-24 lg:grid-cols-[1.05fr_0.95fr] lg:pb-20">
        {/* Текстовая часть */}
        <div>
          <Reveal>
            <span className="chip border-gold-500/25 bg-gold-500/10 text-gold-300">
              <Icon name="flame" className="h-3.5 w-3.5" />
              Шаолиньская традиция · набор 7–18 лет
            </span>
          </Reveal>

          <Reveal delay={80}>
            <h1 className="mt-6 font-display text-[2rem] leading-[1.12] font-bold text-balance sm:text-5xl xl:text-[3.4rem]">
              Шаолиньское{" "}
              <span className="bg-gradient-to-r from-gold-300 via-gold-400 to-gold-600 bg-clip-text text-transparent">
                ушу
              </span>{" "}
              для детей и подростков 7–18 лет
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-paper-100/75 sm:text-lg">
              Групповые занятия в Солнечногорске и Зеленограде. Развиваем силу,
              гибкость, координацию, дисциплину и уверенность — без агрессии и
              с уважением к традиции.
            </p>
          </Reveal>

          <Reveal delay={240}>
            <div className="mt-8 flex flex-wrap items-center gap-3.5">
              <a href="#contacts" className="btn btn-gold btn-lg">
                Записаться на бесплатную тренировку
                <Icon name="arrow" className="h-4 w-4" />
              </a>
              <a href="#schedule" className="btn btn-ghost btn-lg">
                Посмотреть расписание
              </a>
            </div>
            <p className="mt-3.5 text-xs font-semibold text-paper-100/60">
              Первая тренировка бесплатно · идёт набор в новые группы:{" "}
              <span className="text-gold-300">от 3 900 ₽/мес</span>{" "}
              <s className="opacity-60">вместо от 4 900 ₽/мес</s>
            </p>
          </Reveal>

          <Reveal delay={320}>
            <ul className="mt-8 flex flex-wrap gap-2">
              {BADGES.map((badge) => (
                <li key={badge} className="chip">
                  <Icon name="check" className="h-3.5 w-3.5 text-gold-400" />
                  {badge}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        {/* Визуальная часть */}
        <Reveal delay={200} className="relative">
          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div
              aria-hidden="true"
              className="absolute -inset-5 rounded-[2.5rem] bg-gradient-to-br from-gold-500/20 via-transparent to-cinnabar-600/20 blur-2xl"
            />

            <svg
              aria-hidden="true"
              viewBox="0 0 100 100"
              className="animate-spin-slow absolute -top-12 -left-8 h-28 w-28 text-gold-500/35 sm:-left-12"
            >
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray="230 34"
              />
            </svg>

            <figure className="relative overflow-hidden rounded-[2rem] border border-white/10 shadow-2xl shadow-black/50">
              <img
                src={asset("images/china/monks-demo.jpg")}
                alt="Демонстрация шаолиньского ушу монахами в монастыре Шаолинь"
                width={1100}
                height={619}
                className="aspect-[16/10] w-full object-cover"
                loading="eager"
                decoding="async"
                fetchPriority="high"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-950/75 via-transparent to-ink-950/15" />
              <figcaption className="absolute inset-x-4 bottom-4 flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-ink-950/60 px-4 py-3 backdrop-blur-md">
                <span className="text-sm font-bold">
                  Первая тренировка — бесплатно
                </span>
                <a
                  href="#contacts"
                  className="inline-flex items-center gap-1.5 text-xs font-extrabold tracking-wider text-gold-300 uppercase transition-colors hover:text-gold-200"
                >
                  Записаться
                  <Icon name="arrow" className="h-3.5 w-3.5" />
                </a>
              </figcaption>
            </figure>
            <p className="mt-3 text-center text-xs text-paper-100/60">
              Фото из поездок школы в монастырь Шаолинь — смотрите{" "}
              <a
                href="#gallery"
                className="font-bold text-gold-300 hover:text-gold-200"
              >
                галерею
              </a>
            </p>

            <div
              aria-hidden="true"
              className="animate-float-soft absolute -top-3 -right-2 rounded-xl border border-cinnabar-400/50 bg-cinnabar-600/90 px-3.5 py-2.5 text-center shadow-xl shadow-cinnabar-600/30 sm:-right-4"
            >
              <span className="block font-display text-2xl leading-none font-bold text-paper-50">
                武
              </span>
              <span className="mt-1.5 block text-[9px] font-bold tracking-[0.22em] text-paper-100/85 uppercase">
                Шаолинь
              </span>
            </div>
          </div>
        </Reveal>
      </div>

      {/* Полоса фактов */}
      <div className="relative border-t border-white/5">
        <div className="container-x grid grid-cols-2 gap-x-6 gap-y-8 py-9 lg:grid-cols-4">
          {STATS.map((stat) => (
            <Reveal key={stat.value}>
              <div className="font-display text-3xl font-bold text-gold-400 sm:text-4xl">
                {stat.value}
              </div>
              <div className="mt-1.5 max-w-[220px] text-xs leading-relaxed text-paper-100/55">
                {stat.label}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
