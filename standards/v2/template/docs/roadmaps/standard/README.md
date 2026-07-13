# Modular Roadmap Standard

This directory contains the detailed Koneko roadmap standard split into task-focused modules.

Use `docs/roadmaps/standard.md` as the stable public entry point. Use this file as the detailed route map once inside the modular standard.

## Why the standard is modular

Koneko roadmaps are source-of-truth planning artifacts, but full roadmap files can become large. Most agent tasks only need one slice of the standard:

- authors need metadata and section templates,
- implementers need phase and verification rules,
- auditors need current-state and decision rules,
- reviewers need validation and false-completion checks,
- archivists need archive and index rules.

Do not load every module by default. Load only the modules needed for the task.

## Directory rules

Use this structure:

```text
docs/roadmaps/
  README.md
  standard.md
  roadmap-audit.md
  standard/
    README.md
    metadata.md
    structure.md
    current-state.md
    use-cases.md
    architecture.md
    phases.md
    verification.md
    decisions.md
    archive.md
  generation.md
  active/
    <slug>/
      <slug>.roadmap.md
      <slug>.verification.md
      <slug>.rollout.md
      <slug>.decisions.md
      <slug>.archive.md
      <slug>.changelog.md
  archive/
    <slug>/
      <slug>.roadmap.md
      <slug>.verification.md
      <slug>.rollout.md
      <slug>.decisions.md
      <slug>.archive.md
      <slug>.changelog.md
```

Rules:

- `docs/roadmaps/active/` contains real active backlog, in-progress work, blocked work, or near-archive closure work.
- `docs/roadmaps/archive/` contains completed, historical, superseded, rejected, or stale-but-preserved records.
- `docs/roadmaps/roadmap-audit.md` indexes current roadmap truth and separates active work from historical noise.
- Keep `docs/roadmaps/standard.md` lightweight so agents can route quickly.

## Status values

Use one of these exact statuses:

| Status | Meaning | Folder |
| --- | --- | --- |
| `Proposed` | Worth considering, not committed | `active/` or future `proposed/` if added |
| `Active backlog` | Real backlog, not currently being implemented | `active/` |
| `In progress` | Work is actively being implemented | `active/` |
| `Partially active` | Major parts shipped, but real follow-up work remains | `active/` |
| `Blocked` | Valid roadmap, blocked by dependency or decision | `active/` |
| `Shipped - needs validation` | Implementation is live, verification or docs closure remains | `active/` |
| `Completed and aligned` | Shipped and accurately documented | `archive/` |
| `Historical` | Useful history, not current product direction | `archive/` |
| `Superseded on purpose` | Replaced by another approach; not missing work | `archive/` |
| `Rejected` | Deliberately not pursued | `archive/` |

Do not leave a roadmap in `active/` with `Completed and aligned`, `Historical`, `Superseded on purpose`, or `Rejected` status.

## Load map

| Task | Required modules |
| --- | --- |
| Generate a roadmap skeleton | `generation.md`, `metadata.md`, `structure.md` |
| Fill out a new roadmap | `metadata.md`, `structure.md`, `current-state.md`, `use-cases.md`, `architecture.md`, `phases.md`, `verification.md`, `decisions.md`, `archive.md` |
| Implement a phase | `phases.md`, `verification.md` |
| Slice a phase for agents | `phases.md`, `verification.md`, `.agents/skills/roadmap-task-slicing/SKILL.md` |
| Verify completed work | `verification.md`, `.agents/skills/codex-diff-verification/SKILL.md` |
| Audit roadmap truth | `current-state.md`, `decisions.md`, `archive.md` |
| Archive or supersede | `decisions.md`, `archive.md` |

## Minimum roadmap promise

Every active roadmap must answer:

1. Why the work exists.
2. What current repository reality is.
3. What must change.
4. What is explicitly out of scope.
5. How to implement safely.
6. How to verify completion.
7. When the roadmap should be archived.

A roadmap is not a loose idea dump. It is a source-of-truth planning document that can be executed, audited, and later archived without becoming misleading.
