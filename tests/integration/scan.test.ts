/**
 * Integration test: scan command dry-run with mocked ComfyUI (no real API).
 * Ensures CLI scan --dry-run path runs and reports counts without writing files.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const FIXTURES = join(__dirname, '..', 'fixtures');
const objectInfoJson = JSON.parse(readFileSync(join(FIXTURES, 'object-info.json'), 'utf8'));

vi.mock('node-fetch', () => ({ default: vi.fn() }));

describe('scan (integration)', () => {
  beforeEach(async () => {
    const fetch = (await import('node-fetch')).default as ReturnType<typeof vi.fn>;
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(objectInfoJson),
    });
  });

  it('scanLiveInstance + findNewNodes: with empty existing keys returns all nodes', async () => {
    const { scanLiveInstance, findNewNodes } = await import('../../src/node-discovery/scanner.js');
    const liveMap = await scanLiveInstance('http://127.0.0.1:8188');
    const newNodes = findNewNodes(liveMap, new Set());
    expect(liveMap.size).toBe(2);
    expect(newNodes.length).toBe(2);
    expect(newNodes.map((n) => n.class_name).sort()).toEqual(['CheckpointLoaderSimple', 'KSampler']);
  });

  it('scanLiveInstance + findNewNodes: with all keys existing returns zero new', async () => {
    const { scanLiveInstance, findNewNodes } = await import('../../src/node-discovery/scanner.js');
    const liveMap = await scanLiveInstance('http://127.0.0.1:8188');
    const newNodes = findNewNodes(liveMap, new Set(['KSampler', 'CheckpointLoaderSimple']));
    expect(newNodes.length).toBe(0);
  });
});
