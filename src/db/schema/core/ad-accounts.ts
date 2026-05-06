import { uuid, text, timestamp, unique } from 'drizzle-orm/pg-core';
import { coreSchema, customers } from './customers';

export const adAccounts = coreSchema.table(
  'ad_accounts',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    customerId: uuid('customer_id').notNull().references(() => customers.id, { onDelete: 'cascade' }),
    provider: text('provider', { enum: ['google_ads'] }).notNull(),
    externalId: text('external_id').notNull(),
    displayName: text('display_name').notNull(),
    backend: text('backend', { enum: ['mock', 'sandbox', 'live'] }).default('mock').notNull(),
    status: text('status', { enum: ['active', 'paused', 'disconnected'] }).default('active').notNull(),
    connectedAt: timestamp('connected_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({ uq: unique().on(t.provider, t.externalId) }),
);

export type AdAccount = typeof adAccounts.$inferSelect;
export type NewAdAccount = typeof adAccounts.$inferInsert;
