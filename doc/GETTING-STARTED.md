# 🚀 Getting Started - Node Discovery System

> Швидкий старт та практичні приклади

***

## Що потрібно

- Node.js 18+
- ComfyUI запущений на http://127.0.0.1:8188 (або свій URL)
- Claude API key (Anthropic) — для автоматичної генерації описів
- ComfyUI-Manager (рекомендовано) — для повного списку нод

***

## Варіант 1: Ручне додавання ноди (без коду)

**Час: ~15 хвилин**

1. Отримати інфо про ноду з ComfyUI:
   ```bash
   curl http://127.0.0.1:8188/object_info | jq '.NodeName' > node.json
   ```

2. Відкрити **prompt template**: `knowledge/node-description-prompt-template.md`

3. Вставити вміст `node.json` в промпт для Claude (згідно інструкцій у template)

4. Отримати від Claude structured JSON і додати його в `knowledge/base-nodes.json` (в об'єкт `nodes`)

5. За потреби оновити `knowledge/node-compatibility.json` (типи даних, producers/consumers)

**Результат**: Нова нода задокументована в базі знань, готова для MCP/Claude.

***

## Варіант 2: Інтерактивний wizard (`add-node`)

```bash
export ANTHROPIC_API_KEY="sk-ant-..."
npm run add-node
```

1. Ввести **class name** ноди (наприклад `KSampler`).
2. Система бере дані з ComfyUI (`GET /object_info`), формує промпт з шаблону `knowledge/node-description-prompt-template.md` і викликає Claude.
3. Отриманий JSON додається в `knowledge/base-nodes.json`, оновлюються `node-compatibility.json` та CHANGELOG.

Потрібно: ComfyUI запущений (`COMFYUI_HOST`), `ANTHROPIC_API_KEY`.

***

## Варіант 3: Автоматичний скан

```bash
export ANTHROPIC_API_KEY="sk-ant-..."
npm run scan
```

Система: підключиться до ComfyUI `/object_info`, знайде ноди, яких ще немає в базі, згенерує описи через Claude, оновить JSON і CHANGELOG.

**Сухий прогон (без запису):** `npm run scan:dry`

**Змінні оточення:** `COMFYUI_HOST` (за замовчуванням `http://127.0.0.1:8188`), `ANTHROPIC_API_KEY`, `NODE_BATCH_SIZE` (опційно), `DEBUG=1` для детального логу.

***

## Швидкі команди ComfyUI API

```bash
# Перевірити, що ComfyUI доступний
curl http://127.0.0.1:8188/system_stats | jq '.system.gpu_name'

# Скільки нод доступно
curl http://127.0.0.1:8188/object_info | jq 'keys | length'

# Інфо про конкретну ноду
curl http://127.0.0.1:8188/object_info | jq '.KSampler'
```

***

## Тести

```bash
npm test
npm run test:watch
```

Тести: scanner, ai-generator, updater, MCP tools (unit), scan integration (mock).

***

## Наступні кроки

- **Навігація за задачею**: [doc/README.md](README.md)
- **Повне розуміння**: [SUMMARY.md](SUMMARY.md) → [SYSTEM-DIAGRAM.md](SYSTEM-DIAGRAM.md)
- **Швидкий довідник**: [QUICK-REFERENCE.md](QUICK-REFERENCE.md)
- **MCP**: [MCP-SETUP.md](MCP-SETUP.md)

***

*Getting Started v1.2.0* | *2026-02-01*
