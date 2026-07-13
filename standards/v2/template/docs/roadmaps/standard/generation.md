# Roadmap Generation Standard

Load this module when creating a new roadmap skeleton.

## Command

Create a new active roadmap with:

```bash
pnpm run roadmap:create -- --title "Roadmap Title" --slug roadmap-slug --type feature-epic --priority P1
```

## Options

| Option | Required | Default | Description |
| --- | --- | --- | --- |
| `--title` | yes | none | Human-readable roadmap title. |
| `--slug` | no | generated from title | Kebab-case slug used for filename and frontmatter. |
| `--type` | no | `feature-epic` | Roadmap type from `metadata.md`. |
| `--priority` | no | `P1` | Priority from `metadata.md`. |
| `--status` | no | `Active backlog` | Initial status. |
| `--dir` | no | `active` | Target folder under `docs/roadmaps/`. Usually `active`. |
| `--date` | no | today | Date used for `created`, `updated`, and `last_repo_audit`. |
| `--force` | no | false | Overwrite an existing file. Use rarely. |

## Generated file

The generator creates:

```text
docs/roadmaps/<dir>/<slug>/
  <slug>.roadmap.md
  <slug>.verification.md
  <slug>.rollout.md
  <slug>.decisions.md
  <slug>.archive.md
  <slug>.changelog.md
```

Together, these files include:

- required frontmatter,
- the main roadmap sections,
- placeholder checklists,
- phase and acceptance criteria templates,
- per-phase verification placeholders inside the main roadmap,
- general verification, rollout, decisions, archive checklist, and changelog templates as companion files.

## After generation

After creating a roadmap skeleton:

1. Fill in current repository state from source evidence.
2. Delete placeholder bullets that do not apply.
3. Add concrete user stories or system scenarios.
4. Add phases small enough for agent execution.
5. Add real verification commands.
6. Update `docs/roadmaps/README.md` and `docs/roadmaps/roadmap-audit.md` if the roadmap becomes active backlog.

## Agent guidance

Generating a skeleton is not the same as creating a trustworthy roadmap.

A generated roadmap is only ready for implementation after:

- current state is audited,
- goals and non-goals are concrete,
- phases are small and ordered,
- acceptance criteria are testable,
- verification plan names real checks.

If an agent is asked to generate a roadmap and implement it in the same session, it should first generate the roadmap, then use `.agents/skills/roadmap-task-slicing/SKILL.md` to create implementation packets.
