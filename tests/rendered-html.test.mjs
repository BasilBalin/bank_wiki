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
  ["/investment-basics", /Инвестиции: цели, смысл и границы/],
  ["/financial-goals", /Финансовые цели инвестора/],
  ["/risk-return", /Риск и доходность/],
  ["/horizon-liquidity", /Горизонт и ликвидность/],
  ["/inflation-real-return", /Инфляция и реальная доходность/],
  ["/compound-interest", /Сложный процент и время/],
  ["/investor-profile", /Профиль инвестора/],
  ["/asset-classes", /Основные классы активов/],
];

for (const [path, heading] of foundationPages) {
  test(`renders the foundation article at ${path}`, async () => {
    const response = await render(path);
    assert.equal(response.status, 200);

    const html = await response.text();
    assert.match(html, heading);
    assert.match(html, /Три вопроса без подвоха/);
    assert.match(html, /Карточки по странице/);
    assert.match(html, /Материал для обучения, не инвестиционная рекомендация/);
  });
}
