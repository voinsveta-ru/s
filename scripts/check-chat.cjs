#!/usr/bin/env node
/**
 * Регрессионный тест базы знаний чат-бота (`CHAT_RULES` + `findChatAnswer`).
 *
 * Зачем: подбор ответа — это взвешенный поиск по основам русских слов, и он
 * ломается незаметно. Ни `tsc`, ни `vite build`, ни `scripts/check.cjs` не видят,
 * что «сколько лет вашему ребёнку?» начал отвечать про цену, а «какой уровень
 * нужен?» уехал в fallback: сборка при этом зелёная. Ошибку замечает только
 * родитель, которому бот ответил невпопад.
 *
 * Скрипт не добавляет зависимостей: `src/content.ts` компилируется тем же Vite,
 * который уже есть в devDependencies, во временный каталог внутри node_modules.
 *
 * Ожидаемый ответ задаётся НЕ индексом правила (порядок правил может меняться),
 * а фрагментом текста ответа — такой тест переживает правки `CHAT_RULES`.
 *
 * Использование: node scripts/check-chat.cjs
 * Код возврата 1 — хотя бы одна реплика ушла не в ту тему.
 */
const { mkdirSync, rmSync } = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(ROOT, "node_modules", ".cache", "chat-check");

/**
 * Темы ответов. Ключ — имя темы для отчёта, значение — фрагмент, который обязан
 * быть в ответе бота. `fallback` — честный «я не понял, позвоните тренеру».
 */
const TOPICS = {
  price: "3 900",
  signup: "Записаться просто",
  messenger: "Отправьте сообщение тренеру",
  schedule: "вторник–пятница",
  address: "Две локации",
  age: "7–18 лет",
  girls: "девочки занимаются наравне",
  safety: "Свободных спаррингов нет",
  health: "медицинских противопоказаний",
  clothes: "футболка, спортивные штаны",
  prep: "Физическая подготовка не нужна",
  camp: "Зарница",
  coaches: "Александр Миронов",
  program: "6 ступеням",
  greeting: "Рад вас видеть",
  thanks: "Пожалуйста!",
  fallback: "Я ответил не на всё",
};

/**
 * Реплики живых родителей. Каждая строка: [фраза, ожидаемая тема].
 * Набор намеренно включает «скользкие» случаи — именно на них ломался подбор:
 *   · «сколько …» про возраст и про ступени (раньше отвечал про цену);
 *   · «уровень» в именительном падеже (основа «уровн» не совпадала никогда);
 *   · «кто ведёт занятия» (уезжало в расписание);
 *   · «болеем астмой», «с плоскостопием» (уезжало в fallback);
 *   · «восьмилетку» — «лет» внутри составного слова;
 *   · «более подробно» — НЕ должно попадать в правило про здоровье.
 */
