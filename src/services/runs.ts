import { eq } from 'drizzle-orm';
import { db } from '../db/client.js';
import { adAccounts, analysisRuns, type AnalysisRun } from '../db/schema/core/index.js';
import { runAnalyst } from '../agent/analyst.js';
import { ANALYST_V1, ANALYST_PROMPT_VERSION } from '../agent/prompts.js';
import { logAudit } from './audit.js';

const MODEL = 'claude-sonnet-4-6';
const PRICE_INPUT_PER_1M = 3.0;
const PRICE_OUTPUT_PER_1M = 15.0;

export async function startAnalysisRun(
  adAccountId: string,
  triggeredBy: string,
): Promise<AnalysisRun> {
  const [account] = await db.select().from(adAccounts).where(eq(adAccounts.id, adAccountId));
  if (!account) throw new Error(`ad account not found: ${adAccountId}`);

  const [run] = await db
    .insert(analysisRuns)
    .values({
      adAccountId,
      triggeredBy,
      status: 'running',
      model: MODEL,
      promptVersion: ANALYST_PROMPT_VERSION,
    })
    .returning();
  if (!run) throw new Error('failed to create run');

  await logAudit({
    actorKind: 'system',
    actorId: 'runs',
    adAccountId,
    eventKind: 'run.started',
    payload: { runId: run.id, triggeredBy },
  });

  // Fire-and-forget. Tests await via the exported `runAnalysisInline` instead.
  void executeRun(run.id, adAccountId, account.customerId, triggeredBy).catch((e) => {
    console.error(`run ${run.id} failed:`, e);
  });

  return run;
}

/**
 * Synchronous helper for tests — same logic, awaitable.
 */
export async function runAnalysisInline(
  adAccountId: string,
  triggeredBy: string,
): Promise<{ run: AnalysisRun; proposalCount: number }> {
  const [account] = await db.select().from(adAccounts).where(eq(adAccounts.id, adAccountId));
  if (!account) throw new Error(`ad account not found: ${adAccountId}`);

  const [run] = await db
    .insert(analysisRuns)
    .values({
      adAccountId,
      triggeredBy,
      status: 'running',
      model: MODEL,
      promptVersion: ANALYST_PROMPT_VERSION,
    })
    .returning();
  if (!run) throw new Error('failed to create run');

  await executeRun(run.id, adAccountId, account.customerId, triggeredBy);

  const [updated] = await db.select().from(analysisRuns).where(eq(analysisRuns.id, run.id));
  return { run: updated!, proposalCount: 0 };
}

async function executeRun(
  runId: string,
  adAccountId: string,
  customerId: string,
  triggeredBy: string,
): Promise<void> {
  try {
    // Mock account exposes a single campaign with ID 'cmp_1' and ad groups
    // 'ag_1', 'ag_2', 'ag_3'. We pass these explicitly because there is no
    // list_campaigns tool yet (TODO: add when we wire the real Google Ads
    // integration; the agent will discover them via that tool).
    const userMessage =
      `Please analyze ad account ${adAccountId}. The single campaign in this account has ID "cmp_1". ` +
      `Its ad groups are "ag_1", "ag_2", and "ag_3". ` +
      `Start by reading the campaign overview, then read the search terms, geo performance, and keywords for each ad group. ` +
      `Look for negative keyword candidates, new keyword candidates, and geo bid push opportunities. ` +
      `Use the read_* tools to gather evidence, and the propose tools (add_negative_keyword, add_keyword, set_geo_bid_modifier) to surface opportunities to the human approver.`;

    const result = await runAnalyst({
      systemPrompt: ANALYST_V1,
      userMessage,
      ctx: { adAccountId, customerId, triggeredBy: `agent:${runId}` },
      analysisRunId: runId,
    });

    const cost =
      (result.inputTokens / 1_000_000) * PRICE_INPUT_PER_1M +
      (result.outputTokens / 1_000_000) * PRICE_OUTPUT_PER_1M;

    await db
      .update(analysisRuns)
      .set({
        status: 'succeeded',
        trace: result.trace,
        inputTokens: result.inputTokens,
        outputTokens: result.outputTokens,
        costUsd: cost.toFixed(4),
        finishedAt: new Date(),
      })
      .where(eq(analysisRuns.id, runId));

    await logAudit({
      actorKind: 'system',
      actorId: 'runs',
      adAccountId,
      eventKind: 'run.succeeded',
      payload: { runId, proposalCount: result.proposalIds.length, costUsd: cost },
    });
  } catch (err) {
    await db
      .update(analysisRuns)
      .set({
        status: 'failed',
        error: err instanceof Error ? err.message : String(err),
        finishedAt: new Date(),
      })
      .where(eq(analysisRuns.id, runId));

    await logAudit({
      actorKind: 'system',
      actorId: 'runs',
      adAccountId,
      eventKind: 'run.failed',
      payload: { runId, error: err instanceof Error ? err.message : String(err) },
    });
  }
}
