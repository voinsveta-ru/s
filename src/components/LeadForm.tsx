import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  LOCATIONS,
  type LocationId,
  MAILTO,
  PHONE_DISPLAY,
  PHONE_HREF,
  LEAD_EMAIL,
  asset,
  smsLink,
  waLink,
  type LeadIntent,
} from "../content";
import { Icon } from "./Icons";

type Status = "idle" | "sending" | "success";

interface FormState {
  phone: string;
  parentName: string;
  email: string;
  location: LocationId;
  comment: string;
}

type Errors = Partial<Record<keyof FormState, string>>;

const DEFAULT_FORM: FormState = {
  phone: "",
  parentName: "",
  email: "",
  location: "unknown",
  comment: "",
};

/** Сколько последних заявок храним в браузере (чтобы не расти бесконечно) */
const LOCAL_LEADS_LIMIT = 50;

/**
 * Доставка заявки тренеру. Основной канал — письмо на почту школы через
 * FormSubmit (без бэкенда; при первой отправке нужно один раз активировать
 * адрес — см. README). Резервные каналы клиента — WhatsApp и SMS-кнопки
 * на экране благодарности. Копия заявки всегда сохраняется в localStorage.
 */
const FORMSUBMIT_ENDPOINT = `https://formsubmit.co/ajax/${LEAD_EMAIL}`;

const locationLabel = (id: LocationId) =>
  LOCATIONS.find((l) => l.id === id)?.city ?? "Пока не знаю";

