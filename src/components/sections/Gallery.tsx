import { useCallback, useEffect, useRef, useState } from "react";
import { GALLERY } from "../../content";
import { Icon } from "../Icons";
import { Reveal, SectionHeading } from "../ui";

export function Gallery() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const isOpen = openIndex !== null;
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  /* Кнопка, которой открыли лайтбокс, — вернём на неё фокус при закрытии */
  const openerRef = useRef<HTMLElement | null>(null);

  const close = useCallback(() => setOpenIndex(null), []);
  const showPrev = useCallback(() => {
    setOpenIndex((i) =>
      i === null ? null : (i - 1 + GALLERY.length) % GALLERY.length,
    );
  }, []);
  const showNext = useCallback(() => {
    setOpenIndex((i) => (i === null ? null : (i + 1) % GALLERY.length));
  }, []);

  const openAt = (index: number) => {
    openerRef.current = document.activeElement as HTMLElement | null;
    setOpenIndex(index);
  };

  /* Клавиатура: Escape закрывает, ← → листают */
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "ArrowRight") showNext();
      if (e.key === "Tab") {
        /* Модальное окно: фокус не должен уходить на страницу под ним */
        const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href]',
        );
        if (!focusable || focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const active = document.activeElement;
        if (!dialogRef.current?.contains(active)) {
          e.preventDefault();
          first.focus();
        } else if (e.shiftKey && active === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, close, showPrev, showNext]);

  /* Блокировка прокрутки страницы — отдельным эффектом, чтобы не дёргать её при листании */
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  /* Фокус внутрь диалога при открытии и обратно — при закрытии */
  useEffect(() => {
    if (isOpen) {
      closeButtonRef.current?.focus({ preventScroll: true });
      return;
    }
    openerRef.current?.focus?.({ preventScroll: true });
    openerRef.current = null;
  }, [isOpen]);

  return (
    <section id="gallery" className="scroll-mt-24 py-20 sm:py-24">
      <div className="container-x">
        <SectionHeading
          eyebrow="Галерея"
          title="Школа в поездках: Шаолинь и Китай"
          lead="Фотографии из поездок школы в монастырь Шаолинь и школу мастера Ши Янчена — традиция, которую мы передаём ученикам."
        />

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {GALLERY.map((photo, i) => (
            <Reveal key={photo.src} delay={(i % 3) * 90}>
              <button
                type="button"
                className="group relative block w-full overflow-hidden rounded-2xl border border-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-400"
                onClick={() => openAt(i)}
                aria-label={`Открыть фото: ${photo.alt}`}
              >
                <img
                  src={photo.src}
                  alt={photo.alt}
                  loading="lazy"
                  decoding="async"
                  className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-ink-950/70 via-transparent to-transparent opacity-80 transition-opacity group-hover:opacity-100"
                />
                <span className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-2 text-left text-xs font-bold text-paper-100/90">
                  <span className="line-clamp-1">{photo.alt}</span>
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold-500/90 text-ink-950 opacity-0 transition-opacity group-hover:opacity-100">
                    <Icon name="spark" className="h-3.5 w-3.5" />
                  </span>
                </span>
              </button>
            </Reveal>
          ))}
        </div>
      </div>

      {/* Лайтбокс */}
      {isOpen && openIndex !== null && (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label="Просмотр фотографии"
          className="fixed inset-0 z-[70] flex items-center justify-center bg-ink-950/95 p-4 backdrop-blur-sm"
          onClick={close}
        >
          <button
            type="button"
            ref={closeButtonRef}
            className="absolute top-4 right-4 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-paper-50 transition-colors hover:border-gold-400/50 hover:text-gold-300"
            onClick={close}
            aria-label="Закрыть просмотр"
          >
            <Icon name="close" className="h-5 w-5" />
          </button>

          <button
            type="button"
            className="absolute left-3 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-paper-50 transition-colors hover:border-gold-400/50 hover:text-gold-300 sm:left-6"
            onClick={(e) => {
              e.stopPropagation();
              showPrev();
            }}
            aria-label="Предыдущее фото"
          >
            <Icon name="chevron" className="h-5 w-5 rotate-90" />
          </button>

          <figure
            className="max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={GALLERY[openIndex].src}
              alt={GALLERY[openIndex].alt}
              className="max-h-[78vh] w-auto max-w-full rounded-2xl border border-white/10 object-contain shadow-2xl shadow-black/60"
            />
            <figcaption className="mt-3 text-center text-sm text-paper-100/75">
              {GALLERY[openIndex].alt}
              <span className="mt-1 block text-xs text-paper-100/60">
                {openIndex + 1} / {GALLERY.length} · используйте ← и → для
                переключения
              </span>
            </figcaption>
          </figure>

          <button
            type="button"
            className="absolute right-3 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-paper-50 transition-colors hover:border-gold-400/50 hover:text-gold-300 sm:right-6"
            onClick={(e) => {
              e.stopPropagation();
              showNext();
            }}
            aria-label="Следующее фото"
          >
            <Icon name="chevron" className="h-5 w-5 -rotate-90" />
          </button>
        </div>
      )}
    </section>
  );
}
