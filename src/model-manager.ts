/**
 * Model Management: list models from ComfyUI object_info, get info, check existence,
 * and analyze workflows for required models.
 * Uses GET /object_info; loader nodes expose model lists in their input definitions.
 */
import type { ObjectInfo, ObjectInfoNode } from './types/comfyui-api-types.js';
import type { ComfyUIWorkflow, ComfyUINodeDef } from './types/comfyui-api-types.js';

export type ModelType =
  | 'checkpoint'
  | 'lora'
  | 'vae'
  | 'controlnet'
  | 'upscale'
  | 'embedding'
  | 'clip';

export interface ModelInfo {
  name: string;
  type: ModelType;
  path: string;
  size?: number;
  hash?: string;
  metadata?: Record<string, unknown>;
}

export interface ModelRequirement {
  name: string;
  type: ModelType;
  nodeId: string;
  nodeClass: string;
  inputName: string;
}

export interface ModelCheckResult {
  ready: boolean;
  missing: ModelRequirement[];
  found: ModelRequirement[];
}

/** Node class + input name → model type. Covers standard and common custom loaders. */
const LOADER_INPUT_TO_TYPE: Array<{ nodeClass: string; inputName: string; type: ModelType }> = [
  { nodeClass: 'CheckpointLoaderSimple', inputName: 'ckpt_name', type: 'checkpoint' },
  { nodeClass: 'LoraLoader', inputName: 'lora_name', type: 'lora' },
  { nodeClass: 'VAELoader', inputName: 'vae_name', type: 'vae' },
  { nodeClass: 'ControlNetLoader', inputName: 'control_net_name', type: 'controlnet' },
  { nodeClass: 'UpscaleModelLoader', inputName: 'model_name', type: 'upscale' },
  { nodeClass: 'CLIPLoader', inputName: 'clip_name', type: 'clip' },
  // CheckpointLoaderSimple optional vae override
  { nodeClass: 'CheckpointLoaderSimple', inputName: 'vae_name', type: 'vae' },
  // Common custom / alternative names
  { nodeClass: 'DualCLIPLoader', inputName: 'clip_name1', type: 'clip' },
  { nodeClass: 'DualCLIPLoader', inputName: 'clip_name2', type: 'clip' },
  { nodeClass: 'UNETLoader', inputName: 'unet_name', type: 'checkpoint' },
];

/** Extract list of model filenames from object_info input value. ComfyUI can use [type, [names]] or [[names]]. */
function extractModelNames(value: unknown): string[] {
  if (value == null) return [];
  if (Array.isArray(value)) {
    // [ "CHECKPOINT_NAME", [ "a.safetensors", "b.safetensors" ] ]
    if (value.length >= 2 && Array.isArray(value[1]) && value[1].every((x): x is string => typeof x === 'string')) {
      return value[1];
    }
    // [ [ "a.safetensors", "b.safetensors" ] ]
    if (value.length >= 1 && Array.isArray(value[0]) && value[0].every((x): x is string => typeof x === 'string')) {
      return value[0];
    }
  }
  return [];
}

function getInputValue(node: ObjectInfoNode, inputName: string): unknown {
  const required = node.input?.required ?? {};
  const optional = node.input?.optional ?? {};
  if (inputName in required) return (required as Record<string, unknown>)[inputName];
  if (inputName in optional) return (optional as Record<string, unknown>)[inputName];
  return undefined;
}

export interface ModelManagerOptions {
  getObjectInfo: () => Promise<ObjectInfo>;
}

export class ModelManager {
  private getObjectInfo: () => Promise<ObjectInfo>;
  private cache: { data: Map<ModelType, ModelInfo[]>; expires: number } | null = null;
  private readonly CACHE_TTL_MS = 5 * 60 * 1000;

  constructor(options: ModelManagerOptions) {
    this.getObjectInfo = options.getObjectInfo;
  }

  /** Invalidate cache (e.g. after installing models). */
  invalidateCache(): void {
    this.cache = null;
  }

  private async loadModelsByType(): Promise<Map<ModelType, ModelInfo[]>> {
    const now = Date.now();
    if (this.cache && this.cache.expires > now) {
      return this.cache.data;
    }
    const objectInfo = await this.getObjectInfo();
    const byType = new Map<ModelType, ModelInfo[]>();

    for (const { nodeClass, inputName, type } of LOADER_INPUT_TO_TYPE) {
      const node = objectInfo[nodeClass];
      if (!node) continue;
      const value = getInputValue(node, inputName);
      const names = extractModelNames(value);
      const existing = byType.get(type) ?? [];
      const seen = new Set(existing.map((m) => m.name));
      for (const name of names) {
        if (!seen.has(name)) {
          seen.add(name);
          existing.push({ name, type, path: name });
        }
      }
      if (existing.length) byType.set(type, existing);
    }

    this.cache = { data: byType, expires: now + this.CACHE_TTL_MS };
    return byType;
  }

  /**
   * List models, optionally filtered by type.
   */
  async listModels(type?: ModelType): Promise<ModelInfo[]> {
    const byType = await this.loadModelsByType();
    if (type) {
      return byType.get(type) ?? [];
    }
    const result: ModelInfo[] = [];
    for (const list of byType.values()) result.push(...list);
    return result;
  }

  /**
   * Get info for a single model by name and type. Returns null if not found.
   */
  async getModelInfo(name: string, type: ModelType): Promise<ModelInfo | null> {
    const list = await this.listModels(type);
    const found = list.find((m) => m.name === name);
    return found ?? null;
  }

  /**
   * Check if a model exists on the server (in object_info lists).
   */
  async checkModelExists(name: string, type: ModelType): Promise<boolean> {
    const info = await this.getModelInfo(name, type);
    return info != null;
  }

  /**
   * Extract required models from a workflow (loader nodes with literal model-name inputs).
   */
  getWorkflowModels(workflow: ComfyUIWorkflow): ModelRequirement[] {
    const result: ModelRequirement[] = [];
    for (const [nodeId, nodeDef] of Object.entries(workflow)) {
      const def = nodeDef as ComfyUINodeDef;
      const classType = def.class_type ?? '';
      const inputs = def.inputs ?? {};
      for (const { nodeClass, inputName, type } of LOADER_INPUT_TO_TYPE) {
        if (nodeClass !== classType) continue;
        const value = inputs[inputName];
        if (value == null) continue;
        const name = typeof value === 'string' ? value : undefined;
        if (name) {
          result.push({ name, type, nodeId, nodeClass, inputName });
        }
      }
    }
    return result;
  }

  /**
   * Check which required workflow models exist on the server and which are missing.
   */
  async checkWorkflowModels(workflow: ComfyUIWorkflow): Promise<ModelCheckResult> {
    const required = this.getWorkflowModels(workflow);
    const missing: ModelRequirement[] = [];
    const found: ModelRequirement[] = [];
    for (const req of required) {
      const exists = await this.checkModelExists(req.name, req.type);
      if (exists) found.push(req);
      else missing.push(req);
    }
    return { ready: missing.length === 0, missing, found };
  }
}
