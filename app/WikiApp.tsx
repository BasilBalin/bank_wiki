"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  FOUNDATION_ARTICLES,
  FOUNDATION_CARDS,
  FOUNDATION_PAGES,
  FOUNDATION_QUIZZES,
  type FoundationPageId,
} from "./foundation-content";

type PageId = FoundationPageId | "client-base" | "segmentation";

type PageConfig = {
  title: string;
  eyebrow: string;
  summary: string;
  href: string;
  time: string;
  color: string;
  searchText: string;
  image?: string;
  imageAlt?: string;
  imagePosition?: string;
  imageCredit?: { label: string; url: string };
  visualLabels?: readonly [string, string, string];
};

type GlossaryTerm = {
  name: string;
  definition: string;
  detail: string;
  page: PageId;
  aliases?: string[];
  source?: { label: string; url: string };
};

type Card = {
  front: string;
  back: string;
  tags: string;
  page: PageId;
};

type Question = {
  prompt: string;
  options: string[];
  correct: number;
  explanation: string;
};

const PAGES: Record<PageId, PageConfig> = {
  ...FOUNDATION_PAGES,
  "client-base": {
    title: "Клиентская база УК",
    eyebrow: "Модуль 1 · основа",
    summary:
      "Кто считается клиентом, какие события образуют его путь и где аналитик ищет сигналы докупки или оттока.",
    href: "/",
    image: "/images/client-lifecycle.png",
    imageAlt:
      "Аналитик изучает разноцветные траектории клиентов: докупку, паузу и отток",
    time: "35–45 минут",
    color: "cyan",
    searchText:
      "клиентская база управляющая компания УК договор продукт счет операция транзакция коммуникация кампания жизненный цикл покупка докупка удержание погашение отток инвестиционный пай ПИФ активы инвестиционный профиль цессия гранулярность витрина данных",
  },
  segmentation: {
    title: "Сегментация клиентской базы",
    eyebrow: "Модуль 2 · практика",
    summary:
      "Как превратить неоднородную базу в рабочие группы для анализа, кампаний, A/B-тестов и отчетности.",
    href: "/segmentation",
    image: "/images/segmentation-lab.png",
    imageAlt:
      "Яркие группы клиентов, аналитическая призма, воронка и линии показателей",
    time: "45–55 минут",
    color: "magenta",
    searchText:
      "сегментация клиентская база признаки целевая переменная когорта кластер правило бизнес сегмент отток докупка корреляция причинность data leakage утечка A/B тест контрольная тестовая группа конверсия uplift Power BI отчет кампания эффективность коммуникации",
  },
};

const GLOSSARY: GlossaryTerm[] = [
  {
    name: "УК",
    definition: "Управляющая компания.",
    detail:
      "Организация, которая управляет активами клиентов или имуществом фонда в рамках договора и применимых правил.",
    page: "client-base",
  },
  {
    name: "Доверительное управление",
    definition: "Передача активов управляющему для управления в интересах клиента.",
    detail:
      "Право собственности обычно не переходит к управляющему: он действует в пределах договора и инвестиционного профиля.",
    page: "client-base",
  },
  {
    name: "ПИФ",
    definition: "Паевой инвестиционный фонд.",
    detail:
      "Имущественный комплекс под управлением УК. Инвестор приобретает инвестиционные паи, а не отдельные активы фонда.",
    page: "client-base",
  },
  {
    name: "Инвестиционный пай",
    definition: "Ценная бумага, удостоверяющая долю владельца в имуществе ПИФ.",
    detail:
      "Выдача, обмен и погашение паев — разные события, которые аналитик должен различать в данных.",
    page: "client-base",
  },
  {
    name: "СЧА",
    definition: "Стоимость чистых активов.",
    detail:
      "Стоимость активов за вычетом учитываемых обязательств. Не путайте СЧА фонда с суммой средств конкретного клиента.",
    page: "client-base",
  },
  {
    name: "Докупка",
    definition: "Повторное вложение клиента в продукт после первой покупки.",
    detail:
      "Рабочее определение должно задавать окно наблюдения, минимальную сумму и список учитываемых операций.",
    page: "client-base",
  },
  {
    name: "Отток",
    definition: "Зафиксированное правилами снижение или прекращение отношений клиента с продуктом.",
    detail:
      "Это не универсальная кнопка «ушел»: отток можно считать по полному погашению, снижению активов или отсутствию клиента через заданный период.",
    page: "client-base",
  },
  {
    name: "Инвестиционный профиль",
    definition: "Сочетание ожидаемой доходности, допустимого риска и горизонта инвестирования.",
    detail:
      "В аналитике профиль полезен как признак, но обращения с ним требуют соблюдения внутренних правил и контроля качества данных.",
    page: "client-base",
  },
  {
    name: "Цессия",
    aliases: ["уступка требования"],
    definition: "Передача права требования от прежнего кредитора новому.",
    detail:
      "Простой пример: право требовать долг переходит от компании А к компании Б. Это юридическое событие, а не обычная докупка или погашение инвестиционного продукта; его нельзя автоматически считать клиентским оттоком.",
    page: "client-base",
    source: {
      label: "ГК РФ, статья 382",
      url: "https://www.consultant.ru/document/cons_doc_LAW_5142/6f4155620ef0cbeae206272c40428b837fa3cf25/",
    },
  },
  {
    name: "Сегмент",
    definition: "Группа клиентов с общими признаками и понятным аналитическим назначением.",
    detail:
      "Хороший сегмент достаточно однороден внутри, отличается от других и позволяет принять конкретное решение.",
    page: "segmentation",
  },
  {
    name: "Когорта",
    definition: "Группа объектов, объединенная общим событием и периодом его наступления.",
    detail:
      "Например, клиенты, впервые купившие продукт в январе. Когортный анализ сравнивает их поведение по одинаковому времени с момента старта.",
    page: "segmentation",
  },
  {
    name: "Признак",
    definition: "Измеримая характеристика объекта, используемая в анализе.",
    detail:
      "Возраст отношений, число коммуникаций, сумма активов и давность последней операции — примеры признаков клиента.",
    page: "segmentation",
  },
  {
    name: "Целевая переменная",
    definition: "Результат, который аналитик пытается объяснить или предсказать.",
    detail:
      "Для задачи вторичных продаж целью может быть факт докупки в следующие 30 дней или оттока в следующие 90 дней.",
    page: "segmentation",
  },
  {
    name: "Утечка данных",
    aliases: ["data leakage"],
    definition: "Попадание в модель информации, которой не было на момент решения.",
    detail:
      "Например, использовать дату погашения для прогноза оттока до погашения. На истории качество будет прекрасным, в работе — бесполезным.",
    page: "segmentation",
  },
  {
    name: "A/B-тест",
    definition: "Сравнение случайно сформированных групп с разными воздействиями.",
    detail:
      "Контроль сохраняет обычный сценарий, тест получает изменение. Разницу метрик оценивают с учетом случайной вариации.",
    page: "segmentation",
  },
  {
    name: "Конверсия",
    definition: "Доля объектов, совершивших целевое действие.",
    detail:
      "Если 40 из 1 000 клиентов докупили продукт, конверсия равна 4%. Знаменатель и окно наблюдения должны быть явно зафиксированы.",
    page: "segmentation",
  },
  {
    name: "Uplift",
    definition: "Дополнительный эффект воздействия относительно базового сценария.",
    detail:
      "Если конверсия теста 5%, а контроля 4%, абсолютный uplift — 1 процентный пункт, относительный — 25%.",
    page: "segmentation",
  },
  {
    name: "CRM",
    definition: "Система управления взаимодействиями с клиентами.",
    detail:
      "В ней могут храниться контакты, обращения, статусы и коммуникации. CRM — важный, но не единственный источник аналитической витрины.",
    page: "client-base",
  },
];

