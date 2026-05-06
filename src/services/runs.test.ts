import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { eq } from 'drizzle-orm';
import { db } from '../db/client.js';
import {
  customers,
  memberships,
  adAccounts,
  proposals,
} from '../db/schema/core/index.js';
import { resetTestDb } from '../../test/setup-db.js';
import '../tools/google-ads/index.js'; // register tools

import { runAnalysisInline } from './runs.js';

// Two-turn fixture mocking the Anthropic Messages API:
// Turn 1: model thinks, calls add_negative_keyword for "plumber salary".
// Turn 2 (after we send back a tool_result): model ends turn.
const turn1 = {
  id: 'msg_1',
  type: 'message',
  role: 'assistant',
  model: 'claude-sonnet-4-6',
  stop_reason: 'tool_use',
  stop_sequence: null,
  usage: { input_tokens: 200, output_tokens: 80 },
  content: [
    {
      type: 'text',
      text: 'The search term "plumber salary" has 96 clicks and 0 conversions over 30 days. Recommending it as a negative.',
    },
    {
      type: 'tool_use',
      id: 'toolu_1',
      name: 'add_negative_keyword',
      input: {
        campaignId: 'cmp_1',
        term: 'plumber salary',
        matchType: 'phrase',
        scope: 'campaign',
      },
    },
  ],
};

const turn2 = {
  id: 'msg_2',
  type: 'message',
  role: 'assistant',
  model: 'claude-sonnet-4-6',
  stop_reason: 'end_turn',
  stop_sequence: null,
  usage: { input_tokens: 50, output_tokens: 20 },
  content: [{ type: 'text', text: 'Proposed 1 negative keyword. Done.' }],
};

let callCount = 0;
const server = setupServer(
  http.post('https://api.anthropic.com/v1/messages', async () => {
    callCount += 1;
    return HttpResponse.json(callCount === 1 ? turn1 : turn2);
  }),
);

describe('runAnalysisInline (msw-mocked Anthropic)', () => {
  let adAccountId: string;

  beforeAll(async () => {
    await resetTestDb();
    server.listen({ onUnhandledRequest: 'error' });

    const [c] = await db.insert(customers).values({ kind: 'business', name: 'Acme T' }).returning();
    await db.insert(memberships).values({ customerId: c!.id, userId: '00000000-0000-0000-0000-000000000099', role: 'admin' });
    const [a] = await db
      .insert(adAccounts)
      .values({ customerId: c!.id, provider: 'google_ads', externalId: 'ext-run-1', displayName: 'Acme', backend: 'mock' })
      .returning();
    adAccountId = a!.id;
  });

  beforeEach(() => {
    callCount = 0;
  });

  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('completes a run, stores the trace, and creates a proposal from a tool_use', async () => {
    const { run } = await runAnalysisInline(adAccountId, 'manual:test');

    expect(run.status).toBe('succeeded');
    expect(run.inputTokens).toBe(250);
    expect(run.outputTokens).toBe(100);
    expect(Array.isArray(run.trace)).toBe(true);
    expect((run.trace as unknown[]).length).toBeGreaterThanOrEqual(3); // 2 responses + 1 tool_call

    const created = await db.select().from(proposals).where(eq(proposals.analysisRunId, run.id));
    expect(created).toHaveLength(1);
    expect(created[0]!.type).toBe('add_negative_keyword');
    expect(created[0]!.status).toBe('proposed');
    const payload = created[0]!.payload as { term: string };
    expect(payload.term).toBe('plumber salary');
    expect(created[0]!.reasoning).toContain('plumber salary');
  });
});
