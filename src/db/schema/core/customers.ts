import { pgSchema, uuid, text, timestamp } from 'drizzle-orm/pg-core';

export const coreSchema = pgSchema('core');

export const customers = coreSchema.table('customers', {
  id: uuid('id').defaultRandom().primaryKey(),
  kind: text('kind', { enum: ['individual', 'business'] }).notNull(),
  name: text('name').notNull(),
  billingEmail: text('billing_email'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export type Customer = typeof customers.$inferSelect;
export type NewCustomer = typeof customers.$inferInsert;
