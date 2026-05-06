import { uuid, text, timestamp, integer, jsonb, numeric } from 'drizzle-orm/pg-core';
import { coreSchema } from './customers';
import { adAccounts } from './ad-accounts';

export const analysisRuns = coreSchema.table('analysis_runs', {
  id: uuid('id').defaultRandom().primaryKey(),
  adAccountId: uuid('ad_account_id').notNull().references(() => adAccounts.id, { onDelete: 'cascade' }),
  triggeredBy: text('triggered_by').notNull(),
  status: text('status', { enum: ['running', 'succeeded', 'failed'] }).notNull(),
  model: text('model').notNull(),
  promptVersion: text('prompt_version').notNull(),
  trace: jsonb('trace').default([]).notNull(),
  inputTokens: integer('input_tokens'),
  outputTokens: integer('output_tokens'),
  costUsd: numeric('cost_usd', { precision: 10, scale: 4 }),
  error: text('error'),
  startedAt: timestamp('started_at', { withTimezone: true }).defaultNow().notNull(),
  finishedAt: timestamp('finished_at', { withTimezone: true }),
});

export type AnalysisRun = typeof analysisRuns.$inferSelect;
export type NewAnalysisRun = typeof analysisRuns.$inferInsert;
