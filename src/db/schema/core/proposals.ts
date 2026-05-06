import { uuid, text, timestamp, jsonb, numeric, index } from 'drizzle-orm/pg-core';
import { coreSchema } from './customers';
import { adAccounts } from './ad-accounts';
import { analysisRuns } from './analysis-runs';

export const proposalStatus = ['proposed', 'approved', 'rejected', 'executing', 'executed', 'failed'] as const;
export type ProposalStatus = (typeof proposalStatus)[number];

export const proposals = coreSchema.table(
  'proposals',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    analysisRunId: uuid('analysis_run_id').notNull().references(() => analysisRuns.id, { onDelete: 'cascade' }),
    adAccountId: uuid('ad_account_id').notNull().references(() => adAccounts.id, { onDelete: 'cascade' }),
    type: text('type').notNull(),
    toolVersion: text('tool_version').default('v1').notNull(),
    payload: jsonb('payload').notNull(),
    reasoning: text('reasoning').notNull(),
    evidence: jsonb('evidence').notNull(),
    confidence: numeric('confidence', { precision: 3, scale: 2 }),
    riskScore: numeric('risk_score', { precision: 3, scale: 2 }),
    status: text('status', { enum: proposalStatus }).default('proposed').notNull(),
    backendAtDecision: text('backend_at_decision', { enum: ['mock', 'sandbox', 'live'] }),
    decidedBy: text('decided_by'),
    decidedAt: timestamp('decided_at', { withTimezone: true }),
    decisionNote: text('decision_note'),
    executedAt: timestamp('executed_at', { withTimezone: true }),
    executionResult: jsonb('execution_result'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    accountStatusIdx: index('proposals_account_status_idx').on(t.adAccountId, t.status, t.createdAt),
    statusIdx: index('proposals_status_idx').on(t.status),
  }),
);

export type Proposal = typeof proposals.$inferSelect;
export type NewProposal = typeof proposals.$inferInsert;
