# План наступних дій — ComfyUI MCP / Node Discovery

> Що робити далі: scaffold → core → CLI → MCP → тести → deploy

**Дата:** 2026-02-01  
**Останнє оновлення:** 2026-02-01 — виконано фази 1–6 (scaffold → core → CLI → MCP → тести → deploy). MVP завершено.

---

## Що далі (для нового чату)

- **Фаза 5** — ✅ тести (unit, інтеграція), обробка помилок, logger, rate limiting, оновлення doc.
- **Фаза 6** — ✅ deploy (інструкція MCP, приклад конфігу, CHANGELOG, Troubleshooting).

MVP уже готовий: `npm run scan`, `npm run mcp`, CLI-команди працюють; MCP tools: list_node_types, get_node_info, check_compatibility, suggest_nodes.

---

## Поточний стан

| Що є | Статус |
|------|--------|
| Документація (INDEX, SUMMARY, guides, API docs) | ✅ Готово |
| База знань (base-nodes, custom-nodes, node-compatibility) | ✅ Готово |
| IMPLEMENTATION-CHECKLIST, node-discovery-system | ✅ Готово |
| package.json, tsconfig.json, src/ | ✅ Готово |
| .env.example, кореневий README | ✅ Готово |
| Core (scanner, ai-generator, updater) | ✅ Готово |
| CLI (scan, sync-manager, analyze, add-node) | ✅ Готово |
| MCP-сервер (src/mcp-server.ts), doc/MCP-SETUP.md | ✅ Готово |

---

## Фаза 1: Scaffold проєкту (≈ 1 год) ✅ ВИКОНАНО

**Мета:** мати репозиторій, у якому можна запускати TypeScript і використовувати базу знань.

| # | Дія | Результат |
|---|-----|------------|
| 1.1 | ✅ Створити `package.json` (name, version, description, scripts, dependencies) | `npm install` працює |
| 1.2 | ✅ Встановити залежності: `@anthropic-ai/sdk`, `@octokit/rest`, `commander`, `node-fetch`; dev: `typescript`, `tsx`, `@types/node` | Залежності в node_modules |
| 1.3 | ✅ Створити `tsconfig.json` (target ES2022, outDir dist, rootDir src, resolveJsonModule) | `npx tsc --noEmit` проходить |
| 1.4 | ✅ Створити `.env.example` (ANTHROPIC_API_KEY, COMFYUI_HOST, NODE_BATCH_SIZE), додати `.env` у .gitignore | Безпечне збереження ключів |
| 1.5 | ✅ Створити структуру папок: `src/`, `src/node-discovery/`, `scripts/`, `tests/` | Базова структура |
| 1.6 | ✅ База знань у корені проєкту: `knowledge/` | База знань доступна з коду |
| 1.7 | ✅ Написати кореневий `README.md` (опис проєкту, quick start, посилання на doc/) | Зрозуміло, як почати |

**Критерій готовності:** `npm run build` (або `tsx src/...`) запускається без помилок, з кореня можна читати `knowledge/*.json`.

---

## Фаза 2: Core-класи (≈ 6 год) ✅ ВИКОНАНО

**Мета:** NodeScanner, AINodeDescriptionGenerator, KnowledgeBaseUpdater — без CLI і MCP.

| # | Дія | Файл / метод | Результат |
|---|-----|----------------|-----------|
| 2.1 | ✅ Типи: RawNodeInfo, NodeDescription, DataType | `src/types/node-types.ts` | Типізація для scanner/ai/updater |
| 2.2 | ✅ NodeScanner: `scanLiveInstance()` — GET /object_info, парсинг у Map | `src/node-discovery/scanner.ts` | Список нод з ComfyUI |
| 2.3 | ✅ NodeScanner: `fetchManagerList()` — завантаження custom-node-list.json | той самий файл | Список custom packs |
| 2.4 | ✅ NodeScanner: `analyzeRepository(url)` — GitHub README, __init__.py | той самий файл | Метадані з репо |
| 2.5 | ✅ NodeScanner: `findNewNodes(existingKeys)` | той самий файл | Тільки нові ноди для опису |
| 2.6 | ✅ AINodeDescriptionGenerator: `buildPrompt(rawNode)`, `extractJson(text)` | `src/node-discovery/ai-generator.ts` | Промпт і парсинг відповіді |
| 2.7 | ✅ AINodeDescriptionGenerator: `generateDescription(rawNode)` — виклик Claude | той самий файл | Один NodeDescription |
| 2.8 | ✅ AINodeDescriptionGenerator: `generateBatch(nodes, batchSize)` з rate limit | той самий файл | Батч описів |
| 2.9 | ✅ KnowledgeBaseUpdater: `addNode(className, description, isCustom)` | `src/node-discovery/updater.ts` | Оновлення base-nodes / custom-nodes |
| 2.10 | ✅ KnowledgeBaseUpdater: `updateCompatibility(nodeClass, desc)` | той самий файл | Оновлення node-compatibility.json |
| 2.11 | ✅ KnowledgeBaseUpdater: `generateChangelog(newNodes)` | той самий файл | Допис у CHANGELOG.md |

