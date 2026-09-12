import { MAILTO, PHONE_DISPLAY, PHONE_HREF } from "../../content";
import { useLead } from "../../lead";
import { LeadForm } from "../LeadForm";
import { Icon } from "../Icons";
import { Reveal } from "../ui";

export function FinalCta() {
  const { intent } = useLead();

  return (
    <section id="contacts" className="scroll-mt-24 py-20 sm:py-24">
      <div className="container-x">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2.5rem] border border-gold-500/20 bg-gradient-to-b from-ink-800 to-ink-900 p-6 sm:p-10 lg:p-12">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
            >
              <div className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-gold-500/10 blur-[100px]" />
              <div className="absolute bottom-0 left-0 h-56 w-56 rounded-full bg-cinnabar-600/10 blur-[100px]" />
            </div>

            <div className="relative grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-14">
              <div className="flex flex-col justify-center">
                <span className="eyebrow">Запись на тренировку</span>
                <h2 className="mt-4 font-display text-3xl leading-tight font-bold text-balance sm:text-4xl">
                  Попробуйте шаолиньское ушу —{" "}
                  <span className="text-gold-400">
                    первая тренировка бесплатно
                  </span>
                </h2>
                <p className="mt-5 max-w-md text-base leading-relaxed text-paper-100/70">
                  Оставьте телефон — тренер Александр сам перезвонит, ответит
                  на вопросы и подберёт группу по возрасту и уровню ребёнка.
                </p>

                <ol className="mt-6 space-y-2.5 text-sm">
                  {[
                    "Оставляете номер — это займёт 20 секунд",
                    "Тренер Александр перезванивает в течение дня",
                    "Приходите на бесплатную тренировку в удобном зале",
                  ].map((step, i) => (
                    <li key={step} className="flex items-center gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-gold-500/40 bg-gold-500/10 text-[11px] font-extrabold text-gold-300">
                        {i + 1}
                      </span>
                      <span className="text-paper-100/75">{step}</span>
                    </li>
                  ))}
                </ol>

                <div className="mt-7 flex flex-wrap gap-3">
                  <a href={PHONE_HREF} className="btn btn-gold">
                    <Icon name="phone" className="h-4 w-4" />
                    Позвонить
                  </a>
                  <a href={MAILTO} className="btn btn-ghost">
                    <Icon name="mail" className="h-4 w-4 text-gold-400" />
                    Написать на email
                  </a>
                </div>

                <ul className="mt-7 space-y-2 text-sm text-paper-100/60">
                  <li className="flex items-center gap-2.5">
                    <Icon name="phone" className="h-4 w-4 shrink-0 text-gold-400" />
                    {PHONE_DISPLAY}
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Icon name="clock" className="h-4 w-4 shrink-0 text-gold-400" />
                    Вт–Пт с 15:00 · Пн и Чт с 17:00
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Icon name="check" className="h-4 w-4 shrink-0 text-gold-400" />
                    На звонки отвечает тренер Александр — решим все вопросы
                    напрямую
                  </li>
                </ul>
              </div>

              <LeadForm intent={intent} />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
