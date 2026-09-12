import { LOCATIONS, mapLink } from "../../content";
import { useLead } from "../../lead";
import { Icon } from "../Icons";
import { Reveal, SectionHeading } from "../ui";

/* Декоративная заглушка вместо интерактивной карты */
function MapPlaceholder({ label }: { label: string }) {
  return (
    <>
      <div className="absolute inset-0 bg-gradient-to-br from-ink-800 via-ink-850 to-ink-900" />
      <svg
        aria-hidden="true"
        viewBox="0 0 400 200"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
      >
        <g
          fill="none"
          stroke="rgba(248,243,234,0.13)"
          strokeWidth="3"
          strokeLinecap="round"
        >
          <path d="M-20 150 C 80 120, 160 175, 260 130 S 420 90, 470 115" />
          <path d="M70 -20 C 95 60, 45 120, 95 220" />
          <path d="M250 -20 C 205 45, 305 95, 265 220" />
        </g>
        <g fill="none" stroke="rgba(248,243,234,0.07)" strokeWidth="2">
          <path d="M-20 60 H 420" />
          <path d="M150 -20 V 220" />
        </g>
      </svg>
      <span className="absolute top-3 left-3 rounded-full bg-ink-950/70 px-3 py-1 text-[11px] font-bold text-paper-100/80 backdrop-blur-sm">
        {label}
      </span>
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="relative flex">
          <span className="absolute inline-flex h-12 w-12 animate-ping rounded-full bg-gold-500/25" />
          <span className="relative flex h-12 w-12 items-center justify-center rounded-full border border-gold-400/40 bg-ink-950/85 text-gold-400 shadow-lg">
            <Icon name="pin" className="h-5 w-5" />
          </span>
        </span>
      </span>
      <span className="absolute right-3 bottom-3 inline-flex items-center gap-1.5 rounded-full bg-gold-500/90 px-3 py-1.5 text-[11px] font-extrabold tracking-wide text-ink-950 uppercase">
        Открыть на карте
        <Icon name="arrow" className="h-3.5 w-3.5" />
      </span>
    </>
  );
}

export function Schedule() {
  const { open } = useLead();

  return (
    <section id="schedule" className="scroll-mt-24 py-20 sm:py-24">
      <div className="container-x">
        <SectionHeading
          eyebrow="Расписание и адреса"
          title="Выберите удобную локацию"
          lead="Два зала — в Солнечногорске и рядом с Зеленоградом. Приходите на бесплатную пробную тренировку в ближайшую."
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {LOCATIONS.map((loc, i) => (
            <Reveal key={loc.id} delay={i * 120} className="h-full">
              <article className="flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] transition-colors duration-300 hover:border-gold-500/30">
                <div className="flex items-start justify-between gap-4 border-b border-white/10 bg-gradient-to-br from-gold-500/10 via-transparent to-transparent p-6">
                  <div>
                    <h3 className="font-display text-2xl font-bold">
                      {loc.city}
                    </h3>
                    <p className="mt-1 text-sm font-semibold text-paper-100/70">
                      {loc.venue}
                    </p>
                  </div>
                  <span className="chip shrink-0 border-gold-500/25 bg-gold-500/10 text-gold-300">
                    <Icon name="clock" className="h-3.5 w-3.5" />
                    {loc.hours}
                  </span>
                </div>

                <div className="flex flex-1 flex-col gap-5 p-6">
                  <ul className="space-y-3 text-sm">
                    <li className="flex gap-3">
                      <Icon
                        name="pin"
                        className="mt-0.5 h-4 w-4 shrink-0 text-cinnabar-400"
                      />
                      <span className="text-paper-100/85">{loc.address}</span>
                    </li>
                    <li className="flex gap-3">
                      <Icon
                        name="clock"
                        className="mt-0.5 h-4 w-4 shrink-0 text-gold-400"
                      />
                      <span className="text-paper-100/85">
                        {loc.hours} · {loc.hoursNote}
                      </span>
                    </li>
                    {loc.features.map((feature) => (
                      <li key={feature} className="flex gap-3">
                        <Icon
                          name="check"
                          className="mt-0.5 h-4 w-4 shrink-0 text-gold-400"
                        />
                        <span className="text-paper-100/85">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <a
                    href={mapLink(loc.mapQuery)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative block h-40 overflow-hidden rounded-2xl border border-white/10 transition-colors hover:border-gold-500/40"
                    aria-label={`Открыть карту: ${loc.address}`}
                  >
                    <MapPlaceholder label={`${loc.city} · ${loc.venue}`} />
                  </a>

                  <div className="mt-auto flex flex-wrap gap-3">
                    <button
                      type="button"
                      className="btn btn-gold flex-1"
                      onClick={() => open({ location: loc.id })}
                    >
                      Записаться в эту группу
                    </button>
                    <a
                      className="btn btn-ghost"
                      href={mapLink(loc.mapQuery)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Как добраться
                    </a>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <p className="mt-8 text-center text-sm text-paper-100/55">
            Не уверены, какая группа подойдёт? Оставьте заявку — тренер
            подберёт вариант по возрасту и уровню ребёнка.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
