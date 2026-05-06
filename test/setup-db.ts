import { execSync } from 'node:child_process';
import { Pool } from 'pg';

export async function resetTestDb(): Promise<void> {
  const url = process.env.DATABASE_URL;
  if (!url || !url.includes('ribbler_test')) {
    throw new Error('refusing to reset non-test DB');
  }
  const adminUrl = url.replace('/ribbler_test', '/postgres');
  const admin = new Pool({ connectionString: adminUrl });
  await admin.query("SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='ribbler_test' AND pid <> pg_backend_pid()");
  await admin.query('DROP DATABASE IF EXISTS ribbler_test');
  await admin.query('CREATE DATABASE ribbler_test');
  await admin.end();

  execSync('pnpm db:migrate', { stdio: 'inherit', env: { ...process.env, DATABASE_URL: url } });
}
