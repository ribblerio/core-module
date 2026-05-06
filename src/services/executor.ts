import { eq } from 'drizzle-orm';
import { db } from '../db/client.js';
import { proposals, type Proposal } from '../db/schema/core/index.js';
import { getTool } from '../tools/registry.js';
import { resolveEffectiveBackend } from './proposals.js';
import { logAudit } from './audit.js';

export async function executeProposal(proposalId: string): Promise<Proposal> {
  const [proposal] = await db.select().from(proposals).where(eq(proposals.id, proposalId));
  if (!proposal) throw new Error(`proposal not found: ${proposalId}`);
  if (proposal.status !== 'approved') {
    throw new Error(`proposal not approved (status: ${proposal.status})`);
  }

  const tool = getTool(proposal.type);
  if (!tool) throw new Error(`unknown tool: ${proposal.type}`);

  const backend = await resolveEffectiveBackend(proposal.adAccountId, proposal.type);
  const fn = tool.backends[backend];
  if (!fn) throw new Error(`backend ${backend} not implemented for ${proposal.type}`);

  await db.update(proposals).set({ status: 'executing' }).where(eq(proposals.id, proposalId));

  try {
    const result = await fn(proposal.payload, {
      adAccountId: proposal.adAccountId,
      customerId: '',
      triggeredBy: 'executor',
    });

    const [updated] = await db
      .update(proposals)
      .set({
        status: 'executed',
        backendAtDecision: backend,
        executedAt: new Date(),
        executionResult: result as object,
      })
      .where(eq(proposals.id, proposalId))
      .returning();

    await logAudit({
      actorKind: 'system',
      actorId: 'executor',
      adAccountId: proposal.adAccountId,
      proposalId,
      eventKind: 'proposal.executed',
      payload: { backend },
    });

    return updated!;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const [updated] = await db
      .update(proposals)
      .set({ status: 'failed', executionResult: { error: msg } })
      .where(eq(proposals.id, proposalId))
      .returning();

    await logAudit({
      actorKind: 'system',
      actorId: 'executor',
      adAccountId: proposal.adAccountId,
      proposalId,
      eventKind: 'proposal.execution_failed',
      payload: { error: msg },
    });
    return updated!;
  }
}
