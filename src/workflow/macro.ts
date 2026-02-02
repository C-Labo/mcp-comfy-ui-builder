/**
 * Macros: reusable sub-workflows with named inputs/outputs.
 * insertMacro clones macro nodes into a workflow context and connects ports.
 */
import type { ComfyUIWorkflow, ComfyUINodeDef } from '../types/comfyui-api-types.js';
import type { WorkflowContext } from './dynamic-builder.js';

export interface MacroPort {
  name: string;
  type: string;
  nodeId: string;
  /** For input port: the input name on the node to connect. */
  inputName?: string;
  /** For output port: the output index of the node. */
  outputIndex?: number;
}

export interface Macro {
  id: string;
  name: string;
  description: string;
  inputs: MacroPort[];
  outputs: MacroPort[];
  nodes: ComfyUIWorkflow;
}

export interface MacroInsertResult {
  nodeIdMap: Record<string, string>;
  outputPorts: Record<string, [string, number]>;
}

/** Input connection: [sourceNodeId, outputIndex] for links, or literal value (e.g. filename for LoadImage). */
export type InputConnectionValue = [string, number] | string | number | boolean;

/** Minimal upscale sub-workflow: LoadImage → UpscaleModelLoader → ImageUpscaleWithModel → SaveImage. */
const UPSCALE_REFINE_NODES: ComfyUIWorkflow = {
  '1': {
    class_type: 'LoadImage',
    inputs: {}, // input port: image
  },
  '2': {
    class_type: 'UpscaleModelLoader',
    inputs: { model_name: 'RealESRGAN_x4plus.pth' },
  },
  '3': {
    class_type: 'ImageUpscaleWithModel',
    inputs: { image: ['1', 0], upscale_model: ['2', 0] },
  },
  '4': {
    class_type: 'SaveImage',
    inputs: { images: ['3', 0] },
  },
};

export const BUILTIN_MACROS: Record<string, Macro> = {
  upscale_refine: {
    id: 'upscale_refine',
    name: 'Upscale (simple)',
    description: 'LoadImage → UpscaleModelLoader → ImageUpscaleWithModel → SaveImage',
    inputs: [
      { name: 'image', type: 'IMAGE', nodeId: '1', inputName: 'image' },
    ],
    outputs: [
      { name: 'image', type: 'IMAGE', nodeId: '4', outputIndex: 0 },
    ],
    nodes: UPSCALE_REFINE_NODES,
  },
};

const PLUGIN_MACROS: Record<string, Macro> = {};

function getAllMacros(): Record<string, Macro> {
  return { ...BUILTIN_MACROS, ...PLUGIN_MACROS };
}

export function registerPluginMacros(macros: Macro[]): void {
  // Replace all plugin macros with the provided set.
  for (const key of Object.keys(PLUGIN_MACROS)) {
    delete PLUGIN_MACROS[key];
  }
  for (const macro of macros) {
    if (!macro.id) continue;
    PLUGIN_MACROS[macro.id] = macro;
  }
}

function isLink(value: InputConnectionValue): value is [string, number] {
  return Array.isArray(value) && value.length === 2 && typeof value[0] === 'string' && typeof value[1] === 'number';
}

/**
 * Clone macro nodes into ctx with new ids; remap internal refs; connect input ports.
 * inputConnections: port name -> [sourceNodeId, outputIndex] for links, or literal value (e.g. filename for LoadImage).
 * Returns nodeIdMap (old id -> new id) and outputPorts (port name -> [newNodeId, outputIndex]).
 */
