import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import {
  CHAT_DEFAULT_CHIPS,
  CHAT_GREETING,
  PHONE_HREF,
  SCHOOL_NAME,
  findChatAnswer,
  waLink,
  type ChatChip,
} from "../content";
import { useLead } from "../lead";
import { Icon } from "./Icons";
import { LogoMark } from "./ui";

interface Message {
  id: number;
  from: "bot" | "user";
  text: string;
  chips?: ChatChip[];
}

const CHAT_PANEL_ID = "chat-panel";

/*
 * Отступы считаем от липкой панели CTA и учитываем безопасную зону iPhone:
 * без env(safe-area-inset-bottom) кнопка чата наезжала на панель на телефонах
 * с «чёлкой» (панель выше на величину safe-area).
 */
const FAB_POSITION =
  "bottom-[calc(5.75rem+env(safe-area-inset-bottom))] lg:bottom-6";
const PANEL_POSITION =
  "bottom-[calc(9.75rem+env(safe-area-inset-bottom))] lg:bottom-24";
/* Панель не должна вылезать за верх экрана (ландшафт / низкий viewport) */
const PANEL_HEIGHT =
  "h-[min(35rem,66dvh)] max-h-[calc(100dvh-11.5rem)] lg:h-[min(35rem,72dvh)] lg:max-h-[calc(100dvh-9rem)]";

