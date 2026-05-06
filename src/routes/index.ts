import { Hono } from 'hono';
import { meRoutes } from './me.js';

export const apiRoutes = new Hono();
apiRoutes.route('/', meRoutes);
