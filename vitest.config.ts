import { defineConfig } from 'vitest/config';
import { config } from 'dotenv';

config({ path: '.env.test' });

export default defineConfig({
  test: {
    environment: 'node',
    globals: false,
    // Tests share a single Postgres test DB (resetTestDb drops+recreates it).
    // Run files sequentially so concurrent migrations do not collide.
    fileParallelism: false,
  },
});
