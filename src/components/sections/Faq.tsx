import { useState } from "react";
import { EMAIL, FAQ_ITEMS, MAILTO, PHONE_DISPLAY, PHONE_HREF } from "../../content";
import { Icon } from "../Icons";
import { Reveal, SectionHeading } from "../ui";

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="scroll-mt-24 py-20 sm:py-24">
      <div className="container-x max-w-3xl">
        <SectionHeading
          eyebrow="FAQ"
          title="Частые вопросы"
          lead="Собрали то, о чём спрашивают чаще всего. Не нашли ответ — просто позвоните, расскажем."
        />

        <div className="mt-10 space-y-3">
          {FAQ_ITEMS.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <Reveal key={item.q} delay={i * 40}>
                <div
                  className={`overflow-hidden rounded-2xl border transition-colors duration-300 ${
                    isOpen
                      ? "border-gold-500/30 bg-white/[0.05]"
                      : "border-white/10 bg-white/[0.03]"
                  }`}
                >
                  <h3>
                    <button
                      type="button"
                      id={`faq-question-${i}`}
                      className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-bold transition-colors hover:text-gold-300 sm:px-6"
                      aria-expanded={isOpen}
                      aria-controls={`faq-answer-${i}`}
                      onClick={() => setOpenIndex(isOpen ? null : i)}
                    >
                      {item.q}
                      <Icon
                        name="chevron"
                        className={`h-4 w-4 shrink-0 text-gold-400 transition-transform duration-300 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  </h3>
                  <div
                    id={`faq-answer-${i}`}
                    role="region"
                    aria-labelledby={`faq-question-${i}`}
                    /* Закрытая панель схлопнута, но остаётся в DOM из-за
                       анимации — прячем её от скринридеров */
                    aria-hidden={!isOpen}
                    className={`grid transition-all duration-300 ease-out ${
                      isOpen
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="px-5 pb-5 text-sm leading-relaxed text-paper-100/70 sm:px-6">
                        {item.a}
                      </p>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>

        <Reveal>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-x-7 gap-y-3 text-sm text-paper-100/60">
            <span>Остались вопросы?</span>
            <a
              href={PHONE_HREF}
              className="inline-flex items-center gap-2 font-bold text-gold-300 transition-colors hover:text-gold-200"
            >
              <Icon name="phone" className="h-4 w-4" />
              {PHONE_DISPLAY}
            </a>
            <a
              href={MAILTO}
              className="inline-flex items-center gap-2 font-bold text-gold-300 transition-colors hover:text-gold-200"
            >
              <Icon name="mail" className="h-4 w-4" />
              {EMAIL}
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
