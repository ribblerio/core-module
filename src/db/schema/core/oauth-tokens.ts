import { uuid, customType, timestamp, text } from 'drizzle-orm/pg-core';
import { coreSchema } from './customers';
import { adAccounts } from './ad-accounts';

const bytea = customType<{ data: Buffer; default: false }>({
  dataType: () => 'bytea',
});

export const oauthTokens = coreSchema.table('oauth_tokens', {
  id: uuid('id').defaultRandom().primaryKey(),
  adAccountId: uuid('ad_account_id').notNull().references(() => adAccounts.id, { onDelete: 'cascade' }),
  accessTokenEnc: bytea('access_token_enc').notNull(),
  refreshTokenEnc: bytea('refresh_token_enc').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  scope: text('scope').notNull(),
  rotatedAt: timestamp('rotated_at', { withTimezone: true }).defaultNow().notNull(),
});

export type OAuthToken = typeof oauthTokens.$inferSelect;