const CARDS: Card[] = [
  {
    front: "УК",
    back: "Управляющая компания — организация, которая управляет активами клиентов или имуществом фонда.",
    tags: "bankwiki core uk",
    page: "client-base",
  },
  {
    front: "ПИФ",
    back: "Паевой инвестиционный фонд — имущественный комплекс под управлением УК.",
    tags: "bankwiki core products",
    page: "client-base",
  },
  {
    front: "Докупка",
    back: "Повторное вложение клиента в продукт после первой покупки; требует точного окна и правил учета операций.",
    tags: "bankwiki lifecycle target",
    page: "client-base",
  },
  {
    front: "Отток",
    back: "Определенное аналитиком событие снижения или прекращения отношений; формула зависит от продукта и задачи.",
    tags: "bankwiki lifecycle target",
    page: "client-base",
  },
  {
    front: "Цессия",
    back: "Уступка права требования от прежнего кредитора новому; не равна обычному погашению или клиентскому оттоку.",
    tags: "bankwiki legal glossary",
    page: "client-base",
  },
  {
    front: "Когорта",
    back: "Группа объектов с общим стартовым событием и периодом, например первая покупка в январе.",
    tags: "bankwiki segmentation analytics",
    page: "segmentation",
  },
  {
    front: "Целевая переменная",
    back: "Результат, который анализируют или предсказывают: например, докупка за 30 дней.",
    tags: "bankwiki segmentation target",
    page: "segmentation",
  },
  {
    front: "Утечка данных",
    back: "Использование информации из будущего, недоступной в момент реального решения.",
    tags: "bankwiki segmentation quality",
    page: "segmentation",
  },
  {
    front: "A/B-тест",
    back: "Сравнение случайно сформированных тестовой и контрольной групп для оценки причинного эффекта изменения.",
    tags: "bankwiki experiment ab",
    page: "segmentation",
  },
  {
    front: "Абсолютный uplift",
    back: "Конверсия теста минус конверсия контроля; 5% − 4% = 1 процентный пункт.",
    tags: "bankwiki experiment metrics",
    page: "segmentation",
  },
  ...FOUNDATION_CARDS,
];

