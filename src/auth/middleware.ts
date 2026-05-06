import type { MiddlewareHandler } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { verifyJwt, type JwtPayload } from './jwt.js';

declare module 'hono' {
  interface ContextVariableMap {
    user: JwtPayload;
  }
}

export const authMiddleware: MiddlewareHandler = async (c, next) => {
  const header = c.req.header('Authorization');
  if (!header?.startsWith('Bearer ')) {
    throw new HTTPException(401, { message: 'missing bearer token' });
  }
  try {
    const payload = await verifyJwt(header.slice('Bearer '.length));
    c.set('user', payload);
  } catch {
    throw new HTTPException(401, { message: 'invalid token' });
  }
  await next();
};
