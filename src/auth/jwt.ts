import { SignJWT, jwtVerify } from 'jose';
import { env } from '../config/env.js';

const secret = new TextEncoder().encode(env.JWT_SECRET);

export interface JwtPayload {
  userId: string;
  email: string;
  role: 'admin' | 'approver';
}

export async function signJwt(payload: JwtPayload, ttlSeconds = 60): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${ttlSeconds}s`)
    .sign(secret);
}

export async function verifyJwt(token: string): Promise<JwtPayload> {
  const { payload } = await jwtVerify(token, secret);
  if (typeof payload.userId !== 'string' || typeof payload.email !== 'string') {
    throw new Error('invalid jwt payload');
  }
  return payload as unknown as JwtPayload;
}
