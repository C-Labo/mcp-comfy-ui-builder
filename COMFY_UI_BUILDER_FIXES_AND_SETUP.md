# ComfyUI-Builder MCP — виправлення та налаштування

**Дата:** 2 лютого 2025
**Оновлено:** 2 лютого 2025 (v1.1.3)
**Статус:**
- ✅ **v1.1.3**: install_custom_node тепер використовує venv Python
- ✅ **v1.1.0**: COMFYUI_KNOWLEDGE_DIR тепер працює в CLI

---

## 1. Пункти, які потрібно поправити

### 1.1. install_custom_node — потрібен Python-пакет `rich`

**Статус:** ✅ **ВИПРАВЛЕНО у v1.1.3** (2025-02-02)

**Проблема (до v1.1.3):** ComfyUI-Manager `cm-cli` потребує `rich` для виводу. MCP використовував системний Python (`/usr/bin/python3`) замість Python з ComfyUI venv, тому `rich` не знаходився навіть після встановлення у venv:

```
ModuleNotFoundError: No module named 'rich'
```

**Виправлення (v1.1.3+):**
- ✅ Додано функцію `getPythonExecutable()` в `src/manager-cli.ts`
- ✅ MCP тепер **автоматично** використовує Python з `COMFYUI_PATH/venv/bin/python3` (Linux/Mac) або `venv/Scripts/python.exe` (Windows)
- ✅ Fallback на системний Python, якщо venv не знайдено
- ✅ `checkRichAvailable()` також використовує venv Python

**Рішення для користувачів:**

Просто встановіть `rich` у ComfyUI venv (MCP тепер автоматично його знайде):

```bash
# Шлях до venv pip
/Users/d.bilukcha/Projects/comfyui-lana/ComfyUI/venv/bin/pip install rich

# Або активуй venv
source /шлях/до/ComfyUI/venv/bin/activate
pip install rich
```

**Перевірка після оновлення:**

```bash
# Тест (з репозиторію MCP)
COMFYUI_PATH=/path/to/ComfyUI node test-python-venv.js
# Очікуваний вивід: "Rich доступний: true"
```

---

### 1.2. execute_chain — ENAMETOOLONG при inline JSON

**Проблема:** якщо передавати workflow як inline JSON-об'єкт, `execute_chain` генерує дуже довгу назву файлу і падає з `ENAMETOOLONG`.

**Причина:** Це обмеження MCP протоколу або клієнта (Cursor/Claude Desktop), а не коду сервера.

**Рішення:** використовувати **ім'я збереженого workflow**, а не inline JSON:

```json
{
  "steps": [
    { "workflow": "txt2img_workflow" }
  ]
}
```

Замість:

```json
{
  "steps": [
    { "workflow": { "1": {...}, "2": {...} } }
  ]
}
```

Спочатку збережи workflow через `save_workflow`, потім викликай `execute_chain` з ім'ям.

---

### 1.3. COMFYUI_KNOWLEDGE_DIR ✅ ВИПРАВЛЕНО

**Проблема (була):** CLI команди (`npm run seed`, `npm run sync-nodes`) не використовували змінну `COMFYUI_KNOWLEDGE_DIR`. Тільки MCP сервер (src/mcp-server.ts) підхоплював цю змінну, а CLI завжди шукав у `process.cwd()/knowledge`.

**Виправлення (2 лютого 2025):**
- ✅ Виправлено функцію `knowledgePath()` в `src/cli.ts:20-24`
- ✅ Тепер і CLI, і MCP сервер використовують `COMFYUI_KNOWLEDGE_DIR` однаково

**Код після виправлення (src/cli.ts):**
```typescript
const knowledgePath = () => {
  const envDir = process.env.COMFYUI_KNOWLEDGE_DIR?.trim();
  if (envDir) return envDir;
  return join(process.cwd(), 'knowledge');
};
```

**Як використовувати після оновлення:**

1. Встанови `COMFYUI_KNOWLEDGE_DIR` в `.cursor/mcp.json` або `claude_desktop_config.json`:
   ```json
   {
     "mcpServers": {
       "comfy-ui-builder": {
         "command": "node",
         "args": ["/absolute/path/to/mcp-comfy-ui-builder/dist/mcp-server.js"],
         "env": {
           "COMFYUI_HOST": "http://127.0.0.1:8188",
           "COMFYUI_KNOWLEDGE_DIR": "/absolute/path/to/knowledge",
           "COMFYUI_PATH": "/absolute/path/to/ComfyUI"
         }
       }
     }
   }
   ```

2. Перебудуй проект після оновлення коду:
   ```bash
   cd /path/to/mcp-comfy-ui-builder
   npm run build
   ```

3. Перезапусти Cursor/Claude Desktop

**Альтернатива (старий workaround):** symlink (див. розділ 2 нижче) - більше не потрібен, але можна залишити для сумісності.

---

### 1.4. install_model — потребує валідний URL

**Проблема:** на неіснуючий URL (наприклад `https://example.com/fake.safetensors`) повертається 404.

**Рішення:** передавати лише реальні посилання на завантаження (Civitai, HuggingFace тощо). Це очікувана поведінка.

---

## 2. Symlink для knowledge base (старий workaround)

**УВАГА:** Після виправлення (2.02.2025) symlink більше не потрібен! Використовуй `COMFYUI_KNOWLEDGE_DIR` env var замість symlink.

### Що це

