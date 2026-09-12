import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { Footer } from "./components/Footer";
import { ChatBot } from "./components/ChatBot";
import { StickyCta } from "./components/StickyCta";
import { LeadProvider } from "./lead";
import { Benefits } from "./components/sections/Benefits";
import { Program } from "./components/sections/Program";
import { Journey } from "./components/sections/Journey";
import { Pricing } from "./components/sections/Pricing";
import { Schedule } from "./components/sections/Schedule";
import { Coaches } from "./components/sections/Coaches";
import { Testimonials } from "./components/sections/Testimonials";
import { Gallery } from "./components/sections/Gallery";
import { Tradition } from "./components/sections/Tradition";
import { Camp } from "./components/sections/Camp";
import { Parents } from "./components/sections/Parents";
import { Faq } from "./components/sections/Faq";
import { FinalCta } from "./components/sections/FinalCta";

export default function App() {
  return (
    <LeadProvider>
      {/* Переход к содержимому для клавиатуры и скринридеров */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[80] focus:rounded-full focus:bg-gold-400 focus:px-5 focus:py-3 focus:text-sm focus:font-bold focus:text-ink-950"
      >
        Перейти к содержимому
      </a>
      <Header />
      <main id="main">
        <Hero />
        <Benefits />
        <Program />
        <Journey />
        <Pricing />
        <Schedule />
        <Coaches />
        <Testimonials />
        <Gallery />
        <Tradition />
        <Camp />
        <Parents />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
      {/* Спейсер под липкую панель: учитываем безопасную зону iPhone,
          иначе панель закрывает низ футера на телефонах с «чёлкой» */}
      <div
        aria-hidden="true"
        className="h-[calc(5.5rem+env(safe-area-inset-bottom))] lg:hidden"
      />
      <StickyCta />
      <ChatBot />
    </LeadProvider>
  );
}
