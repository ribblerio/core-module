import { z } from 'zod';
import { registerTool } from '../registry.js';
import { acmeCampaigns } from '../../backends/mock/fixtures/index.js';

const Input = z.object({ campaignId: z.string(), days: z.number().int().min(1).max(90).default(30) });
const Output = z.object({
  campaignId: z.string(),
  name: z.string(),
  status: z.enum(['enabled', 'paused']),
  spendUsd: z.number(),
  impressions: z.number(),
  clicks: z.number(),
  ctr: z.number(),
  conversions: z.number(),
  cpa: z.number(),
});

registerTool({
  name: 'read_campaign_overview',
  description: 'Get high-level metrics for a single campaign over the last N days.',
  inputSchema: Input,
  outputSchema: Output,
  riskClass: 'read',
  category: 'performance',
  defaultPermission: 'allow',
  backends: {
    mock: async ({ campaignId }) => {
      const c = acmeCampaigns.find((x) => x.id === campaignId);
      if (!c) throw new Error(`campaign not found: ${campaignId}`);
      return {
        campaignId: c.id,
        name: c.name,
        status: c.status,
        spendUsd: c.spendUsd,
        impressions: c.impressions,
        clicks: c.clicks,
        ctr: +(c.clicks / c.impressions).toFixed(4),
        conversions: c.conversions,
        cpa: +(c.spendUsd / c.conversions).toFixed(2),
      };
    },
  },
});
