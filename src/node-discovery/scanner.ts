/**
 * NodeScanner: scan ComfyUI /object_info, fetch Manager list, analyze GitHub repos.
 * See doc/node-discovery-system.md.
 * Includes retry with exponential backoff for network/rate-limit errors.
 */

import fetch from 'node-fetch';
import type { RawNodeInfo, ComfyObjectInfoNode } from '../types/node-types.js';

const COMFYUI_MANAGER_LIST_URL =
  'https://raw.githubusercontent.com/Comfy-Org/ComfyUI-Manager/main/custom-node-list.json';

const DEFAULT_RETRIES = 2;
const INITIAL_BACKOFF_MS = 1000;

type FetchResponse = Awaited<ReturnType<typeof fetch>>;

async function fetchWithRetry(
  url: string,
  options: Parameters<typeof fetch>[1] = {},
  retries: number = DEFAULT_RETRIES
): Promise<FetchResponse> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, options as Parameters<typeof fetch>[1]);
      if (res.status === 429 && attempt < retries) {
        const backoff = INITIAL_BACKOFF_MS * Math.pow(2, attempt);
        await new Promise((r) => setTimeout(r, backoff));
        continue;
      }
      return res as FetchResponse;
    } catch (e) {
      lastError = e;
      if (attempt < retries) {
        const backoff = INITIAL_BACKOFF_MS * Math.pow(2, attempt);
        await new Promise((r) => setTimeout(r, backoff));
      }
    }
  }
  throw lastError;
}

export interface ManagerCustomNode {
  author?: string;
  title?: string;
  id?: string;
  reference?: string;
  files?: string[];
  install_type?: string;
  description?: string;
  nodename_pattern?: string;
}

export interface ManagerListResult {
  custom_nodes?: ManagerCustomNode[];
}

/**
 * Fetch /object_info from a running ComfyUI instance and parse into Map<className, RawNodeInfo>.
 */
export async function scanLiveInstance(
  baseUrl: string = process.env.COMFYUI_HOST ?? 'http://127.0.0.1:8188'
): Promise<Map<string, RawNodeInfo>> {
  const url = `${baseUrl.replace(/\/$/, '')}/object_info`;
  const res = await fetchWithRetry(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) {
    throw new Error(`ComfyUI object_info failed: ${res.status} ${res.statusText} (${url})`);
  }
  const data = (await res.json()) as Record<string, ComfyObjectInfoNode>;
  const map = new Map<string, RawNodeInfo>();

  for (const [className, node] of Object.entries(data)) {
    if (!node || typeof node !== 'object') continue;
    const input = node.input ?? {};
    const required = (input as { required?: Record<string, unknown> }).required ?? {};
    map.set(className, {
      class_name: className,
      display_name: node.display_name ?? node.name ?? className,
      category: node.category,
      input: { required, optional: (input as { optional?: Record<string, unknown> }).optional ?? {}, hidden: (input as { hidden?: Record<string, unknown> }).hidden ?? {} },
      output: Array.isArray(node.output) ? node.output : [],
      output_name: Array.isArray(node.output_name) ? node.output_name : [],
      description: node.description,
      source: 'comfyui_api',
    });
  }

  return map;
}

/**
 * Fetch ComfyUI-Manager custom-node-list.json and return parsed list.
 */
export async function fetchManagerList(): Promise<ManagerListResult> {
  const res = await fetchWithRetry(COMFYUI_MANAGER_LIST_URL, { headers: { Accept: 'application/json' } });
  if (!res.ok) {
    throw new Error(`ComfyUI-Manager list failed: ${res.status} ${res.statusText}`);
  }
  return (await res.json()) as ManagerListResult;
}

/**
 * Analyze a GitHub repo: fetch README and __init__.py (or main node file) for metadata.
 * Returns RawNodeInfo entries inferred from repo (class names from __init__.py, README for description).
 */
export async function analyzeRepository(
  repoUrl: string,
  octokit: { request: (route: string, options?: Record<string, unknown>) => Promise<{ data: unknown }> }
): Promise<Map<string, RawNodeInfo>> {
  const map = new Map<string, RawNodeInfo>();
  const match = repoUrl.match(/github\.com[/]([^/]+)[/]([^/]+?)(?:\.git)?$/);
  if (!match) {
    throw new Error(`Invalid GitHub URL: ${repoUrl}`);
  }
  const [, owner, repo] = match;
  const repoName = repo.replace(/\.git$/, '');

  try {
    const { data: readme } = await octokit.request('GET /repos/{owner}/{repo}/readme', {
      owner,
      repo: repoName,
      headers: { Accept: 'application/vnd.github.raw' },
    });
    const readmeText = typeof readme === 'string' ? readme : (readme as { content?: string })?.content ? Buffer.from((readme as { content?: string }).content!, 'base64').toString('utf8') : '';

    const { data: contents } = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
      owner,
      repo: repoName,
      path: '',
    });
    const files = Array.isArray(contents) ? contents : [];
    let initContent = '';
    for (const f of files) {
      const item = f as { name?: string; type?: string; path?: string };
      if (item.name === '__init__.py' || (item.path && item.path.endsWith('__init__.py'))) {
        const { data: fileData } = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
          owner,
          repo: repoName,
          path: item.path ?? '__init__.py',
        });
        const content = (fileData as { content?: string })?.content;
        if (content) initContent = Buffer.from(content.replace(/\n/g, ''), 'base64').toString('utf8');
        break;
      }
    }

    const mappingMatch = initContent.match(/NODE_CLASS_MAPPINGS\s*=\s*\{([^}]+)\}/);
    const classNames: string[] = [];
    if (mappingMatch) {
      const inner = mappingMatch[1];
      const keyMatches = inner.matchAll(/"([^"]+)"/g);
      for (const m of keyMatches) {
        if (m[1] && !classNames.includes(m[1])) classNames.push(m[1]);
      }
    }
    for (const name of classNames) {
      map.set(name, {
        class_name: name,
        display_name: name,
        category: 'custom',
        input: {},
        output: [],
        output_name: [],
        description: readmeText.slice(0, 200).replace(/\n/g, ' ').trim(),
        source: 'github',
        github: repoUrl,
      });
    }
  } catch (e) {
    throw new Error(`analyzeRepository(${repoUrl}): ${e instanceof Error ? e.message : String(e)}`);
  }

  return map;
}

/**
 * From a full scan Map, return only entries whose class_name is not in existingKeys.
 */
export function findNewNodes(
  liveMap: Map<string, RawNodeInfo>,
  existingKeys: Set<string>
): RawNodeInfo[] {
  const out: RawNodeInfo[] = [];
  for (const [key, info] of liveMap) {
    if (!existingKeys.has(key)) out.push(info);
  }
  return out;
}