const QUIZZES: Record<PageId, Question[]> = {
  "client-base": [
    {
      prompt: "Что должно быть строкой витрины для прогноза докупки клиентом?",
      options: [
        "Случайная операция",
        "Клиент на дату наблюдения",
        "Название продукта",
      ],
      correct: 1,
      explanation:
        "Нужна фиксированная гранулярность: клиент на конкретную дату, после которой начинается окно прогноза.",
    },
    {
      prompt: "Как корректнее определить отток?",
      options: [
        "Один раз и одинаково для всех продуктов",
        "Как любое снижение активов",
        "Через правила события, окно и специфику продукта",
      ],
      correct: 2,
      explanation:
        "Отток — аналитическая конструкция. Ее определение должно быть воспроизводимым и согласованным с бизнесом.",
    },
    {
      prompt: "Цессия — это…",
      options: [
        "Передача права требования",
        "Повторная покупка",
        "Любое полное погашение",
      ],
      correct: 0,
      explanation:
        "Цессия означает уступку права требования новому кредитору и требует отдельной бизнес-трактовки в данных.",
    },
  ],
  segmentation: [
    {
      prompt: "Какой сегмент полезен для вторичных коммуникаций?",
      options: [
        "Самый большой",
        "Тот, для которого можно выбрать отличающееся действие",
        "Тот, где больше всего признаков",
      ],
      correct: 1,
      explanation:
        "Сегментация ценна не красотой групп, а решением: кому, когда и что сообщать.",
    },
    {
      prompt: "Что является утечкой данных при прогнозе оттока?",
      options: [
        "Сумма активов до даты прогноза",
        "Возраст отношений до даты прогноза",
        "Статус погашения, появившийся после даты прогноза",
      ],
      correct: 2,
      explanation:
        "Будущий статус уже раскрывает результат и не был доступен в момент принятия решения.",
    },
    {
      prompt: "Зачем в A/B-тесте нужна контрольная группа?",
      options: [
        "Чтобы оценить, что произошло бы без изменения",
        "Чтобы увеличить размер рассылки",
        "Чтобы выбрать клиентов с лучшей конверсией",
      ],
      correct: 0,
      explanation:
        "Контроль приближает контрфактический сценарий и помогает отделить эффект кампании от фоновых изменений.",
    },
  ],
  ...FOUNDATION_QUIZZES,
};

function useStoredSet(key: string) {
  const [values, setValues] = useState<Set<string>>(new Set());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    let saved = new Set<string>();
    try {
      saved = new Set(JSON.parse(localStorage.getItem(key) ?? "[]") as string[]);
    } catch {
      saved = new Set();
    }
    queueMicrotask(() => {
      if (!active) return;
      setValues(saved);
      setReady(true);
    });
    return () => { active = false; };
  }, [key]);

  const toggle = (value: string) => {
    setValues((current) => {
      const next = new Set(current);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      localStorage.setItem(key, JSON.stringify([...next]));
      return next;
    });
  };

  return { values, toggle, ready };
}

function TermButton({ name, onOpen }: { name: string; onOpen: (name: string) => void }) {
  return (
    <button className="term-link" type="button" onClick={() => onOpen(name)}>
      {name}
    </button>
  );
}

function Quiz({ questions }: { questions: Question[] }) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const score = questions.reduce(
    (total, question, index) => total + (answers[index] === question.correct ? 1 : 0),
    0,
  );

  return (
    <section className="learning-block quiz-block" id="quiz">
      <div className="section-heading-row">
        <div>
          <span className="kicker">Самопроверка</span>
          <h2>Три вопроса без подвоха</h2>
        </div>
        <span className="score-pill">
          {Object.keys(answers).length === questions.length
            ? `${score} / ${questions.length}`
            : "ответьте на все"}
        </span>
      </div>
      <div className="quiz-list">
        {questions.map((question, questionIndex) => (
          <fieldset className="quiz-card" key={question.prompt}>
            <legend>
              <span>{questionIndex + 1}</span>
              {question.prompt}
            </legend>
            <div className="answer-grid">
              {question.options.map((option, optionIndex) => {
                const selected = answers[questionIndex] === optionIndex;
                const answered = answers[questionIndex] !== undefined;
                const state = answered
                  ? optionIndex === question.correct
                    ? "correct"
                    : selected
                      ? "wrong"
                      : ""
                  : "";
                return (
                  <button
                    type="button"
                    className={`answer ${selected ? "selected" : ""} ${state}`}
                    key={option}
                    onClick={() =>
                      setAnswers((current) => ({
                        ...current,
                        [questionIndex]: optionIndex,
                      }))
                    }
                  >
                    {option}
                  </button>
                );
              })}
            </div>
            {answers[questionIndex] !== undefined && (
              <p className="explanation">{question.explanation}</p>
            )}
          </fieldset>
        ))}
      </div>
    </section>
  );
}

function Flashcards({ pageId }: { pageId: PageId }) {
  const cards = CARDS.filter((card) => card.page === pageId);
  const [active, setActive] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const card = cards[active];

  return (
    <section className="learning-block flashcard-block" id="cards">
      <div className="section-heading-row">
        <div>
          <span className="kicker">Повторение</span>
          <h2>Карточки по странице</h2>
        </div>
        <span className="score-pill">{active + 1} / {cards.length}</span>
      </div>
      <button
        className={`flashcard ${revealed ? "revealed" : ""}`}
        type="button"
        onClick={() => setRevealed((value) => !value)}
        aria-label={revealed ? "Скрыть ответ" : "Показать ответ"}
      >
        <span>{revealed ? "Ответ" : "Вопрос"}</span>
        <strong>{revealed ? card.back : card.front}</strong>
        <small>Нажмите, чтобы {revealed ? "вернуться к вопросу" : "увидеть ответ"}</small>
      </button>
      <div className="card-controls">
        <button
          type="button"
          onClick={() => {
            setActive((active - 1 + cards.length) % cards.length);
            setRevealed(false);
          }}
        >
          ← Назад
        </button>
        <button
          type="button"
          onClick={() => {
            setActive((active + 1) % cards.length);
            setRevealed(false);
          }}
        >
          Дальше →
        </button>
      </div>
    </section>
  );
}

