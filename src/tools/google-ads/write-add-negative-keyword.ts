import { z } from 'zod';
import { registerTool } from '../registry.js';

const Input = z.object({
  campaignId: z.string(),
  term: z.string().min(1),
  matchType: z.enum(['exact', 'phrase', 'broad']),
  scope: z.enum(['campaign', 'adgroup']),
  adGroupId: z.string().optional(),
});

const Output = z.object({
  ok: z.literal(true),
  simulated: z.boolean(),
  diff: z.object({
    action: z.literal('add_negative_keyword'),
    summary: z.string(),
    payload: z.unknown(),
  }),
});

registerTool({
  name: 'add_negative_keyword',
  description:
    'Add a negative keyword to a campaign or ad group. Use when a search term is wasting spend with no conversions. Catalogue #23.',
  inputSchema: Input,
  outputSchema: Output,
  riskClass: 'medium',
  category: 'keyword',
  catalogueId: 23,
  defaultPermission: 'approve',
  backends: {
    mock: async (input) => ({
      ok: true as const,
      simulated: true,
      diff: {
        action: 'add_negative_keyword' as const,
        summary: `Would add "${input.term}" as ${input.matchType} negative on ${input.scope === 'campaign' ? `campaign ${input.campaignId}` : `ad group ${input.adGroupId}`}.`,
        payload: input,
      },
    }),
  },
});
