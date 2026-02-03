/**
 * Unit tests for WebSocket polling fallback when completed event never arrives (MPS/macOS).
 * Tests the fix for execute_workflow_sync returning timeout instead of completed.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { ComfyUIWorkflow } from '../src/types/comfyui-api-types.js';

const mockFetch = vi.fn();

// Mock node-fetch
vi.mock('node-fetch', () => ({ default: mockFetch }));

// Mock WebSocket client: emits 100% progress but never completed (simulates MPS behavior)
vi.mock('../src/comfyui-ws-client.js', () => ({
  getWSClient: () => ({
    connect: () => Promise.resolve(),
    subscribe: (promptId: string, onProgress: (p: unknown) => void) => {
      // Emit 100% progress without status: 'completed' (executing event with node: null never comes)
      queueMicrotask(() => {
        onProgress({
          prompt_id: promptId,
          status: 'executing',
          current_node_progress: 1,
          completed_nodes: [],
          cached_nodes: [],
          outputs: {},
        });
      });
      return { unsubscribe: () => {} };
    },
    isConnected: () => true,
  }),
  resetWSClient: () => {},
}));

describe('ComfyUI client — WebSocket polling fallback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.COMFYUI_HOST;
  });
  afterEach(() => {
    delete process.env.COMFYUI_HOST;
  });

  it('resolves with completed via polling fallback when WS shows 100% but no completed event', async () => {
    const promptId = 'p-fallback-test';
    const completedOutputs = {
      '7': { images: [{ filename: 'out.png', subfolder: 'output', type: 'output' }] },
    };

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ prompt_id: promptId }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          {
            prompt_id: promptId,
            outputs: completedOutputs,
            status: { status_str: 'success' },
          },
        ],
      });

    const { submitPromptAndWaitWithProgress } = await import('../src/comfyui-client.js');
    const workflow: ComfyUIWorkflow = {
      '1': { class_type: 'CheckpointLoaderSimple', inputs: { ckpt_name: 'model.safetensors' } },
    };

    // Timeout must be > 3000 (POLL_FALLBACK_DELAY_MS) so fallback runs before main timeout
    const result = await submitPromptAndWaitWithProgress(workflow, 15_000);

    expect(result.prompt_id).toBe(promptId);
    expect(result.status).toBe('completed');
    expect(result.outputs).toEqual(completedOutputs);

    // Verify polling was used (GET /history called)
    const historyCalls = mockFetch.mock.calls.filter((c: unknown[]) =>
      String(c[0]).includes('/history')
    );
    expect(historyCalls.length).toBeGreaterThanOrEqual(1);
  }, 20_000);
});
