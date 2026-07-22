# Know Your Republic — Build Plan

> A civic reference directory for India: **who governs, what the laws are, and what rights every citizen holds** — explained plainly, sourced officially, in every Indian language. A directory, **not** a news feed.

This document is written to be fed to **Claude Code**. Work phase by phase, top to bottom. Each phase has a **Goal**, **Features**, a **Task checklist**, and **Acceptance criteria**. Do not start a later phase until the current phase's acceptance criteria pass. Treat the **Guardrails** (Section 6) as non-negotiable constraints on every task in every phase.

---

## 0. How to use this doc with Claude Code

- Create the repo, drop this file in as `docs/BUILD_PLAN.md`, and drop `prisma/schema.prisma` in from the accompanying schema file.
- Also create a `CLAUDE.md` at the repo root — Section 6 (Guardrails) and Section 2 (Stack) are the content to put there so every session inherits them.
- Build in the phase order below. Tick tasks as you go. Each phase ends with a working, deployable state on Vercel.
- When a task involves real government data, follow the sourcing rules in Section 5 exactly — a fact with no linked official source does not ship.

---

## 1. Product in one paragraph

For any person who opens the app, the scope moves outward from their **residential area → city → state → nation**. They can look up (a) **who governs them** — every public servant from local to national, with role, responsibilities, contact, and the bills/laws they introduced or passed; (b) **the laws** — every bill and Act, each with a plain-language explanation and a link to the official text; (c) **their rights** — every citizen right explained in detail with its constitutional/legal citation. There is a large search bar for each of these three domains, rich filters, an integrated assistant that answers questions from the directory's own sourced content, and full localization across all 22 scheduled languages with text-to-speech.

### Non-goals (do not build these)

- No news feed, headlines, activity timeline, or "what happened today."
- No court case data — no judgments, cause lists, case status, or lawyer listings. **Judiciary = judges + biographies only.**
- No user accounts or authentication. The whole product is anonymous and open.
- No editorializing. State facts and official positions only; equal treatment for every person and party.

---

## 2. Tech stack (Vercel-first, near-zero cost)

| Concern | Choice | Why |
|---|---|---|
| Framework | **Next.js (App Router) + React, TypeScript** | First-class on Vercel; supports PWA, SSR/SSG, API routes for ingestion. |
| Hosting | **Vercel (Hobby tier)** | Free for non-commercial; this is a public-good project. |
| Database | **Postgres via Neon or Supabase (free tier)** + **pgvector** extension | Free tier is generous; pgvector powers the assistant's retrieval. |
| ORM | **Prisma** | Schema in `prisma/schema.prisma` (provided). |
| Styling | **Tailwind CSS** | Fast path to the minimal, restrained UI in Section 6. |
| i18n | **next-intl** | Locale routing + message catalogs for all 22 languages. |
| Maps / locator | **MapLibre GL** (open-source) + constituency **GeoJSON** from ECI/Delimitation | Free; no Google Maps bill. |
| Charts / hierarchy | **D3** (force/tree) for org charts; a light chart lib for simple bar/counts | Data-driven visuals from the hierarchy edges. |
| Ingestion / scrapers | **Vercel Cron** for light polling; **GitHub Actions** for heavier per-state scraping | Both free; keep ingestion separate from the web app. |
| Assistant | **Retrieval (RAG) over pgvector** + a small/cheap LLM API | Answers only from sourced content; always cites. Cache + rate-limit to control cost. |
| Machine translation | Batch translate + **cache in DB** (never translate on the fly) | Controls the one translation cost that could grow. |
| TTS (Phase 4) | Web Speech API where available; cloud TTS fallback per language | Accessibility built in, not bolted on. |

**Cost posture:** at low traffic this runs at ~₹0–small. The only variable costs are assistant LLM inference and machine-translation volume — both must be cached and rate-limited (see Guardrails).

---

## 3. Repository structure (target)

```
know-your-republic/
├── CLAUDE.md                      # project conventions + guardrails (from §6)
├── docs/
│  ├── BUILD_PLAN.md               # this file
├── prisma/
│  ├── schema.prisma               # provided data model
├── src/
│  ├── app/
│  │  ├── [locale]/                # next-intl locale segment
│  │  │  ├── page.tsx              # home: three search doors + locality prompt
│  │  │  ├── people/               # People & Government domain
│  │  │  ├── laws/                 # Laws domain
│  │  │  ├── rights/               # Rights domain
│  │  │  ├── judiciary/            # judges (view over people)
│  │  │  ├── me/                   # locator results (ward→nation)
│  │  ├── api/
│  │     ├── search/               # search endpoints per domain
│  │     ├── locator/              # address/PIN → jurisdictions
│  │     ├── assistant/            # grounded RAG endpoint
│  │     ├── ingest/               # cron-triggered ingestion routes
│  ├── components/                 # minimal UI kit
│  ├── lib/
│  │  ├── db.ts                    # Prisma client
│  │  ├── sources/                 # one adapter per official source (§5)
│  │  ├── i18n/                    # locale config, message loading
│  │  ├── rag/                     # embedding + retrieval helpers
│  ├── messages/                   # 22 language message catalogs
├── scripts/                       # seed + per-state scrapers (run via GH Actions)
├── tests/
```

