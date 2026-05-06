import { describe, it, expect } from 'vitest';
import { signJwt, verifyJwt } from './jwt.js';

describe('jwt', () => {
  it('round-trips a payload', async () => {
    const token = await signJwt({
      userId: '11111111-1111-1111-1111-111111111111',
      email: 'a@b.com',
      role: 'admin',
    });
    const payload = await verifyJwt(token);
    expect(payload.userId).toBe('11111111-1111-1111-1111-111111111111');
    expect(payload.email).toBe('a@b.com');
    expect(payload.role).toBe('admin');
  });

  it('rejects a tampered token', async () => {
    const token = await signJwt({ userId: 'x', email: 'y', role: 'admin' });
    const tampered = token.slice(0, -2) + 'XX';
    await expect(verifyJwt(tampered)).rejects.toThrow();
  });
});
