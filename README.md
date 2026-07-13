# Koneko Roadmap Standard

Versioned, checksum-verifiable copies of Koneko's roadmap standard, plus a native-TypeScript CLI that installs the standard and its portable roadmap-agent skills into another Git repository.

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
- No runtime dependencies.

## Run the CLI

From a published or installed package:

```bash
koneko-roadmap-standard init --standard v2 --skills
```

Directly from GitHub:

```bash
npx --yes github:CatOfJupit3r/koneko-roadmap-standard init --standard v2 --skills
```

From a clone of this repository:

```bash
node src/cli.ts init --standard v2 --skills
```

`init` targets the current working directory by default.

### Install into another repository

```bash
koneko-roadmap-standard init \
  --path ../my-repository \
  --standard v2 \
  --skills
```

On Windows PowerShell, the same command can be written on one line or continued with backticks.

### Install v1

```bash
koneko-roadmap-standard init --standard v1
```

### Install selected skills

Repeat `--skill` for each skill:

```bash
koneko-roadmap-standard init \
  --standard v2 \
  --skill roadmap-creation-workflow \
  --skill roadmap-phase-audit
```

### Preview without writing

```bash
koneko-roadmap-standard init --standard v2 --skills --dry-run
```

### Verify the installed copy

```bash
koneko-roadmap-standard verify
```

Verify a repository at another path:

```bash
koneko-roadmap-standard verify --path ../my-repository
```

When no lockfile exists, verify a manually copied standard by naming its version:

```bash
koneko-roadmap-standard verify --standard v2
```

A checksum mismatch or missing managed file makes `verify` exit with a non-zero status.

### List bundled standards and skills

```bash
koneko-roadmap-standard list
```

All commands support `--json` for machine-readable output.

## Commands and options

### `init`

`init` is the default command, so it may be omitted.

| Option | Meaning |
| --- | --- |
| `--path <directory>` | Target repository. Defaults to the current directory. |
| `--standard <v1\|v2>` | Standard to install. Defaults to `v2`. |
| `--skills` | Install all bundled portable roadmap skills. |
| `--skill <name>` | Install one named skill. Repeat as needed. |
| `--dry-run` | Show planned operations without changing files. |
| `--force` | Replace drifted managed files or conflicting unmanaged destination files. |
| `--json` | Emit JSON. |

### `verify`

| Option | Meaning |
| --- | --- |
| `--path <directory>` | Repository to verify. Defaults to the current directory. |
| `--standard <v1\|v2>` | Expected version when the repository has no lockfile. |
| `--json` | Emit JSON. |

### `list`

Lists available versions, file counts, skill names, installation paths, and checksums.

## Checksum and overwrite safety

Every standard and skill manifest records the original Git blob SHA-1 for each installable file. Git blob hashes are calculated over:

```text
blob <byte-length>\0<file-bytes>
```

The CLI applies that checksum at three boundaries:

1. **Bundled source integrity** — before any operation, the CLI checks every selected source file against its manifest. A damaged or edited package copy is rejected.
2. **Pre-overwrite repository integrity** — when `.koneko-roadmap-standard.json` exists, `init` verifies all currently managed target files before changing anything. Drift is rejected unless `--force` is supplied.
3. **Post-install verification** — `verify` checks the target repository's managed files against both its lockfile and the bundled manifests.

The installer also refuses to overwrite an existing destination file that it does not already manage unless `--force` is supplied.

`--force` affects only paths owned by the selected standard or skills. Review the dry-run before using it because local edits to those managed files will be replaced with the exact versioned copy.

## Lockfile

A successful installation writes:

```text
.koneko-roadmap-standard.json
```

It records:

- the installed standard version,
- source repository/ref metadata,
- installed skill names,
- every managed target path,
- the source path inside this package,
- the expected Git blob checksum.

The lockfile lets the CLI distinguish managed files from unrelated repository files. When switching versions, stale files are removed only when they were recorded as managed by the prior lockfile. Installed skills are preserved across a standard-version switch.

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
src/
  checksum.ts
  bootstrap.ts
  cli.ts
standards/
  v1/
  v2/
skills/
  manifest.json
  <skill>/SKILL.md
test/
  checksum.test.ts
  bootstrap.test.ts
```

The CLI uses TypeScript syntax that Node can erase directly; it does not require a transpiler or runtime library.

## Development and validation

Run the tests:

```bash
npm test
```

Run syntax checks and tests:

```bash
npm run check
```

The tests cover canonical Git blob hashes, standard installation, lockfile checksums, drift detection, force restoration, skill installation, verification, and v2-to-v1 cleanup of stale managed modules.
