import { PHONE_DISPLAY, PHONE_HREF } from "../content";
import { useLead } from "../lead";
import { Icon } from "./Icons";

/**
 * Липкая панель на мобильных: звонок тренеру и запись всегда под рукой.
 * На десктопе скрыта (там CTA есть в шапке).
 */
export function StickyCta() {
  const { open } = useLead();

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-ink-950/95 px-3 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur-md lg:hidden">
      <div className="mx-auto flex max-w-xl gap-2.5">
        <a href={PHONE_HREF} className="btn btn-ghost flex-1 py-3 text-[13px]">
          <Icon name="phone" className="h-4 w-4 text-gold-400" />
          {PHONE_DISPLAY}
        </a>
        <button
          type="button"
          className="btn btn-gold flex-1 py-3 text-[13px]"
          onClick={() => open()}
        >
          Бесплатная тренировка
        </button>
      </div>
    </div>
  );
}
