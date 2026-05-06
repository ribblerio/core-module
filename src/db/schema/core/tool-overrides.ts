import { uuid, text, timestamp, primaryKey } from 'drizzle-orm/pg-core';
import { coreSchema } from './customers';
import { adAccounts } from './ad-accounts';

export const toolOverrides = coreSchema.table(
  'tool_overrides',
  {
    adAccountId: uuid('ad_account_id').notNull().references(() => adAccounts.id, { onDelete: 'cascade' }),
    toolName: text('tool_name').notNull(),
    permission: text('permission', { enum: ['allow', 'approve', 'deny'] }),
    backend: text('backend', { enum: ['mock', 'sandbox', 'live'] }),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({ pk: primaryKey({ columns: [t.adAccountId, t.toolName] }) }),
);

export type ToolOverride = typeof toolOverrides.$inferSelect;
export type NewToolOverride = typeof toolOverrides.$inferInsert;
