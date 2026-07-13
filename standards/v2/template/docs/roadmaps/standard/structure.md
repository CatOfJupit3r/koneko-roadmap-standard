# Roadmap Structure Standard

Load this module when creating or reviewing the shape of a roadmap.

Every active roadmap must include the sections below in this order. The goal is consistency, but not bloat. Keep each section as short as possible while preserving enough truth for future agents and humans.

The main roadmap file carries the core planning flow. Verification, atomic landing, decisions, archive readiness, and changelog history live in companion files beside the main roadmap file inside the roadmap's slug-named folder.

## Required section order

```md
# Roadmap Title

> Status: <status>
> Last repo audit: <YYYY-MM-DD>
> Current summary: <one or two sentences explaining current truth>

## 1. Executive Summary

## 2. Problem / Opportunity

## 3. Goals

## 4. Non-Goals

## 5. Current Repository State

## 6. User Stories / Use Cases

## 7. Design Principles And Constraints

## 8. Target Architecture

## 9. Implementation Plan

## 10. Acceptance Criteria

## 11. Risks And Mitigations
```

Companion files:

```md
<slug>.verification.md
<slug>.rollout.md
<slug>.decisions.md
<slug>.archive.md
<slug>.changelog.md
```

## Stable feature requirement

Active roadmaps must describe a stable product boundary, not an `MVP` that depends on unspecified future work.

Before implementation starts, the roadmap must answer:

- What complete user workflow does this roadmap own?
- What makes that workflow stable enough to keep?
- Which advanced capabilities are intentionally owned by named follow-up roadmaps?
- Can this roadmap release independently, or is it part of an atomic release group with another roadmap?
- Which superseded feature is deleted before the release group lands?

Do not use non-goals to defer work that is required for the owned feature to be usable, trustworthy, or maintainable.

## Section intent

### 1. Executive Summary

Describe the work, why it matters, the stable outcome the roadmap should produce, and any named roadmap that completes an intentionally separate capability.

### 2. Problem / Opportunity

Explain the user, product, engineering, or agentic problem.

Include:

- the pain point,
- who is affected,
- why now,
- what breaks or remains weak if this is not done.

### 3. Goals

List concrete, outcome-based, verifiable goals. Goals should describe durable behavior rather than temporary scaffolding.

### 4. Non-Goals

List what this roadmap will not do. Use this aggressively to prevent scope creep, but route every meaningful deferral to a named owner.

### 5. Current Repository State

Describe the current implementation and documentation state. Existing features that will be replaced are implementation evidence, not compatibility requirements. See `current-state.md`.

### 6. User Stories / Use Cases

Use user stories for product behavior and system scenarios for internal architecture. See `use-cases.md`.

### 7. Design Principles And Constraints

List project constraints that should shape implementation. Include the fresh-state rewrite policy when replacing existing work. See `architecture.md`.

### 8. Target Architecture

Describe the intended architecture, package boundaries, data flow, deletion boundary, and test strategy. See `architecture.md`.

### 9. Implementation Plan

Use phased work with exit criteria. Phases are implementation checkpoints and are not automatically releasable partial products. See `phases.md`.

### 10. Acceptance Criteria

Create final roadmap-level completion criteria grouped by product behavior, API/contracts, persistence, UI/UX, testing, observability, documentation, and atomic landing as applicable.

Acceptance criteria must prove the owned feature is stable, not merely present.

### 11. Risks And Mitigations

Use a table:

```md
| Risk | Impact | Mitigation | Owner |
| --- | --- | --- | --- |
| <risk> | <impact> | <mitigation> | <owner> |
```

## Companion file intent

### `<slug>.verification.md`

Document roadmap-wide verification, phase evidence, final completion checks, and direct-replacement assertions. See `verification.md`.

### `<slug>.rollout.md`

Describe the atomic landing sequence, fresh-state database reset, verification gate, deletion of superseded work, and whole-change revert strategy.

Do not plan data migration, dual-run, compatibility, backfill, or maintenance of the superseded feature.

### `<slug>.decisions.md`

Record decisions that prevent stale checkboxes and false missing-work signals. See `decisions.md`.

### `<slug>.archive.md`

Document what remains before the roadmap can move to `archive/`. See `archive.md`.

### `<slug>.changelog.md`

Record meaningful roadmap changes.

## Bloat control rules

- Do not paste long code examples unless they are essential to implementation.
- Prefer links to current source files over repeating implementation details.
- If a section is not applicable, write a brief explanation instead of expanding it artificially.
- Keep implementation phases short enough for agent execution.
- Move intentionally deferred ideas into decisions/deferrals and name their owning roadmap.
- Do not duplicate the same acceptance criterion in multiple places unless the repeated version adds useful grouping.
- Do not create placeholder features merely to satisfy a roadmap section.