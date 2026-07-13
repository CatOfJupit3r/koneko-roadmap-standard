# Koneko Roadmap Standard

Versioned, checksum-verifiable copies of Koneko's roadmap standard, plus an interactive native-TypeScript CLI that installs the standard and its portable roadmap-agent skills into another Git repository.

## What is included

| Version | Shape | Source |
| --- | --- | --- |
| `v1` | The historical single-file roadmap standard. | `CatOfJupit3r/koneko@d3b040d4e3d7dbcf7f5e1eae01fd1120e4b7e873`, immediately before Koneko PR #181 modernized it. |
| `v2` | The current modular router plus focused metadata, structure, current-state, use-case, architecture, phase, verification, decision, archive, and generation modules. | `CatOfJupit3r/koneko@6df04c10c51118ce8b9728d09fec8a54d8d2c063`; the standard-file blobs were also verified against `main@2d495383769bfdad84a7b716917841d5abef5c09`. |

Koneko PR #181, **Add budget-aware agent workflow and modular roadmap standard**, is the historical boundary between v1 and v2.

The repository also contains five portable roadmap skills copied from Koneko's last pre-bee commit. Bee-driven-development and `hive-orchestration` code are deliberately excluded.

## Requirements

- Node.js 22.18.0 or newer, with native TypeScript type stripping.
- A target Git repository or worktree. The target must contain a `.git` directory or file.
- No package installation and no runtime dependencies are required when running a clone.

## Interactive setup

Clone the repository and run the repository itself with Node:

```bash
git clone https://github.com/CatOfJupit3r/koneko-roadmap-standard.git
cd koneko-roadmap-standard
node .
```

The `main` package entry points directly to `src/cli.ts`, so `node .` starts the setup wizard without `npx`, a generated JavaScript build, or a TypeScript runtime.

You can also keep the tool beside another repository and run it while the target repository is the current working directory:

```bash
cd ../my-repository
node ../koneko-roadmap-standard
```

The current working directory becomes the suggested target path, but the wizard lets you replace it before anything is inspected or written.

### What the wizard asks

The bare `node .` and `node . init` commands prompt for:

1. the target Git repository,
2. roadmap standard `v2` or legacy `v1`,
3. all roadmap skills, selected skills, or no new skills,
4. confirmation after a checksum-validated dry-run.

The recommended defaults are `v2` and all portable roadmap skills. The wizard prints every create, update, keep, and remove operation before asking for permission to write. After installation it immediately verifies every managed file against the lockfile and bundled manifests.

If existing managed files have drifted, or an unmanaged file occupies a destination path, the wizard explains the conflict and asks separately before enabling force mode. Declining either confirmation leaves the repository unchanged.

### Run an interactive dry-run

```bash
node . init --interactive --dry-run
```

Supplied init options become wizard defaults when `--interactive` is present:

```bash
node . init \
  --interactive \
  --path ../my-repository \
  --standard v1
```

## Automation and CI

Flags remain available as a secondary, non-interactive interface for scripts and CI. Supplying init options without `--interactive` skips the wizard and preserves the original automation behavior.

Install v2 and all skills:

```bash
node . init --path ../my-repository --standard v2 --skills
```

Install selected skills:

```bash
node . init \
  --path ../my-repository \
  --standard v2 \
  --skill roadmap-creation-workflow \
  --skill roadmap-phase-audit
```

Preview without writing:

```bash
node . init --path ../my-repository --standard v2 --skills --dry-run
```

The installed package binaries remain available as `koneko-roadmap-standard` and `koneko-roadmap`; they accept the same commands and options.

## Verify and inspect

Verify the installed copy in the current working directory:

```bash
node . verify
```

Verify another repository:

```bash
node . verify --path ../my-repository
```

When no lockfile exists, verify a manually copied standard by naming its version:

```bash
node . verify --standard v2
```

A checksum mismatch or missing managed file makes `verify` exit with a non-zero status.

List bundled standards and skills:

```bash
node . list
```

Use `--json` with non-interactive commands for machine-readable output.

## Commands and options

### `init`

Bare `init` is interactive. Supplying one or more init options is non-interactive unless `--interactive` is also supplied.

| Option | Meaning |
| --- | --- |
| `--path <directory>` | Target repository. Defaults to the current working directory. |
| `--standard <v1\|v2>` | Standard to install. Defaults to `v2`. |
| `--skills` | Install all bundled portable roadmap skills. |
| `--skill <name>` | Install one named skill. Repeat as needed. |
| `--dry-run` | Show planned operations without changing files. |
| `--force` | Replace drifted managed files or conflicting unmanaged destination files. |
| `--interactive` | Run the wizard and use supplied options as defaults. |
| `--json` | Emit JSON in non-interactive mode. |

