import { eq, and } from 'drizzle-orm';
import { HTTPException } from 'hono/http-exception';
import { db } from '../db/client.js';
import { adAccounts, memberships } from '../db/schema/core/index.js';

export async function ensureAccountAccess(userId: string, adAccountId: string): Promise<void> {
  const [account] = await db.select().from(adAccounts).where(eq(adAccounts.id, adAccountId));
  if (!account) throw new HTTPException(404, { message: 'ad account not found' });

  const [m] = await db
    .select()
    .from(memberships)
    .where(and(eq(memberships.customerId, account.customerId), eq(memberships.userId, userId)));

  if (!m) throw new HTTPException(403, { message: 'no membership on owning customer' });
}
