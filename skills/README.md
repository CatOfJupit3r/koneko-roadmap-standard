# Portable roadmap skills

These skills are checksum-verified copies from `CatOfJupit3r/koneko` at `6df04c10c51118ce8b9728d09fec8a54d8d2c063`, the last commit before bee orchestration changed the roadmap-agent workflows.

The distribution intentionally excludes `hive-orchestration` and all bee-driven-development additions.

## Included skills

| Skill | Purpose |
| --- | --- |
| `roadmap-creation-workflow` | Create, substantially revise, supersede, or research a source-backed roadmap. |
| `roadmap-task-slicing` | Split a broad roadmap phase into independently verifiable work packets. |
| `agent-implementation-proof` | Require evidence-backed implementation and checkbox-completion reports. |
| `codex-diff-verification` | Review a branch, pull request, or diff against roadmap acceptance criteria. |
| `roadmap-phase-audit` | Audit implementation truth and archive a completed roadmap. |

## Installation

Install every skill with the standard:

```bash
koneko-roadmap-standard init --standard v2 --skills
```

Install selected skills by repeating `--skill`:

```bash
koneko-roadmap-standard init \
  --standard v2 \
  --skill roadmap-creation-workflow \
  --skill roadmap-phase-audit
```

Skills are written to `.agents/skills/<name>/SKILL.md` in the target repository and recorded in `.koneko-roadmap-standard.json`.

## Portability note

The files are preserved verbatim, so some examples name Koneko-specific paths, package commands, Codex, or Claude Code. Preserve the versioned copies when checksum verification matters; put repository-specific overrides in separate instruction files rather than silently changing the managed skill files.
