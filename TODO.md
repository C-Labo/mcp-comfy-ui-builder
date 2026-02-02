# ✅ TODO List

> Workflow Builder plan (like @makafeli/n8n-workflow-builder for ComfyUI)

**Last Updated:** 2026-02-02  
**Status:** Phase 6–8 done ✅; IMPROVEMENT-PLAN Phase 1–6 done ✅. Детальний план — [IMPROVEMENT-PLAN.md](IMPROVEMENT-PLAN.md).

---

## 🔥 Phase 6 — ComfyUI Client & Workflow Builder ✅

### ComfyUI API client

- [x] **Add `src/comfyui-client.ts`** (or `src/workflow/comfyui-api.ts`)
  - [x] `submitPrompt(workflowJson): Promise<{ prompt_id }>` — POST `/prompt`
  - [x] `getHistory(promptId?): Promise<HistoryEntry[]>` — GET `/history` or `/history/{id}`
  - [x] `getQueue(): Promise<QueueStatus>` — GET `/queue`
  - [x] Base URL from `COMFYUI_HOST` (default `http://127.0.0.1:8188`)
  - [x] Timeout, retries, clear errors

- [x] **Types** for workflow JSON, history, queue (see ComfyUI API) — `src/types/comfyui-api-types.ts`

- [x] **Config** — document `COMFYUI_HOST` in README and `.env.example` (optional; only for execute/status)

- [x] **Tests** — unit tests with mocked fetch for submit, history, queue — `tests/comfyui-client.test.ts`

### Workflow builder

- [x] **Add `src/workflow/workflow-builder.ts`**
  - [x] ComfyUI workflow format: node id → `{ class_type, inputs }`, inputs can be literal or `[nodeId, outputIndex]`
  - [x] `buildFromTemplate("txt2img", params)` using knowledge base (base-nodes.json, node-compatibility.json)
  - [x] At least one template: **txt2img** (CheckpointLoaderSimple → CLIPTextEncode → EmptyLatentImage → KSampler → VAEDecode → SaveImage)

- [x] **Tests** — builder returns valid workflow JSON (required inputs present, references valid) — `tests/workflow-builder.test.ts`

---

## 🚀 Phase 7 — MCP Tools (Build & Execute) ✅

### New MCP tools

- [x] **`list_templates`** — no inputs. Returns available template ids (e.g. txt2img).
- [x] **`build_workflow`** — inputs: template (e.g. txt2img), params (width, height, steps, cfg, prompt, seed). Returns workflow JSON.
- [x] **`execute_workflow`** — inputs: workflow (JSON string). Calls ComfyUI client submitPrompt, returns prompt_id. Requires COMFYUI_HOST.
- [x] **`get_execution_status`** — inputs: prompt_id. Returns status, outputs (e.g. image filenames). GET /history/{id}.
- [x] **`list_queue`** — no inputs. Returns queue_running, queue_pending. GET /queue.

### MCP server

- [x] Register new tools in `src/mcp-server.ts`
- [x] Load ComfyUI client only when a tool that needs it is called (or when COMFYUI_HOST set)
- [x] Graceful "ComfyUI not configured" for execute_workflow, get_execution_status, list_queue (return message, no crash)
- [x] **Tests** — MCP tool tests: list_templates, build_workflow in mcp-tools.test.ts; workflow-storage tests added

### Docs

- [x] README: "Workflow Builder" section — build_workflow, execute_workflow, get_execution_status, list_queue; COMFYUI_HOST for execution
- [x] doc/MCP-SETUP.md: new tools, when ComfyUI is required
- [x] .env.example: optional COMFYUI_HOST for workflow execution

---

## 📦 This Week (if not done)

### Publication

- [ ] Test locally: `npm link` (optional)
- [x] `npm login` → `npm publish` ✅
- [ ] Test install: `npm i -g mcp-comfy-ui-builder` (optional)

### GitHub

- [ ] Add description and topics on GitHub repo

