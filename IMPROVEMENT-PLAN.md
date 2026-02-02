# MCP ComfyUI Builder - План покращень

Детальний план майбутніх покращень для максимальної зручності створення зображень.

**Завершені фази (1-6)** → дивіться [CHANGELOG.md](CHANGELOG.md) версії 0.3.0 та 0.4.0.

---

## Поточний стан проекту (v0.4.0)

| Компонент | Поточно | Ціль |
|-----------|---------|------|
| MCP інструменти | 40+ | 45+ |
| Шаблони workflows | 8 | 10+ |
| Ноди в knowledge base | 31+ | 100+ |
| Виконання | Polling | WebSocket + Polling |
| Будування workflows | Шаблони + Dynamic API | ✅ Done |
| Plugin System | Data-only | ✅ Done |
| Docker | Dockerfile готовий | Потребує тестування |

---

## ✅ Завершені фази

- **Phase 1:** Розширення шаблонів (inpainting, upscale, lora, controlnet, batch) — v0.3.0
- **Phase 2:** Dynamic Workflow Builder API — v0.3.0
- **Phase 3:** Node Discovery Enhancement (hybrid discovery, live sync) — v0.3.0
- **Phase 4:** Execution Improvements (batch, chaining, output management) — v0.3.0
- **Phase 5:** Model Management — v0.3.0
- **Phase 6:** Workflow Composition (templates, macros, chaining) — v0.4.0

Детальний опис → [CHANGELOG.md](CHANGELOG.md)

---

## 🔮 Майбутні плани

### Фаза 7: Docker та Розширення Plugin System

#### 7.1 Docker Testing та Publishing

**Статус:** Dockerfile та docker-compose.example.yml готові, потребують тестування.

**Завдання:**
- [ ] Протестувати Docker build локально
- [ ] Протестувати docker-compose стек з ComfyUI
- [ ] Опублікувати образ на Docker Hub або GitHub Container Registry
- [ ] Оновити doc/DOCKER-SETUP.md з реальними прикладами
- [ ] Додати CI/CD для автоматичної публікації образів

**Файли:**
- ✅ `Dockerfile` — готовий (multi-stage build)
- ✅ `docker-compose.example.yml` — готовий
- ✅ `doc/DOCKER-SETUP.md` — готовий
- [ ] `.github/workflows/docker-publish.yml` — CI/CD для публікації

#### 7.2 Розширення Plugin System

**Статус:** Базова система плагінів реалізована (v0.4.0), можна додати розширення.

**Можливі розширення:**
- [ ] **Plugin marketplace** — каталог community plugins
- [ ] **MCP tool для встановлення** — `install_plugin(url)` з GitHub
- [ ] **Plugin dependencies** — залежності між плагінами
- [ ] **Versioning** — перевірка сумісності версій
- [ ] **Custom node presets** — плагіни з рекомендаціями по встановленню custom nodes
- [ ] **Workflow collections** — пакети готових workflow від спільноти

**Поточна реалізація (v0.4.0):**
- ✅ Data-only plugin system з JSON schemas
- ✅ Plugin loader з валідацією
- ✅ Macro registry
- ✅ MCP tools: list_plugins, reload_plugins
- ✅ Example plugin included

### Фаза 8: WebSocket Support

**Мета:** Real-time виконання з миттєвим feedback через WebSocket.

**Завдання:**
- [ ] **ComfyUI WebSocket client** (`src/comfyui-ws-client.ts`)
  - Підключення до ComfyUI WebSocket API
  - Real-time progress tracking
  - Node-level execution callbacks
- [ ] **Streaming execution API**
  - `execute_workflow_stream` — streaming updates через MCP
  - Progress events з current_node, progress%, queue_position
- [ ] **MCP improvements**
  - `get_execution_progress` з real-time даними (не polling)
  - `interrupt_execution` — зупинити виконання

**Переваги:**
- Миттєвий feedback під час генерації
- Знижене навантаження (без polling)
- Детальна інформація про прогрес кожної ноди

---

### Фаза 9: Knowledge Base Expansion

**Мета:** Розширити базу знань до 100+ нод.

**Завдання:**
- [ ] Додати популярні custom node packs в knowledge base
  - ComfyUI-Manager top 50 packs
  - Essential nodes (Efficiency Nodes, Impact Pack, etc.)
- [ ] Автоматизувати оновлення knowledge base
  - Scheduled sync з custom-node-list.json
  - Auto-detection нових пакетів
- [ ] Node usage statistics
  - Tracking найпопулярніших нод
  - Рекомендації на основі статистики
- [ ] Advanced compatibility checking
  - Type inference для складних типів
  - Automatic conversion suggestions

---

### Фаза 10: Quality of Life Features

**Мета:** Покращення user experience.

**Можливі фічі:**
- [ ] **Workflow validation improvements**
  - Більш детальні помилки
  - Suggestions для виправлення
  - Visual graph validation
- [ ] **Template improvements**
  - Template inheritance
  - Conditional parameters
  - Parameter validation rules
- [ ] **Workflow optimization**
  - Automatic node deduplication
  - Unused node removal
  - Performance suggestions
- [ ] **Export/Import**
  - Export workflow as ComfyUI-compatible JSON
  - Import ComfyUI workflows
  - Workflow sharing formats
- [ ] **Better documentation**
  - Interactive examples
  - Video tutorials
  - API playground

---

## Пріоритети розробки

### Високий пріоритет
1. **Docker testing** (Фаза 7.1) — готові файли, потрібне тестування
2. **WebSocket support** (Фаза 8) — значне покращення UX
3. **Knowledge base expansion** (Фаза 9) — більше нод = більше можливостей

### Середній пріоритет
4. **Plugin marketplace** (Фаза 7.2) — community contributions
5. **Workflow validation improvements** (Фаза 10) — краща developer experience
6. **Template improvements** (Фаза 10) — більше гнучкості

### Низький пріоритет
7. **Plugin dependencies** (Фаза 7.2) — nice to have
8. **Node usage statistics** (Фаза 9) — analytics
9. **Export/Import** (Фаза 10) — додаткові формати

---

## Як контрибутити

Детальний опис завершених фаз → [CHANGELOG.md](CHANGELOG.md)

Для додавання нових фіч:
1. Створіть issue з описом фічі
2. Обговоріть підхід з maintainers
3. Реалізуйте з тестами
4. Оновіть документацію
5. Створіть PR

---

*Останнє оновлення: 2026-02-02*
