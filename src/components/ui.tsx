import { useEffect, useRef, type ReactNode } from "react";

/* Появление блока при попадании во вьюпорт (без библиотек) */
export function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    /*
     * Показываем блок сразу, если IntersectionObserver недоступен (старые
     * WebView/браузеры). Без этой проверки `new IntersectionObserver` бросал
     * исключение — а так как контент целиком рисуется из JS, падала вся
     * страница: пользователь видел бы пустой тёмный экран.
     */
    if (
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      el.classList.add("is-visible");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}

/* Заголовок секции: надзаголовок + заголовок + подводка */
export function SectionHeading({
  eyebrow,
  title,
  lead,
}: {
  eyebrow: string;
  title: ReactNode;
  lead?: ReactNode;
}) {
  return (
    <Reveal className="mx-auto max-w-2xl text-center">
      <span className="eyebrow">{eyebrow}</span>
      <h2 className="mt-4 font-display text-3xl leading-tight font-bold text-balance sm:text-4xl">
        {title}
      </h2>
      {lead ? (
        <p className="mt-4 text-base leading-relaxed text-paper-100/70">
          {lead}
        </p>
      ) : null}
    </Reveal>
  );
}

/* Логотип: энсо + печать + имя школы */
export function LogoMark({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <circle
        cx="24"
        cy="24"
        r="16.5"
        fill="none"
        stroke="#cf9f4b"
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeDasharray="92 12"
        transform="rotate(-70 24 24)"
      />
      <circle cx="24" cy="24" r="4.5" fill="#c2432d" />
    </svg>
  );
}
