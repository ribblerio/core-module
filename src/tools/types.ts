import type { z } from 'zod';

export type Permission = 'allow' | 'approve' | 'deny';
export type BackendKind = 'mock' | 'sandbox' | 'live';

export type ToolCategory =
  | 'account_setup'
  | 'campaign'
  | 'ad_group'
  | 'keyword'
  | 'ad_creation'
  | 'bidding'
  | 'audience'
  | 'performance'
  | 'crm';

export interface ToolCtx {
  adAccountId: string;
  customerId: string;
  triggeredBy: string;
}

export interface ToolDefinition<I = unknown, O = unknown> {
  name: string;
  description: string;
  inputSchema: z.ZodSchema<I>;
  outputSchema: z.ZodSchema<O>;
  riskClass: 'read' | 'low' | 'medium' | 'high';
  category: ToolCategory;
  catalogueId?: number;
  defaultPermission: Permission;
  backends: Partial<Record<BackendKind, (input: I, ctx: ToolCtx) => Promise<O>>>;
}
