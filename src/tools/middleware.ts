import { getTool } from './registry.js';
import { resolveEffectivePermission, resolveEffectiveBackend, queueProposal } from '../services/proposals.js';
import { logAudit } from '../services/audit.js';
import type { ToolCtx, BackendKind } from './types.js';

export interface AgentInvokeOpts {
  analysisRunId: string;
  reasoning: string;
  evidence: unknown;
  confidence?: number;
}

export type ToolInvokeResult =
  | { kind: 'executed'; result: unknown; backend: BackendKind }
  | { kind: 'queued'; proposalId: string }
  | { kind: 'denied'; reason: string };

export async function invokeToolForAgent(
  toolName: string,
  input: unknown,
  ctx: ToolCtx,
  opts: AgentInvokeOpts,
): Promise<ToolInvokeResult> {
  const tool = getTool(toolName);
  if (!tool) return { kind: 'denied', reason: `unknown tool: ${toolName}` };

  const parsed = tool.inputSchema.safeParse(input);
  if (!parsed.success) {
    return { kind: 'denied', reason: `invalid input: ${parsed.error.message}` };
  }

  const permission = await resolveEffectivePermission(ctx.adAccountId, tool.name, tool.defaultPermission);
  const backend = await resolveEffectiveBackend(ctx.adAccountId, tool.name);

  await logAudit({
    actorKind: 'agent',
    actorId: ctx.triggeredBy,
    adAccountId: ctx.adAccountId,
    eventKind: 'tool.invoked',
    payload: { toolName: tool.name, permission, backend, input: parsed.data },
  });

  if (permission === 'deny') {
    await logAudit({
      actorKind: 'agent',
      actorId: ctx.triggeredBy,
      adAccountId: ctx.adAccountId,
      eventKind: 'tool.denied',
      payload: { toolName: tool.name },
    });
    return { kind: 'denied', reason: 'denied by policy' };
  }

  if (permission === 'allow') {
    const fn = tool.backends[backend];
    if (!fn) return { kind: 'denied', reason: `backend ${backend} not implemented for ${tool.name}` };
    const result = await fn(parsed.data, ctx);
    await logAudit({
      actorKind: 'agent',
      actorId: ctx.triggeredBy,
      adAccountId: ctx.adAccountId,
      eventKind: 'tool.executed',
      payload: { toolName: tool.name, backend },
    });
    return { kind: 'executed', result, backend };
  }

  // permission === 'approve'
  const proposal = await queueProposal({
    analysisRunId: opts.analysisRunId,
    adAccountId: ctx.adAccountId,
    toolName: tool.name,
    payload: parsed.data,
    reasoning: opts.reasoning,
    evidence: opts.evidence,
    confidence: opts.confidence,
  });
  await logAudit({
    actorKind: 'agent',
    actorId: ctx.triggeredBy,
    adAccountId: ctx.adAccountId,
    proposalId: proposal.id,
    eventKind: 'proposal.created',
    payload: { toolName: tool.name },
  });
  return { kind: 'queued', proposalId: proposal.id };
}
