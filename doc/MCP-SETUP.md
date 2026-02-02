# MCP Server — ComfyUI Node Discovery

> How to connect the MCP server in Cursor and Claude Desktop

***

## What the server provides

Tools are grouped by area. **COMFYUI_HOST** is required for execution/queue/output/model tools (default `http://127.0.0.1:8188`). **COMFYUI_PATH** is required for install tools (see [INSTALL-NODES-AND-MODELS.md](INSTALL-NODES-AND-MODELS.md)).

### Knowledge & node discovery (no ComfyUI)

| Tool | Description |
|------|------|
| **list_node_types** | List nodes from knowledge (optional: category, priority) |
| **get_node_info(node_name)** | Full information about a node from base-nodes.json |
| **check_compatibility(from_node, to_node)** | Whether output of one node can be connected to input of another |
| **suggest_nodes(task_description \| input_type)** | Node suggestions by task description or output type |
| **discover_nodes_live** | Fetch all node definitions from running ComfyUI (object_info) |
| **search_nodes(query, category?)** | Search nodes by name/category (knowledge + live cache) |
| **get_node_inputs(node_name)** | Required/optional inputs for a node |
| **get_node_outputs(node_name)** | Output types and names for a node |
| **list_node_categories** | List all node categories (from live or knowledge) |
| **sync_nodes_to_knowledge** | Write live object_info into knowledge base files |

### Dynamic workflow builder (no ComfyUI)

| Tool | Description |
|------|------|
| **create_workflow** | Create empty dynamic workflow; returns workflow_id (e.g. wf_xxx) |
| **add_node(workflow_id, class_type, inputs?)** | Add node to dynamic workflow; returns node id |
| **connect_nodes(workflow_id, from_node, output_idx, to_node, input_name)** | Connect two nodes |
| **remove_node(workflow_id, node_id)** | Remove node from dynamic workflow |
| **set_node_input(workflow_id, node_id, input_name, value)** | Set literal input on node |
| **get_workflow_json(workflow_id)** | Get workflow JSON for execute_workflow or save_workflow |
| **validate_workflow(workflow_id)** | Validate dynamic workflow (refs exist) |
| **finalize_workflow(workflow_id)** | Get workflow JSON (same as get_workflow_json) |

### Templates & build (no ComfyUI)

| Tool | Description |
|------|------|
| **list_templates** | List workflow template ids (e.g. txt2img, img2img, inpainting) |
| **build_workflow(template, params?)** | Build ComfyUI workflow JSON from template |
| **create_template(workflow, params_def)** | Create a parameterized template from a workflow |
| **apply_template(template, values)** | Apply parameter values to a template; returns workflow JSON |
| **validate_template_params(template, values)** | Check that values satisfy template parameters |
| **list_macros** | List available macros (e.g. upscale_refine) |
| **insert_macro(workflow_id, macro_id, input_connections)** | Insert a macro into a dynamic workflow |

### Execution (COMFYUI_HOST)

| Tool | Description |
|------|------|
| **execute_workflow(workflow)** | Submit workflow to ComfyUI; returns prompt_id |
| **execute_workflow_sync(workflow, timeout?)** | Submit and wait until done; returns prompt_id and outputs |
| **get_execution_status(prompt_id)** | Status and image outputs for a prompt |
| **get_execution_progress(prompt_id)** | Progress info (e.g. current node) while running |
| **execute_batch(workflows, concurrency?)** | Run multiple workflows (optional concurrency) |
| **execute_chain(steps)** | Run a chain of workflows (output of step N → input of step N+1) |

### Outputs (COMFYUI_HOST)

| Tool | Description |
|------|------|
| **list_outputs(prompt_id)** | List output files (images, etc.) for a prompt |
| **download_output(prompt_id, node_id, filename, dest_path)** | Download a single output file |
| **download_all_outputs(prompt_id, dest_dir)** | Download all outputs for a prompt to a directory |

### Model management (COMFYUI_HOST)