function ClientBaseArticle({ onTerm }: { onTerm: (name: string) => void }) {
  return (
    <>
      <section className="article-section" id="map">
        <span className="kicker">Карта местности</span>
        <h2>Что именно анализирует вторичная продажа</h2>
        <p className="lead">
          Первая продажа приводит человека в продукт. Вторичная коммуникация помогает ему
          продолжить отношения: разобраться, докупить подходящий продукт, остаться в нем или
          своевременно получить сервисную информацию. Аналитик ищет не «кого уговорить», а
          где релевантная коммуникация полезна клиенту и измеримо влияет на результат.
        </p>
        <div className="definition-card">
          <span>Главная мысль</span>
          <strong>Клиентская база — не таблица людей, а система связанных сущностей и событий.</strong>
        </div>
        <p>
          В ней соседствуют <TermButton name="CRM" onOpen={onTerm} />, договоры,
          счета, продукты, операции и история контактов. Один клиент может иметь несколько
          договоров и продуктов, а одна операция — относиться к конкретному договору, но
          влиять на общую оценку отношений с клиентом.
        </p>
      </section>

      <section className="article-section" id="entities">
        <span className="kicker">Сущности</span>
        <h2>Пять слоев, которые нельзя смешивать</h2>
        <div className="entity-grid">
          <article><b>01</b><h3>Клиент</h3><p>Человек или организация. Здесь живут профиль и устойчивые характеристики.</p></article>
          <article><b>02</b><h3>Договор</h3><p>Юридическая рамка отношений: даты, статус, канал заключения, условия.</p></article>
          <article><b>03</b><h3>Продукт</h3><p>ПИФ, стратегия или иной объект владения. У продукта своя механика операций.</p></article>
          <article><b>04</b><h3>Событие</h3><p>Покупка, докупка, обмен, погашение, изменение статуса или обращения.</p></article>
          <article><b>05</b><h3>Коммуникация</h3><p>Контакт, предложение, канал, дата доставки, отклик и результат кампании.</p></article>
        </div>
        <aside className="warning-card">
          <span>Типичная ошибка</span>
          <p>
            Соединить таблицы «клиент × операции × коммуникации» без предварительного
            агрегирования. Строки размножатся, суммы и число контактов окажутся завышены.
          </p>
        </aside>
      </section>

      <section className="article-section" id="lifecycle">
        <span className="kicker">Жизненный цикл</span>
        <h2>От входа до докупки или оттока</h2>
        <div className="journey" aria-label="Жизненный цикл клиента">
          <div><span>1</span><strong>Первая покупка</strong><small>точка старта</small></div>
          <i>→</i>
          <div><span>2</span><strong>Освоение</strong><small>первые 30–90 дней</small></div>
          <i>→</i>
          <div><span>3</span><strong>Докупка</strong><small>расширение отношений</small></div>
          <i>→</i>
          <div><span>4</span><strong>Удержание</strong><small>продолжение владения</small></div>
          <i>→</i>
          <div><span>5</span><strong>Отток</strong><small>по заданному правилу</small></div>
        </div>
        <p>
          <TermButton name="Докупка" onOpen={onTerm} /> и <TermButton name="Отток" onOpen={onTerm} />
          — не готовые поля из источника, а бизнес-определения. Например, «докупка в течение
          30 дней после коммуникации на сумму не менее X» и «полное погашение с отсутствием
          активов через 60 дней». Без окна и правил два аналитика получат разные ответы.
        </p>
      </section>

      <section className="article-section" id="signals">
        <span className="kicker">Сигналы</span>
        <h2>Что может быть связано с будущим поведением</h2>
        <div className="signal-table" role="table" aria-label="Группы аналитических признаков">
          <div role="row"><strong role="cell">Отношения</strong><span role="cell">стаж клиента, число продуктов, давность последней операции</span></div>
          <div role="row"><strong role="cell">Портфель</strong><span role="cell">объем активов, структура, изменение стоимости, концентрация</span></div>
          <div role="row"><strong role="cell">Поведение</strong><span role="cell">ритм пополнений, погашения, просмотры, обращения</span></div>
          <div role="row"><strong role="cell">Коммуникации</strong><span role="cell">канал, частота, доставка, отклик, время с последнего контакта</span></div>
          <div role="row"><strong role="cell">Контекст</strong><span role="cell">этап жизненного цикла, продукт, когорта входа, допустимые ограничения</span></div>
        </div>
        <aside className="note-card">
          <span>Осторожно</span>
          <p>
            Связь признака с докупкой еще не означает, что воздействие на этот признак вызовет
            докупку. Сначала описываем зависимость, затем проверяем гипотезу экспериментом.
          </p>
        </aside>
      </section>

      <section className="article-section" id="cession">
        <span className="kicker">Термин из документов</span>
        <h2>Цессия: короткий разбор</h2>
        <div className="cession-visual">
          <div><small>Кредитор A</small><strong>право требования</strong></div>
          <span>уступает →</span>
          <div><small>Кредитор B</small><strong>право требования</strong></div>
          <em>Должник остается обязанным по тому же требованию</em>
        </div>
        <p>
          <TermButton name="Цессия" onOpen={onTerm} /> — юридический термин. В витрине он может
          появиться как отдельный тип договора или события. Его нельзя молча приравнивать к
          оттоку: сначала выясните бизнес-смысл поля, направление передачи права и момент учета.
        </p>
      </section>

      <section className="article-section" id="checklist">
        <span className="kicker">Первый рабочий алгоритм</span>
        <h2>Шесть вопросов перед любым расчетом</h2>
        <ol className="checklist">
          <li><span>01</span><p><b>Какое решение принимаем?</b> Кому и какую коммуникацию планируем изменить?</p></li>
          <li><span>02</span><p><b>Что является строкой?</b> Клиент, договор, продукт или клиент на дату?</p></li>
          <li><span>03</span><p><b>Где точка наблюдения?</b> Какие данные доступны именно на эту дату?</p></li>
          <li><span>04</span><p><b>Что считаем результатом?</b> Докупку, сумму, удержание или отсутствие оттока?</p></li>
          <li><span>05</span><p><b>Каково окно?</b> 7, 30, 90 дней — и почему?</p></li>
          <li><span>06</span><p><b>Какие исключения?</b> Служебные операции, дубли, закрытые договоры, особые статусы.</p></li>
        </ol>
        <Link className="next-article-card" href="/segmentation">
          <span>Следующая статья</span>
          <strong>Сегментация клиентской базы</strong>
          <p>Превратим набор сущностей и событий в группы, с которыми можно работать.</p>
          <b>Перейти →</b>
        </Link>
      </section>
    </>
  );
}