---

## 4. Data model

The data model is defined in **`prisma/schema.prisma`** (accompanying file). Core entities: **Person, Position, Institution, Jurisdiction, Law, Right**, with **Hierarchy edges** (position reporting lines), a polymorphic **Citation** (every explained fact links its official source), **Translation** (per-field, per-language, with machine/reviewed status), **Correction** (public no-login error reports), and **DocChunk** (embedded content for the assistant's retrieval).

Key rules baked into the schema:

- A **Position** carries both a **Jurisdiction** (geographic scope) and an **Institution** (which office) — this is what makes the residential→nation locator a single query.
- **Judiciary** is not a separate table: a judge is a `Person` in a judicial `Position` at a `Court` (an `Institution` of type `COURT`).
- **Hierarchy** is not a table of its own beyond the explicit `HierarchyEdge` join used to generate org charts.
- A **Law** is one entity for both bills and Acts, distinguished by `status`.

---

## 5. Data sources & sourcing rules

Each data type maps to **one named official primary source**. Build one adapter per source in `src/lib/sources/`.

| Data type | Primary source | URL |
|---|---|---|
| Union bills/Acts, MP profiles & roles | Digital Sansad | sansad.in |
| Full text of central & state Acts | India Code | indiacode.nic.in |
| Plain-summary cross-check (secondary only) | PRS Legislative Research | prsindia.org |
| Council of Ministers, portfolios | National Portal / Cabinet Secretariat | india.gov.in/directory, cabsec.gov.in |
| Confirming current office-holders | Press Information Bureau | pib.gov.in |
| Constitution & Fundamental Rights text | Legislative Dept, Ministry of Law | legislative.gov.in |
| Supreme Court judges & bios | Supreme Court of India | sci.gov.in |
| High Court judges & bios | Respective HC / Dept of Justice | doj.gov.in |
| Constituencies & current members | Election Commission of India | eci.gov.in, results.eci.gov.in |
| Candidate affidavits (background) — secondary | ADR / MyNeta | myneta.info |
| Contact directory | National Portal / IGOD | india.gov.in/directory/contact-directory, igod.gov.in |
| State bills, Acts, MLAs | State assembly (e.g. Karnataka) | kla.kar.nic.in |
| State govt structure | State portal (e.g. Karnataka) | karnataka.gov.in |
| Open datasets / API | OGD Platform India (GODL-India licensed) | data.gov.in |

**Sourcing rules (enforced in code + review):**

1. Every explained fact (a person's role, a law's summary, a right's explanation) **must** have at least one `Citation` row with the official `sourceUrl`. No citation → not published (`summaryStatus`/publish gate).
2. Secondary sources (PRS, MyNeta) may **cross-check** but never stand alone as the citation.
3. Each record shows a discreet **`lastVerifiedAt`** date. No headlines, no feed.
4. Before scraping any source, confirm its terms of use; prefer official APIs (data.gov.in has one under GODL-India).

---

## 6. Cross-cutting guardrails (put these in CLAUDE.md)

- **Sourced or it doesn't ship.** Any explained content renders with a visible source link pulled from `Citation`. A `PUBLISHED` state requires ≥1 citation.
- **Directory, not news.** Never build feeds, headlines, or time-ordered activity streams. Auto-updates change records **in place**; the only time signal is `lastVerifiedAt`.
- **Judiciary is people-only.** Judges + bios. Never add case, judgment, cause-list, or lawyer data.
- **Neutral by construction.** Identical templates and identical depth for every Person and Party. No adjective expresses approval/disapproval of policy. Where a law is contested, state the positions of supporters/opponents from their own public statements, attributed — do not adjudicate.
- **Plain, but professional.** Explanations must be understandable with no legal background, yet precise and academic in register. No slang, no flippancy, no "basically it's like…" throwaways. Simple ≠ careless.
- **Minimal UI.** Home = three search doors (People, Laws, Rights) + locality prompt. Progressive disclosure on profiles (essentials first). Ruthlessly cut any field that doesn't serve *who / what law / what right*. Whitespace over density. Few colors, one type hierarchy.
- **Search-first.** Each domain opens with a large, prominent search bar + rich filters (filter sets listed per domain below).
- **Accessible + localized by default.** Semantic HTML, ARIA, real per-language text (never text baked into images), clean reading order — from the first component. Every locale gets the same directory; machine-translated content carries a visible **"unreviewed translation"** flag until a reviewer clears it.
- **Assistant is grounded only.** It answers strictly from retrieved sourced content and always shows citations. If it can't answer from the directory, it says so. No speculation, no opinions.
- **Cost discipline.** Cache assistant answers and embeddings; rate-limit the assistant endpoint; batch and cache all machine translations. Never call an LLM or translation API in a hot render path.

---

## 7. Phases

### Phase 0 — Foundations
**Goal:** a deployable skeleton on Vercel with the schema, design system, i18n scaffold, and one working source adapter — no real content yet.

**Features:** repo + CI, DB + Prisma migrations, minimal design system, i18n routing for 22 locales, `CLAUDE.md` guardrails, first source adapter.

**Tasks:**
- [x] Scaffold Next.js (App Router, TS) + Tailwind; deploy an empty app to Vercel.
- [x] Add `CLAUDE.md` from Sections 2 + 6.
- [ ] Provision Neon/Supabase Postgres; enable `pgvector`; wire Prisma; run initial migration from `schema.prisma`.
- [x] Build the minimal design system: type scale, color tokens (few), spacing, base components (SearchBar, Card, Chip/Filter, SourceLink, LanguageSwitcher, TTSButton stub). Pick Indic-script-capable web fonts (e.g. Noto Sans + Noto Sans Devanagari/Kannada/…).
- [x] Set up `next-intl` with all 22 locale codes; English catalog complete, others stubbed.
- [x] Build the home screen: three search doors + "set your locality" prompt (UI only).
- [ ] Write the first source adapter (`src/lib/sources/indiacode.ts` or `digitalsansad.ts`) that fetches and normalizes one record type into the schema, with a `Citation` attached.
- [x] Editorial style guide in `docs/STYLE_GUIDE.md` fixing the plain-but-professional register (with 3–4 good/bad example rewrites).
- [x] One-time legal-review note in `docs/SOURCES_LEGAL.md` (terms of use per source; GODL attribution text).

**Acceptance:** app deploys on Vercel; a migration creates all tables; `/en` renders the three-door home; one adapter can insert a real, cited record into the DB; switching locale changes UI strings.

---

### Phase 1 — Skeleton across all states/UTs
**Goal:** a thin top layer live **everywhere at once**, plus the fully-written Rights section.

**Features:** national + all state leadership (names/roles/contact, sourced), all Supreme Court + High Court judges (bio only), national hierarchy mind-map, complete Rights section, 3 human languages + 19 machine-translated (flagged).

**Tasks:**
- [ ] Seed **Jurisdictions**: nation, all 28 states + 8 UTs, and their capitals/major cities (constituency/ward granularity comes in Phase 2/3).
- [ ] Seed **Institutions**: PMO, Union ministries, Parliament (both houses), Supreme Court, each state's CMO/cabinet/assembly, each High Court.
- [ ] Ingest **top-layer People + Positions**: PM, Union Cabinet, all CMs + state cabinets — via Digital Sansad / National Portal / state portals, each field cited.
- [ ] Ingest **judges**: Supreme Court + all High Courts, biographies only, from sci.gov.in / HC sites / doj.gov.in.
- [ ] Build the **hierarchy mind-map** component (D3) generated from `HierarchyEdge` — national level first.
- [ ] Author the **Rights** content: Fundamental Rights (Art. 12–35) fully written in plain-but-professional language, each with `officialSourceUrl` to legislative.gov.in; publish gate requires the citation.
- [ ] Wire **People / Laws / Rights** list+detail pages against real data (thin content is fine).
- [ ] Machine-translate all published content into the other 19 languages; store in `Translation` with `status = MACHINE`; render the **"unreviewed translation"** flag.
- [ ] Human-review English, Hindi, Kannada content (`status = REVIEWED`).

**Acceptance:** from any state a user sees their CM + cabinet and their High Court judges (bio), all cited; the Rights section is complete and sourced; the national org-chart renders from data; every non-EN/HI/KN page shows the unreviewed-translation flag.

---

### Phase 2 — Depth: people & legislation
**Goal:** every sitting legislator and the full Laws database, rolled out state by state.

**Features:** all MPs + MLAs with profiles/roles/contact/constituency and the bills/Acts they sponsored; full central + state Laws with plain-language explainers; the three search bars + rich filters go live.

**Tasks:**
- [ ] Ingest **all sitting MPs** (Lok Sabha + Rajya Sabha) with Position, Institution, Jurisdiction (constituency), contact, and sponsored **Laws** — from Digital Sansad; cross-check background via MyNeta (secondary).
- [ ] Ingest **MLAs** per state via each state assembly adapter (start Karnataka: kla.kar.nic.in), rolling.
- [ ] Ingest the **Laws** corpus: central Acts from India Code + bills from Digital Sansad; state Acts per state; each with `officialTextUrl`.
- [ ] Author **plain-language explanations** for laws (draft → check vs source & PRS → editor review → `PUBLISHED`).
- [ ] Build **search** for each domain (Postgres full-text to start) + **filters**:
  - People: level, institution, role type, state/UT, constituency, party.
  - Laws: central/state, status, subject area, year, sponsoring ministry/member, jurisdiction of effect.
  - Rights: category, applies-to, related law.
- [ ] Add **compact profile graphics**: per-representative visual of bills/Acts sponsored (facts, not timelines).

**Acceptance:** every MP and (rolling) each state's MLAs have complete, cited profiles; searching each domain returns filtered results; each law shows a published, sourced plain-language explanation.

---

### Phase 3 — Rights & Laws depth + locator
**Goal:** the residential→nation locator, and deeper rights coverage.

**Features:** address/PIN → ward/constituency resolution surfacing all responsible representatives; expanded statutory rights.

**Tasks:**
- [ ] Load **constituency + ward GeoJSON** (ECI/Delimitation); build the geospatial resolver: address or PIN → ward, Assembly constituency, Lok Sabha constituency.
- [ ] Build the **`/me` locator view**: four rings (neighbourhood/ward → city → state → nation), each listing responsible Positions + their Institution's responsibilities.
- [ ] Add **MapLibre** drilldown map (country → state → constituency → ward).
- [ ] Expand **Rights**: Directive Principles + key statutory rights (RTI, consumer, labour, education), each detailed + cited.
- [ ] Surface "my representatives" and "laws that apply to me" framings in the People/Laws domains using the resolved locality.

**Acceptance:** entering a Bengaluru address lists the correct ward corporator, MLA, MP, Karnataka CM/relevant ministers, Karnataka HC, and national layer — each cited; the map drills down correctly; statutory rights are published and sourced.

---

### Phase 4 — Assistant, auto-currency & TTS
**Goal:** the grounded assistant, silent auto-updating of laws, and text-to-speech.

**Features:** RAG assistant that answers only from sourced content with citations; scheduled ingestion that keeps bill/law records current (no feed); TTS across supported languages; PWA/offline.

**Tasks:**
- [ ] Populate **DocChunk** embeddings from published content into pgvector; build retrieval helpers in `src/lib/rag/`.
- [ ] Build the **assistant** (`/api/assistant`): retrieve → answer strictly from retrieved chunks → return answer **with citations**; refuse/deflect when unsupported; respond in the user's locale. Cache answers; rate-limit the endpoint.
- [ ] Build **auto-currency ingestion**: Vercel Cron polls India Code / Digital Sansad / state adapters; on change, update the record **in place** and bump `lastVerifiedAt`; new/changed summaries enter an **editorial review queue** before publish. No headlines, no feed.
- [ ] Add **text-to-speech** (Web Speech API + fallback) on profile/law/right pages, per language.
- [ ] Make it a **PWA** (installable, offline shell, fast on low-end Android).

**Acceptance:** the assistant answers "who is my MP in Jayanagar?" / "what does the Consumer Protection Act cover?" only from directory content, with citations, and declines gracefully when it can't; a source change updates a record in place with a new `lastVerifiedAt` and no feed entry; pages can be read aloud; app installs as a PWA.

---

### Phase 5 — Full language parity & local bodies
**Goal:** human-reviewed content in all 22 languages and local-body coverage.

**Tasks:**
- [ ] Convert machine translations to **human-reviewed** per language, prioritized by speaker population; drop the unreviewed flag as each clears.
- [ ] Add **municipal/panchayat representatives** (e.g. BBMP corporators for Bengaluru) as Positions with ward Jurisdictions.
- [ ] Advanced visualizations: choropleths, interactive full-hierarchy explorer.

**Acceptance:** all 22 languages have reviewed content for the top layer + rights; local-body representatives appear in the locator; advanced visuals render from data.

---

## 8. Definition of done (applies to every content feature)

A person/law/right feature is "done" only when: it renders essentials-first; every explained field shows a source link from `Citation`; it has `lastVerifiedAt`; it exists in EN/HI/KN reviewed + 19 machine (flagged); it passes a screen-reader pass; and it uses the plain-but-professional register per the style guide.

## 9. First Claude Code session checklist

1. Create repo; add `docs/BUILD_PLAN.md` (this) + `prisma/schema.prisma` + `CLAUDE.md` (Sections 2 + 6).
2. Do **Phase 0** end to end; deploy to Vercel; confirm all acceptance criteria.
3. Only then begin Phase 1, seeding Karnataka + national first as the proven pattern before fanning out to other states.

---

*Prepared July 21, 2026. Source URLs verified live at time of writing. Build phase by phase; keep the guardrails in Section 6 in force at all times.*
