/**
 * Unit tests for NodeScanner: findNewNodes (pure), scanLiveInstance and fetchManagerList (mocked fetch).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { findNewNodes, scanLiveInstance, fetchManagerList } from '../src/node-discovery/scanner.js';
import type { RawNodeInfo } from '../src/types/node-types.js';

const FIXTURES = join(__dirname, 'fixtures');
const objectInfoJson = JSON.parse(readFileSync(join(FIXTURES, 'object-info.json'), 'utf8'));

vi.mock('node-fetch', () => ({ default: vi.fn() }));

describe('findNewNodes', () => {
  it('returns only nodes not in existingKeys', () => {
    const liveMap = new Map<string, RawNodeInfo>([
      ['A', { class_name: 'A', input: {}, output: [], output_name: [], source: 'comfyui_api' }],
      ['B', { class_name: 'B', input: {}, output: [], output_name: [], source: 'comfyui_api' }],
      ['C', { class_name: 'C', input: {}, output: [], output_name: [], source: 'comfyui_api' }],
    ]);
    const existing = new Set(['A', 'C']);
    const result = findNewNodes(liveMap, existing);
    expect(result).toHaveLength(1);
    expect(result[0].class_name).toBe('B');
  });

  it('returns empty when all keys exist', () => {
    const liveMap = new Map<string, RawNodeInfo>([
      ['A', { class_name: 'A', input: {}, output: [], output_name: [], source: 'comfyui_api' }],
    ]);
    const result = findNewNodes(liveMap, new Set(['A']));
    expect(result).toHaveLength(0);
  });
});

describe('scanLiveInstance', () => {
  it('parses object_info and returns Map of RawNodeInfo', async () => {
    const fetch = (await import('node-fetch')).default as ReturnType<typeof vi.fn>;
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(objectInfoJson),
    });
    const map = await scanLiveInstance('http://127.0.0.1:8188');
    expect(map.size).toBe(2);
    expect(map.has('KSampler')).toBe(true);
    expect(map.has('CheckpointLoaderSimple')).toBe(true);
    const k = map.get('KSampler')!;
    expect(k.class_name).toBe('KSampler');
    expect(k.display_name).toBe('KSampler');
    expect(k.category).toBe('sampling');
    expect(Array.isArray(k.output)).toBe(true);
  });

  it('throws on non-ok response', async () => {
    const fetch = (await import('node-fetch')).default as ReturnType<typeof vi.fn>;
    fetch.mockResolvedValueOnce({ ok: false, status: 500, statusText: 'Internal Server Error' });
    await expect(scanLiveInstance('http://127.0.0.1:8188')).rejects.toThrow(/object_info failed/);
  });
});

describe('fetchManagerList', () => {
  it('returns parsed custom_node list', async () => {
    const fetch = (await import('node-fetch')).default as ReturnType<typeof vi.fn>;
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          custom_nodes: [
            { title: 'Test Pack', reference: 'https://github.com/a/b', author: 'Author' },
          ],
        }),
    });
    const result = await fetchManagerList();
    expect(result.custom_nodes).toHaveLength(1);
    expect(result.custom_nodes![0].title).toBe('Test Pack');
  });

  it('throws on non-ok response', async () => {
    const fetch = (await import('node-fetch')).default as ReturnType<typeof vi.fn>;
    fetch.mockResolvedValueOnce({ ok: false, status: 404 });
    await expect(fetchManagerList()).rejects.toThrow(/Manager list failed/);
  });
});
