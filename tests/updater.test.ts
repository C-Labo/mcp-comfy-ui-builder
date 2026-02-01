/**
 * Unit tests for KnowledgeBaseUpdater: addNode, updateCompatibility, generateChangelog.
 * Uses a temp directory so production knowledge/ is not modified.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, readFileSync, existsSync, rmSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { addNode, updateCompatibility, generateChangelog } from '../src/node-discovery/updater.js';
import type { NodeDescription } from '../src/types/node-types.js';

let tempDir: string;
const originalCwd = process.cwd();

const sampleDesc: NodeDescription = {
  display_name: 'TestNode',
  category: 'test',
  description: 'Test node for unit test',
  input_types: { required: {} },
  return_types: ['OUTPUT_TYPE'],
  return_names: ['OUTPUT_TYPE'],
  output_colors: ['#000'],
  use_cases: ['Testing'],
  compatible_outputs: { OUTPUT_TYPE: ['ConsumerNode'] },
  example_values: {},
  priority: 'medium',
};

describe('KnowledgeBaseUpdater', () => {
  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'comfy-updater-'));
    process.chdir(tempDir);
    mkdirSync(join(tempDir, 'knowledge'), { recursive: true });
  });

  afterEach(() => {
    process.chdir(originalCwd);
    rmSync(tempDir, { recursive: true, force: true });
  });

  it('addNode creates base-nodes.json when missing', () => {
    expect(existsSync(join(tempDir, 'knowledge', 'base-nodes.json'))).toBe(false);
    addNode('TestNode', sampleDesc);
    const knowledgeDir = join(tempDir, 'knowledge');
    expect(existsSync(join(knowledgeDir, 'base-nodes.json'))).toBe(true);
    const data = JSON.parse(readFileSync(join(knowledgeDir, 'base-nodes.json'), 'utf8'));
    expect(data.nodes.TestNode).toBeDefined();
    expect(data.nodes.TestNode.display_name).toBe('TestNode');
    expect(data.metadata.total_nodes).toBe(1);
  });

  it('addNode appends to existing base-nodes.json', () => {
    const knowledgeDir = join(tempDir, 'knowledge');
    const basePath = join(knowledgeDir, 'base-nodes.json');
    const initial = {
      metadata: { version: '1.0.0', last_updated: '2026-01-01', total_nodes: 1 },
      nodes: { ExistingNode: { ...sampleDesc, display_name: 'Existing' } },
    };
    writeFileSync(basePath, JSON.stringify(initial, null, 2), 'utf8');
    addNode('NewNode', { ...sampleDesc, display_name: 'NewNode' });
    const data = JSON.parse(readFileSync(basePath, 'utf8'));
    expect(data.nodes.ExistingNode).toBeDefined();
    expect(data.nodes.NewNode).toBeDefined();
    expect(data.metadata.total_nodes).toBe(2);
  });

  it('updateCompatibility creates node-compatibility.json when missing', () => {
    addNode('ProducerNode', sampleDesc);
    updateCompatibility('ProducerNode', sampleDesc);
    const compatPath = join(tempDir, 'knowledge', 'node-compatibility.json');
    expect(existsSync(compatPath)).toBe(true);
    const data = JSON.parse(readFileSync(compatPath, 'utf8'));
    expect(data.data_types.OUTPUT_TYPE).toBeDefined();
    expect(data.data_types.OUTPUT_TYPE.producers).toContain('ProducerNode');
    expect(data.data_types.OUTPUT_TYPE.consumers).toContain('ConsumerNode');
  });

  it('generateChangelog appends to CHANGELOG.md', () => {
    const knowledgeDir = join(tempDir, 'knowledge');
    const changelogPath = join(knowledgeDir, 'CHANGELOG.md');
    writeFileSync(changelogPath, '# Changelog\n', 'utf8');
    generateChangelog([{ className: 'NewNode', description: sampleDesc }]);
    const content = readFileSync(changelogPath, 'utf8');
    expect(content).toContain('# Changelog');
    expect(content).toContain('NewNode');
    expect(content).toContain('TestNode');
  });

  it('generateChangelog does nothing for empty array', () => {
    const knowledgeDir = join(tempDir, 'knowledge');
    const changelogPath = join(knowledgeDir, 'CHANGELOG.md');
    writeFileSync(changelogPath, '# Changelog\n', 'utf8');
    generateChangelog([]);
    const content = readFileSync(changelogPath, 'utf8');
    expect(content).toBe('# Changelog\n');
  });
});
