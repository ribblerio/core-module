import { z } from 'zod';
import { registerTool } from '../registry.js';
import { acmeKeywords } from '../../backends/mock/fixtures/index.js';

const Input = z.object({ adGroupId: z.string() });

const Row = z.object({
  id: z.string(),
  text: z.string(),
  matchType: z.enum(['exact', 'phrase', 'broad']),
  cpcBidMicros: z.number(),
  impressions: z.number(),
  clicks: z.number(),
  conversions: z.number(),
  qualityScore: z.number(),
});

const Output = z.object({ rows: z.array(Row) });

registerTool({
  name: 'read_keywords',
  description: 'List active keywords in an ad group with bids and metrics.',
  inputSchema: Input,
  outputSchema: Output,
  riskClass: 'read',
  category: 'keyword',
  defaultPermission: 'allow',
  backends: {
    mock: async ({ adGroupId }) => ({
      rows: acmeKeywords
        .filter((k) => k.adGroupId === adGroupId)
        .map(({ id, text, matchType, cpcBidMicros, impressions, clicks, conversions, qualityScore }) => ({
          id, text, matchType, cpcBidMicros, impressions, clicks, conversions, qualityScore,
        })),
    }),
  },
});
