# Документація — ComfyUI Node Discovery

Єдиний вхід у документацію: орієнтуйтесь **за задачею**, потім переходьте до потрібного файлу.

---

## Швидкий старт (5 хв)

1. **Встановити:** `npm install` (з кореня проєкту).
2. **Налаштувати:** скопіювати `.env.example` в `.env`, вказати `ANTHROPIC_API_KEY`, `COMFYUI_HOST`.
3. **Запустити:** `npm run scan:dry` (перевірка) або `npm run add-node` (додати одну ноду).

Детальніше → [GETTING-STARTED.md](GETTING-STARTED.md).

---

## За задачею

| Що хочете зробити | Документ |
|-------------------|----------|
| **Запустити скан / додати ноду / команди під рукою** | [QUICK-REFERENCE.md](QUICK-REFERENCE.md) |
| **Повний старт і варіанти використання** (ручно, wizard, скан) | [GETTING-STARTED.md](GETTING-STARTED.md) |
| **Підключити MCP у Cursor або Claude Desktop** | [MCP-SETUP.md](MCP-SETUP.md) |
| **Зрозуміти, що це за система і як працює** | [SUMMARY.md](SUMMARY.md) |
| **Побачити архітектуру (діаграми, потік даних)** | [SYSTEM-DIAGRAM.md](SYSTEM-DIAGRAM.md) |
| **Розробляти або інтегрувати код** | [node-discovery-system.md](node-discovery-system.md), [IMPLEMENTATION-CHECKLIST.md](IMPLEMENTATION-CHECKLIST.md) |
| **Деталі ComfyUI API** (object_info, endpoints) | [comfyui-api-quick-reference.md](comfyui-api-quick-reference.md), [comfyui-api-detailed-guide.md](comfyui-api-detailed-guide.md) |
| **Як використовувати базу знань у коді** | [knowledge-base-usage-guide.md](knowledge-base-usage-guide.md), [knowledge/README.md](../knowledge/README.md) |
| **План фаз і наступні кроки** | [PLAN-NEXT-STEPS.md](PLAN-NEXT-STEPS.md) |

---

## Усі документи (список)

| Файл | Призначення |
|------|-------------|
| [GETTING-STARTED.md](GETTING-STARTED.md) | Швидкий старт, варіанти: ручно / wizard / скан |
| [QUICK-REFERENCE.md](QUICK-REFERENCE.md) | Команди, структури JSON, troubleshooting |
| [MCP-SETUP.md](MCP-SETUP.md) | Запуск MCP, підключення в Cursor/Claude |
| [SUMMARY.md](SUMMARY.md) | Огляд системи, features, структура |
| [SYSTEM-DIAGRAM.md](SYSTEM-DIAGRAM.md) | Діаграми, flow |
| [NODE-DISCOVERY-README.md](NODE-DISCOVERY-README.md) | Розширений гайд (встановлення, use cases) |
| [node-discovery-system.md](node-discovery-system.md) | Архітектура, API, код |
| [IMPLEMENTATION-CHECKLIST.md](IMPLEMENTATION-CHECKLIST.md) | Чеклист імплементації |
| [PLAN-NEXT-STEPS.md](PLAN-NEXT-STEPS.md) | План фаз (scaffold → deploy) |
| [comfyui-api-quick-reference.md](comfyui-api-quick-reference.md) | ComfyUI API — короткий довідник |
| [comfyui-api-detailed-guide.md](comfyui-api-detailed-guide.md) | ComfyUI API — детальний гайд |
| [knowledge-base-usage-guide.md](knowledge-base-usage-guide.md) | База знань у коді (Node, Python, jq) |
| [INDEX.md](INDEX.md) | Повна навігація (таблиці, FAQ, посилання на knowledge/) |

База знань (єдине джерело правди) — папка **`knowledge/`** в корені проєкту.
