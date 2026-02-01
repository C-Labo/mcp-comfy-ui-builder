#!/usr/bin/env node
/**
 * CLI entry point — Phase 3: scan, sync-manager, analyze, add-node.
 * Uses logger for consistent output; friendly error messages on failures.
 */
import { program } from 'commander';
import { readFileSync, existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createInterface } from 'node:readline';
import { Octokit } from '@octokit/rest';
import {
  scanLiveInstance,
  checkComfyUIAvailable,
  findNewNodes,
  fetchManagerList,
  analyzeRepository,
  type ManagerListResult,
} from './node-discovery/scanner.js';
import { generateBatch } from './node-discovery/ai-generator.js';
import { addNode, updateCompatibility, generateChangelog } from './node-discovery/updater.js';
import { logger } from './logger.js';
import type { CustomPack, CustomNodesJson } from './types/node-types.js';

function isNetworkError(e: unknown): boolean {
  const msg = e instanceof Error ? e.message : String(e);
  return /ECONNREFUSED|ENOTFOUND|ETIMEDOUT|fetch failed|network/i.test(msg);
}

function isAuthError(e: unknown): boolean {
  const msg = e instanceof Error ? e.message : String(e);
  return /401|403|Invalid API key|authentication|unauthorized|invalid.*api.*key/i.test(msg);
}

/** Validate ANTHROPIC_API_KEY format; throws with a clear message if invalid. */
function validateAnthropicApiKey(key: string | undefined): void {
  if (!key || typeof key !== 'string') return;
  const k = key.trim();
  if (!k.startsWith('sk-ant-')) {
    throw new Error(
      'ANTHROPIC_API_KEY should start with "sk-ant-". Get your key at https://console.anthropic.com/'
    );
  }
  if (k.length < 30) {
    throw new Error(
      'ANTHROPIC_API_KEY looks too short. Check your key at https://console.anthropic.com/'
    );
  }
}

const knowledgePath = () => join(process.cwd(), 'knowledge');
const baseNodesPath = () => join(knowledgePath(), 'base-nodes.json');

function getExistingKeys(): Set<string> {
  const path = baseNodesPath();
  if (!existsSync(path)) return new Set();
  const data = JSON.parse(readFileSync(path, 'utf8')) as { nodes?: Record<string, unknown> };
  return new Set(Object.keys(data?.nodes ?? {}));
}

program
  .name('mcp-comfy-ui-builder')
  .description('ComfyUI Node Discovery: scan, describe, update knowledge, MCP tools')
  .version('0.1.0');

program
  .command('scan')
  .description('Scan ComfyUI, find new nodes, generate descriptions via Claude, update knowledge/')
  .option('--dry-run', 'Only print what would be done, do not write files')
  .option('--host <url>', 'ComfyUI base URL', process.env.COMFYUI_HOST ?? 'http://127.0.0.1:8188')
  .action(async (opts: { dryRun?: boolean; host?: string }) => {
    const dryRun = opts.dryRun ?? false;
    const host = opts.host ?? 'http://127.0.0.1:8188';
    if (!process.env.ANTHROPIC_API_KEY && !dryRun) {
      logger.error('cli', 'ANTHROPIC_API_KEY is required for scan (or use --dry-run).');
      process.exit(1);
    }
    if (process.env.ANTHROPIC_API_KEY) {
      try {
        validateAnthropicApiKey(process.env.ANTHROPIC_API_KEY);
      } catch (e) {
        logger.error('cli', e instanceof Error ? e.message : String(e));
        process.exit(1);
      }
    }
    try {
      logger.info('cli', `Scanning ComfyUI at ${host} ...`);
      await checkComfyUIAvailable(host);
      const liveMap = await scanLiveInstance(host);
      const existingKeys = getExistingKeys();
      const newNodes = findNewNodes(liveMap, existingKeys);
      logger.info('cli', `Live nodes: ${liveMap.size} | In knowledge: ${existingKeys.size} | New: ${newNodes.length}`);
      if (newNodes.length === 0) {
        logger.info('cli', 'Nothing to do.');
        return;
      }
      if (dryRun) {
        logger.info('cli', `Would generate descriptions and add: ${newNodes.map((n) => n.class_name).join(', ')}`);
        return;
      }
      logger.info('cli', 'Generating descriptions via Claude (batch + rate limit)...');
      const results = await generateBatch(newNodes);
      const added: Array<{ className: string; description: import('./types/node-types.js').NodeDescription }> = [];
      for (const [className, desc] of results) {
        addNode(className, desc, false);
        updateCompatibility(className, desc);
        added.push({ className, description: desc });
      }
      generateChangelog(added);
      logger.info('cli', `Added ${results.size} nodes to knowledge/.`);
    } catch (e) {
      if (isNetworkError(e)) {
        logger.error('cli', `ComfyUI недоступний (${host}). Переконайтесь, що ComfyUI запущений і COMFYUI_HOST вірний.`, e);
      } else if (isAuthError(e)) {
        logger.error('cli', 'Invalid API key або помилка авторизації. Перевірте ANTHROPIC_API_KEY.', e);
      } else {
        logger.error('cli', 'Scan failed.', e);
      }
      process.exit(1);
    }
  });