**Критерій готовності:** окремий скрипт `scripts/run-one-node.ts` викликає scanner → ai-generator → updater для 1 ноди.

---

## Фаза 3: CLI (≈ 2–3 год) ✅ ВИКОНАНО

**Мета:** команди `npm run scan`, `sync-manager`, `analyze`, `add-node`.

| # | Дія | Команда / сценарій | Результат |
|---|-----|---------------------|-----------|
| 3.1 | ✅ Підключити commander, зареєструвати команди | `src/cli.ts` | CLI вхід |
| 3.2 | ✅ Реалізувати `scan`: scanner → findNewNodes → ai-generator → updater | `npm run scan` | Авто-скан і оновлення бази |
| 3.3 | ✅ Реалізувати `scan --dry-run`: тільки вивід, без запису | `npm run scan:dry` | Безпечна перевірка |
| 3.4 | ✅ Реалізувати `sync-manager`: fetchManagerList → оновлення custom-nodes | `npm run sync-manager` | Оновлений список packs |
| 3.5 | ✅ Реалізувати `analyze <url>`: analyzeRepository + опційно генерація описів | `npm run analyze <url>` | Метадані/описи з GitHub |
| 3.6 | ✅ Реалізувати `add-node`: інтерактивний wizard (ім’я, джерело, Claude) → updater | `npm run add-node` | Ручне додавання ноди |

**Критерій готовності:** з кореня проєкту `npm run scan` при запущеному ComfyUI додає нові ноди в knowledge/.

---

## Фаза 4: MCP-сервер (≈ 4 год) ✅ ВИКОНАНО

**Мета:** MCP tools для Cursor/Claude: list_node_types, get_node_info, check_compatibility, suggest_nodes.

| # | Дія | Tool / логіка | Результат |
|---|-----|----------------|-----------|
| 4.1 | ✅ Додати `@modelcontextprotocol/sdk`, ініціалізація сервера | `src/mcp-server.ts` | MCP сервер запускається (`npm run mcp`) |
| 4.2 | ✅ Завантаження knowledge (base-nodes, node-compatibility) при старті | той самий файл | Контекст для tools |
| 4.3 | ✅ Tool `list_node_types`: фільтр за category/priority | MCP handler | Список нод для AI |
| 4.4 | ✅ Tool `get_node_info(node_name)`: повна інформація з base-nodes | MCP handler | Деталі ноди |
| 4.5 | ✅ Tool `check_compatibility(from_node, to_node)`: використати node-compatibility | MCP handler | Валідація з’єднань |
| 4.6 | ✅ Tool `suggest_nodes(task_description)` або за input_type | MCP handler | Підказки нод для workflow |
| 4.7 | ✅ Опис MCP у README та doc/MCP-SETUP.md (як підключити в Cursor/Claude) | README, doc/ | Користувач може підключити |

**Критерій готовності:** Cursor/Claude бачить MCP-сервер і викликає list_node_types / get_node_info без помилок.

---

## Фаза 5: Тести і полірування (≈ 2 год) ✅ ВИКОНАНО

**Мета:** надійність коду, зрозумілі помилки, стабільність при масовому скані, актуальна документація.