MCP сервер шукає knowledge base за шляхом `process.cwd()/knowledge`. Коли Cursor запускає MCP, робоча директорія часто буде `~` (домашня), тобто `/Users/d.bilukcha`. У результаті MCP намагається читати `/Users/d.bilukcha/knowledge/base-nodes.json`, якого немає.

Щоб це обійти, можна створити symlink: `~/knowledge` → директорія knowledge з пакета mcp-comfy-ui-builder.

**КРАЩЕ РІШЕННЯ:** Використати `COMFYUI_KNOWLEDGE_DIR` env var (див. розділ 1.3 вище).

### Поточна налаштована структура

| Що | Куди вказує |
|----|--------------|
| `/Users/d.bilukcha/knowledge` | `/usr/local/lib/node_modules/mcp-comfy-ui-builder/knowledge` |

### Як створити symlink (якщо хочеш використовувати замість env var)

```bash
ln -s /usr/local/lib/node_modules/mcp-comfy-ui-builder/knowledge /Users/d.bilukcha/knowledge
```

### Як перевірити, що symlink є

```bash
ls -la /Users/d.bilukcha/knowledge
# Очікуваний вивід:
# lrwxr-xr-x  1 user  staff  58 ... /Users/d.bilukcha/knowledge -> /usr/local/lib/node_modules/mcp-comfy-ui-builder/knowledge
```

### Що всередині knowledge

```
knowledge/
├── base-nodes.json          # Опис нод ComfyUI
├── seed-base-nodes.json     # Seed-дані
├── seed-node-compatibility.json
├── custom-nodes.json
├── node-compatibility.json  # Типи, producers/consumers
├── README.md
└── CHANGELOG.md
```

### Після оновлення пакета mcp-comfy-ui-builder

Symlink залишається валідним: він вказує на директорію в `node_modules`, тому після `npm install -g mcp-comfy-ui-builder@latest` knowledge автоматично оновиться.

### Видалення symlink (якщо перейшов на env var)

```bash
rm /Users/d.bilukcha/knowledge
```

Після цього інструменти, що залежать від knowledge base (`list_node_types`, `get_node_info`, `check_compatibility`, `suggest_nodes`, `sync_nodes_to_knowledge`), знову не працюватимуть **якщо не встановлено COMFYUI_KNOWLEDGE_DIR**.

---

## 3. Швидкий чеклист налаштування

### ✅ Після виправлення (v1.1.3, 2.02.2025):

- [x] **v1.1.3 ВИПРАВЛЕНО**: `install_custom_node` автоматично використовує venv Python
- [x] **v1.1.0 ВИПРАВЛЕНО**: `COMFYUI_KNOWLEDGE_DIR` підхоплюється CLI і MCP сервером
- [ ] Оновити код: `git pull` або `npm install -g mcp-comfy-ui-builder@1.1.3`
- [ ] Перебудувати (якщо з git): `cd /path/to/mcp-comfy-ui-builder && npm run build && npm install -g .`
- [ ] Додати env var в `.cursor/mcp.json`:
  - `COMFYUI_HOST` (обов'язково для виконання workflow)
  - `COMFYUI_KNOWLEDGE_DIR` (тепер працює! можна замість symlink)
  - `COMFYUI_PATH` (обов'язково для install_custom_node і install_model)
- [ ] Перезапустити Cursor/Claude Desktop
- [ ] `pip install rich` у ComfyUI venv — тепер MCP **автоматично знайде** його у venv!
- [ ] Для `execute_chain` використовувати ім'я workflow, не inline JSON

### Альтернатива (якщо не хочеш використовувати env var):
- [ ] Symlink `~/knowledge` → `.../mcp-comfy-ui-builder/knowledge` (старий workaround)

---

## 4. Приклад повної MCP конфігурації

**Файл:** `.cursor/mcp.json` або `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "comfy-ui-builder": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-comfy-ui-builder/dist/mcp-server.js"],
      "env": {
        "COMFYUI_HOST": "http://127.0.0.1:8188",
        "COMFYUI_KNOWLEDGE_DIR": "/absolute/path/to/mcp-comfy-ui-builder/knowledge",
        "COMFYUI_PATH": "/Users/d.bilukcha/Projects/comfyui-lana/ComfyUI"
      }
    }
  }
}
```

**Важливо:**
- Всі шляхи мають бути **абсолютними**
- Після зміни конфігурації потрібно **перезапустити** Cursor/Claude Desktop
- ComfyUI має бути **запущений** для виконання workflow та синхронізації нод

---

## 5. Перевірка після налаштування

```bash
# 1. Перевір, що MCP сервер бачить knowledge base
# В Cursor/Claude викликай інструмент:
list_node_types

# 2. Перевір, що CLI бачить knowledge base
cd /path/to/mcp-comfy-ui-builder
export COMFYUI_KNOWLEDGE_DIR="/absolute/path/to/knowledge"
npm run seed
# Очікуваний вивід: "[cli] Merged seed into base-nodes.json: ..."

# 3. Перевір, що rich встановлений
/Users/d.bilukcha/Projects/comfyui-lana/ComfyUI/venv/bin/python -c "import rich; print('OK')"
# Очікуваний вивід: OK
```

---

## Changelog

- **2025-02-02 (v1.1.3)**: ✅ ВИПРАВЛЕНО - `install_custom_node` тепер автоматично використовує venv Python (src/manager-cli.ts - `getPythonExecutable()`)
- **2025-02-02 (v1.1.0)**: ✅ ВИПРАВЛЕНО - `COMFYUI_KNOWLEDGE_DIR` тепер працює в CLI (src/cli.ts)
- **2025-02-02**: Створено документ з описом проблем та workaround (symlink)
