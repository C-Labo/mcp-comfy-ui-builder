# MCP ComfyUI Builder — Improvement Plan

Future improvements. Completed phases → [CHANGELOG.md](CHANGELOG.md).

---

## Current state (v1.1.3)

| Component | Current |
|-----------|---------|
| MCP tools | 50+ |
| Workflow templates | 8 |
| Nodes (seed / after sync) | 62 / 100–600+ |
| Execution | WebSocket + polling |
| Workflow building | Templates + dynamic API |
| Plugin system | Data-only |
| Docker | Image published |

---

## Completed phases

- **Phase 1–6** — Extended templates, dynamic builder, discovery, execution, models, composition (v0.3.0–v0.4.0)
- **Phase 7** — Docker testing and publishing (image on Docker Hub)
- **Phase 8** — WebSocket support (real-time execution)
- **Phase 9** — Knowledge expansion (62 seed nodes, sync-nodes, sync on MCP startup)

---

## Future plans

### Phase 7.2: Plugin extensions

- [ ] Plugin marketplace / catalog
- [ ] MCP tool `install_plugin(url)`
- [ ] Plugin dependencies and versioning

### Phase 9 (optional)

- [ ] Node usage statistics
- [ ] Advanced compatibility checking

### Phase 10: Quality of life

- [ ] Workflow validation improvements
- [ ] Template improvements (inheritance, conditional params)
- [ ] Workflow optimization tools
- [ ] Export/import improvements

---

## Links

- [CHANGELOG.md](CHANGELOG.md) — Version history
- [ROADMAP.md](ROADMAP.md) — Timeline
- [TODO.md](TODO.md) — Current tasks
