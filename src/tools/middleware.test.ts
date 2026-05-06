import { beforeAll, describe, it, expect } from 'vitest';
import { eq } from 'drizzle-orm';
import { db } from '../db/client.js';
import { customers, memberships, adAccounts, analysisRuns, proposals, toolOverrides } from '../db/schema/core/index.js';
import { invokeToolForAgent } from './middleware.js';
import './google-ads/index.js';
import { resetTestDb } from '../../test/setup-db.js';

describe('invokeToolForAgent', () => {
  let customerId: string;
  let adAccountId: string;
  let runId: string;

  beforeAll(async () => {
    await resetTestDb();

    const [c] = await db.insert(customers).values({ kind: 'business', name: 'Test' }).returning();
    customerId = c!.id;

    await db.insert(memberships).values({ customerId, userId: '00000000-0000-0000-0000-000000000099', role: 'admin' });

    const [a] = await db
      .insert(adAccounts)
      .values({ customerId, provider: 'google_ads', externalId: 'ext-1', displayName: 'T', backend: 'mock' })
      .returning();
    adAccountId = a!.id;

    const [r] = await db
      .insert(analysisRuns)
      .values({ adAccountId, triggeredBy: 'manual:test', status: 'running', model: 'm', promptVersion: 'v0' })
      .returning();
    runId = r!.id;
  });

  it('executes a read tool with default permission=allow', async () => {
    const result = await invokeToolForAgent(
      'read_campaign_overview',
      { campaignId: 'cmp_1', days: 30 },
      { adAccountId, customerId, triggeredBy: `agent:${runId}` },
      { analysisRunId: runId, reasoning: '', evidence: {} },
    );
    expect(result.kind).toBe('executed');
  });

  it('queues a write tool with default permission=approve', async () => {
    const result = await invokeToolForAgent(
      'add_negative_keyword',
      { campaignId: 'cmp_1', term: 'plumber salary', matchType: 'phrase', scope: 'campaign' },
      { adAccountId, customerId, triggeredBy: `agent:${runId}` },
      { analysisRunId: runId, reasoning: 'No conversions over 30 days.', evidence: { conversions: 0 } },
    );
    expect(result.kind).toBe('queued');
    if (result.kind !== 'queued') return;
    const [row] = await db.select().from(proposals).where(eq(proposals.id, result.proposalId));
    expect(row?.type).toBe('add_negative_keyword');
    expect(row?.status).toBe('proposed');
  });

  it('respects a deny override', async () => {
    await db.insert(toolOverrides).values({ adAccountId, toolName: 'add_keyword', permission: 'deny' });
    const result = await invokeToolForAgent(
      'add_keyword',
      { adGroupId: 'ag_1', term: 't', matchType: 'phrase', cpcBidMicros: 1_000_000 },
      { adAccountId, customerId, triggeredBy: `agent:${runId}` },
      { analysisRunId: runId, reasoning: '', evidence: {} },
    );
    expect(result.kind).toBe('denied');
  });
});
