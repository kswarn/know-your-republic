# Know Your Republic

A civic reference directory for India: who governs, what the laws are, and what
rights every citizen holds — explained plainly, sourced officially, in every Indian
language. A directory, not a news feed.

Start with [CLAUDE.md](CLAUDE.md) for the project's conventions and guardrails, and
[docs/BUILD_PLAN.md](docs/BUILD_PLAN.md) for the phased plan this repo is built against.

## Getting started

Node version is pinned in `.nvmrc` (22.x). Package manager is pnpm.

```bash
nvm use
pnpm install
cp .env.example .env   # fill in DATABASE_URL
pnpm db:generate
pnpm db:migrate
pnpm db:seed            # inserts one real, cited Law record
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) — it redirects to `/en`.

## Scripts

| Command | Does |
|---|---|
| `pnpm dev` | Local dev server (Turbopack) |
| `pnpm build` / `pnpm start` | Production build / serve |
| `pnpm test` | Vitest — includes the publish-gate enforcement tests |
| `pnpm lint` | ESLint (flat config) |
| `pnpm db:migrate` | Apply Prisma migrations to `DATABASE_URL` |
| `pnpm db:seed` | Run `prisma/seed.ts` — the Phase 0 proof-of-pipeline record |

## Docs

- [docs/BUILD_PLAN.md](docs/BUILD_PLAN.md) — the phased build plan
- [docs/STYLE_GUIDE.md](docs/STYLE_GUIDE.md) — the "plain-but-professional" editorial register
- [docs/SOURCES_LEGAL.md](docs/SOURCES_LEGAL.md) — terms-of-use notes per official data source
