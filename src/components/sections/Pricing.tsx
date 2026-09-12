import {
  PHONE_DISPLAY,
  PHONE_HREF,
  PRICE_NEW,
  PRICE_OLD,
} from "../../content";
import { useLead } from "../../lead";
import { Icon } from "../Icons";
import { Reveal, SectionHeading } from "../ui";

export function Pricing() {
  const { open } = useLead();

  return (
    <section id="pricing" className="scroll-mt-24 py-20 sm:py-24">
      <div className="container-x">
        <SectionHeading
          eyebrow="Стоимость"
          title="Цены на абонементы"
          lead="Первое занятие — всегда бесплатно. А пока идёт набор в новые группы, действует специальная цена."
        />

        <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-2">
          {/* Пробная тренировка */}
          <Reveal className="h-full">
            <article className="card flex h-full flex-col p-7 sm:p-8">
              <span className="chip w-fit">
                <Icon name="spark" className="h-3.5 w-3.5 text-gold-400" />
                Для новых учеников
              </span>
              <div className="mt-5 flex items-end gap-2">
                <span className="font-display text-4xl font-bold sm:text-5xl">
                  0 ₽
                </span>
                <span className="pb-1.5 text-sm text-paper-100/55">
                  пробная тренировка
                </span>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-paper-100/65">
                Бесплатное знакомство со школой: посмотрите зал, ребёнок
                позанимается в группе, а тренер ответит на все вопросы и
                подберёт ступень.
              </p>
              <button
                type="button"
                className="btn btn-ghost mt-6 w-full"
                onClick={() => open()}
              >
                Записаться бесплатно
              </button>
            </article>
          </Reveal>

          {/* Акция набора */}
          <Reveal delay={120} className="h-full">
            <article className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-gold-500/40 bg-gradient-to-b from-gold-500/[0.12] to-transparent p-7 shadow-[0_20px_60px_-30px_rgba(207,159,75,0.45)] sm:p-8">
              <span className="absolute top-5 right-5 rounded-full bg-cinnabar-500 px-3 py-1.5 text-[10px] font-extrabold tracking-[0.18em] text-paper-50 uppercase shadow-lg shadow-cinnabar-600/30">
                Акция набора
              </span>

              <span className="chip w-fit border-gold-500/30 bg-gold-500/10 text-gold-300">
                <Icon name="flame" className="h-3.5 w-3.5" />
                Новые группы
              </span>

              <div className="mt-5">
                <s className="text-lg font-semibold text-paper-100/60">
                  {PRICE_OLD}
                </s>
                <div className="mt-1 flex items-end gap-2">
                  <span className="bg-gradient-to-r from-gold-300 via-gold-400 to-gold-600 bg-clip-text font-display text-4xl font-bold text-transparent sm:text-5xl">
                    {PRICE_NEW}
                  </span>
                </div>
                <p className="mt-1 text-xs text-paper-100/55">
                  временная цена на абонементы в новые группы
                </p>
              </div>

              <p className="mt-4 flex items-start gap-2.5 text-sm leading-relaxed text-paper-100/75">
                <Icon
                  name="clock"
                  className="mt-0.5 h-4 w-4 shrink-0 text-gold-400"
                />
                Набор идёт прямо сейчас — успейте записаться по цене акции,
                количество мест в группах ограничено.
              </p>

              <div className="mt-auto pt-6">
                <button
                  type="button"
                  className="btn btn-gold w-full"
                  onClick={() => open()}
                >
                  Записаться по акции
                  <Icon name="arrow" className="h-4 w-4" />
                </button>
                <p className="mt-3 text-center text-xs text-paper-100/55">
                  Подробности по телефону:{" "}
                  <a
                    href={PHONE_HREF}
                    className="font-bold text-gold-300 hover:text-gold-200"
                  >
                    {PHONE_DISPLAY}
                  </a>
                </p>
              </div>
            </article>
          </Reveal>
        </div>

        <Reveal>
          <p className="mx-auto mt-8 max-w-2xl text-center text-xs leading-relaxed text-paper-100/60">
            Итоговая стоимость зависит от группы и программы. Актуальные условия
            и действующие акции уточняйте по телефону у тренера Александра.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
