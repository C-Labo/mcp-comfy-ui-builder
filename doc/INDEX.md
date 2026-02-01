# 📚 Навігація по документації

**Швидкий вхід:** [README.md](README.md) — орієнтація за задачею та швидкий старт.

---

## За задачею

| Задача | Документ |
|--------|----------|
| Швидко запустити, команди під рукою | [QUICK-REFERENCE.md](QUICK-REFERENCE.md) |
| Повний старт, варіанти (ручно / wizard / скан) | [GETTING-STARTED.md](GETTING-STARTED.md) |
| Підключити MCP (Cursor / Claude Desktop) | [MCP-SETUP.md](MCP-SETUP.md) |
| Зрозуміти систему, архітектуру | [SUMMARY.md](SUMMARY.md), [SYSTEM-DIAGRAM.md](SYSTEM-DIAGRAM.md) |
| Розробляти / інтегрувати код | [node-discovery-system.md](node-discovery-system.md), [IMPLEMENTATION-CHECKLIST.md](IMPLEMENTATION-CHECKLIST.md) |
| ComfyUI API, база знань у коді | [comfyui-api-quick-reference.md](comfyui-api-quick-reference.md), [comfyui-api-detailed-guide.md](comfyui-api-detailed-guide.md), [knowledge-base-usage-guide.md](knowledge-base-usage-guide.md) |
| План фаз, наступні кроки | [PLAN-NEXT-STEPS.md](PLAN-NEXT-STEPS.md) |

---

## Усі документи

### Користувач (запуск, MCP)

| Документ | Призначення |
|----------|-------------|
| [README.md](README.md) | Вхід у документацію, навігація за задачею |
| [GETTING-STARTED.md](GETTING-STARTED.md) | Швидкий старт, три варіанти використання |
| [QUICK-REFERENCE.md](QUICK-REFERENCE.md) | Команди, JSON, troubleshooting |
| [MCP-SETUP.md](MCP-SETUP.md) | Запуск MCP, конфіг Cursor/Claude |
| [NODE-DISCOVERY-README.md](NODE-DISCOVERY-README.md) | Розширений гайд (use cases, встановлення) |

### Архітектура і розробка

| Документ | Призначення |
|----------|-------------|
| [SUMMARY.md](SUMMARY.md) | Огляд системи, features |
| [SYSTEM-DIAGRAM.md](SYSTEM-DIAGRAM.md) | Діаграми, потік даних |
| [node-discovery-system.md](node-discovery-system.md) | Технічна архітектура, код |
| [IMPLEMENTATION-CHECKLIST.md](IMPLEMENTATION-CHECKLIST.md) | Чеклист імплементації |
| [PLAN-NEXT-STEPS.md](PLAN-NEXT-STEPS.md) | План фаз (scaffold → deploy) |

### Довідники

| Документ | Призначення |
|----------|-------------|
| [comfyui-api-quick-reference.md](comfyui-api-quick-reference.md) | ComfyUI API — коротко |
| [comfyui-api-detailed-guide.md](comfyui-api-detailed-guide.md) | ComfyUI API — детально |
| [knowledge-base-usage-guide.md](knowledge-base-usage-guide.md) | База знань у коді (Node, Python, jq) |
| [knowledge/README.md](../knowledge/README.md) | Структура бази знань, формати |
| [knowledge/node-description-prompt-template.md](../knowledge/node-description-prompt-template.md) | Шаблон промпту для Claude |

### База знань (файли в корені проєкту)

Папка **`knowledge/`** — єдине джерело правди. Посилання з doc/ ведуть туди.

| Файл | Призначення |
|------|-------------|
| [knowledge/base-nodes.json](../knowledge/base-nodes.json) | Опис базових нод |
| [knowledge/custom-nodes.json](../knowledge/custom-nodes.json) | Список custom packs |
| [knowledge/node-compatibility.json](../knowledge/node-compatibility.json) | Типи даних, producers/consumers |

---

## Короткі відповіді (FAQ)

- **З чого почати?** → [README.md](README.md) → [GETTING-STARTED.md](GETTING-STARTED.md) або [QUICK-REFERENCE.md](QUICK-REFERENCE.md).
- **Як додати ноду?** Автоматично: `npm run scan`. Інтерактивно: `npm run add-node`. Вручну: curl object_info + prompt template + додати в base-nodes.json.
- **Як підключити MCP?** → [MCP-SETUP.md](MCP-SETUP.md).
- **Де база знань?** У корені проєкту: папка `knowledge/`.
