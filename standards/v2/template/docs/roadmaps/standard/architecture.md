# Roadmap Architecture Standard

Load this module when writing or reviewing design principles, constraints, and target architecture.

## Design principles and constraints

Include only constraints relevant to the roadmap.

Common Koneko constraints:

- contract-first shared schemas,
- feature-based server and web layout,
- PostgreSQL + Drizzle persistence,
- pgvector where semantic retrieval is needed,
- Better Auth ownership boundaries,
- TanStack Router / Query / Form patterns,
- accessibility expectations,
- direct replacement instead of compatibility layers,
- no `index.ts` barrels or indirect re-exports,
- schema-backed constants instead of repeated raw string literals.

## Fresh-state rewrite policy

Koneko is pre-user software. Active roadmap work assumes there is no supported production data or backwards-compatible upgrade path.

Every replacement roadmap must follow these rules:

- Design the intended final model directly. Do not preserve a weaker schema because an older module already exists.
- Do not plan data migrations, backfills, import bridges, dual reads, dual writes, compatibility adapters, shadow tables, or legacy fallbacks.
- Do not maintain old and new product concepts at the same time in a releasable branch.
- Existing modules may be used as behavioral evidence, test references, or deletion checklists only. They are not long-term dependencies of their replacements.
- Remove superseded contracts, persistence, services, routes, UI, tests, and documentation in the same atomic release unit that introduces the replacement.
- A development rollback means reverting the complete change or resetting the local database. It does not mean restoring a supported legacy runtime path.
- Schema-heavy work targets a fresh database generated from the current source schema. Roadmaps must not create upgrade or recovery work for unsupported historical data.

Temporary scaffolding is acceptable only inside an implementation branch when it is removed before that branch is considered releasable. It must never become an accepted shipped state or follow-up maintenance burden.

## Stable feature policy

Do not use `MVP` in active roadmap language.

A roadmap must do one of the following:

1. Deliver a stable, complete product boundary for the scope it owns; or
2. Name the exact follow-up roadmap that owns the intentionally deferred capability and define the release gate between them.

A phase is an implementation checkpoint, not permission to ship an incomplete product concept. Avoid inert controls, dead placeholder panels, fake data, or settings that have no runtime consumer.

A foundation roadmap is valid only when its own authoring and user workflows are stable. Advanced capabilities may remain in named follow-up roadmaps, but the foundation must not rely on an unnamed future phase to become usable.

## Target architecture

Describe the intended architecture clearly enough that an agent can implement without guessing.

For full-stack roadmaps, include:

- shared contracts,
- server services and repositories,
- database schema impact for a fresh database,
- client routes, components, forms, and state,
- tests,
- atomic replacement and deletion strategy when old work is superseded.

For agentic or AI roadmaps, include:

- agent roles,
- tool boundaries,
- human approval points,
- persisted state,
- transient runtime state,
- stream/event model,
- guardrails or processors,
- observability/tracing,
- usage/cost tracking,
- failure and recovery behavior.

For UX roadmaps, include:

- affected routes and surfaces,
- desktop/mobile behavior split,
- keyboard and screen-reader expectations,
- component ownership,
- state persistence, if any,
- visual or interaction constraints.

## Bloat control

Do not write abstract architecture prose that does not constrain implementation.

Good:

```md
`packages/shared/src/contract/characters.contract.ts` defines the request/response schema before server and web changes.
```

Bad:

```md
The architecture should be scalable, clean, robust, and modular.
```

## Replacement policy

When a roadmap replaces old work, it must state:

- the exact source paths or product concepts being removed,
- the stable replacement behavior,
- the tests that prove the replacement,
- the atomic release gate that prevents old and new concepts from coexisting.

Do not add compatibility, migration, or maintenance phases. Verification happens before the direct replacement lands.

## Source-of-truth rule

The target architecture describes the desired future state. The current repository state section describes what exists today. Do not mix them.