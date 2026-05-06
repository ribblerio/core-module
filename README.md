# Ribbler · Core Module

Backend service for Ribbler. Hono + Drizzle + Anthropic. Talks to Postgres, exposes a typed REST API consumed by `ribbler/control-panel`.

## Dev

```bash
pnpm install
cp .env.example .env
pnpm db:migrate   # after Phase 1
pnpm dev          # http://localhost:8787
```
