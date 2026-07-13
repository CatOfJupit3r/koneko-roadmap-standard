# Roadmap Verification Standard

Load this module when writing verification plans, marking checkboxes complete, or reviewing whether a roadmap item is truly done.

## Verification Plan Categories

Use only categories that apply:

- unit tests,
- integration tests,
- type checks,
- lint,
- accessibility checks,
- performance validation,
- manual QA path,
- AI evals,
- trace/telemetry validation,
- fresh-database validation,
- direct-replacement and source-removal validation.

Do not use data migration, backfill, compatibility, dual-run, or legacy fallback verification as active-roadmap categories. Koneko validates replacement schemas by creating a fresh database from current source.

For AI and agentic features, include:

- expected traces,
- tool-call auditability,
- usage/cost tracking,
- failure-mode tests,
- approval workflow tests,
- stale-source or stale-proposal tests,
- regression prompts or eval scenarios.

For replacement features, include:

- final source-path inventory,
- fresh database create/seed smoke checks,
- old contract/schema/service/route/UI/test removal checks,
- repository search for forbidden imports, fields, routes, labels, flags, and fallbacks,
- whole-change revert expectations,
- proof that old and new product concepts cannot execute together.

## Stable Feature Evidence Rule

A roadmap item may be marked complete only when evidence exists. A roadmap may be archived only when its owned feature boundary is stable, not merely present.

Evidence can be:

- passing command output,
- a targeted test,
- source file references,
- CI evidence,
- explicit manual QA notes when automation is not enough,
- a fresh-database smoke report,
- a source-removal report for direct replacements.

Do not claim completion from intent or code edits alone.

## Narrow Validation First

Prefer the narrowest relevant checks first:

```bash
pnpm --filter=web run check-types
pnpm --filter=server run check-types
pnpm --filter=@koneko/shared run check-types
```

Run root checks when changes cross packages:

```bash
pnpm run check-types
pnpm run lint
```

Run tests based on the changed surface:

| Changed surface | Expected validation |
| --- | --- |
| Server service/router/auth/DB logic | server integration or unit test |
| Shared contract/schema/constants | shared check-types plus dependent-package checks |
| Web component/hook/state behavior | web test or component-level verification |
| E2E-critical user flow | Playwright spec and/or explicit manual QA note |
| Fresh-state schema | recreate database, seed, and smoke critical reads/writes |
| Direct replacement | final behavior tests plus repository/source-removal checks |
| Docs-only roadmap change | markdown and ownership review; no code checks unless code changed |

## Roadmap Checkbox Policy

A checkbox may change from `[ ]` to `[x]` only when:

1. implementation is present,
2. relevant acceptance criteria are satisfied,
3. the narrow validation command passed or manual QA evidence is recorded,
4. no known blocker remains,
5. the item is not intentionally deferred or superseded,
6. any required source-removal or fresh-database evidence exists.

If validation was not run, say so. Do not mark the item complete.

A phase being complete does not make an incomplete replacement releasable. Atomic release groups remain blocked until all participating roadmap gates pass.

## Verification Matrix

For complex work, include a matrix:

```md
| Item | Evidence | Verdict |
| --- | --- | --- |
| <acceptance criterion> | `<file>` / `<command>` | satisfied / not satisfied / cannot verify |
```

Use this for roadmap audits, stable-feature reviews, and direct-replacement checks.

## Manual QA Notes

Manual QA is acceptable when automation is expensive or impossible, but it must be specific.

Good:

```md
Manual QA: Chrome mobile emulation at 390x844. Opened chat, tapped inspector handle, verified peek/half/full snap points and preserved state after closing/reopening.
```

Bad:

```md
Manual QA looked good.
```

For stable workflows, manual QA should exercise the complete user journey, including empty, loading, failure, recovery, stale, mobile, keyboard, and permission states where relevant.

## Failed Validation

Failed validation must be recorded honestly. A failed check can still be useful progress, but it cannot support completion.

If a task is partially done:

- leave the checkbox unchecked,
- report what works,
- report the failing command or blocker,
- provide the smallest next fix,
- do not preserve an old runtime concept as a fallback.

## Direct-Replacement Completion Rule

A replacement roadmap cannot be marked complete while any of the following remains in releasable source:

- old contracts or public fields,
- old persistence or indexes,
- old services, routers, jobs, tools, or prompts,
- old navigation, routes, UI, labels, or settings,
- old tests that imply supported behavior,
- compatibility adapters, feature flags, dual paths, or fallbacks,
- active documentation instructing maintainers to preserve the superseded feature.