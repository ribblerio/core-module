import { Hono } from 'hono';
import { meRoutes } from './me.js';
import { adAccountRoutes } from './ad-accounts.js';
import { proposalRoutes } from './proposals.js';

export const apiRoutes = new Hono();
apiRoutes.route('/', meRoutes);
apiRoutes.route('/', adAccountRoutes);
apiRoutes.route('/', proposalRoutes);
