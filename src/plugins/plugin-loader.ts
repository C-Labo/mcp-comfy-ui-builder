/**
 * Plugin loader: load templates/macros (and optionally chains) from plugins/*/plugin.json.
 *
 * Design goals:
 * - Data-only plugins (JSON), no arbitrary code execution.
 * - Focus on macros first (directly usable via list_macros/insert_macro).
 * - Template/chain support can be extended later on top of the same schema.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Macro } from '../workflow/macro.js';
import type { WorkflowTemplate } from '../workflow/workflow-template.js';
import type { ComfyUIWorkflow } from '../types/comfyui-api-types.js';

export interface PluginMacroConfig {
  id: string;
  name: string;
  description?: string;
  inputs: {
    name: string;
    type: string;
    nodeId: string;
    inputName?: string;
  }[];
  outputs: {
    name: string;
    type: string;
    nodeId: string;
    outputIndex?: number;
  }[];
  nodes: ComfyUIWorkflow;
}

export interface PluginTemplateConfig extends Omit<WorkflowTemplate, 'id'> {
  /** Optional explicit id; if missing, plugin loader will generate one. */
  id?: string;
}

export interface PluginConfig {
  id: string;
  name: string;
  version: string;
  description?: string;
  author?: string;
  macros?: PluginMacroConfig[];
  templates?: PluginTemplateConfig[];
}

export interface LoadedPlugin {
  id: string;
  name: string;
  version: string;
  description?: string;
  author?: string;
  macros: Macro[];
  templates: WorkflowTemplate[];
}

const PLUGINS_DIR = join(process.cwd(), 'plugins');

function safeReadJson(path: string): unknown | null {
  try {
    const raw = readFileSync(path, 'utf8');
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

/**
 * Convert PluginMacroConfig to internal Macro type, prefixing id with plugin id to avoid collisions.
 */
function macroFromConfig(pluginId: string, cfg: PluginMacroConfig): Macro {
  const id = `${pluginId}:${cfg.id}`;
  return {
    id,
    name: cfg.name,
    description: cfg.description ?? '',
    inputs: cfg.inputs.map((p) => ({
      name: p.name,
      type: p.type,
      nodeId: p.nodeId,
      inputName: p.inputName,
    })),
    outputs: cfg.outputs.map((p) => ({
      name: p.name,
      type: p.type,
      nodeId: p.nodeId,
      outputIndex: p.outputIndex,
    })),
    nodes: cfg.nodes,
  };
}

/**
 * Convert PluginTemplateConfig to WorkflowTemplate, prefixing id with plugin id when present.
 * For now we treat plugin templates as data; they can be surfaced via future tools.
 */
function templateFromConfig(pluginId: string, cfg: PluginTemplateConfig): WorkflowTemplate {
  const id = cfg.id ? `${pluginId}:${cfg.id}` : `${pluginId}:tpl_${Date.now().toString(36)}`;
  return {
    id,
    name: cfg.name,
    description: cfg.description,
    category: cfg.category,
    parameters: cfg.parameters,
    workflow: cfg.workflow,
  };
}

/**
 * Load all plugins from plugins/*/plugin.json.
 */
export function loadPlugins(): LoadedPlugin[] {
  if (!existsSync(PLUGINS_DIR)) {
    return [];
  }

  const entries = readdirSync(PLUGINS_DIR, { withFileTypes: true });
  const plugins: LoadedPlugin[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const dir = join(PLUGINS_DIR, entry.name);
    const configPath = join(dir, 'plugin.json');
    if (!existsSync(configPath)) continue;

    const raw = safeReadJson(configPath);
    if (!raw || typeof raw !== 'object') continue;
    const cfg = raw as Partial<PluginConfig>;
    if (!cfg.id || !cfg.name || !cfg.version) continue;

    const macros: Macro[] = [];
    const templates: WorkflowTemplate[] = [];

    if (Array.isArray(cfg.macros)) {
      for (const m of cfg.macros) {
        if (!m || typeof m !== 'object') continue;
        const mc = m as PluginMacroConfig;
        if (!mc.id || !mc.name || !mc.nodes) continue;
        macros.push(macroFromConfig(cfg.id, mc));
      }
    }

    if (Array.isArray(cfg.templates)) {
      for (const t of cfg.templates) {
        if (!t || typeof t !== 'object') continue;
        const tc = t as PluginTemplateConfig;
        if (!tc.name || !tc.workflow) continue;
        templates.push(templateFromConfig(cfg.id, tc));
      }
    }

    plugins.push({
      id: cfg.id,
      name: cfg.name,
      version: cfg.version,
      description: cfg.description,
      author: cfg.author,
      macros,
      templates,
    });
  }

  return plugins;
}

export interface PluginSummary {
  id: string;
  name: string;
  version: string;
  description?: string;
  author?: string;
  macros: number;
  templates: number;
}

export function summarizePlugins(plugins: LoadedPlugin[]): PluginSummary[] {
  return plugins.map((p) => ({
    id: p.id,
    name: p.name,
    version: p.version,
    description: p.description,
    author: p.author,
    macros: p.macros.length,
    templates: p.templates.length,
  }));
}

