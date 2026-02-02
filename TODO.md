# ✅ TODO List

> Workflow Builder plan (like @makafeli/n8n-workflow-builder for ComfyUI)

**Last Updated:** 2026-02-02
**Status:** v0.4.0 released. Core features complete ✅. Детальний план майбутніх покращень — [IMPROVEMENT-PLAN.md](IMPROVEMENT-PLAN.md).

---

## ✅ Завершені фази (v0.1.0 - v0.4.0)

Детальний опис → [CHANGELOG.md](CHANGELOG.md)

- **Phase 1-8** — Core MCP server, workflow builder, execution, save/load ✅
- **IMPROVEMENT-PLAN Phase 1** — 5 нових шаблонів (inpainting, upscale, lora, controlnet, batch) ✅
- **IMPROVEMENT-PLAN Phase 2** — Dynamic workflow builder API ✅
- **IMPROVEMENT-PLAN Phase 3** — Node discovery enhancement ✅
- **IMPROVEMENT-PLAN Phase 4** — Execution improvements (batch, chaining, outputs) ✅
- **IMPROVEMENT-PLAN Phase 5** — Model management ✅
- **IMPROVEMENT-PLAN Phase 6** — Workflow composition (templates, macros, plugins) ✅

**Поточні можливості:**
- 40+ MCP інструментів
- 8 готових шаблонів workflows
- Dynamic workflow builder
- Batch та chain execution
- Model management
- Plugin system
- 31+ нод в knowledge base
- 18 comprehensive test suites

---

## 🚀 Наступні кроки (Фаза 7+)

Детальний план → [IMPROVEMENT-PLAN.md](IMPROVEMENT-PLAN.md)

### Високий пріоритет

#### Docker Testing & Publishing
- [ ] Протестувати Docker build локально
- [ ] Протестувати docker-compose стек з ComfyUI
- [ ] Опублікувати образ на Docker Hub/GHCR
- [ ] Додати CI/CD для автоматичної публікації
- **Файли готові:** Dockerfile ✅, docker-compose.example.yml ✅, doc/DOCKER-SETUP.md ✅

#### WebSocket Support (Phase 8)
- [ ] ComfyUI WebSocket client (`src/comfyui-ws-client.ts`)
- [ ] Real-time progress tracking
- [ ] Streaming execution API
- [ ] MCP improvements для real-time updates

#### Knowledge Base Expansion (Phase 9)
- [ ] Додати top 50 custom node packs
- [ ] Автоматизувати оновлення knowledge base
- [ ] Advanced compatibility checking
- [ ] Node usage statistics

### Середній пріоритет

#### Plugin System Extensions (Phase 7.2)
- [ ] Plugin marketplace каталог
- [ ] MCP tool `install_plugin(url)`
- [ ] Plugin dependencies
- [ ] Versioning та сумісність

#### Quality of Life (Phase 10)
- [ ] Workflow validation improvements
- [ ] Template improvements (inheritance, conditional params)
- [ ] Workflow optimization tools
- [ ] Export/Import покращення

---

## 📦 Publication & Distribution

### npm
- [x] `npm publish` v0.4.0 ✅
- [ ] Test global install: `npm i -g mcp-comfy-ui-builder` (optional)

### GitHub
- [ ] Оновити опис репозиторію
- [ ] Додати topics/keywords
- [ ] GitHub Releases для версій

### Docker
- [ ] Опублікувати на Docker Hub
- [ ] Опублікувати на GHCR

---

## 📝 Посилання

- **Майбутні плани:** [IMPROVEMENT-PLAN.md](IMPROVEMENT-PLAN.md) — Фази 7-10
- **Історія змін:** [CHANGELOG.md](CHANGELOG.md) — Детальний опис версій
- **Timeline:** [ROADMAP.md](ROADMAP.md) — Загальний план розвитку
- **ComfyUI API:** [doc/comfyui-api-quick-reference.md](doc/comfyui-api-quick-reference.md)
- **Документація:** [doc/INDEX.md](doc/INDEX.md) — Повний індекс документації

---

## 🚀 Quick Start

```bash
# Build and seed knowledge base
npm test && npm run build

# Start MCP server
npm run mcp

# Optional: set ComfyUI connection
export COMFYUI_HOST=http://127.0.0.1:8188
export COMFYUI_PATH=/path/to/ComfyUI
```

**Доступні можливості:**
- 40+ MCP tools для workflow building, execution, та управління
- Knowledge base з 31+ нодами (працює без ComfyUI)
- 8 готових шаблонів
- Dynamic workflow builder
- Model management
- Plugin system

---

*Останнє оновлення: 2026-02-02*
