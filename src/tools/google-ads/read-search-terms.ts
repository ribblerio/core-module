import { z } from 'zod';
import { registerTool } from '../registry.js';
import { acmeSearchTerms } from '../../backends/mock/fixtures/index.js';

const Input = z.object({
  campaignId: z.string(),
  days: z.number().int().min(1).max(90).default(30),
  minImpressions: z.number().int().min(0).default(0),
});

const Row = z.object({
  id: z.string(),
  text: z.string(),
  adGroupId: z.string(),
  matchedKeywordId: z.string(),
  impressions: z.number(),
  clicks: z.number(),
  cost: z.number(),
  conversions: z.number(),
});

const Output = z.object({ rows: z.array(Row) });

registerTool({
  name: 'read_search_terms',
  description: 'List search query report rows for a campaign — what people actually searched.',
  inputSchema: Input,
  outputSchema: Output,
  riskClass: 'read',
  category: 'keyword',
  defaultPermission: 'allow',
  backends: {
    mock: async ({ campaignId, minImpressions }) => ({
      rows: acmeSearchTerms
        .filter((s) => s.campaignId === campaignId && s.impressions >= (minImpressions ?? 0))
        .map(({ id, text, adGroupId, matchedKeywordId, impressions, clicks, cost, conversions }) => ({
          id, text, adGroupId, matchedKeywordId, impressions, clicks, cost, conversions,
        })),
    }),
  },
});
