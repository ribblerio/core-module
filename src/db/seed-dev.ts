import { db } from './client.js';
import { customers, memberships, adAccounts } from './schema/core/index.js';

const DEV_USER_ID = '00000000-0000-0000-0000-000000000001';

async function main() {
  const [customer] = await db
    .insert(customers)
    .values({ kind: 'business', name: 'Acme Plumbing Co', billingEmail: 'lasha@sweenk.com' })
    .returning();
  if (!customer) throw new Error('failed to insert customer');

  await db.insert(memberships).values({
    customerId: customer.id,
    userId: DEV_USER_ID,
    role: 'admin',
  });

  const [acct] = await db
    .insert(adAccounts)
    .values({
      customerId: customer.id,
      provider: 'google_ads',
      externalId: '123-456-7890',
      displayName: 'Acme Plumbing — Google Ads (mock)',
      backend: 'mock',
    })
    .returning();

  console.log(`seeded customer ${customer.id}, membership for user ${DEV_USER_ID}, ad_account ${acct?.id}`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
