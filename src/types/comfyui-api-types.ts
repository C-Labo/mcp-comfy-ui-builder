/**
 * Types for ComfyUI API: workflow JSON, history, queue.
 * See doc/comfyui-api-quick-reference.md
 */

/** One node in ComfyUI workflow: class_type + inputs (literals or [nodeId, outputIndex]). */
export interface ComfyUINodeDef {
  class_type: string;
  inputs: Record<string, unknown>;
}

/** ComfyUI workflow: node id (string) -> node definition. */
export type ComfyUIWorkflow = Record<string, ComfyUINodeDef>;

/** Response from POST /prompt. */
export interface SubmitPromptResponse {
  prompt_id: string;
}

/** Image output entry in history. */
export interface HistoryImageOutput {
  filename: string;
  subfolder?: string;
  type?: string;
}

/** Outputs of one node in history. */
export interface HistoryNodeOutput {
  images?: HistoryImageOutput[];
  [key: string]: unknown;
}

/** One prompt's entry in GET /history or /history/{id}. */
export interface HistoryEntry {
  prompt_id?: string;
  outputs?: Record<string, HistoryNodeOutput>;
  status?: { status_str?: string; messages?: unknown[] };
  [key: string]: unknown;
}

/** Result of synchronous workflow execution (submit + wait). */
export interface ExecutionResult {
  prompt_id: string;
  status: 'completed' | 'failed' | 'timeout';
  outputs?: Record<string, HistoryNodeOutput>;
  error?: string;
}

/** GET /queue response. */
export interface QueueStatus {
  queue_running: unknown[];
  queue_pending: unknown[];
}

/** One node from ComfyUI GET /object_info (input values: type string or [type, config]). */
export interface ObjectInfoNode {
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

/** GET /object_info response: class name -> node definition. */
export type ObjectInfo = Record<string, ObjectInfoNode>;

/**
 * WebSocket event types from ComfyUI /ws endpoint
 */

/** Base WebSocket message structure */
export interface WSMessage {
  type: string;
  data: unknown;
}

/** Progress event: sent during node execution (0-1 progress) */
export interface WSProgressEvent {
  type: 'progress';
  data: {
    value: number; // current progress
    max: number; // total steps
    prompt_id?: string; // execution ID (may not always be present)
    node?: string; // optional node ID
  };
}

/** Executing event: node has started execution */
export interface WSExecutingEvent {
  type: 'executing';
  data: {
    node: string | null; // null means execution finished
    prompt_id: string;
    display_node?: string;
  };
}

/** Executed event: node completed with outputs */
export interface WSExecutedEvent {
  type: 'executed';
  data: {
    node: string;
    prompt_id: string;
    output: Record<string, unknown>; // node outputs
  };
}

/** Status event: execution state change */
export interface WSStatusEvent {
  type: 'status';
  data: {
    status: {
      exec_info: {
        queue_remaining: number;
      };
    };
    sid?: string;
  };
}

/** Execution error event */
export interface WSExecutionErrorEvent {
  type: 'execution_error';
  data: {
    prompt_id: string;
    node_id: string;
    node_type: string;
    executed: string[];
    exception_message: string;
    exception_type: string;
    traceback: string[];
  };
}

/** Execution cached event: node output was cached */
export interface WSExecutionCachedEvent {
  type: 'execution_cached';
  data: {
    nodes: string[];
    prompt_id: string;
  };
}

/** Union type for all WebSocket events */
export type WSEvent =
  | WSProgressEvent
  | WSExecutingEvent
  | WSExecutedEvent
  | WSStatusEvent
  | WSExecutionErrorEvent
  | WSExecutionCachedEvent;

/** Progress information for a prompt execution */
export interface ExecutionProgress {
  prompt_id: string;
  status: 'queued' | 'executing' | 'completed' | 'failed';
  current_node?: string;
  current_node_progress?: number; // 0-1
  queue_position?: number;
  completed_nodes: string[];
  cached_nodes: string[];
  outputs: Record<string, HistoryNodeOutput>;
  error?: {
    node_id: string;
    message: string;
    type: string;
  };
}

/** GET /system_stats response (ComfyUI server.py). Values in bytes. */
export interface SystemStatsDevice {
  name: string;
  type?: string;
  index?: number;
  vram_total: number;
  vram_free: number;
  torch_vram_total?: number;
  torch_vram_free?: number;
}

export interface SystemStatsSystem {
  os?: string;
  ram_total: number;
  ram_free: number;
  comfyui_version?: string;
  python_version?: string;
  pytorch_version?: string;
  [key: string]: unknown;
}

export interface SystemStatsResponse {
  system: SystemStatsSystem;
  devices: SystemStatsDevice[];
}
