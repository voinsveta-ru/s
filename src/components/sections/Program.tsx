import { PROGRAM } from "../../content";
import { Icon } from "../Icons";
import { Reveal, SectionHeading } from "../ui";

export function Program() {
  return (
    <section id="program" className="scroll-mt-24 py-20 sm:py-24">
      <div className="container-x">
        <SectionHeading
          eyebrow="Программа"
          title="Что изучаем на тренировках"
          lead="Классическая программа шаолиньского ушу: от базовой техники до традиционного оружия — плюс физическая подготовка и дыхательные практики."
        />

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PROGRAM.map((item, i) => (
            <Reveal key={item.title} delay={(i % 3) * 90} className="h-full">
              <article className="card card-hover group relative h-full overflow-hidden">
                <span
                  aria-hidden="true"
                  className="absolute top-4 right-5 font-display text-xs font-bold text-paper-100/55 transition-colors group-hover:text-gold-400/70"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cinnabar-500/10 text-cinnabar-400 transition-colors duration-300 group-hover:bg-cinnabar-500/20">
                  <Icon name={item.icon} className="h-6 w-6" />
                </span>
                <h3 className="mt-5 text-lg font-bold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-paper-100/65">
                  {item.text}
                </p>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 rounded-2xl border border-gold-500/20 bg-gold-500/[0.06] px-6 py-4 text-center text-sm text-paper-100/75">
            <Icon name="spark" className="h-4 w-4 shrink-0 text-gold-400" />
            <span>
              Плюс на каждой тренировке:{" "}
              <b className="text-paper-50">
                растяжка, сила, ловкость, координация и концентрация
              </b>{" "}
              — всё встроено в занятие.
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
