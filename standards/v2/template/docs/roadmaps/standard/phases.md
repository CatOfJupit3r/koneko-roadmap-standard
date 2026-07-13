# Roadmap Phases Standard

Load this module when writing, slicing, implementing, or reviewing implementation phases.

## Phase format

Use phased work with exit criteria:

```md
### Phase 1: <name>

**Purpose:** <why this phase exists>

**Scope:**
- [ ] <implementation item>
- [ ] <implementation item>

**Exit criteria:**
- [ ] <verifiable condition>
- [ ] <test or validation condition>

**Phase verification:**
- [ ] <narrow validation command, targeted test, or manual QA path>

**Can run in parallel:**
- <safe parallel task, if any>

**Must not start until:**
- <dependency, if any>
```

## Phase rules

- Each phase must produce a coherent implementation checkpoint.
- A phase is not automatically a releasable product state.
- Do not expose incomplete replacement concepts, inert settings, or dead placeholder panels merely because an early phase is complete.
- Avoid vague phases such as "polish" unless the tasks are specific.
- Do not mix unnamed future-epic ideas into the core completion path.
- If something is intentionally deferred, move it to decisions/deferrals and name the owning roadmap.
- Keep phases small enough for AI agents to execute safely.
- If a phase remains broad, slice it into agent work packets before implementation.
- When replacing a feature, schedule removal of the superseded source paths inside the same atomic release group. Do not create compatibility or migration phases.

## Atomic release groups

Multiple roadmaps may share one release gate when dependency order requires separate implementation plans.

An atomic release group must:

- name every participating roadmap,
- identify the final stable product state,
- prohibit merging or releasing a state where old and new concepts coexist,
- include deletion of superseded contracts, persistence, services, routes, UI, tests, and documentation,
- verify against a fresh database,
- define whole-change revert as the only rollback.

Intermediate branches may contain temporary scaffolding, but it must be removed before the release group is considered complete.

## Agent work packets

For broad phases, create packets before implementation. Use `.agents/skills/roadmap-task-slicing/SKILL.md`.

A good packet has:

- one clear outcome,
- a small likely file surface,
- explicit acceptance criteria,
- narrow validation commands,
- an executor recommendation,
- clear non-goals,
- a statement of what may be marked complete after validation.

Example:

```md
### Packet 1: Message composer character counter

**Goal:** Add visible `n / max` counter to the chat composer.
**Executor:** Claude Code first, Codex review after diff.
**Likely files:**
- `apps/web/src/features/chats/...`

**Acceptance criteria:**
- Counter is visible.
- Counter updates while typing.
- Counter warns at 90% of the configured limit.

**Validation:**
- `pnpm --filter=web run check-types`
- relevant component test or manual QA note

**Do not touch:**
- unrelated chat message rendering
- backend contracts
```

## Completion policy

A phase is complete only when:

1. all required scope checkboxes are complete or intentionally deferred to a named owner with rationale,
2. exit criteria are satisfied,
3. relevant acceptance criteria are satisfied,
4. verification evidence is recorded,
5. roadmap checkboxes reflect actual source state.

A roadmap is complete only when its stable feature boundary is usable and any superseded concept has been removed from the releasable codebase.

Do not mark a whole phase complete just because code was edited.

## Parallelization rules

Use `Can run in parallel` only when tasks do not compete for the same files, state model, fresh-schema definition, or UI surfaces.

If two tasks touch the same contracts, schema, form model, route tree, or shared component, treat them as sequential unless the roadmap explains the split.

## Budget-aware execution

For large roadmap work:

- use Codex for planning, architecture, and verification,
- use Claude Code or another bulk implementation agent for mechanical implementation,
- require `agent-implementation-proof` reports from implementation agents,
- use `codex-diff-verification` before trusting broad completion claims.

Do not let one agent both make broad changes and self-certify completion when correctness matters.