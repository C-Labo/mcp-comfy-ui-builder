#!/usr/bin/env npx tsx
/**
 * Phase 2 integration: scanner → ai-generator → updater for one node.
 * Requires: ComfyUI running (COMFYUI_HOST), ANTHROPIC_API_KEY, knowledge/base-nodes.json.
 *
 * Usage: npm run build && node dist/scripts/run-one-node.js
 *    or: npx tsx scripts/run-one-node.ts
 */

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { scanLiveInstance, findNewNodes } from '../src/node-discovery/scanner.js';
import { generateDescription } from '../src/node-discovery/ai-generator.js';
import { addNode, updateCompatibility, generateChangelog } from '../src/node-discovery/updater.js';

const knowledgePath = join(process.cwd(), 'knowledge');
const baseNodesPath = join(knowledgePath, 'base-nodes.json');

function getExistingKeys(): Set<string> {
  if (!existsSync(baseNodesPath)) return new Set();
  const data = JSON.parse(readFileSync(baseNodesPath, 'utf8')) as { nodes?: Record<string, unknown> };
  return new Set(Object.keys(data?.nodes ?? {}));
}

async function main(): Promise<void> {
  const comfyHost = process.env.COMFYUI_HOST ?? 'http://127.0.0.1:8188';
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('ANTHROPIC_API_KEY is required. Set it in .env or environment.');
    process.exit(1);
  }

  console.log('Scanning ComfyUI at', comfyHost, '...');
  const liveMap = await scanLiveInstance(comfyHost);
  const existingKeys = getExistingKeys();
  const newNodes = findNewNodes(liveMap, existingKeys);

  if (newNodes.length === 0) {
    console.log('No new nodes. All', liveMap.size, 'nodes already in knowledge.');
    return;
  }

  const raw = newNodes[0];
  console.log('Generating description for', raw.class_name, 'via Claude...');
  const desc = await generateDescription(raw);
  console.log('Updating knowledge: addNode, updateCompatibility, generateChangelog');
  addNode(raw.class_name, desc, false);
  updateCompatibility(raw.class_name, desc);
  generateChangelog([{ className: raw.class_name, description: desc }]);
  console.log('Done. Added', raw.class_name, '—', desc.display_name);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
