# Roadmap Archive Standard

Load this module when moving roadmaps between `active/` and `archive/`, updating indexes, or deciding whether a roadmap is ready to close.

## Archive Checklist

A roadmap can move to `archive/` when:

- [ ] Status is `Completed and aligned`, `Historical`, `Superseded on purpose`, or `Rejected`.
- [ ] Current repository state is accurate.
- [ ] The owned feature boundary is stable and usable, not only contract-, schema-, or CRUD-complete.
- [ ] Shipped work is linked.
- [ ] Remaining work is assigned to a named roadmap or marked rejected/superseded with rationale.
- [ ] Acceptance criteria are complete; narrowing may not remove behavior required for the owned feature to be usable or trustworthy.
- [ ] Verification evidence is recorded.
- [ ] Fresh-database evidence exists for schema-heavy work.
- [ ] Direct replacements include source-removal evidence and no old/new runtime coexistence.
- [ ] No `MVP`, unnamed follow-up, migration, compatibility, fallback, dual-path, or dead-placeholder work remains.
- [ ] The roadmap no longer reads like active implementation instructions.

## Required Index Updates

When adding, archiving, renaming, or superseding a roadmap, update:

- `docs/roadmaps/README.md`,
- `docs/roadmaps/roadmap-audit.md`,
- `related_docs`, `supersedes`, and `superseded_by` fields,
- links from other roadmap files,
- linked GitHub issues and EPICs,
- atomic release-group references where applicable.

## Archive Statuses

Use:

- `Completed and aligned` for shipped work accurately documented as history.
- `Historical` for useful planning history that is not current direction.
- `Superseded on purpose` for work replaced by another approach.
- `Rejected` for work deliberately not pursued.

## Changelog Format

Use:

```md
| Date | Change |
| --- | --- |
| YYYY-MM-DD | Created roadmap. |
| YYYY-MM-DD | Updated status after repository audit. |
```

Record meaningful changes, especially feature-boundary, ownership, direct-replacement, and release-gate decisions. Do not record typo-only edits.

## Audit Maintenance

`roadmap-audit.md` should answer:

- Which roadmaps still represent real missing work?
- Which stable feature does each active roadmap own?
- Which roadmaps are historical?
- Which old concepts were intentionally deleted or replaced?
- Which roadmap should agents trust for a given domain?
- Which roadmaps form an atomic release group?
- Which deferrals have named owners?

Do not let archived documents appear as active backlog in the audit.

## Archive Quality Rules

- An archived roadmap reads as history, not instructions for future implementation.
- Any remaining open checkbox has a named deferral, rejection, or supersession rationale.
- A deferral cannot hide work required to make the owned feature complete.
- Avoid preserving misleading current-gap language after the feature ships.
- Prefer source evidence and verification notes over optimistic summaries.
- Historical migration documents may remain in archive but must not be revived as active Koneko policy.