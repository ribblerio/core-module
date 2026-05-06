import { eq, and } from 'drizzle-orm';
import { db } from '../db/client.js';
import { proposals, toolOverrides, adAccounts, type Proposal } from '../db/schema/core/index.js';
import type { Permission, BackendKind } from '../tools/types.js';

export async function resolveEffectivePermission(
  adAccountId: string,
  toolName: string,
  toolDefault: Permission,
): Promise<Permission> {
  const [override] = await db
    .select()
    .from(toolOverrides)
    .where(and(eq(toolOverrides.adAccountId, adAccountId), eq(toolOverrides.toolName, toolName)));
  return (override?.permission as Permission | null) ?? toolDefault;
}

export async function resolveEffectiveBackend(
  adAccountId: string,
  toolName: string,
): Promise<BackendKind> {
  const [override] = await db
    .select()
    .from(toolOverrides)
    .where(and(eq(toolOverrides.adAccountId, adAccountId), eq(toolOverrides.toolName, toolName)));
  if (override?.backend) return override.backend as BackendKind;
  const [account] = await db.select().from(adAccounts).where(eq(adAccounts.id, adAccountId));
  return (account?.backend as BackendKind | undefined) ?? 'mock';
}

export interface QueueProposalArgs {
  analysisRunId: string;
  adAccountId: string;
  toolName: string;
  payload: unknown;
  reasoning: string;
  evidence: unknown;
  confidence?: number;
  riskScore?: number;
}

export async function queueProposal(args: QueueProposalArgs): Promise<Proposal> {
  const [row] = await db
    .insert(proposals)
    .values({
      analysisRunId: args.analysisRunId,
      adAccountId: args.adAccountId,
      type: args.toolName,
      payload: args.payload as object,
      reasoning: args.reasoning,
      evidence: args.evidence as object,
      confidence: args.confidence?.toFixed(2),
      riskScore: args.riskScore?.toFixed(2),
    })
    .returning();
  if (!row) throw new Error('failed to insert proposal');
  return row;
}
