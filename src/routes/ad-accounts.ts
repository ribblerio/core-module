import { Hono } from 'hono';
import { and, desc, eq, sql } from 'drizzle-orm';
import { getTool } from '../tools/registry.js';
import { authMiddleware } from '../auth/middleware.js';
import { ensureAccountAccess } from '../services/authz.js';
import { startAnalysisRun } from '../services/runs.js';
import { db } from '../db/client.js';
import {
  analysisRuns,
  auditLog,
  proposals,
  proposalStatus,
} from '../db/schema/core/index.js';

export const adAccountRoutes = new Hono().use('*', authMiddleware);

async function callReadTool<T>(toolName: string, input: unknown, adAccountId: string): Promise<T> {
  const tool = getTool(toolName);
  if (!tool) throw new Error(`unknown tool: ${toolName}`);
  const parsed = tool.inputSchema.parse(input);
  const fn = tool.backends.mock;
  if (!fn) throw new Error(`mock backend missing for ${toolName}`);
  return (await fn(parsed, { adAccountId, customerId: '', triggeredBy: 'user:browse' })) as T;
}

adAccountRoutes.get('/ad-accounts/:id/campaigns', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  await ensureAccountAccess(user.userId, id);
  const overview = await callReadTool('read_campaign_overview', { campaignId: 'cmp_1', days: 30 }, id);
  return c.json({ campaigns: [overview] });
});

adAccountRoutes.get('/ad-accounts/:id/campaigns/:cid', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  const cid = c.req.param('cid');
  await ensureAccountAccess(user.userId, id);
  const overview = await callReadTool('read_campaign_overview', { campaignId: cid, days: 30 }, id);
  return c.json(overview);
});

adAccountRoutes.get('/ad-accounts/:id/campaigns/:cid/search-terms', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  const cid = c.req.param('cid');
  await ensureAccountAccess(user.userId, id);
  const data = await callReadTool('read_search_terms', { campaignId: cid, days: 30, minImpressions: 0 }, id);
  return c.json(data);
});

adAccountRoutes.get('/ad-accounts/:id/campaigns/:cid/locations', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  const cid = c.req.param('cid');
  await ensureAccountAccess(user.userId, id);
  const data = await callReadTool('read_geo_performance', { campaignId: cid, days: 30 }, id);
  return c.json(data);
});

adAccountRoutes.get('/ad-accounts/:id/ad-groups/:agid/keywords', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  const agid = c.req.param('agid');
  await ensureAccountAccess(user.userId, id);
  const data = await callReadTool('read_keywords', { adGroupId: agid }, id);
  return c.json(data);
});

adAccountRoutes.post('/ad-accounts/:id/run-analysis', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  await ensureAccountAccess(user.userId, id);
  const run = await startAnalysisRun(id, `manual:${user.userId}`);
  return c.json({ runId: run.id, status: run.status });
});

adAccountRoutes.get('/ad-accounts/:id/proposals', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  await ensureAccountAccess(user.userId, id);

  const status = c.req.query('status');
  const category = c.req.query('category');

  const where = [eq(proposals.adAccountId, id)];
  if (status && (proposalStatus as readonly string[]).includes(status)) {
    where.push(eq(proposals.status, status as (typeof proposalStatus)[number]));
  }

  let rows = await db.select().from(proposals).where(and(...where)).orderBy(desc(proposals.createdAt));

  if (category) {
    rows = rows.filter((r) => getTool(r.type)?.category === category);
  }

  return c.json({ proposals: rows });
});

adAccountRoutes.get('/ad-accounts/:id/activity', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  await ensureAccountAccess(user.userId, id);

  const limit = Math.min(Number(c.req.query('limit') ?? 100), 500);
  const rows = await db
    .select()
    .from(auditLog)
    .where(eq(auditLog.adAccountId, id))
    .orderBy(desc(auditLog.occurredAt))
    .limit(limit);

  return c.json({ events: rows });
});

adAccountRoutes.get('/ad-accounts/:id/runs', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  await ensureAccountAccess(user.userId, id);
  const rows = await db
    .select()
    .from(analysisRuns)
    .where(eq(analysisRuns.adAccountId, id))
    .orderBy(desc(analysisRuns.startedAt))
    .limit(50);
  return c.json({ runs: rows });
});

adAccountRoutes.get('/ad-accounts/:id/dashboard', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  await ensureAccountAccess(user.userId, id);

  const [pendingCount] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(proposals)
    .where(and(eq(proposals.adAccountId, id), eq(proposals.status, 'proposed')));

  const overview = await callReadTool('read_campaign_overview', { campaignId: 'cmp_1', days: 30 }, id);

  return c.json({
    pendingProposals: pendingCount?.n ?? 0,
    headlineCampaign: overview,
  });
});
