# Roadmap Metadata Standard

Load this module when creating, renaming, moving, archiving, or auditing roadmap metadata.

## File naming

Use kebab case:

```text
docs/roadmaps/active/<feature-or-epic-slug>/<feature-or-epic-slug>.roadmap.md
```

Examples:

```text
docs/roadmaps/active/ai-improvements/ai-improvements.roadmap.md
docs/roadmaps/active/storyteller-evals/storyteller-evals.roadmap.md
docs/roadmaps/archive/vector-database-module/vector-database-module.roadmap.md
```

Use `.roadmap.md` for roadmap files. Do not use `-roadmap.md` unless preserving an older historical filename.

## Required frontmatter

Every roadmap must start with YAML frontmatter:

```yaml
---
title: "Roadmap Title"
slug: "roadmap-slug"
status: "Active backlog"
roadmap_type: "feature-epic"
priority: "P1"
created: "YYYY-MM-DD"
updated: "YYYY-MM-DD"
last_repo_audit: "YYYY-MM-DD"
source_of_truth: true
related_docs:
  - "docs/features/example.md"
supersedes: []
superseded_by: null
archive_when:
  - "The owned feature boundary is stable and complete."
  - "All acceptance criteria are implemented or explicitly deferred to a named owner with rationale."
  - "Verification evidence is recorded."
  - "The document reads as shipped history instead of active implementation guidance."
---
```

## Allowed roadmap types

- `feature-epic`
- `agentic-epic`
- `ux-polish`
- `architecture`
- `cleanup`
- `testing`
- `observability`
- `research`
- `closure`

Do not create active `migration` roadmaps. Koneko uses fresh-state direct replacements and does not support historical data upgrade paths. Older migration documents may remain in `archive/` as repository history only.

## Allowed priorities

- `P0`
- `P1`
- `P2`
- `P3`

## Date rules

- `created`: date the roadmap file was created.
- `updated`: date the roadmap content last changed materially.
- `last_repo_audit`: date the current repository state was last checked against source code.

When only fixing typos, `updated` may stay unchanged.

When changing current-state claims, implementation status, checkboxes, decisions, feature boundaries, or archive readiness, update `updated`.

When auditing source code or repository reality, update `last_repo_audit`.

## Status and folder consistency

- `Proposed`, `Active backlog`, `In progress`, `Partially active`, `Blocked`, and `Shipped - needs validation` belong in `active/`.
- `Completed and aligned`, `Historical`, `Superseded on purpose`, and `Rejected` belong in `archive/`.

If the status implies archive, move the file to `archive/` and update:

- `docs/roadmaps/README.md`
- `docs/roadmaps/roadmap-audit.md`
- any links from other roadmaps

## Metadata quality rules

- Keep `title` human-readable.
- Keep `slug` stable once linked by other docs.
- Use `related_docs` for live implementation or architecture references, not random inspiration links.
- Use `supersedes` and `superseded_by` to prevent stale roadmaps from being treated as missing work.
- Keep `archive_when` specific enough that an agent can verify when the roadmap is ready to move.
- Do not use `MVP` in titles, summaries, statuses, or archive conditions.
- A roadmap that is part of an atomic release group must name the other roadmaps in `related_docs` and describe the release gate in its main and rollout files.