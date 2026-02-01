# План наступних дій — ComfyUI MCP / Node Discovery

> Що робити далі: scaffold → core → CLI → MCP → тести → deploy

**Дата:** 2026-02-01  
**Поточний стан:** документація і база знань готові; коду й конфігурації проєкту ще немає.

---

## Поточний стан

| Що є | Статус |
|------|--------|
| Документація (INDEX, SUMMARY, guides, API docs) | ✅ Готово |
| База знань (base-nodes, custom-nodes, node-compatibility) | ✅ Готово |
| IMPLEMENTATION-CHECKLIST, node-discovery-system | ✅ Готово |
| package.json, tsconfig.json, src/ | ❌ Немає |
| .env.example, кореневий README | ❌ Немає |

---

## Фаза 1: Scaffold проєкту (≈ 1 год)

**Мета:** мати репозиторій, у якому можна запускати TypeScript і використовувати базу знань.

| # | Дія | Результат |
|---|-----|------------|
| 1.1 | Створити `package.json` (name, version, description, scripts, dependencies) | `npm install` працює |
| 1.2 | Встановити залежності: `@anthropic-ai/sdk`, `@octokit/rest`, `commander`, `node-fetch`; dev: `typescript`, `tsx`, `@types/node` | Залежності в node_modules |
| 1.3 | Створити `tsconfig.json` (target ES2022, outDir dist, rootDir src, resolveJsonModule) | `npx tsc --noEmit` проходить |
| 1.4 | Створити `.env.example` (ANTHROPIC_API_KEY, COMFYUI_HOST, NODE_BATCH_SIZE), додати `.env` у .gitignore | Безпечне збереження ключів |
| 1.5 | Створити структуру папок: `src/`, `src/node-discovery/`, `scripts/`, `tests/` | Базова структура |
| 1.6 | Скопіювати `doc/knowledge/` у корінь як `knowledge/` (або симлінк) | База знань доступна з коду |
| 1.7 | Написати кореневий `README.md` (опис проєкту, quick start, посилання на doc/) | Зрозуміло, як почати |

**Критерій готовності:** `npm run build` (або `tsx src/...`) запускається без помилок, з кореня можна читати `knowledge/*.json`.

---

## Фаза 2: Core-класи (≈ 6 год)

**Мета:** NodeScanner, AINodeDescriptionGenerator, KnowledgeBaseUpdater — без CLI і MCP.

| # | Дія | Файл / метод | Результат |
|---|-----|----------------|-----------|
| 2.1 | Типи: RawNodeInfo, NodeDescription, DataType | `src/types/node-types.ts` | Типізація для scanner/ai/updater |
| 2.2 | NodeScanner: `scanLiveInstance()` — GET /object_info, парсинг у Map | `src/node-discovery/scanner.ts` | Список нод з ComfyUI |
| 2.3 | NodeScanner: `fetchManagerList()` — завантаження custom-node-list.json | той самий файл | Список custom packs |
| 2.4 | NodeScanner: `analyzeRepository(url)` — GitHub README, __init__.py | той самий файл | Метадані з репо |
| 2.5 | NodeScanner: `findNewNodes(existingKeys)` | той самий файл | Тільки нові ноди для опису |
| 2.6 | AINodeDescriptionGenerator: `buildPrompt(rawNode)`, `extractJson(text)` | `src/node-discovery/ai-generator.ts` | Промпт і парсинг відповіді |
| 2.7 | AINodeDescriptionGenerator: `generateDescription(rawNode)` — виклик Claude | той самий файл | Один NodeDescription |
| 2.8 | AINodeDescriptionGenerator: `generateBatch(nodes, batchSize)` з rate limit | той самий файл | Батч описів |
| 2.9 | KnowledgeBaseUpdater: `addNode(className, description, isCustom)` | `src/node-discovery/updater.ts` | Оновлення base-nodes / custom-nodes |
| 2.10 | KnowledgeBaseUpdater: `updateCompatibility(nodeClass, desc)` | той самий файл | Оновлення node-compatibility.json |
| 2.11 | KnowledgeBaseUpdater: `generateChangelog(newNodes)` | той самий файл | Допис у CHANGELOG.md |

**Критерій готовності:** окремий скрипт/тест викликає scanner → ai-generator → updater для 1 ноди і оновлює knowledge/.

