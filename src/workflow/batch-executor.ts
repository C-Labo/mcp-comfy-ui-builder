/**
 * Batch executor: run multiple workflows with configurable concurrency.
 * Uses submitPromptAndWait (polling) per workflow.
 */
import * as comfyui from '../comfyui-client.js';
import type { ComfyUIWorkflow, ExecutionResult } from '../types/comfyui-api-types.js';

export interface ExecutionProgress {
  prompt_id: string;
  status: 'queued' | 'started' | 'executing' | 'completed' | 'error';
  current_node?: string;
  current_node_progress?: number;
  queue_position?: number;
  outputs?: Record<string, unknown>;
  error?: string;
}

export interface BatchConfig {
  workflows: ComfyUIWorkflow[];
  concurrency?: number;
  stopOnError?: boolean;
  timeoutMs?: number;
  onProgress?: (index: number, total: number, result: ExecutionResult) => void;
}

export interface BatchResult {
  index: number;
  prompt_id: string;
  status: 'completed' | 'failed';
  outputs?: Record<string, unknown>;
  error?: string;
}

/**
 * Execute workflows in batches. Up to concurrency run at a time.
 * Each workflow is submitted and waited on via submitPromptAndWait.
 */
export async function executeBatch(config: BatchConfig): Promise<BatchResult[]> {
  const { workflows, concurrency = 1, stopOnError = false, timeoutMs = 300_000, onProgress } = config;
  const results: BatchResult[] = [];
  const queue = workflows.map((w, i) => ({ workflow: w, index: i }));
  const running: Promise<void>[] = [];
  const maxConcurrency = Math.max(1, concurrency);

  async function runOne(item: (typeof queue)[0]): Promise<void> {
    try {
      const result = await comfyui.submitPromptAndWait(item.workflow, timeoutMs);
      const batchResult: BatchResult = {
        index: item.index,
        prompt_id: result.prompt_id,
        status: result.status === 'completed' ? 'completed' : 'failed',
        outputs: result.outputs,
        error: result.error,
      };
      results.push(batchResult);
      onProgress?.(item.index, workflows.length, result);
    } catch (e) {
      const batchResult: BatchResult = {
        index: item.index,
        prompt_id: '',
        status: 'failed',
        error: e instanceof Error ? e.message : String(e),
      };
      results.push(batchResult);
      onProgress?.(item.index, workflows.length, { prompt_id: '', status: 'failed', error: batchResult.error });
    }
  }

  while (queue.length > 0 || running.length > 0) {
    while (running.length < maxConcurrency && queue.length > 0) {
      const item = queue.shift()!;
      const promise = runOne(item).then(() => {
        const i = running.indexOf(promise);
        if (i >= 0) running.splice(i, 1);
      });
      running.push(promise);
    }
    if (stopOnError && results.some((r) => r.status === 'failed')) {
      await Promise.all(running);
      break;
    }
    if (running.length > 0) {
      await Promise.race(running);
    }
  }

  results.sort((a, b) => a.index - b.index);
  return results;
}
