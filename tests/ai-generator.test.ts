/**
 * Unit tests for AINodeDescriptionGenerator: buildPrompt, extractJson (no Claude calls).
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { buildPrompt, extractJson } from '../src/node-discovery/ai-generator.js';
import type { RawNodeInfo } from '../src/types/node-types.js';
import type { NodeDescription } from '../src/types/node-types.js';

const FIXTURES = join(__dirname, 'fixtures');
const nodeDescJson = JSON.parse(readFileSync(join(FIXTURES, 'node-description.json'), 'utf8'));

const rawNode: RawNodeInfo = {
  class_name: 'KSampler',
  display_name: 'KSampler',
  category: 'sampling',
  input: {
    required: { model: ['MODEL'], positive: ['CONDITIONING'], latent_image: ['LATENT'] },
    optional: {},
    hidden: {},
  },
  output: ['LATENT'],
  output_name: ['LATENT'],
  source: 'comfyui_api',
};

describe('buildPrompt', () => {
  it('includes raw node JSON in prompt', () => {
    const prompt = buildPrompt(rawNode);
    expect(prompt).toContain('KSampler');
    expect(prompt).toContain('sampling');
    expect(prompt).toContain('MODEL');
    expect(prompt).toContain('CONDITIONING');
  });

  it('uses custom template path when provided', () => {
    const dir = join(tmpdir(), `comfy-test-${Date.now()}`);
    mkdirSync(dir, { recursive: true });
    const templatePath = join(dir, 'node-description-prompt-template.md');
    writeFileSync(templatePath, 'Custom template. {{RAW_NODE_JSON}} end.', 'utf8');
    const prompt = buildPrompt(rawNode, templatePath);
    expect(prompt).toContain('Custom template.');
    expect(prompt).toContain('end.');
  });
});

describe('extractJson', () => {
  it('parses plain JSON string', () => {
    const text = JSON.stringify(nodeDescJson);
    const result = extractJson(text);
    expect(result.display_name).toBe('KSampler');
    expect(result.priority).toBe('high');
    expect(result.return_types).toContain('LATENT');
  });

  it('strips markdown code block and parses', () => {
    const text = '```json\n' + JSON.stringify(nodeDescJson) + '\n```';
    const result = extractJson(text);
    expect(result.display_name).toBe('KSampler');
  });

  it('throws when JSON has no display_name', () => {
    expect(() => extractJson('{"category":"x"}')).toThrow(/display_name/);
  });

  it('throws on invalid JSON', () => {
    expect(() => extractJson('not json')).toThrow();
  });
});
