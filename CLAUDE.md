# Know Your Republic — project conventions

A civic reference directory for India: **who governs, what the laws are, and what rights every
citizen holds** — explained plainly, sourced officially, in every Indian language.
A directory, **not** a news feed.

Full build plan: [docs/BUILD_PLAN.md](docs/BUILD_PLAN.md). Editorial register:
[docs/STYLE_GUIDE.md](docs/STYLE_GUIDE.md). Source terms of use: [docs/SOURCES_LEGAL.md](docs/SOURCES_LEGAL.md).

## Guardrails (non-negotiable)

- **Sourced or it doesn't ship.** Any explained content renders with a visible source link pulled
  from `Citation`. A `PUBLISHED` state requires ≥1 citation — enforced in `src/lib/publish.ts`,
  not by convention. Never set a `*Status` field to `PUBLISHED` with a raw Prisma write.
- **Directory, not news.** Never build feeds, headlines, or time-ordered activity streams.
  Auto-updates change records **in place**; the only time signal is `lastVerifiedAt`.
- **Judiciary is people-only.** Judges + biographies. Never add case, judgment, cause-list, or
  lawyer data.
- **Neutral by construction.** Identical templates and identical depth for every Person and Party.
  No adjective expresses approval or disapproval of policy. Where a law is contested, state the
  positions of supporters and opponents from their own public statements, attributed — do not
  adjudicate.
- **Plain, but professional.** Explanations must be understandable with no legal background, yet
  precise and academic in register. No slang, no flippancy, no "basically it's like…" throwaways.
  Simple ≠ careless.
- **Minimal UI.** Home = three search doors (People, Laws, Rights) + locality prompt. Progressive
  disclosure on profiles (essentials first). Ruthlessly cut any field that doesn't serve
  _who / what law / what right_. Whitespace over density. Few colors, one type hierarchy.
- **Search-first.** Each domain opens with a large, prominent search bar + rich filters.
- **Accessible + localized by default.** Semantic HTML, ARIA, real per-language text (never text
  baked into images), clean reading order — from the first component. Every locale gets the same
  directory; machine-translated content carries a visible **"unreviewed translation"** flag until
  a reviewer clears it.
- **Assistant is grounded only.** It answers strictly from retrieved sourced content and always
  shows citations. If it can't answer from the directory, it says so. No speculation, no opinions.
- **Cost discipline.** Cache assistant answers and embeddings; rate-limit the assistant endpoint;
  batch and cache all machine translations. Never call an LLM or translation API in a hot render
  path.

### No authentication, anywhere

The product is anonymous end to end. There are no user accounts, no admin UI, and no login.
Editorial work (drafting explanations, clearing translation flags, triaging `Correction` rows)
happens as **reviewed pull requests against seed files in `content/`** — never through a
privileged runtime surface. If a task seems to need auth, it belongs in the Git flow instead.

## Stack

| Concern   | Choice                                                             |
| --------- | ------------------------------------------------------------------ |
| Framework | Next.js 16 (App Router) + React 19, TypeScript                     |
| Hosting   | Vercel                                                             |
| Database  | Neon Postgres + `pgvector`                                         |
| ORM       | Prisma 7 (`prisma/schema.prisma`)                                  |
| Styling   | Tailwind CSS v4 (CSS-first config in `src/app/globals.css`)        |
| i18n      | `next-intl`, 22 scheduled languages                                |
| Maps      | MapLibre GL + ECI/Delimitation GeoJSON                             |
| Charts    | D3 for hierarchy/org charts                                        |
| Ingestion | GitHub Actions for heavy scraping; Vercel Cron only for light jobs |
| Assistant | RAG over pgvector + a small LLM API                                |
| Tests     | Vitest                                                             |

Node is pinned to the version in `.nvmrc` (22). Package manager is **pnpm**.

## Conventions

- One adapter per official source in `src/lib/sources/`. An adapter fetches, normalizes to the
  Prisma models, and attaches its `Citation` in the same transaction. Adapters must be
  **idempotent** — re-running one updates in place rather than inserting duplicates.
- Locale routing is `/[locale]/…` with `localePrefix: 'always'`. `en` is the source language;
  every other catalog falls back to it.
- Next.js 16 specifics: `params` and `searchParams` are **async** (`await props.params`);
  middleware is named `proxy.ts` and exports `proxy`; Turbopack is the default bundler;
  `next lint` is gone — run `pnpm lint` (ESLint flat config).
- Secondary sources (PRS, MyNeta) may cross-check but never stand alone as a citation
  (`Citation.isPrimary = false`).
