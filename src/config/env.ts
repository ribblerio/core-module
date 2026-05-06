import { z } from 'zod';

const Env = z.object({
  DATABASE_URL: z.string().url(),
  ANTHROPIC_API_KEY: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  ENCRYPTION_KEY: z.string().min(32),
  PORT: z.coerce.number().int().positive().default(8787),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

export type Env = z.infer<typeof Env>;
export const env: Env = Env.parse(process.env);
