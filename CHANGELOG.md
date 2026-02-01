# Changelog — mcp-comfy-ui-builder

Історія змін проєкту. База знань (ноди) → [knowledge/CHANGELOG.md](knowledge/CHANGELOG.md).

---

## [0.1.0] – 2026-02-01

### Added

- **Фази 1–4:** scaffold, core (scanner, ai-generator, updater), CLI (scan, sync-manager, analyze, add-node), MCP-сервер (list_node_types, get_node_info, check_compatibility, suggest_nodes).
- **Фаза 5:** тести (vitest: scanner, ai-generator, updater, mcp-tools, integration scan), логер ([scan]/[mcp]/[cli]), обробка помилок у CLI, rate limiting (retry/backoff у scanner, затримки в generateBatch), оновлення doc.
- **Фаза 6:** єдина інструкція запуску MCP (`npm run mcp`), приклад конфігу Cursor (`examples/cursor-mcp.json`), кореневий CHANGELOG, розділ Troubleshooting у MCP-SETUP.
- Документація: doc/README.md (навігація за задачею), спрощений INDEX, єдине джерело правди для бази знань (knowledge/ в корені).

### Technical

- Node 18+, TypeScript, ESM.
- Залежності: @anthropic-ai/sdk, @modelcontextprotocol/sdk, commander, node-fetch, zod; dev: vitest, tsx.

---

*Format: [SemVer] – Date. Проєкт: MVP готовий (фази 1–6).*