export function ChatBot() {
  const { open } = useLead();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => [
    { id: 1, from: "bot", text: CHAT_GREETING, chips: CHAT_DEFAULT_CHIPS },
  ]);
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);

  const nextId = useRef(2);
  const listRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const fabRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const timersRef = useRef(new Set<number>());
  const wasOpen = useRef(false);

  /* Автопрокрутка списка сообщений */
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, typing, isOpen]);

  /*
   * Фокус в поле при открытии; при закрытии возвращаем фокус на кнопку чата —
   * иначе клавиатурный пользователь «теряется» на странице. Слушатели вешаем
   * только пока чат открыт: раньше Escape перехватывался на всём сайте.
   */
  useEffect(() => {
    if (isOpen) {
      wasOpen.current = true;
      inputRef.current?.focus();
      return;
    }
    if (wasOpen.current) {
      wasOpen.current = false;
      fabRef.current?.focus({ preventScroll: true });
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    /* Клик мимо панели и кнопки — сворачиваем чат (это не модальное окно) */
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      if (panelRef.current?.contains(target)) return;
      if (fabRef.current?.contains(target)) return;
      setIsOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, [isOpen]);

  /* Не оставляем висящие таймеры при размонтировании */
  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      for (const id of timers) window.clearTimeout(id);
      timers.clear();
    };
  }, []);

  const reply = (userText: string) => {
    setTyping(true);
    const delay = 600 + Math.random() * 500;
    const timer = window.setTimeout(() => {
      timersRef.current.delete(timer);
      const rule = findChatAnswer(userText);
      /* id считаем ДО апдейтера: в StrictMode он вызывается дважды,
         и инкремент внутри него давал пропуски в нумерации */
      const id = nextId.current++;
      setMessages((m) => [
        ...m,
        { id, from: "bot", text: rule.answer, chips: rule.chips },
      ]);
      setTyping(false);
    }, delay);
    timersRef.current.add(timer);
  };

  const sendUserText = (raw: string) => {
    const text = raw.trim();
    if (!text) return;
    const id = nextId.current++;
    setMessages((m) => [...m, { id, from: "user", text }]);
    setDraft("");
    reply(text);
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    sendUserText(draft);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendUserText(draft);
    }
  };

  const handleChip = (chip: ChatChip) => {
    /*
     * Переключаем явно по всем вариантам действия. Раньше всё, что не «send»
     * и не «wa», считалось переходом к форме: чип «Позвонить» сегодня
     * рендерится ссылкой tel: и сюда не попадает, но стоит однажды сделать его
     * кнопкой — и вместо звонка открывалась бы форма заявки.
     */
    switch (chip.action) {
      case "send":
        sendUserText(chip.label);
        return;
      case "wa":
        window.open(
          waLink(
            "Здравствуйте! Пишу с сайта школы «Воин Света». Хочу узнать про занятия и записать ребёнка на бесплатную тренировку.",
          ),
          "_blank",
          "noopener,noreferrer",
        );
        return;
      case "call":
        window.location.href = PHONE_HREF;
        return;
      case "form":
        /* к форме заявки, чат сворачиваем */
        setIsOpen(false);
        open();
        return;
    }
  };

  return (
    <>
      {/* Кнопка-кружок */}
      <button
        type="button"
        ref={fabRef}
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
        aria-controls={CHAT_PANEL_ID}
        aria-label={isOpen ? "Закрыть чат с администратором" : "Открыть чат с администратором"}
        className={`fixed right-4 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-b from-gold-300 via-gold-400 to-gold-500 text-ink-950 shadow-[0_14px_36px_-10px_rgba(207,159,75,0.65)] transition-transform hover:scale-105 active:scale-95 sm:right-6 ${FAB_POSITION}`}
      >
        <Icon name={isOpen ? "close" : "chat"} className="h-6 w-6" />
        {!isOpen && (
          <span
            aria-hidden="true"
            className="absolute -top-0.5 -right-0.5 flex h-4 w-4"
          >
            <span className="absolute h-4 w-4 animate-ping rounded-full bg-cinnabar-400/60" />
            <span className="relative h-4 w-4 rounded-full border-2 border-ink-950 bg-cinnabar-500" />
          </span>
        )}
      </button>

      {/* Панель чата */}
      {isOpen && (
        <section
          id={CHAT_PANEL_ID}
          ref={panelRef}
          role="dialog"
          aria-label={`Чат с администратором школы «${SCHOOL_NAME}»`}
          className={`fixed right-4 z-[60] flex w-[min(calc(100vw-2rem),384px)] flex-col overflow-hidden rounded-3xl border border-white/15 bg-ink-900 shadow-2xl shadow-black/60 sm:right-6 ${PANEL_POSITION} ${PANEL_HEIGHT}`}
        >
          {/* Шапка */}
          <header className="flex items-center gap-3 border-b border-white/10 bg-ink-850 px-4 py-3.5">
            <span className="relative shrink-0 rounded-full bg-paper-50 p-1.5">
              <LogoMark className="h-7 w-7" />
              <span className="absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 border-ink-850 bg-emerald-400" />
            </span>
            <div className="min-w-0">
              <p className="text-sm leading-tight font-bold">
                Администратор школы
              </p>
              <p className="text-xs text-emerald-300/90">
                онлайн · отвечает сразу
              </p>
            </div>
            <button
              type="button"
              className="ml-auto flex h-9 w-9 items-center justify-center rounded-full text-paper-100/70 transition-colors hover:bg-white/5 hover:text-paper-50"
              aria-label="Закрыть чат"
              onClick={() => setIsOpen(false)}
            >
              <Icon name="close" className="h-4.5 w-4.5" />
            </button>
          </header>

          {/* Сообщения */}
          <div
            ref={listRef}
            aria-live="polite"
            className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4"
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={msg.from === "user" ? "self-end" : "self-start"}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    msg.from === "user"
                      ? "rounded-br-md bg-gold-500 font-semibold text-ink-950"
                      : "rounded-bl-md border border-white/10 bg-ink-800 text-paper-100"
                  }`}
                >
                  {msg.text}
                </div>
                {msg.chips && msg.chips.length > 0 && (
                  <div className="mt-2 flex max-w-[90%] flex-wrap gap-1.5">
                    {msg.chips.map((chip) =>
                      chip.action === "call" ? (
                        <a
                          key={chip.label}
                          href={PHONE_HREF}
                          className="inline-flex items-center gap-1.5 rounded-full border border-gold-500/40 bg-gold-500/10 px-3 py-1.5 text-xs font-bold text-gold-300 transition-colors hover:bg-gold-500/20"
                        >
                          <Icon name="phone" className="h-3.5 w-3.5" />
                          {chip.label}
                        </a>
                      ) : (
                        <button
                          key={chip.label}
                          type="button"
                          onClick={() => handleChip(chip)}
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition-colors ${
                            chip.action === "form"
                              ? "border-cinnabar-400/50 bg-cinnabar-500/15 text-cinnabar-400 hover:bg-cinnabar-500/25"
                              : chip.action === "wa"
                                ? "border-emerald-400/50 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25"
                                : "border-white/15 bg-white/5 text-paper-100/85 hover:border-gold-500/40 hover:text-gold-300"
                          }`}
                        >
                          {chip.label}
                          {chip.action === "form" ? (
                            <Icon name="arrow" className="h-3.5 w-3.5" />
                          ) : null}
                        </button>
                      ),
                    )}
                  </div>
                )}
              </div>
            ))}

            {typing && (
              <div
                role="status"
                className="flex w-fit items-center gap-1.5 rounded-2xl rounded-bl-md border border-white/10 bg-ink-800 px-4 py-3"
                aria-label="Администратор печатает"
              >
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gold-400 [animation-delay:0ms]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gold-400 [animation-delay:150ms]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gold-400 [animation-delay:300ms]" />
              </div>
            )}
          </div>

          {/* Ввод */}
          <form
            onSubmit={onSubmit}
            className="border-t border-white/10 bg-ink-850 px-3 py-3"
          >
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Напишите вопрос…"
                aria-label="Текст вопроса администратору"
                className="min-w-0 flex-1 rounded-full border border-white/10 bg-ink-900 px-4 py-2.5 text-sm text-paper-50 placeholder:text-paper-100/55 focus:border-gold-400/60 focus:outline-none"
              />
              <button
                type="submit"
                aria-label="Отправить"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-gold-300 to-gold-500 text-ink-950 transition-transform hover:scale-105 active:scale-95"
              >
                <Icon name="send" className="h-4.5 w-4.5" />
              </button>
            </div>
            <p className="mt-2 px-1 text-[10px] leading-snug text-paper-100/60">
              Бот отвечает на основные вопросы. Уточнить детали и записаться
              можно напрямую у тренера Александра — по телефону или через
              заявку.
            </p>
          </form>
        </section>
      )}
    </>
  );
}
