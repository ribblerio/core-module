import { z } from 'zod';
import { registerTool } from '../registry.js';

const Input = z.object({
  campaignId: z.string(),
  criterionId: z.string(),
  bidModifier: z.number().min(0.1).max(10),
});

const Output = z.object({
  ok: z.literal(true),
  simulated: z.boolean(),
  diff: z.object({
    action: z.literal('set_geo_bid_modifier'),
    summary: z.string(),
    payload: z.unknown(),
  }),
});

registerTool({
  name: 'set_geo_bid_modifier',
  description:
    'Adjust the bid modifier for a location target on a campaign. Use to push more budget to high-CPA locations. Catalogue #44.',
  inputSchema: Input,
  outputSchema: Output,
  riskClass: 'medium',
  category: 'bidding',
  catalogueId: 44,
  defaultPermission: 'approve',
  backends: {
    mock: async (input) => {
      const pct = ((input.bidModifier - 1) * 100).toFixed(0);
      return {
        ok: true as const,
        simulated: true,
        diff: {
          action: 'set_geo_bid_modifier' as const,
          summary: `Would set bid modifier to ${input.bidModifier} (${pct}%) on location ${input.criterionId} for campaign ${input.campaignId}.`,
          payload: input,
        },
      };
    },
  },
});