function SegmentationArticle({ onTerm }: { onTerm: (name: string) => void }) {
  return (
    <>
      <section className="article-section" id="purpose">
        <span className="kicker">Смысл</span>
        <h2>Сегмент нужен для решения, а не для отчета</h2>
        <p className="lead">
          <TermButton name="Сегмент" onOpen={onTerm} /> — группа клиентов, которую можно
          описать и для которой есть отличающееся действие. Если после разбиения коммуникация
          для всех остается одинаковой, сегментация пока не принесла практической пользы.
        </p>
        <div className="formula-card">
          <span>Полезный сегмент</span>
          <strong>Понятное правило</strong><i>+</i><strong>Заметное отличие</strong><i>+</i><strong>Доступное действие</strong>
        </div>
        <p>
          Не смешивайте сегмент и <TermButton name="Когорта" onOpen={onTerm} />. Сегмент
          объединяет по характеристикам или ожидаемому поведению, а когорта — по общему
          стартовому событию и времени, например первой покупке в одном месяце.
        </p>
      </section>

      <section className="article-section" id="example">
        <span className="kicker">Пример MVP</span>
        <h2>Четыре рабочие группы для первой гипотезы</h2>
        <div className="segment-grid">
          <article className="s1"><span>32%</span><h3>Новые</h3><p>До 90 дней с первой покупки. Нужны объяснение продукта и спокойное сопровождение.</p></article>
          <article className="s2"><span>24%</span><h3>Регулярные</h3><p>Есть устойчивый ритм пополнений. Важно не нарушить привычный сценарий.</p></article>
          <article className="s3"><span>28%</span><h3>С потенциалом</h3><p>Давно в продукте, но без недавних докупок. Нужна проверяемая гипотеза релевантности.</p></article>
          <article className="s4"><span>16%</span><h3>С риском оттока</h3><p>Есть заранее определенные сигналы. Коммуникация должна быть сервисной и уместной.</p></article>
        </div>
        <p className="fine-print">
          Проценты условные и показывают механику интерфейса, а не реальные пропорции клиентской базы.
        </p>
      </section>

      <section className="article-section" id="features">
        <span className="kicker">Данные</span>
        <h2>Признаки, цель и дата отсечения</h2>
        <p>
          <TermButton name="Признак" onOpen={onTerm} /> описывает клиента до даты решения, а
          <TermButton name="Целевая переменная" onOpen={onTerm} /> — то, что произойдет после
          нее. Между ними должна стоять строгая временная граница.
        </p>
        <div className="timeline-card">
          <div><span>История</span><b>Признаки</b><small>все, что известно</small></div>
          <i>→</i>
          <div className="cutoff"><span>15 марта</span><b>Дата решения</b><small>ничего из будущего</small></div>
          <i>→</i>
          <div><span>Следующие 30 дней</span><b>Цель</b><small>докупил / не докупил</small></div>
        </div>
        <aside className="warning-card">
          <span>Красный флаг</span>
          <p>
            Если для прогноза используется статус, появившийся после даты решения, возникла
            <TermButton name="Утечка данных" onOpen={onTerm} />. Исторический результат будет
            завышен, а реальный запуск разочарует.
          </p>
        </aside>
      </section>

      <section className="article-section" id="method">
        <span className="kicker">Методы</span>
        <h2>Начинайте с правил, усложняйте по необходимости</h2>
        <div className="method-stack">
          <article><b>1</b><div><h3>Бизнес-правила</h3><p>Прозрачны и быстро проверяются: стаж × давность операции × число продуктов.</p></div><span>старт</span></article>
          <article><b>2</b><div><h3>Когортный анализ</h3><p>Показывает, как меняется поведение одинаково «возрастных» групп клиентов.</p></div><span>динамика</span></article>
          <article><b>3</b><div><h3>Кластеризация</h3><p>Ищет группы по данным, но требует интерпретации, устойчивости и бизнес-проверки.</p></div><span>поиск</span></article>
          <article><b>4</b><div><h3>Скоринг</h3><p>Оценивает вероятность цели для каждого клиента; сегменты строятся по диапазонам и ограничениям.</p></div><span>масштаб</span></article>
        </div>
        <aside className="note-card">
          <span>Причинность</span>
          <p>
            Высокая докупка в сегменте не доказывает, что рассылка вызовет ее. Для оценки
            эффекта коммуникации нужен <TermButton name="A/B-тест" onOpen={onTerm} />.
          </p>
        </aside>
      </section>

      <section className="article-section" id="experiment">
        <span className="kicker">Кампании</span>
        <h2>Минимальная схема A/B-теста</h2>
        <div className="experiment-flow">
          <div className="audience"><span>Целевая аудитория</span><strong>10 000 клиентов</strong></div>
          <div className="split">случайное<br />разделение</div>
          <div className="test"><span>Тест</span><strong>новая коммуникация</strong><small>измеряем конверсию</small></div>
          <div className="control"><span>Контроль</span><strong>обычный сценарий</strong><small>измеряем конверсию</small></div>
        </div>
        <div className="metric-grid">
          <article><span>Конверсия</span><strong>целевые действия / аудитория</strong></article>
          <article><span>Абсолютный uplift</span><strong>CR<sub>test</sub> − CR<sub>control</sub></strong></article>
          <article><span>Доход на клиента</span><strong>результат / вся группа</strong></article>
          <article><span>Защитные метрики</span><strong>отписки, жалобы, отток</strong></article>
        </div>
        <p>
          <TermButton name="Конверсия" onOpen={onTerm} /> без знаменателя и окна наблюдения
          неоднозначна. <TermButton name="Uplift" onOpen={onTerm} /> показывает добавочный
          эффект относительно контроля, а не просто результат тестовой группы.
        </p>
      </section>

      <section className="article-section" id="powerbi">
        <span className="kicker">Power BI</span>
        <h2>Какие срезы понадобятся в первом отчете</h2>
        <div className="dashboard-mock" aria-label="Схема отчета по вторичным коммуникациям">
          <header><span>Период ▾</span><span>Кампания ▾</span><span>Канал ▾</span><span>Сегмент ▾</span></header>
          <div className="kpi"><article><small>Аудитория</small><b>10 000</b></article><article><small>Доставлено</small><b>92%</b></article><article><small>Конверсия</small><b>4,8%</b></article><article><small>Uplift</small><b>+0,9 п.п.</b></article></div>
          <div className="chart-bars"><i style={{ height: "34%" }}></i><i style={{ height: "58%" }}></i><i style={{ height: "42%" }}></i><i style={{ height: "77%" }}></i><i style={{ height: "65%" }}></i><i style={{ height: "88%" }}></i></div>
          <footer><span>Новые</span><span>Регулярные</span><span>Потенциал</span><span>Риск оттока</span></footer>
        </div>
        <ul className="dash-list">
          <li><b>Срезы:</b> период, кампания, канал, продукт, сегмент, когорта.</li>
          <li><b>Воронка:</b> отбор → отправка → доставка → отклик → целевое действие.</li>
          <li><b>Сравнение:</b> тест и контроль, абсолютная и относительная разница.</li>
          <li><b>Качество:</b> объем исключений, пропуски, дубли, задержка обновления.</li>
        </ul>
      </section>

      <section className="article-section" id="checklist-segmentation">
        <span className="kicker">Проверка результата</span>
        <h2>Сегментация готова, если…</h2>
        <ul className="done-list">
          <li>каждому клиенту назначается не более одного сегмента на дату;</li>
          <li>правило можно повторить на тех же данных;</li>
          <li>сегменты различаются по целевой метрике и доступны для коммуникаций;</li>
          <li>для каждого сегмента сформулировано действие и ограничение;</li>
          <li>эффект будущего изменения можно проверить на контроле.</li>
        </ul>
        <Link className="next-article-card back" href="/">
          <span>Связанная основа</span>
          <strong>Клиентская база УК</strong>
          <p>Вернитесь к сущностям, событиям и определениям докупки и оттока.</p>
          <b>Открыть статью →</b>
        </Link>
      </section>
    </>
  );
}

