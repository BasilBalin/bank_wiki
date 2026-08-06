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
