import type { ToolDefinition } from './types.js';

const tools = new Map<string, ToolDefinition>();

export function registerTool<I, O>(tool: ToolDefinition<I, O>): void {
  if (tools.has(tool.name)) throw new Error(`tool already registered: ${tool.name}`);
  tools.set(tool.name, tool as ToolDefinition);
}

export function getTool(name: string): ToolDefinition | undefined {
  return tools.get(name);
}

export function listTools(): ToolDefinition[] {
  return [...tools.values()];
}

export function listToolsByCategory(): Record<string, ToolDefinition[]> {
  const out: Record<string, ToolDefinition[]> = {};
  for (const tool of tools.values()) {
    (out[tool.category] ??= []).push(tool);
  }
  return out;
}
