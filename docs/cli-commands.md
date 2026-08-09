# Команды

## Подготовка терминала

```bash
# добавить встроенные Node.js и pnpm в PATH текущего терминала; команда только меняет окружение этой сессии
export PATH="/Users/vasilijbalin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/vasilijbalin/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback:$PATH"
```

## Локальная разработка

```bash
# перейти в папку проекта; команда ничего не изменяет
cd '/Users/vasilijbalin/python/projects/bank_wiki'

# запустить тестовую версию на http://localhost:3000; процесс работает до Ctrl+C
pnpm run dev
```

## Стабильная локальная версия

```bash
# собрать стабильную версию; команда обновляет только генерируемую папку dist
pnpm run build

# запустить стабильную версию на http://localhost:3001; процесс работает до Ctrl+C
pnpm start
```

## Проверка

```bash
# собрать локальную производственную версию; команда обновляет только генерируемую папку dist
pnpm run build

# собрать проект и выполнить тесты серверного рендеринга; команда обновляет dist и не меняет исходники
pnpm test
```
