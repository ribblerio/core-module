import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { env } from './config/env.js';

const app = new Hono();

app.get('/health', (c) => c.json({ ok: true }));

serve({ fetch: app.fetch, port: env.PORT });
console.log(`core-module listening on :${env.PORT}`);
