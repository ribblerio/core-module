/**
 * Hand-authored OpenAPI 3.1 spec for core-module's REST surface.
 *
 * This is consumed by control-panel via openapi-typescript at
 * `npm run gen:api` to produce `src/lib/api/schema.ts` and the
 * type-safe openapi-fetch client.
 *
 * Phase 4: paths only, response bodies are { '200': { description: 'ok' } }.
 * Phase 5+ will flesh out request/response schemas as pages need them.
 */
export const openapi = {
  openapi: '3.1.0',
  info: { title: 'Ribbler Core', version: '0.0.1' },
  servers: [{ url: 'http://localhost:8787' }],
  paths: {
    '/me': {
      get: {
        operationId: 'getMe',
        responses: { '200': { description: 'ok' } },
      },
    },
    '/customers/{id}': {
      get: {
        operationId: 'getCustomer',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: { '200': { description: 'ok' } },
      },
    },
    '/customers/{id}/ad-accounts': {
      get: {
        operationId: 'listAdAccounts',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: { '200': { description: 'ok' } },
      },
    },
    '/customers/{id}/ad-accounts/connect-mock': {
      post: {
        operationId: 'connectMockAdAccount',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: { '200': { description: 'ok' } },
      },
    },
    '/ad-accounts/{id}/dashboard': {
      get: {
        operationId: 'getDashboard',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: { '200': { description: 'ok' } },
      },
    },
    '/ad-accounts/{id}/campaigns': {
      get: {
        operationId: 'listCampaigns',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: { '200': { description: 'ok' } },
      },
    },
    '/ad-accounts/{id}/campaigns/{cid}': {
      get: {
        operationId: 'getCampaign',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'cid', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: { '200': { description: 'ok' } },
      },
    },
    '/ad-accounts/{id}/campaigns/{cid}/search-terms': {
      get: {
        operationId: 'getSearchTerms',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'cid', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: { '200': { description: 'ok' } },
      },
    },
    '/ad-accounts/{id}/campaigns/{cid}/locations': {
      get: {
        operationId: 'getLocations',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'cid', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: { '200': { description: 'ok' } },
      },
    },
    '/ad-accounts/{id}/ad-groups/{agid}/keywords': {
      get: {
        operationId: 'getKeywords',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'agid', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: { '200': { description: 'ok' } },
      },
    },
    '/ad-accounts/{id}/proposals': {
      get: {
        operationId: 'listProposals',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'status', in: 'query', schema: { type: 'string' } },
          { name: 'category', in: 'query', schema: { type: 'string' } },
        ],
        responses: { '200': { description: 'ok' } },
      },
    },
    '/proposals/{id}': {
      get: {
        operationId: 'getProposal',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: { '200': { description: 'ok' } },
      },
    },
    '/proposals/{id}/approve': {
      post: {
        operationId: 'approveProposal',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: { '200': { description: 'ok' } },
      },
    },
    '/proposals/{id}/reject': {
      post: {
        operationId: 'rejectProposal',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: { '200': { description: 'ok' } },
      },
    },
    '/ad-accounts/{id}/activity': {
      get: {
        operationId: 'getActivity',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: { '200': { description: 'ok' } },
      },
    },
    '/ad-accounts/{id}/runs': {
      get: {
        operationId: 'listRuns',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: { '200': { description: 'ok' } },
      },
    },
    '/ad-accounts/{id}/run-analysis': {
      post: {
        operationId: 'runAnalysis',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: { '200': { description: 'ok' } },
      },
    },
    '/ad-accounts/{id}/tool-permissions': {
      get: {
        operationId: 'getToolPermissions',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: { '200': { description: 'ok' } },
      },
      patch: {
        operationId: 'updateToolPermission',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: { '200': { description: 'ok' } },
      },
    },
  },
} as const;
