# ✅ Implementation Checklist - Node Discovery System

> Покроковий чеклист для повної імплементації (12-20 годин)

***

## 📋 Progress Tracker

```
Phase 1: Setup (1h)          [███████████] ✅ 6/6
Phase 2: Core Classes (6h)  [███████████] ✅ 22/22
Phase 3: Testing (2h)        [███████████] ✅ 8/8  (tests/, vitest, npm test)
Phase 4: Polish (2h)         [███████████] ✅ 6/6  (logger, error handling, rate limit)
Phase 5: MCP (4h)            [███████████] ✅ 12/12
Phase 6: Production (2h)     [░░░░░░░░░░░] 0/8
Phase 7: Deploy (1h)         [░░░░░░░░░░░] 0/5

Total: 54/67 tasks (81%) | MVP: 54/54 (100%)
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
src/ (cli.ts, mcp-server.ts, logger.ts)
src/node-discovery/ (scanner.ts, ai-generator.ts, updater.ts)
src/types/ (node-types.ts)
knowledge/ (base-nodes.json, custom-nodes.json, node-compatibility.json, …)
scripts/, tests/ (tests/*.test.ts, tests/fixtures/, tests/integration/)
```

- [x] Структура папок створена
- [x] knowledge/ у корені проєкту (єдине джерело правди)

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

## Phase 3: Testing (2 год) ✅

- [x] Unit tests: scanner (`tests/scanner.test.ts`), ai-generator (`tests/ai-generator.test.ts`), updater (`tests/updater.test.ts`), MCP tools (`tests/mcp-tools.test.ts`)
- [x] Integration: scan dry-run з mock (`tests/integration/scan.test.ts`)
- [x] `npm test` (vitest run), `npm run test:watch`

***

## Phase 4: Polish (2 год) ✅

- [x] Error handling: CLI повідомлення (ComfyUI недоступний, Invalid API key), `src/cli.ts`
- [x] Logging: `src/logger.ts` ([scan], [mcp], [cli]), опційно `DEBUG=1`
- [x] Rate limiting: затримки між викликами Claude в `generateBatch`, retry з backoff у scanner для fetch
- [x] Documentation: IMPLEMENTATION-CHECKLIST, GETTING-STARTED, QUICK-REFERENCE

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
