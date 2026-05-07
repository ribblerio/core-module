import { signJwt } from '../src/auth/jwt.js';

const token = await signJwt(
  {
    userId: 'U14C3eqk4YlurDF406egREHmRomj7VoK',
    email: 'lasha@sweenk.com',
    role: 'admin',
  },
  3600,
);

process.stdout.write(token);