| # | Дія | Файл / метод | Результат |
|---|-----|----------------|-----------|
| 5.1 | ✅ Unit-тести: NodeScanner з mock fetch (object_info, manager list) | `tests/scanner.test.ts` | Зелені тести для scanner |
| 5.2 | ✅ Unit-тести: AINodeDescriptionGenerator (buildPrompt, extractJson) | `tests/ai-generator.test.ts` | Перевірка без Claude |
| 5.3 | ✅ Unit-тести: KnowledgeBaseUpdater з тимчасовою папкою | `tests/updater.test.ts` | addNode, updateCompatibility, generateChangelog |
| 5.4 | ✅ Unit-тести: MCP tools з фікстурними JSON | `tests/mcp-tools.test.ts` | list_node_types, get_node_info, check_compatibility |
| 5.5 | ✅ Інтеграційний тест: scan + findNewNodes з mock ComfyUI | `tests/integration/scan.test.ts` | E2E без реального API |
| 5.6 | ✅ Обробка помилок: CLI повідомлення "ComfyUI недоступний", "Invalid API key" | `src/cli.ts` | Зрозумілі повідомлення при збоях |
| 5.7 | ✅ Логування: `src/logger.ts` ([scan], [mcp], [cli]), `DEBUG=1` | `src/logger.ts`, `src/cli.ts` | Легше діагностувати |
| 5.8 | ✅ Rate limiting: затримки в generateBatch, retry з backoff у scanner | `ai-generator.ts`, `scanner.ts` | Немає 429 при масовому скані |
| 5.9 | ✅ Оновити IMPLEMENTATION-CHECKLIST за фактичними командами і файлами | `doc/IMPLEMENTATION-CHECKLIST.md` | Чеклист відповідає коду |
| 5.10 | ✅ Оновити GETTING-STARTED і QUICK-REFERENCE (команди, змінні оточення) | `doc/GETTING-STARTED.md`, `doc/QUICK-REFERENCE.md` | Новачок може повторити кроки |

**Критерій готовності:** `npm test` проходить (після `npm install`), при відключеному ComfyUI CLI показує зрозумілу помилку, doc/ синхронізований з реалізацією.

---

## Фаза 6: Deploy і підсумок (≈ 1 год) ✅ ВИКОНАНО

**Мета:** користувач може запустити MCP у Cursor/Claude, проєкт виглядає завершеним.

| # | Дія | Файл / артефакт | Результат |
|---|-----|------------------|-----------|
| 6.1 | ✅ Зафіксувати спосіб запуску MCP: `npm run mcp` (stdio) | `README.md`, `doc/MCP-SETUP.md` | Єдина інструкція "як запустити" |
| 6.2 | ✅ Приклад конфігурації MCP для Cursor | `examples/cursor-mcp.json` | Копіювання — підставити шлях |
| 6.3 | ✅ README: команди, npm test, npm run mcp, посилання на doc | `README.md` | Актуально |
| 6.4 | ✅ doc/README, INDEX — навігація за задачею, посилання валідні | `doc/` | Коректна навігація |
| 6.5 | ✅ Кореневий CHANGELOG: версія 0.1.0, фази 5–6 | `CHANGELOG.md` | Історія змін |
| 6.6 | ✅ Розділ Troubleshooting (MCP не бачить tools, ENOENT) | `doc/MCP-SETUP.md` | Менше питань |

**Критерій готовності:** за README та MCP-SETUP.md можна клонувати репо, встановити залежності і підключити MCP у Cursor.

---

## Після MVP (опційно)

| Напрям | Опис |
|--------|------|
| **Docker** | Образ з Node + проєктом для тих, хто не хоче ставити Node локально (MCP через stdio у контейнері). |
| **CI** | GitHub Actions: `npm run build`, `npm test` на push/PR. |
| **Версіонування knowledge** | Теги або окремі релізи для base-nodes / custom-nodes для відтворюваності workflow. |
| **Додаткові MCP tools** | Наприклад: `search_workflows(query)`, `validate_workflow(json)` якщо з’являться відповідні джерела даних. |
| **Оновлення за розкладом** | Cron або scheduled action для періодичного `scan` / `sync-manager` і коміту оновлень у knowledge. |

---

## Орієнтовні терміни

| Фаза | Орієнтовний час |
|------|------------------|
| 1. Scaffold | 1 год |
| 2. Core | 6 год |
| 3. CLI | 2–3 год |
| 4. MCP | 4 год |
| 5. Тести і полірування | 2 год |
| 6. Deploy | 1 год |
| **Разом** | **16–17 год** |

MVP (працюючий скан + MCP tools): фази 1–4 ≈ 13–14 год.

---

## Що використовувати з doc/

- **Архітектура і типи:** `doc/node-discovery-system.md`
- **Покроковий чеклист:** `doc/IMPLEMENTATION-CHECKLIST.md`
- **API ComfyUI:** `doc/comfyui-api-detailed-guide.md`, `doc/comfyui-api-quick-reference.md`
- **База знань у коді:** `doc/knowledge-base-usage-guide.md` (шлях з коду: `knowledge/` в корені)
- **Швидкий старт:** `doc/GETTING-STARTED.md`, `doc/QUICK-REFERENCE.md`
- **MCP підключення:** `doc/MCP-SETUP.md`

---

*План збережено: doc/PLAN-NEXT-STEPS.md*  
*Версія: 1.4 | 2026-02-01 | Фази 1–6 виконано; MVP завершено*
