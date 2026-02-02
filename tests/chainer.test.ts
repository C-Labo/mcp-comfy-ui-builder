/**
 * Unit tests for chainer (executeChain, resolveStepWorkflow).
 * executeChain is integration-heavy (ComfyUI, loadWorkflow); we test resolve logic via executeChain with mocks.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { executeChain } from '../src/workflow/chainer.js';
import type { ChainStep } from '../src/workflow/chainer.js';

const mockSubmitPromptAndWait = vi.fn();
const mockPrepareImageForWorkflow = vi.fn();
const mockLoadWorkflow = vi.fn();
vi.mock('../src/comfyui-client.js', () => ({
  submitPromptAndWait: (...args: unknown[]) => mockSubmitPromptAndWait(...args),
  prepareImageForWorkflow: (...args: unknown[]) => mockPrepareImageForWorkflow(...args),
  isComfyUIConfigured: () => true,
}));
vi.mock('../src/workflow/workflow-storage.js', () => ({
  loadWorkflow: (name: string) => mockLoadWorkflow(name),
}));

// Mock WebSocket client to force polling fallback
vi.mock('../src/comfyui-ws-client.js', () => ({
  getWSClient: () => ({
    connect: () => Promise.reject(new Error('WebSocket not available in tests')),
  }),
}));

describe('chainer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('executeChain', () => {
    it('resolves workflow from object and runs one step', async () => {
      mockSubmitPromptAndWait.mockResolvedValueOnce({
        prompt_id: 'p1',
        status: 'completed',
        outputs: {},
      });
      const steps: ChainStep[] = [
        {
          workflow: {
            '1': { class_type: 'CheckpointLoaderSimple', inputs: { ckpt_name: 'x.safetensors' } },
          },
        },
      ];
      const results = await executeChain(steps);
      expect(results).toHaveLength(1);
      expect(results[0].stepIndex).toBe(0);
      expect(results[0].prompt_id).toBe('p1');
      expect(results[0].status).toBe('completed');
      expect(mockSubmitPromptAndWait).toHaveBeenCalledTimes(1);
    });

    it('applies params override to workflow', async () => {
      mockSubmitPromptAndWait.mockResolvedValueOnce({
        prompt_id: 'p1',
        status: 'completed',
        outputs: {},
      });
      const steps: ChainStep[] = [
        {
          workflow: {
            '1': { class_type: 'CLIPTextEncode', inputs: { text: 'old', clip: ['0', 1] } },
          },
          params: { '1': { text: 'new' } },
        },
      ];
      await executeChain(steps);
      const call = mockSubmitPromptAndWait.mock.calls[0][0];
      expect(call['1'].inputs.text).toBe('new');
    });

    it('resolves workflow from saved name via loadWorkflow', async () => {
      mockLoadWorkflow.mockResolvedValueOnce({
        '1': { class_type: 'KSampler', inputs: {} },
      });
      mockSubmitPromptAndWait.mockResolvedValueOnce({
        prompt_id: 'p1',
        status: 'completed',
        outputs: {},
      });
      const steps: ChainStep[] = [{ workflow: 'my_saved_workflow' }];
      await executeChain(steps);
      expect(mockLoadWorkflow).toHaveBeenCalledWith('my_saved_workflow');
      expect(mockSubmitPromptAndWait).toHaveBeenCalledTimes(1);
    });

    it('stops on error when stopOnError true', async () => {
      mockSubmitPromptAndWait.mockRejectedValueOnce(new Error('fail'));
      const steps: ChainStep[] = [
        { workflow: { '1': { class_type: 'EmptyLatentImage', inputs: {} } } },
        { workflow: { '2': { class_type: 'SaveImage', inputs: {} } } },
      ];
      const results = await executeChain(steps, { stopOnError: true });
      expect(results).toHaveLength(1);
      expect(results[0].status).toBe('failed');
      expect(mockSubmitPromptAndWait).toHaveBeenCalledTimes(1);
    });
  });
});