---

## Фаза 3: CLI (≈ 2–3 год)

**Мета:** команди `npm run scan`, `sync-manager`, `analyze`, `add-node`.

| # | Дія | Команда / сценарій | Результат |
|---|-----|---------------------|-----------|
| 3.1 | Підключити commander, зареєструвати команди | `src/cli.ts` або `src/node-discovery/cli.ts` | CLI вхід |
| 3.2 | Реалізувати `scan`: scanner → findNewNodes → ai-generator → updater | `npm run scan` | Авто-скан і оновлення бази |
| 3.3 | Реалізувати `scan --dry-run`: тільки вивід, без запису | `npm run scan:dry` | Безпечна перевірка |
| 3.4 | Реалізувати `sync-manager`: fetchManagerList → оновлення custom-nodes | `npm run sync-manager` | Оновлений список packs |
| 3.5 | Реалізувати `analyze <url>`: analyzeRepository + опційно генерація описів | `npm run analyze <url>` | Метадані/описи з GitHub |
| 3.6 | Реалізувати `add-node`: інтерактивний wizard (ім’я, джерело, Claude) → updater | `npm run add-node` | Ручне додавання ноди |

**Критерій готовності:** з кореня проєкту `npm run scan` при запущеному ComfyUI додає нові ноди в knowledge/.

---

## Фаза 4: MCP-сервер (≈ 4 год)

**Мета:** MCP tools для Cursor/Claude: list_node_types, get_node_info, check_compatibility, suggest_nodes.

| # | Дія | Tool / логіка | Результат |
|---|-----|----------------|-----------|
| 4.1 | Додати `@modelcontextprotocol/sdk`, ініціалізація сервера | `src/mcp-server.ts` або окремий пакет | MCP сервер запускається |
| 4.2 | Завантаження knowledge (base-nodes, node-compatibility) при старті | той самий файл | Контекст для tools |
| 4.3 | Tool `list_node_types`: фільтр за category/priority | MCP handler | Список нод для AI |
| 4.4 | Tool `get_node_info(node_name)`: повна інформація з base-nodes | MCP handler | Деталі ноди |
| 4.5 | Tool `check_compatibility(from_node, to_node)`: використати node-compatibility | MCP handler | Валідація з’єднань |
| 4.6 | Tool `suggest_nodes(task_description)` або за input_type | MCP handler | Підказки нод для workflow |
| 4.7 | Опис MCP у README та doc/ (як підключити в Cursor/Claude) | README, doc/ | Користувач може підключити |

**Критерій готовності:** Cursor/Claude бачить MCP-сервер і викликає list_node_types / get_node_info без помилок.

---

## Фаза 5: Тести і полірування (≈ 2 год)

| # | Дія | Результат |
|---|-----|-----------|
| 5.1 | Unit-тести: scanner (mock fetch), ai-generator (mock Claude), updater (тимчасові файли) | Зелені тести |
| 5.2 | Інтеграційний тест: scan на mock / тестовому ComfyUI | Один E2E сценарій |
| 5.3 | Обробка помилок і логування (structured log або console) | Зрозумілі повідомлення при збоях |
| 5.4 | Rate limiting для Claude та GitHub API | Немає 429 при масовому скані |
| 5.5 | Оновити doc/ (IMPLEMENTATION-CHECKLIST, GETTING-STARTED) за фактичними командами | Документація відповідає коду |

---

## Фаза 6: Deploy і підсумок (≈ 1 год)

| # | Дія | Результат |
|---|-----|-----------|
| 6.1 | Визначити спосіб запуску MCP (npm script, npx, Docker — опційно) | Інструкція в README |
| 6.2 | Приклад конфігурації MCP для Cursor (config JSON) | Копіювати-вставити в налаштування |
| 6.3 | Фінальний огляд README, doc/INDEX, CHANGELOG | Проєкт готовий до використання |

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
- **База знань у коді:** `doc/knowledge-base-usage-guide.md`
- **Швидкий старт:** `doc/GETTING-STARTED.md`, `doc/QUICK-REFERENCE.md`

---

*План збережено: doc/PLAN-NEXT-STEPS.md*  
*Версія: 1.0 | 2026-02-01*