function FoundationHeroVisual({
  labels,
  index,
}: {
  labels: readonly [string, string, string];
  index: number;
}) {
  return (
    <div className="hero-topic-visual" aria-hidden="true">
      <span className="hero-orbit orbit-one"></span>
      <span className="hero-orbit orbit-two"></span>
      <strong>{String(index + 1).padStart(2, "0")}</strong>
      <div className="topic-chip chip-one">{labels[0]}</div>
      <div className="topic-chip chip-two">{labels[1]}</div>
      <div className="topic-chip chip-three">{labels[2]}</div>
    </div>
  );
}

function FoundationArticle({ pageId }: { pageId: FoundationPageId }) {
  const article = FOUNDATION_ARTICLES[pageId];

  return (
    <>
      <section className="article-section" id="meaning">
        <span className="kicker">Смысл</span>
        <h2>Сначала соберите рамку решения</h2>
        <p className="lead">{article.lead}</p>
        <div className="definition-card">
          <span>Главная мысль</span>
          <strong>{article.takeaway}</strong>
        </div>
      </section>

      <section className="article-section" id="concepts">
        <span className="kicker">Ключевые понятия</span>
        <h2>{article.conceptsTitle}</h2>
        <div className="concept-grid">
          {article.concepts.map((concept, index) => (
            <article key={concept.title}>
              <b>{String(index + 1).padStart(2, "0")}</b>
              <h3>{concept.title}</h3>
              <p>{concept.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="article-section" id="practice">
        <span className="kicker">Практика</span>
        <h2>{article.practiceTitle}</h2>
        <p>{article.practiceLead}</p>
        <div className="steps-stack">
          {article.steps.map((step, index) => (
            <article key={step.title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div><h3>{step.title}</h3><p>{step.text}</p></div>
            </article>
          ))}
        </div>
        <div className="example-card">
          <span>{article.exampleLabel}</span>
          <p>{article.example}</p>
        </div>
        <aside className="warning-card">
          <span>Типичная ошибка</span>
          <p>{article.warning}</p>
        </aside>
      </section>

      <section className="article-section" id="checklist-foundation">
        <span className="kicker">Проверка понимания</span>
        <h2>{article.checklistTitle}</h2>
        <ul className="done-list">
          {article.checklist.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </section>
    </>
  );
}

export default function WikiApp({ pageId }: { pageId: PageId }) {
  const page = PAGES[pageId];
  const pageEntries = Object.entries(PAGES) as [PageId, PageConfig][];
  const pageIndex = pageEntries.findIndex(([id]) => id === pageId);
  const previousPage = pageEntries[pageIndex - 1];
  const nextPage = pageEntries[pageIndex + 1];
  const pageCardCount = CARDS.filter((card) => card.page === pageId).length;
  const pageCount = pageEntries.length;
  const favorites = useStoredSet("bankwiki:favorites");
  const learned = useStoredSet("bankwiki:learned");
  const [query, setQuery] = useState("");
  const [glossaryOpen, setGlossaryOpen] = useState(false);
  const [glossaryQuery, setGlossaryQuery] = useState("");
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const learnedCount = learned.ready ? learned.values.size : 0;
  const isFavorite = favorites.values.has(pageId);
  const isLearned = learned.values.has(pageId);

  const searchResults = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("ru");
    if (normalized.length < 2) return [];
    const pageResults = Object.entries(PAGES)
      .filter(([, item]) =>
        `${item.title} ${item.summary} ${item.searchText}`.toLocaleLowerCase("ru").includes(normalized),
      )
      .map(([id, item]) => ({
        type: "Статья",
        title: item.title,
        text: item.summary,
        href: item.href,
        term: null as string | null,
        id,
      }));
    const termResults = GLOSSARY.filter((term) =>
      `${term.name} ${term.aliases?.join(" ") ?? ""} ${term.definition} ${term.detail}`
        .toLocaleLowerCase("ru")
        .includes(normalized),
    ).map((term) => ({
      type: "Словарь",
      title: term.name,
      text: term.definition,
      href: PAGES[term.page].href,
      term: term.name,
      id: term.name,
    }));
    return [...pageResults, ...termResults].slice(0, 8);
  }, [query]);

  const filteredGlossary = useMemo(() => {
    const normalized = glossaryQuery.trim().toLocaleLowerCase("ru");
    if (!normalized) return GLOSSARY;
    return GLOSSARY.filter((term) =>
      `${term.name} ${term.aliases?.join(" ") ?? ""} ${term.definition} ${term.detail}`
        .toLocaleLowerCase("ru")
        .includes(normalized),
    );
  }, [glossaryQuery]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
      }
      if (event.key === "Escape") {
        setGlossaryOpen(false);
        setQuery("");
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const openTerm = (name: string) => {
    setSelectedTerm(name);
    setGlossaryQuery("");
    setGlossaryOpen(true);
  };

  const exportCards = () => {
    const lines = [
      "#separator:tab",
      "#html:true",
      "#notetype column:1",
      "#deck column:2",
      "#tags column:6",
      ...CARDS.map(
        (card) => `Простая\tBankWiki\t${card.front}\t${card.back}\t\t${card.tags}`,
      ),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "bankwiki-cards.txt";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const selected = selectedTerm
    ? GLOSSARY.find((term) => term.name === selectedTerm)
    : undefined;

  return (
    <div className="wiki-shell">
      <aside className="sidebar">
        <Link className="brand" href="/investment-basics" aria-label="БанкВики — к началу курса">
          <span>БВ</span>
          <div><strong>БанкВики</strong><small>вторичные продажи</small></div>
        </Link>
        <div className="course-label">Учебный маршрут · {pageCount} статей</div>
        <nav className="course-nav" aria-label="Учебные статьи">
          {pageEntries.map(([id, item], index) => (
            <Link href={item.href} className={id === pageId ? "active" : ""} key={id}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div><strong>{item.title}</strong><small>{item.time}</small></div>
              {learned.values.has(id) && <b aria-label="Изучено">✓</b>}
            </Link>
          ))}
        </nav>
        <div className="sidebar-tools">
          <button type="button" onClick={() => setGlossaryOpen(true)}><span>А–Я</span> Словарь <b>{GLOSSARY.length}</b></button>
          <a href="#cards"><span>▣</span> Карточки <b>{CARDS.length}</b></a>
          <button type="button" onClick={exportCards}><span>⇩</span> Экспорт TSV</button>
        </div>
        <div className="progress-card">
          <div className="progress-ring" style={{ "--progress": `${(learnedCount / pageCount) * 360}deg` } as React.CSSProperties}>
            <span>{learnedCount}/{pageCount}</span>
          </div>
          <div><strong>Ваш прогресс</strong><small>Хранится только в этом браузере</small></div>
        </div>
      </aside>

      <main>
        <header className="topbar">
          <div className="search-wrap">
            <span aria-hidden="true">⌕</span>
            <input
              ref={searchRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Поиск по статьям и словарю…"
              aria-label="Полнотекстовый поиск"
            />
            <kbd>⌘ K</kbd>
            {query.length >= 2 && (
              <div className="search-results">
                {searchResults.length ? searchResults.map((result) => (
                  result.term ? (
                    <button key={`${result.type}-${result.id}`} type="button" onClick={() => { openTerm(result.term!); setQuery(""); }}>
                      <span>{result.type}</span><strong>{result.title}</strong><small>{result.text}</small>
                    </button>
                  ) : (
                    <Link key={`${result.type}-${result.id}`} href={result.href}>
                      <span>{result.type}</span><strong>{result.title}</strong><small>{result.text}</small>
                    </Link>
                  )
                )) : <p>Ничего не найдено. Попробуйте другой термин.</p>}
              </div>
            )}
          </div>
          <button
            type="button"
            className={`icon-button ${isFavorite ? "active" : ""}`}
            onClick={() => favorites.toggle(pageId)}
            aria-label={isFavorite ? "Удалить из избранного" : "Добавить в избранное"}
            title={isFavorite ? "В избранном" : "В избранное"}
          >
            {isFavorite ? "★" : "☆"}
          </button>
          <button
            type="button"
            className={`learn-button ${isLearned ? "done" : ""}`}
            onClick={() => learned.toggle(pageId)}
          >
            {isLearned ? "✓ Изучено" : "Отметить изученным"}
          </button>
        </header>

        <article className="article">
          <section className={`hero ${page.color}`}>
            {page.image ? (
              // Vinext dev has no ASSETS binding for the next/image optimization route.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={page.image}
                alt={page.imageAlt ?? ""}
                style={{ objectPosition: page.imagePosition }}
              />
            ) : (
              <FoundationHeroVisual
                labels={page.visualLabels ?? ["цель", "риск", "решение"]}
                index={pageIndex}
              />
            )}
            <div className="hero-overlay"></div>
            <div className="hero-copy">
              <span>{page.eyebrow}</span>
              <h1>{page.title}</h1>
              <p>{page.summary}</p>
              <div><b>{page.time}</b><b>Уровень: с нуля</b><b>{pageCardCount} карточек · {QUIZZES[pageId].length} вопроса</b></div>
            </div>
          </section>

          <div className="article-meta">
            <span>Обновлено 9 августа 2026</span>
            <span>·</span>
            <span>Материал для обучения, не инвестиционная рекомендация</span>
            {page.imageCredit && (
              <>
                <span>·</span>
                <a href={page.imageCredit.url} target="_blank" rel="noreferrer">
                  Фото: {page.imageCredit.label}
                </a>
              </>
            )}
          </div>

          {pageId === "client-base" ? (
            <ClientBaseArticle onTerm={openTerm} />
          ) : pageId === "segmentation" ? (
            <SegmentationArticle onTerm={openTerm} />
          ) : (
            <FoundationArticle pageId={pageId} />
          )}

          <Quiz questions={QUIZZES[pageId]} />
          <Flashcards pageId={pageId} />

          <section className="backlinks" id="backlinks">
            <span className="kicker">Учебный маршрут</span>
            <h2>Продолжить изучение</h2>
            <div className="backlink-list">
              {previousPage && (
                <Link href={previousPage[1].href}>
                  <span>{String(pageIndex).padStart(2, "0")}</span>
                  <div><strong>{previousPage[1].title}</strong><small>Предыдущая статья</small></div>
                  <b>←</b>
                </Link>
              )}
              {nextPage && (
                <Link href={nextPage[1].href}>
                  <span>{String(pageIndex + 2).padStart(2, "0")}</span>
                  <div><strong>{nextPage[1].title}</strong><small>Следующая статья</small></div>
                  <b>→</b>
                </Link>
              )}
            </div>
          </section>

          <footer className="article-footer">
            <p><strong>БанкВики</strong> · локальная учебная база</p>
            <p>Прогресс, избранное и результаты остаются на вашем устройстве.</p>
          </footer>
        </article>
      </main>

      {glossaryOpen && (
        <div className="drawer-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.currentTarget === event.target) setGlossaryOpen(false);
        }}>
          <aside className="glossary-drawer" role="dialog" aria-modal="true" aria-label="Словарь терминов">
            <header>
              <div><span>А–Я</span><div><strong>Словарь</strong><small>{GLOSSARY.length} терминов в MVP</small></div></div>
              <button type="button" onClick={() => setGlossaryOpen(false)} aria-label="Закрыть словарь">×</button>
            </header>
            <label className="drawer-search">
              <span>⌕</span>
              <input value={glossaryQuery} onChange={(event) => setGlossaryQuery(event.target.value)} placeholder="Найти термин…" autoFocus />
            </label>
            {selected && !glossaryQuery && (
              <article className="selected-term">
                <span>Выбранный термин</span>
                <h2>{selected.name}</h2>
                {selected.aliases && <small>Также: {selected.aliases.join(", ")}</small>}
                <strong>{selected.definition}</strong>
                <p>{selected.detail}</p>
                {selected.source && <a href={selected.source.url} target="_blank" rel="noreferrer">Источник: {selected.source.label} ↗</a>}
                <button type="button" onClick={() => setSelectedTerm(null)}>Показать весь словарь</button>
              </article>
            )}
            {(!selected || glossaryQuery) && (
              <div className="term-list">
                {filteredGlossary.map((term) => (
                  <button type="button" key={term.name} onClick={() => setSelectedTerm(term.name)}>
                    <span>{term.name.slice(0, 1)}</span>
                    <div><strong>{term.name}</strong><small>{term.definition}</small></div>
                    <b>→</b>
                  </button>
                ))}
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