const CASES = [
  /* цена */
  ["сколько стоят занятия", "price"],
  ["сколько стоит абонемент", "price"],
  ["какая цена", "price"],
  ["сколько денег надо", "price"],
  ["сколько рублей в месяц", "price"],
  ["сколько нужно заплатить", "price"],
  ["почем занятия", "price"],
  ["почём", "price"],
  ["есть ли скидки", "price"],
  ["какая сейчас акция", "price"],
  ["дорого у вас", "price"],
  ["тарифы", "price"],
  ["прайс лист", "price"],
  ["как оплатить", "price"],
  ["стоимость абонемента", "price"],
  /* запись */
  ["как записаться", "signup"],
  ["хочу записаться", "signup"],
  ["мы хотим к вам", "signup"],
  ["хотели бы попробовать", "signup"],
  ["можно прийти на пробное занятие", "signup"],
  ["бесплатная тренировка", "signup"],
  ["записаться на занятия", "signup"],
  ["как оставить заявку", "signup"],
  ["хочу начать заниматься", "signup"],
  /* мессенджеры */
  ["можно написать в ватсап", "messenger"],
  ["у вас есть телеграм", "messenger"],
  ["whatsapp", "messenger"],
  ["как вам написать в мессенджер", "messenger"],
  /* расписание */
  ["какое расписание", "schedule"],
  ["когда занятия", "schedule"],
  ["во сколько начинаются тренировки", "schedule"],
  ["в какие дни вы работаете", "schedule"],
  ["часы работы", "schedule"],
  ["работаете в субботу", "schedule"],
  ["сколько длится тренировка", "schedule"],
  ["когда проходят тренировки", "schedule"],
  ["расписание на неделю", "schedule"],
  /* адреса */
  ["где вы находитесь", "address"],
  ["какой у вас адрес", "address"],
  ["как добраться", "address"],
  ["где находится зал", "address"],
  ["есть ли парковка", "address"],
  ["как доехать до вас", "address"],
  /* возраст */
  ["с какого возраста принимаете", "age"],
  ["сколько лет берёте", "age"],
  ["сколько лет вашему ученику должно быть", "age"],
  ["ребёнку 7 лет", "age"],
  ["до скольки лет", "age"],
  ["подросткам подходит", "age"],
  ["возьмёте восьмилетку", "age"],
  ["девятилетнему подойдёт", "age"],
  ["у меня десятилетка", "age"],
  ["сыну двенадцать лет", "age"],
  ["дочь тринадцати лет", "age"],
  /* девочки */
  ["девочек берёте", "girls"],
  ["подойдёт ли девочке", "girls"],
  ["для дочки", "girls"],
  ["дочь хочет заниматься", "girls"],
  /* безопасность */
  ["это безопасно", "safety"],
  ["будут ли спарринги", "safety"],
  ["будут ли драки", "safety"],
  ["боюсь, что будет больно", "safety"],
  ["травмы бывают", "safety"],
  ["синяки будут", "safety"],
  /* здоровье */
  ["нужна ли справка", "health"],
  ["есть ли противопоказания", "health"],
  ["мы болеем астмой", "health"],
  ["можно ли с плоскостопием", "health"],
  ["у ребёнка аллергия", "health"],
  ["сколиоз — возьмёте?", "health"],
  ["плохое зрение", "health"],
  ["больное сердце", "health"],
  ["нужен ли врач", "health"],
  ["освобождение от физкультуры", "health"],
  /* форма */
  ["что взять на тренировку", "clothes"],
  ["что надеть", "clothes"],
  ["какая одежда нужна", "clothes"],
  ["нужно ли кимоно", "clothes"],
  ["какая обувь", "clothes"],
  ["что принести с собой", "clothes"],
  ["нужна ли экипировка", "clothes"],
  /* подготовка */
  ["нужна ли физподготовка", "prep"],
  ["мы новички", "prep"],
  ["ребёнок с нуля", "prep"],
  ["какой уровень нужен", "prep"],
  ["уровня подготовки не имеем", "prep"],
  ["для начинающих", "prep"],
  ["физическая подготовка нужна", "prep"],
  /* сборы */
  ["что за летний лагерь", "camp"],
  ["когда сборы", "camp"],
  ["расскажите про зарницу", "camp"],
  ["есть ли смена летом", "camp"],
  ["лагерь в конаково", "camp"],
  /* тренеры */
  ["кто ведёт занятия", "coaches"],
  ["кто проводит тренировки", "coaches"],
  ["кто будет заниматься с ребёнком", "coaches"],
  ["кто тренер", "coaches"],
  ["какой у вас тренер", "coaches"],
  ["расскажите про миронова", "coaches"],
  ["кто наставник", "coaches"],
  ["преподаватели", "coaches"],
  /* программа */
  ["какая программа", "program"],
  ["что изучают", "program"],
  ["есть ли экзамены", "program"],
  ["какие ступени", "program"],
  ["сколько всего ступеней", "program"],
  ["учат ли обращаться с оружием", "program"],
  ["что такое таолу", "program"],
  ["есть цигун", "program"],
  ["будет акробатика", "program"],
  ["растяжка есть", "program"],
  /* вежливость */
  ["здравствуйте", "greeting"],
  ["привет", "greeting"],
  ["добрый день", "greeting"],
  ["спасибо", "thanks"],
  ["благодарю", "thanks"],
  ["большое спасибо за ответ", "thanks"],
  /* приветствие + вопрос по существу: вежливость не должна перебивать тему */
  ["здравствуйте, сколько стоит?", "price"],
  ["привет! как записаться?", "signup"],
  ["добрый день, подскажите расписание", "schedule"],
  ["спасибо, а девочек берёте?", "girls"],
  /* честный fallback на то, чего на сайте действительно нет */
  ["сколько с нас возьмут", "fallback"],
  ["расскажите более подробно", "fallback"],
  ["сегодня не могу, а завтра можно?", "fallback"],
];

