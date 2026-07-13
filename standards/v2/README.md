# Roadmap standard v2

This directory preserves Koneko's current modular roadmap standard: a lightweight router plus task-focused modules for metadata, structure, repository truth, use cases, architecture, phases, verification, decisions, archival, and generation.

## Provenance

- Source repository: `CatOfJupit3r/koneko`
- Source ref used for the portable snapshot: `6df04c10c51118ce8b9728d09fec8a54d8d2c063`
- Current `main` checked at: `2d495383769bfdad84a7b716917841d5abef5c09`
- Modernization origin: pull request `#181`

The standard-file blobs at the portable source ref are identical to current `main`. The later `feat: bees` commit changed agent-orchestration skills, not these standard files; bee-driven-development code is intentionally outside this distribution.

## Layout

The installable template preserves the source repository paths:

```text
template/
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
```

`manifest.json` records the Git blob checksum of every installable file. The bootstrap CLI validates both the bundled template and the installed repository copy against these checksums.

## Source-specific references

The files are preserved verbatim. Some examples and commands reference Koneko's own package layout and `pnpm run roadmap:create`; adopters should revise those project-specific details in their roadmaps or tooling rather than silently altering this versioned snapshot.
