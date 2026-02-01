/**
 * MCP server: list_node_types, get_node_info, check_compatibility, suggest_nodes.
 * Loads knowledge/ at startup. Use stdio transport (no console.log — use console.error for logs).
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import type { BaseNodesJson, NodeCompatibilityData, NodeDescription } from './types/node-types.js';

const KNOWLEDGE_DIR = join(process.cwd(), 'knowledge');
const BASE_NODES_PATH = join(KNOWLEDGE_DIR, 'base-nodes.json');
const COMPAT_PATH = join(KNOWLEDGE_DIR, 'node-compatibility.json');

function loadBaseNodes(): BaseNodesJson {
  if (!existsSync(BASE_NODES_PATH)) {
    return { metadata: {}, nodes: {} };
  }
  return JSON.parse(readFileSync(BASE_NODES_PATH, 'utf8')) as BaseNodesJson;
}

function loadCompatibility(): NodeCompatibilityData {
  if (!existsSync(COMPAT_PATH)) {
    return { metadata: {}, data_types: {} };
  }
  return JSON.parse(readFileSync(COMPAT_PATH, 'utf8')) as NodeCompatibilityData;
}

const server = new McpServer(
  { name: 'mcp-comfy-ui-builder', version: '0.1.0' },
  { capabilities: { tools: {} } }
);

server.registerTool(
  'list_node_types',
  {
    description: 'List ComfyUI node types from the knowledge base. Optionally filter by category or priority.',
    inputSchema: {
      category: z.string().optional().describe('Filter by category (e.g. loaders, sampling, image)'),
      priority: z.enum(['high', 'medium', 'low']).optional().describe('Filter by priority'),
    },
  },
  (args) => {
    const base = loadBaseNodes();
    let entries = Object.entries(base.nodes ?? {});
    if (args.category) {
      const c = args.category.toLowerCase();
      entries = entries.filter(([, n]) => (n as NodeDescription).category?.toLowerCase() === c);
    }
    if (args.priority) {
      entries = entries.filter(([, n]) => (n as NodeDescription).priority === args.priority);
    }
    const list = entries.map(([className, n]) => {
      const d = n as NodeDescription;
      return `${className}: ${d.display_name} (${d.category}, ${d.priority})`;
    });
    return { content: [{ type: 'text', text: list.length ? list.join('\n') : 'No nodes match the filter.' }] };
  }
);

server.registerTool(
  'get_node_info',
  {
    description: 'Get full node information for a ComfyUI node by its class name.',
    inputSchema: {
      node_name: z.string().describe('Node class name (e.g. KSampler, CheckpointLoaderSimple)'),
    },
  },
  (args) => {
    const base = loadBaseNodes();
    const node = (base.nodes ?? {})[args.node_name];
    if (!node) {
      return { content: [{ type: 'text', text: `Node "${args.node_name}" not found in knowledge base.` }] };
    }
    return { content: [{ type: 'text', text: JSON.stringify(node, null, 2) }] };
  }
);

server.registerTool(
  'check_compatibility',
  {
    description: 'Check if output of one node can connect to input of another (using node-compatibility.json).',
    inputSchema: {
      from_node: z.string().describe('Source node class name'),
      to_node: z.string().describe('Target node class name'),
    },
  },
  (args) => {
    const base = loadBaseNodes();
    const compat = loadCompatibility();
    const fromDesc = (base.nodes ?? {})[args.from_node] as NodeDescription | undefined;
    const toDesc = (base.nodes ?? {})[args.to_node] as NodeDescription | undefined;
    if (!fromDesc || !toDesc) {
      return {
        content: [
          {
            type: 'text',
            text: `Missing node: ${!fromDesc ? args.from_node : args.to_node} not in knowledge base.`,
          },
        ],
      };
    }
    const outTypes = fromDesc.return_types ?? [];
    const requiredInputs = toDesc.input_types?.required ?? {};
    const toInputTypes = Object.values(requiredInputs).map((v: { type?: string }) => v?.type).filter(Boolean);
    const matches: string[] = [];
    for (const outType of outTypes) {
      const entry = compat.data_types?.[outType];
      const consumers = entry?.consumers ?? [];
      if (toInputTypes.includes(outType) && consumers.includes(args.to_node)) {
        matches.push(`${outType} (${args.from_node} → ${args.to_node})`);
      }
    }
    const text =
      matches.length > 0
        ? `Compatible: ${matches.join('; ')}`
        : `No direct type match found. From node outputs: ${outTypes.join(', ')}. To node consumes: ${toInputTypes.join(', ')}.`;
    return { content: [{ type: 'text', text }] };
  }
);

server.registerTool(
  'suggest_nodes',
  {
    description:
      'Suggest ComfyUI nodes for a task (search by description/use_cases) or by output type they produce.',
    inputSchema: {
      task_description: z.string().optional().describe('Short task description (e.g. "load checkpoint", "decode latent")'),
      input_type: z.string().optional().describe('Output type to match (e.g. MODEL, IMAGE, LATENT)'),
    },
  },
  (args) => {
    const base = loadBaseNodes();
    const nodes = Object.entries(base.nodes ?? {}) as [string, NodeDescription][];
    let filtered = nodes;
    if (args.task_description) {
      const q = args.task_description.toLowerCase();
      filtered = nodes.filter(([, n]) => {
        const desc = (n.description ?? '').toLowerCase();
        const useCases = (n.use_cases ?? []).join(' ').toLowerCase();
        return desc.includes(q) || useCases.includes(q) || (n.display_name ?? '').toLowerCase().includes(q);
      });
    }
    if (args.input_type) {
      const t = args.input_type.toUpperCase();
      filtered = filtered.filter(([, n]) => (n.return_types ?? []).includes(t));
    }
    const list = filtered.slice(0, 20).map(([className, n]) => `${className}: ${n.display_name} — ${n.description?.slice(0, 80)}`);
    return {
      content: [{ type: 'text', text: list.length ? list.join('\n') : 'No matching nodes.' }],
    };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('mcp-comfy-ui-builder MCP server running on stdio');
}

main().catch((err) => {
  console.error('MCP server error:', err);
  process.exit(1);
});
