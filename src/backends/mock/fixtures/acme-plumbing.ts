export interface MockCampaign {
  id: string;
  name: string;
  status: 'enabled' | 'paused';
  spendUsd: number;
  impressions: number;
  clicks: number;
  conversions: number;
}

export interface MockAdGroup {
  id: string;
  campaignId: string;
  name: string;
}

export interface MockKeyword {
  id: string;
  adGroupId: string;
  text: string;
  matchType: 'exact' | 'phrase' | 'broad';
  cpcBidMicros: number;
  impressions: number;
  clicks: number;
  conversions: number;
  qualityScore: number;
}

export interface MockSearchTerm {
  id: string;
  campaignId: string;
  adGroupId: string;
  text: string;
  matchedKeywordId: string;
  impressions: number;
  clicks: number;
  cost: number;
  conversions: number;
}

export interface MockGeoRow {
  campaignId: string;
  criterionId: string;
  locationName: string;
  impressions: number;
  clicks: number;
  cost: number;
  conversions: number;
}

export const acmeCampaigns: MockCampaign[] = [
  { id: 'cmp_1', name: 'Brand-Search-US', status: 'enabled', spendUsd: 4720, impressions: 152000, clicks: 4810, conversions: 184 },
];

export const acmeAdGroups: MockAdGroup[] = [
  { id: 'ag_1', campaignId: 'cmp_1', name: 'Plumbing — Emergency' },
  { id: 'ag_2', campaignId: 'cmp_1', name: 'Plumbing — General' },
  { id: 'ag_3', campaignId: 'cmp_1', name: 'Plumbing — Drain' },
];

export const acmeKeywords: MockKeyword[] = [
  { id: 'kw_1', adGroupId: 'ag_1', text: 'emergency plumber', matchType: 'phrase', cpcBidMicros: 4_500_000, impressions: 30200, clicks: 1180, conversions: 78, qualityScore: 8 },
  { id: 'kw_2', adGroupId: 'ag_1', text: '24 hour plumber',   matchType: 'phrase', cpcBidMicros: 4_500_000, impressions: 12100, clicks: 510,  conversions: 32, qualityScore: 7 },
  { id: 'kw_3', adGroupId: 'ag_2', text: 'plumber near me',   matchType: 'phrase', cpcBidMicros: 3_000_000, impressions: 41000, clicks: 1320, conversions: 41, qualityScore: 6 },
  { id: 'kw_4', adGroupId: 'ag_3', text: 'drain cleaning',    matchType: 'phrase', cpcBidMicros: 2_500_000, impressions: 18000, clicks: 590,  conversions: 19, qualityScore: 7 },
  { id: 'kw_5', adGroupId: 'ag_2', text: 'cheap plumber',     matchType: 'broad',  cpcBidMicros: 1_800_000, impressions: 22500, clicks: 410,  conversions: 2,  qualityScore: 4 },
];

export const acmeSearchTerms: MockSearchTerm[] = [
  { id: 'st_1',  campaignId: 'cmp_1', adGroupId: 'ag_1', text: 'burst pipe repair tonight', matchedKeywordId: 'kw_1', impressions: 1200, clicks: 89,  cost: 320,  conversions: 22 },
  { id: 'st_2',  campaignId: 'cmp_1', adGroupId: 'ag_1', text: 'water heater leaking emergency', matchedKeywordId: 'kw_1', impressions: 980,  clicks: 71,  cost: 270,  conversions: 18 },
  { id: 'st_3',  campaignId: 'cmp_1', adGroupId: 'ag_3', text: 'clogged kitchen drain professional', matchedKeywordId: 'kw_4', impressions: 700,  clicks: 49,  cost: 145,  conversions: 13 },
  { id: 'st_4',  campaignId: 'cmp_1', adGroupId: 'ag_2', text: 'plumber salary',           matchedKeywordId: 'kw_3', impressions: 2400, clicks: 96,  cost: 230,  conversions: 0 },
  { id: 'st_5',  campaignId: 'cmp_1', adGroupId: 'ag_2', text: 'how to become plumber',    matchedKeywordId: 'kw_3', impressions: 1800, clicks: 71,  cost: 175,  conversions: 0 },
  { id: 'st_6',  campaignId: 'cmp_1', adGroupId: 'ag_2', text: 'plumber jobs near me',     matchedKeywordId: 'kw_3', impressions: 3100, clicks: 142, cost: 305,  conversions: 0 },
  { id: 'st_7',  campaignId: 'cmp_1', adGroupId: 'ag_2', text: 'cheap plumber free quote', matchedKeywordId: 'kw_5', impressions: 2900, clicks: 87,  cost: 198,  conversions: 1 },
  { id: 'st_8',  campaignId: 'cmp_1', adGroupId: 'ag_2', text: 'plumber school online',    matchedKeywordId: 'kw_3', impressions: 1100, clicks: 38,  cost: 91,   conversions: 0 },
  { id: 'st_9',  campaignId: 'cmp_1', adGroupId: 'ag_2', text: 'plumber chicago',          matchedKeywordId: 'kw_3', impressions: 1500, clicks: 60,  cost: 180,  conversions: 4 },
  { id: 'st_10', campaignId: 'cmp_1', adGroupId: 'ag_1', text: 'after hours plumber',      matchedKeywordId: 'kw_2', impressions: 900,  clicks: 41,  cost: 165,  conversions: 6 },
];

export const acmeGeo: MockGeoRow[] = [
  { campaignId: 'cmp_1', criterionId: 'loc_1', locationName: 'Chicago, IL',   impressions: 51000, clicks: 1820, cost: 1640, conversions: 96 },
  { campaignId: 'cmp_1', criterionId: 'loc_2', locationName: 'Naperville, IL', impressions: 9200,  clicks: 320,  cost: 270,  conversions: 9  },
  { campaignId: 'cmp_1', criterionId: 'loc_3', locationName: 'Aurora, IL',     impressions: 8400,  clicks: 280,  cost: 240,  conversions: 7  },
  { campaignId: 'cmp_1', criterionId: 'loc_4', locationName: 'Joliet, IL',     impressions: 6100,  clicks: 195,  cost: 175,  conversions: 5  },
  { campaignId: 'cmp_1', criterionId: 'loc_5', locationName: 'Evanston, IL',   impressions: 12100, clicks: 540,  cost: 410,  conversions: 41 },
  { campaignId: 'cmp_1', criterionId: 'loc_6', locationName: 'Rockford, IL',   impressions: 4200,  clicks: 110,  cost: 95,   conversions: 1  },
  { campaignId: 'cmp_1', criterionId: 'loc_7', locationName: 'Peoria, IL',     impressions: 3900,  clicks: 95,   cost: 88,   conversions: 1  },
  { campaignId: 'cmp_1', criterionId: 'loc_8', locationName: 'Springfield, IL',impressions: 3100,  clicks: 78,   cost: 71,   conversions: 0  },
];