program
  .command('sync-manager')
  .description('Fetch ComfyUI-Manager custom-node-list and update custom-nodes.json')
  .action(async () => {
    try {
      const list = await fetchManagerList();
      const customNodes = (list as ManagerListResult).custom_nodes ?? [];
      const packs: CustomPack[] = customNodes.map((c: { title?: string; reference?: string; author?: string; description?: string }) => ({
        name: c.title ?? 'Unknown',
        repo: c.reference ?? '',
        author: c.author,
        priority: 'medium',
        description: c.description ?? '',
        key_nodes: [],
        use_cases: [],
      }));
      const data: CustomNodesJson = {
        metadata: {
          version: '1.0.0',
          last_updated: new Date().toISOString().slice(0, 10),
          total_packs: packs.length,
          source: 'ComfyUI-Manager custom-node-list',
        },
        packs,
      };
      const path = join(knowledgePath(), 'custom-nodes.json');
      writeFileSync(path, JSON.stringify(data, null, 2) + '\n', 'utf8');
      logger.info('cli', `Updated ${path} with ${packs.length} packs.`);
    } catch (e) {
      if (isNetworkError(e)) {
        logger.error('cli', 'Не вдалося завантажити custom-node-list (мережа або GitHub недоступні).', e);
      } else {
        logger.error('cli', 'sync-manager failed.', e);
      }
      process.exit(1);
    }
  });

program
  .command('analyze <url>')
  .description('Analyze a GitHub repo (README, __init__.py) for node metadata')
  .option('--generate', 'Also generate descriptions via Claude and add to knowledge')
  .option('--token <t>', 'GitHub token (or GITHUB_TOKEN) for API')
  .action(async (url: string, opts: { generate?: boolean; token?: string }) => {
    const ghToken = opts.token ?? process.env.GITHUB_TOKEN;
    if (!ghToken) {
      logger.error('cli', 'GITHUB_TOKEN or --token required for GitHub API.');
      process.exit(1);
    }
    const octokit = new Octokit({ auth: ghToken });
    try {
      const map = await analyzeRepository(url, octokit);
      const nodes = Array.from(map.values());
      logger.info('cli', `Found ${nodes.length} node(s): ${nodes.map((n) => n.class_name).join(', ')}`);
      if (nodes.length === 0) return;
      if (opts.generate) {
if (!process.env.ANTHROPIC_API_KEY) {
        logger.error('cli', 'ANTHROPIC_API_KEY required for --generate.');
        process.exit(1);
      }
      try {
        validateAnthropicApiKey(process.env.ANTHROPIC_API_KEY);
      } catch (e) {
        logger.error('cli', e instanceof Error ? e.message : String(e));
        process.exit(1);
      }
      const results = await generateBatch(nodes);
        const added: Array<{ className: string; description: import('./types/node-types.js').NodeDescription }> = [];
        for (const [className, desc] of results) {
          addNode(className, desc, true);
          updateCompatibility(className, desc);
          added.push({ className, description: desc });
        }
        generateChangelog(added);
        logger.info('cli', `Added ${results.size} nodes to knowledge/.`);
      }
    } catch (e) {
      if (isAuthError(e)) {
        logger.error('cli', 'GitHub: Invalid token or rate limit. Перевірте GITHUB_TOKEN.', e);
      } else if (isNetworkError(e)) {
        logger.error('cli', 'GitHub недоступний або репозиторій не знайдено.', e);
      } else {
        logger.error('cli', 'analyze failed.', e);
      }
      process.exit(1);
    }
  });

program
  .command('add-node')
  .description('Interactive wizard to add a single node to the knowledge base')
  .action(async () => {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    const ask = (q: string): Promise<string> =>
      new Promise((resolve) => rl.question(q, (s) => resolve((s ?? '').trim())));
    try {
      const className = await ask('Node class name (e.g. KSampler): ');
      if (!className) {
        logger.info('cli', 'Aborted.');
        rl.close();
        return;
      }
      const host = process.env.COMFYUI_HOST ?? 'http://127.0.0.1:8188';
      logger.info('cli', `Fetching /object_info from ${host} ...`);
      await checkComfyUIAvailable(host);
      const liveMap = await scanLiveInstance(host);
      const raw = liveMap.get(className);
      if (!raw) {
        logger.error('cli', `Node "${className}" not found in ComfyUI. Install the node or check class name.`);
        rl.close();
        process.exit(1);
      }
      if (!process.env.ANTHROPIC_API_KEY) {
        logger.error('cli', 'ANTHROPIC_API_KEY required for add-node.');
        rl.close();
        process.exit(1);
      }
      try {
        validateAnthropicApiKey(process.env.ANTHROPIC_API_KEY);
      } catch (e) {
        logger.error('cli', e instanceof Error ? e.message : String(e));
        rl.close();
        process.exit(1);
      }
      logger.info('cli', 'Generating description via Claude...');
      const { generateDescription } = await import('./node-discovery/ai-generator.js');
      const desc = await generateDescription(raw);
      addNode(className, desc, false);
      updateCompatibility(className, desc);
      generateChangelog([{ className, description: desc }]);
      logger.info('cli', `Added ${className} — ${desc.display_name}`);
    } catch (e) {
      if (isNetworkError(e)) {
        logger.error('cli', 'ComfyUI недоступний. Запустіть ComfyUI і спробуйте знову.', e);
      } else if (isAuthError(e)) {
        logger.error('cli', 'Invalid API key. Перевірте ANTHROPIC_API_KEY.', e);
      } else {
        logger.error('cli', 'add-node failed.', e);
      }
      process.exit(1);
    } finally {
      rl.close();
    }
  });

program.parse();
