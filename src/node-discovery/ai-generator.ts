/**
 * AINodeDescriptionGenerator: build prompt from template, call Claude, parse NodeDescription.
 * See doc/node-discovery-system.md and knowledge/node-description-prompt-template.md.
 */

import Anthropic from '@anthropic-ai/sdk';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { RawNodeInfo, NodeDescription } from '../types/node-types.js';

const PROMPT_TEMPLATE_PLACEHOLDER = '{{RAW_NODE_JSON}}';

/**
 * Resolve knowledge dir: prefer process.cwd()/knowledge, fallback to template path.
 */
function getKnowledgePath(): string {
  const cwd = process.cwd();
  return join(cwd, 'knowledge');
}

/**
 * Build prompt for Claude: load template and substitute raw node JSON.
 */
export function buildPrompt(rawNode: RawNodeInfo, templatePath?: string): string {
  const knowledgeDir = templatePath ? join(templatePath, '..') : getKnowledgePath();
  const templateFile = join(knowledgeDir, 'node-description-prompt-template.md');
  let template: string;
  try {
    template = readFileSync(templateFile, 'utf8');
  } catch {
    template = `Ти експерт по ComfyUI. Надай структурований опис ноди у вигляді JSON.

**Сирий вивід ноди з ComfyUI /object_info:**

${PROMPT_TEMPLATE_PLACEHOLDER}

**Вимоги до JSON:** display_name, category, description, input_types.required, return_types, return_names, output_colors, use_cases, compatible_outputs, example_values, priority ("high"|"medium"|"low"). Поверни тільки один JSON-об'єкт.`;
  }

  const rawJson = JSON.stringify(toComfyStyleRaw(rawNode), null, 2);
  return template.replace(PROMPT_TEMPLATE_PLACEHOLDER, rawJson);
}

/** Convert RawNodeInfo to ComfyUI-like shape for the prompt (input.required etc). */
function toComfyStyleRaw(raw: RawNodeInfo): Record<string, unknown> {
  const input = raw.input as { required?: Record<string, unknown>; optional?: Record<string, unknown>; hidden?: Record<string, unknown> };
  return {
    name: raw.class_name,
    display_name: raw.display_name,
    category: raw.category,
    description: raw.description,
    input: {
      required: input?.required ?? {},
      optional: input?.optional ?? {},
      hidden: input?.hidden ?? {},
    },
    output: raw.output,
    output_name: raw.output_name,
  };
}

/**
 * Extract JSON object from Claude response (strip markdown code block if present).
 */
export function extractJson(text: string): NodeDescription {
  let cleaned = text.trim();
  const codeBlock = /^```(?:json)?\s*([\s\S]*?)```\s*$/m.exec(cleaned);
  if (codeBlock) {
    cleaned = codeBlock[1].trim();
  }
  const parsed = JSON.parse(cleaned) as unknown;
  if (!parsed || typeof parsed !== 'object' || !('display_name' in parsed)) {
    throw new Error('Invalid NodeDescription: missing display_name');
  }
  return parsed as NodeDescription;
}

/**
 * Call Claude to generate one NodeDescription from RawNodeInfo.
 */
export async function generateDescription(
  rawNode: RawNodeInfo,
  options: { apiKey?: string; model?: string } = {}
): Promise<NodeDescription> {
  const apiKey = options.apiKey ?? process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is required for generateDescription');
  }
  const client = new Anthropic({ apiKey });
  const prompt = buildPrompt(rawNode);
  const msg = await client.messages.create({
    model: options.model ?? 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }],
  });
  const content = msg.content.find((c): c is { type: 'text'; text: string } => c.type === 'text');
  if (!content?.text) {
    throw new Error('Claude returned no text');
  }
  return extractJson(content.text);
}

/**
 * Generate descriptions for multiple nodes with rate limiting (delay between calls).
 */
export async function generateBatch(
  nodes: RawNodeInfo[],
  options: {
    batchSize?: number;
    delayMs?: number;
    apiKey?: string;
    model?: string;
  } = {}
): Promise<Map<string, NodeDescription>> {
  const batchSize = options.batchSize ?? (Number(process.env.NODE_BATCH_SIZE) || 5);
  const delayMs = options.delayMs ?? 1000;
  const results = new Map<string, NodeDescription>();

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    try {
      const desc = await generateDescription(node, { apiKey: options.apiKey, model: options.model });
      results.set(node.class_name, desc);
    } catch (e) {
      console.error(`[ai] generateDescription(${node.class_name}) failed:`, e);
    }
    // Rate limit: delay after each call to reduce 429 from Claude; extra delay every batchSize
    if (i < nodes.length - 1) {
      await new Promise((r) => setTimeout(r, delayMs));
      if ((i + 1) % batchSize === 0) {
        await new Promise((r) => setTimeout(r, delayMs));
      }
    }
  }

  return results;
}
