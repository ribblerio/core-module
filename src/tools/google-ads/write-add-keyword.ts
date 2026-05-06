import { z } from 'zod';
import { registerTool } from '../registry.js';

const Input = z.object({
  adGroupId: z.string(),
  term: z.string().min(1),
  matchType: z.enum(['exact', 'phrase', 'broad']),
  cpcBidMicros: z.number().int().positive(),
});

const Output = z.object({
  ok: z.literal(true),
  simulated: z.boolean(),
  diff: z.object({
    action: z.literal('add_keyword'),
    summary: z.string(),
    payload: z.unknown(),
  }),
});

registerTool({
  name: 'add_keyword',
  description:
    'Add a new keyword to an ad group. Use when a search term is converting well but is matched only by a broad keyword. Catalogue #24.',
  inputSchema: Input,
  outputSchema: Output,
  riskClass: 'medium',
  category: 'keyword',
  catalogueId: 24,
  defaultPermission: 'approve',
  backends: {
    mock: async (input) => ({
      ok: true as const,
      simulated: true,
      diff: {
        action: 'add_keyword' as const,
        summary: `Would add "${input.term}" as ${input.matchType} keyword to ad group ${input.adGroupId} at $${(input.cpcBidMicros / 1_000_000).toFixed(2)} CPC.`,
        payload: input,
      },
    }),
  },
});
