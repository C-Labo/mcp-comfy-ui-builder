/**
 * Unit tests for workflow-template (createTemplate, applyTemplate, validateTemplateParams).
 */
import { describe, it, expect } from 'vitest';
import {
  createTemplate,
  applyTemplate,
  validateTemplateParams,
  type ParameterDefinition,
  type WorkflowTemplate,
} from '../src/workflow/workflow-template.js';

const sampleWorkflow = {
  '1': { class_type: 'CheckpointLoaderSimple', inputs: { ckpt_name: 'default.safetensors' } },
  '2': { class_type: 'CLIPTextEncode', inputs: { text: 'a cat', clip: ['1', 1] } },
};

describe('workflow-template', () => {
  describe('createTemplate', () => {
    it('creates template with id, name, parameters, workflow', () => {
      const params: ParameterDefinition[] = [
        {
          name: 'prompt',
          type: 'string',
          required: true,
          nodeBindings: [{ nodeId: '2', inputName: 'text' }],
        },
      ];
      const template = createTemplate(sampleWorkflow, params, { name: 'My template' });
      expect(template.id).toMatch(/^tpl_/);
      expect(template.name).toBe('My template');
      expect(template.parameters).toHaveLength(1);
      expect(template.parameters[0].name).toBe('prompt');
      expect(template.workflow).toBe(sampleWorkflow);
    });
  });

  describe('applyTemplate', () => {
    it('returns cloned workflow with bound values set', () => {
      const params: ParameterDefinition[] = [
        {
          name: 'prompt',
          type: 'string',
          required: true,
          nodeBindings: [{ nodeId: '2', inputName: 'text' }],
        },
      ];
      const template = createTemplate(sampleWorkflow, params);
      const workflow = applyTemplate(template, { prompt: 'a dog' });
      expect(workflow).not.toBe(sampleWorkflow);
      expect(workflow['2'].inputs.text).toBe('a dog');
      expect(workflow['1'].inputs.ckpt_name).toBe('default.safetensors');
    });

    it('uses default when value not provided', () => {
      const params: ParameterDefinition[] = [
        {
          name: 'prompt',
          type: 'string',
          required: false,
          default: 'default prompt',
          nodeBindings: [{ nodeId: '2', inputName: 'text' }],
        },
      ];
      const template = createTemplate(sampleWorkflow, params);
      const workflow = applyTemplate(template, {});
      expect(workflow['2'].inputs.text).toBe('default prompt');
    });
  });

  describe('validateTemplateParams', () => {
    it('returns valid when required params present and types match', () => {
      const template: WorkflowTemplate = {
        id: 't1',
        name: 'T',
        description: '',
        category: 'custom',
        parameters: [
          { name: 'x', type: 'string', required: true, nodeBindings: [] },
          { name: 'y', type: 'number', required: false, nodeBindings: [] },
        ],
        workflow: {},
      };
      const result = validateTemplateParams(template, { x: 'hello', y: 42 });
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('returns invalid when required param missing', () => {
      const template: WorkflowTemplate = {
        id: 't1',
        name: 'T',
        description: '',
        category: 'custom',
        parameters: [{ name: 'x', type: 'string', required: true, nodeBindings: [] }],
        workflow: {},
      };
      const result = validateTemplateParams(template, {});
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing required parameter: x');
    });

    it('returns invalid when type mismatch', () => {
      const template: WorkflowTemplate = {
        id: 't1',
        name: 'T',
        description: '',
        category: 'custom',
        parameters: [{ name: 'x', type: 'number', required: true, nodeBindings: [] }],
        workflow: {},
      };
      const result = validateTemplateParams(template, { x: 'not a number' });
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('must be a number'))).toBe(true);
    });
  });
});
