import { Hono } from 'hono';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { authMiddleware } from '../auth/middleware.js';
import { db } from '../db/client.js';
import { toolOverrides } from '../db/schema/core/index.js';
import { listTools } from '../tools/registry.js';
import { ensureAccountAccess } from '../services/authz.js';

export const toolPermissionRoutes = new Hono().use('*', authMiddleware);

toolPermissionRoutes.get('/ad-accounts/:id/tool-permissions', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  await ensureAccountAccess(user.userId, id);

  const overrides = await db.select().from(toolOverrides).where(eq(toolOverrides.adAccountId, id));
  const overrideMap = new Map(overrides.map((o) => [o.toolName, o]));

  const grouped: Record<string, unknown[]> = {};
  for (const tool of listTools()) {
    const ov = overrideMap.get(tool.name);
    (grouped[tool.category] ??= []).push({
      name: tool.name,
      description: tool.description,
      catalogueId: tool.catalogueId,
      defaultPermission: tool.defaultPermission,
      effectivePermission: ov?.permission ?? tool.defaultPermission,
      effectiveBackend: ov?.backend ?? null,
    });
  }
  return c.json({ categories: grouped });
});

const PatchBody = z.object({
  toolName: z.string(),
  permission: z.enum(['allow', 'approve', 'deny']).nullable().optional(),
  backend: z.enum(['mock', 'sandbox', 'live']).nullable().optional(),
});

toolPermissionRoutes.patch('/ad-accounts/:id/tool-permissions', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  await ensureAccountAccess(user.userId, id);
  const body = PatchBody.parse(await c.req.json());

  await db
    .insert(toolOverrides)
    .values({
      adAccountId: id,
      toolName: body.toolName,
      permission: body.permission ?? null,
      backend: body.backend ?? null,
    })
    .onConflictDoUpdate({
      target: [toolOverrides.adAccountId, toolOverrides.toolName],
      set: {
        permission: body.permission ?? null,
        backend: body.backend ?? null,
        updatedAt: new Date(),
      },
    });

  return c.json({ ok: true });
});
