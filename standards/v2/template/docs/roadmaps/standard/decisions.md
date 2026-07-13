# Roadmap Decisions Standard

Load this module when updating accepted decisions, deferrals, superseded work, rejected ideas, stable feature boundaries, atomic release groups, or stale open checkboxes.

## Purpose

Decision records prevent old roadmap text from misleading future humans and agents.

Use them to record:

- accepted product or architecture decisions,
- stable feature completion boundaries,
- fresh-state direct-rewrite rules,
- atomic release groups,
- intentionally deferred work with a named owner,
- rejected work,
- superseded implementation paths,
- stale checklist items that should no longer be treated as backlog.

## Decision Format

```md
### Decision: <title>

**Status:** accepted / deferred / rejected / superseded
**Date:** YYYY-MM-DD
**Rationale:** <why>
**Effect on roadmap:** <what changes, who owns follow-up work, and whether it affects the release gate>
```

## Handling Unchecked Items

Unchecked items that are no longer desired must become one of:

- `deferred` to a named roadmap,
- `rejected`,
- `superseded` by a named implementation or roadmap.

Do not leave intentionally replaced work as an open checkbox.

If a different roadmap owns the work, link it and state whether the current roadmap can release independently or belongs to an atomic release group.

If source code implemented a different approach on purpose, explain why the old approach is not missing work.

## Stable Feature Rule

A decision may not use deferral to remove behavior required for the roadmap's owned feature to be usable, trustworthy, accessible, or maintainable.

Examples of invalid deferral:

- shipping an editor without save failure or conflict behavior and calling recovery “future polish”;
- shipping persistent configuration without a runtime consumer;
- shipping a search provider placeholder without source records;
- preserving an old module because deletion is inconvenient;
- labeling a partial workflow as an `MVP` without an accepted roadmap that completes it.

When capability boundaries are intentionally separate, record:

- the stable feature this roadmap delivers,
- the exact follow-up roadmap,
- the contracts or provider seam between them,
- the release dependency or atomic group.

## Common Decision Types

### Accepted

Use when a product or architecture choice is now the intended path.

### Deferred

Use only when the work remains valuable, has a named owner or explicit inactive status, and is not required for the current stable feature boundary.

### Rejected

Use when the work should not be done unless product direction changes. Rejected migration, compatibility, fallback, and dual-run ideas should be explicit enough that agents do not revive them.

### Superseded

Use when an older plan, concept, or module was replaced by a different implementation or roadmap. Name the replacement and deletion boundary.

## Agent Guidance

When an agent finds an unchecked item that conflicts with current source or product direction:

1. Do not implement it blindly.
2. Check current source state.
3. Check active roadmap ownership and atomic release groups.
4. Apply Koneko's fresh-state direct-rewrite and stable-feature policies.
5. Add or update a decision entry.
6. Remove, reclassify, or reroute the stale checkbox.
7. Update linked GitHub issues and roadmap indexes.

## Quality Rules

- Decisions explain why, not only what.
- Deferrals name the owner and clarify the current roadmap's release boundary.
- Superseded entries point to the replacement and expected source deletion.
- Rejected entries prevent accidental revival.
- Do not use `MVP` as a substitute for defining a stable feature.
- Do not describe data migration, compatibility, or preservation of unsupported historical state as active Koneko requirements.