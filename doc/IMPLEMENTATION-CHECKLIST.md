# ✅ Implementation Checklist - Node Discovery System

> Покроковий чеклист для повної імплементації (12-20 годин)

***

## 📋 Progress Tracker

```
Phase 1: Setup (1h)          [░░░░░░░░░░░] 0/6
Phase 2: Core Classes (6h)  [░░░░░░░░░░░] 0/22
Phase 3: Testing (2h)        [░░░░░░░░░░░] 0/8
Phase 4: Polish (2h)         [░░░░░░░░░░░] 0/6
Phase 5: MCP (4h)            [░░░░░░░░░░░] 0/12
Phase 6: Production (2h)     [░░░░░░░░░░░] 0/8
Phase 7: Deploy (1h)         [░░░░░░░░░░░] 0/5

Total: 0/67 tasks (0%) | MVP: 0/25 (0%)
```

***

## Phase 1: Setup & Dependencies (1 год)

### 1.1 Project Initialization (10 хв)

```bash
mkdir comfyui-node-discovery && cd comfyui-node-discovery
npm init -y
```

- [ ] Створено package.json
- [ ] Додано name, version, description

### 1.2 Install Dependencies (10 хв)

```bash
npm install @anthropic-ai/sdk @octokit/rest commander node-fetch
npm install -D typescript @types/node tsx @types/node-fetch
```

- [ ] Production deps: anthropic, octokit, commander
- [ ] Dev deps: typescript, tsx

### 1.3 TypeScript Config (10 хв)

- [ ] tsconfig.json created
- [ ] `npx tsc --noEmit` passes

### 1.4 Environment Setup (10 хв)

```
.env: ANTHROPIC_API_KEY, COMFYUI_HOST, NODE_BATCH_SIZE
.env.example committed, .env в .gitignore
```

- [ ] .env created
- [ ] .env.example committed

### 1.5 Project Structure (10 хв)

```
src/node-discovery/ (scanner.ts, ai-generator.ts, updater.ts, cli.ts)
knowledge/ (copy from docs)
scripts/, tests/
```

- [ ] Структура папок створена
- [ ] knowledge/ скопійовано

***

## Phase 2: Core Classes (6 год)

### 2.1 NodeScanner

- [ ] scanLiveInstance() — GET /object_info
- [ ] fetchManagerList() — ComfyUI Manager JSON
- [ ] analyzeRepository() — GitHub README, __init__.py
- [ ] findNewNodes(existingNodes)

### 2.2 AINodeDescriptionGenerator

- [ ] generateDescription(rawNode)
- [ ] generateBatch(nodes, batchSize)
- [ ] buildPrompt(node)
- [ ] extractJson(response), validateDescription()

### 2.3 KnowledgeBaseUpdater

- [ ] addNode(className, description, isCustom)
- [ ] updateCompatibility(nodeClass, desc)
- [ ] generateChangelog(newNodes)

### 2.4 CLI (commander)

- [ ] scan, scan:dry
- [ ] sync-manager
- [ ] analyze <url>
- [ ] add-node (wizard)

***

## Phase 3: Testing (2 год)

- [ ] Unit tests: scanner, ai-generator, updater
- [ ] Integration: live ComfyUI mock
- [ ] E2E: npm run scan на тестовому instance

***

## Phase 4: Polish (2 год)

- [ ] Error handling, logging
- [ ] Rate limiting (Claude, GitHub)
- [ ] Documentation update

***

## Phase 5: MCP Integration (4 год)

- [ ] MCP server setup (@modelcontextprotocol/sdk)
- [ ] list_node_types, get_node_info, check_compatibility, suggest_nodes
- [ ] Load knowledge base (base-nodes.json, node-compatibility.json)
- [ ] Claude Desktop testing

***

## Phase 6: Production (2 год)

- [ ] Docker (optional)
- [ ] CI (scan weekly)
- [ ] Monitoring, alerts

***

## Phase 7: Deploy (1 год)

- [ ] npm publish or private registry
- [ ] README, CHANGELOG
- [ ] Cursor/Claude MCP config

***

*Checklist Version: 1.1.0* | *2026-02-01*

**Деталі коду**: node-discovery-system.md