export function insertMacro(
  ctx: WorkflowContext,
  macro: Macro,
  inputConnections: Record<string, InputConnectionValue>
): MacroInsertResult {
  const nodeIds = Object.keys(macro.nodes).sort((a, b) => Number(a) - Number(b));
  const nodeIdMap: Record<string, string> = {};
  const maxId = ctx.nodeCounter;
  nodeIds.forEach((oldId, i) => {
    const newId = String(maxId + i + 1);
    nodeIdMap[oldId] = newId;
  });
  ctx.nodeCounter = maxId + nodeIds.length;

  const cloned: ComfyUIWorkflow = {};
  for (const [oldId, node] of Object.entries(macro.nodes)) {
    const def = node as ComfyUINodeDef;
    const newId = nodeIdMap[oldId];
    const inputs: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(def.inputs ?? {})) {
      if (Array.isArray(val) && val.length === 2 && typeof val[0] === 'string') {
        const mapped = nodeIdMap[val[0]];
        inputs[key] = mapped != null ? [mapped, val[1]] : val;
      } else {
        inputs[key] = val;
      }
    }
    cloned[newId] = { class_type: def.class_type, inputs };
  }

  for (const port of macro.inputs) {
    const conn = inputConnections[port.name];
    const inputName = port.inputName ?? port.name;
    if (conn !== undefined && conn !== null && inputName) {
      const newId = nodeIdMap[port.nodeId];
      const node = cloned[newId];
      if (node) node.inputs[inputName] = isLink(conn) ? conn : conn;
    }
  }

  for (const [newId, node] of Object.entries(cloned)) {
    ctx.workflow[newId] = node;
  }

  const outputPorts: Record<string, [string, number]> = {};
  for (const port of macro.outputs) {
    const newId = nodeIdMap[port.nodeId];
    const outIdx = port.outputIndex ?? 0;
    if (newId != null) outputPorts[port.name] = [newId, outIdx];
  }

  return { nodeIdMap, outputPorts };
}

/**
 * Extract a macro from a selection of node ids. Infers input ports (inputs that reference nodes outside the set)
 * and output ports (nodes whose outputs are consumed outside the set).
 */
export function createMacroFromSelection(
  workflow: ComfyUIWorkflow,
  nodeIds: string[],
  options?: { id?: string; name?: string; description?: string }
): Macro {
  const idSet = new Set(nodeIds);
  const id = options?.id ?? `macro_${Date.now()}`;
  const name = options?.name ?? 'Custom macro';
  const description = options?.description ?? '';

  const inputs: MacroPort[] = [];
  const outputs: MacroPort[] = [];
  const nodes: ComfyUIWorkflow = {};

  for (const nid of nodeIds) {
    const node = workflow[nid];
    if (!node) continue;
    nodes[nid] = { class_type: (node as ComfyUINodeDef).class_type, inputs: { ...(node as ComfyUINodeDef).inputs } };
    const def = node as ComfyUINodeDef;
    for (const [inputName, val] of Object.entries(def.inputs ?? {})) {
      if (Array.isArray(val) && val.length === 2 && typeof val[0] === 'string') {
        if (!idSet.has(val[0])) {
          inputs.push({ name: `${nid}_${inputName}`, type: 'ANY', nodeId: nid, inputName });
        }
      }
    }
  }

  const consumedOutputs = new Map<string, Set<number>>();
  for (const [otherId, other] of Object.entries(workflow)) {
    if (idSet.has(otherId)) continue;
    const otherDef = other as ComfyUINodeDef;
    for (const val of Object.values(otherDef.inputs ?? {})) {
      if (Array.isArray(val) && val.length === 2 && typeof val[0] === 'string' && typeof val[1] === 'number') {
        const [refId, outIdx] = val;
        if (idSet.has(refId)) {
          const set = consumedOutputs.get(refId) ?? new Set<number>();
          set.add(outIdx);
          consumedOutputs.set(refId, set);
        }
      }
    }
  }
  for (const [nid, indices] of consumedOutputs) {
    for (const outIdx of indices) {
      outputs.push({ name: `${nid}_out_${outIdx}`, type: 'ANY', nodeId: nid, outputIndex: outIdx });
    }
  }

  return { id, name, description, inputs, outputs, nodes };
}

export function listMacros(): Macro[] {
  return Object.values(getAllMacros());
}

export function getMacro(id: string): Macro | null {
  const all = getAllMacros();
  return all[id] ?? null;
}