| Tool | Description |
|------|------|
| **list_models(model_type?)** | List models (checkpoint, lora, vae, controlnet, upscale, etc.) |
| **get_model_info(name, model_type)** | Details for a model |
| **check_model_exists(name, model_type)** | Whether the model is present |
| **get_workflow_models(workflow)** | Models required by a workflow |
| **check_workflow_models(workflow)** | Check which required models are missing |

### Queue & control (COMFYUI_HOST)

| Tool | Description |
|------|------|
| **list_queue** | List running and pending prompts |
| **interrupt_execution(prompt_id?)** | Stop current run or specific prompt |
| **clear_queue** | Clear all pending and running |
| **delete_queue_items(prompt_ids)** | Remove items from queue by prompt_id |

### Save / load (no ComfyUI)

| Tool | Description |
|------|------|
| **save_workflow(name, workflow)** | Save workflow to workflows/\<name\>.json; returns path |
| **list_saved_workflows** | List saved workflows (names and paths) from workflows/ |
| **load_workflow(name_or_path)** | Load workflow by name or path; returns JSON for execute_workflow |

### Utility

| Tool | Description |
|------|------|
| **prepare_image_for_workflow(image_path, dest_name?)** | Copy image into ComfyUI input folder; returns filename for workflow |

### Install (COMFYUI_PATH)

| Tool | Description |
|------|------|
| **install_custom_node(node_names, channel?, mode?)** | Install custom node packs via ComfyUI-Manager cm-cli |
| **install_model(url, model_type?)** | Download model/LoRA/VAE by URL to ComfyUI models folder |

Data is loaded from `knowledge/base-nodes.json` and `knowledge/node-compatibility.json` at server startup. See [workflow-builder.md](workflow-builder.md) for templates and workflow format.

***

## Starting the server

**If installed globally** (`npm i -g mcp-comfy-ui-builder`): use the path to the installed package. Get it with:
```bash
node -e "const p=require('path'); console.log(p.join(p.dirname(require.resolve('mcp-comfy-ui-builder/package.json')), 'dist', 'mcp-server.js'))"
```
Use that path in Cursor MCP config (see below). See also [AI-ASSISTANT-GUIDE.md](AI-ASSISTANT-GUIDE.md) for a short guide for AI assistants.

**From project root** (build first):
```bash
npm run build
npm run mcp
```
Alternative: `node dist/mcp-server.js`. Server uses **stdio** (stdin/stdout).

***

## Connecting in Cursor

1. Open MCP settings (Cursor Settings → MCP or corresponding config).
2. Add server (replace path with yours):

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

3. Restart Cursor.

After connecting, AI can call the tools above. For execution, outputs, models, and queue (execute_workflow, execute_workflow_sync, get_execution_status, list_outputs, list_models, list_queue, etc.), set `COMFYUI_HOST` in the environment or in a `.env` file in the project root (see [.env.example](../.env.example)).

***

## Connecting in Claude Desktop

- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- Create the file if it doesn't exist.
- Add the same `mcpServers` block (with absolute path to `dist/mcp-server.js`).
- Restart Claude Desktop (fully quit the application, not just close the window).

***

## Verification

After connecting, make sure Cursor/Claude sees the tools (e.g., in the MCP tools list). You can ask: "List ComfyUI node types with category loaders" or "Get info for KSampler" — AI will call the corresponding tools.

***

## Troubleshooting

| Problem | What to check |
|----------|----------------|
| **MCP doesn't see tools** | Path in `args` must be **absolute** to `dist/mcp-server.js`. After changing config — fully restart Cursor/Claude. |
| **Server doesn't start** | Run `npm run build` from project root. Make sure there's a `knowledge/` folder with `base-nodes.json` and `node-compatibility.json`. |
| **Empty node list** | File `knowledge/base-nodes.json` must contain `nodes` object. Run `npm run seed` or add nodes manually. |
| **ENOENT error / module not found** | Run MCP from **project root** (where `knowledge/` and `dist/` are visible). In Cursor config `args` — path specifically to `dist/mcp-server.js`. |

Example config for Cursor: [examples/cursor-mcp.json](../examples/cursor-mcp.json) (copy and substitute your path).

***

*MCP Setup v1.2 | 2026-02-02*
