import { uuid, text, timestamp, jsonb, bigserial, index } from 'drizzle-orm/pg-core';
import { coreSchema } from './customers';

export const auditLog = coreSchema.table(
  'audit_log',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    occurredAt: timestamp('occurred_at', { withTimezone: true }).defaultNow().notNull(),
    actorKind: text('actor_kind', { enum: ['user', 'system', 'agent'] }).notNull(),
    actorId: text('actor_id'),
    customerId: uuid('customer_id'),
    adAccountId: uuid('ad_account_id'),
    proposalId: uuid('proposal_id'),
    eventKind: text('event_kind').notNull(),
    payload: jsonb('payload').default({}).notNull(),
  },
  (t) => ({
    accountTimeIdx: index('audit_account_time_idx').on(t.adAccountId, t.occurredAt),
    proposalIdx: index('audit_proposal_idx').on(t.proposalId),
  }),
);

export type AuditLogEntry = typeof auditLog.$inferSelect;
export type NewAuditLogEntry = typeof auditLog.$inferInsert;
