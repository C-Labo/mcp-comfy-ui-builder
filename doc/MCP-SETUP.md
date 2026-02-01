# MCP Server — ComfyUI Node Discovery

> Як підключити MCP-сервер у Cursor та Claude Desktop

***

## Що надає сервер

| Tool | Опис |
|------|------|
| **list_node_types** | Список нод з knowledge (опційно: category, priority) |
| **get_node_info(node_name)** | Повна інформація про ноду з base-nodes.json |
| **check_compatibility(from_node, to_node)** | Чи можна з’єднати вихід однієї ноди з входом іншої |
| **suggest_nodes(task_description \| input_type)** | Підказки нод за описом задачі або типом виходу |

Дані беруться з `knowledge/base-nodes.json` та `knowledge/node-compatibility.json` при старті сервера.

***

## Запуск сервера

З кореня проєкту (спочатку збірка):

```bash
npm run build
npm run mcp
```

Альтернатива: `node dist/mcp-server.js`. Сервер використовує **stdio** (stdin/stdout).

***

## Підключення в Cursor

1. Відкрийте налаштування MCP (Cursor Settings → MCP або відповідний конфіг).
2. Додайте сервер (замініть шлях на свій):

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

3. Перезапустіть Cursor.

Після підключення AI може викликати `list_node_types`, `get_node_info`, `check_compatibility`, `suggest_nodes` для побудови workflow ComfyUI.

***

## Підключення в Claude Desktop

- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- Створіть файл, якщо його немає.
- Додайте той самий блок `mcpServers` (з абсолютним шляхом до `dist/mcp-server.js`).
- Перезапустіть Claude Desktop (повністю вийти з програми, не лише закрити вікно).

***

## Перевірка

Після підключення переконайтеся, що Cursor/Claude бачить інструменти (наприклад, у списку MCP tools). Можна запитати: «List ComfyUI node types with category loaders» або «Get info for KSampler» — AI викличе відповідні tools.

***

## Troubleshooting

| Проблема | Що перевірити |
|----------|----------------|
| **MCP не бачить tools** | Шлях у `args` має бути **абсолютним** до `dist/mcp-server.js`. Після зміни конфігу — повністю перезапустити Cursor/Claude. |
| **Сервер не запускається** | Виконати `npm run build` з кореня проєкту. Переконатися, що є папка `knowledge/` з `base-nodes.json` і `node-compatibility.json`. |
| **Порожній список нод** | Файл `knowledge/base-nodes.json` має містити об'єкт `nodes`. За потреби запустити `npm run scan` або додати ноди вручну. |
| **Помилка ENOENT / module not found** | Запускати MCP з **кореня проєкту** (звідки видно `knowledge/` і `dist/`). У конфігу Cursor `args` — шлях саме до `dist/mcp-server.js`. |

Приклад конфігу для Cursor: [examples/cursor-mcp.json](../examples/cursor-mcp.json) (скопіювати і підставити свій шлях).

***

*MCP Setup v1.1 | 2026-02-01*
