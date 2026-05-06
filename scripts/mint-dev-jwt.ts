import { signJwt } from '../src/auth/jwt.js';

const token = await signJwt(
  {
    userId: '00000000-0000-0000-0000-000000000001',
    email: 'lasha@sweenk.com',
    role: 'admin',
  },
  3600,
);

console.log(token);
