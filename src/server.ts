import { serve } from '@hono/node-server';
import { sql } from 'drizzle-orm';
import { Hono } from 'hono';
import { env } from './config/env.js';
import { db } from './db/client.js';
import { apiRoutes } from './routes/index.js';
import './tools/google-ads/index.js';

const app = new Hono();

app.get('/health', (c) => c.json({ ok: true }));
app.get('/health/db', async (c) => {
  const result = await db.execute(sql`SELECT 1 as ok`);
  return c.json({ ok: result.rows[0]?.ok === 1 });
});

app.route('/', apiRoutes);

serve({ fetch: app.fetch, port: env.PORT });
console.log(`core-module listening on :${env.PORT}`);
