import assert from "node:assert/strict";
import test from "node:test";

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${path}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${path}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("renders the client-base article", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /Клиентская база УК/);
  assert.match(html, /Цессия: короткий разбор/);
  assert.match(html, /Сегментация клиентской базы/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/i);
});

test("renders the linked segmentation article", async () => {
  const response = await render("/segmentation");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /Сегмент нужен для решения/);
  assert.match(html, /Минимальная схема A\/B-теста/);
  assert.match(html, /Power BI/);
});

const foundationPages = [
  ["/investment-basics", /Инвестиции: цели, смысл и границы/, /Продукт появляется в самом конце/],
  ["/financial-goals", /Финансовые цели инвестора/, /Желание становится расчётной задачей/],
  ["/risk-return", /Риск и доходность/, /Одна ожидаемая доходность скрывает разные исходы/],
  ["/horizon-liquidity", /Горизонт и ликвидность/, /Деньги получают разную свободу движения/],
  ["/inflation-real-return", /Инфляция и реальная доходность/, /Рост суммы ещё не означает рост возможностей/],
  ["/compound-interest", /Сложный процент и время/, /Доход начинает приносить новый доход/],
  ["/investor-profile", /Профиль инвестора/, /Допустимый риск задаёт самое слабое звено/],
  ["/asset-classes", /Основные классы активов/, /Класс актива выбирают по функции в портфеле/],
];

for (const [path, heading, visualHeading] of foundationPages) {
  test(`renders the foundation article at ${path}`, async () => {
    const response = await render(path);
    assert.equal(response.status, 200);

    const html = await response.text();
    assert.match(html, heading);
    assert.match(html, visualHeading);
    assert.match(html, /Три вопроса без подвоха/);
    assert.match(html, /Карточки по странице/);
    assert.match(html, /Материал для обучения, не инвестиционная рекомендация/);
  });
}
