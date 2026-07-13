# Current Repository State Standard

Load this module when writing or auditing the `Current Repository State` section of a roadmap.

This section is the most important anti-staleness section. It tells agents what already exists, what is missing, and what must not be rebuilt.

## Required content

Include the relevant current state for:

- apps/packages/features,
- contracts and schemas,
- database models and migrations,
- server services, repositories, and routers,
- client routes, components, hooks, and forms,
- tests and E2E coverage,
- docs and knowledge-base references,
- shipped work that should not be rebuilt,
- stale or superseded docs that should not be trusted.

## Evidence rule

Every meaningful claim should be grounded in repository evidence.

Good:

```md
| Feature | Current state | Evidence |
| --- | --- | --- |
| Story memory list | Implemented with cursor pagination | `apps/server/src/routers/stories.router.ts`, `apps/web/src/features/stories/...` |
```

Bad:

```md
The story memory list probably exists somewhere.
```

## Shipped-work protection

If a feature is already shipped, explicitly say it should not be rebuilt.

Use a table like:

```md
### Shipped work - do not rebuild

| Area | Evidence |
| --- | --- |
| <feature> | `<source path>` |
```

## Missing-work clarity

For missing work, distinguish:

- real backlog,
- blocked work,
- intentionally deferred work,
- superseded work,
- stale roadmap claims.

Use explicit wording:

```md
### Real missing work

- <item> is not implemented as of <date>. Evidence checked: <paths/searches>.

### Not missing / intentionally replaced

- <old plan> was replaced by <new approach>. See <doc/path>.
```

## Audit behavior

When auditing current state:

1. Read the roadmap.
2. Search source code for each implementation claim.
3. Prefer source code and tests over roadmap text.
4. Update `last_repo_audit` when source state is checked.
5. Move false open items to decisions/deferrals/superseded work.
6. Do not mark work missing just because an old roadmap mentioned it.

## Common mistakes

- Treating archived roadmaps as active backlog.
- Rebuilding shipped work because a stale checkbox remained open.
- Describing desired architecture as if it already exists.
- Writing vague state such as "partially implemented" without evidence.
- Omitting tests from the current-state audit.

## Agent loading guidance

Implementation agents usually need only the part of current state relevant to their phase.

Auditing agents should load the full current-state section and `decisions.md`.
