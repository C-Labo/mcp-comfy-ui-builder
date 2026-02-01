# 🔧 Node Discovery System - Technical Implementation

> Детальна технічна документація: архітектура, API, код, інтеграція

***

## 🏗️ System Architecture

```
INPUT LAYER:
  ComfyUI API /object_info | ComfyUI Manager custom-node-list | GitHub Repos (README, __init__.py)
          │                              │                              │
          └──────────────────────────────┼──────────────────────────────┘
                                         │
                         ┌───────────────▼───────────────┐
                         │         NodeScanner           │
                         │  scanLiveInstance()           │
                         │  fetchManagerList()           │
                         │  analyzeRepository()          │
                         │  findNewNodes()               │
                         └───────────────┬───────────────┘
                                         │
                         ┌───────────────▼───────────────┐
                         │   AINodeDescriptionGenerator  │
                         │   Claude 3.5 Sonnet           │
                         │   generateDescription()       │
                         │   generateBatch()            │
                         │   buildPrompt()               │
                         └───────────────┬───────────────┘
                                         │
                         ┌───────────────▼───────────────┐
                         │   KnowledgeBaseUpdater        │
                         │   addNode()                   │
                         │   updateCompatibility()       │
                         │   generateChangelog()         │
                         └───────────────┬───────────────┘
                                         │
                         OUTPUT: base-nodes.json, custom-nodes.json, node-compatibility.json
                                         │
                         ┌───────────────▼───────────────┐
                         │         MCP Server            │
                         │  list_node_types()             │
                         │  get_node_info()               │
                         │  check_compatibility()         │
                         └───────────────────────────────┘
```

***

## 📋 Type Definitions

### RawNodeInfo

```typescript
interface RawNodeInfo {
  class_name: string;
  display_name?: string;
  category?: string;
  input: Record<string, any>;
  output: string[];
  output_name: string[];
  description?: string;
  source: 'comfyui_api' | 'manager' | 'github';
  author?: string;
  github?: string;
}
```

### NodeDescription

```typescript
interface NodeDescription {
  display_name: string;
  category: string;
  description: string;
  input_types: {
    required: Record<string, { type: string; description: string; color?: string; default?: any; notes?: string }>;
    optional?: Record<string, any>;
  };
  return_types: string[];
  return_names: string[];
  output_colors: string[];
  use_cases: string[];
  compatible_outputs: Record<string, string[]>;
  example_values: Record<string, any>;
  priority: 'high' | 'medium' | 'low';
}
```

***

## 🧩 Core Classes

### 1. NodeScanner

- **scanLiveInstance()**: GET `${comfyUIHost}/object_info`, парсинг у `Map<string, RawNodeInfo>`
- **fetchManagerList()**: завантаження ComfyUI-Manager custom-node-list.json
- **analyzeRepository(repoUrl)**: GitHub API — README.md, __init__.py, парсинг нод

### 2. AINodeDescriptionGenerator

- **generateDescription(rawNode)**: побудова промпту з RawNodeInfo, виклик Claude, парсинг JSON у NodeDescription
- **generateBatch(nodes, batchSize)**: batch з rate limiting (наприклад 1s між батчами)
- **buildPrompt(node)**: шаблон з node-description-prompt-template.md + JSON input/output

### 3. KnowledgeBaseUpdater

- **addNode(className, description, isCustom)**: додати/оновити запис у base-nodes.json або custom-nodes.json
- **updateCompatibility(nodeClass, desc)**: оновити node-compatibility.json (producers/consumers)
- **generateChangelog(newNodes)**: дописати в CHANGELOG.md

***

## 🔗 MCP Integration

Tools для MCP сервера:

- **list_node_types**: повернути ключі з base-nodes.json (та за потреби custom-nodes.json)
- **get_node_info(node_name)**: повернути повний об'єкт ноди з бази знань
- **check_compatibility(from_node, to_node)**: використати node-compatibility.json для перевірки типів
- **suggest_nodes(task_description)**: пошук по description/use_cases (або майбутній LLM)

Завантаження даних:

```typescript
import baseNodes from './knowledge/base-nodes.json';
import compatibility from './knowledge/node-compatibility.json';
```

***

## 📁 Файли проєкту

- `src/node-discovery/scanner.ts` — NodeScanner
- `src/node-discovery/ai-generator.ts` — AINodeDescriptionGenerator
- `src/node-discovery/updater.ts` — KnowledgeBaseUpdater
- `src/node-discovery/cli.ts` — commander (scan, sync-manager, analyze, add-node)
- `knowledge/` — base-nodes.json, custom-nodes.json, node-compatibility.json, README.md, node-description-prompt-template.md

***

*Technical Implementation v1.1.0* | *2026-02-01*

**Повний чеклист**: IMPLEMENTATION-CHECKLIST.md
