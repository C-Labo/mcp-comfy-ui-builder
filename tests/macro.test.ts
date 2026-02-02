/**
 * Unit tests for macro (insertMacro, createMacroFromSelection, listMacros, getMacro).
 */
import { describe, it, expect } from 'vitest';
import { createWorkflow } from '../src/workflow/dynamic-builder.js';
import {
  insertMacro,
  createMacroFromSelection,
  listMacros,
  getMacro,
  BUILTIN_MACROS,
} from '../src/workflow/macro.js';

describe('macro', () => {
  describe('listMacros', () => {
    it('returns built-in macros', () => {
      const list = listMacros();
      expect(list.length).toBeGreaterThanOrEqual(1);
      expect(list.some((m) => m.id === 'upscale_refine')).toBe(true);
    });
  });

  describe('getMacro', () => {
    it('returns macro by id', () => {
      const macro = getMacro('upscale_refine');
      expect(macro).not.toBeNull();
      expect(macro!.name).toBe('Upscale (simple)');
      expect(macro!.inputs).toHaveLength(1);
      expect(macro!.inputs[0].name).toBe('image');
      expect(macro!.outputs).toHaveLength(1);
    });

    it('returns null for unknown id', () => {
      expect(getMacro('unknown')).toBeNull();
    });
  });

  describe('insertMacro', () => {
    it('clones macro nodes into context with new ids', () => {
      const ctx = createWorkflow();
      const macro = BUILTIN_MACROS.upscale_refine;
      const result = insertMacro(ctx, macro, { image: 'test.png' });
      expect(Object.keys(result.nodeIdMap).length).toBe(4);
      expect(Object.keys(ctx.workflow).length).toBe(4);
      const nodeIds = Object.keys(ctx.workflow);
      nodeIds.forEach((id) => expect(id).toMatch(/^\d+$/));
      const loadImageNode = Object.values(ctx.workflow).find(
        (n) => (n as { class_type: string }).class_type === 'LoadImage'
      );
      expect(loadImageNode).toBeDefined();
      expect((loadImageNode as { inputs: Record<string, unknown> }).inputs.image).toBe('test.png');
    });

    it('remaps internal refs in cloned nodes', () => {
      const ctx = createWorkflow();
      const macro = BUILTIN_MACROS.upscale_refine;
      insertMacro(ctx, macro, { image: 'x.png' });
      const upscaleNode = Object.values(ctx.workflow).find(
        (n) => (n as { class_type: string }).class_type === 'ImageUpscaleWithModel'
      );
      expect(upscaleNode).toBeDefined();
      const inputs = (upscaleNode as { inputs: Record<string, unknown> }).inputs;
      expect(Array.isArray(inputs.image)).toBe(true);
      expect(Array.isArray(inputs.upscale_model)).toBe(true);
    });

    it('returns outputPorts for macro outputs', () => {
      const ctx = createWorkflow();
      const macro = BUILTIN_MACROS.upscale_refine;
      const result = insertMacro(ctx, macro, { image: 'x.png' });
      expect(result.outputPorts.image).toBeDefined();
      expect(Array.isArray(result.outputPorts.image)).toBe(true);
      expect(result.outputPorts.image!.length).toBe(2);
    });
  });

  describe('createMacroFromSelection', () => {
    it('extracts nodes and infers input/output ports', () => {
      const workflow = {
        '1': { class_type: 'LoadImage', inputs: { image: 'x.png' } },
        '2': { class_type: 'SaveImage', inputs: { images: ['1', 0] } },
        '3': { class_type: 'KSampler', inputs: { model: ['1', 0] } },
      };
      const macro = createMacroFromSelection(workflow, ['1', '2'], { id: 'm1', name: 'Load+Save' });
      expect(macro.nodes['1']).toBeDefined();
      expect(macro.nodes['2']).toBeDefined();
      expect(macro.nodes['3']).toBeUndefined();
      expect(macro.outputs).toHaveLength(1);
      expect(macro.outputs[0].nodeId).toBe('1');
      expect(macro.outputs[0].outputIndex).toBe(0);
    });
  });
});
