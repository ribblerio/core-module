import { uuid, text, timestamp, primaryKey } from 'drizzle-orm/pg-core';
import { coreSchema, customers } from './customers';

export const memberships = coreSchema.table(
  'memberships',
  {
    customerId: uuid('customer_id').notNull().references(() => customers.id, { onDelete: 'cascade' }),
    userId: uuid('user_id').notNull(),
    role: text('role', { enum: ['admin', 'approver'] }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({ pk: primaryKey({ columns: [t.customerId, t.userId] }) }),
);

export type Membership = typeof memberships.$inferSelect;
export type NewMembership = typeof memberships.$inferInsert;
