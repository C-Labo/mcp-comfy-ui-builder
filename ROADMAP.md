# Project Roadmap

> mcp-comfy-ui-builder — MCP server for ComfyUI workflow building, execution, and management

---

## Current: v1.1.3

- **50+ MCP tools** across 9 categories
- **8 workflow templates** (txt2img, img2img, inpainting, upscale, lora, controlnet, batch, image_caption)
- **62 seed nodes** (100–600+ after sync-nodes), hybrid discovery
- **Dynamic workflow builder**, batch & chain execution (WebSocket-optimized)
- **Real-time execution** via WebSocket (<100ms latency)
- **Model management**, plugin system, Docker image published

**Next:** Phase 10 (QoL) — [IMPROVEMENT-PLAN.md](IMPROVEMENT-PLAN.md).

---

## Completed milestones

- **v0.1.0–v0.2.0** — Knowledge base, ComfyUI client, workflow builder, save/load, install nodes/models
- **v0.3.0** — Extended templates, dynamic builder, hybrid discovery, batch/outputs, model management
- **v0.4.0** — Composition (templates, macros, chain), plugin system
- **v0.5.0** — WebSocket real-time execution
- **v1.1.x** — MCP setup docs, Python/venv fix for install_custom_node, COMFYUI_KNOWLEDGE_DIR

Details → [CHANGELOG.md](CHANGELOG.md).

---

## Future

| Phase | Name | Status |
|-------|------|--------|
| 7.2 | Plugin extensions | Planned |
| 9 | Node stats (optional) | Optional |
| 10 | QoL (validation, templates, export) | Planned |

---

## Links

- [IMPROVEMENT-PLAN.md](IMPROVEMENT-PLAN.md)
- [CHANGELOG.md](CHANGELOG.md)
- [TODO.md](TODO.md)
- [doc/INDEX.md](doc/INDEX.md)
- [doc/WEBSOCKET-GUIDE.md](doc/WEBSOCKET-GUIDE.md)
