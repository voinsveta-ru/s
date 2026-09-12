import { TESTIMONIALS } from "../../content";
import { useLead } from "../../lead";
import { Icon } from "../Icons";
import { Reveal, SectionHeading } from "../ui";

/**
 * Отзывы родителей. Тексты созданы для запуска сайта — со временем
 * рекомендуется заменять реальными отзывами (скрины переписок, Яндекс.Карты).
 */
export function Testimonials() {
  const { open } = useLead();

  return (
    <section id="reviews" className="scroll-mt-24 py-20 sm:py-24">
      <div className="container-x">
        <SectionHeading
          eyebrow="Отзывы родителей"
          title="Что говорят семьи учеников"
          lead="Родители приводят детей за дисциплиной и здоровьем, а остаются — из-за отношения тренера и атмосферы в группе."
        />

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} delay={(i % 3) * 90} className="h-full">
              <figure className="card card-hover flex h-full flex-col">
                <span
                  aria-hidden="true"
                  className="font-display text-3xl leading-none text-gold-500/40"
                >
                  «
                </span>
                <blockquote className="mt-1 flex-1 text-sm leading-relaxed text-paper-100/80">
                  {t.text}
                </blockquote>
                <figcaption className="mt-5 flex items-center gap-3 border-t border-white/10 pt-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold-500/30 bg-gold-500/10 text-sm font-bold text-gold-300">
                    {t.name.slice(0, 1)}
                  </span>
                  <span>
                    <span className="block text-sm font-bold">{t.name}</span>
                    <span className="block text-xs text-paper-100/55">
                      {t.meta}
                    </span>
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 text-center sm:flex-row">
            <p className="text-sm text-paper-100/65">
              Хотите такое же впечатление от тренировок у своего ребёнка?
            </p>
            <button
              type="button"
              className="btn btn-gold px-5 py-2.5 text-[13px]"
              onClick={() => open()}
            >
              Записаться бесплатно
              <Icon name="arrow" className="h-4 w-4" />
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
