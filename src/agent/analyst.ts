import Anthropic from '@anthropic-ai/sdk';
import { listTools } from '../tools/registry.js';
import { invokeToolForAgent, type ToolInvokeResult } from '../tools/middleware.js';
import { zodToAnthropicTool } from './zod-to-anthropic.js';
import { env } from '../config/env.js';
import type { ToolCtx } from '../tools/types.js';

const MODEL = 'claude-sonnet-4-6';
const MAX_ITERATIONS = 12;

export interface AnalystResult {
  trace: unknown[];
  inputTokens: number;
  outputTokens: number;
  proposalIds: string[];
}

export interface AnalystArgs {
  systemPrompt: string;
  userMessage: string;
  ctx: ToolCtx;
  analysisRunId: string;
}

export async function runAnalyst(args: AnalystArgs): Promise<AnalystResult> {
  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  const tools = listTools().map((t) => zodToAnthropicTool(t.name, t.description, t.inputSchema));

  const messages: Anthropic.MessageParam[] = [{ role: 'user', content: args.userMessage }];
  const trace: unknown[] = [];
  const proposalIds: string[] = [];
  let inputTokens = 0;
  let outputTokens = 0;

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 4000,
      system: args.systemPrompt,
      tools,
      messages,
    });

    trace.push({ kind: 'response', response });
    inputTokens += response.usage.input_tokens;
    outputTokens += response.usage.output_tokens;

    if (response.stop_reason === 'end_turn') break;
    if (response.stop_reason !== 'tool_use') {
      throw new Error(`unexpected stop_reason: ${response.stop_reason}`);
    }

    const toolUseBlocks = response.content.filter(
      (b): b is Anthropic.ToolUseBlock => b.type === 'tool_use',
    );

    const toolResults: Anthropic.ToolResultBlockParam[] = [];
    for (const call of toolUseBlocks) {
      const reasoning = response.content
        .filter((b): b is Anthropic.TextBlock => b.type === 'text')
        .map((b) => b.text)
        .join('\n')
        .trim() || 'no reasoning provided';

      const result: ToolInvokeResult = await invokeToolForAgent(
        call.name,
        call.input,
        args.ctx,
        {
          analysisRunId: args.analysisRunId,
          reasoning,
          evidence: { toolUseId: call.id, input: call.input },
        },
      );

      trace.push({ kind: 'tool_call', call, result });

      if (result.kind === 'queued') proposalIds.push(result.proposalId);

      toolResults.push({
        type: 'tool_result',
        tool_use_id: call.id,
        content: JSON.stringify(
          result.kind === 'executed'
            ? { ok: true, ...((result.result as object) ?? {}) }
            : result.kind === 'queued'
              ? { ok: true, status: 'queued', proposalId: result.proposalId }
              : { ok: false, error: result.reason },
        ),
      });
    }

    messages.push({ role: 'assistant', content: response.content });
    messages.push({ role: 'user', content: toolResults });
  }

  return { trace, inputTokens, outputTokens, proposalIds };
}
