import { z } from 'zod';
import { registerTool } from '../registry.js';
import { acmeGeo } from '../../backends/mock/fixtures/index.js';

const Input = z.object({ campaignId: z.string(), days: z.number().int().min(1).max(90).default(30) });

const Row = z.object({
  criterionId: z.string(),
  locationName: z.string(),
  impressions: z.number(),
  clicks: z.number(),
  cost: z.number(),
  conversions: z.number(),
  cpa: z.number().nullable(),
});

const Output = z.object({ rows: z.array(Row) });

registerTool({
  name: 'read_geo_performance',
  description: 'Per-location metrics for a campaign. Use to find under/over-performing geos.',
  inputSchema: Input,
  outputSchema: Output,
  riskClass: 'read',
  category: 'bidding',
  defaultPermission: 'allow',
  backends: {
    mock: async ({ campaignId }) => ({
      rows: acmeGeo
        .filter((g) => g.campaignId === campaignId)
        .map((g) => ({
          criterionId: g.criterionId,
          locationName: g.locationName,
          impressions: g.impressions,
          clicks: g.clicks,
          cost: g.cost,
          conversions: g.conversions,
          cpa: g.conversions > 0 ? +(g.cost / g.conversions).toFixed(2) : null,
        })),
    }),
  },
});
