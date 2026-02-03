# Next Steps

> MCP server for ComfyUI workflow building and execution

**Current:** v2.0.0. Full workflow lifecycle and IMPROVEMENT-PLAN Phases 1–9 done (templates, dynamic builder, discovery, WebSocket execution, models, composition, Docker, Knowledge expansion).  
**Next:** Phase 10 (QoL) — [IMPROVEMENT-PLAN.md](IMPROVEMENT-PLAN.md).

---

## Current vs target

| Capability | mcp-comfy-ui-builder (now) |
|------------|----------------------------|
| Connect to engine | ComfyUI API (COMFYUI_HOST) |
| List nodes / workflows | list_node_types, suggest_nodes, list_templates, list_saved_workflows, list_queue |
| Create workflow | build_workflow → ComfyUI JSON (8 templates + dynamic builder) |
| Execute workflow | execute_workflow_sync (WebSocket + polling), execute_batch, execute_chain |
| Execution status | get_execution_progress (real-time), get_execution_status |
| Lifecycle | Save/load workflows, queue, outputs, model management |

---

## Phases (summary)

- **Phases 1–4** — API client, workflow builder, MCP tools, save/load ✅
- **IMPROVEMENT-PLAN 1–6** — Templates, dynamic builder, discovery, execution, models, composition ✅
- **Phase 7** — Docker (image published) ✅
- **Phase 8** — WebSocket support ✅
- **Phase 9** — Knowledge expansion, sync-nodes ✅
- **Phase 10** — QoL (validation, templates, export/import) — next

Details → [IMPROVEMENT-PLAN.md](IMPROVEMENT-PLAN.md), [CHANGELOG.md](CHANGELOG.md).
