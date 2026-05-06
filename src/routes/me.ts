import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { db } from '../db/client.js';
import { memberships } from '../db/schema/core/index.js';
import { authMiddleware } from '../auth/middleware.js';

export const meRoutes = new Hono().use('*', authMiddleware);

meRoutes.get('/me', async (c) => {
  const user = c.get('user');
  const rows = await db.select().from(memberships).where(eq(memberships.userId, user.userId));
  return c.json({
    user: { id: user.userId, email: user.email, role: user.role },
    memberships: rows.map((m) => ({ customerId: m.customerId, role: m.role })),
  });
});