---

## 💡 Phase 8 — Save/Load & Docs ✅

- [x] **Save/Load workflows** — save_workflow, list_saved_workflows, load_workflow (workflows/*.json) ✅
- [x] **doc/workflow-builder.md** — templates, params, ComfyUI workflow format ✅

---

## 📐 IMPROVEMENT-PLAN Phase 1 — Розширення шаблонів ✅

Деталі: [IMPROVEMENT-PLAN.md](IMPROVEMENT-PLAN.md) § Фаза 1.

- [x] **Inpainting** — buildInpainting(); LoadImage + LoadImageMask → SetLatentNoiseMask → VAEEncode → … → SaveImage. base-nodes: LoadImageMask, SetLatentNoiseMask. ✅
- [x] **Upscaling** — buildUpscale(); LoadImage → UpscaleModelLoader → ImageUpscaleWithModel (опційно + refinement). base-nodes: UpscaleModelLoader, ImageUpscaleWithModel. ✅
- [x] **LoRA** — txt2img_lora з LoraLoader chain (loras: [{name, strength_model, strength_clip}]). ✅
- [x] **ControlNet** — controlnet template: control_image + ControlNetLoader → ApplyControlNet → KSampler. ✅
- [x] **Batch** — buildBatch(base_params, variations); template "batch" повертає перший workflow. ✅
- [x] Тести для нових шаблонів у `tests/workflow-builder.test.ts`. ✅

---

## 📐 IMPROVEMENT-PLAN Phases 2–6

- [x] **Phase 2:** dynamic-builder.ts, workflow-store.ts; MCP: create_workflow, add_node, connect_nodes, remove_node, set_node_input, get_workflow_json, validate_workflow, finalize_workflow. ✅
- [x] **Phase 3:** getObjectInfo у comfyui-client; hybrid-discovery.ts; MCP: discover_nodes_live, search_nodes, get_node_inputs, get_node_outputs, list_node_categories, sync_nodes_to_knowledge. ✅
- [x] **Phase 4:** submitPromptAndWait (polling), batch-executor.ts, output-manager.ts; MCP: execute_workflow_sync, get_execution_progress, execute_batch, list_outputs, download_output, download_all_outputs. ✅
- [x] **Phase 5:** model-manager.ts; MCP: list_models, get_model_info, check_model_exists, get_workflow_models, check_workflow_models. ✅
- [x] **Phase 6:** workflow-template.ts, macro.ts, chainer.ts; MCP: create_template, apply_template, validate_template_params, list_macros, insert_macro, execute_chain. ✅
- [ ] Web UI, Docker, plugin system (пізніше)

---

## 🐛 Known Issues

*(Add as you find)*

- [ ] ...

---

## 📝 Notes

- **План покращень:** [IMPROVEMENT-PLAN.md](IMPROVEMENT-PLAN.md) — 6 фаз (шаблони, dynamic builder, discovery, execution, models, composition)
- **Reference:** [NEXT-STEPS.md](NEXT-STEPS.md) — full Workflow Builder plan (Phase 1–4 done)
- **Timeline:** [ROADMAP.md](ROADMAP.md) — Phase 6–8 done; IMPROVEMENT-PLAN next
- **ComfyUI API:** [doc/comfyui-api-quick-reference.md](doc/comfyui-api-quick-reference.md) — /prompt, /history, /queue
- **Config:** `COMFYUI_HOST` default `http://127.0.0.1:8188` when not set

---

**Quick Start (current):**
1. `npm test && npm run build` (postbuild runs seed)
2. `npm run mcp` — use list_node_types, get_node_info, check_compatibility, suggest_nodes, list_templates, build_workflow, save_workflow, list_saved_workflows, load_workflow
3. For execute/status/queue: set COMFYUI_HOST (e.g. in .env) and use execute_workflow, get_execution_status, list_queue

**Next:** Web UI, Docker, plugin system (пізніше); або розширення шаблонів/макросів.