### `verify`

| Option | Meaning |
| --- | --- |
| `--path <directory>` | Repository to verify. Defaults to the current working directory. |
| `--standard <v1\|v2>` | Expected version when the repository has no lockfile. |
| `--json` | Emit JSON. |

### `list`

Lists available versions, file counts, skill names, installation paths, and checksums.

## Checksum and overwrite safety

Every standard and skill manifest records the original Git blob SHA-1 for each installable file. Git blob hashes are calculated over:

```text
blob <byte-length>\0<file-bytes>
```

The CLI applies that checksum at four boundaries:

1. **Bundled source integrity** — before any operation, the CLI checks every selected source file against its manifest. A damaged or edited package copy is rejected.
2. **Interactive preflight** — the wizard resolves the requested version and skills through a dry-run before offering to write.
3. **Pre-overwrite repository integrity** — when `.koneko-roadmap-standard.json` exists, `init` verifies all currently managed target files before changing anything. Drift is rejected unless force mode is explicitly accepted or `--force` is supplied.
4. **Post-install verification** — the wizard and the `verify` command check target files against both the lockfile and bundled manifests.

The installer also refuses to overwrite an existing destination file that it does not already manage unless force mode is explicitly accepted.

Force mode affects only paths owned by the selected standard or skills. Review the dry-run carefully because local edits to those managed files will be replaced with the exact versioned copy.

## Lockfile

A successful installation writes:

```text
.koneko-roadmap-standard.json
```

It records:

- the installed standard version,
- source repository and ref metadata,
- installed skill names,
- every managed target path,
- the source path inside this package,
- the expected Git blob checksum.

The lockfile lets the CLI distinguish managed files from unrelated repository files. When switching versions, stale files are removed only when they were recorded as managed by the prior lockfile. Installed skills are preserved across a standard-version switch; choosing “no new skills” in the wizard does not delete already managed skills.

Commit the lockfile with the installed standard so reviews and CI can verify the exact snapshot.

## Installed layouts

### v1

```text
docs/
  roadmaps/
    standard.md
.koneko-roadmap-standard.json
```

### v2

```text
docs/
  roadmaps/
    standard.md
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
.koneko-roadmap-standard.json
```

With skills enabled:

```text
.agents/
  skills/
    agent-implementation-proof/SKILL.md
    codex-diff-verification/SKILL.md
    roadmap-creation-workflow/SKILL.md
    roadmap-phase-audit/SKILL.md
    roadmap-task-slicing/SKILL.md
```

## Portable roadmap skills

| Skill | Use |
| --- | --- |
| `roadmap-creation-workflow` | Create a roadmap, revise a stale plan, supersede an old direction, or turn research into a source-backed roadmap. |
| `roadmap-task-slicing` | Break a broad implementation phase into small, independently verifiable packets. |
| `agent-implementation-proof` | Require changed-file, command, validation, and incomplete-work evidence from an implementation agent. |
| `codex-diff-verification` | Review a branch, pull request, or diff against roadmap acceptance criteria and checkbox truth. |
| `roadmap-phase-audit` | Audit whether a phase actually shipped and perform the archive ritual after proof passes. |

These are verbatim Koneko snapshots. They retain Koneko-specific examples such as package paths and `pnpm` commands. Keep the managed copies unchanged when checksum verification matters; add repository-specific instructions separately.

## Standard provenance and fidelity

The installable standards live below version-owned folders and retain their original repository-relative paths:

```text
standards/
  v1/
    manifest.json
    template/docs/roadmaps/standard.md
  v2/
    manifest.json
    template/docs/roadmaps/standard.md
    template/docs/roadmaps/standard/*.md
```

Each copied source file was accepted only after recreating the exact original Git blob checksum. The version README files document their source commits and modernization boundary.

## Repository layout

```text
package.json              # exposes src/cli.ts as the node directory entrypoint
src/
  checksum.ts
  bootstrap.ts
  cli.ts                  # commands, native prompts, preview, confirmation, verification
standards/
  v1/
  v2/
skills/
  manifest.json
  <skill>/SKILL.md
test/
  checksum.test.ts
  bootstrap.test.ts
  cli.test.ts             # executes the cloned repository with `node .`
```

The CLI uses TypeScript syntax that Node can erase directly. Its interactive prompts use `node:readline/promises`; no transpiler, prompt package, or runtime library is required.

## Development and validation

Start the wizard:

```bash
npm start
```

Run the tests:

```bash
npm test
```

Run syntax checks and tests:

```bash
npm run check
```

The tests cover canonical Git blob hashes, standard installation, lockfile checksums, drift detection, force restoration, skill installation, verification, v2-to-v1 cleanup of stale managed modules, the `node .` package entrypoint, and an end-to-end interactive installation.
