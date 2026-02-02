/**
 * Unit tests for model-manager (mocked getObjectInfo).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ObjectInfo } from '../src/types/comfyui-api-types.js';

const mockGetObjectInfo = vi.fn();
vi.mock('../src/comfyui-client.js', () => ({
  getObjectInfo: () => mockGetObjectInfo(),
}));

describe('ModelManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  async function getManager() {
    const { ModelManager } = await import('../src/model-manager.js');
    return new ModelManager({ getObjectInfo: mockGetObjectInfo });
  }

  describe('listModels', () => {
    it('returns empty when object_info has no model lists', async () => {
      mockGetObjectInfo.mockResolvedValueOnce({
        KSampler: { input: { required: { model: ['MODEL'] } } },
      } as ObjectInfo);
      const manager = await getManager();
      const list = await manager.listModels();
      expect(list).toEqual([]);
    });

    it('returns checkpoint models when CheckpointLoaderSimple has ckpt_name list', async () => {
      mockGetObjectInfo.mockResolvedValueOnce({
        CheckpointLoaderSimple: {
          input: {
            required: {
              ckpt_name: ['CHECKPOINT_NAME', ['sd_xl_base.safetensors', 'sd15.safetensors']],
            },
          },
        },
      } as ObjectInfo);
      const manager = await getManager();
      const list = await manager.listModels('checkpoint');
      expect(list).toHaveLength(2);
      expect(list.map((m) => m.name)).toEqual(['sd_xl_base.safetensors', 'sd15.safetensors']);
      expect(list.every((m) => m.type === 'checkpoint')).toBe(true);
    });

    it('returns lora models from LoraLoader lora_name', async () => {
      mockGetObjectInfo.mockResolvedValueOnce({
        LoraLoader: {
          input: {
            required: { lora_name: [['detail.safetensors', 'style.safetensors']] },
          },
        },
      } as ObjectInfo);
      const manager = await getManager();
      const list = await manager.listModels('lora');
      expect(list).toHaveLength(2);
      expect(list.map((m) => m.name)).toContain('detail.safetensors');
      expect(list.map((m) => m.name)).toContain('style.safetensors');
    });

    it('filters by type when type is provided', async () => {
      mockGetObjectInfo.mockResolvedValueOnce({
        CheckpointLoaderSimple: {
          input: { required: { ckpt_name: ['CHECKPOINT_NAME', ['ckpt.safetensors']] } },
        },
        LoraLoader: {
          input: { required: { lora_name: [['lora.safetensors']] } },
        },
      } as ObjectInfo);
      const manager = await getManager();
      const checkpoints = await manager.listModels('checkpoint');
      const loras = await manager.listModels('lora');
      expect(checkpoints).toHaveLength(1);
      expect(checkpoints[0].name).toBe('ckpt.safetensors');
      expect(loras).toHaveLength(1);
      expect(loras[0].name).toBe('lora.safetensors');
    });
  });

  describe('getModelInfo', () => {
    it('returns null when model not in list', async () => {
      mockGetObjectInfo.mockResolvedValueOnce({
        CheckpointLoaderSimple: {
          input: { required: { ckpt_name: ['CHECKPOINT_NAME', ['only.safetensors']] } },
        },
      } as ObjectInfo);
      const manager = await getManager();
      const info = await manager.getModelInfo('missing.safetensors', 'checkpoint');
      expect(info).toBeNull();
    });

    it('returns ModelInfo when model exists', async () => {
      mockGetObjectInfo.mockResolvedValueOnce({
        CheckpointLoaderSimple: {
          input: { required: { ckpt_name: ['CHECKPOINT_NAME', ['sd_xl.safetensors']] } },
        },
      } as ObjectInfo);
      const manager = await getManager();
      const info = await manager.getModelInfo('sd_xl.safetensors', 'checkpoint');
      expect(info).not.toBeNull();
      expect(info!.name).toBe('sd_xl.safetensors');
      expect(info!.type).toBe('checkpoint');
      expect(info!.path).toBe('sd_xl.safetensors');
    });
  });

  describe('checkModelExists', () => {
    it('returns true when model in list', async () => {
      mockGetObjectInfo.mockResolvedValueOnce({
        LoraLoader: { input: { required: { lora_name: [['x.safetensors']] } } },
      } as ObjectInfo);
      const manager = await getManager();
      const exists = await manager.checkModelExists('x.safetensors', 'lora');
      expect(exists).toBe(true);
    });

    it('returns false when model not in list', async () => {
      mockGetObjectInfo.mockResolvedValueOnce({
        LoraLoader: { input: { required: { lora_name: [['other.safetensors']] } } },
      } as ObjectInfo);
      const manager = await getManager();
      const exists = await manager.checkModelExists('missing.safetensors', 'lora');
      expect(exists).toBe(false);
    });
  });

  describe('getWorkflowModels', () => {
    it('returns empty for workflow with no loader model inputs', async () => {
      const manager = await getManager();
      const workflow = {
        '1': { class_type: 'KSampler', inputs: { seed: 42 } },
      };
      const required = manager.getWorkflowModels(workflow);
      expect(required).toEqual([]);
    });

    it('extracts checkpoint from CheckpointLoaderSimple', async () => {
      const manager = await getManager();
      const workflow = {
        '1': {
          class_type: 'CheckpointLoaderSimple',
          inputs: { ckpt_name: 'sd_xl_base.safetensors' },
        },
      };
      const required = manager.getWorkflowModels(workflow);
      expect(required).toHaveLength(1);
      expect(required[0]).toMatchObject({
        name: 'sd_xl_base.safetensors',
        type: 'checkpoint',
        nodeId: '1',
        nodeClass: 'CheckpointLoaderSimple',
        inputName: 'ckpt_name',
      });
    });

    it('extracts lora and checkpoint from workflow', async () => {
      const manager = await getManager();
      const workflow = {
        '1': { class_type: 'CheckpointLoaderSimple', inputs: { ckpt_name: 'ckpt.safetensors' } },
        '2': { class_type: 'LoraLoader', inputs: { lora_name: 'lora.safetensors', model: ['1', 0], clip: ['1', 1] } },
      };
      const required = manager.getWorkflowModels(workflow);
      expect(required).toHaveLength(2);
      const names = required.map((r) => r.name).sort();
      expect(names).toEqual(['ckpt.safetensors', 'lora.safetensors']);
    });
  });

  describe('checkWorkflowModels', () => {
    it('returns ready true when all required models exist', async () => {
      mockGetObjectInfo.mockResolvedValueOnce({
        CheckpointLoaderSimple: {
          input: { required: { ckpt_name: ['CHECKPOINT_NAME', ['ckpt.safetensors']] } },
        },
        LoraLoader: {
          input: { required: { lora_name: [['lora.safetensors']] } },
        },
      } as ObjectInfo);
      const manager = await getManager();
      const workflow = {
        '1': { class_type: 'CheckpointLoaderSimple', inputs: { ckpt_name: 'ckpt.safetensors' } },
        '2': { class_type: 'LoraLoader', inputs: { lora_name: 'lora.safetensors', model: ['1', 0], clip: ['1', 1] } },
      };
      const result = await manager.checkWorkflowModels(workflow);
      expect(result.ready).toBe(true);
      expect(result.missing).toHaveLength(0);
      expect(result.found).toHaveLength(2);
    });

    it('returns ready false and missing when a model is not on server', async () => {
      mockGetObjectInfo.mockResolvedValueOnce({
        CheckpointLoaderSimple: {
          input: { required: { ckpt_name: ['CHECKPOINT_NAME', ['only_this.safetensors']] } },
        },
      } as ObjectInfo);
      const manager = await getManager();
      const workflow = {
        '1': { class_type: 'CheckpointLoaderSimple', inputs: { ckpt_name: 'missing_ckpt.safetensors' } },
      };
      const result = await manager.checkWorkflowModels(workflow);
      expect(result.ready).toBe(false);
      expect(result.missing).toHaveLength(1);
      expect(result.missing[0].name).toBe('missing_ckpt.safetensors');
      expect(result.found).toHaveLength(0);
    });
  });

  describe('invalidateCache', () => {
    it('refetches object_info after invalidateCache', async () => {
      mockGetObjectInfo
        .mockResolvedValueOnce({
          CheckpointLoaderSimple: {
            input: { required: { ckpt_name: ['CHECKPOINT_NAME', ['old.safetensors']] } },
          },
        } as ObjectInfo)
        .mockResolvedValueOnce({
          CheckpointLoaderSimple: {
            input: { required: { ckpt_name: ['CHECKPOINT_NAME', ['new.safetensors']] } },
          },
        } as ObjectInfo);
      const manager = await getManager();
      const list1 = await manager.listModels('checkpoint');
      expect(list1[0].name).toBe('old.safetensors');
      manager.invalidateCache();
      const list2 = await manager.listModels('checkpoint');
      expect(list2[0].name).toBe('new.safetensors');
      expect(mockGetObjectInfo).toHaveBeenCalledTimes(2);
    });
  });
});
