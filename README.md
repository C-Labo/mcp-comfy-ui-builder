# mcp-comfy-ui-builder

**ComfyUI Node Discovery** — сканування нод з ComfyUI, генерація описів через Claude, оновлення бази знань та MCP tools для Cursor/Claude.

## Що це

- Підключення до ComfyUI API (`/object_info`) та ComfyUI-Manager (custom-node-list)
- Визначення нових нод, генерація структурованих описів через Anthropic Claude
- Оновлення `knowledge/base-nodes.json`, `custom-nodes.json`, `node-compatibility.json`
- MCP-сервер з інструментами: `list_node_types`, `get_node_info`, `check_compatibility`, `suggest_nodes`

## Quick start

1. **Клонувати та встановити залежності**

   ```bash
   git clone <repo-url> && cd mcp-comfy-ui-builder
   npm install
   ```

2. **Налаштувати середовище**

   ```bash
   cp .env.example .env
   # Відредагувати .env: ANTHROPIC_API_KEY, COMFYUI_HOST (за замовчуванням http://127.0.0.1:8188)
   ```

3. **Перевірити збірку**

   ```bash
   npm run build
   # або запуск без збірки:
   npm run dev -- --help
   ```

4. **Читати базу знань з коду**

   База знань знаходиться в `knowledge/` в корені проєкту. Приклад:

   ```ts
   import baseNodes from './knowledge/base-nodes.json' assert { type: 'json' };
   ```

## Команди

| Команда | Опис |
|--------|------|
| `npm run scan` | Скан ComfyUI → нові ноди → Claude → оновлення knowledge/ |
| `npm run scan:dry` | Те саме без запису (dry-run) |
| `npm run sync-manager` | Оновлення списку custom packs з ComfyUI-Manager |
| `npm run analyze <url>` | Аналіз репо (GitHub): README, __init__.py |
| `npm run add-node` | Інтерактивне додавання однієї ноди |
| `npm test` | Запуск тестів (vitest) |
| `npm run mcp` | Запуск MCP-сервера (після `npm run build`) |

## Документація

Єдиний вхід — **орієнтація за задачею**:

- **[doc/README.md](doc/README.md)** — з чого почати, навігація за задачею
- **[doc/INDEX.md](doc/INDEX.md)** — повний список документів і посилань
- **[doc/QUICK-REFERENCE.md](doc/QUICK-REFERENCE.md)** — команди, приклади, troubleshooting
- **[doc/GETTING-STARTED.md](doc/GETTING-STARTED.md)** — швидкий старт (ручно / wizard / скан)
- **[doc/MCP-SETUP.md](doc/MCP-SETUP.md)** — підключення MCP у Cursor/Claude
- **Архітектура:** [doc/node-discovery-system.md](doc/node-discovery-system.md), [doc/PLAN-NEXT-STEPS.md](doc/PLAN-NEXT-STEPS.md)
- **База знань:** [knowledge/README.md](knowledge/README.md), [doc/knowledge-base-usage-guide.md](doc/knowledge-base-usage-guide.md)

## Вимоги

- Node.js 18+
- ComfyUI (за бажанням — запущений для `scan`)
- Anthropic API key — для автоматичної генерації описів нод

## MCP-сервер (Cursor / Claude)

Сервер надає інструменти для AI:

- **list_node_types** — список нод з бази знань (опційно фільтр за category/priority)
- **get_node_info(node_name)** — повна інформація про ноду
- **check_compatibility(from_node, to_node)** — перевірка сумісності виходу з входом
- **suggest_nodes(task_description | input_type)** — підказки нод за задачею або типом

### Запуск MCP

З кореня проєкту спочатку зберіть проєкт, потім запустіть сервер:

```bash
npm run build
npm run mcp
```

Або без npm: `node dist/mcp-server.js`. Сервер працює через **stdio** (stdin/stdout). Детальніше → [doc/MCP-SETUP.md](doc/MCP-SETUP.md).

### Підключення в Cursor

Додайте сервер у налаштування MCP (Cursor Settings → MCP або конфіг):

```json
{
  "mcpServers": {
    "comfy-ui-builder": {
      "command": "node",
      "args": ["/ABSOLUTE/PATH/TO/mcp-comfy-ui-builder/dist/mcp-server.js"]
    }
  }
}
```

Замініть `/ABSOLUTE/PATH/TO/mcp-comfy-ui-builder` на повний шлях до клону проєкту. Перезапустіть Cursor після зміни конфігу.

### Підключення в Claude Desktop

Файл конфігурації: `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS). Додайте той самий блок `mcpServers` і перезапустіть Claude.

## Ліцензія

MIT
