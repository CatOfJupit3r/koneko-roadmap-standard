# Use Cases And Acceptance Criteria Standard

Load this module when writing or reviewing user stories, system scenarios, and acceptance criteria.

## Product user stories

Use this format for user-facing product work:

```md
### UC1: <short name>

**Actor:** <user/system/agent>
**Goal:** <goal>
**Current behavior:** <what happens today>
**Target behavior:** <what should happen>
**Acceptance criteria:**
- [ ] <testable condition>
- [ ] <testable condition>
```

## System scenarios

For internal architecture roadmaps, replace user stories with system scenarios:

```md
### SC1: <short name>

**Component:** <service/package/module>
**Current behavior:** <what happens today>
**Target behavior:** <what should happen>
**Invariants:**
- <rule that must remain true>
**Acceptance criteria:**
- [ ] <testable condition>
- [ ] <testable condition>
```

## Acceptance criteria rules

Good acceptance criteria are:

- observable,
- testable or explicitly reviewable,
- tied to user or system behavior,
- narrow enough to prove,
- not phrased as implementation wishes unless implementation detail is the requirement.

Good:

```md
- [ ] Command palette opens with Cmd+K / Ctrl+K from any route.
- [ ] Escape closes the palette and returns focus to the triggering element.
```

Bad:

```md
- [ ] Make command palette good.
- [ ] Use a nice abstraction.
```

## Avoid criteria bloat

Do not create a separate user story for every small UI detail. Group related behavior into one use case when a user would experience it as one flow.

Do not duplicate all use-case criteria again in phase exit criteria. Phase exit criteria should reference the specific criteria the phase satisfies.

## Agent-safe criteria

For roadmap phases executed by agents, acceptance criteria should make it hard to falsely claim completion.

Prefer criteria that mention:

- exact visible UI behavior,
- exact API/contract shape,
- exact persistence behavior,
- exact error behavior,
- exact validation command or test expectation,
- manual QA path when automation is not enough.

## Non-goal interaction

If a requested behavior is intentionally excluded, do not leave it as an unchecked acceptance criterion. Move it to `Decisions, Deferrals, And Superseded Work` with rationale.
