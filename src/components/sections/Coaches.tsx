import { Reveal, SectionHeading } from "../ui";

const COACHES = [
  {
    initials: "АМ",
    name: "Александр Миронов",
    role: "Старший тренер по кунг-фу",
    text: "Отвечает за программу школы: от первых стоек новичка до аттестационных экзаменов по ступеням.",
  },
  {
    initials: "ТК",
    name: "Тимур Кузнецов",
    role: "Инструктор по ушу",
    text: "Ведёт занятия по базовой технике и физической подготовке, помогает ученикам уверенно осваивать комплексы.",
  },
] as const;

export function Coaches() {
  return (
    <section id="coaches" className="scroll-mt-24 py-20 sm:py-24">
      <div className="container-x">
        <SectionHeading
          eyebrow="Тренеры"
          title="Наставники школы"
          lead="Требовательные к технике и внимательные к детям. На пробной тренировке тренер лично познакомится с ребёнком и ответит на вопросы."
        />

        <div className="mx-auto mt-12 grid max-w-4xl gap-6 sm:grid-cols-2">
          {COACHES.map((coach, i) => (
            <Reveal key={coach.name} delay={i * 120} className="h-full">
              <article className="card card-hover relative h-full overflow-hidden text-center">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-4 -bottom-6 font-display text-[110px] leading-none text-gold-500/[0.06] select-none"
                >
                  武
                </span>
                <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border border-gold-500/30 bg-gradient-to-b from-gold-500/20 to-cinnabar-600/10 font-display text-2xl font-bold text-gold-300">
                  {coach.initials}
                </span>
                <h3 className="mt-5 font-display text-xl font-bold">
                  {coach.name}
                </h3>
                <p className="mt-1 text-xs font-extrabold tracking-[0.18em] text-gold-400 uppercase">
                  {coach.role}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-paper-100/65">
                  {coach.text}
                </p>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <p className="mt-8 text-center text-xs text-paper-100/60">
            Приходите знакомиться лично — первая тренировка бесплатна.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
