# Koneko Roadmap Standard

This file is the lightweight entry point for Koneko roadmap authoring, execution, audit, and archival rules.

The detailed standard is split into focused modules under `docs/roadmaps/standard/` so agents can load only the part they need instead of pulling a large all-in-one document into context.

## Fast path for agents

Always start with:

1. `docs/roadmaps/standard/README.md`
2. The target roadmap file
3. The smallest relevant standard module from the table below

| Task | Load these modules |
| --- | --- |
| Create a new roadmap | `standard/generation.md`, `standard/metadata.md`, `standard/structure.md` |
| Audit whether a roadmap is still true | `standard/current-state.md`, `standard/decisions.md`, `standard/archive.md` |
| Implement a roadmap phase | `standard/phases.md`, `standard/verification.md`, `.agents/skills/roadmap-task-slicing/SKILL.md` |
| Mark checkboxes complete | `standard/phases.md`, `standard/verification.md`, `.agents/skills/agent-implementation-proof/SKILL.md` |
| Verify another agent's roadmap work | `standard/verification.md`, `.agents/skills/codex-diff-verification/SKILL.md` |
| Archive or supersede a roadmap | `standard/decisions.md`, `standard/archive.md` |
| Update roadmap indexes | `standard/archive.md`, `docs/roadmaps/README.md`, `docs/roadmaps/roadmap-audit.md` |

## Canonical modules

- `docs/roadmaps/standard/README.md` — route map, directory rules, status values, and minimum expectations.
- `docs/roadmaps/standard/metadata.md` — frontmatter, status, priority, type, and naming rules.
- `docs/roadmaps/standard/structure.md` — required roadmap sections and section order.
- `docs/roadmaps/standard/current-state.md` — how to write evidence-backed current repository state.
- `docs/roadmaps/standard/use-cases.md` — user stories, system scenarios, and acceptance criteria patterns.
- `docs/roadmaps/standard/architecture.md` — design principles, constraints, target architecture expectations.
- `docs/roadmaps/standard/phases.md` — phased implementation plan rules and agent-safe slicing.
- `docs/roadmaps/standard/verification.md` — verification plan, validation evidence, and completion rules.
- `docs/roadmaps/standard/decisions.md` — decisions, deferrals, superseded work, and stale-checkbox handling.
- `docs/roadmaps/standard/archive.md` — archive checklist, indexes, audit maintenance, and changelog rules.
- `docs/roadmaps/standard/generation.md` — how to generate roadmap skeletons with `pnpm run roadmap:create`.

## Generator

Create a new roadmap skeleton with:

```bash
pnpm run roadmap:create -- --title "Roadmap Title" --slug roadmap-slug --type feature-epic --priority P1
```

The generator writes a slug-named folder under `docs/roadmaps/active/` by default, containing the main roadmap file plus companion verification, rollout, decisions, archive, and changelog files. See `docs/roadmaps/standard/generation.md` for all options.

## Core principle

A roadmap should remain a trustworthy source of planning truth, but agents should not need to load every section for every task. Keep each roadmap complete enough for humans and audits, then use the modular standard and task-slicing skills to reduce active agent context.
