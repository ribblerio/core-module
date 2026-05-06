import { Hono } from 'hono';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { HTTPException } from 'hono/http-exception';
import { authMiddleware } from '../auth/middleware.js';
import { db } from '../db/client.js';
import { proposals } from '../db/schema/core/index.js';
import { ensureAccountAccess } from '../services/authz.js';
import { executeProposal } from '../services/executor.js';
import { logAudit } from '../services/audit.js';

export const proposalRoutes = new Hono().use('*', authMiddleware);

proposalRoutes.get('/proposals/:id', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  const [p] = await db.select().from(proposals).where(eq(proposals.id, id));
  if (!p) throw new HTTPException(404, { message: 'not found' });
  await ensureAccountAccess(user.userId, p.adAccountId);
  return c.json(p);
});

const ApproveBody = z.object({ note: z.string().optional() });

proposalRoutes.post('/proposals/:id/approve', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  const body = ApproveBody.parse(await c.req.json().catch(() => ({})));

  const [p] = await db.select().from(proposals).where(eq(proposals.id, id));
  if (!p) throw new HTTPException(404, { message: 'not found' });
  await ensureAccountAccess(user.userId, p.adAccountId);
  if (p.status !== 'proposed') {
    throw new HTTPException(409, { message: `cannot approve from status ${p.status}` });
  }

  await db
    .update(proposals)
    .set({
      status: 'approved',
      decidedBy: user.userId,
      decidedAt: new Date(),
      decisionNote: body.note,
    })
    .where(eq(proposals.id, id));

  await logAudit({
    actorKind: 'user',
    actorId: user.userId,
    adAccountId: p.adAccountId,
    proposalId: id,
    eventKind: 'proposal.approved',
    payload: {},
  });

  const executed = await executeProposal(id);
  return c.json(executed);
});

const RejectBody = z.object({ note: z.string().optional() });

proposalRoutes.post('/proposals/:id/reject', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  const body = RejectBody.parse(await c.req.json().catch(() => ({})));

  const [p] = await db.select().from(proposals).where(eq(proposals.id, id));
  if (!p) throw new HTTPException(404, { message: 'not found' });
  await ensureAccountAccess(user.userId, p.adAccountId);
  if (p.status !== 'proposed') {
    throw new HTTPException(409, { message: `cannot reject from status ${p.status}` });
  }

  const [updated] = await db
    .update(proposals)
    .set({
      status: 'rejected',
      decidedBy: user.userId,
      decidedAt: new Date(),
      decisionNote: body.note,
    })
    .where(eq(proposals.id, id))
    .returning();

  await logAudit({
    actorKind: 'user',
    actorId: user.userId,
    adAccountId: p.adAccountId,
    proposalId: id,
    eventKind: 'proposal.rejected',
    payload: {},
  });

  return c.json(updated);
});
