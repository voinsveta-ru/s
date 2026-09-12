import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { EMPTY_LEAD_INTENT, type LeadIntent } from "./content";

/** Что CTA передаёт форме: всё, кроме счётчика — его ведёт провайдер */
export type LeadIntentInput = Omit<LeadIntent, "token">;

interface LeadContextValue {
  /** Текущий намёк: выбранная локация, готовый комментарий и счётчик кликов */
  intent: LeadIntent;
  /** Передать форме локацию/комментарий и плавно прокрутить к ней */
  open: (intent?: LeadIntentInput) => void;
}

const LeadContext = createContext<LeadContextValue>({
  intent: EMPTY_LEAD_INTENT,
  open: () => {},
});

export function LeadProvider({ children }: { children: ReactNode }) {
  const [intent, setIntent] = useState<LeadIntent>(EMPTY_LEAD_INTENT);

  const open = useCallback((next?: LeadIntentInput) => {
    /*
     * token растёт на каждый вызов: форма увидит клик, даже если локация и
     * комментарий такие же, как в прошлый раз (повторный клик по той же
     * кнопке «Записаться в эту группу» снова подставит локацию).
     */
    setIntent((prev) => ({ token: prev.token + 1, ...next }));
    window.requestAnimationFrame(() => {
      document
        .getElementById("contacts")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  return (
    <LeadContext.Provider value={{ intent, open }}>
      {children}
    </LeadContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useLead = () => useContext(LeadContext);
