import { MASTER_FACTS, asset } from "../../content";
import { Icon } from "../Icons";
import { Reveal } from "../ui";

const VALUES = [
  "Уважение к наставнику и партнёру",
  "Постепенность: от простого к сложному",
  "Наставничество и личный пример",
  "Гармония тела и характера",
] as const;

export function Tradition() {
  return (
    <section
      id="tradition"
      className="relative scroll-mt-24 overflow-hidden border-y border-white/5 bg-ink-900/50 py-20 sm:py-24"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 -left-24 h-96 w-96 -translate-y-1/2 rounded-full bg-cinnabar-600/10 blur-[120px]"
      />
      <div className="container-x relative grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <Reveal>
          <span className="eyebrow">Традиция Шаолиня</span>
          <h2 className="mt-4 font-display text-3xl leading-tight font-bold text-balance sm:text-4xl">
            Ушу — это не про драку.{" "}
            <span className="text-gold-400">Это про путь.</span>
          </h2>
          <p className="mt-5 text-base leading-relaxed text-paper-100/70">
            Шаолиньское ушу учит ребёнка управлять телом, вниманием и
            эмоциями: уважать наставника и партнёра, доводить начатое до
            результата и расти шаг за шагом — от простого к сложному.
          </p>
          <p className="mt-4 text-base leading-relaxed text-paper-100/70">
            Школа работает в русле направления мастера{" "}
            <b className="text-paper-50">Ши Янчена</b> — это наша культурная
            основа и живая линия преемственности «от учителя к ученику».
          </p>
          <ul className="mt-7 grid gap-3 sm:grid-cols-2">
            {VALUES.map((value) => (
              <li key={value} className="flex items-start gap-2.5 text-sm">
                <Icon
                  name="check"
                  className="mt-0.5 h-4 w-4 shrink-0 text-gold-400"
                />
                <span className="text-paper-100/80">{value}</span>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={140} className="relative">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-16 -right-2 font-display text-[170px] leading-none text-gold-500/[0.07] select-none sm:-right-4"
          >
            武
          </span>
          <div className="relative rounded-3xl border border-gold-500/20 bg-gradient-to-b from-gold-500/[0.08] to-transparent p-7 sm:p-8">
            <span className="chip border-gold-500/30 bg-gold-500/10 text-gold-300">
              <Icon name="medal" className="h-3.5 w-3.5" />
              Ориентир школы
            </span>
            <h3 className="mt-4 font-display text-2xl font-bold">
              Мастер Ши Янчен
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-paper-100/60">
              Наставник направления, в традиции которого работает школа.
              Цель его школы — обучать шаолиньскому кунг-фу, передавая
              мастерство напрямую, от учителя к ученику.
            </p>
            <ul className="mt-5 space-y-2.5">
              {MASTER_FACTS.map((fact) => (
                <li key={fact} className="flex items-start gap-2.5 text-sm">
                  <Icon
                    name="check"
                    className="mt-0.5 h-4 w-4 shrink-0 text-gold-400"
                  />
                  <span className="text-paper-100/80">{fact}</span>
                </li>
              ))}
            </ul>
            <figure className="mt-6">
              <img
                src={asset("images/china/mironov-certificate.jpg")}
                alt="Аттестат Александра Миронова из школы мастера Ши Янчена (Дэнфэн, горы Суньшань)"
                width={1300}
                height={893}
                loading="lazy"
                decoding="async"
                className="w-full rounded-2xl border border-white/10 shadow-lg shadow-black/40"
              />
              <figcaption className="mt-2 text-xs leading-relaxed text-paper-100/60">
                Аттестат старшего тренера Александра Миронова из школы мастера
                Ши Янчена (Дэнфэн, горы Суньшань) — подтверждение прямой линии
                передачи традиции.
              </figcaption>
            </figure>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
