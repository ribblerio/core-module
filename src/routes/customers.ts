import { Hono } from 'hono';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';
import { authMiddleware } from '../auth/middleware.js';
import { db } from '../db/client.js';
import { adAccounts, customers, memberships } from '../db/schema/core/index.js';

export const customerRoutes = new Hono().use('*', authMiddleware);

customerRoutes.get('/customers/:id', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  const [m] = await db
    .select()
    .from(memberships)
    .where(and(eq(memberships.customerId, id), eq(memberships.userId, user.userId)));
  if (!m) return c.json({ error: 'forbidden' }, 403);
  const [cust] = await db.select().from(customers).where(eq(customers.id, id));
  return c.json(cust);
});

customerRoutes.get('/customers/:id/ad-accounts', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  const [m] = await db
    .select()
    .from(memberships)
    .where(and(eq(memberships.customerId, id), eq(memberships.userId, user.userId)));
  if (!m) return c.json({ error: 'forbidden' }, 403);
  const rows = await db.select().from(adAccounts).where(eq(adAccounts.customerId, id));
  return c.json({ adAccounts: rows });
});

const ConnectMockBody = z.object({ displayName: z.string().min(1) });

customerRoutes.post('/customers/:id/ad-accounts/connect-mock', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  const body = ConnectMockBody.parse(await c.req.json());
  const [m] = await db
    .select()
    .from(memberships)
    .where(and(eq(memberships.customerId, id), eq(memberships.userId, user.userId)));
  if (!m || m.role !== 'admin') return c.json({ error: 'forbidden' }, 403);

  const [acct] = await db
    .insert(adAccounts)
    .values({
      customerId: id,
      provider: 'google_ads',
      externalId: `mock-${Date.now()}`,
      displayName: body.displayName,
      backend: 'mock',
    })
    .returning();
  return c.json(acct);
});
