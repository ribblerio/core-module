import { uuid, text, timestamp, primaryKey } from 'drizzle-orm/pg-core';
import { coreSchema, customers } from './customers';

// userId is `text` (not uuid) because Better-Auth generates nanoid-style string IDs
// (e.g. "U14C3eqk4YlurDF406egREHmRomj7VoK"). Cross-schema reference to auth.user.id;
// FK not enforced because core-module doesn't own the auth schema.
export const memberships = coreSchema.table(
  'memberships',
  {
    customerId: uuid('customer_id').notNull().references(() => customers.id, { onDelete: 'cascade' }),
    userId: text('user_id').notNull(),
    role: text('role', { enum: ['admin', 'approver'] }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({ pk: primaryKey({ columns: [t.customerId, t.userId] }) }),
);

export type Membership = typeof memberships.$inferSelect;
export type NewMembership = typeof memberships.$inferInsert;