/** Компилируем src/content.ts тем же Vite, что собирает сайт */
async function loadContent() {
  const { build } = await import("vite");
  rmSync(OUT_DIR, { recursive: true, force: true });
  mkdirSync(OUT_DIR, { recursive: true });
  await build({
    root: ROOT,
    configFile: false,
    logLevel: "error",
    /* content.ts читает base из import.meta.env — в Node его нет */
    define: { "import.meta.env.BASE_URL": '"/"' },
    build: {
      lib: {
        entry: path.join(ROOT, "src", "content.ts"),
        formats: ["cjs"],
        fileName: () => "content.cjs",
      },
      outDir: OUT_DIR,
      emptyOutDir: true,
      minify: false,
    },
  });
  return require(path.join(OUT_DIR, "content.cjs"));
}

(async () => {
  let content;
  try {
    content = await loadContent();
  } catch (e) {
    console.error(`✖ Не удалось скомпилировать src/content.ts: ${e.message}`);
    process.exit(1);
  }

  const { findChatAnswer, CHAT_RULES, CHAT_FALLBACK, CHAT_DEFAULT_CHIPS } = content;
  const problems = [];
  const notes = [];

  /* --- 1. самопроверка базы знаний --- */
  const ACTIONS = new Set(["send", "call", "form", "wa"]);
  CHAT_RULES.forEach((rule, i) => {
    if (!rule.answer || !rule.answer.trim()) problems.push(`правило №${i}: пустой ответ`);
    for (const chip of rule.chips ?? []) {
      if (!ACTIONS.has(chip.action)) {
        problems.push(`правило №${i}: неизвестное действие чипа «${chip.action}»`);
      }
      if (!chip.label || !chip.label.trim()) problems.push(`правило №${i}: пустая подпись чипа`);
    }
    /* Пустые основы совпадут с любым текстом — правило перехватит весь чат */
    for (const keyword of rule.keywords) {
      if (keyword.trim().length <= 1) {
        problems.push(`правило №${i}: ключевое слово «${keyword}» короче двух символов`);
      }
    }
  });
  for (const chip of CHAT_DEFAULT_CHIPS) {
    if (!ACTIONS.has(chip.action)) problems.push(`чат по умолчанию: неизвестное действие «${chip.action}»`);
  }
  if (!CHAT_FALLBACK.answer) problems.push("нет ответа по умолчанию (CHAT_FALLBACK)");
  notes.push(`правил в базе знаний: ${CHAT_RULES.length}, реплик в тесте: ${CASES.length}`);

  /* --- 2. каждая тема достижима --- */
  const topicOf = (rule) => {
    for (const [name, probe] of Object.entries(TOPICS)) {
      if (rule.answer.includes(probe)) return name;
    }
    return `?(${rule.answer.slice(0, 32)}…)`;
  };
  const reached = new Set();

  /* --- 3. прогон реплик --- */
  for (const [text, expected] of CASES) {
    const rule = findChatAnswer(text);
    const got = topicOf(rule);
    reached.add(got);
    if (got !== expected) {
      problems.push(`«${text}» → тема «${got}», ожидалось «${expected}»`);
    }
  }
  for (const topic of Object.keys(TOPICS)) {
    if (!reached.has(topic)) {
      problems.push(`тема «${topic}» недостижима: ни одна тестовая реплика в неё не попала`);
    }
  }

  rmSync(OUT_DIR, { recursive: true, force: true });

  notes.push(`тем в ответах: ${Object.keys(TOPICS).length}, покрыто тестом: ${reached.size}`);

  console.log("Проверка базы знаний чат-бота «Воин Света»");
  notes.forEach((n) => console.log(`  · ${n}`));

  if (problems.length === 0) {
    console.log(`\n✔ Все ${CASES.length} реплик отвечают по теме`);
    process.exit(0);
  }
  console.error(`\n✖ Найдено проблем: ${problems.length}`);
  problems.forEach((p, i) => console.error(`  ${i + 1}. ${p}`));
  process.exit(1);
})().catch((e) => {
  console.error(`✖ Сбой проверки: ${e.stack || e.message}`);
  process.exit(1);
});