export function LeadForm({ intent }: { intent: LeadIntent }) {
  const [form, setForm] = useState<FormState>({
    ...DEFAULT_FORM,
    location: intent.location ?? "unknown",
    comment: intent.note ?? "",
  });
  const [submitted, setSubmitted] = useState<FormState | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>("idle");
  /** Дошло ли письмо тренеру: если нет — на «Спасибо» честно предлагаем WhatsApp */
  const [delivered, setDelivered] = useState(true);
  /* Какой token уже применили, чтобы не перезаписывать ввод пользователя */
  const appliedToken = useRef(intent.token);

  /*
   * Клик по CTA («Записаться в эту группу», «Узнать о следующей смене»,
   * липкая панель, чат-бот) — подставляем только то, что реально передали.
   * Общий CTA без локации и комментария больше не затирает то, что родитель
   * уже выбрал и написал.
   */
  useEffect(() => {
    if (intent.token === appliedToken.current) return;
    appliedToken.current = intent.token;

    setForm((f) => ({
      ...f,
      ...(intent.location ? { location: intent.location } : null),
      ...(intent.note !== undefined ? { comment: intent.note } : null),
    }));
    /* Заявка уже отправлена — возвращаем форму, раз пользователь снова жмёт CTA */
    setSubmitted(null);
    setDelivered(true);
    setStatus("idle");
  }, [intent.token, intent.location, intent.note]);

  const setField = (name: keyof FormState, value: string) => {
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((e) => ({ ...e, [name]: undefined }));
  };

  const validate = (): boolean => {
    const next: Errors = {};

    /* Телефон — единственное обязательное поле */
    const digits = form.phone.replace(/\D/g, "");
    if (digits.length < 10 || digits.length > 11) {
      next.phone = "Введите номер полностью, например +7 900 000-00-00";
    }

    /* Имя и email — по желанию, но если заполнены, проверяем формат */
    if (form.email.trim() && !/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      next.email = "Проверьте адрес почты";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  /* Резервная копия заявки в браузере */
  const saveLocally = (lead: FormState) => {
    try {
      const stored = window.localStorage.getItem("voinsveta-leads");
      const parsed: unknown = stored ? JSON.parse(stored) : [];
      const leads = Array.isArray(parsed) ? parsed : [];
      leads.push({ ...lead, createdAt: new Date().toISOString() });
      window.localStorage.setItem(
        "voinsveta-leads",
        JSON.stringify(leads.slice(-LOCAL_LEADS_LIMIT)),
      );
    } catch {
      /* приватный режим браузера или повреждённые данные — не критично */
    }
  };

  /* Отправка письма тренеру через FormSubmit (email = push-уведомление) */
  const deliverByEmail = async (lead: FormState): Promise<boolean> => {
    try {
      const controller = new AbortController();
      const timer = window.setTimeout(() => controller.abort(), 8000);
      const res = await fetch(FORMSUBMIT_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        signal: controller.signal,
        body: JSON.stringify({
          _subject: `Заявка с сайта: ${lead.phone}`,
          _template: "table",
          _captcha: "false",
          "Телефон": lead.phone,
          "Имя родителя": lead.parentName || "—",
          "Email": lead.email || "—",
          "Локация": locationLabel(lead.location),
          "Комментарий": lead.comment || "—",
        }),
      });
      window.clearTimeout(timer);
      if (!res.ok) return false;
      /* FormSubmit отвечает {"success":"true"}; до активации адреса — "false" */
      const data = (await res.json().catch(() => null)) as
        | { success?: unknown }
        | null;
      return (
        data?.success === undefined ||
        data.success === true ||
        data.success === "true"
      );
    } catch {
      /* сеть недоступна / адрес ещё не активирован — заявку не теряем */
      console.warn("FormSubmit недоступен — используйте WhatsApp/SMS-канал");
      return false;
    }
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === "sending") return;
    if (!validate()) return;

    setStatus("sending");
    saveLocally(form);
    const ok = await deliverByEmail(form);
    setDelivered(ok);
    setSubmitted(form);
    setStatus("success");
  };

  /* Экран благодарности + мгновенные каналы связи с тренером */
  if (status === "success" && submitted) {
    const waText = `Здравствуйте! Оставил(а) заявку на сайте. Хочу записать ребёнка на бесплатную пробную тренировку. Телефон: ${submitted.phone}${
      submitted.parentName ? `. Меня зовут ${submitted.parentName}` : ""
    }. Локация: ${locationLabel(submitted.location)}.`;
    const smsText = `Заявка с сайта: прошу перезвонить, хочу привести ребёнка на бесплатную пробную тренировку. Телефон: ${submitted.phone}.`;
    const mailtoHref = `${MAILTO}?subject=${encodeURIComponent(
      `Заявка с сайта: ${submitted.phone}`,
    )}&body=${encodeURIComponent(
      `Телефон: ${submitted.phone}\nИмя: ${submitted.parentName || "—"}\nЛокация: ${locationLabel(submitted.location)}\nКомментарий: ${submitted.comment || "—"}`,
    )}`;

    return (
      <div
        className="flex h-full flex-col items-center justify-center rounded-3xl border border-gold-500/25 bg-ink-950/60 p-8 text-center"
        role="status"
      >
        <span className="animate-pop-in flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-b from-gold-300 to-gold-500 text-ink-950 shadow-[0_16px_40px_-12px_rgba(207,159,75,0.6)]">
          <Icon name="check" className="h-8 w-8" />
        </span>
        <h3 className="mt-5 font-display text-xl font-bold">
          Спасибо, заявка принята!
        </h3>
        {delivered ? (
          <p className="mt-2.5 max-w-sm text-sm leading-relaxed text-paper-100/75">
            Тренер Александр уже получил уведомление и перезвонит вам — ответит
            на вопросы и запишет ребёнка на бесплатную тренировку.
          </p>
        ) : (
          <p className="mt-2.5 max-w-sm text-sm leading-relaxed text-paper-100/75">
            Мы сохранили заявку, но уведомление тренеру сейчас не ушло
            (нет связи или почта школы ещё не активирована). Чтобы не ждать —
            отправьте её одним касанием в WhatsApp или позвоните напрямую.
          </p>
        )}

        <div className="mt-5 w-full max-w-sm rounded-2xl border border-white/10 bg-ink-900/70 p-4">
          <p className="text-xs font-bold tracking-wider text-paper-100/60 uppercase">
            {delivered
              ? "Не хотите ждать? Напишите тренеру сразу:"
              : "Свяжитесь с тренером сейчас:"}
          </p>
          <div className="mt-3 grid gap-2.5">
            <a
              href={waLink(waText)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn w-full bg-[#25d366] py-3 text-[13px] text-ink-950 shadow-[0_10px_28px_-10px_rgba(37,211,102,0.55)] hover:-translate-y-0.5"
            >
              <Icon name="chat" className="h-4 w-4" />
              Отправить заявку в WhatsApp
            </a>
            <div className="grid grid-cols-2 gap-2.5">
              <a href={smsLink(smsText)} className="btn btn-ghost py-3 text-[13px]">
                Отправить SMS
              </a>
              <a href={mailtoHref} className="btn btn-ghost py-3 text-[13px]">
                Отправить письмом
              </a>
            </div>
          </div>
        </div>

        <p className="mt-4 text-sm text-paper-100/70">
          Или позвоните сами:{" "}
          <a
            href={PHONE_HREF}
            className="font-bold text-gold-300 hover:text-gold-200"
          >
            {PHONE_DISPLAY}
          </a>
        </p>

        <button
          type="button"
          className="btn btn-ghost mt-5 px-5 py-2.5 text-xs"
          onClick={() => {
            setForm({
              ...DEFAULT_FORM,
              location: intent.location ?? "unknown",
              comment: intent.note ?? "",
            });
            setSubmitted(null);
            setErrors({});
            setDelivered(true);
            setStatus("idle");
          }}
        >
          Отправить ещё одну заявку
        </button>
      </div>
    );
  }

  const phoneError = errors.phone;
  const emailError = errors.email;

  return (
    <form
      noValidate
      onSubmit={onSubmit}
      className="rounded-3xl border border-white/10 bg-ink-950/60 p-6 sm:p-7"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="field-label" htmlFor="lead-phone">
            Ваш телефон <span className="text-cinnabar-400">*</span>
          </label>
          <input
            id="lead-phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            required
            className="field"
            placeholder="+7 900 000-00-00"
            value={form.phone}
            onChange={(e) => setField("phone", e.target.value)}
            aria-invalid={Boolean(phoneError)}
            aria-describedby={phoneError ? "lead-phone-error" : "lead-phone-hint"}
          />
          {phoneError ? (
            <p id="lead-phone-error" className="field-error" role="alert">
              {phoneError}
            </p>
          ) : (
            <p
              id="lead-phone-hint"
              className="mt-1.5 text-xs text-paper-100/60"
            >
              Номер увидит только тренер Александр — для звонка о записи.
            </p>
          )}
        </div>

        <div>
          <label className="field-label" htmlFor="lead-name">
            Ваше имя{" "}
            <span className="normal-case opacity-60">(по желанию)</span>
          </label>
          <input
            id="lead-name"
            name="name"
            type="text"
            autoComplete="name"
            className="field"
            placeholder="Например, Анна"
            value={form.parentName}
            onChange={(e) => setField("parentName", e.target.value)}
          />
        </div>

        <div>
          <label className="field-label" htmlFor="lead-email">
            Email{" "}
            <span className="normal-case opacity-60">(по желанию)</span>
          </label>
          <input
            id="lead-email"
            name="email"
            type="email"
            autoComplete="email"
            className="field"
            placeholder="you@mail.ru"
            value={form.email}
            onChange={(e) => setField("email", e.target.value)}
            aria-invalid={Boolean(emailError)}
            aria-describedby={emailError ? "lead-email-error" : undefined}
          />
          {emailError ? (
            <p id="lead-email-error" className="field-error" role="alert">
              {emailError}
            </p>
          ) : null}
        </div>

        <div className="sm:col-span-2">
          <label className="field-label" htmlFor="lead-location">
            Локация{" "}
            <span className="normal-case opacity-60">(по желанию)</span>
          </label>
          <select
            id="lead-location"
            name="location"
            className="field"
            value={form.location}
            onChange={(e) => setField("location", e.target.value as LocationId)}
          >
            <option value="unknown">Пока не знаю — подскажите</option>
            {LOCATIONS.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.city} — {loc.venue}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="field-label" htmlFor="lead-comment">
            Комментарий <span className="normal-case opacity-60">(необязательно)</span>
          </label>
          <textarea
            id="lead-comment"
            name="comment"
            rows={2}
            className="field resize-none"
            placeholder="Возраст ребёнка, удобное время, вопросы…"
            value={form.comment}
            onChange={(e) => setField("comment", e.target.value)}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={status === "sending"}
        className="btn btn-gold btn-lg mt-5 w-full disabled:cursor-wait disabled:opacity-70"
      >
        {status === "sending"
          ? "Отправляем…"
          : "Жду звонка тренера — записаться на бесплатную тренировку"}
        {status !== "sending" ? <Icon name="phone" className="h-4 w-4" /> : null}
      </button>

      <p className="mt-3.5 text-center text-xs leading-relaxed text-paper-100/60">
        Перезвоним в течение дня — обычно быстрее. Никакого спама: номер нужен
        только для записи.{" "}
        <a
          href={asset("privacy.html")}
          className="underline decoration-gold-500/50 underline-offset-2 hover:text-gold-300"
        >
          Политика конфиденциальности
        </a>
        .
      </p>
    </form>
  );
}
