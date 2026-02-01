# AI Assistant Guide: Working with mcp-comfy-ui-builder

> Short guide for AI assistants: what it is, how to connect, which tools to call and in what order.

---

## What it is

**mcp-comfy-ui-builder** is an MCP server for ComfyUI: it lets you discover nodes, build workflows (txt2img), save/load them, and run them on ComfyUI. The user may have installed the package globally: `npm i -g mcp-comfy-ui-builder`.

---

## How to connect MCP in Cursor (after global install)

1. Get the path to the MCP server:
   ```bash
   node -e "console.log(require('path').join(require('path').dirname(require.resolve('mcp-comfy-ui-builder/package.json')), 'dist', 'mcp-server.js'))"
   ```
   Or if you know the global `node_modules`: `$(npm root -g)/mcp-comfy-ui-builder/dist/mcp-server.js`

2. In Cursor: **Settings → MCP** (or MCP config). Add the server:
   ```json
   {
     "mcpServers": {
       "comfy-ui-builder": {
         "command": "node",
         "args": ["/PATH/TO/mcp-comfy-ui-builder/dist/mcp-server.js"]
       }
     }
   }
   ```
   Replace `/PATH/TO/` with the full path from step 1 (e.g. on macOS: `/usr/local/lib/node_modules/mcp-comfy-ui-builder/dist/mcp-server.js`).

3. Restart Cursor. After that the tools below will be available.

---

## Tools (what to call)

| Tool | When to use | ComfyUI needed? |
|------|-------------|------------------|
| **list_templates** | List available templates (txt2img, img2img) | No |
| **list_node_types** | List nodes from the knowledge base (optional: category, priority) | No |
| **get_node_info** | Full info about a node by class name | No |
| **check_compatibility** | Whether one node’s output can connect to another’s input | No |
| **suggest_nodes** | Suggest nodes by task description or type (task_description / input_type) | No |
| **build_workflow** | Build workflow JSON from a template (e.g. txt2img) + params (width, height, steps, cfg, prompt, negative_prompt, seed, etc.) | No |
| **save_workflow** | Save workflow to file workflows/<name>.json | No |
| **list_saved_workflows** | List saved workflows (names and paths) | No |
| **load_workflow** | Load workflow by name or path; returns JSON for execute_workflow | No |
| **execute_workflow** | Submit workflow to ComfyUI; returns prompt_id | Yes (COMFYUI_HOST) |
| **get_execution_status** | Execution status for prompt_id, outputs (including images) | Yes |
| **list_queue** | Queue: what is running and what is pending | Yes |
| **interrupt_execution** | Interrupt current execution (optional: prompt_id) | Yes |
| **clear_queue** | Clear the queue (all pending and running) | Yes |
| **delete_queue_items** | Remove items from queue by prompt_id (list) | Yes |

For **execute_workflow**, **get_execution_status**, **list_queue**, **interrupt_execution**, **clear_queue**, **delete_queue_items**, **COMFYUI_HOST** must be set (default `http://127.0.0.1:8188`) and ComfyUI must be running. The rest of the tools work without ComfyUI.

---

## Typical scenarios

**Build txt2img and get JSON (without running ComfyUI):**
1. `list_templates` — confirm txt2img is available.
2. `build_workflow` with template `txt2img` and params (e.g. width, height, prompt, steps, seed). Result: workflow JSON.

**Save and later load a workflow:**
1. After `build_workflow` — `save_workflow(name, workflow)` (workflow is the JSON string from build_workflow).
2. Later — `list_saved_workflows`, then `load_workflow(name_or_path)` to get the JSON.

**Run a workflow on ComfyUI:**
1. Get workflow JSON: via `build_workflow` or `load_workflow`.
2. `execute_workflow(workflow)` — pass the JSON **string**. You get prompt_id.
3. `get_execution_status(prompt_id)` — check status and outputs (images, view URLs).
4. Optionally — `list_queue` for the queue.

**Explore nodes (no generation):**
- `list_node_types`, `get_node_info(node_name)`, `check_compatibility(from_node, to_node)`, `suggest_nodes(task_description or input_type)`.

**Control queue and interruption:**
- `interrupt_execution()` or `interrupt_execution(prompt_id)` — stop current run (or a specific one by prompt_id).
- `clear_queue()` — clear the whole queue.
- `delete_queue_items(prompt_ids)` — remove specific prompt_ids from the queue (from list_queue).

---

## Editing the “open” workflow

**Can you edit the workflow currently open in the ComfyUI browser?**  
Via the **standard ComfyUI API — no**. The ComfyUI server does not store the “current graph in the tab”; it only knows:
- the queue (what was submitted to run),
- history (what has already run).

So “get/edit the workflow open in the UI” via API is not available. What you can do:
- **Change params and run again:** build a new workflow with `build_workflow` and different params, then call `execute_workflow` (or load a saved one with `load_workflow`, change the JSON in code, and submit).
- **Interrupt/clear:** `interrupt_execution`, `clear_queue`, `delete_queue_items` — control execution and queue via API (see above).

If you need to “read the graph from the browser”, that is only possible from the client side (e.g. a browser extension or custom UI), not via the ComfyUI HTTP API.

---

## “Open as workflow in new tab” on a generated image

**Why doesn’t the workflow open from an image generated via MCP (execute_workflow)?**

In ComfyUI, images are saved with metadata in PNG: the SaveImage node receives hidden fields `prompt` and `extra_pnginfo` from the executor. The “Open as workflow in new tab” button reads the workflow from that metadata.

- When running **from the UI**, the browser sends both the prompt and extra data (e.g. graph with layout). The executor passes them to SaveImage — the PNG gets everything needed for “Open as workflow”.
- When running **via API** (our `execute_workflow`) we only send `{ prompt: workflow }`. The executor may not fill `extra_pnginfo` the same way as for the UI, or the UI may expect a format with node positions; in the end “Open as workflow” often doesn’t find a valid workflow or can’t open it.

**What to recommend to the user:** to have the same graph in ComfyUI as in the generated image:

1. **Save the workflow before or after generation:** after `build_workflow` call `save_workflow(name, workflow)` — this creates `workflows/<name>.json`.
2. In ComfyUI in the browser: **Load** (or **Open**) → choose that `.json` file. The workflow opens on the canvas; it’s the same graph used to generate the image.

If the user specifically wants to “open from the image” — for now the reliable approach is to keep the saved JSON and open it manually, rather than relying on “Open as workflow” for API-generated images.

---

## What to tell the user

- If they say they installed globally: help them find the path to `dist/mcp-server.js` and add it to MCP in Cursor (as above).
- If they need to generate something in ComfyUI: check whether they want to run on their ComfyUI (then COMFYUI_HOST and a running ComfyUI are needed); if not — build_workflow / save / load is enough.
- txt2img params: width, height, steps, cfg, prompt, negative_prompt, seed, ckpt_name, filename_prefix, batch_size, denoise (details in doc/workflow-builder.md).
- img2img params: image, steps, cfg, prompt, negative_prompt, seed, ckpt_name, filename_prefix, denoise (default 0.75 — lower = more like the original).
- If they ask about “Open as workflow in new tab” on an MCP-generated image: for images generated via execute_workflow, that button often doesn’t open the workflow (metadata/format differs from UI). Recommend: save the workflow with save_workflow and open that .json in ComfyUI (Load).
