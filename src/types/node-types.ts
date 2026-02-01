/**
 * Type definitions for Node Discovery System.
 * Aligned with knowledge/base-nodes.json.
 */

/** Raw node info as returned by ComfyUI /object_info (normalized). */
export interface RawNodeInfo {
  class_name: string;
  display_name?: string;
  category?: string;
  input: Record<string, unknown>;
  output: string[];
  output_name: string[];
  description?: string;
  source: 'comfyui_api' | 'manager' | 'github';
  author?: string;
  github?: string;
}

/** ComfyUI API raw shape for one node (input.required values can be [type, opts]). */
export interface ComfyObjectInfoNode {
  input?: {
    required?: Record<string, unknown>;
    optional?: Record<string, unknown>;
    hidden?: Record<string, unknown>;
  };
  output?: string[];
  output_name?: string[];
  output_is_list?: boolean[];
  name?: string;
  display_name?: string;
  description?: string;
  category?: string;
  output_node?: boolean;
}

/** Structured node description (Claude output / knowledge base entry). */
export interface InputParamSpec {
  type: string;
  description?: string;
  color?: string;
  default?: unknown;
  min?: number;
  max?: number;
  notes?: string;
}

export interface NodeDescription {
  display_name: string;
  category: string;
  description: string;
  input_types: {
    required: Record<string, InputParamSpec>;
    optional?: Record<string, unknown>;
  };
  return_types: string[];
  return_names: string[];
  output_colors: string[];
  use_cases: string[];
  compatible_outputs: Record<string, string[]>;
  example_values: Record<string, unknown>;
  priority: 'high' | 'medium' | 'low';
}

/** Data type entry in node-compatibility.json (producers/consumers). */
export interface DataType {
  color?: string;
  description?: string;
  producers: string[];
  consumers: string[];
}

export interface NodeCompatibilityData {
  metadata: { version?: string; last_updated?: string; description?: string };
  data_types: Record<string, DataType>;
  workflow_patterns?: string[];
}

/** Base nodes JSON file shape. */
export interface BaseNodesJson {
  metadata: {
    version?: string;
    last_updated?: string;
    total_nodes?: number;
    categories?: Record<string, number>;
  };
  nodes: Record<string, NodeDescription>;
}

/** Custom pack entry in custom-nodes.json. */
export interface CustomPack {
  name: string;
  repo: string;
  author?: string;
  priority?: string;
  description?: string;
  key_nodes?: string[];
  use_cases?: string[];
}

export interface CustomNodesJson {
  metadata: { version?: string; last_updated?: string; total_packs?: number; source?: string };
  packs: CustomPack[];
}
